import { supabase } from './supabase.js';

const norm = (v='') => String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();

async function sha256Hex(texto) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

async function usuarioAtual() {
  const { data } = await supabase.auth.getSession();
  const id = data?.session?.user?.id;
  if (!id) throw new Error('Sessão expirada. Faça login novamente.');
  return id;
}

function linhaParaApp(r) {
  return {
    id: r.id, data: r.data, descricao: r.descricao, valor: Number(r.valor), tipo: r.tipo,
    conta: r.conta||'', categoria: r.categoria||'Outros', subcategoria: r.subcategoria||'',
    natureza: r.natureza||'', confianca: r.confianca||'', competenciaAnalitica: r.competencia_analitica||'',
    impactoReceita: Number(r.impacto_receita||0), impactoDespesa: Number(r.impacto_despesa||0),
    ignorarResumo: !!r.ignorar_resumo, transferenciaInterna: !!r.transferencia_interna,
    pagamentoFatura: !!r.pagamento_fatura, origemDocumento: r.origem_documento||'',
    statusConciliacao: r.status_conciliacao||'aguardando'
  };
}

function appParaLinha(t, { importId, rowNumber, sourceHash }) {
  return {
    import_id: importId, row_number: rowNumber, source_hash: sourceHash,
    data: t.data, descricao: t.descricao, valor: Math.abs(Number(t.valor||0)),
    tipo: t.tipo==='entrada'?'entrada':'saida', conta: t.conta||'', categoria: t.categoria||'Outros',
    subcategoria: t.subcategoria||'', natureza: t.natureza||'', confianca: t.confianca||'',
    competencia_analitica: t.competenciaAnalitica||'', impacto_receita: Number(t.impactoReceita||0),
    impacto_despesa: Number(t.impactoDespesa||0), ignorar_resumo: !!t.ignorarResumo,
    transferencia_interna: !!t.transferenciaInterna, pagamento_fatura: !!t.pagamentoFatura,
    origem_documento: t.origemDocumento||'', status_conciliacao: t.statusConciliacao||'aguardando'
  };
}

// Nth occurrence of this exact-looking row within one batch, not the raw CSV row index --
// keeps dedup correct even when a re-export shifts row order, and still lets two genuinely
// identical same-day purchases both survive (each gets a distinct occurrence number).
function marcarOcorrencias(itens, arquivoDe) {
  const ocorr = new Map();
  return itens.map(t => {
    const arquivo = arquivoDe(t);
    const chave = [arquivo, t.data||'', norm(t.descricao||''), Math.abs(Number(t.valor||0)).toFixed(2), t.tipo||'', norm(t.conta||'')].join('|');
    const n = (ocorr.get(chave)||0) + 1;
    ocorr.set(chave, n);
    return { t, arquivo, n };
  });
}

export async function carregarTransacoes() {
  const { data, error } = await supabase.from('financial_transactions').select('*').order('data', { ascending: true });
  if (error) throw new Error(error.message);
  return (data||[]).map(linhaParaApp);
}

export async function importarTransacoes(itens, arquivo, linhasLidas) {
  if (!itens.length) return { total: 0, inseridas: 0, jaExistentes: 0, linhas: [] };
  const userId = await usuarioAtual();

  const { data: imp, error: erroImp } = await supabase.from('financial_imports')
    .insert({ arquivo, linhas_lidas: linhasLidas, linhas_importadas: 0 }).select().single();
  if (erroImp) throw new Error(erroImp.message);

  const marcados = marcarOcorrencias(itens, () => arquivo);
  const linhas = await Promise.all(marcados.map(async ({ t, n }) => {
    const hash = await sha256Hex([userId, arquivo, t.conta||'', t.data||'', t.descricao||'', Math.abs(Number(t.valor||0)).toFixed(2), n].join('|'));
    return appParaLinha(t, { importId: imp.id, rowNumber: n, sourceHash: hash });
  }));

  const { data: inseridas, error: erroInsert } = await supabase.from('financial_transactions')
    .upsert(linhas, { onConflict: 'user_id,source_hash', ignoreDuplicates: true }).select();
  if (erroInsert) throw new Error(erroInsert.message);

  await supabase.from('financial_imports').update({ linhas_importadas: inseridas.length }).eq('id', imp.id);

  return { total: linhas.length, inseridas: inseridas.length,
    jaExistentes: linhas.length - inseridas.length, linhas: (inseridas||[]).map(linhaParaApp) };
}

// Roda no máximo uma vez por usuário: se o Postgres ainda não tem nada e existe
// um array legado (vindo do antigo blob/IndexedDB), sobe esses lançamentos antes
// de o financeiro passar a depender só do banco.
export async function migrarTransacoesLegado(itensLegado, corrigirLegado) {
  if (!itensLegado?.length) return { migrado: false, total: 0 };
  const userId = await usuarioAtual();
  const corrigidos = itensLegado.map(corrigirLegado);

  const { data: imp, error: erroImp } = await supabase.from('financial_imports')
    .insert({ arquivo: 'Migração de dados locais', linhas_lidas: corrigidos.length, linhas_importadas: 0 }).select().single();
  if (erroImp) throw new Error(erroImp.message);

  const marcados = marcarOcorrencias(corrigidos, t => t.origemDocumento || 'legado');
  const linhas = await Promise.all(marcados.map(async ({ t, arquivo, n }) => {
    const hash = await sha256Hex([userId, arquivo, t.conta||'', t.data||'', t.descricao||'', Math.abs(Number(t.valor||0)).toFixed(2), 'legado-'+n].join('|'));
    return appParaLinha(t, { importId: imp.id, rowNumber: n, sourceHash: hash });
  }));

  const { data: inseridas, error: erroInsert } = await supabase.from('financial_transactions')
    .upsert(linhas, { onConflict: 'user_id,source_hash', ignoreDuplicates: true }).select('id');
  if (erroInsert) throw new Error(erroInsert.message);

  await supabase.from('financial_imports').update({ linhas_importadas: inseridas.length }).eq('id', imp.id);
  return { migrado: true, total: inseridas.length };
}

const CAMPOS_EDITAVEIS = { categoria:'categoria', subcategoria:'subcategoria', natureza:'natureza',
  confianca:'confianca', tipo:'tipo', impactoReceita:'impacto_receita', impactoDespesa:'impacto_despesa',
  ignorarResumo:'ignorar_resumo', statusConciliacao:'status_conciliacao' };

export async function atualizarTransacao(id, campos) {
  const linha = {};
  for (const [chaveApp, chaveDb] of Object.entries(CAMPOS_EDITAVEIS)) {
    if (chaveApp in campos) linha[chaveDb] = campos[chaveApp];
  }
  const { error } = await supabase.from('financial_transactions').update(linha).eq('id', id);
  if (error) throw new Error(error.message);
  return true;
}

export async function excluirTransacao(id) {
  const { error } = await supabase.from('financial_transactions').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return true;
}
