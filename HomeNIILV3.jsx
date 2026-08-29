import React, { useMemo, useState } from 'react';
import { Menu, Target, CheckCircle2, BookOpen, Wallet, Plus, ChevronRight, CalendarDays, MapPin, BarChart3 } from 'lucide-react';
import './HomeNIILV3.css';
import NIILOrb from './NIILOrb.jsx';
import PerformanceNIIL from './PerformanceNIIL.jsx';

const GREEN = '#B7F20C';

const primeiroNomeDe = (d, usuario) => {
  const nome = String(d?.perfil?.nome || usuario?.nome || 'Você').trim();
  return nome.split(/\s+/)[0] || 'Você';
};

const saudacaoAgora = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
};

const cursoNome = (cursos, id) => cursos.find(c => c.id === id)?.nome || 'Trilha';

export default function HomeNIILV3({
  d,
  usuario,
  pctVida = 0,
  concluidas = 0,
  totalEtapas = 0,
  marcosConcluidos = 0,
  totalMarcos = 9,
  marcoAtual,
  agendaAtiva,
  setAba,
  setData,
  setSheet,
  setFab,
  toggleTarefaDe,
  abrirTreino
}) {
  const [performanceAberta,setPerformanceAberta]=useState(false);
  const hojeIso = new Date().toISOString().slice(0, 10);
  const cursos = d?.cursos || [];
  const cursosFixados = cursos.filter(c => c.fixadoInicio).slice(0, 2);
  const marcasHoje = d?.agenda?.[hojeIso] || {};
  const nome = primeiroNomeDe(d, usuario);

  const baseHoje = useMemo(() => (agendaAtiva?.tarefas || []).map((t, i) => ({
    id: `base-${i}`,
    origem: 'base',
    indice: i,
    hora: t.hora || 'Ao longo do dia',
    titulo: t.t,
    detalhe: 'Trilha NIIL',
    feito: !!marcasHoje[`${agendaAtiva?.id}-${i}`]
  })), [agendaAtiva, marcasHoje]);

  const cursosHoje = useMemo(() => (d?.agendaCursos || [])
    .filter(e => e.data === hojeIso && cursos.some(c => c.id === e.cursoId))
    .map(e => ({
      id: e.id,
      origem: 'curso',
      hora: e.hora || 'Ao longo do dia',
      titulo: e.titulo,
      detalhe: cursoNome(cursos, e.cursoId),
      agendaCursoId: e.id,
      feito: !!e.feito
    })), [d?.agendaCursos, cursos, hojeIso]);

  const missao = [...baseHoje, ...cursosHoje];
  const totalMissao = missao.length;
  const feitasMissao = missao.filter(x => x.feito).length;
  const pctMissao = totalMissao ? Math.round((feitasMissao / totalMissao) * 100) : 0;
  const agendaPreview = [...missao].sort((a, b) => String(a.hora).localeCompare(String(b.hora))).slice(0, 3);

  const abrirAgenda = () => {
    setData?.(hojeIso);
    setAba?.('agenda');
  };

  const abrirItemAgenda = item => {
    if (item.origem === 'base' && agendaAtiva) {
      toggleTarefaDe?.(agendaAtiva, item.indice, hojeIso);
      return;
    }
    if (/academia|treino/i.test(item.titulo || '')) {
      abrirTreino?.({ origem:'curso', agendaCursoId:item.agendaCursoId, data:hojeIso, titulo:item.titulo });
      return;
    }
    setAba?.('cursos');
  };

  const slots = [cursosFixados[0] || null, cursosFixados[1] || null];

  if(performanceAberta){
    return <PerformanceNIIL d={d||{}} voltar={()=>setPerformanceAberta(false)}/>;
  }

  return (
    <section className="niil-home-v3-first">
      <header className="niil-home-v3-header">
        <button className="niil-home-v3-menu" onClick={() => setFab?.(true)} aria-label="Abrir atalhos">
          <Menu size={22} strokeWidth={2} />
        </button>

        <div className="niil-home-v3-greeting">
          <span>{saudacaoAgora()},</span>
          <strong>{nome}</strong>
        </div>

        <div className="niil-home-v3-header-actions">
          <button className="niil-home-v3-performance" onClick={() => setPerformanceAberta(true)} aria-label="Abrir Performance" title="Performance">
            <BarChart3 size={21} strokeWidth={2.1} />
          </button>
          <button className="niil-home-v3-avatar" onClick={() => setSheet?.('perfil')} aria-label="Abrir perfil">
            <span>{nome.slice(0, 1).toUpperCase()}</span>
            <i />
          </button>
        </div>
      </header>

      <button className="niil-home-v3-goal" onClick={() => setAba?.('trilha')}>
        <div className="niil-home-v3-goal-copy">
          <span className="niil-home-v3-eyebrow">SUA META</span>
          <div className="niil-home-v3-goal-title">
            <strong>{marcoAtual?.fase?.marco || 'M1'}</strong> · {marcoAtual?.fase?.nome || 'O que vale o esforço?'}
          </div>
          <div className="niil-home-v3-goal-bar" aria-hidden="true">
            <i style={{ width: `${Math.max(0, Math.min(100, pctVida))}%` }} />
          </div>
          <small>{marcosConcluidos} de {totalMarcos} marcos · faltam {Math.max(0,(marcoAtual?.total||0)-(marcoAtual?.concluidas||0))} passos neste marco</small>
          <span className="niil-home-v3-goal-link">Continuar trilha <ChevronRight size={16} /></span>
        </div>

        <div className="niil-home-v3-map" aria-hidden="true">
          <svg viewBox="0 0 280 170" preserveAspectRatio="xMidYMid meet">
            <g className="niil-home-v3-map-grid">
              <path d="M6 24 C55 5 83 40 129 22 S215 10 274 26" />
              <path d="M10 70 C55 48 81 74 119 66 S199 48 275 65" />
              <path d="M0 118 C39 99 85 121 125 105 S220 92 280 112" />
              <path d="M38 0 C30 38 48 67 34 98 S24 142 40 170" />
              <path d="M104 0 C93 35 112 68 101 101 S91 142 110 170" />
              <path d="M192 0 C178 35 199 67 188 100 S181 141 197 170" />
              <path d="M233 0 C221 32 238 66 226 94 S218 137 238 170" />
            </g>
            <path className="niil-home-v3-route-base" pathLength="100" d="M20 132 C54 128 72 148 101 128 S135 90 160 101 S193 116 207 77 S244 52 260 38" />
            <path className="niil-home-v3-route-progress" pathLength="100" strokeDasharray={`${Math.max(0, Math.min(100, pctVida))} ${100 - Math.max(0, Math.min(100, pctVida))}`} d="M20 132 C54 128 72 148 101 128 S135 90 160 101 S193 116 207 77 S244 52 260 38" />
            <circle cx="20" cy="132" r="9" fill="#ffffff" />
            <circle cx="20" cy="132" r="5" fill={GREEN} />
            <g transform="translate(244 12)"><MapPin size={38} color={GREEN} fill={GREEN} strokeWidth={1.8} /></g>
            <text x="210" y="65" className="niil-home-v3-map-label">Sua meta</text>
          </svg>
        </div>
      </button>

      <div className="niil-home-v3-quick" aria-label="Atalhos do início">
        <button onClick={() => setAba?.('trilha')}>
          <span className="niil-home-v3-quick-icon active"><Target size={19} /></span>
          <b>Missão do dia</b><small>{totalMissao ? `${feitasMissao}/${totalMissao}` : 'Abrir trilha'}</small>
        </button>

        {slots.map((curso, idx) => {
          if (!curso) return (
            <button key={`empty-${idx}`} onClick={() => setAba?.('cursos')}>
              <span className="niil-home-v3-quick-icon"><Plus size={19} /></span><b>Fixar trilha</b><small>{idx + 1} de 2</small>
            </button>
          );
          const feitas = (curso.aulas || []).filter(a => a.feito).length;
          const total = (curso.aulas || []).length;
          return (
            <button key={curso.id} onClick={() => setAba?.('cursos')}>
              <span className="niil-home-v3-quick-icon"><BookOpen size={19} /></span><b>{curso.nome}</b><small>{total ? `${feitas}/${total}` : 'Trilha'}</small>
            </button>
          );
        })}

        <button onClick={() => setAba?.('financeiro')}>
          <span className="niil-home-v3-quick-icon"><Wallet size={19} /></span><b>Finanças</b><small>Fixo</small>
        </button>

        <button onClick={() => setSheet?.('ia')} aria-label="Conversar com a NIIL">
          <span className="niil-home-v3-quick-icon niil-home-v3-quick-orb"><NIILOrb state="idle" size={32} label="NIIL IA"/></span><b>NIIL</b><small>Conversar</small>
        </button>
      </div>

      <section className="niil-home-v3-agenda">
        <div className="niil-home-v3-section-head">
          <div><span>Agenda</span><small>{totalMissao ? `${feitasMissao} de ${totalMissao} concluídas hoje` : 'Hoje'}</small></div>
          <button onClick={abrirAgenda}>Ver tudo <ChevronRight size={16} /></button>
        </div>

        {agendaPreview.length ? (
          <div className="niil-home-v3-agenda-list">
            {agendaPreview.map((item) => (
              <button key={item.id} className={item.feito ? 'done' : ''} onClick={() => abrirItemAgenda(item)}>
                <span className="niil-home-v3-agenda-time">{item.hora}</span><i className="niil-home-v3-agenda-dot" />
                <span className="niil-home-v3-agenda-icon">{item.origem === 'curso' ? <BookOpen size={16} /> : <CalendarDays size={16} />}</span>
                <span className="niil-home-v3-agenda-copy"><b>{item.titulo}</b><small>{item.detalhe}</small></span>
                {item.feito ? <CheckCircle2 size={18} /> : <ChevronRight size={18} />}
              </button>
            ))}
          </div>
        ) : (
          <button className="niil-home-v3-empty" onClick={abrirAgenda}>
            <CalendarDays size={21} /><span><b>Seu dia está livre por enquanto.</b><small>Abra a agenda para organizar o próximo compromisso.</small></span><ChevronRight size={18} />
          </button>
        )}

        <div className="niil-home-v3-mission-progress">
          <span>Missão do dia</span><div><i style={{ width: `${pctMissao}%` }} /></div><strong>{pctMissao}%</strong>
        </div>
      </section>
    </section>
  );
}
