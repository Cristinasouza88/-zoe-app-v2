import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Home, Route, Plus, Utensils, TrendingUp, Camera, ImagePlus, Bell, BellRing, ChevronLeft, ChevronRight,
  X, Check, Lock, Timer, Droplets, Dumbbell, BookOpen, Film, Video, Sparkles, Target,
  Heart, Scale, Circle, LogOut, Flame, Trash2, Compass, PenLine, ClipboardList, Sun,
  Wallet, Languages, Trophy, Moon, Smile, CheckCircle2, Zap, CalendarDays, ChevronDown, ChevronUp, MessageCircle
} from 'lucide-react';
import { TRILHA, RODA_SETORES, RITUAL_ACORDAR, VISAO_PILARES, RESUMO_VISAO, PILARES, VINCULOS, totalEtapas } from './conteudo';
import { store, C, sobre, CLARAS, hoje, CSS, Card, Btn, Campo, Area, Barra, Sheet, Wordmark, Foto, GraficoBarras, GraficoLinha } from './ui.jsx';
import Financeiro from './Financeiro.jsx';
import Ingles from './Ingles.jsx';
import Dopamina from './Dopamina.jsx';
import Conquistas from './Conquistas.jsx';
import { FASES as FASES_INGLES } from './ingles.data';
import { totalLicoesDopamina } from './dopamina.data';
import { formatoMoeda, METAANUAL_PADRAO } from './financeiro.data';
import { supabase } from './supabase.js';
import avatarZoeFun from './avatar-zoe-fun.data.js';
import avatarZoeEssencial from './avatar-zoe-essencial.data.js';

/* ══════════ FOTOS ══════════
   As imagens são comprimidas antes de salvar (lado maior 900px, jpeg 72%),
   porque o armazenamento do navegador é limitado. Cada foto vai numa chave
   própria e o índice guarda só os metadados. */

const comprimirImagem = (file, maxLado = 900, q = 0.72) => new Promise((res, rej) => {
  const fr = new FileReader();
  fr.onerror = () => rej(new Error('leitura'));
  fr.onload = () => {
    const img = new Image();
    img.onerror = () => rej(new Error('imagem'));
    img.onload = () => {
      try {
        let w = img.width, h = img.height;
        const esc = Math.min(1, maxLado / Math.max(w, h));
        w = Math.round(w * esc); h = Math.round(h * esc);
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        res(c.toDataURL('image/jpeg', q));
      } catch (e) { rej(e); }
    };
    img.src = fr.result;
  };
  fr.readAsDataURL(file);
});

const CATEGORIAS_FOTO = [
  { id: 'corpo', nome: 'Corpo', icone: '🪞' },
  { id: 'estudo', nome: 'Estudo', icone: '📚' },
  { id: 'treino', nome: 'Treino', icone: '🏋️' },
  { id: 'refeicao', nome: 'Refeição', icone: '🍽️' },
  { id: 'momento', nome: 'Momento', icone: '✨' }
];

const diasEntre = (a, b) => Math.round(Math.abs(new Date(b + 'T12:00') - new Date(a + 'T12:00')) / 86400000);

const DIAS_ORD = [1, 2, 3, 4, 5, 6, 0];
const DIAS_LBL = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];

function RodaGrafico({ valores, cor = C.green }) {
  const [pronto, setPronto] = useState(false);
  useEffect(() => { const t = setTimeout(() => setPronto(true), 60); return () => clearTimeout(t); }, []);
  const n = RODA_SETORES.length, cx = 110, cy = 110, R = 88;
  const pt = (i, v) => {
    const ang = (i / n) * Math.PI * 2 - Math.PI / 2;
    const r = (v / 10) * R;
    return [cx + Math.cos(ang) * r, cy + Math.sin(ang) * r];
  };
  const poly = RODA_SETORES.map((s, i) => pt(i, valores[s] || 0).map(x => x.toFixed(1)).join(',')).join(' ');
  return (
    <svg viewBox="0 0 220 220" style={{ width: '100%', maxWidth: 260, display: 'block', margin: '0 auto' }}>
      {[2, 4, 6, 8, 10].map(a => (
        <polygon key={a} points={RODA_SETORES.map((s, i) => pt(i, a).map(x => x.toFixed(1)).join(',')).join(' ')}
          fill="none" stroke={C.line} strokeWidth="1" />
      ))}
      {RODA_SETORES.map((s, i) => {
        const p = pt(i, 10);
        return <line key={s} x1={cx} y1={cy} x2={p[0]} y2={p[1]} stroke={C.line} strokeWidth="1" />;
      })}
      <polygon points={poly} fill={cor} fillOpacity=".22" stroke={cor} strokeWidth="2.4" strokeLinejoin="round"
        style={{ transformOrigin: '110px 110px', transform: pronto ? 'scale(1)' : 'scale(0)', transition: 'transform .8s cubic-bezier(.34,1.4,.64,1)' }} />
      {RODA_SETORES.map((s, i) => {
        const p = pt(i, (valores[s] || 0));
        return (valores[s] ? <circle key={s} cx={p[0]} cy={p[1]} r="3" fill="#fff" stroke={cor} strokeWidth="2"
          style={{ opacity: pronto ? 1 : 0, transition: `opacity .3s ease ${.6 + i * .04}s` }} /> : null);
      })}
    </svg>
  );
}

/* ══════════ LOGIN ══════════ */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.205c0-.638-.057-1.252-.164-1.841H9v3.482h4.844a4.14 4.14 0 0 1-1.797 2.715v2.259h2.909c1.702-1.567 2.684-3.875 2.684-6.615Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.468-.806 5.956-2.18l-2.909-2.259c-.806.54-1.835.859-3.047.859-2.344 0-4.328-1.585-5.037-3.714H.956v2.332A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.963 10.706A5.42 5.42 0 0 1 3.681 9c0-.592.102-1.168.282-1.706V4.962H.956A9 9 0 0 0 0 9c0 1.452.347 2.827.956 4.038l3.007-2.332Z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.507.454 3.441 1.346l2.581-2.581C13.464.892 11.426 0 9 0A9 9 0 0 0 .956 4.962l3.007 2.332C4.672 5.165 6.656 3.58 9 3.58Z" />
    </svg>
  );
}

function ZoeContaIcon({ tamanho = 36 }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 40 40" aria-hidden="true">
      <rect x="2" y="2" width="36" height="36" rx="13" fill="#A8FF00" />
      <ellipse cx="14.5" cy="18" rx="4.3" ry="5.2" fill="#fff" />
      <ellipse cx="25.5" cy="18" rx="4.3" ry="5.2" fill="#fff" />
      <circle cx="15.4" cy="19" r="2.1" fill="#075B59" />
      <circle cx="24.6" cy="19" r="2.1" fill="#075B59" />
      <path d="M14 26.2c1.8 2.6 4 3.8 6 3.8s4.2-1.2 6-3.8" fill="none" stroke="#075B59" strokeWidth="2.3" strokeLinecap="round" />
    </svg>
  );
}

function NovaSenha({ onConcluir }) {
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const salvarNovaSenha = async () => {
    setErro('');
    if (senha.length < 6) return setErro('A senha precisa ter pelo menos 6 caracteres');
    if (senha !== confirmacao) return setErro('As senhas não são iguais');
    setSalvando(true);
    const { data, error } = await supabase.auth.updateUser({ password: senha });
    setSalvando(false);
    if (error) return setErro('Não foi possível salvar. Solicite um novo link.');
    window.history.replaceState({}, document.title, window.location.pathname);
    const u = data.user;
    onConcluir({
      nome: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'Você',
      email: u.email,
      id: u.id
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', marginBottom: 28, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Wordmark altura={58} />
        <h1 style={{ color: C.ink, fontSize: 22, margin: '22px 0 6px' }}>Crie uma nova senha</h1>
        <p style={{ color: C.ink2, fontSize: 13, margin: 0 }}>Use pelo menos 6 caracteres</p>
      </div>
      <Card style={{ padding: 22 }}>
        <Campo label="Nova senha" type="password" placeholder="Mínimo de 6 caracteres" value={senha} onChange={e => setSenha(e.target.value)} />
        <Campo label="Confirmar nova senha" type="password" placeholder="Digite novamente" value={confirmacao} onChange={e => setConfirmacao(e.target.value)} onKeyDown={e => e.key === 'Enter' && salvarNovaSenha()} />
        {erro && <p style={{ color: C.coral, fontSize: 13, fontWeight: 600, margin: '0 0 12px' }}>{erro}</p>}
        <Btn onClick={salvarNovaSenha} disabled={salvando} style={{ width: '100%', padding: 15 }}>
          {salvando ? 'Salvando...' : 'Salvar nova senha'}
        </Btn>
      </Card>
    </div>
  );
}

function Login({ onEntrar }) {
  const [modo, setModo] = useState('entrar');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const oauthError = params.get('error_description') || hash.get('error_description');
    if (oauthError) {
      setErro(decodeURIComponent(oauthError.replace(/\+/g, ' ')));
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const traduzirErro = (message = '') => {
    if (/invalid login credentials/i.test(message)) return 'E-mail ou senha incorretos';
    if (/user already registered/i.test(message)) return 'Esse e-mail já tem uma conta. Entre.';
    if (/password should be at least/i.test(message)) return 'A senha precisa ter pelo menos 6 caracteres';
    if (/email rate limit/i.test(message)) return 'Muitas tentativas. Aguarde alguns minutos.';
    return 'Não foi possível continuar. Tente novamente.';
  };

  const submeter = async () => {
    setErro(''); setMensagem('');
    if (!email.includes('@')) return setErro('Digite um e-mail válido');
    if (senha.length < 6) return setErro('A senha precisa ter pelo menos 6 caracteres');
    if (modo === 'criar' && !nome.trim()) return setErro('Como você quer ser chamada?');

    setEnviando(true);
    try {
      if (modo === 'criar') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password: senha,
          options: {
            data: { full_name: nome.trim() },
            emailRedirectTo: window.location.origin
          }
        });
        if (error) throw error;
        if (data.session && data.user) {
          onEntrar({ nome: nome.trim(), email: data.user.email, id: data.user.id });
        } else {
          setMensagem('Conta criada! Confira seu e-mail para confirmar o cadastro.');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password: senha
        });
        if (error) throw error;
        const u = data.user;
        onEntrar({
          nome: u.user_metadata?.full_name || u.email?.split('@')[0] || 'Você',
          email: u.email,
          id: u.id
        });
      }
    } catch (e) {
      setErro(traduzirErro(e.message));
    } finally {
      setEnviando(false);
    }
  };

  const entrarGoogle = async () => {
    setErro(''); setMensagem(''); setEnviando(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) {
      setErro(traduzirErro(error.message));
      setEnviando(false);
    }
  };

  const recuperarSenha = async () => {
    setErro(''); setMensagem('');
    if (!email.includes('@')) return setErro('Digite seu e-mail primeiro');
    setEnviando(true);
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: window.location.origin }
    );
    setEnviando(false);
    if (error) return setErro(traduzirErro(error.message));
    setMensagem('Enviamos o link para redefinir sua senha.');
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -140, right: -110, width: 320, height: 320, borderRadius: '50%', filter: 'blur(80px)', opacity: .2, background: `conic-gradient(from 40deg, ${C.lima}, ${C.aqua}, ${C.azul}, ${C.lima})` }} />
      <div className="zoe-surge" style={{ textAlign: 'center', marginBottom: 30, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Wordmark altura={58} />
        <p style={{ color: C.ink2, fontSize: 13.5, marginTop: 16 }}>Sua vida extraordinária, um dia por vez</p>
      </div>
      <Card cls="zoe-surge" style={{ padding: 22, animationDelay: '120ms' }}>
        <div style={{ display: 'flex', background: '#F2F5F4', borderRadius: 12, padding: 4, marginBottom: 20 }}>
          {[['entrar', 'Entrar'], ['criar', 'Criar conta']].map(([k, l]) => (
            <button key={k} onClick={() => { setModo(k); setErro(''); setMensagem(''); }} style={{
              flex: 1, padding: 10, borderRadius: 9, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'inherit',
              background: modo === k ? C.card : 'transparent', color: modo === k ? C.ink : C.ink2,
              boxShadow: modo === k ? '0 1px 3px rgba(0,0,0,.08)' : 'none'
            }}>{l}</button>
          ))}
        </div>
        <button onClick={entrarGoogle} disabled={enviando} style={{
          width: '100%', padding: 13, marginBottom: 14, borderRadius: 12, border: `1.5px solid ${C.line}`,
          background: '#fff', color: C.ink, cursor: enviando ? 'wait' : 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
        }}><GoogleIcon /> Continuar com Google</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, color: C.ink3, fontSize: 11 }}>
          <span style={{ height: 1, background: C.line, flex: 1 }} /><span>ou use seu e-mail</span><span style={{ height: 1, background: C.line, flex: 1 }} />
        </div>
        {modo === 'criar' && <Campo label="Nome" placeholder="Como quer ser chamada" value={nome} onChange={e => setNome(e.target.value)} />}
        <Campo label="E-mail" type="email" placeholder="voce@email.com" value={email} onChange={e => setEmail(e.target.value)} />
        <Campo label="Senha" type="password" placeholder="Mínimo de 6 caracteres" value={senha} onChange={e => setSenha(e.target.value)} onKeyDown={e => e.key === 'Enter' && submeter()} />
        {modo === 'entrar' && (
          <button onClick={recuperarSenha} disabled={enviando} style={{ background: 'none', border: 'none', padding: 0, margin: '-4px 0 14px', color: C.greenDark, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            Esqueci minha senha
          </button>
        )}
        {erro && <p style={{ color: C.coral, fontSize: 13, fontWeight: 600, margin: '0 0 12px' }}>{erro}</p>}
        {mensagem && <p style={{ color: C.greenDark, fontSize: 13, fontWeight: 600, lineHeight: 1.45, margin: '0 0 12px' }}>{mensagem}</p>}
        <Btn onClick={submeter} disabled={enviando} style={{ width: '100%', padding: 15, fontSize: 15 }}>
          {enviando ? 'Aguarde...' : modo === 'criar' ? 'Criar minha conta' : 'Entrar'}
        </Btn>
        <p style={{ fontSize: 11, color: C.ink3, textAlign: 'center', marginTop: 14 }}>Login protegido pelo Supabase</p>
      </Card>
    </div>
  );
}

/* ══════════ ESTADO ══════════ */
const inicial = {
  perfil: { nome: '', email: '', metaKcal: 1500, metaAgua: 3000, avatar: null },
  etapas: {},        // { 's4-diagnostico': {feito:true, data:'...'} }
  agenda: {},        // { '2026-08-09': { 's1-agenda-3': true } }
  dias: {},
  campos: {},        // respostas livres por chave
  rodas: {},         // { 1: {Saúde:7,...} }
  desafio100: {}, ativacao40: { frase: '', marcas: {} }, caracteristicas: [],
  visao: {}, medidas: [], biblioteca: [], ritual: {}, jejum: null, alarmes: [],
  metasSOL: [], redes: [], cartas: {}, gratidoes: [], fotos: []
};

