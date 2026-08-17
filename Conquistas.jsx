import React from 'react';
import { Trophy, Lock, Check } from 'lucide-react';
import { C, Card, Barra } from './ui.jsx';
import { METAS_PADRAO, criterioCumprido } from './gamificacao.data';

const dataISO = (offsetDias) => {
  const d = new Date();
  d.setDate(d.getDate() - offsetDias);
  return d.toISOString().split('T')[0];
};

function streakAtual(meta, dias, perfil) {
  let n = 0;
  for (let i = 0; i < 60; i++) {
    const dia = dias[dataISO(i)];
    if (criterioCumprido(meta, dia, perfil)) n++;
    else break;
  }
  return n;
}

export default function Conquistas({ d }) {
  return (
    <div style={{ padding: '20px 16px 100px', maxWidth: 520, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <Trophy size={22} color={C.gold} />
        <h1 style={{ fontSize: 24, fontWeight: 800, color: C.ink, margin: 0 }}>Conquistas</h1>
      </div>
      <p style={{ color: C.ink2, fontSize: 14, margin: '0 0 18px' }}>Bata a sequência de dias e desbloqueie a recompensa.</p>

      {METAS_PADRAO.map((meta, i) => {
        const streak = streakAtual(meta, d.dias, d.perfil);
        const liberada = streak >= meta.alvoDias;
        return (
          <Card key={meta.id} cls="zoe-surge" delay={i * 40} style={{ marginBottom: 12, opacity: liberada ? 1 : .9 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: C.ink }}>{meta.titulo}</div>
              {liberada
                ? <div style={{ width: 30, height: 30, borderRadius: 99, background: C.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Check size={16} color={C.ink} /></div>
                : <div style={{ width: 30, height: 30, borderRadius: 99, background: '#EDF2F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Lock size={14} color={C.ink3} /></div>}
            </div>
            <div style={{ margin: '10px 0 6px' }}><Barra v={streak} max={meta.alvoDias} cor={liberada ? C.gold : C.sky} /></div>
            <div style={{ fontSize: 12, color: C.ink3, marginBottom: 8 }}>{streak} / {meta.alvoDias} dias seguidos</div>
            <div style={{
              fontSize: 13, fontWeight: 700, padding: '8px 12px', borderRadius: 10,
              background: liberada ? C.limaSuave : C.bg, color: liberada ? C.ink : C.ink3
            }}>{liberada ? `Desbloqueado: ${meta.recompensa}` : `Recompensa: ${meta.recompensa}`}</div>
          </Card>
        );
      })}
    </div>
  );
}
