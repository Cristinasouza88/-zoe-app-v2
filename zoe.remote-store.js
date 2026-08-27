import { supabase } from './supabase.js';

const endpoint='/.netlify/functions/niil-data';

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
    return j?.ok?{data:j.data||null,updatedAt:j.updatedAt||null}:null;
  }catch(e){console.warn('NIIL remoto: falha ao carregar',e);return null}
}

let fila=Promise.resolve();

export function salvarRemoto(data,updatedAt=new Date().toISOString()){
  // Captura o token no momento da alteração. Assim, se a pessoa sair logo depois,
  // o salvamento que já entrou na fila ainda tem credencial para concluir.
  const tokenPromessa=token();
  fila=fila.then(async()=>{
    const t=await tokenPromessa; if(!t)return false;
    const r=await fetch(endpoint,{
      method:'POST',
      headers:{Authorization:`Bearer ${t}`,'Content-Type':'application/json','Cache-Control':'no-store'},
      body:JSON.stringify({data,updatedAt})
    });
    if(!r.ok)throw new Error(`HTTP ${r.status}`);
    return true;
  }).catch(e=>{console.warn('NIIL remoto: falha ao salvar',e);return false});
  return fila;
}

export function aguardarSalvamentosRemotos(){
  return fila.catch(()=>false);
}
