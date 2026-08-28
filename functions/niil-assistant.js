const json=(statusCode,body)=>({statusCode,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'},body:JSON.stringify(body)});

const system=`Você é a inteligência conversacional do NIIL, um aplicativo de organização e evolução pessoal.
Responda em português do Brasil, com linguagem humana, clara, madura e curta.
Seu papel é ajudar a pessoa a perceber, refletir, escolher uma próxima ação e conectar essa ação à própria evolução.
Não se apresente como terapeuta, psicólogo, médico, consultor financeiro ou autoridade clínica. Não faça diagnóstico.
Em temas emocionais, faça perguntas de reflexão e proponha próximos passos práticos sem substituir cuidado profissional.
Em saúde, finanças ou temas de alto impacto, seja prudente, diferencie organização pessoal de orientação profissional e não faça promessas.
Nunca invente dados do contexto. Se o contexto não trouxer algo, diga que não sabe.
Evite frases motivacionais genéricas, infantilização, culpa e dark patterns.
Prefira respostas de 2 a 6 frases. Quando fizer sentido, termine com uma única pergunta ou próximo passo objetivo.
O NIIL recompensa movimento real, não uso do aplicativo.`;

const limparHistorico=h=>(Array.isArray(h)?h:[]).slice(-8).filter(x=>['user','assistant'].includes(x?.role)&&x?.content).map(x=>({role:x.role,content:String(x.content).slice(0,3000)}));

exports.handler=async event=>{
  if(event.httpMethod!=='POST')return json(405,{erro:'Método não permitido.'});
  const apiKey=process.env.NIIL_API_KEY||process.env.ANTHROPIC_API_KEY;
  if(!apiKey)return json(500,{erro:'Chave de IA não configurada no Netlify.'});
  let p;try{p=JSON.parse(event.body||'{}')}catch{return json(400,{erro:'JSON inválido.'})}
  const mensagem=String(p.mensagem||'').trim();
  if(!mensagem)return json(400,{erro:'Envie uma mensagem.'});
  const contexto=p.contexto&&typeof p.contexto==='object'?p.contexto:{};
  const historico=limparHistorico(p.historico);
  const messages=[...historico];
  if(!messages.length||messages[messages.length-1].role!=='user'||messages[messages.length-1].content!==mensagem){
    messages.push({role:'user',content:mensagem});
  }
  const contextoSeguro=JSON.stringify(contexto).slice(0,6000);
  const systemComContexto=system+`\n\nContexto resumido do aplicativo (use apenas quando for pertinente): ${contextoSeguro}`;
  try{
    const r=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{'content-type':'application/json','x-api-key':apiKey,'anthropic-version':'2023-06-01'},
      body:JSON.stringify({model:'claude-haiku-4-5-20251001',max_tokens:700,system:systemComContexto,messages})
    });
    if(!r.ok)throw new Error(`Anthropic API ${r.status}: ${await r.text()}`);
    const d=await r.json();
    const texto=(d.content||[]).map(x=>x.text||'').join('').trim();
    return json(200,{texto});
  }catch(e){
    return json(502,{erro:String(e.message||e)});
  }
};
