const json=(statusCode,body)=>({statusCode,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'},body:JSON.stringify(body)});

const system=`Você é a camada de leitura do NIIL Finanças. Receberá SOMENTE indicadores já calculados pelo aplicativo. Escreva em português do Brasil, de forma curta, calma e objetiva.
Regras: não invente dados, não diga que uma situação está boa ou ruim sem evidência numérica, não dê recomendação de investimento específico, não trate projeção como certeza e não repita números sem explicar o que significam. Produza no máximo 4 frases. Priorize: mudança relevante vs. mês anterior, categoria dominante, orçamento perto do limite, reserva/meta e projeção futura. Se faltarem dados, diga que ainda não há base suficiente.`;

exports.handler=async event=>{
  if(event.httpMethod!=='POST')return json(405,{erro:'Método não permitido.'});
  const apiKey=process.env.NIIL_API_KEY||process.env.NIIL_API_KEY||process.env.ANTHROPIC_API_KEY;if(!apiKey)return json(500,{erro:'Chave de IA não configurada no Netlify.'});
  let p;try{p=JSON.parse(event.body||'{}')}catch{return json(400,{erro:'JSON inválido.'})}
  try{
    const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'content-type':'application/json','x-api-key':apiKey,'anthropic-version':'2023-06-01'},body:JSON.stringify({model:'claude-haiku-4-5-20251001',max_tokens:500,system,messages:[{role:'user',content:[{type:'text',text:JSON.stringify(p.resumo||{})}]}]})});
    if(!r.ok)throw new Error(`Anthropic API ${r.status}: ${await r.text()}`);
    const d=await r.json();const texto=(d.content||[]).map(x=>x.text||'').join('').trim();return json(200,{texto});
  }catch(e){return json(502,{erro:String(e.message||e)})}
};
