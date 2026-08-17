import React, { useState, useMemo, useRef } from 'react';
import {
  Wallet, TrendingUp, TrendingDown, FileClock, Plus, Search, Download,
  Trash2, Mic, Camera, Sparkles, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import { C, sobre, Card, Btn, Campo, Area, Barra, Sheet, GraficoLinha, hoje } from './ui.jsx';
import { CATEGORIAS_DESPESA, CATEGORIAS_RECEITA, CONTAS_PADRAO, MESES_LBL, formatoMoeda } from './financeiro.data';
import { parseTransacao, pedirSugestoes, reconhecimentoDisponivel, iniciarReconhecimentoVoz } from './ia.jsx';

const vazio = { transacoes: [], contas: CONTAS_PADRAO, metas: [] };
const rascunhoVazio = () => ({ tipo: 'saida', valor: '', categoria: CATEGORIAS_DESPESA[0], conta: CONTAS_PADRAO[0], data: hoje(), descricao: '', pendente: false });

export default function Financeiro({ d, up, aviso }) {
  const fin = { ...vazio, ...d.financeiro };
  const [mesRef, setMesRef] = useState(() => hoje().slice(0, 7));
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [sheetAberto, setSheetAberto] = useState(false);
  const [rascunho, setRascunho] = useState(rascunhoVazio());
  const [ouvindo, setOuvindo] = useState(false);
  const [processandoIA, setProcessandoIA] = useState(false);
  const [sugestoes, setSugestoes] = useState(null);
  const [carregandoSugestao, setCarregandoSugestao] = useState(false);
  const inputFotoRef = useRef(null);

  const atualizar = (fn) => up(s => ({ ...s, financeiro: fn({ ...vazio, ...s.financeiro }) }));

  const transacoesDoMes = useMemo(() => fin.transacoes.filter(t => t.data.startsWith(mesRef)), [fin.transacoes, mesRef]);
  const receita = transacoesDoMes.filter(t => t.tipo === 'entrada').reduce((a, t) => a + t.valor, 0);
  const despesa = transacoesDoMes.filter(t => t.tipo === 'saida').reduce((a, t) => a + t.valor, 0);
  const saldo = receita - despesa;
  const contasAPagar = transacoesDoMes.filter(t => t.tipo === 'saida' && t.pendente).reduce((a, t) => a + t.valor, 0);

  const mesAnterior = useMemo(() => {
    const [ano, mes] = mesRef.split('-').map(Number);
    const d2 = new Date(ano, mes - 2, 1);
    return `${d2.getFullYear()}-${String(d2.getMonth() + 1).padStart(2, '0')}`;
  }, [mesRef]);
  const transacoesMesAnterior = fin.transacoes.filter(t => t.data.startsWith(mesAnterior));
  const receitaAnterior = transacoesMesAnterior.filter(t => t.tipo === 'entrada').reduce((a, t) => a + t.valor, 0);
  const despesaAnterior = transacoesMesAnterior.filter(t => t.tipo === 'saida').reduce((a, t) => a + t.valor, 0);
  const variacao = (atual, anterior) => anterior > 0 ? Math.round(((atual - anterior) / anterior) * 100) : (atual > 0 ? 100 : 0);

  const ultimosMeses = useMemo(() => {
    const arr = [];
    const [ano, mes] = mesRef.split('-').map(Number);
    for (let i = 5; i >= 0; i--) {
      const dt = new Date(ano, mes - 1 - i, 1);
      const chave = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      const total = fin.transacoes.filter(t => t.data.startsWith(chave) && t.tipo === 'entrada').reduce((a, t) => a + t.valor, 0);
      arr.push({ lbl: MESES_LBL[dt.getMonth()], v: total });
    }
    return arr;
  }, [fin.transacoes, mesRef]);

  const listaFiltrada = useMemo(() => transacoesDoMes
    .filter(t => filtroTipo === 'todos' || t.tipo === filtroTipo)
    .filter(t => !busca.trim() || (t.descricao + t.categoria).toLowerCase().includes(busca.toLowerCase()))
    .sort((a, b) => b.data.localeCompare(a.data)), [transacoesDoMes, filtroTipo, busca]);

  const trocarMes = (delta) => {
    const [ano, mes] = mesRef.split('-').map(Number);
    const dt = new Date(ano, mes - 1 + delta, 1);
    setMesRef(`${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`);
  };

  const abrirNovo = () => { setRascunho(rascunhoVazio()); setSheetAberto(true); };

  const salvarLancamento = () => {
    const valor = parseFloat(String(rascunho.valor).replace(',', '.'));
    if (!valor || valor <= 0) return aviso('Informe um valor válido.');
    const nova = { id: `t${Date.now()}`, ...rascunho, valor };
    atualizar(fx => ({ ...fx, transacoes: [...fx.transacoes, nova] }));
    setSheetAberto(false);
    aviso('Lançamento salvo.');
  };

  const excluir = (id) => atualizar(fx => ({ ...fx, transacoes: fx.transacoes.filter(t => t.id !== id) }));

  const exportarCSV = () => {
    const linhas = [['Data', 'Descrição', 'Tipo', 'Categoria', 'Conta', 'Valor'].join(';')];
    listaFiltrada.forEach(t => linhas.push([t.data, t.descricao, t.tipo, t.categoria, t.conta, t.valor.toFixed(2)].join(';')));
    const blob = new Blob([linhas.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `financeiro-${mesRef}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const categoriasDoTipo = rascunho.tipo === 'entrada' ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA;

  const preencherComIA = (campos) => {
    setRascunho(r => ({
      ...r,
      valor: campos.valor ?? r.valor,
      tipo: campos.tipo === 'entrada' ? 'entrada' : campos.tipo === 'saida' ? 'saida' : r.tipo,
      categoria: campos.categoria || r.categoria,
      descricao: campos.descricao || r.descricao,
      data: campos.data || r.data
    }));
    aviso('Rascunho preenchido pela IA — confira antes de salvar.');
  };

  const usarVoz = () => {
    if (!reconhecimentoDisponivel()) return aviso('Seu navegador não suporta reconhecimento de voz.');
    setOuvindo(true);
    iniciarReconhecimentoVoz({
      onResultado: async (texto) => {
        setOuvindo(false);
        setProcessandoIA(true);
        const r = await parseTransacao({ texto });
        setProcessandoIA(false);
        if (r.ok) preencherComIA(r.dados);
        else { setRascunho(rr => ({ ...rr, descricao: texto })); aviso(r.erro); }
      },
      onErro: (e) => { setOuvindo(false); aviso('Não consegui ouvir — tente de novo.'); }
    });
  };

  const usarFoto = () => inputFotoRef.current && inputFotoRef.current.click();
  const onFotoSelecionada = async (ev) => {
    const file = ev.target.files && ev.target.files[0];
    ev.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      setProcessandoIA(true);
      const base64 = String(reader.result).split(',')[1];
      const r = await parseTransacao({ imagemBase64: base64, mimeType: file.type });
      setProcessandoIA(false);
      if (r.ok) preencherComIA(r.dados);
      else aviso(r.erro);
    };
    reader.readAsDataURL(file);
  };

  const buscarSugestoes = async () => {
    setCarregandoSugestao(true);
    const resumo = {
      mes: mesRef, receita, despesa, saldo,
      porCategoria: CATEGORIAS_DESPESA.map(c => ({ categoria: c, total: transacoesDoMes.filter(t => t.categoria === c).reduce((a, t) => a + t.valor, 0) })).filter(c => c.total > 0)
    };
    const r = await pedirSugestoes(resumo);
    setCarregandoSugestao(false);
    setSugestoes(r.ok ? r.dados.texto : r.erro);
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

      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.ink2, marginBottom: 10 }}>Entradas nos últimos 6 meses</div>
        <GraficoLinha dados={ultimosMeses.map(m => m.v)} cor={C.green} />
        <div style={{ display: 'flex', marginTop: 6 }}>
          {ultimosMeses.map(m => <div key={m.lbl} style={{ flex: 1, textAlign: 'center', fontSize: 10, color: C.ink3 }}>{m.lbl}</div>)}
        </div>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.ink, display: 'flex', alignItems: 'center', gap: 6 }}><Sparkles size={16} color={C.lilac} /> Sugestões</div>
          <button onClick={buscarSugestoes} disabled={carregandoSugestao} style={{ background: 'none', border: 'none', color: C.green, fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>
            {carregandoSugestao ? 'Pensando…' : 'Atualizar'}
          </button>
        </div>
        <div style={{ fontSize: 13, color: C.ink2, whiteSpace: 'pre-wrap' }}>
          {sugestoes || 'Toque em "Atualizar" para receber sugestões de economia e investimento com base nos seus lançamentos deste mês.'}
        </div>
      </Card>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: '#FAFCFB', border: `1.5px solid ${C.line}`, borderRadius: 12, padding: '9px 12px' }}>
          <Search size={16} color={C.ink3} />
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar lançamento…" style={{ border: 'none', outline: 'none', background: 'none', fontSize: 14, flex: 1, fontFamily: 'inherit', color: C.ink }} />
        </div>
        <button onClick={exportarCSV} style={{ width: 42, height: 42, borderRadius: 12, border: `1.5px solid ${C.line}`, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.ink2 }}><Download size={18} /></button>
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {['todos', 'entrada', 'saida'].map(tp => (
          <button key={tp} onClick={() => setFiltroTipo(tp)} style={{
            padding: '6px 12px', borderRadius: 99, border: `1.5px solid ${filtroTipo === tp ? C.green : C.line}`,
            background: filtroTipo === tp ? C.green : 'transparent', color: filtroTipo === tp ? '#fff' : C.ink2,
            fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit'
          }}>{tp === 'todos' ? 'Todos' : tp === 'entrada' ? 'Entradas' : 'Saídas'}</button>
        ))}
      </div>

      <Card style={{ marginBottom: 16 }}>
        {listaFiltrada.length === 0 && <div style={{ textAlign: 'center', padding: '20px 0', color: C.ink3, fontSize: 13.5 }}>Nenhum lançamento neste mês.</div>}
        {listaFiltrada.map(t => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: `1px dashed ${C.line}` }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.descricao || t.categoria}</div>
              <div style={{ fontSize: 11.5, color: C.ink3 }}>{t.data.split('-').reverse().join('/')} · {t.categoria} · {t.conta}{t.pendente ? ' · pendente' : ''}</div>
            </div>
            <div style={{ fontWeight: 800, fontSize: 14, color: t.tipo === 'entrada' ? C.green : C.coral, flexShrink: 0 }}>
              {t.tipo === 'entrada' ? '+' : '-'}{formatoMoeda(t.valor)}
            </div>
            <button onClick={() => excluir(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.ink3, flexShrink: 0 }}><Trash2 size={15} /></button>
          </div>
        ))}
      </Card>

      <Btn onClick={abrirNovo} style={{ width: '100%' }}><Plus size={16} style={{ verticalAlign: -3, marginRight: 6 }} />Novo lançamento</Btn>

      <Sheet aberto={sheetAberto} fechar={() => setSheetAberto(false)} titulo="Novo lançamento">
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {[['saida', 'Saída'], ['entrada', 'Entrada']].map(([tp, lbl]) => (
            <button key={tp} onClick={() => setRascunho(r => ({ ...r, tipo: tp, categoria: (tp === 'entrada' ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA)[0] }))} style={{
              flex: 1, padding: '10px 8px', borderRadius: 12, border: `1.5px solid ${rascunho.tipo === tp ? C.green : C.line}`,
              background: rascunho.tipo === tp ? C.green : 'transparent', color: rascunho.tipo === tp ? '#fff' : C.ink2,
              fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit'
            }}>{lbl}</button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <button onClick={usarVoz} disabled={ouvindo || processandoIA} style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 8px',
            borderRadius: 12, border: `1.5px solid ${C.line}`, background: ouvindo ? C.coral : '#fff', color: ouvindo ? '#fff' : C.ink2,
            fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit'
          }}><Mic size={16} />{ouvindo ? 'Ouvindo…' : 'Falar'}</button>
          <button onClick={usarFoto} disabled={processandoIA} style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 8px',
            borderRadius: 12, border: `1.5px solid ${C.line}`, background: '#fff', color: C.ink2, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit'
          }}><Camera size={16} />Foto do recibo</button>
          <input ref={inputFotoRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={onFotoSelecionada} />
        </div>
        {processandoIA && <div style={{ fontSize: 12.5, color: C.ink3, marginBottom: 10 }}>Lendo com IA…</div>}

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
        <Btn onClick={salvarLancamento} style={{ width: '100%' }}>Salvar lançamento</Btn>
      </Sheet>
    </div>
  );
}
