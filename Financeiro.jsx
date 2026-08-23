import React, { useMemo, useRef, useState } from 'react';
import {
  Wallet, TrendingUp, TrendingDown, FileClock, Plus, ShieldCheck, ChevronLeft,
  ChevronRight, Upload, Landmark, FileText, PiggyBank, CheckCircle2,
  AlertTriangle, ArrowRightLeft, CreditCard, RotateCcw, Target, Settings2,
  ArrowDownToLine, ArrowUpFromLine, Sparkles, LockKeyhole, ChevronRight as Next,
  BarChart3, X
} from 'lucide-react';
import { C, Card, Btn, Campo, Area, Barra, Sheet, hoje } from './ui.jsx';
import {
  CATEGORIAS_DESPESA, CATEGORIAS_RECEITA, CONTAS_PADRAO, MESES_LBL,
  formatoMoeda, FINANCEIRO_REFERENCIA
} from './financeiro.data';
import { parseTransacao, classificarDescricoesCsv } from './ia.jsx';

const vazio = {
  transacoes: [], contas: CONTAS_PADRAO, metas: [], dividas: [], investimentos: [],
  pendenciasClassificacao: [], documentos: [], importacoesConciliadas: [],
  regrasReserva: {
    mensal: FINANCEIRO_REFERENCIA.reservaAutomaticaMensal,
    porGasto: FINANCEIRO_REFERENCIA.reservaPorGasto,
    mensalAtiva: true,
    porGastoAtiva: true
  }
};

const normalizarTexto = (v = '') => String(v)
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const separarLinha = (linha, delim) => {
  const out = []; let atual = ''; let aspas = false;
  for (let i = 0; i < linha.length; i++) {
    const ch = linha[i];
    if (ch === '"') {
      if (aspas && linha[i + 1] === '"') { atual += '"'; i++; }
      else aspas = !aspas;
    } else if (ch === delim && !aspas) { out.push(atual.trim()); atual = ''; }
    else atual += ch;
  }
  out.push(atual.trim());
  return out;
};

const valorCsv = (v = '') => {
  const s = String(v).replace(/R\$|\s/g, '');
  if (!s) return 0;
  const n = Number((s.includes(',') ? s.replace(/\./g, '').replace(',', '.') : s).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

const dataCsv = (v = '') => {
  const s = String(v).trim();
  const br = s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})/);
  if (br) {
    const ano = br[3].length === 2 ? `20${br[3]}` : br[3];
    return `${ano}-${br[2].padStart(2, '0')}-${br[1].padStart(2, '0')}`;
  }
  const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) return `${iso[1]}-${iso[2].padStart(2, '0')}-${iso[3].padStart(2, '0')}`;
  const excel = Number(s.replace(',', '.'));
  if (Number.isFinite(excel) && excel > 25000 && excel < 80000) {
    const dt = new Date(Date.UTC(1899, 11, 30) + excel * 86400000);
    return dt.toISOString().slice(0, 10);
  }
  return '';
};

const chaveTransacao = (t = {}) => [
  t.data || '',
  Number(t.valor || 0).toFixed(2),
  normalizarTexto(t.conta || t.instituicao || ''),
  normalizarTexto(t.descricao || '')
].join('|');

const categoriaLocal = (descricao, tipo) => {
  const d = normalizarTexto(descricao);
  if (tipo === 'entrada') {
    if (/raio de sol marketing/.test(d)) return 'Salário PJ';
    if (/wish|intermares|reserva paulista|thermas da mata/.test(d)) return 'Receita de Trabalho';
    if (/reembolso|estorno|devolucao/.test(d)) return 'Reembolso';
    if (/rendimento|juros|cdb|remuneracao/.test(d)) return 'Rendimentos';
    return 'Outros';
  }
  const regras = [
    ['Moradia', /aluguel|condominio|sabesp|enel|energia|iptu|habitacao caixa/],
    ['Mercado', /mercado|supermerc|pao de acucar|mini extra|carrefour|pirueta/],
    ['Alimentação', /ifood|restaurante|padaria|sukiya|jin jin|food to save|cafe|pizza|burger/],
    ['Transporte', /uber|99 |posto|combust|estacion|pedagio|sem parar|detran/],
    ['Saúde e Cuidados', /farmacia|drogaria|hospital|clinica|laborat|medic|odonto/],
    ['Saúde e Fitness', /academia|gym|treino|htm eslenrd/],
    ['Educação e Carreira', /espm|curso|faculdade|udemy|hotmart|livro/],
    ['Assinaturas e Serviços', /adobe|semrush|netflix|spotify|apple com|google one|assinatura|duo gourmet/],
    ['Compras', /shein|shopee|amazon|glambox|moda mundial|prego tambore/],
    ['Viagens', /decolar|hotel|airbnb|booking|azul|latam|gol linhas/],
    ['Seguros e Proteções', /seguro|infini/],
    ['Impostos e Taxas', /simples nacional|secretaria do tesouro|imposto|taxa/],
    ['Consórcio', /consorcio|klubi|servopa/],
    ['Financiamento', /financiamento|habitacao caixa/]
  ];
  return regras.find(([, r]) => r.test(d))?.[0] || 'Outros';
};

