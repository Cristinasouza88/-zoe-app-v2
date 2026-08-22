import React, { useState, useMemo, useRef } from 'react';
import {
  Wallet, TrendingUp, TrendingDown, FileClock, Plus, ShieldCheck,
  ChevronLeft, ChevronRight, Upload, HelpCircle, Landmark, PenLine, FileText
} from 'lucide-react';
import { C, sobre, Card, Btn, Campo, Area, Barra, Sheet, GraficoLinha, hoje } from './ui.jsx';
import { CATEGORIAS_DESPESA, CATEGORIAS_RECEITA, CONTAS_PADRAO, MESES_LBL, formatoMoeda } from './financeiro.data';
import { parseTransacao, classificarDescricoesCsv } from './ia.jsx';

const vazio = { transacoes: [], contas: CONTAS_PADRAO, metas: [], dividas: [], pendenciasClassificacao: [], documentos: [] };
const rascunhoVazio = () => ({ tipo: 'saida', valor: '', categoria: CATEGORIAS_DESPESA[0], conta: CONTAS_PADRAO[0], data: hoje(), descricao: '', pendente: false });

const normalizarTexto = (valor = '') => String(valor)
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

// A chave ignora o ID local, pois o mesmo lançamento pode vir de dois
// extratos/arquivos diferentes. Assim, reimportar um documento não duplica o dado.
const chaveTransacao = (t = {}) => [
  t.data || '',
  Number(t.valor || 0).toFixed(2),
  t.tipo || '',
  normalizarTexto(t.conta || t.instituicao || ''),
  normalizarTexto(t.descricao || ''),
].join('|');

const semTransacoesDuplicadas = (transacoes = []) => {
  const vistas = new Set();
  return transacoes.filter(t => {
    const chave = chaveTransacao(t);
    if (vistas.has(chave)) return false;
    vistas.add(chave);
    return true;
  });
};

const semDividasDuplicadas = (dividas = []) => {
  const vistas = new Set();
  return dividas.filter(d => {
    const chave = [d.tipo, d.nome, d.instituicao, d.valor_total, d.saldo_restante]
      .map(normalizarTexto).join('|');
    if (vistas.has(chave)) return false;
    vistas.add(chave);
    return true;
  });
};

const normalizarFinanceiro = (fin = {}) => ({
  ...fin,
  transacoes: semTransacoesDuplicadas(fin.transacoes || []),
  dividas: semDividasDuplicadas(fin.dividas || []),
});

const hashArquivo = async (file) => {
  if (!globalThis.crypto?.subtle) return `${file.name}|${file.size}|${file.lastModified}`;
  const bytes = await file.arrayBuffer();
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
};

const separarLinhaCsv = (linha, delimitador) => {
  const campos = [];
  let atual = '';
  let emAspas = false;
  for (let i = 0; i < linha.length; i++) {
    const ch = linha[i];
    if (ch === '"') {
      if (emAspas && linha[i + 1] === '"') { atual += '"'; i++; }
      else emAspas = !emAspas;
    } else if (ch === delimitador && !emAspas) {
      campos.push(atual.trim()); atual = '';
    } else atual += ch;
  }
  campos.push(atual.trim());
  return campos;
};

const valorCsv = (valor = '') => {
  const limpo = String(valor).replace(/R\$|\s/g, '');
  if (!limpo) return 0;
  const decimal = limpo.includes(',')
    ? limpo.replace(/\./g, '').replace(',', '.')
    : limpo.replace(/,(?=\d{3}(?:\D|$))/g, '');
  const numero = Number(decimal.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(numero) ? numero : 0;
};

const dataCsv = (valor = '') => {
  const texto = String(valor).trim();
  const br = texto.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})/);
  if (br) {
    const ano = br[3].length === 2 ? `20${br[3]}` : br[3];
    return `${ano}-${br[2].padStart(2, '0')}-${br[1].padStart(2, '0')}`;
  }
  const iso = texto.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) return `${iso[1]}-${iso[2].padStart(2, '0')}-${iso[3].padStart(2, '0')}`;
  const excel = Number(texto.replace(',', '.'));
  if (Number.isFinite(excel) && excel > 25000 && excel < 80000) {
    const dt = new Date(Date.UTC(1899, 11, 30) + excel * 86400000);
    return dt.toISOString().slice(0, 10);
  }
  return '';
};

