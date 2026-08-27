import React,{useMemo,useState}from'react';
import{CalendarDays,ChevronLeft,ChevronRight,Flame,Trophy,Sparkles,BookOpen,Target,Check,Circle,Plus,X}from'lucide-react';
import{C,hoje}from'./ui.jsx';
import'./AgendaLeve.css';

export default function AgendaLeve({d,data,setData,agendaAtiva,toggleTarefaDe,streak,setAba,up}){
  const[mesAberto,setMesAberto]=useState(false);
  const base=new Date(data+'T12:00');
  const planoNIIL=d.jornada?.planoSemana;
  const nomeDia=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][base.getDay()];
  const planoNesteDia=planoNIIL?.ativo&&planoNIIL.dias?.includes(nomeDia);
  const marcas=d.agenda[data]||{};
  const tarefas=agendaAtiva?.tarefas||[];
  const eventosCursos=(d.agendaCursos||[]).filter(e=>{
    if(e.data!==data)return false;
    const curso=(d.cursos||[]).find(c=>c.id===e.cursoId);
    if(!curso)return false;
    const indice=curso.aulas.findIndex(a=>a.id===e.aulaId);
    const atual=curso.aulas.findIndex(a=>!a.feito);
    return e.feito||indice===atual;
  });
  const reflexoesCursos=(d.cursos||[]).flatMap(c=>c.aulas||[]).filter(a=>a.avaliacao).length;
  const fasesConcluidas=(d.cursos||[]).reduce((total,c)=>total+Object.keys(c.recompensas||{}).length,0);

  const inicioSemana=new Date(base);
  inicioSemana.setDate(inicioSemana.getDate()-((inicioSemana.getDay()+6)%7));
  const semana=Array.from({length:7},(_,i)=>{
    const dt=new Date(inicioSemana);dt.setDate(inicioSemana.getDate()+i);
    const iso=dt.toISOString().slice(0,10);
    const tem=Object.values(d.agenda[iso]||{}).some(Boolean)||(d.agendaCursos||[]).some(e=>e.data===iso);
    return{iso,n:dt.getDate(),dia:['D','S','T','Q','Q','S','S'][dt.getDay()],tem};
  });

  const inicioMes=new Date(base.getFullYear(),base.getMonth(),1,12);
  const grade=new Date(inicioMes);grade.setDate(1-((inicioMes.getDay()+6)%7));
  const diasMes=Array.from({length:42},(_,i)=>{
    const dt=new Date(grade);dt.setDate(grade.getDate()+i);
    const iso=dt.toISOString().slice(0,10);
    return{iso,n:dt.getDate(),atual:dt.getMonth()===base.getMonth(),tem:Object.values(d.agenda[iso]||{}).some(Boolean)||(d.agendaCursos||[]).some(e=>e.data===iso)};
  });

  const itens=[];
  if(planoNesteDia)itens.push({
    id:'niil-experimento',tipo:'niil',titulo:planoNIIL.acao,
    detalhe:(planoNIIL.hora||'Hoje')+' · '+(planoNIIL.duracao||0)+' min',
    feito:!!marcas['niil-experimento'],I:Sparkles,cor:C.lilac,
    acao:()=>up(s=>({...s,agenda:{...s.agenda,[data]:{...(s.agenda[data]||{}),'niil-experimento':!(s.agenda[data]||{})['niil-experimento']}}}))
  });
  eventosCursos.forEach(e=>itens.push({
    id:'curso-'+e.id,tipo:'curso',titulo:e.titulo,detalhe:(e.modulo||'Curso')+' · '+e.hora,
    feito:!!e.feito,I:BookOpen,cor:C.lilac,abrir:true,acao:()=>setAba('cursos')
  }));
  tarefas.forEach((t,i)=>itens.push({
    id:'tarefa-'+i,tipo:'missao',titulo:t.t,detalhe:(t.hora||'Ao longo do dia')+' · '+t.p+' pontos',
    feito:!!marcas[agendaAtiva.id+'-'+i],I:Target,cor:C.green,acao:()=>toggleTarefaDe(agendaAtiva,i)
  }));

  const concluidas=itens.filter(x=>x.feito).length;
  const total=itens.length;
  const progresso=total?Math.round(concluidas/total*100):0;
  const primeiraPendente=itens.findIndex(x=>!x.feito);

  const moverSemana=dir=>{const x=new Date(base);x.setDate(x.getDate()+dir*7);setData(x.toISOString().slice(0,10))};
  const moverMes=dir=>{const x=new Date(base);x.setMonth(x.getMonth()+dir);setData(x.toISOString().slice(0,10))};

  return <div className="agx-page">
    <header className="agx-head">
      <div><span>AGENDA</span><h1>Seu dia</h1></div>
      <button onClick={()=>setMesAberto(true)} aria-label="Abrir mês"><CalendarDays size={20}/></button>
    </header>

    <section className="agx-week agx-enter">
      <div className="agx-week-head">
        <button onClick={()=>moverSemana(-1)}><ChevronLeft size={17}/></button>
        <div><strong>{base.toLocaleDateString('pt-BR',{month:'long',year:'numeric'})}</strong><button onClick={()=>setData(hoje())}>VOLTAR PARA HOJE</button></div>
        <button onClick={()=>moverSemana(1)}><ChevronRight size={17}/></button>
      </div>
      <div className="agx-days">
        {semana.map(x=>{
          const sel=x.iso===data,ehHoje=x.iso===hoje();
          return <button key={x.iso} onClick={()=>setData(x.iso)} className={(sel?'on ':'')+(ehHoje?'today':'')}>
            <span>{x.dia}</span><strong>{x.n}</strong><i className={x.tem?'has':''}/>
          </button>
        })}
      </div>
    </section>

    <section className="agx-coach agx-enter">
      <div className="agx-coach-copy">
        <div className="agx-streak"><Flame size={14}/><b>{streak}</b><span>dias</span></div>
        <h2>{total?(progresso===100?'Tudo concluído por hoje.':concluidas?'Você já fez '+concluidas+' de '+total+'.':'Um passo de cada vez.'):'Seu dia está livre.'}</h2>
        <p>{total?(progresso===100?'O restante do dia fica livre para você.':'A próxima missão fica destacada. Ao concluir, o dia se reorganiza.'):'Quando uma trilha gerar uma missão, ela aparece aqui.'}</p>
        {total>0&&<div className="agx-progress"><div style={{width:progresso+'%'}}/></div>}
      </div>
    </section>

    {itens.length?<>
      <div className="agx-section-title"><div><span>MISSÕES DE HOJE</span><h2>O que vem agora</h2></div><b>{concluidas}/{total}</b></div>
      <div className="agx-list">
        {itens.map((item,i)=>{
          const I=item.I,on=item.feito,ativa=i===primeiraPendente;
          return <button key={item.id} onClick={item.acao} className={'agx-task '+(on?'done ':'')+(ativa?'next ':'')}>
            <div className="agx-task-icon">{on?<Check size={21}/>:<I size={20}/>}</div>
            <div className="agx-task-copy">{ativa&&!on&&<span>PRÓXIMA</span>}<strong>{item.titulo}</strong><small>{item.detalhe}</small></div>
            <div className="agx-task-end">{on?<Check size={15}/>:item.abrir?<ChevronRight size={15}/>:<Circle size={13}/>}</div>
          </button>
        })}
      </div>
    </>:<section className="agx-empty agx-enter"><Sparkles size={25}/><h3>Nada obrigatório por aqui.</h3><p>Sua agenda não precisa ficar cheia para estar funcionando.</p></section>}

    <div className="agx-section-title rhythm"><div><span>SEU RITMO</span><h2>Pequenas conquistas</h2></div></div>
    <div className="agx-stats">
      {[{n:streak,t:'dias',I:Flame},{n:fasesConcluidas,t:'fases',I:Trophy},{n:reflexoesCursos,t:'reflexões',I:Sparkles}].map((x,i)=><div key={x.t} className="agx-stat" style={{animationDelay:(i*50)+'ms'}}><span><x.I size={17}/></span><strong>{x.n}</strong><small>{x.t}</small></div>)}
    </div>

    {mesAberto&&<div className="agx-overlay" onClick={()=>setMesAberto(false)}>
      <div className="agx-sheet" onClick={e=>e.stopPropagation()}>
        <div className="agx-sheet-head"><div><span>CALENDÁRIO</span><h2>Escolher uma data</h2></div><button onClick={()=>setMesAberto(false)}><X size={19}/></button></div>
        <div className="agx-month-head"><button onClick={()=>moverMes(-1)}><ChevronLeft size={18}/></button><strong>{base.toLocaleDateString('pt-BR',{month:'long',year:'numeric'})}</strong><button onClick={()=>moverMes(1)}><ChevronRight size={18}/></button></div>
        <div className="agx-week-labels">{['S','T','Q','Q','S','S','D'].map((x,i)=><span key={i}>{x}</span>)}</div>
        <div className="agx-month-grid">{diasMes.map(x=><button key={x.iso} onClick={()=>{setData(x.iso);setMesAberto(false)}} className={(x.iso===data?'on ':'')+(x.iso===hoje()?'today ':'')+(!x.atual?'outside':'')}><span>{x.n}</span>{x.tem&&<i/>}</button>)}</div>
      </div>
    </div>}
  </div>
}
