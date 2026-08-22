/* Netlify Function: recebe texto (transcrição de voz) ou uma foto de recibo
   (base64) e usa a API da Anthropic para extrair um rascunho de lançamento
   financeiro { valor, tipo, categoria, descricao, data }. A usuária sempre
   confere/edita o resultado antes de salvar — esta function nunca grava
   nada, só devolve uma sugestão.

   Requer a variável de ambiente ZOE_API_KEY configurada no Netlify
   (Site settings → Environment variables). Sem ela, retorna 500 com uma
   mensagem clara em vez de expor qualquer chave. */

const CATEGORIAS_DESPESA = ['Moradia', 'Alimentação', 'Transporte', 'Saúde', 'Lazer', 'Educação', 'Assinaturas', 'Consórcio', 'Financiamento', 'Investimentos', 'Cuidados pessoais', 'Outros'];
const CATEGORIAS_RECEITA = ['Salário', 'Freelance', 'Rendimentos', 'Reembolso', 'Outros'];

const PROMPT_SISTEMA = `Você organiza documentos financeiros pessoais em português do Brasil: extratos, faturas, boletos, recibos, contratos de financiamento e consórcio.
Responda APENAS com JSON válido, sem markdown, neste formato:
{"transacoes":[{"valor":0,"tipo":"entrada ou saida","categoria":"categoria","descricao":"texto curto","data":"AAAA-MM-DD","conta":"conta se identificada","confianca":0.0}],"divida":null ou {"tipo":"Consórcio ou Financiamento","nome":"bem/contrato","instituicao":"nome","valor_total":0,"valor_pago":0,"saldo_restante":0,"parcela_atual":0,"total_parcelas":0,"valor_parcela":0},"perguntas":["pergunta objetiva apenas quando faltar informação"]}
Categorias de despesa (tipo "saida"): ${CATEGORIAS_DESPESA.join(', ')}.
Categorias de receita (tipo "entrada"): ${CATEGORIAS_RECEITA.join(', ')}.
Hoje é ${new Date().toISOString().slice(0, 10)}.
Extraia todos os lançamentos visíveis. Use confiança entre 0 e 1. Não invente saldo, parcelas ou categorias; quando houver ambiguidade use categoria Outros, confiança baixa e faça uma pergunta curta.`;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const apiKey = process.env.ZOE_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ erro: 'ZOE_API_KEY não configurada no Netlify.' }) };
  }

  let payload;
  try { payload = JSON.parse(event.body || '{}'); } catch { return { statusCode: 400, body: JSON.stringify({ erro: 'JSON inválido.' }) }; }

  const conteudo = [];
  if ((payload.tipo === 'imagem'||payload.tipo==='documento') && payload.imagemBase64) {
    conteudo.push({ type: payload.tipo==='documento'?'document':'image', source: { type: 'base64', media_type: payload.mimeType || 'image/jpeg', data: payload.imagemBase64 } });
    conteudo.push({ type: 'text', text: 'Organize todas as informações financeiras deste arquivo. Identifique também consórcio ou financiamento, valores pagos, saldo e parcelas quando estiverem explícitos.' });
  } else if (payload.texto) {
    conteudo.push({ type: 'text', text: `Extraia o lançamento financeiro deste texto falado: "${payload.texto}"` });
  } else {
    return { statusCode: 400, body: JSON.stringify({ erro: 'Envie "texto" ou "imagemBase64".' }) };
  }

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        // Haiku é mais adequado para extração estruturada e responde dentro
        // da janela curta das Functions do Netlify.
        model: 'claude-haiku-4-5-20251001',
        // Uma fatura completa pode gerar dezenas de lançamentos. O limite
        // anterior cortava o JSON antes do fechamento.
        max_tokens: 8000,
        system: PROMPT_SISTEMA,
        messages: [{ role: 'user', content: conteudo }]
      })
    });

    if (!resp.ok) {
      const erro = await resp.text();
      return { statusCode: 502, body: JSON.stringify({ erro: `Anthropic API: ${resp.status} ${erro}` }) };
    }

    const dados = await resp.json();
    const texto = (dados.content || []).map(b => b.text || '').join('').trim();
    const jsonMatch = texto.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { statusCode: 502, body: JSON.stringify({ erro: 'Resposta da IA sem JSON reconhecível.' }) };

    const campos = JSON.parse(jsonMatch[0]);
    return { statusCode: 200, headers: { 'content-type': 'application/json' }, body: JSON.stringify(campos) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ erro: String(e.message || e) }) };
  }
};
