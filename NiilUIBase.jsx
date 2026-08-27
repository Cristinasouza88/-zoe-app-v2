import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

/* ══════════ STORAGE ══════════ */
const memoria = {};
const NIIL_DB='niil-persist-v2',NIIL_STORE='kv';
let niilDbPromise=null;

const abrirNIILDb=()=>{
  if(typeof indexedDB==='undefined')return Promise.resolve(null);
  if(niilDbPromise)return niilDbPromise;
  niilDbPromise=new Promise((resolve,reject)=>{
    const req=indexedDB.open(NIIL_DB,1);
    req.onupgradeneeded=()=>{
      const db=req.result;
      if(!db.objectStoreNames.contains(NIIL_STORE))db.createObjectStore(NIIL_STORE);
    };
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });
  return niilDbPromise;
};

const idbGet=async k=>{
  const db=await abrirNIILDb();
  if(!db)return null;
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(NIIL_STORE,'readonly');
    const req=tx.objectStore(NIIL_STORE).get(k);
    req.onsuccess=()=>resolve(req.result??null);
    req.onerror=()=>reject(req.error);
  });
};

const idbSet=async(k,v)=>{
  const db=await abrirNIILDb();
  if(!db)return false;
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(NIIL_STORE,'readwrite');
    tx.objectStore(NIIL_STORE).put(v,k);
    tx.oncomplete=()=>resolve(true);
    tx.onerror=()=>reject(tx.error);
    tx.onabort=()=>reject(tx.error);
  });
};

export const store = {
  async get(k) {
    // IndexedDB é a fonte principal porque suporta estados grandes, como planilhas importadas.
    try {
      const v=await idbGet(k);
      if(v!==null&&v!==undefined){memoria[k]=v;return v}
    } catch(e){console.warn('NIIL: falha ao ler IndexedDB',e)}

    // Migra automaticamente dados antigos do localStorage para IndexedDB.
    try {
      if(typeof window!=='undefined'&&window.localStorage){
        const raw=window.localStorage.getItem(k);
        if(raw!=null){
          const v=JSON.parse(raw);
          memoria[k]=v;
          try{await idbSet(k,v)}catch{}
          return v;
        }
      }
    } catch(e){console.warn('NIIL: falha ao ler localStorage',e)}

    try {
      if(typeof window!=='undefined'&&window.storage){
        const r=await window.storage.get(k,false);
        if(r?.value!=null){
          const v=JSON.parse(r.value);
          memoria[k]=v;
          try{await idbSet(k,v)}catch{}
          return v;
        }
      }
    } catch(e){console.warn('NIIL: falha ao ler storage auxiliar',e)}

    return memoria[k]??null;
  },

  async set(k,v) {
    memoria[k]=v;
    let ok=false;

    // A gravação principal acontece em IndexedDB, evitando o limite pequeno do localStorage.
    try { ok=await idbSet(k,v) }
    catch(e){console.error('NIIL: falha ao gravar IndexedDB',e)}

    // Mantém cópias auxiliares quando couberem; falha de quota não invalida o salvamento principal.
    try {
      if(typeof window!=='undefined'&&window.localStorage)window.localStorage.setItem(k,JSON.stringify(v));
    } catch(e){console.warn('NIIL: localStorage cheio; IndexedDB preservou os dados',e)}

    try {
      if(typeof window!=='undefined'&&window.storage)await window.storage.set(k,JSON.stringify(v),false);
    } catch {}

    return ok;
  }
};

export const C = {
  bg: '#F7F8F5', card: '#FFFFFF', petroleo: '#17151D', petroleoEsc: '#6C9700', carvao: '#17151D',
  ink: '#17151D', ink2: '#5F5A66', ink3: '#8B8791', line: '#E7E4EA',
  azul: '#17151D', aqua: '#F3F9DB', aquaSuave: '#F3F9DB',
  lima: '#B7F20C', limaSuave: '#F3F9DB',
  lilas: '#B7F20C',
  roxo: '#17151D', roxoEletrico: '#6C9700',
  get green() { return this.lima }, get greenDark() { return this.petroleoEsc },
  get mint() { return this.aquaSuave }, get sky() { return this.petroleoEsc },
  get gold() { return this.petroleo }, get coral() { return '#FF8A3D' }, get lilac() { return this.petroleoEsc }
};

