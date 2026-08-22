import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

/* ══════════ STORAGE ══════════ */
const memoria = {};
export const store = {
  async get(k) {
    try {
      if (typeof window !== 'undefined' && window.storage) { const r = await window.storage.get(k, false); return r ? JSON.parse(r.value) : null; }
      if (typeof window !== 'undefined' && window.localStorage) { const v = window.localStorage.getItem(k); return v ? JSON.parse(v) : null; }
      return memoria[k] ?? null;
    } catch { return memoria[k] ?? null; }
  },
  async set(k, v) {
    memoria[k] = v;
    try {
      if (typeof window !== 'undefined' && window.storage) { await window.storage.set(k, JSON.stringify(v), false); return true; }
      if (typeof window !== 'undefined' && window.localStorage) { window.localStorage.setItem(k, JSON.stringify(v)); return true; }
      return true;
    } catch { return false; }
  }
};

export const C = {
  /* base 60% */
  bg: '#F7F8F6', card: '#FFFFFF', petroleo: '#075B59', petroleoEsc: '#054845', carvao: '#0B1416',
  ink: '#0F3A38', ink2: '#485563', ink3: '#8FA0A8', line: '#E6E9EC',
  /* informação 25% */
  azul: '#2563FF', aqua: '#00E6D2', aquaSuave: '#E6FBF8',
  /* progresso 7% */
  lima: '#A8FF00', limaSuave: '#F1FFDB',
  /* atenção 5% */
  lilas: '#C084FC',
  /* destaque 5% */
  roxo: '#8E2DE2', roxoEletrico: '#5D00FF',
  /* aliases semânticos usados no app */
  get green() { return this.petroleo }, get greenDark() { return this.petroleoEsc },
  get mint() { return this.aquaSuave }, get sky() { return this.azul },
  get gold() { return this.lima }, get coral() { return this.lilas }, get lilac() { return this.roxo }
};

/* texto legível sobre qualquer cor da paleta */
export const CLARAS = ['#A8FF00', '#00E6D2', '#C084FC', '#F1FFDB', '#E6FBF8', '#F7F8F6', '#FFFFFF', '#fff', '#FFF'];
export const sobre = (cor) => CLARAS.includes(cor) ? C.ink : '#fff';

export const hoje = () => new Date().toISOString().split('T')[0];

/* ══════════ CSS de animação ══════════ */
export const CSS = `
@keyframes zoeSurge{0%{opacity:0;transform:translateY(14px) scale(.94)}100%{opacity:1;transform:none}}
@keyframes zoeFade{0%{opacity:0}100%{opacity:1}}
@keyframes zoeBarra{0%{transform:scaleY(0)}100%{transform:scaleY(1)}}
@keyframes zoePonto{0%{opacity:0;transform:scale(0)}100%{opacity:1;transform:scale(1)}}
@keyframes zoeTracar{to{stroke-dashoffset:0}}
@keyframes zoePontoLogo{0%{opacity:0;transform:scale(0) translateY(7px)}100%{opacity:1;transform:scale(1) translateY(0)}}
@keyframes zoeCelebra{0%{opacity:0;transform:translateY(20px) scale(.82) rotate(-3deg)}55%{transform:translateY(-5px) scale(1.05) rotate(2deg)}100%{opacity:1;transform:none}}
@keyframes zoePulso{0%,100%{box-shadow:0 0 0 0 rgba(168,255,0,0)}50%{box-shadow:0 0 0 12px rgba(168,255,0,.16)}}
.zoe-surge{animation:zoeSurge .42s cubic-bezier(.22,1,.36,1) both}
.zoe-barra{transform-origin:bottom;animation:zoeBarra .6s cubic-bezier(.22,1,.36,1) both}
.zoe-fade{animation:zoeFade .5s ease both}
.zoe-celebra{animation:zoeCelebra .72s cubic-bezier(.22,1.25,.36,1) both,zoePulso 1.8s ease .75s 2}
@media (prefers-reduced-motion:reduce){
  .zoe-surge,.zoe-barra,.zoe-fade,.zoe-celebra{animation:none!important}
  .zoe-barra{transform:none!important}
}
`;

