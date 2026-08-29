import React,{useEffect,useMemo,useRef,useState}from'react';
import{
  ArrowLeft,Target,Moon,Home,Repeat2,Network,Flag,CalendarDays,TrendingUp,
  Lock,Check,ChevronRight,BookOpen,Wallet,Dumbbell,Droplets,Utensils,GraduationCap,
  Languages,Camera,Clock3,Mic,Square,Brain,Footprints,Sparkles,RotateCcw
}from'lucide-react';
import NIILOrb from'./NIILOrb.jsx';
import{RODA_SETORES}from'./conteudo.js';
import{TRILHA_NIIL,moduloParaAba,faseAtualNIIL,marcosConcluidosNIIL,recomendacoesContextuaisNIIL}from'./trilha.niil.data.js';
import{iniciarReconhecimentoVoz,reconhecimentoDisponivel}from'./ia.jsx';
import{registrarEventoGamificacao}from'./gamificacao.core.js';
import{store}from'./ui.jsx';
import'./TrilhaNIIL.css';

const ICONS={target:Target,moon:Moon,home:Home,repeat:Repeat2,network:Network,flag:Flag,calendar:CalendarDays,chart:TrendingUp};
const MOD_ICONS={Sono:Moon,Água:Droplets,Alimentação:Utensils,Movimento:Dumbbell,Leitura:BookOpen,Cursos:GraduationCap,Inglês:Languages,Finanças:Wallet,Ambiente:Home,'Minha Visão':Camera,Agenda:CalendarDays};
const RODA_GUIA={
  'Saúde':{dica:'Olhe para as últimas semanas, não para o seu melhor nem para o seu pior dia.',exemplos:['Sono','Energia','Exercício','Alimentação'],modulo:'sono'},
  'Família':{dica:'Pense em presença, convivência e na qualidade das trocas — não em uma família ideal.',exemplos:['Presença','Convivência','Apoio','Conflitos']},
  'Relacionamentos':{dica:'Considere conexão, comunicação, reciprocidade e limites nas relações que mais importam.',exemplos:['Conexão','Comunicação','Reciprocidade','Limites']},
  'Lazer':{dica:'Pergunte se existe espaço real para descanso, diversão e experiências que renovam você.',exemplos:['Tempo livre','Descanso','Diversão','Novas experiências'],modulo:'agenda'},
  'Espiritualidade':{dica:'Avalie sentido, conexão e práticas que ajudam você a se orientar internamente.',exemplos:['Sentido','Prática','Conexão','Paz']},
  'Carreira':{dica:'Pense em crescimento, reconhecimento, autonomia e no quanto o trabalho faz sentido hoje.',exemplos:['Crescimento','Reconhecimento','Autonomia','Direção'],modulo:'cursos'},
  'Finanças':{dica:'Considere organização, compromissos, segurança e liberdade de decisão — não só renda.',exemplos:['Dívidas','Reserva','Organização','Metas'],modulo:'financeiro'},
  'Crescimento pessoal':{dica:'Olhe para aquilo que você vem aprendendo e para mudanças que realmente viraram comportamento.',exemplos:['Hábitos','Autoconhecimento','Disciplina','Coragem'],modulo:'cursos'},
  'Social':{dica:'Pense na qualidade das amizades, pertencimento e trocas que existem de verdade na sua rotina.',exemplos:['Amizades','Pertencimento','Trocas','Isolamento']},
  'Emocional':{dica:'Observe como você tem lidado com pressão, oscilações e recuperação emocional no cotidiano.',exemplos:['Estabilidade','Pressão','Autocontrole','Descanso mental'],modulo:'diario'},
  'Intelectual':{dica:'Avalie curiosidade, estudo e quanto do que você consome está realmente se transformando em aprendizado.',exemplos:['Leitura','Cursos','Aprendizado','Curiosidade'],modulo:'cursos'},
  'Contribuição':{dica:'Pense em impacto, ajuda e participação em algo que vá além das suas necessidades imediatas.',exemplos:['Impacto','Ajuda','Generosidade','Participação']}
};
const RODA_MODULO=area=>RODA_GUIA[area]?.modulo||null;

const MOTIVACAO_PERFIS={
  'Saúde':{
    motivos:['Quero me sentir melhor','Estou cansada de adiar','Quero cuidar do meu corpo','Quero prevenir problemas','Quero voltar a me priorizar'],
    recompensas:['Gostar mais do meu corpo','Ter mais disposição','Me sentir confiante','Ter uma rotina mais saudável','Sentir que estou me cuidando'],
    modulos:['Nutrição','Treino']
  },
  'Energia':{
    motivos:['Acordo sem disposição','Minha energia cai no meio do dia','Meu sono não parece recuperar','Quero parar de viver no limite','Quero render sem me esgotar'],
    recompensas:['Acordar com disposição','Ter energia mais estável','Chegar ao fim do dia melhor','Conseguir treinar ou estudar','Sentir menos cansaço'],
    modulos:['Sono','Ritmo diário']
  },
  'Dinheiro':{
    motivos:['Quero parar de me preocupar tanto','Quero organizar o que entra e sai','Quero sair de dívidas','Quero construir segurança','Quero conseguir realizar um plano'],
    recompensas:['Ter tranquilidade com dinheiro','Ter uma reserva','Poder escolher com mais liberdade','Parar de apagar incêndios','Ver meu patrimônio crescer'],
    modulos:['Financeiro']
  },
  'Carreira':{
    motivos:['Quero crescer profissionalmente','Quero ser mais reconhecida','Estou cansada de me sentir parada','Quero mudar de trabalho','Quero ganhar mais autonomia'],
    recompensas:['Sentir orgulho do meu trabalho','Ter mais autonomia','Aumentar minha renda','Chegar a uma nova posição','Trabalhar com mais propósito'],
    modulos:['Cursos','Agenda']
  },
  'Aprendizado':{
    motivos:['Quero parar de só consumir conteúdo','Quero aprender algo que importa','Tenho um projeto que depende disso','Quero me sentir mais preparada','Quero transformar estudo em prática'],
    recompensas:['Dominar uma habilidade','Concluir um curso','Usar o que aprendi na vida real','Me sentir mais capaz','Abrir novas oportunidades'],
    modulos:['Cursos']
  },
  'Relacionamentos':{
    motivos:['Quero melhorar minhas relações','Quero me comunicar melhor','Quero me sentir mais próxima das pessoas','Quero colocar limites melhores','Quero construir relações mais recíprocas'],
    recompensas:['Ter relações mais leves','Me sentir compreendida','Criar mais conexão','Ter limites mais claros','Viver relações mais recíprocas'],
    modulos:['Trilha contextual']
  },
  'Organizar minha vida':{
    motivos:['Estou cansada de apagar incêndios','Quero parar de esquecer coisas','Minha rotina está me consumindo','Quero ter mais clareza','Quero sentir que estou no controle'],
    recompensas:['Ter uma semana mais leve','Saber o que fazer primeiro','Ter tempo para o que importa','Reduzir a sensação de caos','Conseguir cumprir o que planejo'],
    modulos:['Agenda']
  },
  'Outra coisa':{
    motivos:['Isso vem me incomodando há algum tempo','Quero parar de adiar','Quero provar para mim que consigo','Quero mudar como me sinto hoje','Quero construir uma versão diferente da minha vida'],
    recompensas:['Sentir progresso de verdade','Me sentir mais confiante','Ter mais liberdade de escolha','Parar de carregar isso','Ver uma mudança concreta'],
    modulos:['Trilha contextual']
  }
};
const perfilMotivacao=objetivo=>MOTIVACAO_PERFIS[objetivo]||MOTIVACAO_PERFIS['Outra coisa'];
const objetivoLegivel=objetivo=>objetivo==='Dinheiro'?'Finanças':objetivo||'isso';


