import React from 'react';
import { CalendarDays, Heart, Flame, Bell } from 'lucide-react';
import { C, hoje } from './ui.jsx';

export default function HomeTopActions({d,agendaAtiva,pontosDia,streak,usuario,setAba,setData,setSheet,permissao,contaIcon}){
  const hojeIso=hoje();
  const marcasHoje=d.agenda?.[hojeIso]||{};
  const tarefas=agendaAtiva?.tarefas||[];
  const cursos=(d.agendaCursos||[]).filter(e=>e.data===hojeIso);
  const dt=new Date(hojeIso+'T12:00');
  const nomeDia=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][dt.getDay()];
  const planoHoje=!!(d.jornada?.planoSemana?.ativo&&d.jornada.planoSemana.dias?.includes(nomeDia));
  const total=tarefas.length+cursos.length+(planoHoje?1:0);
  const feitas=
    tarefas.filter((_,i)=>!!marcasHoje[(agendaAtiva?.id||'')+'-'+i]).length+
    cursos.filter(e=>e.feito).length+
    (planoHoje&&marcasHoje['niil-experimento']?1:0);
  const pendente=total>0&&feitas<total;

  return <div className="niil-top-wrap">
    <style>{'@keyframes niilAgendaNudge{0%,82%,100%{transform:translateY(0) scale(1)}86%{transform:translateY(-5px) scale(1.025)}90%{transform:translateY(0) scale(1)}94%{transform:translateY(-3px) scale(1.015)}}.niil-agenda-priority{animation:niilAgendaNudge 4.8s ease-in-out infinite}.niil-top-action:active{transform:scale(.95)}@media(prefers-reduced-motion:reduce){.niil-agenda-priority{animation:none!important}}'}</style>
    <div style={{display:'flex',alignItems:'center',marginBottom:10}}>
      <button onClick={()=>setSheet('perfil')} aria-label="Abrir menu da conta" style={{width:42,height:42,border:'none',borderRadius:15,background:'#fff',boxShadow:'0 5px 16px rgba(24,42,65,.08)',display:'grid',placeItems:'center',overflow:'hidden',padding:2}}>{contaIcon}</button>
      <div style={{flex:1,marginLeft:10,fontSize:17,fontWeight:800,color:C.ink,minWidth:0,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>Olá, {d.perfil?.nome||usuario?.nome} <span aria-hidden="true">👋</span></div>
    </div>

    <div style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) 44px 44px 44px',gap:7,alignItems:'center'}}>
      <button className={'niil-top-action '+(pendente?'niil-agenda-priority':'')} onClick={()=>{setData(hojeIso);setAba('agenda')}} style={{minHeight:44,border:pendente?'1.5px solid #9B8DD3':'1px solid #E4DFE6',borderRadius:15,background:pendente?'#F2EEF8':'#fff',color:C.ink,display:'flex',alignItems:'center',gap:8,padding:'7px 10px',fontFamily:'inherit',boxShadow:pendente?'0 7px 18px rgba(155,141,211,.12)':'0 5px 14px rgba(47,37,69,.04)',position:'relative',transition:'transform .15s'}}>
        <span style={{width:30,height:30,borderRadius:10,background:pendente?C.lilac:'#EEEAF1',color:pendente?'#fff':C.lilac,display:'grid',placeItems:'center',flex:'none'}}><CalendarDays size={16}/></span>
        <span style={{textAlign:'left',minWidth:0}}><b style={{display:'block',fontSize:11.5,color:C.ink}}>Hoje</b><small style={{display:'block',fontSize:8.5,color:C.ink3,marginTop:1}}>{total?feitas+'/'+total+' missões':'agenda livre'}</small></span>
        {pendente&&<span style={{position:'absolute',right:7,top:7,width:7,height:7,borderRadius:99,background:C.lima,boxShadow:'0 0 0 3px rgba(201,229,108,.18)'}}/>}
      </button>

      <div title="Pontos do dia" style={{height:44,borderRadius:14,background:'#fff',border:'1px solid #E4DFE6',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:C.green,fontWeight:850,fontSize:9,boxShadow:'0 4px 12px rgba(47,37,69,.03)'}}><Heart size={16}/><span>{pontosDia}</span></div>

      <button className="niil-top-action" onClick={()=>setAba('progresso')} aria-label="Abrir Performance" style={{height:44,border:'1px solid #E4DFE6',borderRadius:14,background:'#fff',color:C.ink,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',fontFamily:'inherit',fontWeight:850,fontSize:9,boxShadow:'0 4px 12px rgba(47,37,69,.03)',transition:'transform .15s'}}><Flame size={17} color={C.coral}/><span>{streak}</span></button>

      <button className="niil-top-action" onClick={permissao} aria-label="Notificações" style={{position:'relative',height:44,border:'1px solid #E4DFE6',borderRadius:14,background:'#fff',color:C.ink,display:'grid',placeItems:'center',boxShadow:'0 4px 12px rgba(47,37,69,.03)',transition:'transform .15s'}}><Bell size={18}/><span style={{position:'absolute',right:-2,top:-3,minWidth:17,height:17,borderRadius:99,background:'#F15A3C',color:'#fff',fontSize:9,display:'grid',placeItems:'center',border:'2px solid #fff'}}>2</span></button>
    </div>
  </div>;
}
