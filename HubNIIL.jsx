import React from 'react';
import { X, Droplets, Dumbbell, Utensils, Moon, Camera, Bell, BookOpen, Trophy, Compass, CalendarDays, Timer } from 'lucide-react';
import { C } from './ui.jsx';

export default function HubNIIL({fechar,dia,setDia,aviso,setSheet,setAba,up,d}){
  const registrar=[
    [Droplets,'Água','+250 ml',C.sky,()=>{setDia({agua:(dia.agua||0)+250});aviso('+250 ml');fechar()}],
    [Dumbbell,'Treino','movimento',C.lilac,()=>{fechar();setSheet('treino')}],
    [Utensils,'Refeição','alimentação',C.green,()=>{fechar();setAba('comida')}],
    [Moon,'Sono','registrar noite',C.lilac,()=>{fechar();setAba('sono')}],
    [Camera,'Foto','diário',C.sky,()=>{fechar();setAba('diario')}],
    [Bell,'Lembrete','organizar depois',C.gold,()=>{fechar();setAba('extras')}]
  ];
  const navegar=[
    ['cursos','Cursos',BookOpen,C.lilac],
    ['sono','Sono',Moon,C.lilac],
    ['diario','Feed',Camera,C.sky],
    ['conquistas','Conquistas',Trophy,C.gold],
    ['extras','Apoio',Compass,C.lilac],
    ['agenda','Agenda',CalendarDays,C.green]
  ];

  return <div onClick={fechar} style={{position:'fixed',inset:0,zIndex:80,background:'rgba(47,37,69,.26)',backdropFilter:'blur(7px)',display:'flex',alignItems:'flex-end',justifyContent:'center'}}>
    <div onClick={e=>e.stopPropagation()} style={{width:'100%',maxWidth:520,maxHeight:'88vh',overflowY:'auto',background:'#F8F6F2',borderRadius:'28px 28px 0 0',padding:'12px 16px 28px',boxShadow:'0 -18px 50px rgba(47,37,69,.18)'}}>
      <div style={{width:42,height:5,borderRadius:99,background:'#D4CED7',margin:'0 auto 14px'}}/>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <div><div style={{fontSize:9,fontWeight:900,letterSpacing:1,color:C.lilac}}>HUB NIIL</div><h2 style={{margin:'4px 0 0',fontSize:22,color:C.ink}}>O que você quer fazer?</h2></div>
        <button onClick={fechar} style={{width:38,height:38,border:0,borderRadius:14,background:'#EEE9F1',color:C.ink,display:'grid',placeItems:'center'}}><X size={19}/></button>
      </div>

      <div style={{fontSize:10,fontWeight:900,letterSpacing:.9,color:C.lilac,margin:'0 2px 9px'}}>REGISTRAR AGORA</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginBottom:18}}>
        {registrar.map(([Icone,nome,sub,cor,fn],i)=><button key={nome} onClick={fn} className="niil-surge" style={{animationDelay:(i*35)+'ms',minHeight:78,border:'1px solid #E4DFE6',borderRadius:18,background:'#fff',padding:12,display:'grid',gridTemplateColumns:'38px 1fr',gap:9,alignItems:'center',textAlign:'left',fontFamily:'inherit'}}>
          <span style={{width:38,height:38,borderRadius:13,background:cor+'18',color:cor,display:'grid',placeItems:'center'}}><Icone size={18}/></span>
          <span><b style={{display:'block',fontSize:12.5,color:C.ink}}>{nome}</b><small style={{display:'block',fontSize:8.5,color:C.ink3,marginTop:2}}>{sub}</small></span>
        </button>)}
      </div>

      <div style={{fontSize:10,fontWeight:900,letterSpacing:.9,color:C.lilac,margin:'0 2px 9px'}}>IR PARA</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:12}}>
        {navegar.map(([id,nome,Icone,cor])=><button key={id} onClick={()=>{setAba(id);fechar()}} style={{border:'1px solid #E4DFE6',borderRadius:17,background:'#fff',padding:'12px 7px',display:'grid',placeItems:'center',gap:6,fontFamily:'inherit',color:C.ink}}>
          <span style={{width:34,height:34,borderRadius:12,background:cor+'16',color:cor,display:'grid',placeItems:'center'}}><Icone size={17}/></span>
          <span style={{fontSize:9.5,fontWeight:800}}>{nome}</span>
        </button>)}
      </div>

      <button onClick={()=>{if(d.jejum){up(s=>({...s,jejum:null}));aviso('Jejum encerrado')}else{up(s=>({...s,jejum:{inicio:Date.now(),metaHoras:16}}));aviso('Jejum iniciado')}fechar()}} style={{width:'100%',border:'1px solid #E4DFE6',borderRadius:16,background:'#fff',padding:13,fontFamily:'inherit',color:C.ink,display:'flex',alignItems:'center',justifyContent:'center',gap:8,fontWeight:800,fontSize:11}}>
        <Timer size={17} color={C.gold}/>{d.jejum?'Encerrar jejum':'Começar jejum'}
      </button>
    </div>
  </div>;
}
