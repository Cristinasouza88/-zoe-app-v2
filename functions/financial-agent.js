/* Netlify Function: recebe um resumo do histórico financeiro do mês
   (receita, despesa, saldo, gastos por categoria) e devolve sugestões de
   economia/investimento em texto, geradas pela API da Anthropic.

   Requer ANTHROPIC_API_KEY configurada no Netlify (Site settings →
   Environment variables). */

const PROMPT_SISTEMA = `Você é um consultor financeiro pessoal, direto e prático, respondendo em português do Brasil.
Receberá um resumo em JSON do mês financeiro de uma pessoa (receita, despesa, saldo, gastos por categoria).
Escreva de 3 a 5 frases curtas com sugestões concretas de economia e/ou investimento com base nesses números — sem rodeios, sem disclaimer genérico, sem markdown.
Se o saldo estiver positivo, sugira para onde direcionar a sobra. Se algum gasto por categoria estiver desproporcional, aponte isso especificamente.`;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ erro: 'ANTHROPIC_API_KEY não configurada no Netlify.' }) };
  }

  let payload;
  try { payload = JSON.parse(event.body || '{}'); } catch { return { statusCode: 400, body: JSON.stringify({ erro: 'JSON inválido.' }) }; }

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
        messages: [{ role: 'user', content: [{ type: 'text', text: JSON.stringify(payload.resumo || {}) }] }]
      })
    });

    if (!resp.ok) {
      const erro = await resp.text();
      return { statusCode: 502, body: JSON.stringify({ erro: `Anthropic API: ${resp.status} ${erro}` }) };
    }

    const dados = await resp.json();
    const texto = (dados.content || []).map(b => b.text || '').join('').trim();
    return { statusCode: 200, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ texto }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ erro: String(e.message || e) }) };
  }
};