/* ══════════ UI BASE ══════════ */
export const Card = ({ children, style, onClick, cls = '', delay = 0 }) => (
  <div onClick={onClick} className={cls}
    style={{ background: C.card, borderRadius: 20, padding: 16, boxShadow: '0 1px 3px rgba(27,58,75,.06)', animationDelay: `${delay}ms`, ...style }}>
    {children}
  </div>
);

export const Btn = ({ children, onClick, variante = 'solid', cor = C.green, style, disabled }) => (
  <button onClick={onClick} disabled={disabled} style={{
    padding: '12px 18px', borderRadius: 14, fontWeight: 700, fontSize: 14, cursor: disabled ? 'not-allowed' : 'pointer',
    border: variante === 'outline' ? `1.5px solid ${cor}` : 'none',
    background: variante === 'outline' ? 'transparent' : cor,
    color: variante === 'outline' ? cor : sobre(cor), opacity: disabled ? .4 : 1, fontFamily: 'inherit', ...style
  }}>{children}</button>
);

export const Campo = ({ label, ...p }) => (
  <div style={{ marginBottom: 12 }}>
    {label && <label style={{ fontSize: 12, fontWeight: 700, color: C.ink2, display: 'block', marginBottom: 6 }}>{label}</label>}
    <input {...p} style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1.5px solid ${C.line}`, fontSize: 15, color: C.ink, fontFamily: 'inherit', outline: 'none', background: '#FAFCFB', ...p.style }} />
  </div>
);

export const Area = ({ label, ...p }) => (
  <div style={{ marginBottom: 12 }}>
    {label && <label style={{ fontSize: 12, fontWeight: 700, color: C.ink2, display: 'block', marginBottom: 6 }}>{label}</label>}
    <textarea {...p} style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1.5px solid ${C.line}`, fontSize: 15, color: C.ink, fontFamily: 'inherit', outline: 'none', background: '#FAFCFB', resize: 'vertical', minHeight: 88, ...p.style }} />
  </div>
);

export const Barra = ({ v, max, cor, h = 8 }) => (
  <div style={{ height: h, background: '#EDF2F0', borderRadius: 99, overflow: 'hidden' }}>
    <div style={{ height: '100%', width: `${Math.min(100, (v / (max || 1)) * 100)}%`, background: cor, borderRadius: 99, transition: 'width .5s cubic-bezier(.22,1,.36,1)' }} />
  </div>
);

