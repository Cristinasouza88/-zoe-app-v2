import { supabase } from './supabase.js';

const endpoint='/.netlify/functions/financeiro-data';

async function authToken(){
  const { data } = await supabase.auth.getSession();
  return data?.session?.access_token || '';
}

export async function carregarFinanceiroRemoto(){
  const token=await authToken();
  if(!token)return null;
  const r=await fetch(endpoint,{headers:{Authorization:`Bearer ${token}`,'Cache-Control':'no-store'}});
  if(!r.ok)throw new Error(`Falha ao carregar Financeiro (${r.status})`);
  const j=await r.json();
  if(!j?.ok)throw new Error(j?.error||'Falha ao carregar Financeiro');
  return j.data||null;
}

let fila=Promise.resolve();
export function salvarFinanceiroRemoto(data){
  const tarefa=async()=>{
    const token=await authToken();
    if(!token)throw new Error('Sessão sem token para salvar Financeiro');
    const r=await fetch(endpoint,{method:'PUT',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({data})});
    const j=await r.json().catch(()=>null);
    if(!r.ok||!j?.ok)throw new Error(j?.error||`Falha ao salvar Financeiro (${r.status})`);
    return j;
  };
  fila=fila.then(tarefa,tarefa);
  return fila;
}