const hoje=()=>new Date().toISOString().slice(0,10);
const vibrar=()=>{try{navigator.vibrate?.(18)}catch{}};
const som=(kind='tap',enabled=true)=>{
  if(!enabled)return;
  try{
    const A=window.AudioContext||window.webkitAudioContext;if(!A)return;
    const ctx=new A(),o=ctx.createOscillator(),g=ctx.createGain();
    o.connect(g);g.connect(ctx.destination);
    o.type='sine';o.frequency.value=kind==='marco'?660:kind==='snap'?520:420;
    g.gain.setValueAtTime(.0001,ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(kind==='marco'?.045:.025,ctx.currentTime+.008);
    g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+(kind==='marco'?.34:.11));
    o.start();o.stop(ctx.currentTime+(kind==='marco'?.36:.13));
    setTimeout(()=>ctx.close?.(),450);
  }catch{}
};
const feedback=(kind,d)=>{vibrar();som(kind,d?.preferencias?.sonsNIIL!==false)};
const Radar=({valores={}})=>{
  const n=RODA_SETORES.length,cx=150,cy=150,r=110;
  const pt=(i,v=10)=>{const a=-Math.PI/2+i*2*Math.PI/n,rr=r*(Number(v||0)/10);return[cx+Math.cos(a)*rr,cy+Math.sin(a)*rr]};
  const poly=RODA_SETORES.map((s,i)=>pt(i,valores[s]||0).join(',')).join(' ');
  return <svg viewBox="0 0 300 300" className="tn-radar" aria-label="Roda da Vida">
    {[2,4,6,8,10].map(v=><polygon key={v} points={RODA_SETORES.map((_,i)=>pt(i,v).join(',')).join(' ')} fill="none" stroke="#E7E7E2" strokeWidth="1"/>)}
    {RODA_SETORES.map((s,i)=>{const[a,b]=pt(i,10);return <line key={s} x1={cx} y1={cy} x2={a} y2={b} stroke="#ECECE7"/>})}
    <polygon points={poly} fill="rgba(183,242,12,.28)" stroke="#6C9700" strokeWidth="2.5"/>
    {RODA_SETORES.map((s,i)=>{const[a,b]=pt(i,10.9);return <text key={s} x={a} y={b} textAnchor={a<cx-8?'end':a>cx+8?'start':'middle'} dominantBaseline="middle" fontSize="8.2" fill="#625F67">{s}</text>})}
  </svg>
};