const aplicarRegras = (t) => {
  const desc = normalizarTexto(t.descricao);
  const tipo = t.tipo === 'entrada' ? 'entrada' : 'saida';
  const valor = Math.abs(Number(t.valor || 0));
  let natureza = 'MOVIMENTO';
  let categoria = t.categoria && t.categoria !== 'Outros' ? t.categoria : categoriaLocal(desc, tipo);
  let subcategoria = t.subcategoria || '';
  let ignorarResumo = false;
  let impactoReceita = 0;
  let impactoDespesa = 0;
  let confianca = t.confianca || 'INFERIDO';

  const transferenciaReserva = /reserva por gastos rendimento|dinheiro reservado rendimento|dinheiro retirado rendimento|reserva rendimento/.test(desc);
  const transferenciaGenerica = /transferencia entre contas|transferencia interna|minha conta|mesma titularidade/.test(desc);
  const pagamentoFatura = /pagamento.*fatura|fatura.*pagamento|pagamento cartao|debito automatico.*cartao/.test(desc);
  const estorno = /estorno|reembolso|devolucao/.test(desc) && tipo === 'entrada';

  if (transferenciaReserva || transferenciaGenerica) {
    natureza = 'TRANSFERENCIA_INTERNA'; categoria = 'Investimentos'; subcategoria = 'Movimentação entre contas';
    ignorarResumo = true; confianca = 'CONFIRMADO';
  } else if (pagamentoFatura) {
    natureza = 'PAGAMENTO_FATURA'; categoria = 'Assinaturas e Serviços'; subcategoria = 'Pagamento de fatura';
    ignorarResumo = true; confianca = 'INFERIDO';
  } else if (estorno) {
    natureza = 'ESTORNO_REEMBOLSO'; categoria = 'Reembolso'; subcategoria = 'Estorno / reembolso';
    impactoDespesa = -valor; confianca = 'INFERIDO';
  } else if (tipo === 'entrada' && /raio de sol marketing/.test(desc)) {
    natureza = 'RECEITA_TRABALHO'; categoria = 'Salário PJ'; subcategoria = 'Raio de Sol';
    impactoReceita = valor; confianca = 'CONFIRMADO';
  } else if (tipo === 'entrada') {
    natureza = 'RECEITA'; impactoReceita = valor;
  } else {
    natureza = 'DESPESA'; impactoDespesa = valor;
  }

  const revisar = categoria === 'Outros' || (!desc && !ignorarResumo);
  if (revisar) confianca = 'A_REVISAR';

  return {
    ...t, tipo, valor, categoria, subcategoria, natureza, ignorarResumo,
    impactoReceita, impactoDespesa, competenciaAnalitica: (t.data || '').slice(0, 7),
    confianca, revisar, contraparte: t.contraparte || ''
  };
};

const transacoesDeCsv = async (file) => {
  const txt = (await file.text()).replace(/^\uFEFF/, '');
  const linhas = txt.split(/\r?\n/).filter(x => x.trim());
  if (linhas.length < 2) throw new Error('CSV vazio ou sem linhas suficientes.');
  const candidatos = [',', ';', '\t'];
  const amostra = linhas.slice(0, 15);
  const delim = candidatos.sort((a, b) => {
    const ca = Math.max(...amostra.map(l => separarLinha(l, a).length));
    const cb = Math.max(...amostra.map(l => separarLinha(l, b).length));
    return cb - ca;
  })[0];
  const idxCab = linhas.findIndex((l, i) => i < 15 && /data|date|valor|amount|debito|credito|descri|historico/i.test(normalizarTexto(l)));
  if (idxCab < 0) throw new Error('Não encontrei cabeçalho com data e valor.');
  const h = separarLinha(linhas[idxCab], delim).map(normalizarTexto);
  const ix = (...n) => h.findIndex(x => n.some(y => x === y || x.includes(y)));
  const iData = ix('data', 'date', 'dt');
  const iDesc = ix('descricao', 'description', 'historico', 'estabelecimento', 'titulo', 'memo');
  const iValor = ix('valor', 'amount', 'quantia');
  const iDeb = ix('debito', 'saida', 'despesa');
  const iCred = ix('credito', 'entrada', 'receita');
  const iTipo = ix('tipo', 'type', 'natureza');
  const iCat = ix('categoria', 'category');
  const iConta = ix('conta', 'account', 'banco', 'cartao');
  if (iData < 0) throw new Error('Não encontrei a coluna de data.');
  if (iValor < 0 && iDeb < 0 && iCred < 0) throw new Error('Não encontrei coluna de valor.');

  const out = linhas.slice(idxCab + 1).map((linha, i) => {
    const c = separarLinha(linha, delim);
    const deb = iDeb >= 0 ? Math.abs(valorCsv(c[iDeb])) : 0;
    const cred = iCred >= 0 ? Math.abs(valorCsv(c[iCred])) : 0;
    const bruto = iValor >= 0 ? valorCsv(c[iValor]) : (cred || -deb);
    const tipoTexto = iTipo >= 0 ? normalizarTexto(c[iTipo]) : '';
    const tipo = cred > 0 || bruto > 0 || /entrada|credito|receita/.test(tipoTexto) ? 'entrada' : 'saida';
    const valor = Math.abs(bruto || deb || cred);
    if (!valor) return null;
    return {
      id: `imp-${Date.now()}-${i}`,
      tipo,
      valor,
      data: dataCsv(c[iData]),
      descricao: iDesc >= 0 ? c[iDesc] || 'Sem descrição' : 'Sem descrição',
      categoria: iCat >= 0 ? c[iCat] || 'Outros' : 'Outros',
      conta: iConta >= 0 ? c[iConta] || 'Conta corrente' : 'Conta corrente',
      origemDocumento: file.name,
      pendente: false
    };
  }).filter(Boolean);

  if (!out.length) throw new Error('Nenhuma movimentação válida encontrada.');
  if (out.some(t => !t.data)) throw new Error('Há datas que não foram reconhecidas. Nada foi importado.');
  return out;
};

const agruparMeses = (transacoes = []) => Object.entries(transacoes.reduce((acc, t) => {
  const mes = (t.data || '').slice(0, 7) || 'sem-mes';
  (acc[mes] ||= []).push(t);
  return acc;
}, {})).sort(([a], [b]) => a.localeCompare(b)).map(([mes, itens]) => ({ mes, itens, status: 'aguardando' }));

const hashArquivo = async (file) => {
  try {
    const bytes = await file.arrayBuffer();
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return `${file.name}|${file.size}|${file.lastModified}`;
  }
};

const rotuloMes = (mes) => {
  const [a, m] = String(mes || '').split('-').map(Number);
  return a && m ? `${MESES_LBL[m - 1]}/${a}` : mes;
};

function Etapa({ n, titulo, texto, ativa, feita }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '34px 1fr', gap: 10, padding: 12, borderRadius: 15, background: ativa ? '#F3EEFF' : '#fff', border: `1px solid ${ativa ? '#DCCFFF' : C.line}`, marginBottom: 8 }}>
    <div style={{ width: 30, height: 30, borderRadius: 30, display: 'grid', placeItems: 'center', background: feita ? C.green : ativa ? C.roxo : '#EEF0F2', color: feita || ativa ? '#fff' : C.ink3, fontSize: 12, fontWeight: 900 }}>{feita ? '✓' : n}</div>
    <div><strong style={{ display: 'block', fontSize: 12.5, color: C.ink }}>{titulo}</strong><span style={{ fontSize: 10.5, lineHeight: 1.4, color: C.ink3 }}>{texto}</span></div>
  </div>;
}

