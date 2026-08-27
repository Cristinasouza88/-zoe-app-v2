import React, { useState } from 'react';
import { Check, Circle, ExternalLink, ChevronDown, ChevronRight, Languages } from 'lucide-react';
import { C, Card, Btn, Barra, hoje } from './ui.jsx';
import {
  FASES, totalAulasIngles, ROTINA_SEMANAL, RITMOS, DESAFIOS,
  CHECK_DIARIO, CHECK_SEMANAL, LINKS_OUTROS, PAINEL_URL
} from './ingles.data';

const vazio = { fasesConcluidas: {}, desafiosMarcados: {}, ritmo: 'padrao', checkDiario: {}, checkSemanal: {} };

const LinhaCheck = ({ marcado, onClick, children }) => (
  <div onClick={onClick} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '9px 0', borderBottom: `1px dashed ${C.line}`, cursor: 'pointer' }}>
    {marcado ? <Check size={18} color={C.greenDark} /> : <Circle size={18} color={C.ink3} />}
    <span style={{ fontSize: 14, color: marcado ? C.ink3 : C.ink, textDecoration: marcado ? 'line-through' : 'none' }}>{children}</span>
  </div>
);

export default function Ingles({ d, up, aviso }) {
  const ing = { ...vazio, ...d.ingles };
  const [linksAbertos, setLinksAbertos] = useState(false);

  const atualizar = (fn) => up(s => ({ ...s, ingles: fn({ ...vazio, ...s.ingles }) }));

  const alternarFase = (id) => atualizar(ig => ({ ...ig, fasesConcluidas: { ...ig.fasesConcluidas, [id]: !ig.fasesConcluidas[id] } }));
  const alternarDesafio = (id) => atualizar(ig => ({ ...ig, desafiosMarcados: { ...ig.desafiosMarcados, [id]: !ig.desafiosMarcados[id] } }));
  const setRitmo = (id) => atualizar(ig => ({ ...ig, ritmo: id }));

  const aulasConcluidas = FASES.reduce((a, f) => a + (ing.fasesConcluidas[f.id] ? f.aulas : 0), 0);
  const ritmoAtual = RITMOS.find(r => r.id === ing.ritmo) || RITMOS[1];

  const diaChave = hoje();
  const checkHoje = ing.checkDiario[diaChave] || [];
  const alternarCheckDiario = (i) => atualizar(ig => {
    const arr = [...(ig.checkDiario[diaChave] || [])];
    arr[i] = !arr[i];
    return { ...ig, checkDiario: { ...ig.checkDiario, [diaChave]: arr } };
  });
  const semanaChave = `${new Date().getFullYear()}-S${Math.ceil((new Date().getDate()) / 7)}-${new Date().getMonth()}`;
  const checkSemanaAtual = ing.checkSemanal[semanaChave] || [];
  const alternarCheckSemanal = (i) => atualizar(ig => {
    const arr = [...(ig.checkSemanal[semanaChave] || [])];
    arr[i] = !arr[i];
    return { ...ig, checkSemanal: { ...ig.checkSemanal, [semanaChave]: arr } };
  });

  return (
    <div style={{ padding: '20px 16px 100px', maxWidth: 520, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <Languages size={22} color={C.greenDark} />
        <h1 style={{ fontSize: 24, fontWeight: 800, color: C.ink, margin: 0 }}>Inglês</h1>
      </div>
      <p style={{ color: C.ink2, fontSize: 14, margin: '0 0 18px' }}>Fluency Academy — trilha principal + complementares</p>

      <Card cls="niil-surge" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.ink2, marginBottom: 6 }}>Progresso da trilha principal</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: C.ink, marginBottom: 10 }}>{aulasConcluidas} <span style={{ fontSize: 15, fontWeight: 600, color: C.ink3 }}>/ {totalAulasIngles} aulas</span></div>
        <Barra v={aulasConcluidas} max={totalAulasIngles} cor={C.gold} />
        <a href={PAINEL_URL} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, fontSize: 13, fontWeight: 700, color: C.greenDark, textDecoration: 'none' }}>
          Abrir Fluency Academy <ExternalLink size={14} />
        </a>
      </Card>

      <Card cls="niil-surge" delay={40} style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.ink2, marginBottom: 10 }}>Seu ritmo</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: ritmoAtual ? 10 : 0 }}>
          {RITMOS.map(r => (
            <button key={r.id} onClick={() => setRitmo(r.id)} style={{
              flex: 1, padding: '9px 8px', borderRadius: 12, border: `1.5px solid ${ing.ritmo === r.id ? C.green : C.line}`,
              background: ing.ritmo === r.id ? C.green : 'transparent', color: ing.ritmo === r.id ? C.ink : C.ink2,
              fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit'
            }}>{r.nome}</button>
          ))}
        </div>
        <div style={{ fontSize: 12.5, color: C.ink3 }}>{ritmoAtual.resumo}</div>
      </Card>

      <h2 style={{ fontSize: 16, fontWeight: 800, color: C.ink, margin: '4px 0 10px' }}>Fases</h2>
      {FASES.map((f, i) => {
        const feita = !!ing.fasesConcluidas[f.id];
        return (
          <Card key={f.id} cls="niil-surge" delay={i * 40} style={{ marginBottom: 12, opacity: feita ? .75 : 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: C.ink }}>{f.nome}</div>
                <div style={{ fontSize: 12, color: C.ink3, marginTop: 2 }}>{f.aulas} aulas · {f.horas} · {f.unidades} unidades</div>
              </div>
              <button onClick={() => alternarFase(f.id)} style={{
                width: 30, height: 30, borderRadius: 99, border: 'none', flexShrink: 0,
                background: feita ? C.gold : '#EDF2F0', color: feita ? C.ink : C.ink3, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}><Check size={16} /></button>
            </div>
            <p style={{ fontSize: 13.5, color: C.ink2, margin: '10px 0' }}>{f.resumo}</p>
            <a href={f.link} target="_blank" rel="noreferrer" style={{ fontSize: 13, fontWeight: 700, color: C.greenDark, textDecoration: 'none' }}>Abrir {f.nome} →</a>
            {f.complementares.length > 0 && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px dashed ${C.line}` }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: C.ink3, textTransform: 'uppercase', letterSpacing: .04, marginBottom: 8 }}>Complementares desta fase</div>
                {f.complementares.map(c => (
                  <a key={c.titulo} href={c.link} target="_blank" rel="noreferrer" style={{ display: 'block', fontSize: 13, color: C.ink, textDecoration: 'none', padding: '5px 0' }}>
                    <span style={{ fontWeight: 700, color: C.sky }}>{c.titulo}</span> — {c.aulas} aulas · {c.horas}{c.desc ? ` · ${c.desc}` : ''}
                  </a>
                ))}
              </div>
            )}
          </Card>
        );
      })}

      <h2 style={{ fontSize: 16, fontWeight: 800, color: C.ink, margin: '18px 0 10px' }}>Rotina semanal — ritmo {ritmoAtual.nome}</h2>
      <Card style={{ marginBottom: 16 }}>
        {ing.ritmo === 'padrao'
          ? ROTINA_SEMANAL.map(r => (
            <div key={r.dia} style={{ display: 'grid', gridTemplateColumns: '84px 1fr', gap: 10, padding: '9px 0', borderBottom: `1px dashed ${C.line}` }}>
              <div style={{ fontWeight: 800, fontSize: 12, color: C.lilac, textTransform: 'uppercase' }}>{r.dia}</div>
              <div style={{ fontSize: 13, color: C.ink2 }}>{r.texto}</div>
            </div>
          ))
          : <p style={{ fontSize: 13.5, color: C.ink2, margin: 0 }}>{ritmoAtual.detalhe}</p>}
      </Card>

      <h2 style={{ fontSize: 16, fontWeight: 800, color: C.ink, margin: '18px 0 10px' }}>Desafios</h2>
      <Card style={{ marginBottom: 16 }}>
        {DESAFIOS.map(des => (
          <div key={des.id} style={{ padding: '10px 0', borderBottom: `1px dashed ${C.line}` }}>
            <div onClick={() => alternarDesafio(des.id)} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer' }}>
              {ing.desafiosMarcados[des.id] ? <Check size={18} color={C.greenDark} style={{ marginTop: 2, flexShrink: 0 }} /> : <Circle size={18} color={C.ink3} style={{ marginTop: 2, flexShrink: 0 }} />}
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 800, color: C.lilac, textTransform: 'uppercase', letterSpacing: .04 }}>{des.freq}</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: ing.desafiosMarcados[des.id] ? C.ink3 : C.ink }}>{des.titulo}</div>
                <div style={{ fontSize: 12.5, color: C.ink3 }}>{des.desc}</div>
              </div>
            </div>
          </div>
        ))}
      </Card>

      <h2 style={{ fontSize: 16, fontWeight: 800, color: C.ink, margin: '18px 0 10px' }}>Check de hoje</h2>
      <Card style={{ marginBottom: 16 }}>
        {CHECK_DIARIO.map((txt, i) => (
          <LinhaCheck key={i} marcado={!!checkHoje[i]} onClick={() => alternarCheckDiario(i)}>{txt}</LinhaCheck>
        ))}
      </Card>

      <h2 style={{ fontSize: 16, fontWeight: 800, color: C.ink, margin: '18px 0 10px' }}>Check semanal</h2>
      <Card style={{ marginBottom: 16 }}>
        {CHECK_SEMANAL.map((txt, i) => (
          <LinhaCheck key={i} marcado={!!checkSemanaAtual[i]} onClick={() => alternarCheckSemanal(i)}>{txt}</LinhaCheck>
        ))}
      </Card>

      <Card onClick={() => setLinksAbertos(v => !v)} style={{ cursor: 'pointer' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: C.ink }}>Outros links úteis</div>
          {linksAbertos ? <ChevronDown size={18} color={C.ink3} /> : <ChevronRight size={18} color={C.ink3} />}
        </div>
        {linksAbertos && (
          <div style={{ marginTop: 10 }}>
            {LINKS_OUTROS.map(l => (
              <a key={l.titulo} href={l.link} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                style={{ display: 'block', padding: '7px 0', borderBottom: `1px dashed ${C.line}`, textDecoration: 'none' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.sky }}>{l.titulo}</div>
                <div style={{ fontSize: 12, color: C.ink3 }}>{l.desc}</div>
              </a>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
