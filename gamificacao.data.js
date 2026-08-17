/* ══════════ Metas de exercício/dieta com recompensa ══════════
   Cada meta é avaliada por uma sequência de dias consecutivos (streak)
   cumprindo um critério já rastreado em d.dias (treino, água, calorias).
   Ao bater o alvo, a recompensa é liberada — mesmo padrão booleano de
   `liberada(id)` já usado na Trilha (App.jsx). */

export const METAS_PADRAO = [
  { id: 'm-treino7', titulo: '7 dias seguidos de treino', tipo: 'treino', alvoDias: 7, recompensa: 'Badge "Consistência" + bônus na Trilha' },
  { id: 'm-agua5', titulo: '5 dias seguidos batendo a meta de água', tipo: 'agua', alvoDias: 5, recompensa: 'Badge "Hidratada"' },
  { id: 'm-kcal10', titulo: '10 dias seguidos dentro da meta de calorias', tipo: 'kcal', alvoDias: 10, recompensa: 'Badge "Equilíbrio"' }
];

export function criterioCumprido(meta, dia, perfil) {
  if (!dia) return false;
  if (meta.tipo === 'treino') return (dia.treino || 0) > 0;
  if (meta.tipo === 'agua') return (dia.agua || 0) >= (perfil.metaAgua || 0);
  if (meta.tipo === 'kcal') return (dia.kcal || 0) > 0 && (dia.kcal || 0) <= (perfil.metaKcal || Infinity);
  return false;
}