export default function TrilhaNIIL({d,up,setAba,aviso=()=>{},abrirTreino=null}){
  const[aberta,setAberta]=useState(null);
  const[marco,setMarco]=useState(null);
  const[rodaPasso,setRodaPasso]=useState(0);
  const[rodaAtivacao,setRodaAtivacao]=useState({area:null,etapa:'foco',razoes:[],metaNota:null});
  const recRef=useRef(null);
  const[vozCommit,setVozCommit]=useState({status:'idle',url:null,error:''});
  const mediaRecorderRef=useRef(null);
  const mediaStreamRef=useRef(null);
  const audioChunksRef=useRef([]);
  const audioTimerRef=useRef(null);
  const audioPlayerRef=useRef(null);
  const atual=useMemo(()=>faseAtualNIIL(d.etapas||{}),[d.etapas]);
  const marcos=useMemo(()=>marcosConcluidosNIIL(d.etapas||{}),[d.etapas]);
  const recomendacoes=useMemo(()=>recomendacoesContextuaisNIIL(d),[d]);
  const temporadas=d.trilhaNIIL?.temporadas||[];
  const temporadaAtual=temporadas.find(t=>t.id===d.trilhaNIIL?.temporadaAtualId)||null;
  const temporadasConcluidas=temporadas.filter(t=>t.status==='concluida');
  const passo=TRILHA_NIIL.flatMap(f=>f.etapas.map(e=>({...e,fase:f}))).find(e=>e.id===aberta);
  const resp=d.trilhaNIIL?.respostas||{};
  const snapshotValido=(x,e=passo)=>x?.versao===(e?.versaoFerramenta||3)&&RODA_SETORES.every(s=>Number.isFinite(Number(x?.valores?.[s]))&&Number(x?.valores?.[s])>=0&&Number(x?.valores?.[s])<=10);
  const snapshotRoda=passo?.tipo==='roda'?(d.trilhaNIIL?.rodaSnapshots||[]).find(x=>x.etapaId===passo.id&&snapshotValido(x,passo)):null;
  const rascunhoRoda=passo?.tipo==='roda'?(d.trilhaNIIL?.rodaRascunhos?.[passo.rodaId]||{}):{};

  useEffect(()=>{
    if(passo?.tipo!=='roda')return;
    if(snapshotRoda){setRodaAtivacao({area:null,etapa:'foco',razoes:[],metaNota:null});return;}
    const i=RODA_SETORES.findIndex(s=>rascunhoRoda?.[s]?.nota===undefined);
    setRodaPasso(i<0?0:i);
    setRodaAtivacao({area:null,etapa:'foco',razoes:[],metaNota:null});
  },[passo?.id,snapshotRoda?.id]);

  useEffect(()=>{
    let cancelado=false;
    const meta=d.trilhaNIIL?.vozCompromisso;
    const objetivo=resp['meta-inicial'];
    if(passo?.interacao!=='sentence-choice'||!meta?.storageKey||meta?.objetivo!==objetivo||meta?.pulado){
      setVozCommit(prev=>{
        if(prev.url)try{URL.revokeObjectURL(prev.url)}catch{}
        return{status:'idle',url:null,error:''};
      });
      return;
    }
    setVozCommit(prev=>({...prev,status:'loading',error:''}));
    store.get(meta.storageKey).then(blob=>{
      if(cancelado)return;
      if(blob instanceof Blob&&blob.size>0){
        const url=URL.createObjectURL(blob);
        setVozCommit(prev=>{
          if(prev.url)try{URL.revokeObjectURL(prev.url)}catch{}
          return{status:'ready',url,error:''};
        });
      }else{
        setVozCommit({status:'idle',url:null,error:''});
      }
    }).catch(()=>!cancelado&&setVozCommit({status:'idle',url:null,error:''}));
    return()=>{cancelado=true};
  },[passo?.id,resp['meta-inicial'],d.trilhaNIIL?.vozCompromisso?.storageKey]);


  const salvar=(chave,valor)=>up(s=>({...s,trilhaNIIL:{...(s.trilhaNIIL||{}),respostas:{...(s.trilhaNIIL?.respostas||{}),[chave]:valor}}}));
  const ler=chave=>resp[chave];
  const feito=id=>!!d.etapas?.[id]?.feito;
  const sequencia=TRILHA_NIIL.flatMap(f=>f.etapas);
  const primeiroPendente=sequencia.findIndex(e=>!feito(e.id));
  const liberado=id=>{const i=sequencia.findIndex(e=>e.id===id);return i<=Math.max(0,primeiroPendente<0?sequencia.length-1:primeiroPendente)};

  const abrirModulo=modulo=>{
    up(s=>({...s,trilhaNIIL:{...(s.trilhaNIIL||{}),modulosVisitados:{...(s.trilhaNIIL?.modulosVisitados||{}),[modulo]:true}}}));
    feedback('snap',d);
    if(modulo==='treino'&&typeof abrirTreino==='function'){
      abrirTreino({origem:'trilha-niil',titulo:'Treino'});
      return;
    }
    const aba=moduloParaAba[modulo];
    if(!aba)return;
    setAba(aba);
  };

  const iniciarNovaTemporada=()=>{
    const ids=new Set(TRILHA_NIIL.flatMap(f=>f.etapas.map(e=>e.id)));
    up(s=>{
      const trilha=s.trilhaNIIL||{};
      const etapas=Object.fromEntries(Object.entries(s.etapas||{}).filter(([id])=>!ids.has(id)));
      return{...s,etapas,trilhaNIIL:{...trilha,respostas:{},motivacaoBase:null,vozCompromisso:null,temporadaAtualId:null,rodaRascunhos:{},focoAtual:null,handoff:null}};
    });
    setAberta(null);
    feedback('marco',d);
    window.scrollTo({top:0,behavior:'smooth'});
  };

  const valido=e=>{
    const v=ler(e.chave);
    if(e.tipo==='roda')return !!(d.trilhaNIIL?.rodaSnapshots||[]).find(x=>x.etapaId===e.id&&snapshotValido(x,e));
    if(e.interacao==='sentence-choice'){
      const voz=d.trilhaNIIL?.vozCompromisso;
      return !!v&&voz?.objetivo===v&&(!!voz?.storageKey||voz?.pulado===true);
    }
    if(e.interacao==='multi'||e.interacao==='modules'||e.interacao==='swipe')return Array.isArray(v)&&v.length>0;
    if(e.interacao==='energy')return true;
    if(e.interacao==='sleep')return true;
    if(e.interacao==='dual-scale')return true;
    if(e.interacao==='chain')return v?.sinal&&v?.acao&&v?.resultado;
    if(e.interacao==='tradeoff')return v?.agora&&v?.depois;
    if(e.interacao==='anchor')return v?.ancora&&v?.acao;
    if(e.interacao==='minimum')return !!v;
    if(e.interacao==='budget')return true;
    if(e.interacao==='agenda')return !!d.jornada?.planoSemana?.ativo||!!v;
    if(e.interacao==='photo'||e.interacao==='insight')return true;
    if(e.interacao==='voice')return String(v||'').trim().length>2;
    return v!==undefined&&v!==null&&String(v).length>0;
  };

  const concluir=(e,opts={})=>{
    if(!opts.ignorarValidacao&&!valido(e)){aviso('Faça a interação rápida antes de continuar.');return;}
    const ja=feito(e.id);
    const idx=e.fase.etapas.findIndex(x=>x.id===e.id);
    const ultima=idx===e.fase.etapas.length-1;
    if(!ja)up(s=>{
      let estado=s;
      if(e.interacao==='energy'){
        const v=s.trilhaNIIL?.respostas?.[e.chave]||{};
        estado={...s,trilhaNIIL:{...(s.trilhaNIIL||{}),respostas:{...(s.trilhaNIIL?.respostas||{}),[e.chave]:{acordar:v.acordar??5,manha:v.manha??5,tarde:v.tarde??5,noite:v.noite??5}}}};
      }
      if(e.interacao==='sleep'){
        const v=estado.trilhaNIIL?.respostas?.[e.chave]||{};
        estado={...estado,trilhaNIIL:{...(estado.trilhaNIIL||{}),respostas:{...(estado.trilhaNIIL?.respostas||{}),[e.chave]:{dormir:v.dormir||'23:00',acordar:v.acordar||'07:00'}}}};
      }
      if(e.interacao==='dual-scale'){
        const v=estado.trilhaNIIL?.respostas?.[e.chave]||{};
        estado={...estado,trilhaNIIL:{...(estado.trilhaNIIL||{}),respostas:{...(estado.trilhaNIIL?.respostas||{}),[e.chave]:{querer:v.querer??5,fazer:v.fazer??5}}}};
      }
      if(e.interacao==='budget'){
        const v=estado.trilhaNIIL?.respostas?.[e.chave]||{};
        estado={...estado,trilhaNIIL:{...(estado.trilhaNIIL||{}),respostas:{...(estado.trilhaNIIL?.respostas||{}),[e.chave]:{tempo:v.tempo??5,dinheiro:v.dinheiro??5,atencao:v.atencao??5}}}};
      }
      const base={...estado,etapas:{...(estado.etapas||{}),[e.id]:{feito:true,data:hoje(),concluidaEm:new Date().toISOString()}}};
      let next=registrarEventoGamificacao(base,{
        key:`trilha:v3:${estado.trilhaNIIL?.temporadaAtualId||'sem-temporada'}:${e.id}`,
        tipo:e.tipo==='roda'?'trail.tool.completed':'trail.microstep.completed',
        pontos:Number(e.pontos)||10,
        titulo:e.titulo,
        area:'trilha',
        data:hoje(),
        trilhaId:'niil-central-v2',
        origemId:e.id,
        contexto:{marco:e.fase?.id||null}
      });
      if(ultima)next=registrarEventoGamificacao(next,{
        key:`trilha:v3:${next.trilhaNIIL?.temporadaAtualId||estado.trilhaNIIL?.temporadaAtualId||'sem-temporada'}:marco:${e.fase.id}`,
        tipo:'trail.phase.completed',
        pontos:50,
        titulo:`Marco concluído · ${e.fase.nome}`,
        area:'trilha',
        data:hoje(),
        trilhaId:'niil-central-v2',
        origemId:e.fase.id
      });
      if(e.id==='m9-proximo'){
        const trilha=next.trilhaNIIL||{},temporadas=Array.isArray(trilha.temporadas)?trilha.temporadas:[],tid=trilha.temporadaAtualId,agora=new Date().toISOString();
        const concluidas=Object.keys(next.etapas||{}).filter(id=>next.etapas?.[id]?.feito);
        next={...next,trilhaNIIL:{...trilha,temporadas:temporadas.map(t=>{
          if(t.id!==tid)return t;
          const inicio=Date.parse(t.iniciadaEm||agora),fim=Date.parse(agora);
          return{...t,status:'concluida',encerradaEm:agora,duracaoDias:Math.max(0,Math.round((fim-inicio)/86400000)),etapasConcluidas:concluidas,motivacaoBase:trilha.motivacaoBase||t.motivacaoBase||null};
        })}};
      }
      return next;
    });
    if(!opts.semFeedback)feedback('snap',d);
    if(ultima&&!ja){
      setMarco(e.fase);
      feedback('marco',d);
      setAberta(null);
      return;
    }
    const prox=e.fase.etapas[idx+1];
    setAberta(prox?.id||null);
  };

  const encerrarStreamAudio=()=>{
    if(audioTimerRef.current){clearTimeout(audioTimerRef.current);audioTimerRef.current=null;}
    try{mediaStreamRef.current?.getTracks?.().forEach(t=>t.stop())}catch{}
    mediaStreamRef.current=null;
  };

  const pararGravacao=()=>{
    try{
      if(mediaRecorderRef.current&&mediaRecorderRef.current.state!=='inactive')mediaRecorderRef.current.stop();
    }catch{}
  };

  const selecionarObjetivoFrase=(e,item)=>{
    if(mediaRecorderRef.current?.state==='recording')pararGravacao();
    const anterior=d.trilhaNIIL?.vozCompromisso;
    if(anterior?.objetivo&&anterior.objetivo!==item.valor&&anterior.storageKey)store.set(anterior.storageKey,null).catch(()=>{});
    setVozCommit(prev=>{
      if(prev.url)try{URL.revokeObjectURL(prev.url)}catch{}
      return{status:'idle',url:null,error:''};
    });
    up(s=>({
      ...s,
      trilhaNIIL:{
        ...(s.trilhaNIIL||{}),
        respostas:{...(s.trilhaNIIL?.respostas||{}),[e.chave]:item.valor},
        vozCompromisso:s.trilhaNIIL?.vozCompromisso?.objetivo===item.valor?s.trilhaNIIL.vozCompromisso:null
      }
    }));
    feedback('tap',d);
  };

  const iniciarGravacaoCompromisso=async(e,frase,objetivo)=>{
    if(!objetivo)return;
    if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==='undefined'){
      setVozCommit({status:'error',url:null,error:'Este dispositivo não disponibilizou gravação de áudio.'});
      return;
    }
    try{
      const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true},video:false});
      mediaStreamRef.current=stream;
      const ua=String(navigator.userAgent||'');
      const ios=/iP(hone|ad|od)/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
      const candidatos=ios?[]:['audio/webm;codecs=opus','audio/webm','audio/ogg;codecs=opus','audio/mp4'];
      const mime=candidatos.find(t=>MediaRecorder.isTypeSupported?.(t));
      // No iPhone/iPad deixamos o Safari escolher o contêiner nativo.
      // Forçar audio/mp4 + chunks temporizados pode gerar um arquivo com duração,
      // mas que não inicia a reprodução em alguns WebKit.
      const recorder=ios?new MediaRecorder(stream):new MediaRecorder(stream,mime?{mimeType:mime}:undefined);
      mediaRecorderRef.current=recorder;
      audioChunksRef.current=[];
      recorder.ondataavailable=ev=>{if(ev.data?.size)audioChunksRef.current.push(ev.data)};
      recorder.onerror=()=>{
        encerrarStreamAudio();
        setVozCommit({status:'error',url:null,error:'Não foi possível concluir a gravação. Tente novamente.'});
      };
      recorder.onstop=async()=>{
        encerrarStreamAudio();
        const partes=audioChunksRef.current.filter(x=>x?.size);
        const tipo=partes.find(x=>x.type)?.type||recorder.mimeType||mime||(ios?'audio/mp4':'audio/webm');
        // Em iOS, preservar o Blob final original evita reempacotar MP4 e perder
        // metadados necessários ao player do Safari.
        const blob=partes.length===1?partes[0]:new Blob(partes,{type:tipo});
        if(blob.size<700){
          setVozCommit({status:'error',url:null,error:'A gravação ficou curta demais. Tente falar a frase novamente.'});
          return;
        }
        const existente=d.trilhaNIIL?.vozCompromisso;
        const usuario=String(d.perfil?.email||'local').trim().toLowerCase().replace(/[^a-z0-9@._-]+/g,'-');
        const storageKey=existente?.objetivo===objetivo&&existente?.storageKey?existente.storageKey:`niil:voz-compromisso:${usuario}:${Date.now()}`;
        try{
          await store.set(storageKey,blob);
          const url=URL.createObjectURL(blob);
          setVozCommit(prev=>{
            if(prev.url)try{URL.revokeObjectURL(prev.url)}catch{}
            return{status:'ready',url,error:''};
          });
          up(s=>({...s,trilhaNIIL:{...(s.trilhaNIIL||{}),vozCompromisso:{objetivo,frase,storageKey,mimeType:blob.type,gravadaEm:new Date().toISOString(),localOnly:true,pulado:false}}}));
          feedback('snap',d);
        }catch{
          setVozCommit({status:'error',url:null,error:'Não consegui salvar o áudio neste dispositivo.'});
        }
      };
      // Safari/iOS: gerar um único Blob final é mais confiável para replay.
      // Outros navegadores continuam podendo emitir chunks durante a gravação.
      if(ios)recorder.start(); else recorder.start(250);
      setVozCommit(prev=>({status:'recording',url:prev.url||null,error:''}));
      feedback('tap',d);
      audioTimerRef.current=setTimeout(()=>pararGravacao(),12000);
    }catch(err){
      encerrarStreamAudio();
      const negado=err?.name==='NotAllowedError'||err?.name==='SecurityError';
      setVozCommit({status:'error',url:null,error:negado?'O acesso ao microfone foi recusado.':'Não foi possível acessar o microfone.'});
    }
  };

  const seguirSemGravar=(objetivo,frase)=>{
    up(s=>({...s,trilhaNIIL:{...(s.trilhaNIIL||{}),vozCompromisso:{objetivo,frase,storageKey:null,gravadaEm:null,localOnly:true,pulado:true,motivo:'microfone-indisponivel'}}}));
    setVozCommit({status:'skipped',url:null,error:''});
  };

  const concluirRapido=(e,valor)=>{
    salvar(e.chave,valor);
    feedback('snap',d);
    window.setTimeout(()=>concluir(e,{ignorarValidacao:true,semFeedback:true}),260);
  };

  const concluirMotivacaoRapido=(e,valor,campo)=>{
    up(s=>{
      const trilha=s.trilhaNIIL||{},respostas=trilha.respostas||{};
      const objetivo=respostas['meta-inicial']||d.trilhaNIIL?.respostas?.['meta-inicial']||'Outra coisa';
      const importancia=Number(respostas['meta-importancia']??d.trilhaNIIL?.respostas?.['meta-importancia']??5);
      const atual=trilha.motivacaoBase||{};
      return{...s,trilhaNIIL:{...trilha,respostas:{...respostas,[e.chave]:valor},motivacaoBase:{...atual,objetivo,importancia,[campo]:valor,atualizadaEm:new Date().toISOString()}}};
    });
    feedback('snap',d);
    window.setTimeout(()=>concluir(e,{ignorarValidacao:true,semFeedback:true}),280);
  };

  const confirmarMotivacaoBase=e=>{
    up(s=>{
      const trilha=s.trilhaNIIL||{},respostas=trilha.respostas||{},objetivo=respostas['meta-inicial']||'Outra coisa';
      const perfil=perfilMotivacao(objetivo);
      const agora=new Date().toISOString();
      const base={objetivo,importancia:Number(respostas['meta-importancia']??5),motivo:respostas['meta-motivo']||null,recompensa:respostas['meta-recompensa']||null,modulosPrioritarios:perfil.modulos,confirmadaEm:agora,versao:1};
      const temporadas=Array.isArray(trilha.temporadas)?trilha.temporadas:[];
      const ativa=temporadas.find(t=>t.id===trilha.temporadaAtualId&&t.status==='ativa');
      const id=ativa?.id||('temporada-'+Date.now());
      const vozCompromisso=trilha.vozCompromisso||null;
      const temporada=ativa?{...ativa,objetivo,motivacaoBase:base,vozCompromisso}:{id,numero:temporadas.length+1,status:'ativa',iniciadaEm:agora,objetivo,motivacaoBase:base,vozCompromisso,rodaInicialSnapshotId:null,rodaFinalSnapshotId:null};
      const novas=ativa?temporadas.map(t=>t.id===id?temporada:t):[...temporadas,temporada];
      return{...s,trilhaNIIL:{...trilha,respostas:{...respostas,[e.chave]:'sim'},motivacaoBase:base,temporadas:novas,temporadaAtualId:id}};
    });
    concluir(e,{ignorarValidacao:true});
  };

  const toggleMulti=(e,item)=>{
    const atual=Array.isArray(ler(e.chave))?ler(e.chave):[];
    let n=atual.includes(item)?atual.filter(x=>x!==item):[...atual,item];
    if(e.limite&&n.length>e.limite)n=n.slice(-e.limite);
    salvar(e.chave,n);feedback('tap',d);
  };

  const criarAgenda=()=>{
    const a=ler('ancora-acao')||{};
    const min=ler('acao-minima')||'';
    const acao=a.acao||min||'Minha ação NIIL';
    up(s=>({...s,jornada:{...(s.jornada||{}),planoSemana:{ativo:true,acao,contexto:a.ancora||'Contexto escolhido',hora:'19:00',duracao:15,dias:['Seg','Qua','Sex'],origem:'trilha-niil'}}}));
    salvar('agenda-primeira',{ativo:true,acao});
    feedback('snap',d);aviso('Ação conectada à sua agenda.');
  };

  const iniciarVoz=e=>{
    if(!reconhecimentoDisponivel()){aviso('A voz não está disponível neste navegador.');return;}
    try{recRef.current?.stop?.()}catch{}
    recRef.current=iniciarReconhecimentoVoz({
      onResultado:t=>{salvar(e.chave,t);feedback('snap',d);},
      onErro:()=>aviso('Não consegui ouvir. Você pode escrever.')
    });
  };

  const salvarRodaNota=(e,setor,nota)=>up(s=>{
    const atual=s.trilhaNIIL||{},rascunhos=atual.rodaRascunhos||{},roda=rascunhos[e.rodaId]||{};
    return{...s,trilhaNIIL:{...atual,rodaRascunhos:{...rascunhos,[e.rodaId]:{...roda,[setor]:{nota}}}}};
  });

  const responderRoda=(e,setor,nota)=>{
    if(rascunhoRoda?.[setor]?.nota!==undefined)return;
    salvarRodaNota(e,setor,nota);
    feedback('snap',d);
    if(rodaPasso<RODA_SETORES.length-1){
      window.setTimeout(()=>{
        setRodaPasso(x=>Math.min(RODA_SETORES.length-1,x+1));
        window.scrollTo({top:0,behavior:'smooth'});
      },300);
      return;
    }
    const respostas={...rascunhoRoda,[setor]:{nota}};
    const valores={};RODA_SETORES.forEach(s=>valores[s]=Number(respostas[s]?.nota));
    const snap={id:'roda-'+e.rodaId+'-'+Date.now(),versao:e.versaoFerramenta||3,papel:e.papel||'registro',rodaId:e.rodaId,etapaId:e.id,concluidaEm:new Date().toISOString(),data:hoje(),valores};
    window.setTimeout(()=>{
      up(s=>{
        const trilha=s.trilhaNIIL||{},temporadas=Array.isArray(trilha.temporadas)?trilha.temporadas:[],tid=trilha.temporadaAtualId;
        const temporadasAtualizadas=temporadas.map(t=>{
          if(t.id!==tid)return t;
          if(e.papel==='abertura')return{...t,rodaInicialSnapshotId:snap.id,rodaInicialEm:snap.concluidaEm};
          if(e.papel==='fechamento'){
            const inicio=Date.parse(t.iniciadaEm||snap.concluidaEm),fim=Date.parse(snap.concluidaEm);
            return{...t,rodaFinalSnapshotId:snap.id,rodaFinalEm:snap.concluidaEm,status:'em_fechamento',duracaoDias:Math.max(0,Math.round((fim-inicio)/86400000))};
          }
          return t;
        });
        return{...s,rodas:{...(s.rodas||{}),[e.rodaId]:valores},trilhaNIIL:{...trilha,rodaSnapshots:[...(trilha.rodaSnapshots||[]),snap],temporadas:temporadasAtualizadas}};
      });
      feedback('marco',d);
    },300);
  };

  const escolherFocoRoda=(area)=>{
    setRodaAtivacao({area,etapa:'razao',razoes:[],metaNota:null});
    window.scrollTo({top:0,behavior:'smooth'});
  };

  const escolherRazaoRoda=(razao)=>{
    setRodaAtivacao(a=>({...a,razoes:[razao],etapa:'meta'}));
    feedback('snap',d);
    window.setTimeout(()=>window.scrollTo({top:0,behavior:'smooth'}),220);
  };

  const escolherMetaRoda=(nota)=>{
    setRodaAtivacao(a=>({...a,metaNota:nota,etapa:'confirmar'}));
    feedback('snap',d);
    window.setTimeout(()=>window.scrollTo({top:0,behavior:'smooth'}),220);
  };

  const ativarFocoRoda=(e,snapshot)=>{
    const area=rodaAtivacao.area;
    if(!area)return;
    const modulo=RODA_MODULO(area),nota=Number(snapshot?.valores?.[area]||0),notaDesejada=Number(rodaAtivacao.metaNota||nota);
    const areaSlug=area.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-');
    const meta={id:'meta-roda-'+snapshot.id+'-'+areaSlug,titulo:'Evoluir '+area,area,notaInicial:nota,notaDesejada,motivos:rodaAtivacao.razoes,snapshotId:snapshot.id,origem:'roda-da-vida',status:'ativa',criadaEm:new Date().toISOString()};
    up(s=>{
      const atual=s.trilhaNIIL||{},metas=Array.isArray(atual.metas)?atual.metas:[],trilhas=atual.trilhasContextuais||{};
      return{...s,trilhaNIIL:{...atual,focoAtual:meta,metas:metas.some(x=>x.id===meta.id)?metas:[...metas,meta],trilhasContextuais:{...trilhas,[area]:{area,origem:'roda-da-vida',snapshotId:snapshot.id,notaInicial:nota,notaDesejada,motivos:rodaAtivacao.razoes,status:modulo?'conectada':'sugerida',modulo}},handoff:{id:'handoff-'+Date.now(),area,modulo,snapshotId:snapshot.id,notaInicial:nota,notaDesejada,consumido:false}}};
    });
    feedback('marco',d);
    concluir(e,{ignorarValidacao:true,semFeedback:true});
    window.setTimeout(()=>{
      setAberta(null);
      if(modulo)setAba(modulo);
    },260);
  };

  const Interacao=({e})=>{
    const v=ler(e.chave);
    if(e.tipo==='roda'){
      const snap=(d.trilhaNIIL?.rodaSnapshots||[]).find(x=>x.etapaId===e.id&&snapshotValido(x,e));
      if(snap){
        const ordenadas=[...RODA_SETORES].sort((a,b)=>Number(snap.valores[a])-Number(snap.valores[b]));
        const dataFmt=new Date(snap.concluidaEm).toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'});
        const area=rodaAtivacao.area;
        const notaAtual=area?Number(snap.valores[area]):null;
        const guia=area?(RODA_GUIA[area]||{exemplos:[]}):null;
        const temporadaAtiva=(d.trilhaNIIL?.temporadas||[]).find(t=>t.id===d.trilhaNIIL?.temporadaAtualId)||null;
        const snapInicialId=temporadaAtiva?.rodaInicialSnapshotId;
        const snapInicial=(d.trilhaNIIL?.rodaSnapshots||[]).find(x=>x.id===snapInicialId)||null;
        const comparacao=e.papel==='fechamento'&&snapInicial?RODA_SETORES.map(s=>({setor:s,antes:Number(snapInicial.valores?.[s]||0),agora:Number(snap.valores?.[s]||0),delta:Number(snap.valores?.[s]||0)-Number(snapInicial.valores?.[s]||0)})):[];
        if(rodaAtivacao.etapa==='razao'&&area){
          return <div className="tn-roda-activate">
            <span className="tn-roda-activate-kicker">{area} · {notaAtual}/10</span>
            <h2>O que mais puxou essa nota?</h2>
            <p>Escolha o ponto que mais explica sua percepção agora.</p>
            <div className="tn-roda-activate-options">{[...(guia?.exemplos||[]),'Outro'].map(x=><button key={x} onClick={()=>escolherRazaoRoda(x)}>{x}<ChevronRight size={18}/></button>)}</div>
            <button className="tn-roda-text-back" onClick={()=>setRodaAtivacao({area:null,etapa:'foco',razoes:[],metaNota:null})}>Voltar ao retrato</button>
          </div>;
        }
        if(rodaAtivacao.etapa==='meta'&&area){
          const metas=Array.from({length:11},(_,i)=>i).filter(n=>n>notaAtual);
          const opcoes=metas.length?metas:[10];
          return <div className="tn-roda-activate">
            <span className="tn-roda-activate-kicker">{area} · hoje {notaAtual}/10</span>
            <h2>Onde você gostaria que isso estivesse?</h2>
            <p>Escolha um próximo patamar. Não precisa ser perfeito.</p>
            <div className="tn-roda-targets">{opcoes.map(n=><button key={n} onClick={()=>escolherMetaRoda(n)}>{n}</button>)}</div>
            <button className="tn-roda-text-back" onClick={()=>setRodaAtivacao(a=>({...a,etapa:'razao'}))}>Voltar</button>
          </div>;
        }
        if(rodaAtivacao.etapa==='confirmar'&&area){
          const modulo=RODA_MODULO(area);
          const destino=modulo?(modulo==='financeiro'?'Financeiro':modulo==='sono'?'Sono':modulo==='cursos'?'Cursos':modulo==='agenda'?'Agenda':'Diário'):'uma trilha contextual';
          return <div className="tn-roda-activate tn-roda-confirm">
            <span className="tn-roda-activate-kicker">FOCO ESCOLHIDO</span>
            <h2>Quer transformar {area} em um foco agora?</h2>
            <div className="tn-roda-goal-shift"><span>{notaAtual}</span><ChevronRight size={22}/><b>{rodaAtivacao.metaNota}</b></div>
            <p>O NIIL vai guardar este retrato como ponto de partida e conectar o foco a {destino}.</p>
            <button className="tn-roda-create-goal" onClick={()=>ativarFocoRoda(e,snap)}>Sim, criar meta</button>
            <button className="tn-roda-text-back" onClick={()=>setRodaAtivacao(a=>({...a,etapa:'meta'}))}>Voltar</button>
          </div>;
        }
        if(e.papel==='fechamento'){
          const maiores=[...comparacao].sort((a,b)=>Math.abs(b.delta)-Math.abs(a.delta)).slice(0,3);
          const inicioFmt=snapInicial?new Date(snapInicial.concluidaEm).toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'}):null;
          return <div className="tn-roda-result tn-roda-reveal tn-roda-compare">
            <div className="tn-roda-result-head"><span>FECHAMENTO DA TEMPORADA</span><b>{dataFmt}</b></div>
            <h2>O mesmo retrato. Outro momento.</h2>
            <p className="tn-roda-reveal-copy">{inicioFmt?('Compare com a Roda feita em '+inicioFmt+'. Não existe nota certa: a mudança é o dado.'):'Este retrato fica salvo para ser comparado com os próximos ciclos.'}</p>
            <Radar valores={snap.valores}/>
            {comparacao.length>0&&<>
              <div className="tn-insight-callout">
                <span>INSIGHT NIIL</span>
                <h3>As maiores mudanças desta temporada apareceram aqui.</h3>
                <p>Isso mostra diferença entre duas percepções no tempo. Não prova causa nem diz sozinho o que gerou a mudança.</p>
              </div>
              <div className="tn-roda-delta-list">{maiores.map(x=><div key={x.setor}><b>{x.setor}</b><span>{x.antes} → {x.agora}</span><strong className={x.delta>0?'up':x.delta<0?'down':'same'}>{x.delta>0?'+':''}{x.delta}</strong></div>)}</div>
              <details className="tn-roda-compare-all"><summary>Ver todas as áreas</summary><div>{comparacao.map(x=><div key={x.setor}><span>{x.setor}</span><b>{x.antes} → {x.agora}</b><em>{x.delta>0?'+':''}{x.delta}</em></div>)}</div></details>
            </>}
            <button className="tn-roda-finish-compare" onClick={()=>concluir(e,{ignorarValidacao:true})}>Continuar a leitura da temporada <ChevronRight size={18}/></button>
            <div className="tn-roda-locked-note"><Lock size={14}/><span>Os dois retratos ficam preservados no histórico da temporada.</span></div>
          </div>;
        }

        return <div className="tn-roda-result tn-roda-reveal">
          <div className="tn-roda-result-head"><span>SEU RETRATO</span><b>{dataFmt}</b></div>
          <h2>Agora dá para ver o todo.</h2>
          <p className="tn-roda-reveal-copy">Este é o seu ponto de partida de hoje. Ele fica fechado para você comparar com uma próxima Roda no futuro.</p>
          <Radar valores={snap.valores}/>
          <div className="tn-roda-score-grid">{RODA_SETORES.map(s=><div key={s}><span>{s}</span><b>{snap.valores[s]}/10</b></div>)}</div>
          <div className="tn-roda-focus">
            <span>INSIGHT NIIL</span>
            <h3>Três áreas aparecem com as menores notas agora.</h3><h4>Qual merece entrar primeiro no seu sistema?</h4>
            <p>Começamos pelas menores notas, mas você decide o foco.</p>
            <div className="tn-roda-focus-list">{ordenadas.slice(0,3).map(areaItem=>{
              const mod=RODA_MODULO(areaItem);
              const destino=mod?(mod==='financeiro'?'Financeiro':mod==='sono'?'Sono':mod==='cursos'?'Cursos':mod==='agenda'?'Agenda':'Diário'):'trilha contextual';
              return <button key={areaItem} onClick={()=>escolherFocoRoda(areaItem)}>
                <div><b>{areaItem}</b><small>{snap.valores[areaItem]}/10 · {mod?'conectar a '+destino:'criar '+destino}</small></div>
                <ChevronRight size={18}/>
              </button>;
            })}</div>
            <details className="tn-roda-all"><summary>Escolher outra área</summary><div>{ordenadas.slice(3).map(areaItem=><button key={areaItem} onClick={()=>escolherFocoRoda(areaItem)}><span>{areaItem}</span><b>{snap.valores[areaItem]}/10</b></button>)}</div></details>
          </div>
          <div className="tn-roda-locked-note"><Lock size={14}/><span>Retrato fechado em {dataFmt}. Uma nova avaliação criará outro registro para comparação.</span></div>
        </div>;
      }

      const setor=RODA_SETORES[rodaPasso];
      const nota=rascunhoRoda?.[setor]?.nota;
      const respondidas=RODA_SETORES.filter(s=>rascunhoRoda?.[s]?.nota!==undefined).length;
      return <div className="tn-roda-scan">
        <div className="tn-roda-scan-top">
          <div className="tn-roda-scan-orbit" aria-hidden="true">
            {RODA_SETORES.map((_,i)=><i key={i} className={i<respondidas?'on':''} style={{transform:'rotate('+(i*30)+'deg) translateY(-25px)'}}/>)}
            <b>{respondidas}</b>
          </div>
          <span>{rodaPasso+1} de {RODA_SETORES.length}</span>
        </div>
        <div className="tn-roda-scan-question">
          <small>DE 0 A 10, QUE NOTA VOCÊ DÁ PARA</small>
          <h1>{setor}</h1>
          <p>na sua vida hoje?</p>
        </div>
        <div className="tn-roda-scan-notes">{Array.from({length:11},(_,i)=>i).map(n=><button key={n} className={Number(nota)===n?'on':''} onClick={()=>responderRoda(e,setor,n)}>{n}</button>)}</div>
        <div className="tn-roda-scan-hint">{RODA_GUIA[setor]?.dica||'Pense na sua realidade das últimas semanas.'}</div>
        <small className="tn-roda-scan-auto">Toque em uma nota. O próximo item abre sozinho.</small>
      </div>;
    }
    if(e.interacao==='sentence-choice'){
      const escolhida=(e.opcoesFrase||[]).find(x=>x.valor===v);
      const textoEscolhido=escolhida?.texto||'';
      const frase=textoEscolhido?(e.fraseInicio+' '+textoEscolhido+' '+e.fraseFim):(e.fraseInicio+' ... '+e.fraseFim);
      const vozMeta=d.trilhaNIIL?.vozCompromisso;
      const gravacaoValida=vozMeta?.objetivo===v&&!!vozMeta?.storageKey&&vozCommit.status==='ready'&&!!vozCommit.url;
      const pulou=vozMeta?.objetivo===v&&vozMeta?.pulado===true;
      return <div className="tn-sentence-exercise">
        <div className="tn-sentence-label">COMPLETE A FRASE</div>
        <h1>Eu mudaria <span>{textoEscolhido||'________'}</span> primeiro.</h1>

        <div className="tn-sentence-stage tn-sentence-stage-voice">
          <div className="tn-sentence-symbol" aria-hidden="true"><Target size={56} strokeWidth={1.7}/></div>
          <div className={`tn-ownvoice-card ${gravacaoValida?'ready':''} ${vozCommit.status==='recording'?'recording':''}`}>
            {!textoEscolhido&&<><small>PRIMEIRO, MONTE SUA FRASE</small><b>Escolha uma opção abaixo.</b></>}
            {textoEscolhido&&<>
              <small>AGORA DIGA COM A SUA VOZ</small>
              <b>“{frase}”</b>
              {vozCommit.status==='recording'?
                <button className="tn-ownvoice-record stop" type="button" onClick={pararGravacao}><Square size={17} fill="currentColor"/> Parar gravação</button>
                :gravacaoValida?
                <div className="tn-ownvoice-actions">
                  <div className="tn-ownvoice-ready"><Check size={16}/> Gravação pronta · toque no play para se ouvir</div>
                  <audio
                    key={vozCommit.url}
                    ref={audioPlayerRef}
                    src={vozCommit.url}
                    preload="metadata"
                    controls
                    playsInline
                    onError={()=>setVozCommit(prev=>({...prev,error:'A gravação foi salva, mas este formato não abriu para reprodução. Toque em Refazer e grave novamente.'}))}
                  />
                  <button className="redo" type="button" onClick={()=>iniciarGravacaoCompromisso(e,frase,v)}><RotateCcw size={16}/> Refazer</button>
                </div>
                :pulou?
                <div className="tn-ownvoice-skipped"><Check size={16}/> Etapa de voz ignorada neste dispositivo.</div>
                :
                <button className="tn-ownvoice-record" type="button" onClick={()=>iniciarGravacaoCompromisso(e,frase,v)}><Mic size={18}/> Gravar minha frase</button>
              }
              {vozCommit.status==='recording'&&<div className="tn-ownvoice-live"><i/> Gravando… fale a frase e toque em parar.</div>}
              {vozCommit.error&&<div className="tn-ownvoice-error"><span>{vozCommit.error}</span><button type="button" onClick={()=>seguirSemGravar(v,frase)}>Continuar sem gravar</button></div>}
            </>}
          </div>
        </div>

        <div className="tn-sentence-answer">
          <span>Eu mudaria</span>
          <button className={textoEscolhido?'filled':'blank'} type="button" onClick={()=>textoEscolhido&&selecionarObjetivoFrase(e,{valor:null,texto:''})}>{textoEscolhido||'escolha uma opção'}</button>
          <span>primeiro.</span>
        </div>

        <div className="tn-sentence-divider"/>
        <div className="tn-sentence-bank">{(e.opcoesFrase||[]).map(x=><button type="button" key={x.valor} className={v===x.valor?'selected':''} onClick={()=>selecionarObjetivoFrase(e,x)}>{x.texto}</button>)}</div>
      </div>;
    }
    if(e.interacao==='motivation-why'){
      const objetivo=ler('meta-inicial')||'Outra coisa';
      const importancia=Number(ler('meta-importancia')??5);
      const menor=Math.max(1,importancia-3);
      const perfil=perfilMotivacao(objetivo);
      const pergunta=importancia>=4?`Você marcou ${importancia}/10. Por que ${importancia} e não ${menor}?`:'O que faz isso importar para você, mesmo que ainda não seja prioridade máxima?';
      return <div className="tn-motivation-step">
        <div className="tn-motivation-icon"><Sparkles size={32}/></div>
        <span className="tn-motivation-kicker">ENCONTRE O SEU MOTIVO</span>
        <h1>{pergunta}</h1>
        <p>Escolha a razão que mais parece sua agora. Não a que “deveria” ser.</p>
        <div className="tn-motivation-options">{perfil.motivos.map(x=><button key={x} onClick={()=>concluirMotivacaoRapido(e,x,'motivo')}>{x}<ChevronRight size={18}/></button>)}</div>
      </div>;
    }
    if(e.interacao==='reward-choice'){
      const objetivo=ler('meta-inicial')||'Outra coisa';
      const perfil=perfilMotivacao(objetivo);
      return <div className="tn-motivation-step tn-reward-step">
        <div className="tn-motivation-icon"><Target size={32}/></div>
        <span className="tn-motivation-kicker">RECOMPENSA QUE PUXA O ESFORÇO</span>
        <h1>Se {objetivoLegivel(objetivo).toLowerCase()} mudar, o que você ganha de verdade?</h1>
        <p>Procure o resultado que você conseguiria sentir ou perceber na vida real.</p>
        <div className="tn-motivation-options">{perfil.recompensas.map(x=><button key={x} onClick={()=>concluirMotivacaoRapido(e,x,'recompensa')}>{x}<ChevronRight size={18}/></button>)}</div>
      </div>;
    }
    if(e.interacao==='motivation-insight'){
      const objetivo=ler('meta-inicial')||'Outra coisa';
      const importancia=Number(ler('meta-importancia')??5);
      const motivo=ler('meta-motivo')||'isso importa para você';
      const recompensa=ler('meta-recompensa')||'ver uma mudança concreta';
      const perfil=perfilMotivacao(objetivo);
      return <div className="tn-motivation-insight">
        <NIILOrb state="thinking" size={92} label="Insight NIIL"/>
        <span>INSIGHT NIIL</span>
        <h1>Você não escolheu apenas {objetivoLegivel(objetivo).toLowerCase()}.</h1>
        <div className="tn-motivation-quote">Você quer <b>{recompensa.toLowerCase()}</b>.</div>
        <div className="tn-motivation-summary">
          <div><small>IMPORTÂNCIA</small><b>{importancia}/10</b></div>
          <div><small>SEU MOTIVO</small><b>{motivo}</b></div>
        </div>
        <p>O NIIL vai guardar isso como sua motivação-base e usar essa informação para dar contexto aos próximos passos — sem prometer que motivação sozinha muda comportamento.</p>
        <div className="tn-motivation-path"><small>QUANDO FIZER SENTIDO, A TRILHA VAI PRIORIZAR</small><div>{perfil.modulos.map(x=><span key={x}>{x}</span>)}</div></div>
        <button className="tn-motivation-confirm" onClick={()=>confirmarMotivacaoBase(e)}>Usar isso na minha trilha <ChevronRight size={18}/></button>
      </div>;
    }
    if(['choice','binary','module-decision'].includes(e.interacao))return <div className="tn-options">{e.opcoes.map(x=><button key={x} className={v===x?'on':''} onClick={()=>concluirRapido(e,x)}>{x}<ChevronRight size={16}/></button>)}</div>;
    if(e.interacao==='scale')return <div className="tn-scale tn-scale-reflect"><div className="tn-scale-icon"><Target size={30}/></div><strong>{v??5}/10</strong><input type="range" min="1" max="10" value={v??5} onChange={ev=>salvar(e.chave,Number(ev.target.value))}/><div><span>{e.minimo}</span><span>{e.maximo}</span></div><small>{Number(v??5)>=8?'Isso parece importante de verdade para você.':Number(v??5)>=5?'Isso tem peso, mas ainda disputa espaço com outras coisas.':'Talvez isso ainda não seja uma prioridade real agora.'}</small></div>;
    if(e.interacao==='dual-scale')return <div className="tn-stack">
      {[['querer','Quanto eu quero'],['fazer','Quanto eu faço']].map(([k,l])=><label className="tn-slider" key={k}><span>{l}<b>{v?.[k]||5}/10</b></span><input type="range" min="1" max="10" value={v?.[k]||5} onChange={ev=>salvar(e.chave,{...(v||{}),[k]:Number(ev.target.value)})}/></label>)}
    </div>;
    if(['multi','modules','swipe'].includes(e.interacao))return <div className={e.interacao==='modules'?'tn-modules':'tn-chips'}>{e.opcoes.map(x=>{const on=Array.isArray(v)&&v.includes(x),I=MOD_ICONS[x]||Sparkles;return <button key={x} className={on?'on':''} onClick={()=>toggleMulti(e,x)}>{e.interacao==='modules'&&<I size={20}/>}<span>{x}</span>{on&&<Check size={15}/>}</button>})}</div>;
    if(e.interacao==='energy')return <div className="tn-stack">{[['acordar','Ao acordar'],['manha','Manhã'],['tarde','Tarde'],['noite','Noite']].map(([k,l])=><label className="tn-slider" key={k}><span>{l}<b>{v?.[k]||5}/10</b></span><input type="range" min="1" max="10" value={v?.[k]||5} onChange={ev=>salvar(e.chave,{...(v||{}),[k]:Number(ev.target.value)})}/></label>)}</div>;
    if(e.interacao==='sleep')return <div className="tn-times"><label><Moon size={19}/><span>Costumo dormir</span><input type="time" value={v?.dormir||'23:00'} onChange={ev=>salvar(e.chave,{...(v||{}),dormir:ev.target.value})}/></label><label><Clock3 size={19}/><span>Costumo acordar</span><input type="time" value={v?.acordar||'07:00'} onChange={ev=>salvar(e.chave,{...(v||{}),acordar:ev.target.value})}/></label>{e.modulo&&<button className="tn-module-link" onClick={()=>abrirModulo(e.modulo)}>Abrir Sono <ChevronRight size={16}/></button>}</div>;
    if(e.interacao==='chain')return <div className="tn-chain">{[['sinal','Sinal','Ex.: termino o jantar'],['acao','Ação','Ex.: pego o celular'],['resultado','Resultado','Ex.: fico 40 min rolando']].map(([k,l,p],i)=><React.Fragment key={k}><input value={v?.[k]||''} placeholder={p} onChange={ev=>salvar(e.chave,{...(v||{}),[k]:ev.target.value})}/>{i<2&&<ChevronRight size={17}/>}</React.Fragment>)}</div>;
    if(e.interacao==='tradeoff')return <div className="tn-trade"><label><span>AGORA</span><input placeholder="O que vence agora?" value={v?.agora||''} onChange={ev=>salvar(e.chave,{...(v||{}),agora:ev.target.value})}/></label><div>↔</div><label><span>ESTOU CONSTRUINDO</span><input placeholder="O que quero depois?" value={v?.depois||''} onChange={ev=>salvar(e.chave,{...(v||{}),depois:ev.target.value})}/></label></div>;
    if(e.interacao==='experiment')return <div className="tn-options">{e.opcoes.map(x=><button key={x} className={v===x?'on':''} onClick={()=>concluirRapido(e,x)}>{x}<Footprints size={17}/></button>)}</div>;
    if(e.interacao==='photo')return <div className="tn-photo"><Camera size={32}/><b>Uma foto pode virar evidência de contexto.</b><p>Registre o ambiente no Minha Visão e volte para continuar.</p><button onClick={()=>{salvar(e.chave,'visitou');abrirModulo('visao')}}>Abrir Minha Visão</button></div>;
    if(e.interacao==='sort')return <div className="tn-options">{e.opcoes.map(x=><button key={x} className={v===x?'on':''} onClick={()=>concluirRapido(e,x)}>{x}</button>)}</div>;
    if(e.interacao==='anchor')return <div className="tn-anchor"><span>DEPOIS DE</span><input placeholder="algo que já acontece" value={v?.ancora||''} onChange={ev=>salvar(e.chave,{...(v||{}),ancora:ev.target.value})}/><span>EU VOU</span><input placeholder="uma ação pequena" value={v?.acao||''} onChange={ev=>salvar(e.chave,{...(v||{}),acao:ev.target.value})}/></div>;
    if(e.interacao==='minimum')return <div className="tn-minimum">{['5 minutos','10 minutos','15 minutos','Uma ação mínima personalizada'].map(x=><button key={x} className={v===x?'on':''} onClick={()=>concluirRapido(e,x)}>{x}</button>)}</div>;
    if(e.interacao==='agenda')return <div className="tn-agenda-link"><CalendarDays size={30}/><b>{d.jornada?.planoSemana?.ativo?'Já entrou na sua agenda':'Transforme intenção em contexto real.'}</b><p>{(ler('ancora-acao')||{}).acao||'Use a ação que você acabou de montar.'}</p><button onClick={criarAgenda}>{d.jornada?.planoSemana?.ativo?'Atualizar na agenda':'Adicionar à agenda'}</button><button className="ghost" onClick={()=>abrirModulo('agenda')}>Ver Agenda</button></div>;
    if(e.interacao==='voice')return <div className="tn-voice"><textarea value={v||''} onChange={ev=>salvar(e.chave,ev.target.value)} placeholder="Uma frase já basta."/><button onClick={()=>iniciarVoz(e)}><Mic size={18}/> Falar em vez de escrever</button></div>;
    if(e.interacao==='budget')return <div className="tn-stack">{[['tempo','Tempo por semana'],['dinheiro','Dinheiro'],['atencao','Atenção']].map(([k,l])=><label className="tn-slider" key={k}><span>{l}<b>{v?.[k]??5}/10</b></span><input type="range" min="0" max="10" value={v?.[k]??5} onChange={ev=>salvar(e.chave,{...(v||{}),[k]:Number(ev.target.value)})}/></label>)}</div>;
    if(e.interacao==='insight')return <div className="tn-insight"><span className="tn-insight-label">INSIGHT NIIL</span><Brain size={28}/><b>Seus registros já formam algumas peças para comparar.</b><div className="tn-insight-grid"><span>{d.sono?.registros?.length||0}<small>noites</small></span><span>{d.treinos?.length||0}<small>treinos</small></span><span>{d.cursos?.length||0}<small>cursos</small></span><span>{d.financeiro?.transacoes?.length||0}<small>movimentos</small></span></div></div>;
    return <div className="tn-options"><button onClick={()=>salvar(e.chave,'ok')}>Entendi</button></div>;
  };

  if(passo){
    const fase=passo.fase;
    return <div className="tn-shell tn-detail">
      <header className="tn-detail-head"><button onClick={()=>setAberta(null)}><ArrowLeft size={20}/></button><div><span>{passo.tipo==='roda'?'RODA DA VIDA':fase.marco+' · '+passo.min+' min'}</span><b>{passo.tipo==='roda'?(snapshotRoda?'Seu retrato':RODA_SETORES[rodaPasso]):passo.titulo}</b></div><i>{passo.tipo==='roda'&&!snapshotRoda?(rodaPasso+1)+'/'+RODA_SETORES.length:(fase.etapas.findIndex(x=>x.id===passo.id)+1)+'/'+fase.etapas.length}</i></header>
      <div className="tn-detail-progress"><i style={{width:(passo.tipo==='roda'&&!snapshotRoda?((rodaPasso+1)/RODA_SETORES.length)*100:((fase.etapas.findIndex(x=>x.id===passo.id)+1)/fase.etapas.length)*100)+'%'}}/></div>
      <main className="tn-detail-main">
        {passo.tipo!=='roda'&&!['sentence-choice','motivation-why','reward-choice','motivation-insight'].includes(passo.interacao)&&<><div className="tn-kicker">UMA COISA POR VEZ</div><h1>{passo.pergunta||passo.perguntaCurta||passo.titulo}</h1>{passo.perguntaCurta&&<p>{passo.perguntaCurta}</p>}</>}
        <Interacao e={passo}/>
        {passo.modulo&&!['sleep','agenda','photo'].includes(passo.interacao)&&<button className="tn-open-module" onClick={()=>abrirModulo(passo.modulo)}>Abrir {passo.modulo==='financeiro'?'Financeiro':passo.modulo==='cursos'?'Cursos':passo.modulo==='sono'?'Sono':'módulo relacionado'} <ChevronRight size={16}/></button>}
        {passo.ciencia&&<details className="tn-science"><summary>Por que o NIIL pergunta isso?</summary><p>{passo.ciencia}</p>{passo.fonte&&<small>{passo.fonte}</small>}</details>}
        {passo.base&&<small className="tn-base">{passo.base}</small>}
      </main>
      {passo.tipo!=='roda'&&!['choice','binary','module-decision','experiment','sort','minimum','motivation-why','reward-choice','motivation-insight'].includes(passo.interacao)&&<footer className="tn-detail-foot"><button disabled={!valido(passo)} onClick={()=>concluir(passo)}>{passo.interacao==='sentence-choice'?'Confirmar':'Continuar'} <ChevronRight size={18}/></button></footer>}
    </div>;
  }

  return <div className="tn-shell">
    <header className="tn-hero">
      <div><span>TRILHA FUNDAMENTAL</span><h1>Entenda o que move você.</h1><p>Passos curtos. Uma descoberta por vez. A vida real entra no caminho conforme fizer sentido.</p></div>
      <div className="tn-hero-stat"><b>{marcos}</b><small>de {TRILHA_NIIL.length}<br/>marcos</small></div>
    </header>

    {atual.concluida?
      <section className="tn-season-complete">
        <span>TEMPORADA CONCLUÍDA</span>
        <h2>Este ciclo fica no seu histórico.</h2>
        <p>Quando fizer sentido começar outro, você percorre o mesmo método novamente. O valor está em comparar quem você era, o que escolheu e como seus padrões mudaram.</p>
        <button onClick={iniciarNovaTemporada}>Iniciar nova temporada <ChevronRight size={17}/></button>
      </section>
      :
      <section className="tn-now">
        <div><span>AGORA · {atual.fase.marco}</span><b>{atual.fase.nome}</b><small>Faltam {Math.max(0,atual.total-atual.concluidas)} passos para fechar este marco.</small></div>
        <button onClick={()=>setAberta(atual.fase.etapas.find(e=>!feito(e.id))?.id||atual.fase.etapas[0].id)}>Continuar <ChevronRight size={17}/></button>
      </section>
    }

    {temporadasConcluidas.length>0&&<section className="tn-season-history">
      <div className="tn-season-history-head"><span>HISTÓRICO</span><b>{temporadasConcluidas.length} {temporadasConcluidas.length===1?'temporada':'temporadas'}</b></div>
      {temporadasConcluidas.slice().reverse().slice(0,4).map(t=>{
        const ini=t.iniciadaEm?new Date(t.iniciadaEm).toLocaleDateString('pt-BR',{month:'short',year:'numeric'}):'';
        const fim=t.encerradaEm?new Date(t.encerradaEm).toLocaleDateString('pt-BR',{month:'short',year:'numeric'}):'';
        return <div className="tn-season-history-item" key={t.id}>
          <div><small>TEMPORADA {t.numero||'—'} · {ini}{fim?' → '+fim:''}</small><b>{objetivoLegivel(t.objetivo||t.motivacaoBase?.objetivo)}</b></div>
          <span>{Number.isFinite(Number(t.duracaoDias))?t.duracaoDias+' dias':'Concluída'}</span>
        </div>;
      })}
    </section>}

    <div className="tn-olympo">
      {TRILHA_NIIL.map((f,fi)=>{
        const completas=f.etapas.filter(e=>feito(e.id)).length;
        const done=completas===f.etapas.length;
        const unlocked=fi===0||TRILHA_NIIL[fi-1].etapas.every(e=>feito(e.id));
        const I=ICONS[f.icone]||Target;
        const pos=[50,68,58,34,25,43,67,72,51,29,35,61];
        const h=f.etapas.length*116+18;
        const currentPhase=atual?.fase?.id===f.id;
        return <section key={f.id} className={`tn-olympo-phase ${done?'done':''} ${unlocked?'':'locked'}`}>
          <div className={`tn-olympo-banner ${currentPhase?'current':''}`}>
            <div className="tn-olympo-banner-icon">{done?<Check size={23}/>:unlocked?<I size={23}/>:<Lock size={20}/>}</div>
            <div className="tn-olympo-banner-copy">
              <span>{f.marco}</span>
              <h2>{f.nome}</h2>
              <p>{f.resumo}</p>
            </div>
            <b>{completas}/{f.etapas.length}</b>
          </div>
          {unlocked&&<div className="tn-olympo-map" style={{height:h}}>
            <svg viewBox={`0 0 100 ${h}`} preserveAspectRatio="none" aria-hidden="true">
              <polyline points={f.etapas.map((_,i)=>`${pos[i%pos.length]},${i*116+42}`).join(' ')} fill="none" stroke="#E7E4EA" strokeWidth="2.3" strokeDasharray="2 3" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round"/>
              {f.etapas.slice(0,-1).map((e,i)=>feito(e.id)&&<line key={e.id} x1={pos[i%pos.length]} y1={i*116+42} x2={pos[(i+1)%pos.length]} y2={(i+1)*116+42} stroke="#B7F20C" strokeWidth="3.2" vectorEffect="non-scaling-stroke" strokeLinecap="round"/>)}
            </svg>
            {f.etapas.map((e,i)=>{
              const ok=feito(e.id),lib=liberado(e.id),isCurrent=!ok&&lib;
              const x=pos[i%pos.length];
              return <button
                key={e.id}
                className={`tn-olympo-node ${ok?'done':isCurrent?'current':'locked'}`}
                disabled={!lib}
                onClick={()=>lib&&setAberta(e.id)}
                style={{left:`${x}%`,top:i*116}}
                aria-label={e.titulo}
              >
                <span className="tn-olympo-node-circle">{ok?<Check size={27} strokeWidth={3}/>:lib?<I size={23}/>:<Lock size={20}/>}</span>
                <span className="tn-olympo-node-label"><b>{e.titulo}</b><small>~{e.min||3} min</small></span>
              </button>
            })}
          </div>}
        </section>
      })}
    </div>

    {marcos>=5&&recomendacoes.length>0&&<section className="tn-context"><span>INSIGHT NIIL · CAMINHOS PARA APROFUNDAR</span>{recomendacoes.map(r=><button key={r.id} onClick={()=>abrirModulo(r.modulo)}><Sparkles size={18}/><div><b>{r.titulo}</b><p>{r.texto}</p></div><ChevronRight size={17}/></button>)}</section>}

    {marco&&<div className="tn-marco-overlay" onClick={()=>setMarco(null)}><div onClick={e=>e.stopPropagation()}><NIILOrb state="done" size={150} label="Marco concluído"/><span>{marco.marco} CONCLUÍDO</span><h2>{marco.nome}</h2><p>Você fechou este marco. O próximo caminho usa o que você acabou de construir — não começa do zero.</p><button onClick={()=>setMarco(null)}>Ver próximo marco</button></div></div>}
  </div>;
}
