/* Netlify Function: recebe texto (transcrição de voz) ou uma foto de recibo
   (base64) e usa a API da Anthropic para extrair um rascunho de lançamento
   financeiro { valor, tipo, categoria, descricao, data }. A usuária sempre
   confere/edita o resultado antes de salvar — esta function nunca grava
   nada, só devolve uma sugestão.

   Requer a variável de ambiente ANTHROPIC_API_KEY configurada no Netlify
   (Site settings → Environment variables). Sem ela, retorna 500 com uma
   mensagem clara em vez de expor qualquer chave. */

const CATEGORIAS_DESPESA = ['Moradia', 'Alimentação', 'Transporte', 'Saúde', 'Lazer', 'Educação', 'Assinaturas', 'Investimentos', 'Cuidados pessoais', 'Outros'];
const CATEGORIAS_RECEITA = ['Salário', 'Freelance', 'Rendimentos', 'Reembolso', 'Outros'];

const PROMPT_SISTEMA = `Você extrai dados de um lançamento financeiro pessoal a partir de um texto falado ou da foto de um recibo/nota fiscal em português do Brasil.
Responda APENAS com um objeto JSON válido, sem markdown e sem texto adicional, no formato exato:
{"valor": <número, sem símbolo de moeda>, "tipo": "entrada" ou "saida", "categoria": "<uma das categorias abaixo>", "descricao": "<descrição curta>", "data": "<AAAA-MM-DD, use a data de hoje se não for mencionada>"}
Categorias de despesa (tipo "saida"): ${CATEGORIAS_DESPESA.join(', ')}.
Categorias de receita (tipo "entrada"): ${CATEGORIAS_RECEITA.join(', ')}.
Hoje é ${new Date().toISOString().slice(0, 10)}.
Se não conseguir identificar o valor com confiança, use 0.`;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ erro: 'ANTHROPIC_API_KEY não configurada no Netlify.' }) };
  }

  let payload;
  try { payload = JSON.parse(event.body || '{}'); } catch { return { statusCode: 400, body: JSON.stringify({ erro: 'JSON inválido.' }) }; }

  const conteudo = [];
  if (payload.tipo === 'imagem' && payload.imagemBase64) {
    conteudo.push({ type: 'image', source: { type: 'base64', media_type: payload.mimeType || 'image/jpeg', data: payload.imagemBase64 } });
    conteudo.push({ type: 'text', text: 'Extraia o lançamento financeiro desta foto de recibo/nota fiscal.' });
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
        model: 'claude-sonnet-5',
        max_tokens: 400,
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