const categoriaPorDescricao = (descricao, tipo) => {
  if (tipo === 'entrada') return /salario|pro labore|pagamento empresa|folha/.test(descricao) ? 'Salário' : /reembolso|estorno/.test(descricao) ? 'Reembolso' : 'Outros';
  const regras = [
    ['Moradia', /aluguel|condominio|energia|eletric|sabesp|agua|gas|internet|iptu/],
    ['Alimentação', /mercado|supermerc|restaurante|ifood|padaria|acougue|hortifruti|caf[eé]|burger|pizza/],
    ['Transporte', /uber|99 |posto|combust|estacion|pedagio|sem parar|oficina|pneu/],
    ['Saúde', /farmacia|drogaria|hospital|clinica|medic|laborat|odont|academia/],
    ['Educação', /escola|faculdade|curso|livro|udemy|hotmart/],
    ['Assinaturas', /netflix|spotify|apple\.com|google one|amazon prime|assinatura/],
    ['Consórcio', /consorcio/], ['Financiamento', /financiamento|parcela veiculo|credito imobiliario/],
    ['Investimentos', /investimento|aplicacao|tesouro|cdb|corretora/],
    ['Cuidados pessoais', /salao|cabeleire|manicure|cosmetic|estetica/],
    ['Lazer', /cinema|teatro|viagem|hotel|ingresso|parque/],
  ];
  return regras.find(([, regra]) => regra.test(descricao))?.[0] || 'Outros';
};

const transacoesDeCsv = async (file) => {
  const texto = (await file.text()).replace(/^\uFEFF/, '');
  const linhas = texto.split(/\r?\n/).filter(l => l.trim());
  if (linhas.length < 2) return [];
  const candidatos = [',', ';', '\t'];
  const delimitador = candidatos.sort((a, b) => separarLinhaCsv(linhas[0], b).length - separarLinhaCsv(linhas[0], a).length)[0];
  const linhaCabecalho = linhas.findIndex((linha, pos) => pos < 15 && /data|date|valor|amount|debito|credito|descri|historico/i.test(normalizarTexto(linha)));
  if (linhaCabecalho < 0) throw new Error('Não encontrei o cabeçalho com data e valor neste CSV.');
  const cabecalhos = separarLinhaCsv(linhas[linhaCabecalho], delimitador).map(normalizarTexto);
  const indice = (...nomes) => cabecalhos.findIndex(h => nomes.some(n => h === n || h.includes(n)));
  const iData = indice('data', 'date', 'dt');
  const iDescricao = indice('descricao', 'description', 'historico', 'estabelecimento', 'titulo', 'memo');
  const iValor = indice('valor', 'amount', 'quantia');
  const iDebito = indice('debito', 'saida', 'despesa');
  const iCredito = indice('credito', 'entrada', 'receita');
  const iTipo = indice('tipo', 'type', 'natureza');
  const iCategoria = indice('categoria', 'category');
  const iConta = indice('conta', 'account', 'banco', 'cartao');
  if (iValor < 0 && iDebito < 0 && iCredito < 0) throw new Error('Não encontrei uma coluna de valor no CSV.');
  const transacoes = linhas.slice(linhaCabecalho + 1).map((linha, i) => {
    const c = separarLinhaCsv(linha, delimitador);
    const debito = iDebito >= 0 ? Math.abs(valorCsv(c[iDebito])) : 0;
    const credito = iCredito >= 0 ? Math.abs(valorCsv(c[iCredito])) : 0;
    const bruto = iValor >= 0 ? valorCsv(c[iValor]) : (credito || -debito);
    const tipoTexto = iTipo >= 0 ? normalizarTexto(c[iTipo]) : '';
    const tipo = credito > 0 || bruto > 0 || /entrada|credito|receita/.test(tipoTexto) ? 'entrada' : 'saida';
    const valor = Math.abs(bruto || debito || credito);
    if (!valor) return null;
    return {
      id: `csv-${Date.now()}-${i}`,
      tipo, valor,
      categoria: (iCategoria >= 0 && c[iCategoria]) || (tipo === 'entrada' ? CATEGORIAS_RECEITA[0] : 'Outros'),
      conta: (iConta >= 0 && c[iConta]) || 'Conta corrente',
      data: iData >= 0 ? dataCsv(c[iData]) : '',
      descricao: (iDescricao >= 0 && c[iDescricao]) || `Linha ${i + 2}`,
      pendente: false,
      origemDocumento: file.name,
    };
  }).filter(Boolean);
  const semData = transacoes.filter(t => !t.data).length;
  if (iData < 0 || semData > Math.max(2, Math.floor(transacoes.length * 0.05))) {
    throw new Error('As datas deste CSV não foram reconhecidas. Nenhum lançamento foi salvo.');
  }
  return transacoes.filter(t => t.data);
};

