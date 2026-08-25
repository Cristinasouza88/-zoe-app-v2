export default function storageIndexedDb(){
  return {
    name:'niil-storage-indexeddb',
    enforce:'pre',
    transform(code,id){
      if(!id.endsWith('/ui.jsx')&&!id.endsWith('ui.jsx')) return null;
      const inicio='const memoria = {};';
      const fim='export const C = {';
      const a=code.indexOf(inicio),b=code.indexOf(fim);
      if(a<0||b<0||b<=a){console.warn('[niil-storage-indexeddb] bloco de storage nao encontrado');return null;}
      const novo=`const memoria = {};
const NIIL_DB='niil-persist-v1',NIIL_STORE='kv';
let niilDbPromise=null;
const abrirNIILDb=()=>{if(typeof indexedDB==='undefined')return Promise.resolve(null);if(niilDbPromise)return niilDbPromise;niilDbPromise=new Promise((resolve,reject)=>{const req=indexedDB.open(NIIL_DB,1);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(NIIL_STORE))db.createObjectStore(NIIL_STORE)};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)});return niilDbPromise};
const idbGet=async k=>{const db=await abrirNIILDb();if(!db)return null;return new Promise((resolve,reject)=>{const tx=db.transaction(NIIL_STORE,'readonly'),req=tx.objectStore(NIIL_STORE).get(k);req.onsuccess=()=>resolve(req.result??null);req.onerror=()=>reject(req.error)})};
const idbSet=async(k,v)=>{const db=await abrirNIILDb();if(!db)return false;return new Promise((resolve,reject)=>{const tx=db.transaction(NIIL_STORE,'readwrite');tx.objectStore(NIIL_STORE).put(v,k);tx.oncomplete=()=>resolve(true);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)})};
export const store = {
  async get(k) {
    try { const v=await idbGet(k); if(v!==null&&v!==undefined){memoria[k]=v;return v} } catch(e){console.warn('NIIL: falha ao ler IndexedDB',e)}
    try { if(typeof window!=='undefined'&&window.localStorage){const raw=window.localStorage.getItem(k);if(raw!=null){const v=JSON.parse(raw);memoria[k]=v;try{await idbSet(k,v)}catch{}return v}} } catch(e){console.warn('NIIL: falha ao ler localStorage',e)}
    try { if(typeof window!=='undefined'&&window.storage){const r=await window.storage.get(k,false);if(r?.value!=null){const v=JSON.parse(r.value);memoria[k]=v;try{await idbSet(k,v)}catch{}return v}} } catch(e){console.warn('NIIL: falha ao ler storage auxiliar',e)}
    return memoria[k]??null;
  },
  async set(k,v) {
    memoria[k]=v;let ok=false;
    try { ok=await idbSet(k,v) } catch(e){console.error('NIIL: falha ao gravar IndexedDB',e)}
    try { if(typeof window!=='undefined'&&window.localStorage)window.localStorage.setItem(k,JSON.stringify(v)) } catch(e){console.warn('NIIL: localStorage cheio; IndexedDB continua como fonte principal',e)}
    try { if(typeof window!=='undefined'&&window.storage)await window.storage.set(k,JSON.stringify(v),false) } catch{}
    return ok;
  }
};

`;
      return {code:code.slice(0,a)+novo+code.slice(b),map:null};
    }
  };
}
