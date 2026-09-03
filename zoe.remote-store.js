import { supabase } from './supabase.js';

const endpoint='/.netlify/functions/niil-data';
const esperar=ms=>new Promise(r=>setTimeout(r,ms));

async function token(){
  const {data}=await supabase.auth.getSession();
  return data?.session?.access_token||'';
}

export async function carregarRemoto(){
  const t=await token();
  if(!t)return null;
  let ultimoErro=null;
  for(let tentativa=0;tentativa<3;tentativa++){
    try{
      const r=await fetch(endpoint,{headers:{Authorization:`Bearer ${t}`,'Cache-Control':'no-store'}});
      const j=await r.json().catch(()=>({}));
      if(r.ok&&j?.ok)return{data:j.data||null,updatedAt:j.updatedAt||null,source:j.source||'remote',recovered:!!j.recovered};
      ultimoErro=new Error(j?.error||`HTTP ${r.status}`);
      if(r.status===401||r.status===403)break;
    }catch(e){ultimoErro=e}
    if(tentativa<2)await esperar(280*(tentativa+1));
  }
  console.warn('NIIL remoto: falha ao carregar',ultimoErro);
  return null;
}

let fila=Promise.resolve();

export function salvarRemoto(data,updatedAt=new Date().toISOString()){
  // Captura o token no momento da alteração. Assim, se a pessoa sair logo depois,
  // o salvamento que já entrou na fila ainda tem credencial para concluir.
  const tokenPromessa=token();
  fila=fila.then(async()=>{
    const t=await tokenPromessa;if(!t)return false;
    const r=await fetch(endpoint,{
      method:'POST',
      headers:{Authorization:`Bearer ${t}`,'Content-Type':'application/json','Cache-Control':'no-store'},
      body:JSON.stringify({data,updatedAt})
    });
    const j=await r.json().catch(()=>({}));
    if(r.status===409&&j?.error==='state_regression_blocked'){
      console.warn('NIIL remoto: snapshot vazio bloqueado; dados anteriores preservados');
      return false;
    }
    if(!r.ok)throw new Error(j?.error||`HTTP ${r.status}`);
    return true;
  }).catch(e=>{console.warn('NIIL remoto: falha ao salvar',e);return false});
  return fila;
}

export function aguardarSalvamentosRemotos(){
  return fila.catch(()=>false);
}
