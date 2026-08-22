/* Importador econômico de cursos públicos.
   Playlists do YouTube são lidas pela API oficial, sem gastar tokens de IA.
   Requer YOUTUBE_API_KEY no ambiente do Netlify. */

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  body: JSON.stringify(body)
});

const playlistIdDe = valor => {
  try {
    const u = new URL(valor);
    if (!['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'].includes(u.hostname)) return null;
    return u.searchParams.get('list');
  } catch { return null; }
};

const isoMinutos = valor => {
  const m = String(valor || '').match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 10;
  return Math.max(1, Math.ceil((Number(m[1] || 0) * 3600 + Number(m[2] || 0) * 60 + Number(m[3] || 0)) / 60));
};

const textoDe = valor => valor?.simpleText || (valor?.runs || []).map(x => x.text || '').join('') || '';

const tempoMinutos = valor => {
  const partes = String(valor || '').split(':').map(Number);
  if (!partes.length || partes.some(Number.isNaN)) return 10;
  const segundos = partes.reverse().reduce((total, n, i) => total + n * (60 ** i), 0);
  return Math.max(1, Math.ceil(segundos / 60));
};

const coletarVideos = (no, saida = []) => {
  if (!no || typeof no !== 'object') return saida;
  const video = no.playlistVideoRenderer;
  if (video?.videoId) saida.push({
    videoId: video.videoId,
    titulo: textoDe(video.title) || `Vídeo ${saida.length + 1}`,
    minutos: tempoMinutos(textoDe(video.lengthText)),
    thumbnail: video.thumbnail?.thumbnails?.slice(-1)?.[0]?.url || null
  });
  for (const valor of Object.values(no)) coletarVideos(valor, saida);
  return saida;
};

const youtubePublico = async url => {
  const playlistId = playlistIdDe(url);
  if (!playlistId) throw Object.assign(new Error('Cole o link completo de uma playlist do YouTube.'), { status: 400 });
  const resp = await fetch(`https://www.youtube.com/playlist?list=${encodeURIComponent(playlistId)}&hl=pt-BR`, {
    headers: { 'user-agent': 'Mozilla/5.0 (compatible; ZoeCourseImporter/1.0)', 'accept-language': 'pt-BR,pt;q=0.9' }
  });
  const html = await resp.text();
  if (!resp.ok) throw Object.assign(new Error('O YouTube não liberou a leitura desta playlist.'), { status: resp.status });
  const inicio = html.indexOf('var ytInitialData = ');
  const alternativo = html.indexOf('ytInitialData = ');
  const pos = inicio >= 0 ? inicio + 'var ytInitialData = '.length : alternativo >= 0 ? alternativo + 'ytInitialData = '.length : -1;
  if (pos < 0) throw Object.assign(new Error('Não consegui reconhecer os vídeos desta playlist.'), { status: 502 });
  const fim = html.indexOf(';</script>', pos);
  const dados = JSON.parse(html.slice(pos, fim));
  const vistos = new Set();
  const videos = coletarVideos(dados).filter(v => !vistos.has(v.videoId) && vistos.add(v.videoId));
  if (!videos.length) throw Object.assign(new Error('A playlist está vazia, privada ou indisponível.'), { status: 404 });
  const tituloMeta = html.match(/<meta property="og:title" content="([^"]+)"/i)?.[1];
  return {
    tipo: 'youtube', nome: tituloMeta || 'Playlist do YouTube', origem: 'YouTube', url,
    aulas: videos.map(v => ({
      titulo: v.titulo,
      url: `https://www.youtube.com/watch?v=${v.videoId}&list=${playlistId}`,
      minutos: v.minutos,
      thumbnail: v.thumbnail
    }))
  };
};

const youtube = async (url, apiKey) => {
  const playlistId = playlistIdDe(url);
  if (!playlistId) throw Object.assign(new Error('Cole o link completo de uma playlist do YouTube.'), { status: 400 });

  const itens = [];
  let pageToken = '';
  do {
    const qs = new URLSearchParams({ part: 'snippet,contentDetails', maxResults: '50', playlistId, key: apiKey });
    if (pageToken) qs.set('pageToken', pageToken);
    const resp = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?${qs}`);
    const dados = await resp.json();
    if (!resp.ok) throw Object.assign(new Error(dados.error?.message || 'Não foi possível ler a playlist.'), { status: resp.status });
    itens.push(...(dados.items || []).filter(x => x.contentDetails?.videoId));
    pageToken = dados.nextPageToken || '';
  } while (pageToken && itens.length < 500);

  if (!itens.length) throw Object.assign(new Error('A playlist não possui vídeos públicos.'), { status: 404 });

  const ids = itens.map(x => x.contentDetails.videoId);
  const duracoes = {};
  for (let i = 0; i < ids.length; i += 50) {
    const qs = new URLSearchParams({ part: 'contentDetails', id: ids.slice(i, i + 50).join(','), key: apiKey });
    const resp = await fetch(`https://www.googleapis.com/youtube/v3/videos?${qs}`);
    const dados = await resp.json();
    if (!resp.ok) throw Object.assign(new Error(dados.error?.message || 'Não foi possível ler a duração dos vídeos.'), { status: resp.status });
    for (const video of dados.items || []) duracoes[video.id] = isoMinutos(video.contentDetails?.duration);
  }

  const metaQs = new URLSearchParams({ part: 'snippet', id: playlistId, key: apiKey });
  const metaResp = await fetch(`https://www.googleapis.com/youtube/v3/playlists?${metaQs}`);
  const meta = await metaResp.json();
  const titulo = meta.items?.[0]?.snippet?.title || 'Playlist do YouTube';

  return {
    tipo: 'youtube', nome: titulo, origem: 'YouTube', url,
    aulas: itens.map((x, i) => {
      const videoId = x.contentDetails.videoId;
      return {
        titulo: x.snippet?.title || `Vídeo ${i + 1}`,
        url: `https://www.youtube.com/watch?v=${videoId}&list=${playlistId}`,
        minutos: duracoes[videoId] || 10,
        thumbnail: x.snippet?.thumbnails?.medium?.url || null
      };
    })
  };
};

exports.handler = async event => {
  if (event.httpMethod !== 'POST') return json(405, { erro: 'Método não permitido.' });
  let payload;
  try { payload = JSON.parse(event.body || '{}'); } catch { return json(400, { erro: 'Dados inválidos.' }); }
  const url = String(payload.url || '').trim();
  if (!url) return json(400, { erro: 'Informe a URL do curso ou playlist.' });

  if (playlistIdDe(url)) {
    const apiKey = process.env.YOUTUBE_API_KEY;
    try { return json(200, apiKey ? await youtube(url, apiKey) : await youtubePublico(url)); }
    catch (e) { return json(e.status || 500, { erro: e.message || 'Falha ao importar a playlist.' }); }
  }

  let plataforma = 'Plataforma do curso';
  try { plataforma = new URL(url).hostname.replace(/^www\./, ''); } catch { return json(400, { erro: 'Digite uma URL completa iniciando com https://.' }); }
  return json(200, { tipo: 'protegido', plataforma, url, requerLogin: true });
};