/* texto legível sobre qualquer cor da paleta */
export const CLARAS = ['#B7F20C', '#F3F9DB', '#F7F8F5', '#FF8A3D', '#FFFFFF', '#fff', '#FFF'];
export const sobre = (cor) => CLARAS.includes(cor) ? C.ink : '#fff';

export const hoje = () => new Date().toISOString().split('T')[0];

/* ══════════ CSS de animação ══════════ */
export const CSS = `
@keyframes niilSurge{0%{opacity:0;transform:translateY(14px) scale(.94)}100%{opacity:1;transform:none}}
@keyframes niilFade{0%{opacity:0}100%{opacity:1}}
@keyframes niilBarra{0%{transform:scaleY(0)}100%{transform:scaleY(1)}}
@keyframes niilPonto{0%{opacity:0;transform:scale(0)}100%{opacity:1;transform:scale(1)}}
@keyframes niilTracar{to{stroke-dashoffset:0}}
@keyframes niilPontoLogo{0%{opacity:0;transform:scale(0) translateY(7px)}100%{opacity:1;transform:scale(1) translateY(0)}}
@keyframes niilCelebra{0%{opacity:0;transform:translateY(20px) scale(.82) rotate(-3deg)}55%{transform:translateY(-5px) scale(1.05) rotate(2deg)}100%{opacity:1;transform:none}}
@keyframes niilPulso{0%,100%{box-shadow:0 0 0 0 rgba(183,242,12,0)}50%{box-shadow:0 0 0 12px rgba(183,242,12,.16)}}
@keyframes niilGira{to{transform:rotate(360deg)}}
.niil-surge{animation:niilSurge .42s cubic-bezier(.22,1,.36,1) both}
.niil-barra{transform-origin:bottom;animation:niilBarra .6s cubic-bezier(.22,1,.36,1) both}
.niil-fade{animation:niilFade .5s ease both}
.niil-celebra{animation:niilCelebra .72s cubic-bezier(.22,1.25,.36,1) both,niilPulso 1.8s ease .75s 2}
.niil-gira{animation:niilGira .85s linear infinite}
@media (prefers-reduced-motion:reduce){
  .niil-surge,.niil-barra,.niil-fade,.niil-celebra,.niil-gira{animation:none!important}
  .niil-barra{transform:none!important}
}
`;

/* ══════════ UI BASE ══════════ */
export const Card = ({ children, style, onClick, cls = '', delay = 0 }) => (
  <div onClick={onClick} className={cls}
    style={{ background: C.card, borderRadius: 22, padding: 16, border: `1px solid ${C.line}`, boxShadow: '0 8px 24px rgba(23,21,29,.045)', animationDelay: `${delay}ms`, ...style }}>
    {children}
  </div>
);

export const Btn = ({ children, onClick, variante = 'solid', cor = C.green, style, disabled }) => (
  <button onClick={onClick} disabled={disabled} style={{
    minHeight: 44, padding: '12px 18px', borderRadius: 15, fontWeight: 800, fontSize: 14, cursor: disabled ? 'not-allowed' : 'pointer',
    border: variante === 'outline' ? `1.5px solid ${cor}` : 'none',
    background: variante === 'outline' ? '#FFFFFF' : cor,
    color: variante === 'outline' ? cor : sobre(cor), opacity: disabled ? .4 : 1, fontFamily: 'inherit',
    boxShadow: variante === 'outline' ? 'none' : '0 6px 14px rgba(23,21,29,.08)', ...style
  }}>{children}</button>
);

export const Campo = ({ label, ...p }) => (
  <div style={{ marginBottom: 12 }}>
    {label && <label style={{ fontSize: 12, fontWeight: 700, color: C.ink2, display: 'block', marginBottom: 6 }}>{label}</label>}
    <input {...p} style={{ width: '100%', minHeight: 46, padding: '12px 14px', borderRadius: 14, border: `1.5px solid ${C.line}`, fontSize: 15, color: C.ink, fontFamily: 'inherit', outline: 'none', background: '#FFFFFF', boxShadow:'0 1px 0 rgba(23,21,29,.02)', ...p.style }} />
  </div>
);

