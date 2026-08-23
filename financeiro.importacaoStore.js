const DB='zoe-financeiro';
const STORE='conciliacoes';
const KEY='importacao-pendente';
const FALLBACK='zoe-financeiro-importacao-pendente-v2';

function normalizar(valor){
  if(!valor)return null;
  const pendentes=(valor.meses||[]).filter(m=>m.status!=='concluido');
  // Mantém a fila enxuta: mês concluído sai da conciliação e já fica no histórico financeiro.
  valor.meses=pendentes;
  valor.indice=Math.max(0,Math.min(Number(valor.indice||0),Math.max(0,pendentes.length-1)));
  valor.etapa=pendentes.length?((valor.etapa==='conciliacao'&&pendentes[valor.indice])?'conciliacao':'meses'):'finalizado';
  valor.atualizadoEm=new Date().toISOString();
  return valor;
}

async function persistenteSet(valor){
  const txt=JSON.stringify(valor);
  try{
    if(typeof window!=='undefined'&&window.storage){await window.storage.set(FALLBACK,txt,false);return true}
  }catch{}
  try{
    if(typeof localStorage!=='undefined'){localStorage.setItem(FALLBACK,txt);return true}
  }catch{}
  return false;
}
async function persistenteGet(){
  try{
    if(typeof window!=='undefined'&&window.storage){const r=await window.storage.get(FALLBACK,false);if(r?.value)return JSON.parse(r.value)}
  }catch{}
  try{
    if(typeof localStorage!=='undefined'){const v=localStorage.getItem(FALLBACK);if(v)return JSON.parse(v)}
  }catch{}
  return null;
}
async function persistenteDel(){
  try{if(typeof window!=='undefined'&&window.storage?.delete)await window.storage.delete(FALLBACK,false)}catch{}
  try{if(typeof localStorage!=='undefined')localStorage.removeItem(FALLBACK)}catch{}
}

function db(){
  return new Promise((resolve,reject)=>{
    if(typeof indexedDB==='undefined') return reject(new Error('IndexedDB indisponível'));
    const req=indexedDB.open(DB,2);
    req.onupgradeneeded=()=>{const d=req.result;if(!d.objectStoreNames.contains(STORE))d.createObjectStore(STORE)};
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });
}

export async function salvarConciliacaoPendente(valor){
  const v=normalizar(valor);
  if(!v)return limparConciliacaoPendente();
  // Duas camadas: armazenamento persistente da plataforma/navegador + IndexedDB.
  // Assim um F5 não deve apagar a fila mesmo se uma das camadas falhar.
  const fallback=persistenteSet(v).catch(()=>false);
  try{
    const d=await db();
    await new Promise((resolve,reject)=>{const tx=d.transaction(STORE,'readwrite');tx.objectStore(STORE).put(v,KEY);tx.oncomplete=()=>{d.close();resolve(true)};tx.onerror=()=>{d.close();reject(tx.error)}});
  }catch{}
  await fallback;
  return true;
}

export async function carregarConciliacaoPendente(){
  let local=null;
  try{const d=await db();local=await new Promise((resolve,reject)=>{const tx=d.transaction(STORE,'readonly');const r=tx.objectStore(STORE).get(KEY);r.onsuccess=()=>{d.close();resolve(r.result||null)};r.onerror=()=>{d.close();reject(r.error)}})}catch{}
  const fb=await persistenteGet();
  const candidatos=[local,fb].filter(Boolean).map(normalizar);
  if(!candidatos.length)return null;
  candidatos.sort((a,b)=>String(b.atualizadoEm||'').localeCompare(String(a.atualizadoEm||'')));
  const escolhido=candidatos[0];
  // Repara a camada que eventualmente falhou na gravação anterior.
  salvarConciliacaoPendente(escolhido).catch(()=>{});
  return escolhido;
}

export async function limparConciliacaoPendente(){
  await persistenteDel();
  try{const d=await db();return await new Promise((resolve,reject)=>{const tx=d.transaction(STORE,'readwrite');tx.objectStore(STORE).delete(KEY);tx.oncomplete=()=>{d.close();resolve(true)};tx.onerror=()=>{d.close();reject(tx.error)}})}catch{return false}
}
