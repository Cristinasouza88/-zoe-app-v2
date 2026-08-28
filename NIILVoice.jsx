import React,{useEffect,useMemo,useRef,useState}from'react';
import{ArrowLeft,Mic,MicOff,Send,Volume2,Square,Keyboard}from'lucide-react';
import NIILOrb from'./NIILOrb.jsx';
import{conversarNIIL,iniciarReconhecimentoVoz,reconhecimentoDisponivel}from'./ia.jsx';
import'./NIILVoice.css';

const textoEstado={
  idle:['Como posso ajudar?','Fale ou escreva o que está passando pela sua cabeça.'],
  listening:['Ouvindo.','Pode falar no seu ritmo.'],
  thinking:['Pensando.','Estou organizando o que você trouxe.'],
  responding:['Respondendo.','Ouça a resposta da NIIL.'],
  done:['Entendi.','Podemos continuar daqui.']
};

const contextoDe=d=>({
  nome:d?.perfil?.nome||'',
  pontos:Number(d?.gamificacao?.pontos||0),
  nivel:Number(d?.gamificacao?.nivel||1),
  sequencia:Number(d?.gamificacao?.streakAtual||0),
  cursos:(d?.cursos||[]).slice(0,8).map(c=>({
    nome:c.nome,
    concluidas:(c.aulas||[]).filter(a=>a.feito).length,
    total:(c.aulas||[]).length
  })),
  objetivosFinanceiros:(d?.financeiro?.objetivos||[]).filter(o=>o.status!=='arquivado').slice(0,5).map(o=>({nome:o.nome||o.titulo||''})),
  observacaoPrivacidade:'Contexto resumido. Não inclui extratos, valores de transações ou fotos.'
});

export default function NIILVoice({aberto=false,fechar=()=>{},d={}}){
  const[estado,setEstado]=useState('idle');
  const[texto,setTexto]=useState('');
  const[resposta,setResposta]=useState('');
  const[erro,setErro]=useState('');
  const[historico,setHistorico]=useState([]);
  const[modoTexto,setModoTexto]=useState(false);
  const recRef=useRef(null);
  const inputRef=useRef(null);
  const vozDisponivel=useMemo(()=>reconhecimentoDisponivel(),[aberto]);

  const pararTudo=()=>{
    try{recRef.current?.stop?.()}catch{}
    recRef.current=null;
    try{window.speechSynthesis?.cancel?.()}catch{}
  };

  useEffect(()=>{
    if(!aberto){pararTudo();setEstado('idle');setErro('');}
    return()=>pararTudo();
  },[aberto]);

  useEffect(()=>{
    if(aberto&&modoTexto)setTimeout(()=>inputRef.current?.focus?.(),100);
  },[aberto,modoTexto]);

  if(!aberto)return null;

  const enviar=async mensagem=>{
    const msg=String(mensagem||'').trim();
    if(!msg)return;
    pararTudo();
    setTexto(msg);
    setErro('');
    setEstado('thinking');
    const proximoHistorico=[...historico,{role:'user',content:msg}].slice(-8);
    const r=await conversarNIIL({mensagem:msg,contexto:contextoDe(d),historico:proximoHistorico});
    if(!r.ok){
      setEstado('done');
      setErro(r.erro||'Não consegui responder agora.');
      return;
    }
    const resp=String(r.dados?.texto||'').trim();
    setResposta(resp);
    setHistorico([...proximoHistorico,{role:'assistant',content:resp}].slice(-8));
    setEstado('done');
  };

  const iniciarVoz=()=>{
    if(!vozDisponivel){setModoTexto(true);setErro('O reconhecimento de voz não está disponível neste navegador. Você pode escrever.');return;}
    pararTudo();
    setErro('');
    setResposta('');
    setTexto('');
    setEstado('listening');
    const rec=iniciarReconhecimentoVoz({
      onResultado:t=>{
        recRef.current=null;
        setTexto(t);
        enviar(t);
      },
      onErro:e=>{
        recRef.current=null;
        setEstado('idle');
        if(String(e)!=='aborted')setErro('Não consegui ouvir. Tente novamente ou escreva.');
      }
    });
    recRef.current=rec;
  };

  const pararVoz=()=>{
    try{recRef.current?.stop?.()}catch{}
    recRef.current=null;
    setEstado('idle');
  };

  const ouvirResposta=()=>{
    if(!resposta||!window.speechSynthesis)return;
    window.speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(resposta);
    u.lang='pt-BR';
    u.rate=.98;
    u.pitch=1;
    u.onstart=()=>setEstado('responding');
    u.onend=()=>setEstado('done');
    u.onerror=()=>setEstado('done');
    window.speechSynthesis.speak(u);
  };

  const pararResposta=()=>{
    window.speechSynthesis?.cancel?.();
    setEstado('done');
  };

  const [titulo,subtitulo]=textoEstado[estado]||textoEstado.idle;

  return <div className="niil-voice" role="dialog" aria-modal="true" aria-label="Conversar com a NIIL">
    <header className="niil-voice__head">
      <button onClick={fechar} className="niil-voice__back" aria-label="Fechar"><ArrowLeft size={22}/></button>
      <span className="niil-voice__chip">NIIL VOZ</span>
      <button onClick={()=>setModoTexto(v=>!v)} className="niil-voice__keyboard" aria-label={modoTexto?'Usar voz':'Escrever'}>
        {modoTexto?<Mic size={20}/>:<Keyboard size={20}/>}
      </button>
    </header>

    <main className="niil-voice__main">
      <div className="niil-voice__orb">
        <NIILOrb state={estado==='idle'?'idle':estado} size={244} label={titulo}/>
      </div>

      <div className="niil-voice__copy" aria-live="polite">
        <h1>{titulo}</h1>
        <p>{subtitulo}</p>
      </div>

      {texto&&estado!=='listening'&&<div className="niil-voice__transcript">
        <small>Você</small>
        <p>{texto}</p>
      </div>}

      {resposta&&<div className="niil-voice__answer">
        <small>NIIL</small>
        <p>{resposta}</p>
        <button onClick={estado==='responding'?pararResposta:ouvirResposta}>
          {estado==='responding'?<Square size={16}/>:<Volume2 size={17}/>}
          {estado==='responding'?'Parar':'Ouvir resposta'}
        </button>
      </div>}

      {erro&&<div className="niil-voice__error">{erro}</div>}

      {modoTexto?<form className="niil-voice__textbar" onSubmit={e=>{e.preventDefault();const v=e.currentTarget.elements.mensagem.value;enviar(v)}}>
        <input ref={inputRef} name="mensagem" placeholder="Escreva aqui…" autoComplete="off"/>
        <button type="submit" aria-label="Enviar"><Send size={19}/></button>
      </form>:<button
        className={`niil-voice__talk ${estado==='listening'?'is-listening':''}`}
        onClick={estado==='listening'?pararVoz:iniciarVoz}
        disabled={estado==='thinking'}
      >
        {estado==='listening'?<MicOff size={21}/>:<Mic size={21}/>}
        <span>{estado==='listening'?'Parar de ouvir':estado==='thinking'?'Processando…':'Toque para falar'}</span>
      </button>}

      <p className="niil-voice__privacy">O microfone só é ativado quando você toca para falar.</p>
    </main>
  </div>;
}