export const Sheet = ({ aberto, fechar, titulo, children }) => aberto ? (
  <div onClick={fechar} style={{ position: 'fixed', inset: 0, background: 'rgba(11,20,22,.42)', zIndex: 90, display: 'flex', alignItems: 'flex-end' }}>
    <div onClick={e => e.stopPropagation()} className="zoe-surge" style={{ background: C.card, width: '100%', maxHeight: '88vh', overflowY: 'auto', borderRadius: '26px 26px 0 0', padding: 20, paddingBottom: 32 }}>
      <div style={{ width: 40, height: 4, background: C.line, borderRadius: 99, margin: '0 auto 16px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: C.ink, margin: 0 }}>{titulo}</h2>
        <button onClick={fechar} style={{ background: '#F2F5F4', border: 'none', borderRadius: 99, width: 34, height: 34, cursor: 'pointer', color: C.ink2 }}><X size={18} /></button>
      </div>
      {children}
    </div>
  </div>
) : null;

/* ══════════ WORDMARK zoë ══════════ */
/* traçados geométricos da marca: z reto, o circular, e de terminal aberto, trema lima */
export function Wordmark({ altura = 54, cor = C.ink, corPontos = C.lima, animar = false, atraso = 0 }) {
  const traco = 4.4;
  const comum = { fill: 'none', stroke: cor, strokeWidth: traco, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const anim = (i) => animar ? {
    strokeDasharray: 260, strokeDashoffset: 260,
    animation: `zoeTracar .85s cubic-bezier(.6,.05,.3,1) ${atraso + i * 0.16}s forwards`
  } : {};
  return (
    <svg viewBox="-6 -18 172 70" style={{ height: altura, display: 'block', overflow: 'visible' }} aria-label="zoë">
      <path d="M 4,5 L 40,5 L 4,45 L 42,45" {...comum} style={anim(0)} />
      <circle cx="76" cy="25" r="20" {...comum} style={anim(1)} />
      <path d="M 112,25 L 152,25 A 20,20 0 1 0 147,37" {...comum} style={anim(2)} />
      {[124.5, 141].map((cx, i) => (
        <circle key={cx} cx={cx} cy="-5" r="5.2" fill={corPontos}
          style={animar ? { opacity: 0, transformOrigin: `${cx}px -5px`, animation: `zoePontoLogo .45s cubic-bezier(.34,1.56,.64,1) ${atraso + .72 + i * .1}s forwards` } : {}} />
      ))}
    </svg>
  );
}

/* miniatura que busca a imagem no armazenamento sob demanda */
const cacheFotos = new Map();
export function Foto({ id, email, style, onClick, alt = '' }) {
  const [src, setSrc] = useState(() => cacheFotos.get(id) || null);
  useEffect(() => {
    if (cacheFotos.has(id)) { setSrc(cacheFotos.get(id)); return; }
    let vivo = true;
    store.get(`zoe:foto:${email}:${id}`).then(v => {
      if (v && vivo) { cacheFotos.set(id, v); setSrc(v); }
    });
    return () => { vivo = false; };
  }, [id, email]);
  const base = { objectFit: 'cover', display: 'block', background: C.line, ...style };
  return src
    ? <img src={src} alt={alt} onClick={onClick} style={{ ...base, cursor: onClick ? 'pointer' : 'default' }} />
    : <div onClick={onClick} style={base} />;
}

/* ══════════ GRÁFICOS ANIMADOS ══════════ */
export function GraficoBarras({ dados, max, cor, altura = 110, rotulos }) {
  const [pronto, setPronto] = useState(false);
  useEffect(() => { const t = setTimeout(() => setPronto(true), 40); return () => clearTimeout(t); }, []);
  const m = max || Math.max(1, ...dados);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: altura }}>
        {dados.map((v, i) => (
          <div key={i} style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'flex-end' }}>
            <div className={pronto ? 'zoe-barra' : ''} style={{
              width: '100%', height: `${Math.max(3, (v / m) * 100)}%`,
              background: v > 0 ? cor : '#EDF2F0', borderRadius: '6px 6px 3px 3px',
              animationDelay: `${i * 45}ms`, opacity: pronto ? 1 : 0
            }} />
          </div>
        ))}
      </div>
      {rotulos && <div style={{ display: 'flex', gap: 3, marginTop: 7 }}>
        {rotulos.map((r, i) => <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 10, color: C.ink3 }}>{r}</div>)}
      </div>}
    </div>
  );
}

export function GraficoLinha({ dados, cor, altura = 120 }) {
  const [pronto, setPronto] = useState(false);
  useEffect(() => { const t = setTimeout(() => setPronto(true), 60); return () => clearTimeout(t); }, []);
  const L = 300, A = altura;
  const max = Math.max(1, ...dados);
  const pts = dados.map((v, i) => [
    dados.length > 1 ? (i / (dados.length - 1)) * (L - 16) + 8 : L / 2,
    A - 10 - (v / max) * (A - 26)
  ]);
  const dPath = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const dArea = `${dPath} L${pts[pts.length - 1][0].toFixed(1)},${A} L${pts[0][0].toFixed(1)},${A} Z`;
  return (
    <svg viewBox={`0 0 ${L} ${A}`} style={{ width: '100%', height: altura, overflow: 'visible' }}>
      <defs>
        <linearGradient id={`g${cor.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={cor} stopOpacity=".28" />
          <stop offset="100%" stopColor={cor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={dArea} fill={`url(#g${cor.slice(1)})`} style={{ animation: pronto ? 'zoeFade .8s ease .5s both' : 'none', opacity: 0 }} />
      <path d={dPath} fill="none" stroke={cor} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"
        style={{
          strokeDasharray: 900, strokeDashoffset: pronto ? 0 : 900,
          transition: 'stroke-dashoffset 1.1s cubic-bezier(.22,1,.36,1)'
        }} />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="3.4" fill="#fff" stroke={cor} strokeWidth="2.2"
          style={{ opacity: 0, animation: pronto ? `zoePonto .3s ease ${.5 + i * .07}s both` : 'none' }} />
      ))}
    </svg>
  );
}
