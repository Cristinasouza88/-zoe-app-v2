const DB='zoe-financeiro';
const STORE='conciliacoes';
const KEY='importacao-pendente';

function db(){
  return new Promise((resolve,reject)=>{
    if(typeof indexedDB==='undefined') return reject(new Error('IndexedDB indisponível'));
    const req=indexedDB.open(DB,1);
    req.onupgradeneeded=()=>{const d=req.result;if(!d.objectStoreNames.contains(STORE))d.createObjectStore(STORE)};
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });
}
export async function salvarConciliacaoPendente(valor){
  const d=await db();
  return new Promise((resolve,reject)=>{const tx=d.transaction(STORE,'readwrite');tx.objectStore(STORE).put(valor,KEY);tx.oncomplete=()=>{d.close();resolve(true)};tx.onerror=()=>{d.close();reject(tx.error)}});
}
export async function carregarConciliacaoPendente(){
  try{const d=await db();return await new Promise((resolve,reject)=>{const tx=d.transaction(STORE,'readonly');const r=tx.objectStore(STORE).get(KEY);r.onsuccess=()=>{d.close();resolve(r.result||null)};r.onerror=()=>{d.close();reject(r.error)}})}catch{return null}
}
export async function limparConciliacaoPendente(){
  try{const d=await db();return await new Promise((resolve,reject)=>{const tx=d.transaction(STORE,'readwrite');tx.objectStore(STORE).delete(KEY);tx.oncomplete=()=>{d.close();resolve(true)};tx.onerror=()=>{d.close();reject(tx.error)}})}catch{return false}
}
