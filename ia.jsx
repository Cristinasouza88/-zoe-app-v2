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
    if (!r.ok) return { ok: false, erro: `Backend respondeu ${r.status}` };
    const dados = await r.json();
    return { ok: true, dados };
  } catch (e) {
    return { ok: false, erro: 'Backend de IA indisponível (verifique se ANTHROPIC_API_KEY está configurada no Netlify).' };
  }
}

/** texto (transcrição de voz) OU imagemBase64+mimeType (foto do recibo) → rascunho de lançamento */
export function parseTransacao({ texto, imagemBase64, mimeType }) {
  return chamar('parse-transaction', texto ? { tipo: 'voz', texto } : { tipo: mimeType === 'application/pdf' ? 'documento' : 'imagem', imagemBase64, mimeType });
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