/* ══════════ APP ══════════ */
export default function ZoeApp() {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [recuperandoSenha, setRecuperandoSenha] = useState(
    () => window.location.hash.includes('type=recovery') || window.location.search.includes('type=recovery')
  );
  const [d, setD] = useState(inicial);
  const avatarId = d.perfil?.avatar || 'fun';
  const avatarImagem = avatarId === 'essencial' ? avatarZoeEssencial : avatarZoeFun;
  const [aba, setAba] = useState('inicio');
  const [data, setData] = useState(hoje());
  const [etapaAberta, setEtapaAberta] = useState(null);
  const [sessoesAbertas, setSessoesAbertas] = useState({});
  const [coach, setCoach] = useState(null);
  const [fab, setFab] = useState(false);
  const [maisAberto, setMaisAberto] = useState(false);
  const [sheet, setSheet] = useState(null);
  const [toast, setToast] = useState('');
  const [refAtiva, setRefAtiva] = useState('Café da manhã');
  const [periodo, setPeriodo] = useState('semana');
  const [cron, setCron] = useState({ rodando: false, seg: 300 });
  const [, setTick] = useState(0);
  const [forms, setForms] = useState({
    alimento: { nome: '', kcal: '', carb: '', prot: '', gord: '' },
    medida: { peso: '', cintura: '', barriga: '', altura: '' },
    biblioteca: { titulo: '', autor: '', nota: '', resenha: '' }, tipoMidia: 'Livro',
    alarme: { titulo: '', hora: '05:00', dias: [1, 2, 3, 4, 5] },
    metaSOL: { pilar: PILARES[0], oQue: '', quem: '', quando: '', recursos: '' },
    rede: { nome: '', pessoas: '', estrategia: '' }, catFoto: 'corpo'
  });
  const setForm = (k, p) => setForms(f => ({ ...f, [k]: typeof p === 'function' ? p(f[k]) : { ...f[k], ...p } }));

  useEffect(() => {
    let ativo = true;

    const aplicarSessao = (session) => {
      const u = session?.user;
      if (!u) {
        if (ativo) {
          setUsuario(null);
          setD(inicial);
          setCarregando(false);
        }
        return;
      }

      const perfil = {
        nome: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'Você',
        email: u.email,
        id: u.id
      };

      // Atualiza a tela imediatamente. A leitura dos dados locais acontece depois,
      // fora do callback do Supabase, para não bloquear o retorno do OAuth.
      if (ativo) {
        setUsuario(perfil);
        setCarregando(false);
      }
      store.get(`zoe:dados:${perfil.email}`).then(dd => {
        if (!ativo) return;
        setD(dd ? { ...inicial, ...dd } : {
          ...inicial,
          perfil: { ...inicial.perfil, nome: perfil.nome, email: perfil.email }
        });
      });
    };

    const veioDeRecuperacao = window.location.hash.includes('type=recovery') ||
      window.location.search.includes('type=recovery');

    supabase.auth.getSession().then(({ data, error }) => {
      if (!ativo) return;
      if (error) {
        setCarregando(false);
        return;
      }
      if (veioDeRecuperacao) {
        setRecuperandoSenha(true);
        setCarregando(false);
        return;
      }
      aplicarSessao(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setRecuperandoSenha(true);
        setCarregando(false);
        return;
      }
      // Evita operações assíncronas dentro do callback de autenticação.
      setTimeout(() => aplicarSessao(session), 0);
    });

    return () => {
      ativo = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  /* só liga o relógio quando alguma coisa depende dele */
  const precisaRelogio = cron.rodando || !!d.jejum;
  useEffect(() => {
    if (!precisaRelogio) return;
    const t = setInterval(() => {
      setTick(x => x + 1);
      setCron(c => c.rodando ? (c.seg <= 1 ? { rodando: false, seg: 300 } : { ...c, seg: c.seg - 1 }) : c);
    }, 1000);
    return () => clearInterval(t);
  }, [precisaRelogio]);

  const salvar = n => { setD(n); if (usuario) store.set(`zoe:dados:${usuario.email}`, n); };
  const up = fn => salvar(fn(d));
  const aviso = m => { setToast(m); setTimeout(() => setToast(''), 2300); };

  const entrar = async u => {
    setUsuario(u);
    const dd = await store.get(`zoe:dados:${u.email}`);
    setD(dd ? { ...inicial, ...dd } : { ...inicial, perfil: { ...inicial.perfil, nome: u.nome, email: u.email } });
  };
  const sair = async () => {
    await supabase.auth.signOut();
    setUsuario(null);
    setD(inicial);
  };

  /* ── trilha: sequência linear de etapas ── */
  const sequencia = useMemo(() => TRILHA.flatMap(b => b.etapas.map(e => ({ ...e, bloco: b }))), []);
  const feito = id => !!d.etapas[id]?.feito;
  const indiceAtual = useMemo(() => {
    const i = sequencia.findIndex(e => !feito(e.id));
    return i === -1 ? sequencia.length - 1 : i;
  }, [d.etapas, sequencia]);
  const liberada = id => {
    const i = sequencia.findIndex(e => e.id === id);
    return i <= indiceAtual;
  };
  const etapaAtual = sequencia[indiceAtual];
  const concluidas = sequencia.filter(e => feito(e.id)).length;

  const respostasDaSessao = (bloco) => {
    const ids = bloco.etapas.map(x => x.id);
    return Object.entries(d.campos)
      .filter(([k, v]) => v && String(v).trim() && ids.some(id => k.includes(id)))
      .map(([, v]) => String(v).trim()).slice(-3);
  };

  const resumoCoach = (bloco) => {
    const respostas = respostasDaSessao(bloco);
    const percebeu = respostas.length
      ? `Nas suas respostas, você trouxe pontos importantes como “${respostas[0].slice(0, 120)}${respostas[0].length > 120 ? '…' : ''}”. Isso mostra que você já começou a transformar percepção em consciência.`
      : `Você concluiu ${bloco.nome}. Mesmo quando a resposta ainda não está totalmente clara, terminar esta sessão já é um movimento de consciência e compromisso com você.`;
    return {
      tipo: 'sessao',
      bloco,
      titulo: `Você concluiu ${bloco.nome}`,
      texto: percebeu,
      reflexoes: [
        'O que ficou mais claro sobre você depois desta sessão?',
        'Qual comportamento pequeno pode provar essa mudança ainda nesta semana?',
        'O que a ZOE deve te lembrar quando você perder o ritmo?'
      ]
    };
  };

  const abrirProximaEtapa = (id) => {
    const i = sequencia.findIndex(x => x.id === id);
    const proxima = sequencia[i + 1];
    if (proxima) {
      setAba('trilha');
      setEtapaAberta(proxima.id);
      setSessoesAbertas(a => ({ ...a, [proxima.bloco.id]: true }));
    } else {
      setEtapaAberta(null);
      setAba('trilha');
    }
  };

  const concluirEtapa = (id) => {
    const era = feito(id);
    const etapa = sequencia.find(x => x.id === id);
    up(s => ({ ...s, etapas: { ...s.etapas, [id]: era ? { feito: false } : { feito: true, data: hoje(), concluidaEm: new Date().toISOString() } } }));
    if (era) return aviso('Conclusão desfeita.');
    const ultimaDaSessao = etapa.bloco.etapas[etapa.bloco.etapas.length - 1]?.id === id;
    if (ultimaDaSessao) {
      setCoach(resumoCoach(etapa.bloco));
      setSessoesAbertas(a => ({ ...a, [etapa.bloco.id]: false }));
    } else {
      setCoach({
        tipo: 'etapa', bloco: etapa.bloco, etapaId: id,
        titulo: 'Missão concluída!',
        texto: `Você concluiu “${etapa.titulo}”. Um passo pequeno, mas concreto, na direção da vida que está construindo. A próxima missão já está pronta para você.`
      });
    }
  };

  const campo = (k) => d.campos[k] || '';
  const setCampo = (k, v) => up(s => ({ ...s, campos: { ...s.campos, [k]: v } }));

  /* ── agenda do dia: pega a agenda da sessão mais avançada já liberada ── */
  const agendaAtiva = useMemo(() => {
    const agendas = sequencia.filter(e => e.tipo === 'agenda' && liberada(e.id));
    return agendas.length ? agendas[agendas.length - 1] : sequencia.find(e => e.tipo === 'agenda');
  }, [indiceAtual, sequencia]);

  const marcasDia = d.agenda[data] || {};
  const pontosDia = useMemo(() => !agendaAtiva ? 0 :
    agendaAtiva.tarefas.reduce((a, t, i) => a + (marcasDia[`${agendaAtiva.id}-${i}`] ? t.p : 0), 0),
    [marcasDia, agendaAtiva]);

  /* preenchimento cruzado: marcar tarefa na agenda preenche a ferramenta ligada */
  const toggleTarefaDe = (etapa, i) => {
    const t = etapa.tarefas[i];
    const k = `${etapa.id}-${i}`;
    const marcas = d.agenda[data] || {};
    const novoValor = !marcas[k];
    const v = VINCULOS.find(x => x.padrao.test(t.t));
    up(s => {
      let n = { ...s, agenda: { ...s.agenda, [data]: { ...(s.agenda[data] || {}), [k]: novoValor } } };
      if (v && novoValor && v.ferramenta === 'ritual') {
        const m = {}; RITUAL_ACORDAR.forEach(r => m[r.n] = true);
        n = { ...n, ritual: { ...n.ritual, [data]: m } };
      }
      return n;
    });
    if (v && novoValor && v.ferramenta === 'ritual') aviso('Ritual do dia preenchido junto');
  };
  const toggleTarefa = (i) => agendaAtiva && toggleTarefaDe(agendaAtiva, i);

  /* preenchimento automático inverso: completar ritual marca a tarefa */
  const marcarTarefaPorNome = (regex) => {
    if (!agendaAtiva) return;
    const i = agendaAtiva.tarefas.findIndex(t => regex.test(t.t));
    if (i < 0) return;
    const k = `${agendaAtiva.id}-${i}`;
    if (marcasDia[k]) return;
    up(s => ({ ...s, agenda: { ...s.agenda, [data]: { ...(s.agenda[data] || {}), [k]: true } } }));
  };

  /* ── fotos ── */
  const inputFoto = useRef(null);
  const [ctxFoto, setCtxFoto] = useState({ cat: 'corpo', etapaId: null });
  const [visor, setVisor] = useState(null);
  const [comparar, setComparar] = useState([]);

  const pedirFoto = (cat, etapaId = null) => {
    setCtxFoto({ cat, etapaId });
    if (inputFoto.current) { inputFoto.current.value = ''; inputFoto.current.click(); }
  };

  const receberFoto = async (ev) => {
    const file = ev.target.files && ev.target.files[0];
    if (!file) return;
    let dataUrl;
    try {
      dataUrl = await comprimirImagem(file);
    } catch {
      /* plano B: navegador não decodificou (HEIC, por exemplo). Guarda o original se for pequeno. */
      try {
        if (file.size > 1600000) { aviso('Essa imagem é grande demais. Tente exportar como JPG.'); return; }
        dataUrl = await new Promise((res, rej) => {
          const fr = new FileReader();
          fr.onload = () => res(fr.result); fr.onerror = () => rej(new Error('x'));
          fr.readAsDataURL(file);
        });
      } catch { return aviso('Não consegui ler essa imagem'); }
    }
    try {
      const id = 'f' + Date.now();
      const ok = await store.set(`zoe:foto:${usuario.email}:${id}`, dataUrl);
      if (!ok) return aviso('Não consegui salvar. O armazenamento pode estar cheio.');
      cacheFotos.set(id, dataUrl);
      up(s => ({ ...s, fotos: [{ id, data: hoje(), cat: ctxFoto.cat, etapaId: ctxFoto.etapaId, legenda: '' }, ...s.fotos] }));
      aviso('Foto salva no diário');
    } catch {
      aviso('Não consegui ler essa imagem');
    }
  };

  const apagarFoto = (id) => {
    cacheFotos.delete(id);
    store.set(`zoe:foto:${usuario.email}:${id}`, null);
    up(s => ({ ...s, fotos: s.fotos.filter(f => f.id !== id) }));
    setVisor(null);
    setComparar(c => c.filter(x => x !== id));
  };

  const dia = { kcal: 0, agua: 0, passos: 0, sono: 0, humor: 0, treino: 0, refeicoes: [], ...(d.dias[data] || {}) };
  const setDia = p => up(s => ({ ...s, dias: { ...s.dias, [data]: { ...dia, ...p } } }));

  const streak = useMemo(() => {
    let n = 0;
    for (let i = 0; i < 400; i++) {
      const dt = new Date(); dt.setDate(dt.getDate() - i);
      const iso = dt.toISOString().split('T')[0];
      const m = d.agenda[iso] || {};
      const tem = Object.values(m).some(Boolean);
      if (tem) n++; else if (i > 0) break;
    }
    return n;
  }, [d.agenda]);

  /* alarmes */
  const tocou = useRef({});
  useEffect(() => {
    const t = setInterval(() => {
      const a = new Date();
      const hm = `${String(a.getHours()).padStart(2, '0')}:${String(a.getMinutes()).padStart(2, '0')}`;
      d.alarmes.forEach(al => {
        if (!al.ativo || al.hora !== hm || !al.dias.includes(a.getDay())) return;
        const c = `${al.id}-${hoje()}-${hm}`;
        if (tocou.current[c]) return;
        tocou.current[c] = true;
        aviso(`⏰ ${al.titulo}`);
        try { if (typeof Notification !== 'undefined' && Notification.permission === 'granted') new Notification('Zoë', { body: al.titulo }); } catch { }
      });
    }, 20000);
    return () => clearInterval(t);
  }, [d.alarmes]);

  const permissao = async () => {
    try {
      if (typeof Notification === 'undefined') return aviso('Notificações indisponíveis aqui');
      const p = await Notification.requestPermission();
      aviso(p === 'granted' ? 'Notificações ativadas' : 'Notificações bloqueadas');
    } catch { aviso('Não foi possível ativar'); }
  };

  if (carregando) return <div style={{ minHeight: '100vh', background: C.bg }} />;
  if (recuperandoSenha) return <><style>{CSS}</style><NovaSenha onConcluir={async u => {
    setRecuperandoSenha(false);
    await entrar(u);
  }} /></>;
  if (!usuario) return <><style>{CSS}</style><Login onEntrar={entrar} /></>;

  /* ══════════ FERRAMENTAS DENTRO DA ETAPA ══════════ */
  const Ferramenta = ({ id, etapa }) => {
    switch (id) {

      case 'decisoes': return (
        <div>
          {PILARES.map(p => (
            <div key={p} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.ink2, marginBottom: 5 }}>{p}</div>
              <input value={campo(`dec-${p}`)} onChange={e => setCampo(`dec-${p}`, e.target.value)}
                placeholder="Ação com data e horário"
                style={{ width: '100%', padding: '11px 13px', borderRadius: 12, border: `1.5px solid ${C.line}`, fontSize: 14, fontFamily: 'inherit', color: C.ink, outline: 'none', background: '#FAFCFB' }} />
            </div>
          ))}
        </div>
      );

      case 'medidas': {
        const m = forms.medida, ult = d.medidas[0];
        const imc = (p, a) => (a && p) ? (p / ((a / 100) ** 2)).toFixed(1) : null;
        return (
          <div>
            {ult && <Card style={{ marginBottom: 14, background: '#FAFCFB' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                {[['Peso', ult.peso, 'kg'], ['Cintura', ult.cintura, 'cm'], ['Barriga', ult.barriga, 'cm'], ['IMC', imc(ult.peso, ult.altura) || '-', '']].map(([l, v, u]) => (
                  <div key={l} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 17, fontWeight: 800, color: C.ink }}>{v || '-'}</div>
                    <div style={{ fontSize: 10, color: C.ink3 }}>{l} {u}</div>
                  </div>
                ))}
              </div>
            </Card>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Campo label="Peso (kg)" type="number" inputMode="decimal" value={m.peso} onChange={e => setForm('medida', { peso: e.target.value })} />
              <Campo label="Altura (cm)" type="number" inputMode="numeric" value={m.altura} onChange={e => setForm('medida', { altura: e.target.value })} />
              <Campo label="Cintura (cm)" type="number" inputMode="decimal" value={m.cintura} onChange={e => setForm('medida', { cintura: e.target.value })} />
              <Campo label="Barriga (cm)" type="number" inputMode="decimal" value={m.barriga} onChange={e => setForm('medida', { barriga: e.target.value })} />
            </div>
            <Btn style={{ width: '100%' }} onClick={() => {
              if (!m.peso) return aviso('Informe ao menos o peso');
              up(s => ({ ...s, medidas: [{ peso: +m.peso, cintura: +m.cintura, barriga: +m.barriga, altura: +m.altura || (s.medidas[0]?.altura || 0), data: hoje() }, ...s.medidas] }));
              setForm('medida', { peso: '', cintura: '', barriga: '' }); aviso('Medidas registradas');
            }}>Registrar medidas</Btn>
            {d.medidas.length > 1 && <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.ink2, marginBottom: 8 }}>Evolução do peso</div>
              <GraficoLinha dados={[...d.medidas].reverse().map(x => x.peso)} cor={C.sky} />
            </div>}
          </div>
        );
      }

      case 'visao': return (
        <div>
          {VISAO_PILARES.map(p => (
            <Card key={p.id} style={{ marginBottom: 12, borderLeft: `4px solid ${C.green}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 19 }}>{p.icone}</span>
                <span style={{ fontWeight: 800, color: C.ink, fontSize: 14 }}>{p.nome}</span>
              </div>
              <div style={{ background: '#FAFCFB', borderRadius: 12, padding: 12, marginBottom: 10 }}>
                {p.texto.map((t, i) => <p key={i} style={{ margin: '0 0 5px', fontSize: 13, color: C.ink2, lineHeight: 1.5 }}>{t}</p>)}
              </div>
              <Area placeholder="Reescreva com as suas palavras, no presente" value={campo(`visao-${p.id}`)} onChange={e => setCampo(`visao-${p.id}`, e.target.value)} style={{ minHeight: 70, marginBottom: 0 }} />
            </Card>
          ))}
          <Card style={{ background: C.petroleo, color: '#fff' }}>
            <div style={{ fontSize: 12, opacity: .7, fontWeight: 700, marginBottom: 6 }}>Resumo da visão extraordinária</div>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{RESUMO_VISAO}</p>
          </Card>
        </div>
      );

      case 'caracteristicas': {
        const preenchidas = d.caracteristicas.filter(x => x && x.trim()).length;
        return (
          <div>
            <Card style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.ink2 }}>Preenchidas</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: C.green }}>{preenchidas} de 30</span>
              </div>
              <Barra v={preenchidas} max={30} cor={C.lima} />
            </Card>
            {Array.from({ length: 30 }, (_, i) => (
              <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'center', marginBottom: 7 }}>
                <div style={{ width: 28, height: 28, borderRadius: 9, flexShrink: 0, background: d.caracteristicas[i] ? C.mint : '#F2F5F4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: C.ink2 }}>{i + 1}</div>
                <input value={d.caracteristicas[i] || ''} placeholder="Eu sou..."
                  onChange={e => { const a = [...d.caracteristicas]; a[i] = e.target.value; up(s => ({ ...s, caracteristicas: a })); }}
                  onBlur={() => { if (d.caracteristicas.filter(x => x && x.trim()).length >= 30) marcarTarefaPorNome(/30 (coisas|caracter)/i); }}
                  style={{ flex: 1, padding: '10px 13px', borderRadius: 12, border: `1.5px solid ${C.line}`, fontSize: 14, color: C.ink, fontFamily: 'inherit', outline: 'none', background: C.card }} />
              </div>
            ))}
          </div>
        );
      }

      case 'ativacao40': {
        const n = Object.values(d.ativacao40.marcas).filter(Boolean).length;
        return (
          <div>
            <Card style={{ marginBottom: 14 }}>
              <Campo label="Frase de ativação de hoje" placeholder="Ex: Eu sou merecedora de tudo que peço"
                value={d.ativacao40.frase} onChange={e => up(s => ({ ...s, ativacao40: { ...s.ativacao40, frase: e.target.value } }))} />
              <Barra v={n} max={40} cor={C.lilac} />
              <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, marginTop: 8 }}>{n} de 40</div>
            </Card>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8,1fr)', gap: 6 }}>
              {Array.from({ length: 40 }, (_, i) => i + 1).map(k => {
                const on = d.ativacao40.marcas[k];
                return <button key={k} onClick={() => {
                  up(s => ({ ...s, ativacao40: { ...s.ativacao40, marcas: { ...s.ativacao40.marcas, [k]: !s.ativacao40.marcas[k] } } }));
                  if (!on && n + 1 >= 40) marcarTarefaPorNome(/ativa[çc][ãa]o/i);
                }} style={{ aspectRatio: '1', borderRadius: 10, cursor: 'pointer', fontSize: 10, fontWeight: 700, fontFamily: 'inherit', border: on ? 'none' : `1.5px solid ${C.line}`, background: on ? C.lilac : C.card, color: on ? '#fff' : C.ink3 }}>{k}</button>;
              })}
            </div>
            <Btn variante="outline" cor={C.ink2} style={{ width: '100%', marginTop: 14 }} onClick={() => up(s => ({ ...s, ativacao40: { ...s.ativacao40, marcas: {} } }))}>Zerar para amanhã</Btn>
          </div>
        );
      }

      case 'desafio100': {
        const n = Object.values(d.desafio100).filter(Boolean).length;
        return (
          <div>
            <Campo label="Minha meta dos 100 dias" value={campo('meta100')} onChange={e => setCampo('meta100', e.target.value)} placeholder="O que você quer sustentar por 100 dias" />
            <Card style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 30, fontWeight: 800, color: C.ink, marginBottom: 8 }}>{n}<span style={{ fontSize: 15, color: C.ink3 }}> / 100</span></div>
              <Barra v={n} max={100} cor={C.lima} />
            </Card>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10,1fr)', gap: 5 }}>
              {Array.from({ length: 100 }, (_, i) => i + 1).map(k => {
                const on = d.desafio100[k];
                return <button key={k} onClick={() => up(s => ({ ...s, desafio100: { ...s.desafio100, [k]: !s.desafio100[k] } }))}
                  style={{ aspectRatio: '1', borderRadius: 99, cursor: 'pointer', fontSize: 9, fontWeight: 700, fontFamily: 'inherit', border: on ? 'none' : `1.5px solid ${C.line}`, background: on ? C.green : C.card, color: on ? '#fff' : C.ink3 }}>{k}</button>;
              })}
            </div>
          </div>
        );
      }

      case 'skillopenlimits': {
        const f = forms.metaSOL;
        return (
          <div>
            <Card style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.ink2, marginBottom: 6 }}>Pilar</div>
              <select value={f.pilar} onChange={e => setForm('metaSOL', { pilar: e.target.value })}
                style={{ width: '100%', padding: '12px 13px', borderRadius: 12, border: `1.5px solid ${C.line}`, fontSize: 15, fontFamily: 'inherit', color: C.ink, background: '#FAFCFB', marginBottom: 12 }}>
                {PILARES.map(p => <option key={p}>{p}</option>)}
              </select>
              <Campo label="O que fazer (ação)" value={f.oQue} onChange={e => setForm('metaSOL', { oQue: e.target.value })} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Campo label="Quem" value={f.quem} onChange={e => setForm('metaSOL', { quem: e.target.value })} />
                <Campo label="Quando" value={f.quando} onChange={e => setForm('metaSOL', { quando: e.target.value })} />
              </div>
              <Campo label="Recursos necessários" value={f.recursos} onChange={e => setForm('metaSOL', { recursos: e.target.value })} />
              <Btn style={{ width: '100%' }} onClick={() => {
                if (!f.oQue.trim()) return aviso('Descreva a ação');
                up(s => ({ ...s, metasSOL: [{ ...f, id: Date.now(), status: 'A ser feito' }, ...s.metasSOL] }));
                setForm('metaSOL', { oQue: '', quem: '', quando: '', recursos: '' }); aviso('Meta adicionada');
              }}>Adicionar meta</Btn>
            </Card>
            {d.metasSOL.map(m => (
              <Card key={m.id} style={{ marginBottom: 9, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: C.green, textTransform: 'uppercase', letterSpacing: .5 }}>{m.pilar}</div>
                    <div style={{ fontWeight: 700, color: C.ink, fontSize: 14, marginTop: 3 }}>{m.oQue}</div>
                    <div style={{ fontSize: 12, color: C.ink3, marginTop: 3 }}>{[m.quem, m.quando, m.recursos].filter(Boolean).join(' · ')}</div>
                  </div>
                  <button onClick={() => up(s => ({ ...s, metasSOL: s.metasSOL.filter(x => x.id !== m.id) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.ink3 }}><Trash2 size={15} /></button>
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                  {['A ser feito', 'Em andamento', 'Realizado'].map(st => (
                    <button key={st} onClick={() => up(s => ({ ...s, metasSOL: s.metasSOL.map(x => x.id === m.id ? { ...x, status: st } : x) }))}
                      style={{ flex: 1, padding: '7px 4px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, fontFamily: 'inherit', background: m.status === st ? (st === 'Realizado' ? C.green : st === 'Em andamento' ? C.gold : C.ink3) : '#F2F5F4', color: m.status === st ? '#fff' : C.ink2 }}>{st}</button>
                  ))}
                </div>
              </Card>
            ))}
            <Card style={{ marginTop: 14 }}>
              <Area label="Todos os ganhos que terei realizando minhas metas" value={campo('sol-ganhos')} onChange={e => setCampo('sol-ganhos', e.target.value)} />
              <Area label="Perdas que terei realizando minhas metas" value={campo('sol-perdas-sim')} onChange={e => setCampo('sol-perdas-sim', e.target.value)} />
              <Area label="Perdas que terei não realizando minhas metas" value={campo('sol-perdas-nao')} onChange={e => setCampo('sol-perdas-nao', e.target.value)} style={{ marginBottom: 0 }} />
            </Card>
          </div>
        );
      }

      case 'agendaExtraordinaria': {
        const horas = ['05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22'];
        return (
          <div>
            <Campo label="Dia que você está detalhando" value={campo('ag-dia')} onChange={e => setCampo('ag-dia', e.target.value)} placeholder="Ex: quinta-feira" />
            <div style={{ display: 'grid', gridTemplateColumns: '34px 1fr 1fr', gap: 6, marginBottom: 8, position: 'sticky', top: 0, background: C.bg, paddingBottom: 4 }}>
              <div />
              <div style={{ fontSize: 11, fontWeight: 800, color: C.ink2, textAlign: 'center' }}>Atual</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: C.green, textAlign: 'center' }}>Extraordinária</div>
            </div>
            {horas.map(h => (
              <div key={h} style={{ display: 'grid', gridTemplateColumns: '34px 1fr 1fr', gap: 6, marginBottom: 5 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.ink3, display: 'flex', alignItems: 'center' }}>{h}h</div>
                {['atual', 'extra'].map(col => (
                  <input key={col} value={campo(`ag-${col}-${h}`)} onChange={e => setCampo(`ag-${col}-${h}`, e.target.value)}
                    style={{ padding: '9px 10px', borderRadius: 10, border: `1.5px solid ${col === 'extra' ? C.mint : C.line}`, fontSize: 13, fontFamily: 'inherit', color: C.ink, outline: 'none', background: col === 'extra' ? '#F7FDFA' : C.card, minWidth: 0 }} />
                ))}
              </div>
            ))}
          </div>
        );
      }

      case 'diagnostico': {
        const linhas = [['CRENÇAS', 'crencas'], ['SENTIMENTOS', 'sentimentos'], ['PENSAMENTOS', 'pensamentos'], ['COMUNICAÇÃO', 'comunicacao']];
        return (
          <div>
            <Card style={{ marginBottom: 14, background: '#FFF6F4', border: `1.5px solid ${C.coral}` }}>
              <Area label="Resultado atual" placeholder="Descreva o resultado que você tem hoje nessa área" value={campo('diag-atual')} onChange={e => setCampo('diag-atual', e.target.value)} style={{ marginBottom: 0, minHeight: 70 }} />
            </Card>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: C.coral, textAlign: 'center' }}>DIAGNÓSTICO</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: C.green, textAlign: 'center' }}>SOLUÇÃO</div>
            </div>
            {linhas.map(([lbl, k]) => (
              <div key={k} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: C.ink2, marginBottom: 5, letterSpacing: .4 }}>{lbl}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <textarea value={campo(`diag-${k}-a`)} onChange={e => setCampo(`diag-${k}-a`, e.target.value)} placeholder="Hoje"
                    style={{ padding: 11, borderRadius: 12, border: `1.5px solid ${C.line}`, fontSize: 13, fontFamily: 'inherit', color: C.ink, outline: 'none', background: '#FFF9F8', minHeight: 76, resize: 'vertical', minWidth: 0 }} />
                  <textarea value={campo(`diag-${k}-s`)} onChange={e => setCampo(`diag-${k}-s`, e.target.value)} placeholder="No lugar disso"
                    style={{ padding: 11, borderRadius: 12, border: `1.5px solid ${C.mint}`, fontSize: 13, fontFamily: 'inherit', color: C.ink, outline: 'none', background: '#F7FDFA', minHeight: 76, resize: 'vertical', minWidth: 0 }} />
                </div>
              </div>
            ))}
            <Card style={{ background: C.mint, border: `1.5px solid ${C.green}` }}>
              <Area label="Resultado desejado" placeholder="Escreva no presente, como se já fosse real" value={campo('diag-desejado')} onChange={e => setCampo('diag-desejado', e.target.value)} style={{ marginBottom: 0, minHeight: 70, background: '#fff' }} />
            </Card>
          </div>
        );
      }

      case 'estados': {
        const nomes = ['Parasita', 'Hospedeiro', 'Autofagismo', 'Plenitude'];
        const escolhido = campo('estado-atual');
        return (
          <div>
            {nomes.map((n, i) => (
              <Card key={n} onClick={() => setCampo('estado-atual', n)} style={{
                marginBottom: 10, cursor: 'pointer',
                border: `1.5px solid ${escolhido === n ? (n === 'Plenitude' ? C.green : C.coral) : C.line}`,
                background: escolhido === n ? (n === 'Plenitude' ? C.mint : '#FFF6F4') : C.card
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 7 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 99, border: `2px solid ${escolhido === n ? (n === 'Plenitude' ? C.green : C.coral) : C.line}`, background: escolhido === n ? (n === 'Plenitude' ? C.green : C.coral) : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {escolhido === n && <Check size={13} color="#fff" strokeWidth={3} />}
                  </div>
                  <span style={{ fontWeight: 800, color: C.ink, fontSize: 15 }}>{n}</span>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: C.ink2, lineHeight: 1.55 }}>{etapa.texto[i]}</p>
              </Card>
            ))}
            {escolhido && <Card style={{ marginTop: 6, background: C.petroleo, color: '#fff' }}>
              <div style={{ fontSize: 12, opacity: .75, marginBottom: 8, fontWeight: 700 }}>Agora você sabe o seu estado atual</div>
              <textarea value={campo('estado-decisao')} onChange={e => setCampo('estado-decisao', e.target.value)}
                placeholder="A partir desse entendimento, que decisão você toma?"
                style={{ width: '100%', padding: 12, borderRadius: 12, border: 'none', fontSize: 14, fontFamily: 'inherit', minHeight: 80, resize: 'vertical', outline: 'none' }} />
            </Card>}
          </div>
        );
      }

      case 'comportamento': return (
        <div>
          {etapa.passos.map((p, i) => (
            <Card key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 9 }}>
                <div style={{ width: 25, height: 25, borderRadius: 8, background: C.mint, color: C.greenDark, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
                <p style={{ margin: 0, fontSize: 13.5, color: C.ink, lineHeight: 1.5, fontWeight: 600 }}>{p}</p>
              </div>
              <Area value={campo(`comp-${i}`)} onChange={e => setCampo(`comp-${i}`, e.target.value)} style={{ marginBottom: 0, minHeight: 72 }} />
            </Card>
          ))}
        </div>
      );

      case 'redes': {
        const f = forms.rede;
        return (
          <div>
            <Card style={{ marginBottom: 14 }}>
              <Campo label="Nome da rede" placeholder="Ex: trabalho, família, academia" value={f.nome} onChange={e => setForm('rede', { nome: e.target.value })} />
              <Campo label="Pessoas dessa rede" placeholder="Cada rede tem em média 6 pessoas" value={f.pessoas} onChange={e => setForm('rede', { pessoas: e.target.value })} />
              <div style={{ fontSize: 12, fontWeight: 700, color: C.ink2, marginBottom: 6 }}>Estratégia</div>
              <select value={f.estrategia} onChange={e => setForm('rede', { estrategia: e.target.value })}
                style={{ width: '100%', padding: '12px 13px', borderRadius: 12, border: `1.5px solid ${C.line}`, fontSize: 14, fontFamily: 'inherit', color: C.ink, background: '#FAFCFB', marginBottom: 12 }}>
                <option value="">Escolha uma estratégia</option>
                {etapa.estrategias.map(s => <option key={s}>{s}</option>)}
              </select>
              <Btn style={{ width: '100%' }} onClick={() => {
                if (!f.nome.trim()) return aviso('Dê um nome à rede');
                up(s => ({ ...s, redes: [{ ...f, id: Date.now() }, ...s.redes] }));
                setForm('rede', { nome: '', pessoas: '', estrategia: '' }); aviso('Rede mapeada');
              }}>Adicionar rede</Btn>
            </Card>
            {d.redes.map(r => (
              <Card key={r.id} style={{ marginBottom: 9, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, color: C.ink, fontSize: 14 }}>{r.nome}</div>
                    <div style={{ fontSize: 12, color: C.ink2, marginTop: 3 }}>{r.pessoas}</div>
                    {r.estrategia && <div style={{ marginTop: 7, display: 'inline-block', padding: '4px 9px', background: C.mint, borderRadius: 8, fontSize: 11, fontWeight: 700, color: C.greenDark }}>{r.estrategia}</div>}
                  </div>
                  <button onClick={() => up(s => ({ ...s, redes: s.redes.filter(x => x.id !== r.id) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.ink3 }}><Trash2 size={15} /></button>
                </div>
              </Card>
            ))}
          </div>
        );
      }

      case 'matrizDinheiro': return (
        <div>
          <Card style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 800, color: C.ink, fontSize: 14, marginBottom: 10 }}>5 motivos para não ser pobre</div>
            {[0, 1, 2, 3, 4].map(i => (
              <Campo key={i} placeholder={`${i + 1}.`} value={campo(`din-pobre-${i}`)} onChange={e => setCampo(`din-pobre-${i}`, e.target.value)} />
            ))}
          </Card>
          <Card style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 800, color: C.ink, fontSize: 14, marginBottom: 10 }}>5 motivos para ser rica</div>
            {[0, 1, 2, 3, 4].map(i => (
              <Campo key={i} placeholder={`${i + 1}.`} value={campo(`din-rica-${i}`)} onChange={e => setCampo(`din-rica-${i}`, e.target.value)} />
            ))}
          </Card>
          <Card>
            <Area label="Como está a sua intimidade com dinheiro?" value={campo('din-intimidade')} onChange={e => setCampo('din-intimidade', e.target.value)} />
            <Area label="Caminho de recursos" placeholder="De onde vem, por onde passa, para onde vai" value={campo('din-caminho')} onChange={e => setCampo('din-caminho', e.target.value)} style={{ marginBottom: 0 }} />
          </Card>
        </div>
      );

      case 'repeticao': {
        const cols = [['M', 'Mãe'], ['P', 'Pai'], ['E', 'Eu']];
        return (
          <div>
            {[['Atitudes positivas que recebi', 'pos'], ['Palavras positivas que ouvi', 'palpos'], ['Atitudes negativas que recebi', 'neg'], ['Palavras negativas que ouvi', 'palneg']].map(([lbl, k]) => (
              <Card key={k} style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 800, color: C.ink, fontSize: 14, marginBottom: 10 }}>{lbl}</div>
                {cols.map(([c, nome]) => (
                  <div key={c} style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.ink3, marginBottom: 4 }}>{nome}</div>
                    <textarea value={campo(`rep-${k}-${c}`)} onChange={e => setCampo(`rep-${k}-${c}`, e.target.value)}
                      style={{ width: '100%', padding: 11, borderRadius: 12, border: `1.5px solid ${C.line}`, fontSize: 13, fontFamily: 'inherit', color: C.ink, outline: 'none', background: '#FAFCFB', minHeight: 60, resize: 'vertical' }} />
                  </div>
                ))}
              </Card>
            ))}
          </div>
        );
      }

      case 'cartas': {
        const cartas = [
          ['prejuizo', 'Carta de prejuízo', 'Tudo o que você perdeu por causa disso', C.coral],
          ['acusacao', 'Carta de acusação', 'Sem filtro. Ninguém vai ler.', C.gold],
          ['perdao', 'Carta de perdão', 'Escreva quando estiver pronta. Não antes.', C.green]
        ];
        return (
          <div>
            {cartas.map(([k, t, sub, cor], i) => {
              const anterior = i === 0 || (campo(`carta-${cartas[i - 1][0]}`) || '').trim().length > 30;
              return (
                <Card key={k} style={{ marginBottom: 12, borderLeft: `4px solid ${cor}`, opacity: anterior ? 1 : .5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    {!anterior && <Lock size={14} color={C.ink3} />}
                    <span style={{ fontWeight: 800, color: C.ink, fontSize: 15 }}>{t}</span>
                  </div>
                  <p style={{ margin: '0 0 10px', fontSize: 12.5, color: C.ink3 }}>{anterior ? sub : 'Escreva a carta anterior primeiro'}</p>
                  {anterior && <Area value={campo(`carta-${k}`)} onChange={e => setCampo(`carta-${k}`, e.target.value)} style={{ minHeight: 140, marginBottom: 0 }} />}
                </Card>
              );
            })}
          </div>
        );
      }

      case 'gratidao': return (
        <div>
          <Card style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 800, color: C.ink, fontSize: 14, marginBottom: 10 }}>Mapeamento de gratidões</div>
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 8, marginBottom: 8 }}>
                <input value={campo(`grat-p-${i}`)} onChange={e => setCampo(`grat-p-${i}`, e.target.value)} placeholder="Pessoa"
                  style={{ padding: '10px 12px', borderRadius: 11, border: `1.5px solid ${C.line}`, fontSize: 13, fontFamily: 'inherit', color: C.ink, outline: 'none', background: '#FAFCFB', minWidth: 0 }} />
                <input value={campo(`grat-g-${i}`)} onChange={e => setCampo(`grat-g-${i}`, e.target.value)} placeholder="Pelo quê"
                  style={{ padding: '10px 12px', borderRadius: 11, border: `1.5px solid ${C.line}`, fontSize: 13, fontFamily: 'inherit', color: C.ink, outline: 'none', background: '#FAFCFB', minWidth: 0 }} />
              </div>
            ))}
          </Card>
          <Card>
            <Area label="Carta de gratidão" placeholder="Escolha uma pessoa e escreva. Depois entregue." value={campo('grat-carta')} onChange={e => setCampo('grat-carta', e.target.value)} style={{ minHeight: 160, marginBottom: 0 }} />
          </Card>
        </div>
      );

      default: return <p style={{ color: C.ink3, fontSize: 13 }}>Ferramenta em construção.</p>;
    }
  };

  /* ══════════ DETALHE DA ETAPA ══════════ */
  const DetalheEtapa = () => {
    const e = sequencia.find(x => x.id === etapaAberta);
    if (!e) return null;
    const ok = feito(e.id);
    const fotosEtapa = d.fotos.filter(f => f.etapaId === e.id);

    const Corpo = () => {
      if (e.tipo === 'roda') {
        const vals = d.rodas[e.rodaId] || {};
        const media = RODA_SETORES.reduce((a, s) => a + (vals[s] || 0), 0) / RODA_SETORES.length;
        const anterior = e.rodaId > 1 ? d.rodas[e.rodaId - 1] : null;
        const mediaAnt = anterior ? RODA_SETORES.reduce((a, s) => a + (anterior[s] || 0), 0) / RODA_SETORES.length : null;
        return (
          <div>
            <Card style={{ marginBottom: 14 }}>
              <RodaGrafico valores={vals} cor={e.bloco.cor} />
              <div style={{ display: 'flex', justifyContent: 'center', gap: 22, marginTop: 10 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: C.ink }}>{media.toFixed(1)}</div>
                  <div style={{ fontSize: 11, color: C.ink3 }}>média agora</div>
                </div>
                {mediaAnt !== null && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 26, fontWeight: 800, color: media >= mediaAnt ? C.green : C.coral }}>
                      {media >= mediaAnt ? '+' : ''}{(media - mediaAnt).toFixed(1)}
                    </div>
                    <div style={{ fontSize: 11, color: C.ink3 }}>vs roda {e.rodaId - 1}</div>
                  </div>
                )}
              </div>
            </Card>
            {RODA_SETORES.map(s => {
              const v = vals[s] || 0;
              const cor = v >= 8 ? C.green : v >= 5 ? C.gold : v > 0 ? C.coral : C.line;
              return (
                <div key={s} style={{ marginBottom: 11 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{s}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: cor }}>{v || '-'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                      <button key={n} onClick={() => up(st => ({ ...st, rodas: { ...st.rodas, [e.rodaId]: { ...(st.rodas[e.rodaId] || {}), [s]: n } } }))}
                        style={{ flex: 1, height: 24, borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 700, fontFamily: 'inherit', background: n <= v ? cor : '#F2F5F4', color: n <= v ? '#fff' : C.ink3 }}>{n}</button>
                    ))}
                  </div>
                </div>
              );
            })}
            {e.perguntas && <Card style={{ marginTop: 14 }}>
              {e.perguntas.map((q, i) => (
                <Area key={i} label={q} value={campo(`roda${e.rodaId}-q${i}`)} onChange={ev => setCampo(`roda${e.rodaId}-q${i}`, ev.target.value)} style={{ minHeight: 66, marginBottom: i === e.perguntas.length - 1 ? 0 : 12 }} />
              ))}
            </Card>}
          </div>
        );
      }

      if (e.tipo === 'ritual') {
        const marc = d.ritual[data] || {};
        const n = Object.values(marc).filter(Boolean).length;
        return (
          <div>
            <Card style={{ marginBottom: 14, background: C.petroleo, color: '#fff', textAlign: 'center' }}>
              <div style={{ fontSize: 11, opacity: .7, fontWeight: 700, marginBottom: 4 }}>Cronômetro</div>
              <div style={{ fontSize: 42, fontWeight: 800, letterSpacing: -1 }}>
                {String(Math.floor(cron.seg / 60)).padStart(2, '0')}:{String(cron.seg % 60).padStart(2, '0')}
              </div>
              <div style={{ display: 'flex', gap: 9, justifyContent: 'center', marginTop: 12 }}>
                <Btn cor={C.green} onClick={() => setCron(c => ({ ...c, rodando: !c.rodando }))} style={{ padding: '9px 22px' }}>{cron.rodando ? 'Pausar' : 'Iniciar'}</Btn>
                <Btn variante="outline" cor="#fff" onClick={() => setCron({ rodando: false, seg: 300 })} style={{ padding: '9px 18px' }}>Zerar</Btn>
              </div>
            </Card>
            <div style={{ marginBottom: 12 }}><Barra v={n} max={9} cor={C.gold} /></div>
            {RITUAL_ACORDAR.map(r => {
              const on = marc[r.n];
              return (
                <div key={r.n} onClick={() => {
                  up(s => ({ ...s, ritual: { ...s.ritual, [data]: { ...marc, [r.n]: !on } } }));
                  if (!on && n + 1 >= 9) marcarTarefaPorNome(/ritual do acordar/i);
                }} style={{ padding: 14, marginBottom: 8, cursor: 'pointer', borderRadius: 16, background: on ? C.mint : C.card, border: `1.5px solid ${on ? C.green : C.line}` }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ width: 26, height: 26, borderRadius: 9, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: on ? C.green : '#F2F5F4', color: on ? '#fff' : C.ink3, fontSize: 12, fontWeight: 800 }}>
                      {on ? <Check size={14} strokeWidth={3} /> : r.n}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: C.ink, fontSize: 14 }}>{r.t}</div>
                      <div style={{ fontSize: 12.5, color: C.ink2, marginTop: 3, lineHeight: 1.45 }}>{r.d}</div>
                    </div>
                    <span style={{ fontSize: 11, color: C.ink3, fontWeight: 700 }}>{r.min}min</span>
                  </div>
                  {r.campos && on && <div style={{ marginTop: 10 }} onClick={ev => ev.stopPropagation()}>
                    {r.campos.map((c, i) => (
                      <input key={i} value={campo(`ritual-${data}-${i}`)} onChange={ev => setCampo(`ritual-${data}-${i}`, ev.target.value)} placeholder={c}
                        style={{ width: '100%', padding: '9px 11px', borderRadius: 10, border: `1.5px solid ${C.line}`, fontSize: 13, fontFamily: 'inherit', marginBottom: 6, outline: 'none', color: C.ink }} />
                    ))}
                  </div>}
                </div>
              );
            })}
          </div>
        );
      }

      if (e.tipo === 'agenda') {
        const marcas = d.agenda[data] || {};
        const pts = e.tarefas.reduce((a, t, i) => a + (marcas[`${e.id}-${i}`] ? t.p : 0), 0);
        const iconeT = tp => tp === 'Livro' ? <BookOpen size={12} /> : tp === 'Filme' ? <Film size={12} /> : tp === 'Vídeo' ? <Video size={12} /> : <Circle size={12} />;
        const corT = tp => ({ Livro: C.gold, Filme: C.coral, 'Vídeo': C.lilac }[tp] || C.ink3);
        return (
          <div>
            <Card style={{ marginBottom: 14, background: C.petroleo, color: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 11, opacity: .7, fontWeight: 700 }}>Pontos de hoje</div>
                  <div style={{ fontSize: 30, fontWeight: 800 }}>{pts} <span style={{ fontSize: 15, opacity: .65 }}>/ {e.meta}</span></div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: pts >= e.meta ? C.green : pts > 0 ? C.gold : C.coral }}>
                  {pts >= e.meta ? 'Realizado' : pts > 0 ? 'Em andamento' : 'Não feito'}
                </div>
              </div>
              <div style={{ marginTop: 12 }}><Barra v={pts} max={e.meta} cor={C.lima} /></div>
            </Card>
            {e.tarefas.map((t, i) => {
              const k = `${e.id}-${i}`, on = !!marcas[k];
              return (
                <div key={i} onClick={() => toggleTarefaDe(e, i)}
                  style={{ display: 'flex', alignItems: 'center', gap: 11, padding: 13, marginBottom: 7, cursor: 'pointer', background: on ? C.mint : C.card, borderRadius: 15, border: `1.5px solid ${on ? C.green : C.line}` }}>
                  <div style={{ width: 25, height: 25, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: on ? C.green : 'transparent', border: on ? 'none' : `2px solid ${C.line}` }}>
                    {on && <Check size={14} color="#fff" strokeWidth={3} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink, opacity: on ? .6 : 1, textDecoration: on ? 'line-through' : 'none' }}>{t.t}</div>
                    <div style={{ display: 'flex', gap: 7, alignItems: 'center', marginTop: 3 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10.5, fontWeight: 700, color: corT(t.tipo) }}>{iconeT(t.tipo)} {t.tipo}</span>
                      {t.hora && <span style={{ fontSize: 10.5, color: C.ink3 }}>· {t.hora}</span>}
                    </div>
                  </div>
                  <div style={{ padding: '4px 9px', borderRadius: 8, fontSize: 12.5, fontWeight: 800, background: on ? C.green : '#F2F5F4', color: on ? '#fff' : C.ink3 }}>{t.p}</div>
                </div>
              );
            })}
          </div>
        );
      }

      if (e.tipo === 'fichas') return (
        <Card>
          <Area label="Que fichas caem?" value={campo(`${e.id}-fichas`)} onChange={ev => setCampo(`${e.id}-fichas`, ev.target.value)} style={{ minHeight: 110 }} />
          <Area label="Que decisão você toma?" value={campo(`${e.id}-decisao`)} onChange={ev => setCampo(`${e.id}-decisao`, ev.target.value)} style={{ minHeight: 90 }} />
          <Area label="Anotações" value={campo(`${e.id}-notas`)} onChange={ev => setCampo(`${e.id}-notas`, ev.target.value)} style={{ minHeight: 70, marginBottom: 0 }} />
        </Card>
      );

      if (e.tipo === 'dia7') return (
        <Card>
          {e.autor && <div style={{ fontSize: 12, fontWeight: 700, color: C.lilac, marginBottom: 10 }}>{e.autor}</div>}
          <Area label="Minha reflexão" value={campo(`${e.id}-refl`)} onChange={ev => setCampo(`${e.id}-refl`, ev.target.value)} style={{ minHeight: 130 }} />
          <Area label="A decisão que tomo hoje" value={campo(`${e.id}-dec`)} onChange={ev => setCampo(`${e.id}-dec`, ev.target.value)} style={{ minHeight: 80, marginBottom: 0 }} />
        </Card>
      );

      if (e.tipo === 'ferramenta') return Ferramenta({ id: e.ferramenta, etapa: e });

      return null; /* leitura pura: só o texto do cabeçalho */
    };

    return (
      <div style={{ paddingBottom: 120 }}>
        <div style={{ background: C.card, padding: '14px 18px', borderBottom: `1px solid ${C.line}`, position: 'sticky', top: 0, zIndex: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setEtapaAberta(null)} style={{ background: '#F2F5F4', border: 'none', borderRadius: 11, width: 36, height: 36, cursor: 'pointer', color: C.ink, flexShrink: 0 }}><ChevronLeft size={19} /></button>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 10.5, fontWeight: 800, color: e.bloco.cor, textTransform: 'uppercase', letterSpacing: .6 }}>{e.bloco.bloco}</div>
            <h1 style={{ fontSize: 17, fontWeight: 800, color: C.ink, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.titulo}</h1>
          </div>
        </div>

        <div style={{ padding: 18 }}>
          {e.texto && (
            <Card cls="zoe-surge" style={{ marginBottom: 16, borderLeft: `4px solid ${e.bloco.cor}` }}>
              {e.texto.map((t, i) => <p key={i} style={{ margin: i ? '10px 0 0' : 0, fontSize: 14, color: C.ink, lineHeight: 1.62 }}>{t}</p>)}
              {e.citacao && <p style={{ margin: '14px 0 0', padding: 12, background: '#FAFCFB', borderRadius: 12, fontSize: 13, fontStyle: 'italic', color: C.ink2, lineHeight: 1.55 }}>{e.citacao}</p>}
              {e.destaques && <div style={{ marginTop: 12 }}>
                {e.destaques.map((h, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 7, alignItems: 'flex-start' }}>
                    <span style={{ color: e.bloco.cor, fontWeight: 800, fontSize: 13 }}>·</span>
                    <span style={{ fontSize: 13, color: C.ink2, lineHeight: 1.5 }}>{h}</span>
                  </div>
                ))}
              </div>}
              {e.ciclo && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 16, flexWrap: 'wrap' }}>
                  {e.ciclo.map((c, i) => (
                    <React.Fragment key={c}>
                      <div className="zoe-surge" style={{ padding: '8px 12px', background: C.mint, borderRadius: 11, fontSize: 12, fontWeight: 800, color: C.greenDark, animationDelay: `${i * 130}ms` }}>{c}</div>
                      {i < e.ciclo.length - 1 && <ChevronRight size={14} color={C.ink3} />}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </Card>
          )}

          {Corpo()}

          {/* fotos desta etapa */}
          <Card style={{ marginTop: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: fotosEtapa.length ? 12 : 0 }}>
              <div>
                <div style={{ fontWeight: 800, color: C.ink, fontSize: 14 }}>Fotos desta etapa</div>
                <div style={{ fontSize: 11.5, color: C.ink3, marginTop: 2 }}>Registre o que você está vivendo aqui</div>
              </div>
              <button onClick={() => pedirFoto(e.tipo === 'ritual' || e.id.includes('medidas') ? 'corpo' : 'estudo', e.id)}
                style={{ width: 34, height: 34, borderRadius: 11, border: 'none', background: C.petroleo, color: '#fff', cursor: 'pointer', flexShrink: 0 }}>
                <Plus size={17} />
              </button>
            </div>
            {fotosEtapa.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {fotosEtapa.map(f => (
                  <div key={f.id}>
                    <Foto id={f.id} email={usuario.email} onClick={() => setVisor(f.id)}
                      style={{ width: '100%', aspectRatio: '1', borderRadius: 12 }} />
                    <div style={{ fontSize: 9.5, color: C.ink3, textAlign: 'center', marginTop: 4 }}>
                      {new Date(f.data + 'T12:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Btn onClick={() => concluirEtapa(e.id)} cor={ok ? C.ink3 : C.lima} variante={ok ? 'outline' : 'solid'}
            style={{ width: '100%', marginTop: 20, padding: 15, fontSize: 15 }}>
            {ok ? 'Marcada como concluída · desfazer' : 'Concluir etapa e liberar a próxima'}
          </Btn>
        </div>
      </div>
    );
  };

  /* ══════════ TRILHA ══════════ */
  const Trilha = () => {
    if (etapaAberta) return DetalheEtapa();
    return (
      <div style={{ paddingBottom: 120 }}>
        <div style={{ background: `linear-gradient(175deg,${C.aquaSuave},${C.bg})`, padding: '18px 18px 14px' }}>
          <div style={{ display:'flex',alignItems:'center',minHeight:94 }}><div style={{ flex:1 }}><h1 style={{ fontSize: 24, fontWeight: 800, color: C.ink, margin: '0 0 4px' }}>Minha trilha</h1><p style={{ fontSize: 13, color: C.ink2, margin: 0 }}>Uma missão por vez. Eu sigo com você.</p></div><img src={avatarImagem} alt="ZOE" style={{ width:88,height:96,objectFit:'contain',objectPosition:'center',filter:'drop-shadow(0 8px 12px rgba(55,28,105,.18))' }}/></div>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.ink2 }}>Progresso da jornada</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: C.green }}>{concluidas} de {totalEtapas}</span>
            </div>
            <Barra v={concluidas} max={totalEtapas} cor={C.lima} h={10} />
          </Card>
        </div>

        <div style={{ padding: '18px 14px' }}>
          {TRILHA.map((b, bi) => {
            const feitasB = b.etapas.filter(e => feito(e.id)).length;
            const blocoLiberado = b.etapas.some(e => liberada(e.id));
            const completo = feitasB === b.etapas.length;
            const contemAtual = b.etapas.some(e => etapaAtual?.id === e.id);
            const aberto = sessoesAbertas[b.id] ?? (!completo || contemAtual);
            const posicoes = [50, 68, 58, 34, 25, 43, 67, 72, 51, 29, 35, 61];
            const alturaMapa = b.etapas.length * 116 + 18;
            return (
              <div key={b.id} style={{ marginBottom: 28, opacity: blocoLiberado ? 1 : .62 }}>
                <button onClick={() => blocoLiberado && setSessoesAbertas(a => ({ ...a, [b.id]: !aberto }))} style={{ width: '100%', minHeight: 92, display: 'flex', alignItems: 'center', gap: 12, border: 0, borderRadius: 23, background: blocoLiberado ? b.cor : '#DDE3E3', color: blocoLiberado ? sobre(b.cor) : C.ink3, padding: '16px 17px', fontFamily: 'inherit', textAlign: 'left', cursor: blocoLiberado ? 'pointer' : 'default', boxShadow: blocoLiberado ? `0 8px 0 ${b.cor}42,0 15px 30px ${b.cor}20` : '0 7px 0 #C9D0D0' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 10.5, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, opacity: .8 }}>{b.bloco}</div>
                    <div style={{ fontSize: 18, fontWeight: 900, marginTop: 4, lineHeight: 1.2 }}>{b.nome}</div>
                    <div style={{ fontSize: 10.5, marginTop: 6, opacity: .78 }}>{b.resumo}</div>
                  </div>
                  <div style={{ width: 48, height: 48, borderRadius: 16, background: 'rgba(255,255,255,.22)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <div style={{ textAlign: 'center' }}><div style={{ fontSize: 14, fontWeight: 950 }}>{feitasB}/{b.etapas.length}</div>{aberto ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</div>
                  </div>
                </button>

                {aberto && <div style={{ position: 'relative', height: alturaMapa, marginTop: 16, overflow: 'hidden' }}>
                  <svg viewBox={`0 0 100 ${alturaMapa}`} preserveAspectRatio="none" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                    <polyline points={b.etapas.map((_, i) => `${posicoes[i % posicoes.length]},${i * 116 + 42}`).join(' ')} fill="none" stroke="#DDE5E3" strokeWidth="2.2" strokeDasharray="2 3" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
                    {b.etapas.slice(0, -1).map((e, i) => feito(e.id) && <line key={e.id} x1={posicoes[i % posicoes.length]} y1={i * 116 + 42} x2={posicoes[(i + 1) % posicoes.length]} y2={(i + 1) * 116 + 42} stroke={b.cor} strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinecap="round" />)}
                  </svg>
                  {contemAtual && b.etapas.length > 3 && <img src={avatarImagem} alt="ZOE acompanhando sua jornada" style={{ position: 'absolute', top: Math.min(alturaMapa - 120, 310), left: 8, width: avatarId === 'essencial' ? 78 : 94, height: 104, objectFit: 'contain', filter: 'drop-shadow(0 8px 12px rgba(55,28,105,.16))', zIndex: 1 }} />}
                  {b.etapas.map((e, i) => {
                    const lib = liberada(e.id), ok = feito(e.id), atual = etapaAtual && etapaAtual.id === e.id;
                    const x = posicoes[i % posicoes.length];
                    const IconeEtapa = e.tipo === 'agenda' ? CalendarDays : e.tipo === 'roda' ? Target : e.tipo === 'ferramenta' ? Sparkles : e.tipo === 'fichas' ? BookOpen : Route;
                    return (
                      <div key={e.id} onClick={() => lib && setEtapaAberta(e.id)}
                        className={atual ? 'zoe-surge' : ''}
                        style={{
                          position: 'absolute', top: i * 116, left: `${x}%`, transform: 'translateX(-50%)', width: 144,
                          display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: lib ? 'pointer' : 'default', opacity: lib ? 1 : .5, zIndex: 2
                        }}>
                        {atual && <span style={{ position: 'absolute', top: -13, padding: '4px 10px', borderRadius: 9, background: C.lima, color: C.petroleo, fontSize: 9, fontWeight: 950, letterSpacing: .5, boxShadow: '0 4px 10px rgba(7,91,89,.12)' }}>AGORA</span>}
                        <div style={{ width: atual ? 82 : 74, height: atual ? 82 : 74, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center', background: ok || atual ? b.cor : '#E1E6E5', color: ok || atual ? sobre(b.cor) : '#A8B1B1', border: atual ? '8px solid #fff' : '6px solid #fff', boxShadow: atual ? `0 0 0 5px ${b.cor}50,0 10px 0 ${b.cor}55,0 16px 28px ${b.cor}35` : '0 7px 0 rgba(46,61,67,.16)', transition: 'transform .2s ease' }}>
                          {ok ? <Check size={28} strokeWidth={3} /> : lib ? <IconeEtapa size={25} /> : <Lock size={22} />}
                        </div>
                        <div style={{ width: 138, marginTop: 11, padding: '7px 8px', borderRadius: 11, background: atual ? '#fff' : 'rgba(255,255,255,.86)', boxShadow: atual ? '0 6px 18px rgba(20,43,48,.09)' : 'none', textAlign: 'center' }}>
                          <div style={{ fontSize: 10.5, fontWeight: 850, lineHeight: 1.25, color: lib ? C.ink : C.ink3 }}>{e.titulo}</div>
                          {ok && d.etapas[e.id]?.data && <div style={{ fontSize: 8.5, color: C.greenDark, marginTop: 3 }}>{new Date(d.etapas[e.id].data + 'T12:00').toLocaleDateString('pt-BR')}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  /* ══════════ AGENDA ══════════ */
  const Agenda = () => {
    const base = new Date(data + 'T12:00');
    const inicioMes = new Date(base.getFullYear(), base.getMonth(), 1, 12);
    const inicioGrade = new Date(inicioMes);
    inicioGrade.setDate(1 - ((inicioMes.getDay() + 6) % 7));
    const dias = Array.from({ length: 42 }, (_, i) => {
      const dt = new Date(inicioGrade); dt.setDate(inicioGrade.getDate() + i);
      return { iso: dt.toISOString().slice(0, 10), n: dt.getDate(), atual: dt.getMonth() === base.getMonth() };
    });
    const marcas = d.agenda[data] || {};
    const tarefas = agendaAtiva?.tarefas || [];
    const realizadas = tarefas.filter((_, i) => marcas[`${agendaAtiva?.id}-${i}`]).length;
    return (
      <div style={{ padding: '20px 16px 120px', minHeight: '100vh', background: '#F7FAF9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}><CalendarDays size={24} color={C.green} /><h1 style={{ margin: 0, color: C.ink, fontSize: 24 }}>Minha agenda</h1></div>
        <p style={{ margin: '4px 0 18px 34px', color: C.ink3, fontSize: 12.5 }}>Agenda e missões organizadas pela ZOE</p>
        <Card style={{ marginBottom: 16, padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}><button onClick={() => { const x=new Date(base); x.setMonth(x.getMonth()-1); setData(x.toISOString().slice(0,10)); }} style={{ border:0,background:'transparent' }}><ChevronLeft size={20}/></button><strong style={{ color:C.ink, textTransform:'capitalize' }}>{base.toLocaleDateString('pt-BR',{month:'long',year:'numeric'})}</strong><button onClick={() => { const x=new Date(base); x.setMonth(x.getMonth()+1); setData(x.toISOString().slice(0,10)); }} style={{ border:0,background:'transparent' }}><ChevronRight size={20}/></button></div>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4,marginBottom:5 }}>{['S','T','Q','Q','S','S','D'].map((x,i)=><div key={i} style={{ textAlign:'center',fontSize:9,fontWeight:800,color:C.ink3 }}>{x}</div>)}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
            {dias.map(x => { const temMissao=Object.values(d.agenda[x.iso]||{}).some(Boolean); return <button key={x.iso} onClick={() => setData(x.iso)} style={{ position:'relative',border: 0, borderRadius: 11, aspectRatio:'1', background: data === x.iso ? C.green : x.iso===hoje()?C.mint:'transparent', color: data === x.iso ? '#fff' : x.atual?C.ink:C.ink3, opacity:x.atual?1:.4, fontFamily: 'inherit', fontWeight:700 }}><span>{x.n}</span>{temMissao&&<span style={{ position:'absolute',bottom:4,left:'50%',transform:'translateX(-50%)',width:4,height:4,borderRadius:9,background:data===x.iso?'#fff':C.lilac }}/>}</button>})}
          </div>
          </Card>
          <Card style={{ marginBottom: 14, background: C.petroleo, color: '#fff' }}>
          <div style={{ fontSize: 11, opacity: .7 }}>Plano do dia</div>
          <div style={{ fontSize: 19, fontWeight: 800, margin: '3px 0 10px' }}>{agendaAtiva?.bloco?.nome || 'Sua semana'}</div>
          <Barra v={realizadas} max={Math.max(1, tarefas.length)} cor={C.lima} h={8} />
          <div style={{ fontSize: 11, opacity: .75, marginTop: 7 }}>{realizadas} de {tarefas.length} tarefas realizadas</div>
        </Card>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',margin:'20px 2px 12px' }}><h2 style={{ margin:0,fontSize:18,color:C.ink }}>Missões do mês</h2><span style={{ color:C.lilac,fontSize:11,fontWeight:800 }}>VER TODAS</span></div>
        {tarefas.length ? tarefas.map((t, i) => {
          const on = !!marcas[`${agendaAtiva.id}-${i}`];
          return <div key={i} onClick={() => toggleTarefaDe(agendaAtiva, i)} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: 14, marginBottom: 8, borderRadius: 16, background: on ? C.mint : '#fff', border: `1.5px solid ${on ? C.green : C.line}`, cursor: 'pointer' }}>
            <div style={{ width: 26, height: 26, borderRadius: 9, display: 'grid', placeItems: 'center', background: on ? C.green : '#F2F5F4', color: on ? '#fff' : C.ink3 }}>{on ? <Check size={15} /> : <Circle size={14} />}</div>
            <div style={{ flex: 1 }}><div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink, textDecoration: on ? 'line-through' : 'none' }}>{t.t}</div><div style={{ fontSize: 10.5, color: C.ink3, marginTop: 3 }}>{t.hora || 'Ao longo do dia'} · {t.p} pontos</div></div>
          </div>;
        }) : <Card><div style={{ textAlign: 'center', color: C.ink3, padding: 18 }}>Conclua as primeiras etapas para a ZOE liberar sua agenda.</div></Card>}
      </div>
    );
  };

  /* ══════════ INÍCIO ══════════ */
  const Inicio = () => {
    const dopaminaFeitas = Object.values(d.dopamina?.licoes || {}).filter(Boolean).length;
    const inglesFeitas = Object.values(d.ingles?.fasesConcluidas || {}).filter(Boolean).length;
    const metaAnual = d.financeiro?.metaAnual || METAANUAL_PADRAO;
    const economizado = (d.financeiro?.transacoes || []).reduce((a, t) => a + (t.tipo === 'entrada' ? t.valor : -t.valor), 0);
    const pctVida = Math.min(100, Math.round((concluidas / totalEtapas) * 100));
    const trilhas = [
      { id: 'dopamina', nome: 'Dopamina', icone: Sparkles, cor: '#A86BF4', suave: '#F0E5FF', valor: `${dopaminaFeitas} / ${totalLicoesDopamina}`, pct: (dopaminaFeitas / totalLicoesDopamina) * 100 },
      { id: 'ingles', nome: 'Inglês', icone: Languages, cor: '#5B9CF6', suave: '#E3F0FF', valor: `${inglesFeitas} / ${FASES_INGLES.length}`, pct: (inglesFeitas / FASES_INGLES.length) * 100 },
      { id: 'financeiro', nome: 'Finanças', icone: Wallet, cor: '#43BE8C', suave: '#DFF7EC', valor: formatoMoeda(economizado), pct: metaAnual.alvo ? (economizado / metaAnual.alvo) * 100 : 0 }
    ];
    const humores = [
      { n: 2, rosto: '⌢', nome: 'Muito mal', cor: '#F19A86' },
      { n: 4, rosto: '︵', nome: 'Mal', cor: '#E8B34F' },
      { n: 6, rosto: '—', nome: 'Neutro', cor: '#AEB6C3' },
      { n: 8, rosto: '⌣', nome: 'Bem', cor: '#65C7A1' },
      { n: 10, rosto: '★', nome: 'Muito bem', cor: '#28AF7E' }
    ];
    const metasSemana = [
      { nome: 'Beber 2L de água', valor: Math.min(7, dia.agua >= 2000 ? 1 : 0), meta: 7, cor: C.sky, icone: Droplets },
      { nome: 'Treinar 3x na semana', valor: Math.min(3, dia.treino > 0 ? 1 : 0), meta: 3, cor: C.lilac, icone: Dumbbell },
      { nome: 'Estudar inglês', valor: inglesFeitas, meta: 5, cor: C.green, icone: BookOpen }
    ];
    const secao = { background: C.card, borderRadius: 24, padding: 18, marginBottom: 14, border: `1px solid ${C.line}`, boxShadow: '0 9px 26px rgba(38,53,68,.055)' };
    return (
      <div style={{ padding: '18px 16px 120px', background: 'radial-gradient(circle at 50% 7%,rgba(168,255,0,.13),transparent 27%),radial-gradient(circle at 92% 18%,rgba(0,230,210,.10),transparent 24%),linear-gradient(180deg,#FCFFFD 0%,#F7FAF9 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 22 }}>
          <button onClick={() => setSheet('perfil')} aria-label="Abrir menu da conta" style={{ width: 42, height: 42, border: 'none', borderRadius: 15, background: '#fff', color: C.ink, boxShadow: '0 5px 16px rgba(24,42,65,.08)', display: 'grid', placeItems: 'center', overflow: 'hidden', padding: 2 }}><ZoeContaIcon tamanho={38} /></button>
          <div style={{ flex: 1, marginLeft: 10, fontSize: 17, fontWeight: 800, color: C.ink }}>Olá, {d.perfil.nome || usuario.nome} <span aria-hidden="true">👋</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: C.green, fontWeight: 800 }}><Heart size={18} /> {pontosDia}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: C.ink, fontWeight: 800 }}><Flame size={18} /> {streak}</div>
            <button onClick={permissao} style={{ position: 'relative', width: 42, height: 42, border: 'none', borderRadius: 15, background: '#fff', color: C.ink, boxShadow: '0 5px 16px rgba(24,42,65,.08)' }}><Bell size={19} /><span style={{ position: 'absolute', right: -2, top: -3, minWidth: 18, height: 18, borderRadius: 99, background: '#F15A3C', color: '#fff', fontSize: 10, display: 'grid', placeItems: 'center', border: '2px solid #fff' }}>2</span></button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ color: C.ink3, fontSize: 14 }}>Sua trilha principal</div>
          <div style={{ color: C.ink, fontWeight: 900, fontSize: 31, marginTop: 1, letterSpacing: -.7 }}>Vida</div>
          <div onClick={() => setAba('trilha')} style={{ width: 284, height: 284, margin: '14px auto 12px', borderRadius: '50%', padding: 11, background: `conic-gradient(from 222deg,#A8FF00 0%,#25DFA8 ${pctVida}%,#E8F0EC ${pctVida}% 86%,transparent 86%)`, boxShadow: '0 18px 48px rgba(7,91,89,.12)', cursor: 'pointer', position: 'relative' }}>
            <div style={{ position: 'absolute', top: -9, left: '50%', transform: 'translateX(-50%)', zIndex: 2, minWidth: 66, height: 38, padding: '0 13px', borderRadius: 16, background: '#fff', display: 'grid', placeItems: 'center', color: C.petroleo, fontSize: 13, fontWeight: 900, boxShadow: '0 7px 18px rgba(15,58,56,.12)' }}>{pctVida}%</div>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'radial-gradient(circle at 50% 42%,#FFFFFF 0%,#FBFFFD 58%,#F0FFF8 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
              <div style={{ color: '#25B97F', fontSize: 11, fontWeight: 800, marginTop: 22, zIndex: 1 }}>Progresso geral</div>
              <img src={avatarImagem} alt="ZOE, sua coach" style={{ width: avatarId === 'essencial' ? 130 : 190, height: 159, objectFit: 'contain', margin: '-2px 0 -4px', filter: 'drop-shadow(0 12px 13px rgba(74,25,133,.13))', zIndex: 1 }} />
              <div style={{ color: C.ink, fontWeight: 900, fontSize: 17, zIndex: 1 }}>{concluidas} <span style={{ color: C.ink3, fontWeight: 600 }}>/ {totalEtapas}</span></div>
              <div style={{ color: C.ink3, fontSize: 11.5, marginTop: 1, zIndex: 1 }}>etapas concluídas</div>
            </div>
          </div>
          <button onClick={() => { setAba('trilha'); if (etapaAtual) setEtapaAberta(etapaAtual.id); }} style={{ border: 'none', borderRadius: 17, background: 'linear-gradient(135deg,#36D98B,#17CBA8)', color: '#fff', padding: '14px 30px', minWidth: 224, fontFamily: 'inherit', fontWeight: 900, fontSize: 14, boxShadow: '0 10px 24px rgba(37,217,139,.24)' }}>Continuar trilha &nbsp; →</button>
        </div>

        <div style={{ color: C.ink3, fontSize: 13, textAlign: 'center', marginBottom: 12 }}>Outras trilhas que impulsionam você</div>
        <div style={{ ...secao, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 4, padding: '17px 8px' }}>
          {trilhas.map((t, i) => <button key={t.id} onClick={() => setAba(t.id)} style={{ border: 'none', borderLeft: i ? `1px solid ${C.line}` : 'none', background: 'transparent', fontFamily: 'inherit', padding: '0 7px', cursor: 'pointer' }}>
            <div style={{ width: 62, height: 62, margin: '0 auto 8px', borderRadius: '50%', display: 'grid', placeItems: 'center', color: t.cor, background: `conic-gradient(${t.cor} ${Math.max(3, Math.min(100, t.pct))}%,${t.suave} 0)` }}><div style={{ width: 48, height: 48, borderRadius: '50%', background: t.suave, display: 'grid', placeItems: 'center' }}><t.icone size={24} /></div></div>
            <div style={{ color: C.ink, fontSize: 13, fontWeight: 800 }}>{t.nome}</div>
            <div style={{ color: C.ink3, fontSize: 10.5, margin: '4px 0 8px', whiteSpace: 'nowrap' }}>{t.valor}</div>
            <Barra v={Math.max(0, t.pct)} max={100} cor={t.cor} h={4} />
          </button>)}
        </div>

        <div style={secao}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 17 }}><strong style={{ color: C.ink, fontSize: 15 }}>Resumo de hoje</strong><button onClick={() => setAba('progresso')} style={{ border: 0, background: 'none', color: C.green, fontWeight: 800 }}>Ver tudo →</button></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)' }}>
            {[{ I: Flame, cor: C.coral, v: dia.treino, l: 'kcal queimadas' }, { I: Heart, cor: C.green, v: pontosDia, l: 'pontos' }, { I: Zap, cor: C.gold, v: Math.round((dia.humor || 0) * 3), l: 'min de foco' }].map((x, i) => <div key={x.l} style={{ textAlign: 'center', borderLeft: i ? `1px solid ${C.line}` : 'none' }}><x.I size={17} color={x.cor} /><div style={{ color: C.ink, fontWeight: 800, fontSize: 23, marginTop: 5 }}>{x.v}</div><div style={{ color: C.ink3, fontSize: 10 }}>{x.l}</div></div>)}
          </div>
        </div>

        <div style={secao}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><strong style={{ display: 'flex', gap: 8, color: C.ink }}><Moon size={19} color={C.lilac} /> Sono</strong><span style={{ color: C.lilac, fontSize: 12, fontWeight: 800 }}>Ver histórico →</span></div>
          <div style={{ display: 'flex', alignItems: 'end', gap: 20, marginTop: 15 }}><div style={{ minWidth: 92 }}><div style={{ fontSize: 25, fontWeight: 800, color: C.ink }}>{Math.floor(dia.sono || 0)}h {Math.round(((dia.sono || 0) % 1) * 60)}m</div><div style={{ color: C.ink3, fontSize: 11 }}>Sono de hoje</div></div><div style={{ display: 'flex', gap: 13, alignItems: 'end', flex: 1 }}>{[2,5,3,6,4,7,5].map((h,i)=><div key={i} style={{ flex:1, textAlign:'center' }}><div style={{ height: 42, borderRadius: 9, background: `linear-gradient(to top,${C.lilac} ${h*10}%,#EEF0F3 ${h*10}%)` }} /><span style={{ fontSize: 9, color: C.ink3 }}>{'DSTQQSS'[i]}</span></div>)}</div></div>
        </div>

        <div style={secao}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}><strong style={{ display: 'flex', gap: 8, color: C.ink }}><Smile size={19} color={C.green} /> Humor de hoje</strong><span style={{ color: C.green, fontSize: 12, fontWeight: 800 }}>Registrar humor →</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 5 }}>{humores.map(h => <button key={h.n} onClick={() => setDia({ humor: h.n })} style={{ border: 0, background: 'transparent', fontFamily: 'inherit' }}><div style={{ width: 42, height: 42, margin: 'auto', borderRadius: '50%', display: 'grid', placeItems: 'center', background: `${h.cor}22`, color: h.cor, border: dia.humor === h.n ? `2px solid ${h.cor}` : '2px solid transparent', fontSize: 20, fontWeight: 800 }}>{h.rosto}</div><div style={{ color: C.ink2, fontSize: 9.5, marginTop: 5 }}>{h.nome}</div></button>)}</div>
        </div>

        <div style={secao}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}><strong style={{ display: 'flex', gap: 8, color: C.ink }}><Target size={19} color={C.lilac} /> Metas da semana</strong><span style={{ color: C.lilac, fontSize: 12, fontWeight: 800 }}>Ver todas →</span></div>
          {metasSemana.map((m,i)=><div key={m.nome} style={{ display:'grid', gridTemplateColumns:'34px 1fr auto', alignItems:'center', gap:10, marginTop:i?14:0 }}><div style={{ width:34,height:34,borderRadius:'50%',background:`${m.cor}18`,display:'grid',placeItems:'center' }}><m.icone size={17} color={m.cor}/></div><div><div style={{ color:C.ink,fontSize:12.5,marginBottom:6 }}>{m.nome}</div><Barra v={m.valor} max={m.meta} cor={m.cor} h={5}/></div><div style={{ color:C.ink2,fontSize:11,fontWeight:700 }}>{m.valor}/{m.meta} dias</div></div>)}
        </div>

        <div style={secao}>
          <div style={{ display:'flex',justifyContent:'space-between',marginBottom:8 }}><strong style={{ display:'flex',gap:8,color:C.ink }}><CheckCircle2 size={19} color={C.green}/> Top hábitos</strong><span style={{ color:C.green,fontSize:12,fontWeight:800 }}>Ver todos →</span></div>
          {[['Meditar',Compass],['Ler 20 páginas',BookOpen]].map(([nome,I],i)=><div key={nome} style={{ display:'flex',alignItems:'center',gap:11,padding:'13px 0',borderTop:i?`1px solid ${C.line}`:'none' }}><div style={{ width:36,height:36,borderRadius:'50%',background:i?'#F2E8FF':'#E4F7EF',display:'grid',placeItems:'center' }}><I size={17} color={i?C.lilac:C.green}/></div><span style={{ flex:1,color:C.ink,fontSize:13 }}>{nome}</span><div style={{ textAlign:'right',color:C.ink,fontWeight:800 }}>0<div style={{ color:C.ink3,fontSize:9,fontWeight:500 }}>dias seguidos</div></div><ChevronRight size={16} color={C.ink3}/></div>)}
        </div>
      </div>
    );
  };

  /* ══════════ COMIDA ══════════ */
  const Comida = () => {
    const f = forms.alimento;
    const jejumH = d.jejum ? (Date.now() - d.jejum.inicio) / 3600000 : 0;
    return (
      <div style={{ paddingBottom: 120 }}>
        <div style={{ background: `linear-gradient(175deg,${C.aquaSuave},${C.bg})`, padding: '18px 18px 12px' }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: C.ink, margin: '0 0 14px' }}>Alimentação</h1>
          <Card cls="zoe-surge">
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', marginBottom: 13 }}>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: 21, fontWeight: 800, color: C.ink }}>{dia.kcal}</div><div style={{ fontSize: 10.5, color: C.ink3 }}>Consumidas</div></div>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: 35, fontWeight: 800, color: C.azul }}>{Math.max(0, d.perfil.metaKcal - dia.kcal)}</div><div style={{ fontSize: 10.5, color: C.ink3 }}>kcal restantes</div></div>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: 21, fontWeight: 800, color: C.ink }}>{d.perfil.metaKcal}</div><div style={{ fontSize: 10.5, color: C.ink3 }}>Meta</div></div>
            </div>
            <Barra v={dia.kcal} max={d.perfil.metaKcal} cor={C.aqua} />
          </Card>
        </div>
        <div style={{ padding: 18 }}>
          <Card style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 800, color: C.ink, marginBottom: 3 }}><Timer size={16} color={C.gold} /> Jejum</div>
                <div style={{ fontSize: 12.5, color: C.ink2 }}>{d.jejum ? `${jejumH.toFixed(1)}h de ${d.jejum.metaHoras}h` : 'Nenhum jejum ativo'}</div>
              </div>
              {d.jejum
                ? <Btn cor={C.coral} style={{ padding: '10px 15px' }} onClick={() => { up(s => ({ ...s, jejum: null })); aviso('Jejum encerrado'); }}>Encerrar</Btn>
                : <Btn cor={C.gold} style={{ padding: '10px 15px' }} onClick={() => { up(s => ({ ...s, jejum: { inicio: Date.now(), metaHoras: 16 } })); aviso('Jejum iniciado'); }}>Começar 16h</Btn>}
            </div>
            {d.jejum && <div style={{ marginTop: 11 }}><Barra v={jejumH} max={d.jejum.metaHoras} cor={C.gold} /></div>}
          </Card>

          {['Café da manhã', 'Almoço', 'Jantar', 'Lanches'].map(r => {
            const itens = dia.refeicoes.filter(x => x.refeicao === r);
            const tot = itens.reduce((a, x) => a + x.kcal, 0);
            return (
              <Card key={r} style={{ marginBottom: 11 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: itens.length ? 11 : 0 }}>
                  <div>
                    <div style={{ fontWeight: 800, color: C.ink, fontSize: 14.5 }}>{r}</div>
                    <div style={{ fontSize: 11.5, color: C.ink3 }}>{tot} kcal</div>
                  </div>
                  <button onClick={() => { setRefAtiva(r); setSheet('alimento'); }} style={{ width: 33, height: 33, borderRadius: 11, border: 'none', background: C.green, color: '#fff', cursor: 'pointer' }}><Plus size={17} /></button>
                </div>
                {itens.map(x => (
                  <div key={x.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderTop: `1px solid ${C.line}` }}>
                    <div><div style={{ fontSize: 13.5, color: C.ink, fontWeight: 600 }}>{x.nome}</div><div style={{ fontSize: 10.5, color: C.ink3 }}>C {x.carb} · P {x.prot} · G {x.gord}</div></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{x.kcal}</span>
                      <button onClick={() => { const n = dia.refeicoes.filter(y => y.id !== x.id); setDia({ refeicoes: n, kcal: n.reduce((a, y) => a + y.kcal, 0) }); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.ink3 }}><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </Card>
            );
          })}
        </div>

        <Sheet aberto={sheet === 'alimento'} fechar={() => setSheet(null)} titulo={`Adicionar em ${refAtiva}`}>
          <Campo label="Alimento" placeholder="Ex: Omelete de 2 ovos" value={f.nome} onChange={e => setForm('alimento', { nome: e.target.value })} />
          <Campo label="Calorias (kcal)" type="number" inputMode="numeric" value={f.kcal} onChange={e => setForm('alimento', { kcal: e.target.value })} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 9 }}>
            <Campo label="Carb (g)" type="number" inputMode="numeric" value={f.carb} onChange={e => setForm('alimento', { carb: e.target.value })} />
            <Campo label="Prot (g)" type="number" inputMode="numeric" value={f.prot} onChange={e => setForm('alimento', { prot: e.target.value })} />
            <Campo label="Gord (g)" type="number" inputMode="numeric" value={f.gord} onChange={e => setForm('alimento', { gord: e.target.value })} />
          </div>
          <Btn style={{ width: '100%', marginTop: 6 }} onClick={() => {
            if (!f.nome.trim()) return aviso('Dê um nome ao alimento');
            const n = [...dia.refeicoes, { id: Date.now(), refeicao: refAtiva, nome: f.nome.trim(), kcal: +f.kcal || 0, carb: +f.carb || 0, prot: +f.prot || 0, gord: +f.gord || 0 }];
            setDia({ refeicoes: n, kcal: n.reduce((a, x) => a + x.kcal, 0) });
            setForm('alimento', { nome: '', kcal: '', carb: '', prot: '', gord: '' });
            setSheet(null); aviso('Alimento registrado');
          }}>Adicionar</Btn>
        </Sheet>
      </div>
    );
  };

  /* ══════════ PROGRESSO ══════════ */
  const Progresso = () => {
    const nd = periodo === 'semana' ? 7 : periodo === 'mes' ? 30 : 90;
    const serie = Array.from({ length: nd }, (_, i) => {
      const dt = new Date(); dt.setDate(dt.getDate() - (nd - 1 - i));
      const iso = dt.toISOString().split('T')[0];
      const m = d.agenda[iso] || {};
      const pts = Object.entries(m).reduce((a, [k, v]) => {
        if (!v) return a;
        const et = sequencia.find(e => e.tipo === 'agenda' && k.startsWith(e.id + '-'));
        if (!et) return a;
        const idx = +k.slice(et.id.length + 1);
        return a + (et.tarefas[idx]?.p || 0);
      }, 0);
      const dd = d.dias[iso] || {};
      return { pts, kcal: dd.kcal || 0, agua: dd.agua || 0, humor: dd.humor || 0, lbl: dt.getDate() };
    });

    const rodasFeitas = Object.keys(d.rodas).map(Number).sort();
    return (
      <div style={{ paddingBottom: 120 }}>
        <div style={{ background: `linear-gradient(175deg,${C.aquaSuave},${C.bg})`, padding: '18px 18px 14px' }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: C.ink, margin: '0 0 14px' }}>Progresso</h1>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,.7)', borderRadius: 13, padding: 4 }}>
            {[['semana', 'Semana'], ['mes', 'Mês'], ['tri', '3 meses']].map(([k, l]) => (
              <button key={k} onClick={() => setPeriodo(k)} style={{ flex: 1, padding: 10, borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'inherit', background: periodo === k ? C.green : 'transparent', color: periodo === k ? '#fff' : C.ink2 }}>{l}</button>
            ))}
          </div>
        </div>
        <div style={{ padding: 18 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
            {[['Pontos', serie.reduce((a, s) => a + s.pts, 0), C.petroleo], ['Etapas', concluidas, C.sky], ['Sequência', streak, C.coral]].map(([l, v, cor], i) => (
              <Card key={l} cls="zoe-surge" style={{ textAlign: 'center', padding: 14, animationDelay: `${i * 70}ms` }}>
                <div style={{ fontSize: 23, fontWeight: 800, color: cor }}>{v}</div>
                <div style={{ fontSize: 10.5, color: C.ink3, marginTop: 2 }}>{l}</div>
              </Card>
            ))}
          </div>

          <Card style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 800, color: C.ink, fontSize: 14.5, marginBottom: 12 }}>Pontuação da agenda</div>
            <GraficoLinha dados={serie.map(s => s.pts)} cor={C.lima} />
          </Card>
          <Card style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 800, color: C.ink, fontSize: 14.5, marginBottom: 12 }}>Calorias</div>
            <GraficoBarras dados={serie.map(s => s.kcal)} max={d.perfil.metaKcal} cor={C.coral} rotulos={nd <= 7 ? serie.map(s => s.lbl) : null} />
          </Card>
          <Card style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 800, color: C.ink, fontSize: 14.5, marginBottom: 12 }}>Água</div>
            <GraficoBarras dados={serie.map(s => s.agua)} max={d.perfil.metaAgua} cor={C.sky} rotulos={nd <= 7 ? serie.map(s => s.lbl) : null} />
          </Card>
          <Card style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 800, color: C.ink, fontSize: 14.5, marginBottom: 12 }}>Energia e humor</div>
            <GraficoLinha dados={serie.map(s => s.humor)} cor={C.gold} />
          </Card>

          {rodasFeitas.length > 0 && (
            <Card style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 800, color: C.ink, fontSize: 14.5, marginBottom: 4 }}>Evolução da roda da vida</div>
              <div style={{ fontSize: 12, color: C.ink3, marginBottom: 12 }}>Média de cada checkpoint</div>
              <GraficoBarras
                dados={rodasFeitas.map(r => RODA_SETORES.reduce((a, s) => a + (d.rodas[r][s] || 0), 0) / RODA_SETORES.length)}
                max={10} cor={C.lilac} rotulos={rodasFeitas.map(r => `#${r}`)} />
            </Card>
          )}

          <Card>
            <div style={{ fontWeight: 800, color: C.ink, marginBottom: 12 }}>Metas diárias</div>
            {[['Calorias', 'metaKcal', 'kcal'], ['Água', 'metaAgua', 'ml']].map(([l, k, u]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ flex: 1, fontSize: 14, color: C.ink }}>{l}</span>
                <input type="number" inputMode="numeric" value={d.perfil[k]} onChange={e => up(s => ({ ...s, perfil: { ...s.perfil, [k]: +e.target.value || 0 } }))}
                  style={{ width: 88, padding: '9px 11px', borderRadius: 11, border: `1.5px solid ${C.line}`, fontSize: 14, textAlign: 'right', fontFamily: 'inherit', color: C.ink, outline: 'none' }} />
                <span style={{ fontSize: 12, color: C.ink3, width: 34 }}>{u}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    );
  };

  /* ══════════ DIÁRIO DE FOTOS ══════════ */
  const Diario = () => {
    const cat = forms.catFoto;
    const lista = d.fotos.filter(f => cat === 'todas' || f.cat === cat);
    const porData = [...lista].sort((a, b) => a.data < b.data ? 1 : -1);
    const primeira = porData[porData.length - 1], ultima = porData[0];
    const selecionadas = comparar.map(id => d.fotos.find(f => f.id === id)).filter(Boolean);

    return (
      <div style={{ paddingBottom: 120 }}>
        <div style={{ background: `linear-gradient(175deg,${C.aquaSuave},${C.bg})`, padding: '18px 18px 14px' }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: C.ink, margin: '0 0 4px' }}>Diário de fotos</h1>
          <p style={{ fontSize: 13, color: C.ink2, margin: '0 0 14px' }}>Registre hoje para comparar depois</p>
          <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 3 }}>
            {[{ id: 'todas', nome: 'Todas', icone: '🗂' }, ...CATEGORIAS_FOTO].map(c => (
              <button key={c.id} onClick={() => setForms(x => ({ ...x, catFoto: c.id }))}
                style={{
                  padding: '8px 14px', borderRadius: 99, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                  fontWeight: 700, fontSize: 12.5, fontFamily: 'inherit',
                  background: cat === c.id ? C.petroleo : C.card, color: cat === c.id ? '#fff' : C.ink2
                }}>{c.icone} {c.nome}</button>
            ))}
          </div>
        </div>

        <div style={{ padding: 18 }}>
          <Btn cor={C.lima} style={{ width: '100%', padding: 15, marginBottom: 16 }}
            onClick={() => pedirFoto(cat === 'todas' ? 'corpo' : cat)}>
            Adicionar foto de hoje
          </Btn>

          {/* antes e depois automático */}
          {porData.length >= 2 && cat !== 'todas' && (
            <Card style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 800, color: C.ink, fontSize: 14.5, marginBottom: 3 }}>Antes e depois</div>
              <div style={{ fontSize: 12, color: C.ink3, marginBottom: 12 }}>
                {diasEntre(primeira.data, ultima.data)} dias entre as duas
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
                {[primeira, ultima].map((f, i) => (
                  <div key={f.id}>
                    <Foto id={f.id} email={usuario.email} onClick={() => setVisor(f.id)}
                      style={{ width: '100%', aspectRatio: '3/4', borderRadius: 14 }} />
                    <div style={{ fontSize: 11, fontWeight: 700, color: i ? C.petroleo : C.ink3, marginTop: 6, textAlign: 'center' }}>
                      {i ? 'Agora' : 'Início'} · {new Date(f.data + 'T12:00').toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* comparação manual */}
          {selecionadas.length > 0 && (
            <Card style={{ marginBottom: 16, border: `1.5px solid ${C.azul}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 11 }}>
                <span style={{ fontWeight: 800, color: C.ink, fontSize: 14 }}>
                  Comparando {selecionadas.length === 2 ? `· ${diasEntre(selecionadas[0].data, selecionadas[1].data)} dias` : '· escolha mais uma'}
                </span>
                <button onClick={() => setComparar([])} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.ink3, fontSize: 12, fontWeight: 700, fontFamily: 'inherit' }}>Limpar</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: selecionadas.length === 2 ? '1fr 1fr' : '1fr', gap: 9 }}>
                {[...selecionadas].sort((a, b) => a.data < b.data ? -1 : 1).map(f => (
                  <div key={f.id}>
                    <Foto id={f.id} email={usuario.email} onClick={() => setVisor(f.id)}
                      style={{ width: '100%', aspectRatio: '3/4', borderRadius: 14 }} />
                    <div style={{ fontSize: 11, color: C.ink2, marginTop: 6, textAlign: 'center', fontWeight: 700 }}>
                      {new Date(f.data + 'T12:00').toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {porData.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: 30 }}>
              <div style={{ fontSize: 34, marginBottom: 10 }}>📷</div>
              <div style={{ fontWeight: 700, color: C.ink, fontSize: 15, marginBottom: 5 }}>Nenhuma foto ainda</div>
              <div style={{ fontSize: 13, color: C.ink3, lineHeight: 1.5 }}>
                A primeira foto vira o seu marco zero. Daqui a algumas semanas ela vale muito.
              </div>
            </Card>
          ) : (
            <>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink2, marginBottom: 10 }}>
                {porData.length} {porData.length === 1 ? 'foto' : 'fotos'} · toque para ampliar, segure o botão comparar
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {porData.map(f => {
                  const sel = comparar.includes(f.id);
                  return (
                    <div key={f.id} style={{ position: 'relative' }}>
                      <Foto id={f.id} email={usuario.email} onClick={() => setVisor(f.id)}
                        style={{ width: '100%', aspectRatio: '1', borderRadius: 13, border: sel ? `2.5px solid ${C.azul}` : 'none' }} />
                      <button onClick={() => setComparar(c => c.includes(f.id) ? c.filter(x => x !== f.id) : [...c.slice(-1), f.id])}
                        style={{
                          position: 'absolute', top: 5, right: 5, width: 22, height: 22, borderRadius: 7, border: 'none',
                          cursor: 'pointer', fontSize: 10, fontWeight: 800, fontFamily: 'inherit',
                          background: sel ? C.azul : 'rgba(255,255,255,.88)', color: sel ? '#fff' : C.ink2
                        }}>{sel ? '✓' : '+'}</button>
                      <div style={{ fontSize: 9.5, color: C.ink3, textAlign: 'center', marginTop: 4 }}>
                        {new Date(f.data + 'T12:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  /* ══════════ EXTRAS (alarmes + biblioteca) ══════════ */
  const Extras = () => {
    const a = forms.alarme, b = forms.biblioteca, tipo = forms.tipoMidia;
    return (
      <div style={{ paddingBottom: 120 }}>
        <div style={{ background: `linear-gradient(175deg,${C.aquaSuave},${C.bg})`, padding: '18px 18px 14px' }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: C.ink, margin: 0 }}>Apoio</h1>
          <p style={{ fontSize: 13, color: C.ink2, margin: '4px 0 0' }}>Lembretes e sua biblioteca</p>
        </div>
        <div style={{ padding: 18 }}>
          <Card style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 800, color: C.ink, marginBottom: 12 }}>Novo lembrete</div>
            <Campo label="O que lembrar" placeholder="Ex: Ritual do acordar" value={a.titulo} onChange={e => setForm('alarme', { titulo: e.target.value })} />
            <Campo label="Hora" type="time" value={a.hora} onChange={e => setForm('alarme', { hora: e.target.value })} />
            <div style={{ fontSize: 12, fontWeight: 700, color: C.ink2, marginBottom: 6 }}>Dias</div>
            <div style={{ display: 'flex', gap: 5, marginBottom: 14 }}>
              {DIAS_ORD.map((idx, i) => {
                const on = a.dias.includes(idx);
                return <button key={i} onClick={() => setForm('alarme', { dias: on ? a.dias.filter(x => x !== idx) : [...a.dias, idx] })}
                  style={{ flex: 1, padding: 9, borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 12, fontFamily: 'inherit', background: on ? C.green : '#F2F5F4', color: on ? '#fff' : C.ink3 }}>{DIAS_LBL[i]}</button>;
              })}
            </div>
            <div style={{ display: 'flex', gap: 9 }}>
              <Btn variante="outline" cor={C.ink2} style={{ flex: 1 }} onClick={permissao}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><BellRing size={15} /> Ativar</span></Btn>
              <Btn style={{ flex: 1 }} onClick={() => {
                if (!a.titulo.trim()) return aviso('Dê um nome ao lembrete');
                up(s => ({ ...s, alarmes: [...s.alarmes, { ...a, id: Date.now(), ativo: true }] }));
                setForm('alarme', { titulo: '', hora: '05:00', dias: [1, 2, 3, 4, 5] }); aviso('Lembrete criado');
              }}>Criar</Btn>
            </div>
          </Card>

          {d.alarmes.map(x => (
            <Card key={x.id} style={{ marginBottom: 9, padding: 14, opacity: x.ativo ? 1 : .5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: C.ink }}>{x.hora}</div>
                  <div style={{ fontSize: 13.5, color: C.ink, fontWeight: 600 }}>{x.titulo}</div>
                  <div style={{ fontSize: 10.5, color: C.ink3, marginTop: 2 }}>{DIAS_ORD.filter(i => x.dias.includes(i)).map(i => DIAS_LBL[DIAS_ORD.indexOf(i)]).join(' · ')}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <button onClick={() => up(s => ({ ...s, alarmes: s.alarmes.map(y => y.id === x.id ? { ...y, ativo: !y.ativo } : y) }))}
                    style={{ width: 46, height: 27, borderRadius: 99, border: 'none', cursor: 'pointer', position: 'relative', background: x.ativo ? C.green : C.line }}>
                    <span style={{ position: 'absolute', top: 3, left: x.ativo ? 22 : 3, width: 21, height: 21, borderRadius: 99, background: '#fff', transition: 'left .2s' }} />
                  </button>
                  <button onClick={() => up(s => ({ ...s, alarmes: s.alarmes.filter(y => y.id !== x.id) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.ink3 }}><Trash2 size={15} /></button>
                </div>
              </div>
            </Card>
          ))}

          <div style={{ display: 'flex', gap: 7, margin: '22px 0 12px' }}>
            {['Livro', 'Filme', 'Vídeo'].map(t => (
              <button key={t} onClick={() => setForms(x => ({ ...x, tipoMidia: t }))}
                style={{ flex: 1, padding: 10, borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'inherit', background: tipo === t ? C.petroleo : C.card, color: tipo === t ? '#fff' : C.ink2 }}>{t}s</button>
            ))}
          </div>
          <Card style={{ marginBottom: 12 }}>
            <Campo label="Título" value={b.titulo} onChange={e => setForm('biblioteca', { titulo: e.target.value })} />
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 9 }}>
              <Campo label="Autor" value={b.autor} onChange={e => setForm('biblioteca', { autor: e.target.value })} />
              <Campo label="Nota" type="number" inputMode="numeric" value={b.nota} onChange={e => setForm('biblioteca', { nota: e.target.value })} />
            </div>
            <Area label="Resenha e trecho favorito" value={b.resenha} onChange={e => setForm('biblioteca', { resenha: e.target.value })} style={{ minHeight: 76 }} />
            <Btn style={{ width: '100%' }} onClick={() => {
              if (!b.titulo.trim()) return aviso('Informe o título');
              up(s => ({ ...s, biblioteca: [{ ...b, id: Date.now(), tipo, data: hoje() }, ...s.biblioteca] }));
              setForm('biblioteca', { titulo: '', autor: '', nota: '', resenha: '' }); aviso('Adicionado à biblioteca');
            }}>Adicionar</Btn>
          </Card>
          {d.biblioteca.filter(x => x.tipo === tipo).map(x => (
            <Card key={x.id} style={{ marginBottom: 9, padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, color: C.ink, fontSize: 14 }}>{x.titulo}</div>
                  <div style={{ fontSize: 11.5, color: C.ink3 }}>{x.autor}</div>
                  {x.resenha && <div style={{ fontSize: 12.5, color: C.ink2, marginTop: 7, lineHeight: 1.5 }}>{x.resenha}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                  {x.nota && <span style={{ padding: '3px 8px', background: C.mint, borderRadius: 8, fontSize: 11.5, fontWeight: 800, color: C.greenDark }}>{x.nota}</span>}
                  <button onClick={() => up(s => ({ ...s, biblioteca: s.biblioteca.filter(y => y.id !== x.id) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.ink3 }}><Trash2 size={14} /></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  /* ══════════ QUICK ADD ══════════ */
  const QuickAdd = () => fab ? (
    <div onClick={() => setFab(false)} style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(242,245,244,.95)', backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 22 }}>
      <div onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: 'center', marginBottom: 20, fontSize: 15, fontWeight: 800, color: C.ink }}>Registrar agora</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11, marginBottom: 14 }}>
          {[
            ['💧', 'Água', () => { setDia({ agua: dia.agua + 250 }); aviso('+250 ml'); setFab(false); }],
            ['🏋️', 'Treino', () => { setFab(false); setSheet('treino'); }],
            ['🍽️', 'Refeição', () => { setFab(false); setAba('comida'); }],
            ['🎯', 'Minha etapa', () => { setFab(false); setAba('trilha'); if (etapaAtual) setEtapaAberta(etapaAtual.id); }],
            ['📷', 'Foto do diário', () => { setFab(false); setAba('diario'); }],
            ['📖', 'Livro ou lembrete', () => { setFab(false); setAba('extras'); }]
          ].map(([ic, n, fn], i) => (
            <Card key={n} cls="zoe-surge" onClick={fn} style={{ textAlign: 'center', padding: 20, cursor: 'pointer', animationDelay: `${i * 45}ms` }}>
              <div style={{ fontSize: 28, marginBottom: 7 }}>{ic}</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink }}>{n}</div>
            </Card>
          ))}
        </div>
        <Card cls="zoe-surge" onClick={() => {
          if (d.jejum) { up(s => ({ ...s, jejum: null })); aviso('Jejum encerrado'); }
          else { up(s => ({ ...s, jejum: { inicio: Date.now(), metaHoras: 16 } })); aviso('Jejum iniciado'); }
          setFab(false);
        }} style={{ textAlign: 'center', cursor: 'pointer', padding: 15, animationDelay: '280ms' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 700, color: C.ink, fontSize: 14.5 }}>
            <Timer size={18} color={C.gold} /> {d.jejum ? 'Encerrar jejum' : 'Começar jejum'}
          </span>
        </Card>
      </div>
      <button onClick={() => setFab(false)} style={{ position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', width: 58, height: 58, borderRadius: 99, border: 'none', background: C.green, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(7,91,89,.34)' }}><X size={25} /></button>
    </div>
  ) : null;

  const NAV = [
    { id: 'inicio', n: 'Início', i: Home },
    { id: 'trilha', n: 'Trilha', i: Route },
    { id: 'agenda', n: 'Agenda', i: CalendarDays },
    { id: 'fab', n: '', i: Plus },
    { id: 'dopamina', n: 'Dopamina', i: Flame },
    { id: 'financeiro', n: 'Financeiro', i: Wallet }
  ];

  return (
    <>
      <style>{CSS}</style>
      <div style={{ background: C.bg, minHeight: '100vh', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif', color: C.ink, maxWidth: 520, margin: '0 auto', position: 'relative' }}>
        {aba === 'inicio' && Inicio()}
        {aba === 'trilha' && Trilha()}
        {aba === 'agenda' && Agenda()}
        {aba === 'comida' && Comida()}
        {aba === 'progresso' && Progresso()}
        {aba === 'diario' && Diario()}
        {aba === 'extras' && Extras()}
        {aba === 'financeiro' && <Financeiro d={d} up={up} aviso={aviso} />}
        {aba === 'ingles' && <Ingles d={d} up={up} aviso={aviso} />}
        {aba === 'dopamina' && <Dopamina d={d} up={up} aviso={aviso} />}
        {aba === 'conquistas' && <Conquistas d={d} up={up} aviso={aviso} />}

        {QuickAdd()}

        <Sheet aberto={maisAberto} fechar={() => setMaisAberto(false)} titulo="Mais">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              ['diario', 'Feed', Camera, C.sky],
              ['progresso', 'Performance', TrendingUp, C.green],
              ['conquistas', 'Conquistas', Trophy, C.gold],
              ['extras', 'Apoio', Compass, C.lilac]
            ].map(([id, nome, Icone, cor]) => (
              <button key={id} onClick={() => { setAba(id); setMaisAberto(false); }} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10, padding: 16,
                borderRadius: 16, border: `1.5px solid ${C.line}`, background: '#FAFCFB', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left'
              }}>
                <div style={{ width: 36, height: 36, borderRadius: 12, background: cor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icone size={18} color={sobre(cor)} />
                </div>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: C.ink }}>{nome}</span>
              </button>
            ))}
          </div>
        </Sheet>

        <Sheet aberto={sheet === 'perfil'} fechar={() => setSheet(null)} titulo="Sua conta">
          <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '2px 2px 18px', borderBottom: `1px solid ${C.line}` }}>
            <div style={{ width: 52, height: 52, borderRadius: 18, background: '#fff', boxShadow: '0 6px 18px rgba(24,42,65,.09)', display: 'grid', placeItems: 'center' }}><ZoeContaIcon tamanho={46} /></div>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: C.ink, fontWeight: 900, fontSize: 16 }}>{d.perfil.nome || usuario?.nome || 'Minha conta'}</div>
              <div style={{ color: C.ink3, fontSize: 11.5, marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.perfil.email || usuario?.email}</div>
            </div>
          </div>
          <div style={{ display: 'grid', gap: 9, marginTop: 16 }}>
            <button onClick={() => setSheet('avatar')} style={{ minHeight: 54, padding: '0 14px', borderRadius: 16, border: `1px solid ${C.line}`, background: '#fff', color: C.ink, display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left' }}>
              <span style={{ width: 34, height: 34, borderRadius: 11, background: C.limaSuave, display: 'grid', placeItems: 'center', color: C.petroleo }}><Sparkles size={17} /></span>
              <span style={{ flex: 1 }}><span style={{ display: 'block', fontSize: 13.5, fontWeight: 850 }}>Trocar avatar</span><span style={{ display: 'block', color: C.ink3, fontSize: 10.5, marginTop: 2 }}>Escolha entre Essencial e Fun</span></span>
              <ChevronRight size={17} color={C.ink3} />
            </button>
            <button onClick={() => { setSheet(null); permissao(); }} style={{ minHeight: 54, padding: '0 14px', borderRadius: 16, border: `1px solid ${C.line}`, background: '#fff', color: C.ink, display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left' }}>
              <span style={{ width: 34, height: 34, borderRadius: 11, background: C.aquaSuave, display: 'grid', placeItems: 'center', color: C.petroleo }}><Bell size={17} /></span>
              <span style={{ flex: 1, fontSize: 13.5, fontWeight: 850 }}>Notificações</span>
              <ChevronRight size={17} color={C.ink3} />
            </button>
            <button onClick={async () => { setSheet(null); await sair(); }} style={{ minHeight: 54, padding: '0 14px', borderRadius: 16, border: '1px solid #F1DEDE', background: '#FFF9F9', color: '#A43C3C', display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left' }}>
              <span style={{ width: 34, height: 34, borderRadius: 11, background: '#FCEAEA', display: 'grid', placeItems: 'center' }}><LogOut size={17} /></span>
              <span style={{ flex: 1, fontSize: 13.5, fontWeight: 850 }}>Sair do aplicativo</span>
            </button>
          </div>
          <div style={{ textAlign: 'center', color: C.ink3, fontSize: 10.5, marginTop: 18 }}>ZOE · versão 1.0.0</div>
        </Sheet>

        <Sheet
          aberto={sheet === 'avatar' || !!(usuario && !d.perfil?.avatar)}
          fechar={() => { if (d.perfil?.avatar) setSheet(null); }}
          titulo="Como a ZOE acompanha você?"
        >
          <p style={{ margin: '-6px 0 18px', color: C.ink2, fontSize: 13, lineHeight: 1.5 }}>
            Escolha a companhia que combina com seu jeito. Você poderá trocar quando quiser.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { id: 'essencial', nome: 'ZOE Essencial', texto: 'Mais madura, discreta e reflexiva.', imagem: avatarZoeEssencial, fundo: '#F4EDFF' },
              { id: 'fun', nome: 'ZOE Fun', texto: 'Mais expressiva, leve e gamificada.', imagem: avatarZoeFun, fundo: '#F1FFDB' }
            ].map(opcao => {
              const ativa = d.perfil?.avatar === opcao.id;
              return (
                <button key={opcao.id} onClick={() => {
                  up(s => ({ ...s, perfil: { ...s.perfil, avatar: opcao.id } }));
                  setSheet(null);
                  aviso(`${opcao.nome} escolhida`);
                }} style={{ border: `2px solid ${ativa ? C.roxo : C.line}`, background: ativa ? '#FBF8FF' : '#fff', borderRadius: 20, padding: 12, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', boxShadow: ativa ? '0 8px 22px rgba(142,45,226,.13)' : 'none' }}>
                  <div style={{ height: 170, borderRadius: 16, background: opcao.fundo, display: 'grid', placeItems: 'center', overflow: 'hidden', marginBottom: 11 }}>
                    <img src={opcao.imagem} alt="" style={{ width: opcao.id === 'essencial' ? '78%' : '92%', height: '94%', objectFit: 'contain' }} />
                  </div>
                  <div style={{ color: C.ink, fontWeight: 900, fontSize: 13.5 }}>{opcao.nome}</div>
                  <div style={{ color: C.ink3, fontSize: 10.5, lineHeight: 1.4, marginTop: 4 }}>{opcao.texto}</div>
                  <div style={{ height: 28, marginTop: 10, borderRadius: 10, display: 'grid', placeItems: 'center', background: ativa ? C.roxo : '#F2F5F4', color: ativa ? '#fff' : C.ink3, fontSize: 10.5, fontWeight: 900 }}>{ativa ? 'ESCOLHIDA' : 'ESCOLHER'}</div>
                </button>
              );
            })}
          </div>
        </Sheet>

        <Sheet aberto={sheet === 'treino'} fechar={() => setSheet(null)} titulo="Registrar treino">
          <Campo label="Calorias queimadas" type="number" inputMode="numeric" id="tk" />
          <Campo label="Passos" type="number" inputMode="numeric" id="tp" />
          <Btn style={{ width: '100%' }} onClick={() => {
            const k = +(document.getElementById('tk')?.value || 0), p = +(document.getElementById('tp')?.value || 0);
            setDia({ treino: dia.treino + k, passos: dia.passos + p });
            marcarTarefaPorNome(/academia/i);
            setSheet(null); aviso('Treino registrado');
          }}>Salvar</Btn>
        </Sheet>

        {/* seletor de imagem escondido */}
        <input ref={inputFoto} type="file" accept="image/*" onChange={receberFoto} style={{ display: 'none' }} />

        {coach && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 110, background: `linear-gradient(160deg,${coach.bloco.cor},${C.petroleo})`, padding: '28px 20px', overflowY: 'auto', color: '#fff' }}>
            <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ width: 240, height: 245, margin: '4px auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFEFA', borderRadius: '47% 53% 44% 56% / 55% 45% 55% 45%', boxShadow: '0 16px 32px rgba(21,12,58,.2)' }}><img src={avatarImagem} alt="ZOE celebrando" style={{ height: avatarId === 'essencial' ? 220 : 190, maxWidth: 205, objectFit: 'contain' }} /></div>
              <div style={{ textAlign: 'center', fontSize: 11, fontWeight: 800, letterSpacing: 1.4, opacity: .75 }}>ZOE · SUA COACH</div>
              <h1 style={{ textAlign: 'center', fontSize: 27, lineHeight: 1.18, margin: '8px 0 18px' }}>{coach.titulo}</h1>
              <div style={{ background: 'rgba(255,255,255,.96)', color: C.ink, borderRadius: 24, padding: 20, boxShadow: '0 18px 45px rgba(0,0,0,.18)' }}>
                <p style={{ fontSize: 14, lineHeight: 1.65, margin: '0 0 17px', color: C.ink2 }}>{coach.texto}</p>
                {coach.tipo === 'sessao' && <><div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>Antes de seguir, leve estas reflexões:</div>
                {coach.reflexoes.map((q, i) => <div key={q} style={{ marginBottom: 12 }}><label style={{ fontSize: 12, fontWeight: 700, color: coach.bloco.cor }}>{i + 1}. {q}</label><textarea value={campo(`coach-${coach.bloco.id}-${i}`)} onChange={ev => setCampo(`coach-${coach.bloco.id}-${i}`, ev.target.value)} placeholder="Escreva o que vier com sinceridade" style={{ width: '100%', minHeight: 62, marginTop: 6, borderRadius: 12, border: `1.5px solid ${C.line}`, padding: 11, resize: 'vertical', fontFamily: 'inherit', color: C.ink, outline: 'none' }} /></div>)}</>}
              </div>
              <button onClick={() => { const ultimo = coach.tipo === 'etapa' ? coach.etapaId : coach.bloco.etapas[coach.bloco.etapas.length - 1].id; setCoach(null); abrirProximaEtapa(ultimo); }} style={{ width: '100%', marginTop: 18, border: 0, borderRadius: 16, background: '#fff', color: coach.bloco.cor, padding: 16, fontSize: 15, fontWeight: 900, fontFamily: 'inherit', boxShadow: '0 6px 0 rgba(0,0,0,.16)' }}>{coach.tipo === 'etapa' ? 'CONTINUAR' : 'CONTINUAR PARA A PRÓXIMA SESSÃO'}</button>
            </div>
          </div>
        )}

        {/* visor em tela cheia */}
        {visor && (() => {
          const f = d.fotos.find(x => x.id === visor);
          if (!f) return null;
          return (
            <div onClick={() => setVisor(null)} style={{ position: 'fixed', inset: 0, zIndex: 120, background: 'rgba(11,20,22,.94)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 16 }}>
              <Foto id={f.id} email={usuario.email} style={{ width: '100%', maxHeight: '68vh', objectFit: 'contain', borderRadius: 16 }} />
              <div onClick={ev => ev.stopPropagation()} style={{ marginTop: 16 }}>
                <div style={{ color: '#fff', fontSize: 14, fontWeight: 700, textAlign: 'center', marginBottom: 4 }}>
                  {new Date(f.data + 'T12:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <div style={{ color: 'rgba(255,255,255,.6)', fontSize: 12, textAlign: 'center', marginBottom: 14 }}>
                  {(CATEGORIAS_FOTO.find(c => c.id === f.cat) || {}).nome || 'Momento'}
                </div>
                <input value={f.legenda || ''} placeholder="Escreva uma legenda"
                  onChange={ev => up(st => ({ ...st, fotos: st.fotos.map(x => x.id === f.id ? { ...x, legenda: ev.target.value } : x) }))}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: 'none', fontSize: 14, fontFamily: 'inherit', outline: 'none', marginBottom: 12 }} />
                <div style={{ display: 'flex', gap: 10 }}>
                  <Btn variante="outline" cor="#fff" style={{ flex: 1 }} onClick={() => setVisor(null)}>Fechar</Btn>
                  <Btn cor={C.lilas} style={{ flex: 1 }} onClick={() => apagarFoto(f.id)}>Apagar</Btn>
                </div>
              </div>
            </div>
          );
        })()}

        {toast && (
          <div className="zoe-surge" style={{ position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)', zIndex: 100, background: C.petroleo, color: '#fff', padding: '12px 20px', borderRadius: 14, fontSize: 13.5, fontWeight: 700, boxShadow: '0 8px 24px rgba(11,20,22,.28)', maxWidth: '90vw' }}>{toast}</div>
        )}

        <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 520, background: C.card, borderTop: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-around', height: 74, paddingBottom: 8, zIndex: 70 }}>
          {NAV.map(n => {
            if (n.id === 'fab') return (
              <button key="fab" onClick={() => setFab(true)} style={{ width: 54, height: 54, borderRadius: 99, border: 'none', background: C.petroleo, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: -20, boxShadow: '0 6px 18px rgba(7,91,89,.34)' }}><Plus size={26} /></button>
            );
            const on = aba === n.id, I = n.i;
            return (
              <button key={n.id} onClick={() => { setAba(n.id); setEtapaAberta(null); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, color: on ? C.greenDark : C.ink3, fontFamily: 'inherit', padding: '6px 4px' }}>
                <I size={20} />
                <span style={{ fontSize: 10, fontWeight: 700 }}>{n.n}</span>
              </button>
            );
          })}
        </div>

        {!['extras', 'diario', 'progresso', 'conquistas'].includes(aba) && !fab && (
          <button onClick={() => setMaisAberto(true)} style={{ position: 'fixed', bottom: 92, right: 16, width: 48, height: 48, borderRadius: 16, border: 'none', background: C.petroleo, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 5px 16px rgba(11,20,22,.26)', zIndex: 60 }}><Compass size={21} /></button>
        )}
      </div>
    </>
  );
}
