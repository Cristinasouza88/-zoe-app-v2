const json=(statusCode,body)=>({statusCode,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'},body:JSON.stringify(body)});
const DESPESAS=['Moradia','Mercado','Alimentação','Transporte','Saúde','Fitness','Educação','Carreira','Assinaturas','Compras','Lazer','Viagens','Impostos','Seguros','Consórcio','Financiamento','Presentes','Doações','Cuidados pessoais','Outros'];
const RECEITAS=['Salário','Salário PJ','Trabalho','Rendimentos','Reembolso','Outros'];
const sistema=`Você é o extrator de dados do módulo NIIL Finanças. Organize documentos financeiros pessoais em português do Brasil sem inventar informações.
Responda SOMENTE JSON válido, sem markdown.
Formato: {"transacoes":[{"data":"AAAA-MM-DD","descricaoOriginal":"texto fiel e curto","valor":0,"tipo":"receita|despesa","categoria":"categoria permitida","subcategoria":"","contaOriginal":"","cartaoFinal":"","transferenciaInterna":false,"pagamentoFatura":false,"aporteInvestimento":false,"resgateInvestimento":false,"estorno":false,"parcelaAtual":0,"totalParcelas":0,"recorrente":false,"confiancaClassificacao":0.0}],"contas":[],"cartoes":[],"dividas":[],"perguntas":[]}.
Categorias de despesa: ${DESPESAS.join(', ')}. Categorias de receita: ${RECEITAS.join(', ')}.
Regras obrigatórias: pagamento de fatura não é nova despesa quando as compras já aparecem; transferências entre contas próprias não são receita nem despesa; aporte e resgate de investimento são movimentações patrimoniais; estorno não é nova renda. Marque esses booleanos quando houver evidência explícita. Não invente saldo, limite, taxa, parcelas ou conta. Se algo importante estiver ambíguo, use categoria Outros, confiança abaixo de 0.6 e inclua uma pergunta objetiva. Extraia todas as movimentações visíveis e mantenha datas do documento.`;

const modelo=()=>process.env.ANTHROPIC_MODEL||'claude-haiku-4-5-20251001';
const limparErro=txt=>String(txt||'').replace(/\s+/g,' ').slice(0,700);

async function chamarAnthropic(apiKey,system,content,maxTokens=6000){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),75000);
  try{
    const r=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      signal:controller.signal,
      headers:{'content-type':'application/json','x-api-key':apiKey,'anthropic-version':'2023-06-01'},
      body:JSON.stringify({model:modelo(),max_tokens:maxTokens,system,messages:[{role:'user',content}]})
    });
    if(!r.ok){
      const detalhe=limparErro(await r.text());
      throw new Error(`Falha na leitura inteligente (${r.status})${detalhe?`: ${detalhe}`:''}`);
    }
    const d=await r.json();
    const texto=(d.content||[]).map(x=>x.text||'').join('').trim();
    const m=texto.match(/\{[\s\S]*\}/);
    if(!m)throw new Error('O documento foi lido, mas não consegui organizar os lançamentos. Tente novamente ou use CSV/imagem.');
    return JSON.parse(m[0]);
  }catch(e){
    if(e?.name==='AbortError')throw new Error('A leitura demorou mais do que o esperado. Tente novamente com um PDF menor ou exporte o extrato em CSV.');
    throw e;
  }finally{clearTimeout(timer)}
}

exports.handler=async event=>{
  if(event.httpMethod!=='POST')return json(405,{erro:'Método não permitido.'});
  const apiKey=process.env.ANTHROPIC_API_KEY||process.env.NIIL_ANTHROPIC_API_KEY||process.env.NIIL_API_KEY;
  if(!apiKey)return json(500,{erro:'Leitura inteligente temporariamente indisponível. A chave do serviço não está configurada.'});

  let p;
  try{p=JSON.parse(event.body||'{}')}catch{return json(400,{erro:'O arquivo chegou em um formato inválido. Selecione-o novamente.'})}

  try{
    if(p.tipo==='csv'&&Array.isArray(p.descricoes)){
      const itens=p.descricoes.slice(0,250).map((descricao,id)=>({id,descricao}));
      const sys=`Classifique descrições financeiras brasileiras. Responda SOMENTE JSON válido {"categorias":[{"id":0,"categoria":"...","tipo":"receita|despesa","confianca":0.0}]}. Despesas: ${DESPESAS.join(', ')}. Receitas: ${RECEITAS.join(', ')}. Use Outros e confiança baixa quando não houver evidência.`;
      return json(200,await chamarAnthropic(apiKey,sys,[{type:'text',text:JSON.stringify(itens)}],3500));
    }

    const content=[];
    if((p.tipo==='imagem'||p.tipo==='documento')&&p.imagemBase64){
      const mediaType=p.tipo==='documento'?'application/pdf':(p.mimeType||'image/jpeg');
      if(p.tipo==='documento'&&mediaType!=='application/pdf')return json(400,{erro:'O arquivo selecionado não foi reconhecido como PDF.'});
      content.push({type:p.tipo==='documento'?'document':'image',source:{type:'base64',media_type:mediaType,data:p.imagemBase64}});
      content.push({type:'text',text:'Extraia todas as movimentações financeiras visíveis. Preserve datas e valores, não invente dados e siga rigorosamente o schema do sistema.'});
    }else if(p.texto){
      content.push({type:'text',text:`Organize esta informação financeira: ${p.texto}`});
    }else return json(400,{erro:'Nenhum conteúdo legível foi recebido. Selecione novamente o PDF, CSV ou imagem.'});

    const out=await chamarAnthropic(apiKey,sistema,content,6000);
    return json(200,out);
  }catch(e){
    console.error('parse-transaction',e);
    return json(502,{erro:limparErro(e?.message||e)||'Não consegui processar o documento agora.'});
  }
};
