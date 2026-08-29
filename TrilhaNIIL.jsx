import React,{useEffect,useMemo,useRef,useState}from'react';
import{
  ArrowLeft,Target,Moon,Home,Repeat2,Network,Flag,CalendarDays,TrendingUp,
  Lock,Check,ChevronRight,BookOpen,Wallet,Dumbbell,Droplets,Utensils,GraduationCap,
  Languages,Camera,Clock3,Mic,Square,Brain,Footprints,Sparkles
}from'lucide-react';
import NIILOrb from'./NIILOrb.jsx';
import{RODA_SETORES}from'./conteudo.js';
import{TRILHA_NIIL,moduloParaAba,faseAtualNIIL,marcosConcluidosNIIL,recomendacoesContextuaisNIIL}from'./trilha.niil.data.js';
import{iniciarReconhecimentoVoz,reconhecimentoDisponivel}from'./ia.jsx';
import{registrarEventoGamificacao}from'./gamificacao.core.js';
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

export default function TrilhaNIIL({d,up,setAba,aviso=()=>{}}){
  const[aberta,setAberta]=useState(null);
  const[marco,setMarco]=useState(null);
  const[rodaPasso,setRodaPasso]=useState(0);
  const[rodaAtivacao,setRodaAtivacao]=useState({area:null,etapa:'foco',razoes:[],metaNota:null});
  const recRef=useRef(null);
  const atual=useMemo(()=>faseAtualNIIL(d.etapas||{}),[d.etapas]);
  const marcos=useMemo(()=>marcosConcluidosNIIL(d.etapas||{}),[d.etapas]);
  const recomendacoes=useMemo(()=>recomendacoesContextuaisNIIL(d),[d]);
  const passo=TRILHA_NIIL.flatMap(f=>f.etapas.map(e=>({...e,fase:f}))).find(e=>e.id===aberta);
  const resp=d.trilhaNIIL?.respostas||{};
  const snapshotValido=x=>x?.versao===3&&RODA_SETORES.every(s=>Number.isFinite(Number(x?.valores?.[s]))&&Number(x?.valores?.[s])>=0&&Number(x?.valores?.[s])<=10);
  const snapshotRoda=passo?.tipo==='roda'?(d.trilhaNIIL?.rodaSnapshots||[]).find(x=>x.etapaId===passo.id&&snapshotValido(x)):null;
  const rascunhoRoda=passo?.tipo==='roda'?(d.trilhaNIIL?.rodaRascunhos?.[passo.rodaId]||{}):{};

  useEffect(()=>{
    if(passo?.tipo!=='roda')return;
    if(snapshotRoda){setRodaAtivacao({area:null,etapa:'foco',razoes:[],metaNota:null});return;}
    const i=RODA_SETORES.findIndex(s=>rascunhoRoda?.[s]?.nota===undefined);
    setRodaPasso(i<0?0:i);
    setRodaAtivacao({area:null,etapa:'foco',razoes:[],metaNota:null});
  },[passo?.id,snapshotRoda?.id]);


  const salvar=(chave,valor)=>up(s=>({...s,trilhaNIIL:{...(s.trilhaNIIL||{}),respostas:{...(s.trilhaNIIL?.respostas||{}),[chave]:valor}}}));
  const ler=chave=>resp[chave];
  const feito=id=>!!d.etapas?.[id]?.feito;
  const sequencia=TRILHA_NIIL.flatMap(f=>f.etapas);
  const primeiroPendente=sequencia.findIndex(e=>!feito(e.id));
  const liberado=id=>{const i=sequencia.findIndex(e=>e.id===id);return i<=Math.max(0,primeiroPendente<0?sequencia.length-1:primeiroPendente)};

  const abrirModulo=modulo=>{
    const aba=moduloParaAba[modulo];
    if(!aba)return;
    up(s=>({...s,trilhaNIIL:{...(s.trilhaNIIL||{}),modulosVisitados:{...(s.trilhaNIIL?.modulosVisitados||{}),[modulo]:true}}}));
    feedback('snap',d);
    setAba(aba);
  };

  const valido=e=>{
    const v=ler(e.chave);
    if(e.tipo==='roda')return !!(d.trilhaNIIL?.rodaSnapshots||[]).find(x=>x.etapaId===e.id&&snapshotValido(x));
    if(e.interacao==='multi'||e.interacao==='modules'||e.interacao==='swipe')return Array.isArray(v)&&v.length>0;
    if(e.interacao==='energy')return v&&Object.keys(v).length>=4;
    if(e.interacao==='sleep')return v?.dormir&&v?.acordar;
    if(e.interacao==='dual-scale')return Number(v?.querer)>0&&Number(v?.fazer)>0;
    if(e.interacao==='chain')return v?.sinal&&v?.acao&&v?.resultado;
    if(e.interacao==='tradeoff')return v?.agora&&v?.depois;
    if(e.interacao==='anchor')return v?.ancora&&v?.acao;
    if(e.interacao==='minimum')return !!v;
    if(e.interacao==='budget')return v&&Number(v.tempo)>=0&&Number(v.dinheiro)>=0&&Number(v.atencao)>=0;
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
      const base={...s,etapas:{...(s.etapas||{}),[e.id]:{feito:true,data:hoje(),concluidaEm:new Date().toISOString()}}};
      let next=registrarEventoGamificacao(base,{
        key:`trilha:v2:${e.id}`,
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
        key:`trilha:v2:marco:${e.fase.id}`,
        tipo:'trail.phase.completed',
        pontos:50,
        titulo:`Marco concluído · ${e.fase.nome}`,
        area:'trilha',
        data:hoje(),
        trilhaId:'niil-central-v2',
        origemId:e.fase.id
      });
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

  const concluirRapido=(e,valor)=>{
    salvar(e.chave,valor);
    feedback('snap',d);
    window.setTimeout(()=>concluir(e,{ignorarValidacao:true,semFeedback:true}),260);
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
    const snap={id:'roda-'+e.rodaId+'-'+Date.now(),versao:3,rodaId:e.rodaId,etapaId:e.id,concluidaEm:new Date().toISOString(),data:hoje(),valores};
    window.setTimeout(()=>{
      up(s=>({...s,rodas:{...(s.rodas||{}),[e.rodaId]:valores},trilhaNIIL:{...(s.trilhaNIIL||{}),rodaSnapshots:[...(s.trilhaNIIL?.rodaSnapshots||[]),snap]}}));
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
      const snap=(d.trilhaNIIL?.rodaSnapshots||[]).find(x=>x.etapaId===e.id&&snapshotValido(x));
      if(snap){
        const ordenadas=[...RODA_SETORES].sort((a,b)=>Number(snap.valores[a])-Number(snap.valores[b]));
        const dataFmt=new Date(snap.concluidaEm).toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'});
        return <div className="tn-roda-result">
          <div className="tn-roda-result-head"><span>RETRATO CONCLUÍDO</span><b>{dataFmt}</b></div>
          <Radar valores={snap.valores}/>
          <div className="tn-roda-score-grid">{RODA_SETORES.map(s=><div key={s}><span>{s}</span><b>{snap.valores[s]}/10</b></div>)}</div>
          <div className="tn-roda-focus">
            <span>AGORA, ESCOLHA UM FOCO</span>
            <h3>Qual ponto merece entrar primeiro no seu sistema?</h3>
            <p>O NIIL sugere começar por áreas com notas mais baixas, mas a escolha é sua.</p>
            <div className="tn-roda-focus-list">{ordenadas.slice(0,4).map(area=>{
              const mod=RODA_MODULO(area);
              const destino=mod?(mod==='financeiro'?'Financeiro':mod==='sono'?'Sono':mod==='cursos'?'Cursos':mod==='agenda'?'Agenda':'Diário'):'trilha contextual';
              return <button key={area} onClick={()=>ativarFocoRoda(e,snap,area)}>
                <div><b>{area}</b><small>{snap.valores[area]+'/10 · '+(mod?'conectar ao módulo '+destino:'criar '+destino)}</small></div>
                <ChevronRight size={18}/>
              </button>;
            })}</div>
            <details className="tn-roda-all"><summary>Escolher outra área</summary><div>{ordenadas.slice(4).map(area=><button key={area} onClick={()=>ativarFocoRoda(e,snap,area)}><span>{area}</span><b>{snap.valores[area]}/10</b></button>)}</div></details>
          </div>
          <div className="tn-roda-locked-note"><Lock size={14}/><span>Este retrato foi fechado e não pode ser editado. Em uma nova revisão, o NIIL cria outro retrato para comparação.</span></div>
        </div>;
      }
      const setor=RODA_SETORES[rodaPasso],item=rascunhoRoda?.[setor]||{},guia=RODA_GUIA[setor]||{dica:'Pense na sua realidade recente.',exemplos:[]};
      const nota=Number(item.nota||0);
      const reflexao=!nota?'Escolha pensando na sua realidade das últimas semanas.':nota<=4?'O que está deixando essa área tão distante do que você gostaria?':nota<=7?'O que já funciona — e o que ainda está faltando?':'O que está funcionando bem e merece ser protegido?';
      return <div className="tn-roda-wizard">
        <div className="tn-roda-tool-title"><span>FERRAMENTA · RODA DA VIDA</span><small>1 área por vez · seu retrato só fecha no final</small></div>
        <div className="tn-roda-step"><span>{rodaPasso+1} de {RODA_SETORES.length}</span><b>{setor}</b></div>
        <h2>Que nota você dá para {setor.toLowerCase()} hoje?</h2>
        <p className="tn-roda-tip">{guia.dica}</p>
        <div className="tn-roda-notas">{Array.from({length:10},(_,i)=>i+1).map(n=><button key={n} className={nota===n?'on':''} onClick={()=>salvarRodaCampo(e,setor,{nota:n})}>{n}</button>)}</div>
        <div className="tn-roda-reflection"><Sparkles size={17}/><div><b>Antes de seguir, reflita:</b><span>{reflexao}</span></div></div>
        <div className="tn-roda-why">
          <span>Por que você deu essa nota?</span>
          <small>Marque o que mais influenciou sua resposta. Os exemplos servem só para ajudar a pensar.</small>
          <div className="tn-roda-reasons">{guia.exemplos.map(x=>{const on=(item.razoes||[]).includes(x);return <button key={x} className={on?'on':''} onClick={()=>alternarRazaoRoda(e,setor,x)}>{x}{on&&<Check size={14}/>}</button>})}</div>
          <textarea value={item.detalhe||''} onChange={ev=>salvarRodaCampo(e,setor,{detalhe:ev.target.value})} placeholder="Se quiser, conte em uma frase o que está acontecendo nessa área."/>
          <div className="tn-roda-requirement">Para continuar: escolha uma nota e pelo menos um motivo.</div>
        </div>
      </div>;
    }
    if(['choice','binary','module-decision'].includes(e.interacao))return <div className="tn-options">{e.opcoes.map(x=><button key={x} className={v===x?'on':''} onClick={()=>concluirRapido(e,x)}>{x}<ChevronRight size={16}/></button>)}</div>;
    if(e.interacao==='scale')return <div className="tn-scale"><strong>{v||5}/10</strong><input type="range" min="1" max="10" value={v||5} onChange={ev=>salvar(e.chave,Number(ev.target.value))} onPointerUp={ev=>concluirRapido(e,Number(ev.currentTarget.value))}/><div><span>{e.minimo}</span><span>{e.maximo}</span></div></div>;
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
    if(e.interacao==='insight')return <div className="tn-insight"><Brain size={28}/><b>A NIIL já tem algumas peças suas.</b><div className="tn-insight-grid"><span>{d.sono?.registros?.length||0}<small>noites</small></span><span>{d.treinos?.length||0}<small>treinos</small></span><span>{d.cursos?.length||0}<small>cursos</small></span><span>{d.financeiro?.transacoes?.length||0}<small>movimentos</small></span></div></div>;
    return <div className="tn-options"><button onClick={()=>salvar(e.chave,'ok')}>Entendi</button></div>;
  };

  if(passo){
    const fase=passo.fase;
    return <div className="tn-shell tn-detail">
      <header className="tn-detail-head"><button onClick={()=>setAberta(null)}><ArrowLeft size={20}/></button><div><span>{passo.tipo==='roda'?'RODA DA VIDA':fase.marco+' · '+passo.min+' min'}</span><b>{passo.tipo==='roda'?(snapshotRoda?'Seu retrato':RODA_SETORES[rodaPasso]):passo.titulo}</b></div><i>{passo.tipo==='roda'&&!snapshotRoda?(rodaPasso+1)+'/'+RODA_SETORES.length:(fase.etapas.findIndex(x=>x.id===passo.id)+1)+'/'+fase.etapas.length}</i></header>
      <div className="tn-detail-progress"><i style={{width:(passo.tipo==='roda'&&!snapshotRoda?((rodaPasso+1)/RODA_SETORES.length)*100:((fase.etapas.findIndex(x=>x.id===passo.id)+1)/fase.etapas.length)*100)+'%'}}/></div>
      <main className="tn-detail-main">
        {passo.tipo!=='roda'&&<><div className="tn-kicker">UMA COISA POR VEZ</div><h1>{passo.pergunta||passo.perguntaCurta||passo.titulo}</h1>{passo.perguntaCurta&&<p>{passo.perguntaCurta}</p>}</>}
        <Interacao e={passo}/>
        {passo.modulo&&!['sleep','agenda','photo'].includes(passo.interacao)&&<button className="tn-open-module" onClick={()=>abrirModulo(passo.modulo)}>Abrir {passo.modulo==='financeiro'?'Financeiro':passo.modulo==='cursos'?'Cursos':passo.modulo==='sono'?'Sono':'módulo relacionado'} <ChevronRight size={16}/></button>}
        {passo.ciencia&&<details className="tn-science"><summary>Por que o NIIL pergunta isso?</summary><p>{passo.ciencia}</p>{passo.fonte&&<small>{passo.fonte}</small>}</details>}
        {passo.base&&<small className="tn-base">{passo.base}</small>}
      </main>
      {passo.tipo==='roda'&&!snapshotRoda&&(()=>{const setor=RODA_SETORES[rodaPasso],item=rascunhoRoda?.[setor]||{},ok=!!item.nota&&(((item.razoes||[]).length>0)||String(item.detalhe||'').trim().length>=3);return <footer className="tn-detail-foot tn-roda-foot">{rodaPasso>0&&<button className="tn-roda-back-step" onClick={()=>{setRodaPasso(x=>Math.max(0,x-1));window.setTimeout(()=>window.scrollTo({top:0,behavior:'smooth'}),30)}}>Anterior</button>}<button className="tn-roda-continue" disabled={!ok} onClick={()=>concluirAreaRoda(passo)}>{rodaPasso===RODA_SETORES.length-1?'Ver meu retrato':'Continuar'} <ChevronRight size={18}/></button></footer>})()}
      {passo.tipo!=='roda'&&!['choice','binary','module-decision','experiment','sort','minimum','scale'].includes(passo.interacao)&&<footer className="tn-detail-foot"><button disabled={!valido(passo)} onClick={()=>concluir(passo)}>{feito(passo.id)?'Continuar':'Concluir e seguir'} <ChevronRight size={18}/></button></footer>}
    </div>;
  }

  return <div className="tn-shell">
    <header className="tn-hero">
      <div><span>TRILHA FUNDAMENTAL</span><h1>Entenda o que move você.</h1><p>Passos curtos. Uma descoberta por vez. A vida real entra no caminho conforme fizer sentido.</p></div>
      <div className="tn-hero-stat"><b>{marcos}</b><small>de {TRILHA_NIIL.length}<br/>marcos</small></div>
    </header>

    <section className="tn-now">
      <div><span>AGORA · {atual.fase.marco}</span><b>{atual.fase.nome}</b><small>Faltam {Math.max(0,atual.total-atual.concluidas)} passos para fechar este marco.</small></div>
      <button onClick={()=>setAberta(atual.fase.etapas.find(e=>!feito(e.id))?.id||atual.fase.etapas[0].id)}>Continuar <ChevronRight size={17}/></button>
    </section>

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

    {marcos>=5&&recomendacoes.length>0&&<section className="tn-context"><span>A NIIL ENCONTROU CAMINHOS PARA APROFUNDAR</span>{recomendacoes.map(r=><button key={r.id} onClick={()=>abrirModulo(r.modulo)}><Sparkles size={18}/><div><b>{r.titulo}</b><p>{r.texto}</p></div><ChevronRight size={17}/></button>)}</section>}

    {marco&&<div className="tn-marco-overlay" onClick={()=>setMarco(null)}><div onClick={e=>e.stopPropagation()}><NIILOrb state="done" size={150} label="Marco concluído"/><span>{marco.marco} CONCLUÍDO</span><h2>{marco.nome}</h2><p>Você fechou este marco. O próximo caminho usa o que você acabou de construir — não começa do zero.</p><button onClick={()=>setMarco(null)}>Ver próximo marco</button></div></div>}
  </div>;
}
