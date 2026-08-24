import { supabase } from './supabase.js';

const endpoint='/.netlify/functions/zoe-data';

async function token(){
  const {data}=await supabase.auth.getSession();
  return data?.session?.access_token||'';
}

export async function carregarRemoto(){
  try{
    const t=await token(); if(!t)return null;
    const r=await fetch(endpoint,{headers:{Authorization:`Bearer ${t}`,'Cache-Control':'no-store'}});
    if(!r.ok)return null;
    const j=await r.json();
    return j?.ok?j.data:null;
  }catch(e){console.warn('ZOE remoto: falha ao carregar',e);return null}
}

let fila=Promise.resolve();
export function salvarRemoto(data){
  fila=fila.then(async()=>{
    const t=await token(); if(!t)return false;
    const r=await fetch(endpoint,{method:'POST',headers:{Authorization:`Bearer ${t}`,'Content-Type':'application/json'},body:JSON.stringify({data})});
    if(!r.ok)throw new Error(`HTTP ${r.status}`);
    return true;
  }).catch(e=>{console.warn('ZOE remoto: falha ao salvar',e);return false});
  return fila;
}
