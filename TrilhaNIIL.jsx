import React,{useMemo,useRef,useState}from'react';
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
  const recRef=useRef(null);
  const atual=useMemo(()=>faseAtualNIIL(d.etapas||{}),[d.etapas]);
  const marcos=useMemo(()=>marcosConcluidosNIIL(d.etapas||{}),[d.etapas]);
  const recomendacoes=useMemo(()=>recomendacoesContextuaisNIIL(d),[d]);
  const passo=TRILHA_NIIL.flatMap(f=>f.etapas.map(e=>({...e,fase:f}))).find(e=>e.id===aberta);
  const resp=d.trilhaNIIL?.respostas||{};

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
    if(e.tipo==='roda')return RODA_SETORES.every(s=>Number(d.rodas?.[e.rodaId]?.[s])>=1);
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

  const concluir=e=>{
    if(!valido(e)){aviso('Faça a interação rápida antes de continuar.');return;}
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
    feedback('snap',d);
    if(ultima&&!ja){
      setMarco(e.fase);
      feedback('marco',d);
      setAberta(null);
      return;
    }
    const prox=e.fase.etapas[idx+1];
    setAberta(prox?.id||null);
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

  const Interacao=({e})=>{
    const v=ler(e.chave);
    if(e.tipo==='roda'){
      const vals=d.rodas?.[e.rodaId]||{};
      return <div className="tn-roda"><Radar valores={vals}/><div className="tn-roda-list">{RODA_SETORES.map(s=><label key={s}><span>{s}<b>{vals[s]||'—'}</b></span><input type="range" min="1" max="10" value={vals[s]||5} onChange={ev=>{up(st=>({...st,rodas:{...(st.rodas||{}),[e.rodaId]:{...(st.rodas?.[e.rodaId]||{}),[s]:Number(ev.target.value)}}}));feedback('tap',d)}}/></label>)}</div></div>;
    }
    if(['choice','binary','module-decision'].includes(e.interacao))return <div className="tn-options">{e.opcoes.map(x=><button key={x} className={v===x?'on':''} onClick={()=>{salvar(e.chave,x);feedback('tap',d)}}>{x}<ChevronRight size={16}/></button>)}</div>;
    if(e.interacao==='scale')return <div className="tn-scale"><strong>{v||5}/10</strong><input type="range" min="1" max="10" value={v||5} onChange={ev=>{salvar(e.chave,Number(ev.target.value));feedback('tap',d)}}/><div><span>{e.minimo}</span><span>{e.maximo}</span></div></div>;
    if(e.interacao==='dual-scale')return <div className="tn-stack">
      {[['querer','Quanto eu quero'],['fazer','Quanto eu faço']].map(([k,l])=><label className="tn-slider" key={k}><span>{l}<b>{v?.[k]||5}/10</b></span><input type="range" min="1" max="10" value={v?.[k]||5} onChange={ev=>salvar(e.chave,{...(v||{}),[k]:Number(ev.target.value)})}/></label>)}
    </div>;
    if(['multi','modules','swipe'].includes(e.interacao))return <div className={e.interacao==='modules'?'tn-modules':'tn-chips'}>{e.opcoes.map(x=>{const on=Array.isArray(v)&&v.includes(x),I=MOD_ICONS[x]||Sparkles;return <button key={x} className={on?'on':''} onClick={()=>toggleMulti(e,x)}>{e.interacao==='modules'&&<I size={20}/>}<span>{x}</span>{on&&<Check size={15}/>}</button>})}</div>;
    if(e.interacao==='energy')return <div className="tn-stack">{[['acordar','Ao acordar'],['manha','Manhã'],['tarde','Tarde'],['noite','Noite']].map(([k,l])=><label className="tn-slider" key={k}><span>{l}<b>{v?.[k]||5}/10</b></span><input type="range" min="1" max="10" value={v?.[k]||5} onChange={ev=>salvar(e.chave,{...(v||{}),[k]:Number(ev.target.value)})}/></label>)}</div>;
    if(e.interacao==='sleep')return <div className="tn-times"><label><Moon size={19}/><span>Costumo dormir</span><input type="time" value={v?.dormir||'23:00'} onChange={ev=>salvar(e.chave,{...(v||{}),dormir:ev.target.value})}/></label><label><Clock3 size={19}/><span>Costumo acordar</span><input type="time" value={v?.acordar||'07:00'} onChange={ev=>salvar(e.chave,{...(v||{}),acordar:ev.target.value})}/></label>{e.modulo&&<button className="tn-module-link" onClick={()=>abrirModulo(e.modulo)}>Abrir Sono <ChevronRight size={16}/></button>}</div>;
    if(e.interacao==='chain')return <div className="tn-chain">{[['sinal','Sinal','Ex.: termino o jantar'],['acao','Ação','Ex.: pego o celular'],['resultado','Resultado','Ex.: fico 40 min rolando']].map(([k,l,p],i)=><React.Fragment key={k}><input value={v?.[k]||''} placeholder={p} onChange={ev=>salvar(e.chave,{...(v||{}),[k]:ev.target.value})}/>{i<2&&<ChevronRight size={17}/>}</React.Fragment>)}</div>;
    if(e.interacao==='tradeoff')return <div className="tn-trade"><label><span>AGORA</span><input placeholder="O que vence agora?" value={v?.agora||''} onChange={ev=>salvar(e.chave,{...(v||{}),agora:ev.target.value})}/></label><div>↔</div><label><span>ESTOU CONSTRUINDO</span><input placeholder="O que quero depois?" value={v?.depois||''} onChange={ev=>salvar(e.chave,{...(v||{}),depois:ev.target.value})}/></label></div>;
    if(e.interacao==='experiment')return <div className="tn-options">{e.opcoes.map(x=><button key={x} className={v===x?'on':''} onClick={()=>{salvar(e.chave,x);feedback('tap',d)}}>{x}<Footprints size={17}/></button>)}</div>;
    if(e.interacao==='photo')return <div className="tn-photo"><Camera size={32}/><b>Uma foto pode virar evidência de contexto.</b><p>Registre o ambiente no Minha Visão e volte para continuar.</p><button onClick={()=>{salvar(e.chave,'visitou');abrirModulo('visao')}}>Abrir Minha Visão</button></div>;
    if(e.interacao==='sort')return <div className="tn-options">{e.opcoes.map(x=><button key={x} className={v===x?'on':''} onClick={()=>{salvar(e.chave,x);feedback('tap',d)}}>{x}</button>)}</div>;
    if(e.interacao==='anchor')return <div className="tn-anchor"><span>DEPOIS DE</span><input placeholder="algo que já acontece" value={v?.ancora||''} onChange={ev=>salvar(e.chave,{...(v||{}),ancora:ev.target.value})}/><span>EU VOU</span><input placeholder="uma ação pequena" value={v?.acao||''} onChange={ev=>salvar(e.chave,{...(v||{}),acao:ev.target.value})}/></div>;
    if(e.interacao==='minimum')return <div className="tn-minimum">{['5 minutos','10 minutos','15 minutos','Uma ação mínima personalizada'].map(x=><button key={x} className={v===x?'on':''} onClick={()=>{salvar(e.chave,x);feedback('tap',d)}}>{x}</button>)}</div>;
    if(e.interacao==='agenda')return <div className="tn-agenda-link"><CalendarDays size={30}/><b>{d.jornada?.planoSemana?.ativo?'Já entrou na sua agenda':'Transforme intenção em contexto real.'}</b><p>{(ler('ancora-acao')||{}).acao||'Use a ação que você acabou de montar.'}</p><button onClick={criarAgenda}>{d.jornada?.planoSemana?.ativo?'Atualizar na agenda':'Adicionar à agenda'}</button><button className="ghost" onClick={()=>abrirModulo('agenda')}>Ver Agenda</button></div>;
    if(e.interacao==='voice')return <div className="tn-voice"><textarea value={v||''} onChange={ev=>salvar(e.chave,ev.target.value)} placeholder="Uma frase já basta."/><button onClick={()=>iniciarVoz(e)}><Mic size={18}/> Falar em vez de escrever</button></div>;
    if(e.interacao==='budget')return <div className="tn-stack">{[['tempo','Tempo por semana'],['dinheiro','Dinheiro'],['atencao','Atenção']].map(([k,l])=><label className="tn-slider" key={k}><span>{l}<b>{v?.[k]??5}/10</b></span><input type="range" min="0" max="10" value={v?.[k]??5} onChange={ev=>salvar(e.chave,{...(v||{}),[k]:Number(ev.target.value)})}/></label>)}</div>;
    if(e.interacao==='insight')return <div className="tn-insight"><Brain size={28}/><b>A NIIL já tem algumas peças suas.</b><div className="tn-insight-grid"><span>{d.sono?.registros?.length||0}<small>noites</small></span><span>{d.treinos?.length||0}<small>treinos</small></span><span>{d.cursos?.length||0}<small>cursos</small></span><span>{d.financeiro?.transacoes?.length||0}<small>movimentos</small></span></div></div>;
    return <div className="tn-options"><button onClick={()=>salvar(e.chave,'ok')}>Entendi</button></div>;
  };

  if(passo){
    const fase=passo.fase;
    return <div className="tn-shell tn-detail">
      <header className="tn-detail-head"><button onClick={()=>setAberta(null)}><ArrowLeft size={20}/></button><div><span>{fase.marco} · {passo.min} min</span><b>{passo.titulo}</b></div><i>{fase.etapas.findIndex(x=>x.id===passo.id)+1}/{fase.etapas.length}</i></header>
      <div className="tn-detail-progress"><i style={{width:`${((fase.etapas.findIndex(x=>x.id===passo.id)+1)/fase.etapas.length)*100}%`}}/></div>
      <main className="tn-detail-main">
        <div className="tn-kicker">UMA COISA POR VEZ</div>
        <h1>{passo.pergunta||passo.perguntaCurta||passo.titulo}</h1>
        {passo.perguntaCurta&&<p>{passo.perguntaCurta}</p>}
        <Interacao e={passo}/>
        {passo.modulo&&!['sleep','agenda','photo'].includes(passo.interacao)&&<button className="tn-open-module" onClick={()=>abrirModulo(passo.modulo)}>Abrir {passo.modulo==='financeiro'?'Financeiro':passo.modulo==='cursos'?'Cursos':passo.modulo==='sono'?'Sono':'módulo relacionado'} <ChevronRight size={16}/></button>}
        {passo.ciencia&&<details className="tn-science"><summary>Por que o NIIL pergunta isso?</summary><p>{passo.ciencia}</p>{passo.fonte&&<small>{passo.fonte}</small>}</details>}
        {passo.base&&<small className="tn-base">{passo.base}</small>}
      </main>
      <footer className="tn-detail-foot"><button disabled={!valido(passo)} onClick={()=>concluir(passo)}>{feito(passo.id)?'Continuar':'Concluir e seguir'} <ChevronRight size={18}/></button></footer>
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

    <div className="tn-path">
      {TRILHA_NIIL.map((f,fi)=>{
        const completas=f.etapas.filter(e=>feito(e.id)).length,done=completas===f.etapas.length;
        const unlocked=fi===0||TRILHA_NIIL[fi-1].etapas.every(e=>feito(e.id));
        const I=ICONS[f.icone]||Target;
        return <section key={f.id} className={`tn-phase ${done?'done':''} ${unlocked?'':'locked'}`}>
          <div className="tn-phase-title"><div className="tn-phase-icon">{done?<Check size={22}/>:unlocked?<I size={22}/>:<Lock size={19}/>}</div><div><span>{f.marco}</span><h2>{f.nome}</h2><p>{f.resumo}</p></div><b>{completas}/{f.etapas.length}</b></div>
          {unlocked&&<div className="tn-nodes">{f.etapas.map((e,i)=>{const ok=feito(e.id),lib=liberado(e.id);return <button key={e.id} disabled={!lib} onClick={()=>lib&&setAberta(e.id)} className={ok?'done':lib?'current':''}><span>{ok?<Check size={18}/>:i+1}</span><div><b>{e.titulo}</b><small>~{e.min||3} min</small></div><ChevronRight size={16}/></button>})}</div>}
        </section>
      })}
    </div>

    {marcos>=5&&recomendacoes.length>0&&<section className="tn-context"><span>A NIIL ENCONTROU CAMINHOS PARA APROFUNDAR</span>{recomendacoes.map(r=><button key={r.id} onClick={()=>abrirModulo(r.modulo)}><Sparkles size={18}/><div><b>{r.titulo}</b><p>{r.texto}</p></div><ChevronRight size={17}/></button>)}</section>}

    {marco&&<div className="tn-marco-overlay" onClick={()=>setMarco(null)}><div onClick={e=>e.stopPropagation()}><NIILOrb state="done" size={150} label="Marco concluído"/><span>{marco.marco} CONCLUÍDO</span><h2>{marco.nome}</h2><p>Você fechou este marco. O próximo caminho usa o que você acabou de construir — não começa do zero.</p><button onClick={()=>setMarco(null)}>Ver próximo marco</button></div></div>}
  </div>;
}