export default function Financeiro({ d, up, aviso }) {
  const fin = { ...vazio, ...d.financeiro };
  const transacoesUnicas = useMemo(() => semTransacoesDuplicadas(fin.transacoes), [fin.transacoes]);
  const [mesRef, setMesRef] = useState(() => hoje().slice(0, 7));
  const [sheetAberto, setSheetAberto] = useState(false);
  const [modoEntrada, setModoEntrada] = useState(null);
  const [rascunho, setRascunho] = useState(rascunhoVazio());
  const [processandoIA, setProcessandoIA] = useState(false);
  const inputFotoRef = useRef(null);

  const atualizar = (fn) => up(s => ({
    ...s,
    financeiro: normalizarFinanceiro(fn({ ...vazio, ...s.financeiro }))
  }));

  const transacoesDoMes = useMemo(() => transacoesUnicas.filter(t => (t.data || '').startsWith(mesRef)), [transacoesUnicas, mesRef]);
  const receita = transacoesDoMes.filter(t => t.tipo === 'entrada').reduce((a, t) => a + t.valor, 0);
  const despesa = transacoesDoMes.filter(t => t.tipo === 'saida').reduce((a, t) => a + t.valor, 0);
  const saldo = receita - despesa;
  const saldoAcumulado = transacoesUnicas
    .filter(t => (t.data || '').slice(0, 7) <= mesRef)
    .reduce((total, t) => total + (t.tipo === 'entrada' ? Number(t.valor || 0) : -Number(t.valor || 0)), 0);
  const contasAPagar = transacoesDoMes.filter(t => t.tipo === 'saida' && t.pendente).reduce((a, t) => a + t.valor, 0);
  const gastosPorCategoria = useMemo(() => CATEGORIAS_DESPESA.map((categoria, i) => {
    const total = transacoesDoMes.filter(t => t.tipo === 'saida' && t.categoria === categoria).reduce((a, t) => a + t.valor, 0);
    return { categoria, total, percentual: despesa ? Math.round((total / despesa) * 100) : 0, cor: ['#0A6963','#43BE8C','#8E2DE2','#5B9CF6','#F0A23B','#EA6B67','#9A72C7','#4E9F83','#DD7BA5','#94A3A8'][i] };
  }).filter(x => x.total > 0).sort((a,b) => b.total-a.total), [transacoesDoMes, despesa]);

  const mesAnterior = useMemo(() => {
    const [ano, mes] = mesRef.split('-').map(Number);
    const d2 = new Date(ano, mes - 2, 1);
    return `${d2.getFullYear()}-${String(d2.getMonth() + 1).padStart(2, '0')}`;
  }, [mesRef]);
  const transacoesMesAnterior = transacoesUnicas.filter(t => (t.data || '').startsWith(mesAnterior));
  const receitaAnterior = transacoesMesAnterior.filter(t => t.tipo === 'entrada').reduce((a, t) => a + t.valor, 0);
  const despesaAnterior = transacoesMesAnterior.filter(t => t.tipo === 'saida').reduce((a, t) => a + t.valor, 0);
  const variacao = (atual, anterior) => anterior > 0 ? Math.round(((atual - anterior) / anterior) * 100) : (atual > 0 ? 100 : 0);

  const ultimosMeses = useMemo(() => {
    const arr = [];
    const [ano, mes] = mesRef.split('-').map(Number);
    for (let i = 5; i >= 0; i--) {
      const dt = new Date(ano, mes - 1 - i, 1);
      const chave = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      const total = transacoesUnicas.filter(t => (t.data || '').startsWith(chave) && t.tipo === 'entrada').reduce((a, t) => a + t.valor, 0);
      arr.push({ lbl: MESES_LBL[dt.getMonth()], v: total });
    }
    return arr;
  }, [transacoesUnicas, mesRef]);

  const trocarMes = (delta) => {
    const [ano, mes] = mesRef.split('-').map(Number);
    const dt = new Date(ano, mes - 1 + delta, 1);
    setMesRef(`${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`);
  };

  const abrirNovo = () => { setRascunho(rascunhoVazio()); setModoEntrada(null); setSheetAberto(true); };

  const salvarLancamento = () => {
    const valor = parseFloat(String(rascunho.valor).replace(',', '.'));
    if (!valor || valor <= 0) return aviso('Informe um valor válido.');
    const nova = { id: `t${Date.now()}`, ...rascunho, valor };
    if (transacoesUnicas.some(t => chaveTransacao(t) === chaveTransacao(nova))) return aviso('Este lançamento já está registrado.');
    atualizar(fx => ({ ...fx, transacoes: [...fx.transacoes, nova] }));
    setSheetAberto(false);
    aviso('Lançamento salvo.');
  };

  const categoriasDoTipo = rascunho.tipo === 'entrada' ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA;
  const resolverPendencia = (p,categoria) => atualizar(fx=>({...fx,transacoes:[...fx.transacoes,{id:`class-${Date.now()}`,tipo:p.tipo==='entrada'?'entrada':'saida',valor:+p.valor||0,categoria,conta:p.conta||'Conta corrente',data:p.data||hoje(),descricao:p.descricao||p.arquivo,pendente:false,origemDocumento:p.arquivo}],pendenciasClassificacao:(fx.pendenciasClassificacao||[]).filter(x=>x.id!==p.id)}));

  const usarDocumento = () => inputFotoRef.current && inputFotoRef.current.click();
  const onFotoSelecionada = async (ev) => {
    const file = ev.target.files && ev.target.files[0];
    ev.target.value = '';
    if (!file) return;
    if(file.size>4.5*1024*1024)return aviso('Envie um arquivo de até 4,5 MB.');
    const arquivoHash = await hashArquivo(file);
    const documentoAnterior = (fin.documentos || []).find(doc => doc.hash === arquivoHash);
    const csv = /\.csv$/i.test(file.name) || /text\/csv|application\/csv|application\/vnd\.ms-excel/.test(file.type);
    if (csv) {
      setProcessandoIA(true);
      try {
        let extraidas = await transacoesDeCsv(file);
        const descricoes = [...new Set(extraidas.filter(t => t.categoria === 'Outros').map(t => normalizarTexto(t.descricao)).filter(Boolean))].slice(0, 200);
        let categoriasIA = new Map();
        if (descricoes.length) {
          const classificacao = await classificarDescricoesCsv(descricoes);
          if (classificacao.ok && Array.isArray(classificacao.dados?.categorias)) {
            categoriasIA = new Map(classificacao.dados.categorias.filter(x => x.confianca >= 0.7).map(x => [descricoes[x.id], x.categoria]));
          }
        }
        extraidas = extraidas.map(t => ({ ...t, categoria: t.categoria !== 'Outros' ? t.categoria : (categoriasIA.get(normalizarTexto(t.descricao)) || categoriaPorDescricao(normalizarTexto(t.descricao), t.tipo)) }));
        const anterioresDoArquivo = new Set(transacoesUnicas.filter(t => t.origemDocumento === file.name).map(chaveTransacao));
        const baseSemArquivo = documentoAnterior ? transacoesUnicas.filter(t => t.origemDocumento !== file.name) : transacoesUnicas;
        const chavesExistentes = new Set(baseSemArquivo.map(chaveTransacao));
        const certas = extraidas.filter(t => {
          const chave = chaveTransacao(t);
          if (chavesExistentes.has(chave)) return false;
          chavesExistentes.add(chave);
          return true;
        });
        const ignoradas = extraidas.length - certas.length;
        atualizar(fx => ({
          ...fx,
          transacoes: [...(documentoAnterior ? fx.transacoes.filter(t => t.origemDocumento !== file.name) : fx.transacoes), ...certas],
          documentos: [...(fx.documentos || []).filter(doc => doc.hash !== arquivoHash), { id: `doc-${Date.now()}`, nome: file.name, data: hoje(), itens: certas.length, hash: arquivoHash }]
        }));
        const meses = [...new Set(certas.map(t => t.data.slice(0, 7)))].sort();
        aviso(`${certas.length} lançamentos organizados em ${meses.length} mês(es)${documentoAnterior ? ' · importação anterior corrigida' : ''}${ignoradas ? ` · ${ignoradas} duplicados ignorados` : ''}`);
      } catch (erro) {
        aviso(erro?.message || 'Não consegui ler este CSV.');
      } finally {
        setProcessandoIA(false);
      }
      return;
    }
    if (documentoAnterior) return aviso('Este documento já foi importado. Nenhum dado foi duplicado.');
    const reader = new FileReader();
    reader.onload = async () => {
      setProcessandoIA(true);
      const base64 = String(reader.result).split(',')[1];
      const r = await parseTransacao({ imagemBase64: base64, mimeType: file.type });
      setProcessandoIA(false);
      if (r.ok&&Array.isArray(r.dados?.transacoes)) {
        const extraidas=r.dados.transacoes.filter(t=>Number(t.confianca||0)>=0.75&&t.valor>0).map((t,i)=>({id:`doc-${Date.now()}-${i}`,tipo:t.tipo==='entrada'?'entrada':'saida',valor:+t.valor,categoria:t.categoria||'Outros',conta:t.conta||'Conta corrente',data:t.data||hoje(),descricao:t.descricao||file.name,pendente:false,origemDocumento:file.name}));
        const chavesExistentes = new Set(transacoesUnicas.map(chaveTransacao));
        const certas = extraidas.filter(t => {
          const chave = chaveTransacao(t);
          if (chavesExistentes.has(chave)) return false;
          chavesExistentes.add(chave);
          return true;
        });
        const ignoradas = extraidas.length - certas.length;
        const duvidas=r.dados.transacoes.filter(t=>Number(t.confianca||0)<0.75||!t.categoria||t.categoria==='Outros').map((t,i)=>({id:`duvida-${Date.now()}-${i}`,...t,arquivo:file.name}));
        atualizar(fx=>({...fx,transacoes:[...fx.transacoes,...certas],pendenciasClassificacao:[...(fx.pendenciasClassificacao||[]),...duvidas],dividas:r.dados.divida?[...(fx.dividas||[]),{id:`divida-${Date.now()}`,...r.dados.divida,origem:file.name}]:fx.dividas,documentos:[...(fx.documentos||[]),{id:`doc-${Date.now()}`,nome:file.name,data:hoje(),itens:certas.length,hash:arquivoHash}]}));
        aviso(`${certas.length} lançamentos organizados${ignoradas?` · ${ignoradas} duplicados ignorados`:''}${duvidas.length?` · ${duvidas.length} precisam da sua resposta`:''}`);
      } else if (r.ok) aviso('Não encontrei lançamentos suficientes neste documento.');
      else aviso(r.erro);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ padding: '20px 16px 100px', maxWidth: 520, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <Wallet size={22} color={C.green} />
        <h1 style={{ fontSize: 24, fontWeight: 800, color: C.ink, margin: 0 }}>Financeiro</h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 0 18px' }}>
        <button onClick={() => trocarMes(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.ink2 }}><ChevronLeft size={20} /></button>
        <span style={{ fontSize: 14, fontWeight: 700, color: C.ink2 }}>{MESES_LBL[Number(mesRef.slice(5, 7)) - 1]} de {mesRef.slice(0, 4)}</span>
        <button onClick={() => trocarMes(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.ink2 }}><ChevronRight size={20} /></button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <Card cls="zoe-surge" style={{ background: C.mint }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: C.ink2 }}><TrendingUp size={14} /> Receita</div>
          <div style={{ fontSize: 19, fontWeight: 800, color: C.ink, marginTop: 4 }}>{formatoMoeda(receita)}</div>
          <div style={{ fontSize: 11, color: variacao(receita, receitaAnterior) >= 0 ? C.green : C.coral, marginTop: 2 }}>{variacao(receita, receitaAnterior) >= 0 ? '↑' : '↓'} {Math.abs(variacao(receita, receitaAnterior))}% vs mês anterior</div>
        </Card>
        <Card cls="zoe-surge" delay={30} style={{ background: C.limaSuave }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: C.ink2 }}><TrendingDown size={14} /> Despesas</div>
          <div style={{ fontSize: 19, fontWeight: 800, color: C.ink, marginTop: 4 }}>{formatoMoeda(despesa)}</div>
          <div style={{ fontSize: 11, color: variacao(despesa, despesaAnterior) <= 0 ? C.green : C.coral, marginTop: 2 }}>{variacao(despesa, despesaAnterior) >= 0 ? '↑' : '↓'} {Math.abs(variacao(despesa, despesaAnterior))}% vs mês anterior</div>
        </Card>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        <Card>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.ink2 }}>Saldo do mês</div>
          <div style={{ fontSize: 19, fontWeight: 800, color: saldo >= 0 ? C.green : C.coral, marginTop: 4 }}>{formatoMoeda(saldo)}</div>
        </Card>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: C.ink2 }}><FileClock size={14} /> Contas a pagar</div>
          <div style={{ fontSize: 19, fontWeight: 800, color: C.ink, marginTop: 4 }}>{formatoMoeda(contasAPagar)}</div>
        </Card>
      </div>

      <Card style={{ marginBottom: 16, background: saldoAcumulado >= 0 ? '#F2FBF7' : '#FFF4F1', border: `1px solid ${saldoAcumulado >= 0 ? '#CDEDE0' : '#F4D4CC'}` }}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
          <div><div style={{fontSize:12,fontWeight:800,color:C.ink2}}>Saldo acumulado</div><div style={{fontSize:10.5,color:C.ink3,marginTop:3}}>Entradas menos saídas até {MESES_LBL[Number(mesRef.slice(5,7))-1]} de {mesRef.slice(0,4)}</div></div>
          <strong style={{fontSize:20,color:saldoAcumulado>=0?C.green:C.coral,whiteSpace:'nowrap'}}>{formatoMoeda(saldoAcumulado)}</strong>
        </div>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.ink2, marginBottom: 10 }}>Entradas nos últimos 6 meses</div>
        <GraficoLinha dados={ultimosMeses.map(m => m.v)} cor={C.green} />
        <div style={{ display: 'flex', marginTop: 6 }}>
          {ultimosMeses.map(m => <div key={m.lbl} style={{ flex: 1, textAlign: 'center', fontSize: 10, color: C.ink3 }}>{m.lbl}</div>)}
        </div>
      </Card>

      {(fin.dividas||[]).length>0&&<><div style={{display:'flex',alignItems:'center',gap:7,margin:'4px 2px 10px',color:C.ink,fontWeight:850}}><Landmark size={18} color={C.roxo}/>Consórcios e financiamentos</div>{fin.dividas.map(divida=>{const total=+divida.valor_total||0,pago=+divida.valor_pago||0,resta=+divida.saldo_restante||(total-pago);return <Card key={divida.id} style={{marginBottom:10,border:'1px solid #E4D9F2'}}><div style={{display:'flex',justifyContent:'space-between',gap:10}}><div><div style={{fontSize:10,fontWeight:900,color:C.roxo,textTransform:'uppercase'}}>{divida.tipo||'Dívida'}</div><div style={{fontSize:14,fontWeight:850,color:C.ink,marginTop:3}}>{divida.nome||divida.instituicao||'Contrato identificado'}</div></div><div style={{textAlign:'right',fontSize:10,color:C.ink3}}>{divida.parcela_atual&&divida.total_parcelas?`${divida.parcela_atual}/${divida.total_parcelas} parcelas`:''}</div></div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,margin:'12px 0 8px'}}><div style={{background:C.mint,borderRadius:12,padding:10}}><div style={{fontSize:9,color:C.ink3}}>Já pago</div><strong style={{fontSize:14,color:C.green}}>{formatoMoeda(pago)}</strong></div><div style={{background:'#FFF3F0',borderRadius:12,padding:10}}><div style={{fontSize:9,color:C.ink3}}>Ainda falta</div><strong style={{fontSize:14,color:C.coral}}>{formatoMoeda(resta)}</strong></div></div><Barra v={pago} max={total||Math.max(1,pago+resta)} cor={C.roxo} h={7}/></Card>})}</>}

      {(fin.pendenciasClassificacao||[]).length>0&&<><div style={{display:'flex',alignItems:'center',gap:7,margin:'16px 2px 10px',color:C.ink,fontWeight:850}}><HelpCircle size={18} color={C.gold}/>A ZOE precisa da sua ajuda</div>{fin.pendenciasClassificacao.map(p=><Card key={p.id} style={{marginBottom:9,background:'#FFFBEE',border:'1px solid #F3DF9B'}}><div style={{fontSize:12.5,fontWeight:800,color:C.ink}}>Onde entra “{p.descricao||'este pagamento'}”?</div><div style={{fontSize:11,color:C.ink3,margin:'4px 0 10px'}}>{formatoMoeda(+p.valor||0)} · {p.arquivo}</div><div style={{display:'flex',flexWrap:'wrap',gap:5}}>{['Moradia','Transporte','Consórcio','Financiamento','Outros'].map(cat=><button key={cat} onClick={()=>resolverPendencia(p,cat)} style={{border:`1px solid ${C.line}`,background:'#fff',borderRadius:16,padding:'6px 8px',fontFamily:'inherit',fontSize:9.5,fontWeight:800,color:C.ink}}>{cat}</button>)}</div></Card>)}</>}

      <Card style={{ marginBottom: 16 }}>
        <div style={{fontSize:14,fontWeight:850,color:C.ink,marginBottom:4}}>Para onde foi seu dinheiro</div>
        <div style={{fontSize:11,color:C.ink3,marginBottom:14}}>Percentual das despesas de {MESES_LBL[Number(mesRef.slice(5,7))-1]}</div>
        {gastosPorCategoria.length===0?<div style={{textAlign:'center',padding:'18px 0',fontSize:12.5,color:C.ink3}}>Envie uma fatura ou faça um lançamento para ver a distribuição.</div>:<div style={{display:'grid',gridTemplateColumns:'112px 1fr',gap:15,alignItems:'center'}}>
          <div style={{width:108,height:108,borderRadius:'50%',background:`conic-gradient(${gastosPorCategoria.map((x,i)=>{const antes=gastosPorCategoria.slice(0,i).reduce((n,y)=>n+y.percentual,0);return `${x.cor} ${antes}% ${antes+x.percentual}%`}).join(',')})`,display:'grid',placeItems:'center'}}><div style={{width:63,height:63,borderRadius:'50%',background:'#fff',display:'grid',placeItems:'center',textAlign:'center'}}><div><strong style={{display:'block',fontSize:15,color:C.ink}}>100%</strong><span style={{fontSize:8.5,color:C.ink3}}>dos gastos</span></div></div></div>
          <div>{gastosPorCategoria.map(x=><div key={x.categoria} style={{marginBottom:9}}><div style={{display:'flex',alignItems:'center',gap:6,fontSize:10.5}}><span style={{width:8,height:8,borderRadius:8,background:x.cor}}/><strong style={{flex:1,color:C.ink}}>{x.categoria}</strong><span style={{fontWeight:900,color:C.ink}}>{x.percentual}%</span></div><div style={{fontSize:9.5,color:C.ink3,margin:'2px 0 0 14px'}}>{formatoMoeda(x.total)}</div></div>)}</div>
        </div>}
      </Card>

      <Card style={{ marginBottom: 16, background: '#F5FAF8', border: `1px solid ${C.line}` }}>
        <div style={{display:'flex',alignItems:'center',gap:11}}>
          <span style={{width:40,height:40,borderRadius:13,background:C.mint,color:C.green,display:'grid',placeItems:'center',flexShrink:0}}><ShieldCheck size={20}/></span>
          <div><strong style={{display:'block',fontSize:13.5,color:C.ink}}>Seus extratos permanecem privados</strong><span style={{fontSize:10.8,lineHeight:1.45,color:C.ink3}}>A ZOE usa os lançamentos somente para calcular os resumos acima. Descrições, estabelecimentos e a lista detalhada não são exibidos nesta tela.</span></div>
        </div>
        <div style={{marginTop:11,paddingTop:10,borderTop:`1px solid ${C.line}`,fontSize:10.5,color:C.ink3}}>{transacoesDoMes.length} lançamentos únicos considerados neste mês</div>
      </Card>

      <Btn onClick={abrirNovo} style={{ width: '100%' }}><Plus size={16} style={{ verticalAlign: -3, marginRight: 6 }} />Novo lançamento</Btn>

      <Sheet aberto={sheetAberto} fechar={() => setSheetAberto(false)} titulo={modoEntrada==='manual'?'Lançamento manual':modoEntrada==='documento'?'Enviar documento':'Adicionar movimentações'}>
        {!modoEntrada&&<div><p style={{fontSize:12.5,lineHeight:1.5,color:C.ink3,margin:'0 0 16px'}}>Escolha como deseja adicionar as informações financeiras.</p><button onClick={()=>setModoEntrada('manual')} style={{width:'100%',border:`1.5px solid ${C.line}`,background:'#fff',borderRadius:17,padding:16,display:'flex',alignItems:'center',gap:13,textAlign:'left',fontFamily:'inherit',marginBottom:10}}><span style={{width:44,height:44,borderRadius:14,background:C.mint,color:C.green,display:'grid',placeItems:'center'}}><PenLine size={21}/></span><span><strong style={{display:'block',fontSize:14,color:C.ink}}>Adicionar manualmente</strong><small style={{fontSize:10.5,color:C.ink3}}>Preencha valor, categoria e data</small></span></button><button onClick={()=>{setModoEntrada('documento');setTimeout(usarDocumento,80)}} style={{width:'100%',border:'1.5px solid #DDD5EB',background:'#F9F5FF',borderRadius:17,padding:16,display:'flex',alignItems:'center',gap:13,textAlign:'left',fontFamily:'inherit'}}><span style={{width:44,height:44,borderRadius:14,background:'#EDE1FF',color:C.roxo,display:'grid',placeItems:'center'}}><FileText size={22}/></span><span><strong style={{display:'block',fontSize:14,color:C.ink}}>Enviar documento</strong><small style={{fontSize:10.5,color:C.ink3}}>CSV, PDF, fatura, extrato, boleto ou foto</small></span></button></div>}

        {modoEntrada==='documento'&&<div style={{textAlign:'center',padding:'4px 0 10px'}}><div style={{width:62,height:62,borderRadius:20,background:'#EDE1FF',color:C.roxo,display:'grid',placeItems:'center',margin:'0 auto 13px'}}><Upload size={27}/></div><strong style={{fontSize:16,color:C.ink}}>A ZOE organiza o documento inteiro</strong><p style={{fontSize:11.5,lineHeight:1.5,color:C.ink3,margin:'7px 0 16px'}}>Ela aceita CSV, PDF ou imagem, organiza as movimentações e evita registros duplicados.</p><Btn onClick={usarDocumento} disabled={processandoIA} style={{width:'100%',padding:14}}>{processandoIA?'Lendo e organizando…':'Escolher CSV, PDF ou imagem'}</Btn><button onClick={()=>setModoEntrada(null)} style={{border:0,background:'transparent',color:C.ink3,fontFamily:'inherit',fontWeight:750,padding:13}}>Voltar</button></div>}
        <input ref={inputFotoRef} type="file" accept=".csv,text/csv,application/csv,application/vnd.ms-excel,image/*,application/pdf" style={{ display: 'none' }} onChange={onFotoSelecionada} />

        {modoEntrada==='manual'&&<><button onClick={()=>setModoEntrada(null)} style={{border:0,background:'transparent',color:C.ink3,fontFamily:'inherit',fontWeight:750,padding:'0 0 13px'}}>← Voltar</button><div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {[['saida', 'Saída'], ['entrada', 'Entrada']].map(([tp, lbl]) => (
            <button key={tp} onClick={() => setRascunho(r => ({ ...r, tipo: tp, categoria: (tp === 'entrada' ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA)[0] }))} style={{
              flex: 1, padding: '10px 8px', borderRadius: 12, border: `1.5px solid ${rascunho.tipo === tp ? C.green : C.line}`,
              background: rascunho.tipo === tp ? C.green : 'transparent', color: rascunho.tipo === tp ? '#fff' : C.ink2,
              fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit'
            }}>{lbl}</button>
          ))}
        </div>
        <Campo label="Valor (R$)" type="number" inputMode="decimal" placeholder="0,00" value={rascunho.valor} onChange={e => setRascunho(r => ({ ...r, valor: e.target.value }))} />
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: C.ink2, display: 'block', marginBottom: 6 }}>Categoria</label>
          <select value={rascunho.categoria} onChange={e => setRascunho(r => ({ ...r, categoria: e.target.value }))}
            style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1.5px solid ${C.line}`, fontSize: 15, color: C.ink, fontFamily: 'inherit', background: '#FAFCFB' }}>
            {categoriasDoTipo.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: C.ink2, display: 'block', marginBottom: 6 }}>Conta</label>
          <select value={rascunho.conta} onChange={e => setRascunho(r => ({ ...r, conta: e.target.value }))}
            style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1.5px solid ${C.line}`, fontSize: 15, color: C.ink, fontFamily: 'inherit', background: '#FAFCFB' }}>
            {fin.contas.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <Campo label="Data" type="date" value={rascunho.data} onChange={e => setRascunho(r => ({ ...r, data: e.target.value }))} />
        <Area label="Descrição (opcional)" placeholder="Ex.: Mercado da semana" value={rascunho.descricao} onChange={e => setRascunho(r => ({ ...r, descricao: e.target.value }))} />
        {rascunho.tipo === 'saida' && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: C.ink2, marginBottom: 16, cursor: 'pointer' }}>
            <input type="checkbox" checked={rascunho.pendente} onChange={e => setRascunho(r => ({ ...r, pendente: e.target.checked }))} />
            Ainda não paguei (conta a pagar)
          </label>
        )}
        <Btn onClick={salvarLancamento} style={{ width: '100%' }}>Salvar lançamento</Btn></>}
      </Sheet>
    </div>
  );
}
