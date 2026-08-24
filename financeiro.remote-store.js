import { supabase } from './supabase.js';

const endpoint='/.netlify/functions/financeiro-data';

async function authToken(){
  const { data } = await supabase.auth.getSession();
  return data?.session?.access_token || '';
}

export async function carregarFinanceiroRemoto(){
  const token=await authToken();
  if(!token)return null;
  const r=await fetch(`${endpoint}?_=${Date.now()}`,{
    method:'GET',
    cache:'no-store',
    headers:{Authorization:`Bearer ${token}`,'Cache-Control':'no-store'}
  });
  const j=await r.json().catch(()=>null);
  if(!r.ok||!j?.ok)throw new Error(j?.error||`Falha ao carregar Financeiro (${r.status})`);
  return j.data??null;
}

let fila=Promise.resolve();
export function salvarFinanceiroRemoto(data){
  const tarefa=async()=>{
    const token=await authToken();
    if(!token)throw new Error('Sessão sem token para salvar Financeiro');
    const esperado=Array.isArray(data?.transacoes)?data.transacoes.length:0;
    const r=await fetch(endpoint,{
      method:'PUT',
      cache:'no-store',
      headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json','Cache-Control':'no-store'},
      body:JSON.stringify({data})
    });
    const j=await r.json().catch(()=>null);
    if(!r.ok||!j?.ok)throw new Error(j?.error||`Falha ao salvar Financeiro (${r.status})`);
    if(Number(j.transacoes)!==esperado){
      throw new Error(`Servidor confirmou ${j.transacoes??0} de ${esperado} lançamentos`);
    }
    return j;
  };
  fila=fila.then(tarefa,tarefa);
  return fila;
}
