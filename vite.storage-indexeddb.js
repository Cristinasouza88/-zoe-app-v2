export default function storageIndexedDb(){
  return {
    name:'zoe-storage-indexeddb',
    enforce:'pre',
    transform(code,id){
      if(!id.endsWith('/ui.jsx')&&!id.endsWith('ui.jsx')) return null;
      const inicio='const memoria = {};';
      const fim='export const C = {';
      const a=code.indexOf(inicio),b=code.indexOf(fim);
      if(a<0||b<0||b<=a){console.warn('[zoe-storage-indexeddb] bloco de storage nao encontrado');return null;}
      const novo=`const memoria = {};
const ZOE_DB='zoe-persist-v1',ZOE_STORE='kv';
let zoeDbPromise=null;
const abrirZoeDb=()=>{if(typeof indexedDB==='undefined')return Promise.resolve(null);if(zoeDbPromise)return zoeDbPromise;zoeDbPromise=new Promise((resolve,reject)=>{const req=indexedDB.open(ZOE_DB,1);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(ZOE_STORE))db.createObjectStore(ZOE_STORE)};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)});return zoeDbPromise};
const idbGet=async k=>{const db=await abrirZoeDb();if(!db)return null;return new Promise((resolve,reject)=>{const tx=db.transaction(ZOE_STORE,'readonly'),req=tx.objectStore(ZOE_STORE).get(k);req.onsuccess=()=>resolve(req.result??null);req.onerror=()=>reject(req.error)})};
const idbSet=async(k,v)=>{const db=await abrirZoeDb();if(!db)return false;return new Promise((resolve,reject)=>{const tx=db.transaction(ZOE_STORE,'readwrite');tx.objectStore(ZOE_STORE).put(v,k);tx.oncomplete=()=>resolve(true);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)})};
export const store = {
  async get(k) {
    try { const v=await idbGet(k); if(v!==null&&v!==undefined){memoria[k]=v;return v} } catch(e){console.warn('ZOE: falha ao ler IndexedDB',e)}
    try { if(typeof window!=='undefined'&&window.localStorage){const raw=window.localStorage.getItem(k);if(raw!=null){const v=JSON.parse(raw);memoria[k]=v;try{await idbSet(k,v)}catch{}return v}} } catch(e){console.warn('ZOE: falha ao ler localStorage',e)}
    try { if(typeof window!=='undefined'&&window.storage){const r=await window.storage.get(k,false);if(r?.value!=null){const v=JSON.parse(r.value);memoria[k]=v;try{await idbSet(k,v)}catch{}return v}} } catch(e){console.warn('ZOE: falha ao ler storage auxiliar',e)}
    return memoria[k]??null;
  },
  async set(k,v) {
    memoria[k]=v;let ok=false;
    try { ok=await idbSet(k,v) } catch(e){console.error('ZOE: falha ao gravar IndexedDB',e)}
    try { if(typeof window!=='undefined'&&window.localStorage)window.localStorage.setItem(k,JSON.stringify(v)) } catch(e){console.warn('ZOE: localStorage cheio; IndexedDB continua como fonte principal',e)}
    try { if(typeof window!=='undefined'&&window.storage)await window.storage.set(k,JSON.stringify(v),false) } catch{}
    return ok;
  }
};

`;
      return {code:code.slice(0,a)+novo+code.slice(b),map:null};
    }
  };
}