export const Area = ({ label, ...p }) => (
  <div style={{ marginBottom: 12 }}>
    {label && <label style={{ fontSize: 12, fontWeight: 700, color: C.ink2, display: 'block', marginBottom: 6 }}>{label}</label>}
    <textarea {...p} style={{ width: '100%', padding: '12px 14px', borderRadius: 14, border: `1.5px solid ${C.line}`, fontSize: 15, color: C.ink, fontFamily: 'inherit', outline: 'none', background: '#FFFFFF', resize: 'vertical', minHeight: 96, ...p.style }} />
  </div>
);

export const Barra = ({ v, max, cor, h = 8 }) => (
  <div style={{ height: h, background: '#EDF2F0', borderRadius: 99, overflow: 'hidden' }}>
    <div style={{ height: '100%', width: `${Math.min(100, (v / (max || 1)) * 100)}%`, background: cor, borderRadius: 99, transition: 'width .5s cubic-bezier(.22,1,.36,1)' }} />
  </div>
);

export const Sheet = ({ aberto, fechar, titulo, children }) => aberto ? (
  <div onClick={fechar} style={{ position: 'fixed', inset: 0, background: 'rgba(23,21,29,.34)', zIndex: 90, display: 'flex', alignItems: 'flex-end', backdropFilter:'blur(4px)' }}>
    <div onClick={e => e.stopPropagation()} className="niil-surge" style={{ background: C.card, width: '100%', maxHeight: '88vh', overflowY: 'auto', borderRadius: '28px 28px 0 0', padding: 20, paddingBottom: 'calc(28px + env(safe-area-inset-bottom))', borderTop:`1px solid ${C.line}`, boxShadow:'0 -18px 48px rgba(23,21,29,.14)' }}>
      <div style={{ width: 40, height: 4, background: C.line, borderRadius: 99, margin: '0 auto 16px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: C.ink, margin: 0 }}>{titulo}</h2>
        <button onClick={fechar} style={{ background: C.aquaSuave, border: 'none', borderRadius: 12, width: 38, height: 38, cursor: 'pointer', color: C.ink, display:'grid',placeItems:'center' }}><X size={18} /></button>
      </div>
      {children}
    </div>
  </div>
) : null;

/* ══════════ WORDMARK niil ══════════ */
/* traçados geométricos da marca: z reto, o circular, e de terminal aberto, trema lima */
export function Wordmark({ altura = 54, cor = C.ink, corPontos = C.lima, animar = false, atraso = 0 }) {
  const traco = 4.4;
  const comum = { fill: 'none', stroke: cor, strokeWidth: traco, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const anim = (i) => animar ? {
    strokeDasharray: 260, strokeDashoffset: 260,
    animation: `niilTracar .85s cubic-bezier(.6,.05,.3,1) ${atraso + i * 0.16}s forwards`
  } : {};
  return (
    <svg viewBox="-6 -18 172 70" style={{ height: altura, display: 'block', overflow: 'visible' }} aria-label="niil">
      <path d="M 4,5 L 40,5 L 4,45 L 42,45" {...comum} style={anim(0)} />
      <circle cx="76" cy="25" r="20" {...comum} style={anim(1)} />
      <path d="M 112,25 L 152,25 A 20,20 0 1 0 147,37" {...comum} style={anim(2)} />
      {[124.5, 141].map((cx, i) => (
        <circle key={cx} cx={cx} cy="-5" r="5.2" fill={corPontos}
          style={animar ? { opacity: 0, transformOrigin: `${cx}px -5px`, animation: `niilPontoLogo .45s cubic-bezier(.34,1.56,.64,1) ${atraso + .72 + i * .1}s forwards` } : {}} />
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
    store.get(`niil:foto:${email}:${id}`).then(v => {
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
            <div className={pronto ? 'niil-barra' : ''} style={{
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
      <path d={dArea} fill={`url(#g${cor.slice(1)})`} style={{ animation: pronto ? 'niilFade .8s ease .5s both' : 'none', opacity: 0 }} />
      <path d={dPath} fill="none" stroke={cor} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"
        style={{
          strokeDasharray: 900, strokeDashoffset: pronto ? 0 : 900,
          transition: 'stroke-dashoffset 1.1s cubic-bezier(.22,1,.36,1)'
        }} />
      {pts.map((p, i) => dados[i] > 0 && (
        <circle key={i} cx={p[0]} cy={p[1]} r="3.2" fill="#fff" stroke={cor} strokeWidth="2"
          style={{ opacity: pronto ? 1 : 0, transition: `opacity .25s ${.5 + i * .04}s` }} />
      ))}
    </svg>
  );
}
