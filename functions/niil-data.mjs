import { getStore } from '@netlify/blobs';

const SUPABASE_URL=process.env.SUPABASE_URL||'https://sfunjjpmrnijumeihctz.supabase.co';
const SUPABASE_KEY=process.env.SUPABASE_PUBLISHABLE_KEY||'sb_publishable_gwGUFgU477xP0-zFBLZ-gw__why1S1L';

async function usuarioDaRequisicao(req){
  const auth=req.headers.get('authorization')||'';
  if(!auth.startsWith('Bearer '))return null;
  const token=auth.slice(7);
  const r=await fetch(`${SUPABASE_URL}/auth/v1/user`,{
    headers:{Authorization:`Bearer ${token}`,apikey:SUPABASE_KEY}
  });
  if(!r.ok)return null;
  return r.json();
}

const desempacotar=value=>{
  if(value&&typeof value==='object'&&value.__niilStateEnvelope===1){
    return{data:value.state||null,updatedAt:value.updatedAt||null};
  }
  return{data:value||null,updatedAt:null};
};

const tamanhoArray=v=>Array.isArray(v)?v.length:0;
const tamanhoObjeto=v=>v&&typeof v==='object'&&!Array.isArray(v)?Object.keys(v).length:0;

// Heurística defensiva: não mede "qualidade" da vida da pessoa; apenas detecta
// snapshots claramente vazios/default versus estados que já têm dados cadastrados.
const pontuarEstado=state=>{
  if(!state||typeof state!=='object')return 0;
  const f=state.financeiro||{};
  let score=0;
  score+=tamanhoObjeto(state.dias)*2;
  score+=tamanhoObjeto(state.etapas)*3;
  score+=tamanhoArray(state.fotos)*2;
  score+=tamanhoArray(state.medidas)*2;
  score+=tamanhoArray(state.biblioteca)*2;
  score+=tamanhoArray(state.caracteristicas);
  score+=tamanhoArray(f.transacoes)*8;
  score+=tamanhoArray(f.contas)*12;
  score+=tamanhoArray(f.cartoes)*8;
  score+=tamanhoArray(f.investimentos)*12;
  score+=tamanhoArray(f.dividas)*12;
  score+=tamanhoArray(f.objetivos)*8;
  score+=tamanhoArray(f.importacoes)*5;
  score+=tamanhoArray(f.receitasRecorrentes)*8;
  score+=tamanhoArray(f.gastosFixos)*8;
  score+=tamanhoArray(f.caixinhas)*6;
  score+=tamanhoArray(state.trilhaNIIL?.temporadas)*6;
  score+=tamanhoObjeto(state.trilhaNIIL?.respostas)*3;
  if(state.financeiroDiagnosticoConcluido||f.onboardingConcluido||f.startFinanceiroConcluido)score+=15;
  return score;
};

const escolherSnapshot=(candidatos=[])=>{
  const validos=candidatos
    .map(x=>({...x,pacote:desempacotar(x.value)}))
    .filter(x=>x.pacote.data&&typeof x.pacote.data==='object')
    .map(x=>({...x,score:pontuarEstado(x.pacote.data),ts:Date.parse(x.pacote.updatedAt||0)||0}));
  if(!validos.length)return null;
  validos.sort((a,b)=>b.score-a.score||b.ts-a.ts);
  const melhor=validos[0];
  const atual=validos.find(x=>x.source==='current');
  // Se o snapshot atual não perdeu conteúdo de forma relevante, respeita o mais recente.
  if(atual&&atual.score>=Math.max(0,melhor.score-12)){
    const proximos=validos.filter(x=>x.score>=Math.max(0,atual.score-12));
    proximos.sort((a,b)=>b.ts-a.ts);
    return proximos[0]||atual;
  }
  return melhor;
};

export default async req=>{
  try{
    const user=await usuarioDaRequisicao(req);
    if(!user?.id)return Response.json({ok:false,error:'unauthorized'},{status:401});

    const dados=getStore({name:'niil-user-data',consistency:'strong'});
    const legado=getStore({name:'zoe-user-data',consistency:'strong'});
    const key=`user/${user.id}/app-state-v1`;
    const backupKey=`user/${user.id}/app-state-backup-v1`;

    if(req.method==='GET'){
      const [currentValue,legacyValue,backupValue]=await Promise.all([
        dados.get(key,{type:'json',consistency:'strong'}),
        legado.get(key,{type:'json',consistency:'strong'}),
        dados.get(backupKey,{type:'json',consistency:'strong'})
      ]);

      const escolhido=escolherSnapshot([
        {source:'current',value:currentValue},
        {source:'legacy',value:legacyValue},
        {source:'backup',value:backupValue}
      ]);

      if(!escolhido)return Response.json({ok:true,data:null,updatedAt:null,source:'none'});

      const out=escolhido.pacote;
      // Se o snapshot mais completo veio do legado/backup, restaura o principal automaticamente.
      if(escolhido.source!=='current'){
        const restoredAt=out.updatedAt||new Date().toISOString();
        await dados.setJSON(key,{__niilStateEnvelope:1,state:out.data,updatedAt:restoredAt},{
          metadata:{restoredFrom:escolhido.source,updatedAt:restoredAt,email:user.email||'',score:String(escolhido.score)}
        });
      }
      return Response.json({ok:true,data:out.data,updatedAt:out.updatedAt,source:escolhido.source,recovered:escolhido.source!=='current'});
    }

    if(req.method==='POST'||req.method==='PUT'){
      const body=await req.json();
      if(!body||typeof body!=='object'||!body.data)return Response.json({ok:false,error:'invalid_body'},{status:400});
      const updatedAt=body.updatedAt||new Date().toISOString();
      const atualRaw=await dados.get(key,{type:'json',consistency:'strong'});
      const atual=desempacotar(atualRaw);
      const scoreAtual=pontuarEstado(atual.data);
      const scoreNovo=pontuarEstado(body.data);

      // Bloqueia a regressão típica: estado substancialmente preenchido sendo substituído
      // por um estado quase vazio após falha de hidratação/login. Reset destrutivo só pode
      // ocorrer se um fluxo administrativo explícito enviar allowDestructive=true.
      const regressao=scoreAtual>=35&&scoreNovo+20<scoreAtual;
      if(regressao&&body.allowDestructive!==true){
        console.warn('niil-data: regressão bloqueada',{userId:user.id,scoreAtual,scoreNovo});
        return Response.json({ok:false,error:'state_regression_blocked',preserved:true,scoreAtual,scoreNovo},{status:409});
      }

      if(atual.data){
        await dados.setJSON(backupKey,{__niilStateEnvelope:1,state:atual.data,updatedAt:atual.updatedAt||new Date().toISOString()},{
          metadata:{backupOf:key,updatedAt:atual.updatedAt||'',email:user.email||'',score:String(scoreAtual)}
        });
      }

      await dados.setJSON(key,{__niilStateEnvelope:1,state:body.data,updatedAt},{
        metadata:{updatedAt,email:user.email||'',score:String(scoreNovo)}
      });
      return Response.json({ok:true,updatedAt,score:scoreNovo});
    }

    return new Response('Method Not Allowed',{status:405});
  }catch(e){
    console.error('niil-data',e);
    return Response.json({ok:false,error:e?.message||'server_error'},{status:500});
  }
};