export default function Financeiro({ d, up, aviso }) {
  const fin = { ...vazio, ...d.financeiro, regrasReserva: { ...vazio.regrasReserva, ...(d.financeiro?.regrasReserva || {}) } };
  const [mesRef, setMesRef] = useState(() => hoje().slice(0, 7));
  const [tela, setTela] = useState('resumo');
  const [sheet, setSheet] = useState(null);
  const [processando, setProcessando] = useState(false);
  const [importacao, setImportacao] = useState(null);
  const [rascunho, setRascunho] = useState({ tipo: 'saida', valor: '', categoria: 'Outros', conta: CONTAS_PADRAO[0], data: hoje(), descricao: '', pendente: false });
  const [movReserva, setMovReserva] = useState({ modo: 'aporte', valor: '', data: hoje() });
  const [regrasTmp, setRegrasTmp] = useState(fin.regrasReserva);
  const inputRef = useRef(null);

  const atualizar = fn => up(s => ({ ...s, financeiro: fn({ ...vazio, ...s.financeiro, regrasReserva: { ...vazio.regrasReserva, ...(s.financeiro?.regrasReserva || {}) } }) }));

  const transacoes = useMemo(() => {
    const seen = new Set();
    return (fin.transacoes || []).filter(t => {
      const k = chaveTransacao(t);
      if (seen.has(k)) return false;
      seen.add(k); return true;
    });
  }, [fin.transacoes]);

  const doMes = useMemo(() => transacoes.filter(t => (t.competenciaAnalitica || (t.data || '').slice(0, 7)) === mesRef), [transacoes, mesRef]);
  const receita = doMes.reduce((a, t) => a + Number(t.impactoReceita ?? (!t.ignorarResumo && t.tipo === 'entrada' ? t.valor : 0)), 0);
  const despesa = Math.max(0, doMes.reduce((a, t) => a + Number(t.impactoDespesa ?? (!t.ignorarResumo && t.tipo === 'saida' ? t.valor : 0)), 0));
  const resultado = receita - despesa;
  const contasAPagar = doMes.filter(t => t.tipo === 'saida' && t.pendente).reduce((a, t) => a + Number(t.valor || 0), 0);
  const liquidezAtual = Number(fin.liquidezAtual ?? FINANCEIRO_REFERENCIA.liquidezAtual);
  const metaLiquidez = Number(fin.metaLiquidez ?? FINANCEIRO_REFERENCIA.metaLiquidez);
  const progresso = Math.max(0, Math.min(100, Math.round(liquidezAtual / Math.max(metaLiquidez, 1) * 100)));
  const faltam = Math.max(0, metaLiquidez - liquidezAtual);

  const categorias = useMemo(() => CATEGORIAS_DESPESA.map(c => ({
    categoria: c,
    total: doMes.filter(t => t.categoria === c).reduce((a, t) => a + Math.max(0, Number(t.impactoDespesa ?? (t.tipo === 'saida' && !t.ignorarResumo ? t.valor : 0))), 0)
  })).filter(x => x.total > 0).sort((a, b) => b.total - a.total), [doMes]);

  const trocarMes = dlt => {
    const [a, m] = mesRef.split('-').map(Number);
    const x = new Date(a, m - 1 + dlt, 1);
    setMesRef(`${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}`);
  };

  const classificarComIA = async (lista) => {
    const alvos = [...new Set(lista.filter(t => t.categoria === 'Outros').map(t => normalizarTexto(t.descricao)).filter(Boolean))].slice(0, 200);
    if (!alvos.length) return lista;
    try {
      const r = await classificarDescricoesCsv(alvos);
      if (!r.ok || !Array.isArray(r.dados?.categorias)) return lista;
      const mapa = new Map(r.dados.categorias.filter(x => Number(x.confianca || 0) >= .7).map(x => [alvos[x.id], x.categoria]));
      return lista.map(t => {
        const cat = mapa.get(normalizarTexto(t.descricao));
        return cat ? aplicarRegras({ ...t, categoria: cat, confianca: 'INFERIDO' }) : t;
      });
    } catch { return lista; }
  };

  const prepararImportacao = async (file) => {
    setProcessando(true);
    try {
      const hash = await hashArquivo(file);
      if ((fin.documentos || []).some(x => x.hash === hash)) throw new Error('Este arquivo já foi importado anteriormente.');
      let extraidas;
      const csv = /\.csv$/i.test(file.name) || /text\/csv|application\/csv|application\/vnd\.ms-excel/.test(file.type);
      if (csv) extraidas = await transacoesDeCsv(file);
      else {
        const base64 = await new Promise((res, rej) => {
          const rd = new FileReader(); rd.onerror = rej;
          rd.onload = () => res(String(rd.result).split(',')[1]);
          rd.readAsDataURL(file);
        });
        const r = await parseTransacao({ imagemBase64: base64, mimeType: file.type });
        if (!r.ok || !Array.isArray(r.dados?.transacoes)) throw new Error(r.erro || 'Não encontrei movimentações neste documento.');
        extraidas = r.dados.transacoes.filter(t => Number(t.valor || 0) > 0).map((t, i) => ({
          id: `doc-${Date.now()}-${i}`, tipo: t.tipo === 'entrada' ? 'entrada' : 'saida', valor: Number(t.valor),
          data: t.data || '', descricao: t.descricao || file.name, categoria: t.categoria || 'Outros',
          conta: t.conta || 'Conta corrente', origemDocumento: file.name, pendente: false
        }));
        if (extraidas.some(t => !t.data)) throw new Error('O documento tem lançamentos sem data. Envie um extrato mensal mais claro.');
      }
      let tratadas = await classificarComIA(extraidas.map(aplicarRegras));
      const existentes = new Set(transacoes.map(chaveTransacao));
      const dentro = new Set();
      tratadas = tratadas.map(t => {
        const k = chaveTransacao(t);
        const duplicado = existentes.has(k) || dentro.has(k);
        dentro.add(k);
        return { ...t, duplicado, revisar: t.revisar && !duplicado };
      });
      const meses = agruparMeses(tratadas);
      if (!meses.length) throw new Error('Nenhuma movimentação válida encontrada.');
      setImportacao({ arquivo: file.name, hash, meses, indice: 0, etapa: 'meses' });
      setTela('importacao'); setSheet(null);
    } catch (e) { aviso(e?.message || 'Não consegui preparar a conciliação.'); }
    finally { setProcessando(false); }
  };

  const selecionarArquivo = e => {
    const f = e.target.files?.[0]; e.target.value = '';
    if (!f) return;
    if (f.size > 4.5 * 1024 * 1024) return aviso('Envie um arquivo de até 4,5 MB.');
    prepararImportacao(f);
  };

  const mesAtual = importacao?.meses?.[importacao.indice];
  const pendentesMes = mesAtual?.itens?.filter(t => t.revisar && !t.duplicado) || [];
  const resumoConciliacao = useMemo(() => {
    if (!mesAtual) return { validos: 0, duplicados: 0, internas: 0, faturas: 0, estornos: 0 };
    return {
      validos: mesAtual.itens.filter(t => !t.duplicado).length,
      duplicados: mesAtual.itens.filter(t => t.duplicado).length,
      internas: mesAtual.itens.filter(t => t.natureza === 'TRANSFERENCIA_INTERNA').length,
      faturas: mesAtual.itens.filter(t => t.natureza === 'PAGAMENTO_FATURA').length,
      estornos: mesAtual.itens.filter(t => t.natureza === 'ESTORNO_REEMBOLSO').length
    };
  }, [mesAtual]);

  const iniciarMes = idx => {
    setImportacao(old => ({ ...old, indice: idx, etapa: 'conciliacao' }));
  };

  const resolver = (id, categoria) => setImportacao(old => ({
    ...old,
    meses: old.meses.map((m, mi) => mi !== old.indice ? m : {
      ...m,
      itens: m.itens.map(t => t.id !== id ? t : aplicarRegras({ ...t, categoria, revisar: false, confianca: 'CONFIRMADO_MANUAL' }))
    })
  }));

  const confirmarMes = () => {
    if (!mesAtual) return;
    if (pendentesMes.length) return aviso(`Resolva ${pendentesMes.length} item(ns) antes de confirmar.`);
    const novas = mesAtual.itens.filter(t => !t.duplicado);
    atualizar(fx => ({
      ...fx,
      transacoes: [...(fx.transacoes || []), ...novas],
      documentos: [...(fx.documentos || []), { id: `doc-${Date.now()}`, nome: importacao.arquivo, hash: importacao.hash, mes: mesAtual.mes, itens: novas.length, conciliado: true, data: hoje() }],
      importacoesConciliadas: [...(fx.importacoesConciliadas || []), { arquivo: importacao.arquivo, mes: mesAtual.mes, itens: novas.length, data: hoje() }]
    }));
    setImportacao(old => {
      const meses = old.meses.map((m, i) => i === old.indice ? { ...m, status: 'concluido' } : m);
      const proximo = meses.findIndex(m => m.status !== 'concluido');
      return { ...old, meses, indice: proximo >= 0 ? proximo : old.indice, etapa: proximo >= 0 ? 'meses' : 'finalizado' };
    });
    aviso(`${rotuloMes(mesAtual.mes)} conciliado e consolidado.`);
  };

  const salvarManual = async () => {
    const valor = Number(String(rascunho.valor).replace(',', '.'));
    if (!valor || valor <= 0) return aviso('Informe um valor válido.');
    let t = aplicarRegras({ id: `manual-${Date.now()}`, ...rascunho, valor, origemDocumento: 'Lançamento manual' });
    if (t.categoria === 'Outros' && t.descricao) {
      const [classificada] = await classificarComIA([t]); t = classificada || t;
    }
    if (transacoes.some(x => chaveTransacao(x) === chaveTransacao(t))) return aviso('Este lançamento já existe.');
    if (t.revisar) {
      setImportacao({ arquivo: 'Lançamento manual', hash: `manual-${Date.now()}`, meses: [{ mes: t.data.slice(0, 7), itens: [t], status: 'aguardando' }], indice: 0, etapa: 'conciliacao' });
      setTela('importacao'); setSheet(null); return;
    }
    atualizar(fx => ({ ...fx, transacoes: [...(fx.transacoes || []), t] }));
    setSheet(null); aviso('Lançamento salvo e classificado.');
  };

  const salvarMovReserva = () => {
    const valor = Number(String(movReserva.valor).replace(',', '.'));
    if (!valor || valor <= 0) return aviso('Informe um valor válido.');
    const aporte = movReserva.modo === 'aporte';
    const t = aplicarRegras({
      id: `reserva-${Date.now()}`, tipo: aporte ? 'saida' : 'entrada', valor, data: movReserva.data,
      descricao: aporte ? 'Dinheiro reservado Rendimento' : 'Dinheiro retirado Rendimento',
      categoria: 'Investimentos', conta: 'Reserva Rendimento', origemDocumento: 'Registro manual da reserva'
    });
    atualizar(fx => ({ ...fx, transacoes: [...(fx.transacoes || []), t] }));
    setSheet(null); setMovReserva({ modo: 'aporte', valor: '', data: hoje() }); aviso(aporte ? 'Aporte registrado.' : 'Retirada registrada.');
  };

  const salvarRegrasReserva = () => {
    atualizar(fx => ({ ...fx, regrasReserva: { ...regrasTmp, mensal: Number(regrasTmp.mensal || 0), porGasto: Number(regrasTmp.porGasto || 0) } }));
    setSheet(null); aviso('Regras de reserva atualizadas.');
  };

  const renderResumo = () => <>
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><Wallet size={23} color={C.green} /><h1 style={{ fontSize: 25, color: C.ink, margin: 0 }}>Financeiro</h1></div>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '12px 0 18px' }}>
      <button onClick={() => trocarMes(-1)} style={{ border: 0, background: 'transparent', color: C.ink2 }}><ChevronLeft /></button>
      <strong style={{ fontSize: 13, color: C.ink2 }}>{MESES_LBL[Number(mesRef.slice(5, 7)) - 1]} de {mesRef.slice(0, 4)}</strong>
      <button onClick={() => trocarMes(1)} style={{ border: 0, background: 'transparent', color: C.ink2 }}><ChevronRight /></button>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      <Card style={{ background: C.mint }}><div style={{ fontSize: 11, color: C.ink2, fontWeight: 800 }}><TrendingUp size={14} /> Receita</div><strong style={{ fontSize: 19, color: C.ink }}>{formatoMoeda(receita)}</strong></Card>
      <Card style={{ background: C.limaSuave }}><div style={{ fontSize: 11, color: C.ink2, fontWeight: 800 }}><TrendingDown size={14} /> Despesas</div><strong style={{ fontSize: 19, color: C.ink }}>{formatoMoeda(despesa)}</strong></Card>
      <Card><div style={{ fontSize: 11, color: C.ink2, fontWeight: 800 }}>Resultado do mês</div><strong style={{ fontSize: 19, color: resultado >= 0 ? C.green : C.coral }}>{formatoMoeda(resultado)}</strong></Card>
      <Card><div style={{ fontSize: 11, color: C.ink2, fontWeight: 800 }}><FileClock size={14} /> A pagar</div><strong style={{ fontSize: 19, color: C.ink }}>{formatoMoeda(contasAPagar)}</strong></Card>
    </div>

    <button onClick={() => setTela('investimentos')} style={{ width: '100%', border: 0, background: 'transparent', padding: 0, textAlign: 'left', marginTop: 20 }}>
      <Card style={{ background: 'linear-gradient(135deg,#F5F2FF,#FFFFFF)', border: '1px solid #E4DDF8' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div><div style={{ fontSize: 10, fontWeight: 900, color: C.roxo, textTransform: 'uppercase', letterSpacing: 1 }}>Investimentos e reservas</div><strong style={{ display: 'block', fontSize: 20, color: C.ink, marginTop: 4 }}>{formatoMoeda(liquidezAtual)}</strong><span style={{ fontSize: 10.5, color: C.ink3 }}>{progresso}% da meta de {formatoMoeda(metaLiquidez)}</span></div>
          <div style={{ width: 66, height: 66, borderRadius: '50%', background: `conic-gradient(${C.roxo} ${progresso}%,#E8E5ED ${progresso}% 100%)`, padding: 7 }}><div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#fff', display: 'grid', placeItems: 'center' }}><PiggyBank size={25} color={C.roxo} /></div></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 11, paddingTop: 10, borderTop: `1px solid ${C.line}`, fontSize: 10.5, color: C.ink3 }}><span>Ver investimentos e reservas</span><Next size={16} /></div>
      </Card>
    </button>

    <div style={{ margin: '20px 2px 10px' }}><strong style={{ color: C.ink }}>Para onde foi seu dinheiro</strong><div style={{ fontSize: 11, color: C.ink3 }}>Somente despesas conciliadas; transferências e pagamento de fatura ficam fora.</div></div>
    <Card style={{ marginBottom: 16 }}>{categorias.length ? categorias.slice(0, 8).map(x => <div key={x.categoria} style={{ marginBottom: 11 }}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5 }}><span style={{ color: C.ink2 }}>{x.categoria}</span><strong style={{ color: C.ink }}>{formatoMoeda(x.total)}</strong></div><Barra v={x.total} max={Math.max(...categorias.map(y => y.total), 1)} cor={C.green} h={6} /></div>) : <div style={{ fontSize: 12, color: C.ink3, textAlign: 'center', padding: 14 }}>Nenhum gasto conciliado neste mês.</div>}</Card>

    <Card style={{ background: '#F5FAF8', marginBottom: 14 }}><div style={{ display: 'flex', gap: 10 }}><ShieldCheck size={20} color={C.green} /><div><strong style={{ fontSize: 13, color: C.ink }}>Consolidação protegida</strong><div style={{ fontSize: 10.7, color: C.ink3, lineHeight: 1.45, marginTop: 3 }}>Nenhum arquivo entra direto no dashboard. A ZOE separa por mês, remove duplicidades, neutraliza transferências e faturas e pede sua confirmação quando houver dúvida.</div></div></div></Card>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
      <Btn onClick={() => setSheet('manual')}><Plus size={15} /> Adicionar</Btn>
      <Btn variante="outline" onClick={() => setTela('importacao')}><Upload size={15} /> Importar</Btn>
    </div>
  </>;

  const renderInvestimentos = () => <>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}><button onClick={() => setTela('resumo')} style={{ border: 0, background: '#EFF3F2', borderRadius: 12, width: 36, height: 36, display: 'grid', placeItems: 'center' }}><ChevronLeft size={19} /></button><div><h1 style={{ fontSize: 22, margin: 0, color: C.ink }}>Investimentos e Reservas</h1><div style={{ fontSize: 10.5, color: C.ink3 }}>Liquidez, meta e construção de segurança</div></div></div>

    <Card style={{ marginBottom: 12, textAlign: 'center', padding: '20px 16px' }}>
      <div style={{ fontSize: 10.5, color: C.ink3 }}>Liquidez atual confirmada</div>
      <strong style={{ display: 'block', fontSize: 29, color: C.ink, marginTop: 3 }}>{formatoMoeda(liquidezAtual)}</strong>
      <div style={{ width: 220, height: 220, borderRadius: '50%', margin: '17px auto 8px', background: `conic-gradient(${C.roxo} ${progresso}%,#E9E7EC ${progresso}% 100%)`, padding: 14, display: 'grid', placeItems: 'center' }}>
        <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#fff', display: 'grid', placeItems: 'center' }}><div><PiggyBank size={66} color={C.coral} /><strong style={{ display: 'block', fontSize: 28, color: C.ink, marginTop: 4 }}>{progresso}%</strong><span style={{ fontSize: 9.5, color: C.ink3 }}>da meta</span></div></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginTop: 13 }}>
        <div style={{ background: '#F7F6FA', borderRadius: 14, padding: 11, textAlign: 'left' }}><div style={{ fontSize: 9.5, color: C.ink3 }}>Meta</div><strong style={{ fontSize: 15, color: C.ink }}>{formatoMoeda(metaLiquidez)}</strong><div style={{ fontSize: 9, color: C.ink3 }}>até 31/12/2026</div></div>
        <div style={{ background: '#F7F6FA', borderRadius: 14, padding: 11, textAlign: 'left' }}><div style={{ fontSize: 9.5, color: C.ink3 }}>Faltam</div><strong style={{ fontSize: 15, color: C.ink }}>{formatoMoeda(faltam)}</strong><div style={{ fontSize: 9, color: C.ink3 }}>para sua meta</div></div>
      </div>
    </Card>

    <Card style={{ marginBottom: 12, background: '#F5F1FF', border: '1px solid #DED4F7' }}><div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><ShieldCheck size={21} color={C.roxo} /><div style={{ flex: 1 }}><strong style={{ fontSize: 12.5, color: C.ink }}>Reserva de Segurança</strong><div style={{ fontSize: 10, color: C.ink3 }}>Meta sugerida: 6 a 12 meses dos seus gastos essenciais</div></div><Next size={17} color={C.ink3} /></div></Card>

    <div style={{ fontSize: 16, fontWeight: 900, color: C.ink, margin: '18px 2px 10px' }}>Guarde dinheiro automaticamente</div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: 10 }}>
      <Card><div style={{ fontSize: 11, fontWeight: 850, color: C.ink }}>Por frequência</div><span style={{ display: 'inline-block', fontSize: 8.5, color: C.green, background: C.mint, borderRadius: 20, padding: '3px 6px', marginTop: 4 }}>{fin.regrasReserva.mensalAtiva ? 'Ativo' : 'Pausado'}</span><div style={{ fontSize: 10, color: C.ink3, marginTop: 12 }}>Todo mês</div><strong style={{ fontSize: 18, color: C.ink }}>{formatoMoeda(fin.regrasReserva.mensal)}</strong></Card>
      <Card><div style={{ fontSize: 11, fontWeight: 850, color: C.ink }}>Por gasto</div><span style={{ display: 'inline-block', fontSize: 8.5, color: C.green, background: C.mint, borderRadius: 20, padding: '3px 6px', marginTop: 4 }}>{fin.regrasReserva.porGastoAtiva ? 'Ativo' : 'Pausado'}</span><div style={{ fontSize: 10, color: C.ink3, marginTop: 12 }}>A cada compra</div><strong style={{ fontSize: 18, color: C.ink }}>{formatoMoeda(fin.regrasReserva.porGasto)}</strong></Card>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 14 }}>
      <button onClick={() => { setMovReserva({ modo: 'aporte', valor: '', data: hoje() }); setSheet('reserva'); }} style={{ border: `1px solid ${C.line}`, background: '#fff', borderRadius: 15, padding: 11, color: C.roxo }}><ArrowDownToLine size={19} /><strong style={{ display: 'block', fontSize: 10.5, marginTop: 4 }}>Reservar</strong></button>
      <button onClick={() => { setMovReserva({ modo: 'retirada', valor: '', data: hoje() }); setSheet('reserva'); }} style={{ border: `1px solid ${C.line}`, background: '#fff', borderRadius: 15, padding: 11, color: C.roxo }}><ArrowUpFromLine size={19} /><strong style={{ display: 'block', fontSize: 10.5, marginTop: 4 }}>Retirar</strong></button>
      <button onClick={() => { setRegrasTmp(fin.regrasReserva); setSheet('configReserva'); }} style={{ border: `1px solid ${C.line}`, background: '#fff', borderRadius: 15, padding: 11, color: C.roxo }}><Settings2 size={19} /><strong style={{ display: 'block', fontSize: 10.5, marginTop: 4 }}>Configurar</strong></button>
    </div>

    <Card style={{ marginBottom: 12 }}><div style={{ display: 'flex', gap: 9, alignItems: 'center', marginBottom: 11 }}><BarChart3 size={19} color={C.green} /><strong style={{ color: C.ink, fontSize: 13 }}>Performance</strong></div><div style={{ fontSize: 10, color: C.ink3 }}>Acompanhamento da meta de liquidez</div><div style={{ marginTop: 10 }}><Barra v={liquidezAtual} max={metaLiquidez} cor={C.green} h={8} /></div><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9.5, color: C.ink3, marginTop: 6 }}><span>{formatoMoeda(liquidezAtual)}</span><span>{formatoMoeda(metaLiquidez)}</span></div></Card>

    {(fin.dividas || []).length > 0 && <><div style={{ display: 'flex', gap: 7, alignItems: 'center', margin: '18px 2px 10px', fontWeight: 850, color: C.ink }}><Landmark size={18} color={C.roxo} />Consórcios e financiamentos</div>{fin.dividas.map(x => <Card key={x.id} style={{ marginBottom: 9 }}><strong style={{ fontSize: 13, color: C.ink }}>{x.nome || x.instituicao || x.tipo}</strong><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: C.ink3, margin: '8px 0' }}><span>Pago {formatoMoeda(x.valor_pago || 0)}</span><span>Falta {formatoMoeda(x.saldo_restante || 0)}</span></div><Barra v={Number(x.valor_pago || 0)} max={Number(x.valor_total || 0) || 1} cor={C.roxo} /></Card>)}</>}
  </>;

  const renderImportacao = () => {
    if (!importacao) return <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}><button onClick={() => setTela('resumo')} style={{ border: 0, background: '#EFF3F2', borderRadius: 12, width: 36, height: 36, display: 'grid', placeItems: 'center' }}><ChevronLeft size={19} /></button><div><h1 style={{ fontSize: 22, margin: 0, color: C.ink }}>Importar extrato</h1><div style={{ fontSize: 10.5, color: C.ink3 }}>Fluxo seguro e mês a mês</div></div></div>
      <Card style={{ background: '#F5F1FF', border: '1px solid #E1D7F8', marginBottom: 14 }}><div style={{ display: 'flex', gap: 9 }}><Sparkles size={20} color={C.roxo} /><div style={{ fontSize: 11, lineHeight: 1.5, color: C.ink2 }}>Para evitar inconsistências, a ZOE primeiro lê, classifica, separa por competência e só consolida depois da sua confirmação.</div></div></Card>
      <Etapa n="1" titulo="Enviar arquivo" texto="CSV, OFX convertido para CSV, Excel exportado em CSV, PDF ou imagem." ativa feita={false} />
      <Etapa n="2" titulo="IA processa e categoriza" texto="Identifica movimentos, duplicidades e regras de conciliação." />
      <Etapa n="3" titulo="Conciliação do mês" texto="Você revisa somente o que a IA não conseguiu fechar." />
      <Etapa n="4" titulo="Confirmar mês" texto="Só então aquele mês entra no financeiro." />
      <Etapa n="5" titulo="Próximo mês" texto="O processo se repete até finalizar o arquivo." />
      <Card style={{ marginTop: 13, border: '1.5px dashed #D8D0EA', textAlign: 'center', padding: 20 }}><Upload size={27} color={C.roxo} /><strong style={{ display: 'block', color: C.ink, fontSize: 13, marginTop: 8 }}>Envie um documento de preferência mensal</strong><div style={{ fontSize: 10.5, color: C.ink3, lineHeight: 1.45, margin: '5px 0 14px' }}>Se o CSV tiver vários meses, a ZOE separa automaticamente e exige confirmação mês a mês.</div><Btn disabled={processando} onClick={() => inputRef.current?.click()} style={{ width: '100%' }}>{processando ? 'Lendo e organizando…' : 'Selecionar arquivo'}</Btn></Card>
      <div style={{ display: 'flex', gap: 8, marginTop: 12, padding: 11, borderRadius: 14, background: '#F5FAF8' }}><LockKeyhole size={17} color={C.green} /><div style={{ fontSize: 9.8, color: C.ink3 }}>Nenhum lançamento é consolidado antes da confirmação.</div></div>
    </>;

    if (importacao.etapa === 'meses') return <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}><button onClick={() => setImportacao(null)} style={{ border: 0, background: '#EFF3F2', borderRadius: 12, width: 36, height: 36, display: 'grid', placeItems: 'center' }}><ChevronLeft size={19} /></button><div><h1 style={{ fontSize: 21, margin: 0, color: C.ink }}>Selecionar mês para conciliar</h1><div style={{ fontSize: 10.5, color: C.ink3 }}>{importacao.arquivo}</div></div></div>
      <Card style={{ marginBottom: 12, background: '#F5F1FF' }}><div style={{ fontSize: 10.5, color: C.ink2 }}>A ZOE encontrou <strong>{importacao.meses.length} mês(es)</strong>. Confirme um por vez para preservar competência e evitar duplicidades.</div></Card>
      {importacao.meses.map((m, i) => {
        const pend = m.itens.filter(t => t.revisar && !t.duplicado).length;
        return <button key={m.mes} onClick={() => m.status !== 'concluido' && iniciarMes(i)} style={{ width: '100%', border: `1px solid ${m.status === 'concluido' ? '#D8EDE2' : C.line}`, background: m.status === 'concluido' ? '#F4FBF7' : '#fff', borderRadius: 15, padding: 13, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}><div><strong style={{ display: 'block', fontSize: 13, color: C.ink }}>{rotuloMes(m.mes)}</strong><span style={{ fontSize: 9.8, color: C.ink3 }}>{m.itens.length} lançamentos · {pend} para revisar</span></div><span style={{ fontSize: 9.5, fontWeight: 800, color: m.status === 'concluido' ? C.green : C.roxo }}>{m.status === 'concluido' ? 'Concluído ✓' : 'Revisar ›'}</span></button>;
      })}
      <Card style={{ background: '#FFFAEF', border: '1px solid #F0E1B8', marginTop: 6 }}><div style={{ fontSize: 10.2, color: C.ink2 }}>Dica: usar documentos mensais é a forma mais segura. Arquivos longos são aceitos, mas nunca são consolidados de uma vez.</div></Card>
    </>;

    if (importacao.etapa === 'finalizado') return <>
      <div style={{ textAlign: 'center', padding: '40px 4px' }}><div style={{ width: 72, height: 72, borderRadius: '50%', background: C.mint, display: 'grid', placeItems: 'center', margin: '0 auto 14px' }}><CheckCircle2 size={34} color={C.green} /></div><h2 style={{ color: C.ink, margin: '0 0 6px' }}>Importação concluída</h2><p style={{ fontSize: 11.5, lineHeight: 1.5, color: C.ink3 }}>Todos os meses foram conciliados antes de entrar no dashboard.</p><Btn onClick={() => { setImportacao(null); setTela('resumo'); }} style={{ width: '100%', marginTop: 10 }}>Voltar ao Financeiro</Btn></div>
    </>;

    return <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}><button onClick={() => setImportacao(x => ({ ...x, etapa: 'meses' }))} style={{ border: 0, background: '#EFF3F2', borderRadius: 12, width: 36, height: 36, display: 'grid', placeItems: 'center' }}><ChevronLeft size={19} /></button><div style={{ flex: 1 }}><h1 style={{ fontSize: 20, margin: 0, color: C.ink }}>Conciliação · {rotuloMes(mesAtual?.mes)}</h1><div style={{ fontSize: 10, color: C.ink3 }}>{resumoConciliacao.validos} válidos · {resumoConciliacao.duplicados} duplicados</div></div></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 7, marginBottom: 12 }}>
        <Card style={{ padding: 9, textAlign: 'center', background: C.mint }}><ArrowRightLeft size={16} color={C.green} /><strong style={{ display: 'block', fontSize: 15, color: C.ink }}>{resumoConciliacao.internas}</strong><span style={{ fontSize: 8.2, color: C.ink3 }}>transferências</span></Card>
        <Card style={{ padding: 9, textAlign: 'center', background: '#F5F1FF' }}><CreditCard size={16} color={C.roxo} /><strong style={{ display: 'block', fontSize: 15, color: C.ink }}>{resumoConciliacao.faturas}</strong><span style={{ fontSize: 8.2, color: C.ink3 }}>pag. fatura</span></Card>
        <Card style={{ padding: 9, textAlign: 'center', background: '#FFF5ED' }}><RotateCcw size={16} color={C.coral} /><strong style={{ display: 'block', fontSize: 15, color: C.ink }}>{resumoConciliacao.estornos}</strong><span style={{ fontSize: 8.2, color: C.ink3 }}>estornos</span></Card>
      </div>
      {pendentesMes.length > 0 ? <><div style={{ display: 'flex', gap: 7, alignItems: 'center', margin: '8px 0 10px' }}><AlertTriangle size={17} color={C.gold} /><strong style={{ fontSize: 13, color: C.ink }}>A ZOE precisa da sua ajuda em {pendentesMes.length} item(ns)</strong></div>{pendentesMes.map(t => <Card key={t.id} style={{ marginBottom: 9, background: '#FFFCF2', border: '1px solid #F0E1A5' }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><strong style={{ fontSize: 12.2, color: C.ink }}>{t.descricao}</strong><strong style={{ fontSize: 12, color: C.ink, whiteSpace: 'nowrap' }}>{formatoMoeda(t.valor)}</strong></div><div style={{ fontSize: 9.8, color: C.ink3, margin: '4px 0 9px' }}>{t.data} · {t.conta}</div><div style={{ fontSize: 9.5, color: C.ink2, marginBottom: 6 }}>Selecione a categoria correta</div><div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>{(t.tipo === 'entrada' ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA).map(cat => <button key={cat} onClick={() => resolver(t.id, cat)} style={{ border: `1px solid ${C.line}`, background: '#fff', borderRadius: 14, padding: '6px 8px', fontSize: 9.2, color: C.ink }}>{cat}</button>)}</div></Card>)}</> : <Card style={{ marginBottom: 12, background: '#EEF9F4', border: '1px solid #D2EDE0' }}><div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><CheckCircle2 size={19} color={C.green} /><div style={{ fontSize: 11.3, color: C.ink2 }}>Mês pronto para consolidar. Nenhuma pendência de classificação.</div></div></Card>}
      <Btn onClick={confirmarMes} disabled={pendentesMes.length > 0} style={{ width: '100%', padding: 14 }}>Finalizar e confirmar {rotuloMes(mesAtual?.mes)}</Btn>
      <div style={{ fontSize: 9.5, color: C.ink3, lineHeight: 1.45, marginTop: 9, textAlign: 'center' }}>Nada entra no dashboard antes desta confirmação. Duplicidades são bloqueadas por data + valor + conta + descrição.</div>
    </>;
  };

  return <div style={{ padding: '20px 16px 110px', maxWidth: 540, margin: '0 auto' }}>
    {tela === 'resumo' && renderResumo()}
    {tela === 'investimentos' && renderInvestimentos()}
    {tela === 'importacao' && renderImportacao()}

    <input ref={inputRef} type="file" accept=".csv,text/csv,application/csv,application/vnd.ms-excel,image/*,application/pdf" style={{ display: 'none' }} onChange={selecionarArquivo} />

    <Sheet aberto={sheet === 'manual'} fechar={() => setSheet(null)} titulo="Adicionar movimentação">
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>{[['saida', 'Saída'], ['entrada', 'Entrada']].map(([v, l]) => <button key={v} onClick={() => setRascunho(r => ({ ...r, tipo: v, categoria: 'Outros' }))} style={{ flex: 1, padding: 10, borderRadius: 12, border: `1px solid ${rascunho.tipo === v ? C.green : C.line}`, background: rascunho.tipo === v ? C.green : '#fff', color: rascunho.tipo === v ? '#fff' : C.ink }}>{l}</button>)}</div>
      <Campo label="Valor" type="number" value={rascunho.valor} onChange={e => setRascunho(r => ({ ...r, valor: e.target.value }))} />
      <Campo label="Data" type="date" value={rascunho.data} onChange={e => setRascunho(r => ({ ...r, data: e.target.value }))} />
      <Area label="Descrição" placeholder="Ex.: mercado, salário, transferência para reserva" value={rascunho.descricao} onChange={e => setRascunho(r => ({ ...r, descricao: e.target.value }))} />
      <div style={{ fontSize: 10.5, color: C.ink3, margin: '-3px 0 13px' }}>A ZOE tenta reconhecer natureza e categoria. Se ficar em dúvida, abre a conciliação antes de salvar.</div>
      <Btn onClick={salvarManual} style={{ width: '100%' }}>Analisar e salvar</Btn>
    </Sheet>

    <Sheet aberto={sheet === 'reserva'} fechar={() => setSheet(null)} titulo={movReserva.modo === 'aporte' ? 'Registrar aporte' : 'Registrar retirada'}>
      <Campo label="Valor" type="number" value={movReserva.valor} onChange={e => setMovReserva(x => ({ ...x, valor: e.target.value }))} />
      <Campo label="Data" type="date" value={movReserva.data} onChange={e => setMovReserva(x => ({ ...x, data: e.target.value }))} />
      <div style={{ fontSize: 10.5, color: C.ink3, marginBottom: 13 }}>Esse registro é tratado como transferência interna e não vira receita nem despesa.</div>
      <Btn onClick={salvarMovReserva} style={{ width: '100%' }}>Salvar movimentação</Btn>
    </Sheet>

    <Sheet aberto={sheet === 'configReserva'} fechar={() => setSheet(null)} titulo="Configurar reserva">
      <Campo label="Reserva mensal (R$)" type="number" value={regrasTmp.mensal} onChange={e => setRegrasTmp(x => ({ ...x, mensal: e.target.value }))} />
      <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: C.ink2, marginBottom: 14 }}><input type="checkbox" checked={!!regrasTmp.mensalAtiva} onChange={e => setRegrasTmp(x => ({ ...x, mensalAtiva: e.target.checked }))} /> Ativar regra mensal</label>
      <Campo label="Reserva por gasto (R$)" type="number" value={regrasTmp.porGasto} onChange={e => setRegrasTmp(x => ({ ...x, porGasto: e.target.value }))} />
      <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: C.ink2, marginBottom: 14 }}><input type="checkbox" checked={!!regrasTmp.porGastoAtiva} onChange={e => setRegrasTmp(x => ({ ...x, porGastoAtiva: e.target.checked }))} /> Ativar regra por gasto</label>
      <Btn onClick={salvarRegrasReserva} style={{ width: '100%' }}>Salvar regras</Btn>
    </Sheet>
  </div>;
}
