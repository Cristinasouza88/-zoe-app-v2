import fs from 'node:fs';

const read = p => fs.readFileSync(p, 'utf8');
const write = (p, s) => fs.writeFileSync(p, s);
const replaceOnce = (s, oldValue, newValue, label, { optional = false } = {}) => {
  if (s.includes(newValue)) return s;
  if (!s.includes(oldValue)) {
    if (optional) return s;
    throw new Error(`Patch não aplicado: ${label}`);
  }
  return s.replace(oldValue, newValue);
};

// 1) Estado global do app: atualizações sempre partem do snapshot React mais recente.
{
  const p = 'NiilAppCore.jsx';
  let s = read(p);
  const oldValue = "  const salvar = n => { setD(n); if (usuario) store.set(`niil:dados:${usuario.email}`, n); };\n  const up = fn => salvar(fn(d));";
  const newValue = "  const salvar = n => { setD(n); if (usuario) store.set(`niil:dados:${usuario.email}`, n).catch?.(()=>{}); };\n  const up = fn => setD(prev => { const next = typeof fn === 'function' ? fn(prev) : fn; if (usuario) store.set(`niil:dados:${usuario.email}`, next).catch?.(()=>{}); return next; });";
  s = replaceOnce(s, oldValue, newValue, 'up funcional em NiilAppCore');
  write(p, s);
}

// 2) O Financeiro passa a ser dono do estado visual do onboarding.
{
  const p = 'Financeiro.jsx';
  let s = read(p);
  const stateOld = "  const[investRange,setInvestRange]=useState(6);\n  const inputFile=useRef(null);";
  const stateNew = "  const[investRange,setInvestRange]=useState(6);\n  const[startUi,setStartUi]=useState({step:0,aberto:false});\n  const inputFile=useRef(null);";
  s = replaceOnce(s, stateOld, stateNew, 'estado startUi no Financeiro');

  const usageOld = "<FinanceiroStart fin={fin} persistir={persistir} aviso={aviso} onFinish={()=>setTela('visao')}/>";
  const usageNew = "<FinanceiroStart fin={fin} persistir={persistir} aviso={aviso} ui={startUi} setUi={setStartUi} onFinish={()=>setTela('visao')}/>";
  s = replaceOnce(s, usageOld, usageNew, 'FinanceiroStart controlado pelo pai');
  write(p, s);
}

// 3) FinanceiroStart usa o estado controlado pelo Financeiro e não perde o sheet em remount.
{
  const p = 'FinanceiroStart.jsx';
  let s = read(p);
  const oldValue = "export default function FinanceiroStart({fin,persistir,aviso=()=>{},onFinish=()=>{}}){\n const[step,setStep]=useState(0),[aberto,setAberto]=useState(false);";
  const newValue = "export default function FinanceiroStart({fin,persistir,aviso=()=>{},ui,setUi,onFinish=()=>{}}){\n const[uiInterna,setUiInterna]=useState({step:0,aberto:false});\n const estadoUi=ui||uiInterna,setEstadoUi=setUi||setUiInterna;\n const step=Number(estadoUi.step||0),aberto=!!estadoUi.aberto;\n const setStep=value=>setEstadoUi(prev=>({...prev,step:typeof value==='function'?value(Number(prev?.step||0)):value}));\n const setAberto=value=>setEstadoUi(prev=>({...prev,aberto:typeof value==='function'?value(!!prev?.aberto):value}));";
  s = replaceOnce(s, oldValue, newValue, 'estado controlado no FinanceiroStart');
  write(p, s);
}

// 4) Remove do runtime toda interferência comportamental sobre sheets/modais financeiros.
{
  const p = 'niil-runtime.js';
  let s = read(p);
  const start = s.indexOf('let ultimoGatilhoFinanceiro=null;');
  const end = s.indexOf('const aplicar=(root=document)=>{');
  if (start >= 0 && end > start) s = s.slice(0, start) + s.slice(end);

  s = s.replace(/\n\s*protegerFinanceiro\(root\);/g, '');
  s = s.replace(/\n\s*document\.addEventListener\('pointerdown',registrarGatilho,true\);/g, '');
  s = s.replace(/\n\s*document\.addEventListener\('click',registrarGatilho,true\);/g, '');
  s = s.replace(/\n\s*document\.addEventListener\('pointerdown',registrarFechamento,true\);/g, '');
  s = s.replace(/\n\s*document\.addEventListener\('click',registrarFechamento,true\);/g, '');

  const obsRx = /    const obs=new MutationObserver\(ms=>\{[\s\S]*?    \}\);\n    obs\.observe\(document\.body,\{childList:true,subtree:true\}\);/;
  const obsClean = "    const obs=new MutationObserver(ms=>{\n      ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1)aplicar(n)}));\n      aplicarMarcaInicio(document);\n      aplicarMarcaTrilha(document);\n    });\n    obs.observe(document.body,{childList:true,subtree:true});";
  if (obsRx.test(s)) s = s.replace(obsRx, obsClean);
  else if (!s.includes(obsClean)) throw new Error('Observer do niil-runtime não encontrado para limpeza');

  if (/ultimoGatilhoFinanceiro|tentarReabrirFinanceiro|protegerFinanceiro|registrarGatilho|registrarFechamento/.test(s)) {
    throw new Error('Ainda restaram hooks financeiros no niil-runtime');
  }
  write(p, s);
}

// 5) Build limpo: nenhum script reescreve o Financeiro durante a compilação.
{
  const p = 'package.json';
  let s = read(p);
  s = replaceOnce(
    s,
    '"build":"node scripts/fix-financeiro-sheet.mjs && vite build"',
    '"build":"vite build"',
    'build limpo',
    { optional: true }
  );
  write(p, s);
}

// 6) O plugin de persistência existente passa a atuar no arquivo real do app, não no reexport App.jsx.
{
  const p = 'vite.persistencia.js';
  let s = read(p);
  const oldValue = "      if(!id.endsWith('/App.jsx')&&!id.endsWith('App.jsx')) return null;";
  const newValue = "      if(!id.endsWith('/NiilAppCore.jsx')&&!id.endsWith('NiilAppCore.jsx')) return null;";
  s = replaceOnce(s, oldValue, newValue, 'alvo correto do plugin de persistência');
  write(p, s);
}

console.log('Limpeza estrutural concluída: Financeiro sem auto-reabertura, build limpo e onboarding com estado estável.');
