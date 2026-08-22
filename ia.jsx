/* ══════════ Cliente das Netlify Functions de IA ══════════
   Chama o backend serverless (netlify/functions/*) que fala com a API da
   Anthropic usando a chave guardada só no servidor. Se o backend não
   estiver configurado (ex.: rodando local sem `netlify dev`, ou a chave
   ainda não foi cadastrada no Netlify), as chamadas falham de forma
   silenciosa e a tela volta para o preenchimento manual — nunca trava o
   fluxo do usuário. */

async function chamar(caminho, corpo) {
  try {
    const r = await fetch(`/.netlify/functions/${caminho}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo)
    });
    const dados = await r.json().catch(() => ({}));
    if (!r.ok) {
      const mensagem = String(dados.erro || dados.message || `Não foi possível processar o documento (${r.status})`)
        .replace(/^Anthropic API:\s*\d+\s*/i, '')
        .replace(/\{"type":"error","error":\{"type":"[^"]+","message":"([^"]+)"\}[^}]*\}.*/i, '$1');
      return { ok: false, erro: mensagem };
    }
    return { ok: true, dados };
  } catch (e) {
    return { ok: false, erro: 'Backend de IA indisponível (verifique se ANTHROPIC_API_KEY está configurada no Netlify).' };
  }
}

/** texto (transcrição de voz) OU imagemBase64+mimeType (foto do recibo) → rascunho de lançamento */
export function parseTransacao({ texto, imagemBase64, mimeType }) {
  return chamar('parse-transaction', texto ? { tipo: 'voz', texto } : { tipo: mimeType === 'application/pdf' ? 'documento' : 'imagem', imagemBase64, mimeType });
}

/** descrições únicas de um CSV → categorias sugeridas pela IA */
export function classificarDescricoesCsv(descricoes) {
  return chamar('parse-transaction', { tipo: 'csv', descricoes });
}

/** resumo do histórico/metas → sugestões em texto do agente financeiro */
export function pedirSugestoes(resumo) {
  return chamar('financial-agent', { resumo });
}

/** Web Speech API — grava e transcreve localmente no navegador, sem backend */
export function reconhecimentoDisponivel() {
  return typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function iniciarReconhecimentoVoz({ onResultado, onErro }) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { onErro && onErro('Reconhecimento de voz não é suportado neste navegador.'); return null; }
  const rec = new SR();
  rec.lang = 'pt-BR';
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  rec.onresult = (ev) => onResultado(ev.results[0][0].transcript);
  rec.onerror = (ev) => onErro && onErro(ev.error);
  rec.start();
  return rec;
}
