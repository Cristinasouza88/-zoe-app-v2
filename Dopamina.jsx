import React, { useState } from 'react';
import { Check, Circle, ChevronDown, ChevronRight, ExternalLink, Flame } from 'lucide-react';
import { C, Card, Barra } from './ui.jsx';
import { SEMANAS, totalLicoesDopamina, COMUNIDADE_ANTES, COMUNIDADE_HABITO, COMUNIDADE_EXPLORAR, CLUBE_DO_LIVRO, EVENTOS_FINAL_SEMANA } from './dopamina.data';

const vazio = { licoes: {}, comunidade: {}, semanasAbertas: { sem1: true } };

export default function Dopamina({ d, up }) {
  const dop = { ...vazio, ...d.dopamina };
  const [abertas, setAbertas] = useState(dop.semanasAbertas || { sem1: true });

  const atualizar = (fn) => up(s => ({ ...s, dopamina: fn({ ...vazio, ...s.dopamina }) }));
  const alternarLicao = (id) => atualizar(dp => ({ ...dp, licoes: { ...dp.licoes, [id]: !dp.licoes[id] } }));
  const alternarComunidade = (chave) => atualizar(dp => ({ ...dp, comunidade: { ...dp.comunidade, [chave]: !dp.comunidade[chave] } }));
  const alternarSemana = (id) => setAbertas(a => ({ ...a, [id]: !a[id] }));

  const concluidas = Object.values(dop.licoes).filter(Boolean).length;

  return (
    <div style={{ padding: '20px 16px 100px', maxWidth: 520, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <Flame size={22} color={C.coral} />
        <h1 style={{ fontSize: 24, fontWeight: 800, color: C.ink, margin: 0 }}>Reservatório de Dopamina</h1>
      </div>
      <p style={{ color: C.ink2, fontSize: 14, margin: '0 0 18px' }}>Trilha cronológica · 12 semanas · 3 aulas por dia útil</p>

      <Card cls="niil-surge" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.ink2, marginBottom: 6 }}>Progresso da trilha</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: C.ink, marginBottom: 10 }}>{concluidas} <span style={{ fontSize: 15, fontWeight: 600, color: C.ink3 }}>/ {totalLicoesDopamina} aulas</span></div>
        <Barra v={concluidas} max={totalLicoesDopamina} cor={C.coral} />
      </Card>

      <h2 style={{ fontSize: 16, fontWeight: 800, color: C.ink, margin: '4px 0 10px' }}>Comunidade RD (Jugular)</h2>
      <Card style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11.5, fontWeight: 800, color: C.ink3, textTransform: 'uppercase', letterSpacing: .04, marginBottom: 8 }}>Antes de começar (uma vez só)</div>
        {COMUNIDADE_ANTES.map(t => (
          <LinhaTarefa key={t.titulo} marcado={!!dop.comunidade[t.titulo]} onToggle={() => alternarComunidade(t.titulo)} titulo={t.titulo} link={t.link} />
        ))}
        <div style={{ fontSize: 11.5, fontWeight: 800, color: C.ink3, textTransform: 'uppercase', letterSpacing: .04, margin: '14px 0 8px' }}>Hábito semanal (~15 min)</div>
        {COMUNIDADE_HABITO.map(t => (
          <LinhaTarefa key={t.titulo} marcado={!!dop.comunidade[t.titulo]} onToggle={() => alternarComunidade(t.titulo)} titulo={t.titulo} link={t.link} />
        ))}
        <div style={{ fontSize: 11.5, fontWeight: 800, color: C.ink3, textTransform: 'uppercase', letterSpacing: .04, margin: '14px 0 8px' }}>Espaços para explorar quando quiser</div>
        {COMUNIDADE_EXPLORAR.map(t => (
          <a key={t.titulo} href={t.link} target="_blank" rel="noreferrer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: `1px dashed ${C.line}`, textDecoration: 'none', color: C.ink }}>
            <span style={{ fontSize: 13.5 }}>{t.titulo}</span><ExternalLink size={14} color={C.ink3} />
          </a>
        ))}
        <div style={{ fontSize: 11.5, fontWeight: 800, color: C.ink3, textTransform: 'uppercase', letterSpacing: .04, margin: '14px 0 8px' }}>Clube do Livro</div>
        <a href={CLUBE_DO_LIVRO.link} target="_blank" rel="noreferrer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', textDecoration: 'none', color: C.ink }}>
          <span style={{ fontSize: 13.5 }}>{CLUBE_DO_LIVRO.titulo}</span><ExternalLink size={14} color={C.ink3} />
        </a>
        <div style={{ fontSize: 12, color: C.ink3, marginTop: 4 }}>Os próximos encontros já estão marcados nas semanas 3 e 8, abaixo.</div>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11.5, fontWeight: 800, color: C.ink3, textTransform: 'uppercase', letterSpacing: .04, marginBottom: 8 }}>Eventos de fim de semana (Corre RD)</div>
        {EVENTOS_FINAL_SEMANA.map(ev => (
          <a key={ev.data} href={ev.link} target="_blank" rel="noreferrer" style={{ display: 'block', padding: '8px 10px', borderRadius: 10, background: C.mint, textDecoration: 'none', marginBottom: 8 }}>
            <div style={{ fontSize: 13, color: C.ink, fontWeight: 700 }}>{ev.data} · {ev.hora}</div>
            <div style={{ fontSize: 12.5, color: C.ink2 }}>{ev.texto}</div>
          </a>
        ))}
        <div style={{ fontSize: 12, color: C.ink3 }}>Fora do ritmo de segunda a sexta — participe se topar. Confirme sempre na Agenda, pois local e horário podem mudar.</div>
      </Card>

      <h2 style={{ fontSize: 16, fontWeight: 800, color: C.ink, margin: '4px 0 10px' }}>Semanas</h2>
      {SEMANAS.map((sem, i) => {
        const feitasNaSemana = sem.dias.reduce((a, di) => a + di.licoes.filter(l => dop.licoes[l.id]).length, 0);
        const totalNaSemana = sem.dias.reduce((a, di) => a + di.licoes.length, 0);
        const aberta = !!abertas[sem.id];
        return (
          <Card key={sem.id} cls="niil-surge" delay={i * 25} style={{ marginBottom: 12, padding: 0, overflow: 'hidden' }}>
            <div onClick={() => alternarSemana(sem.id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, cursor: 'pointer' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: C.ink }}>{sem.titulo}</div>
                <div style={{ fontSize: 12, color: C.ink3 }}>{sem.intervalo} · {feitasNaSemana}/{totalNaSemana} aulas</div>
              </div>
              {aberta ? <ChevronDown size={20} color={C.ink3} /> : <ChevronRight size={20} color={C.ink3} />}
            </div>
            {aberta && (
              <div style={{ padding: '0 16px 16px' }}>
                {sem.dias.map(di => (
                  <div key={di.dia} style={{ paddingTop: 10, borderTop: `1px solid ${C.line}`, marginTop: 4 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: C.ink3, textTransform: 'uppercase', letterSpacing: .04, marginBottom: 6 }}>{di.dia} · {di.data}</div>
                    {di.evento && (
                      <a href={di.evento.link} target="_blank" rel="noreferrer" style={{ display: 'block', padding: '7px 10px', borderRadius: 10, background: C.limaSuave, textDecoration: 'none', marginBottom: 8 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: C.ink }}>{di.evento.hora} — {di.evento.texto}</div>
                      </a>
                    )}
                    {di.licoes.map(l => {
                      const feita = !!dop.licoes[l.id];
                      return (
                        <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0' }}>
                          <div onClick={() => alternarLicao(l.id)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                            {feita ? <Check size={18} color={C.green} style={{ flexShrink: 0 }} /> : <Circle size={18} color={C.ink3} style={{ flexShrink: 0 }} />}
                            <span style={{ fontSize: 10.5, fontWeight: 800, color: C.ink3, background: C.bg, borderRadius: 6, padding: '2px 5px', flexShrink: 0 }}>{l.num}</span>
                            <span style={{ fontSize: 13.5, color: feita ? C.ink3 : C.ink, textDecoration: feita ? 'line-through' : 'none' }}>{l.titulo}</span>
                          </div>
                          <a href={l.url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{
                            flexShrink: 0, fontSize: 11.5, fontWeight: 700, color: '#fff', background: C.coral, padding: '5px 10px', borderRadius: 8, textDecoration: 'none'
                          }}>Assistir →</a>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

function LinhaTarefa({ marcado, onToggle, titulo, link }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: `1px dashed ${C.line}` }}>
      <div onClick={onToggle} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
        {marcado ? <Check size={17} color={C.green} /> : <Circle size={17} color={C.ink3} />}
        <span style={{ fontSize: 13.5, color: marcado ? C.ink3 : C.ink, textDecoration: marcado ? 'line-through' : 'none' }}>{titulo}</span>
      </div>
      <a href={link} target="_blank" rel="noreferrer" style={{ fontSize: 11, fontWeight: 700, color: C.ink, background: C.bg, border: `1px solid ${C.line}`, padding: '4px 9px', borderRadius: 7, textDecoration: 'none', flexShrink: 0 }}>Abrir</a>
    </div>
  );
}
