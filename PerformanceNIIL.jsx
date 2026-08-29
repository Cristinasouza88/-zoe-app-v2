import React,{useMemo,useState}from'react';
import{ArrowLeft,BarChart3,Trophy,Target,Flame,CalendarDays}from'lucide-react';
import{resumoGamificacao,desafiosGamificacao}from'./gamificacao.core.js';

const C={bg:'#F7F8F5',card:'#FFFFFF',ink:'#17151D',muted:'#8B8791',line:'#E7E4EA',green:'#B7F20C',greenDark:'#6C9700',soft:'#F3F9DB'};
const safeObj=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
const safeArr=v=>Array.isArray(v)?v:[];
const pct=(v,max)=>max?Math.max(0,Math.min(100,(Number(v)||0)/(Number(max)||1)*100)):0;

export default function PerformanceNIIL({d={},voltar=()=>{}}){
  const[periodo,setPeriodo]=useState('semana');
  const dias=useMemo(()=>safeObj(d?.dias),[d?.dias]);
  const rodas=useMemo(()=>safeObj(d?.rodas),[d?.rodas]);
  const game=useMemo(()=>{
    try{return resumoGamificacao({...d,gamificacao:safeObj(d?.gamificacao)})}
    catch(e){console.error('NIIL Performance: resumo indisponível',e);return{pontos:0,nivel:1,pct:0,faltam:250,streakAtual:0,pontosPorDia:{},badges:[],ledger:[]}}
  },[d]);
  const desafios=useMemo(()=>{
    try{return safeArr(desafiosGamificacao({...d,gamificacao:safeObj(d?.gamificacao)}))}
    catch(e){console.error('NIIL Performance: desafios indisponíveis',e);return[]}
  },[d]);
  const nd=periodo==='semana'?7:periodo==='mes'?30:90;
  const serie=useMemo(()=>Array.from({length:nd},(_,i)=>{
    const dt=new Date();dt.setHours(12,0,0,0);dt.setDate(dt.getDate()-(nd-1-i));
    const iso=dt.toISOString().slice(0,10),dia=safeObj(dias[iso]);
    return{iso,pts:Number(game?.pontosPorDia?.[iso]||0),agua:Number(dia.agua||0),humor:Number(dia.humor||0)};
  }),[nd,dias,game?.pontosPorDia]);
  const pontosPeriodo=serie.reduce((a,x)=>a+x.pts,0);
  const diasAtivos=serie.filter(x=>x.pts>0).length;
  const mediaHumor=(()=>{const vals=serie.map(x=>x.humor).filter(x=>x>0);return vals.length?(vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1):'—'})();
  const rodasFeitas=Object.keys(rodas).filter(k=>safeObj(rodas[k])&&Object.keys(safeObj(rodas[k])).length);
  const badges=safeArr(game?.badges);

  const card={background:C.card,border:`1px solid ${C.line}`,borderRadius:22,padding:16,boxShadow:'0 8px 24px rgba(23,21,29,.045)'};
  return <div style={{minHeight:'100vh',background:C.bg,color:C.ink,paddingBottom:28,fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif'}}>
    <header style={{position:'sticky',top:0,zIndex:4,background:'rgba(247,248,245,.96)',backdropFilter:'blur(12px)',padding:'14px 16px 12px',borderBottom:`1px solid ${C.line}`}}>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <button onClick={voltar} aria-label="Voltar ao início" style={{width:44,height:44,borderRadius:14,border:`1px solid ${C.line}`,background:'#fff',display:'grid',placeItems:'center',color:C.ink}}><ArrowLeft size={20}/></button>
        <div style={{flex:1}}><h1 style={{fontSize:23,margin:0,fontWeight:850}}>Performance</h1><p style={{fontSize:12,margin:'3px 0 0',color:C.muted}}>Sua evolução integrada no NIIL.</p></div>
        <div style={{width:44,height:44,borderRadius:14,background:C.green,display:'grid',placeItems:'center'}}><BarChart3 size={21}/></div>
      </div>
      <div style={{display:'flex',background:'#fff',border:`1px solid ${C.line}`,borderRadius:14,padding:4,marginTop:14}}>
        {[['semana','Semana'],['mes','Mês'],['tri','3 meses']].map(([k,l])=><button key={k} onClick={()=>setPeriodo(k)} style={{flex:1,padding:10,border:0,borderRadius:10,fontWeight:800,background:periodo===k?C.green:'transparent',color:C.ink}}>{l}</button>)}
      </div>
    </header>

    <main style={{padding:16,display:'grid',gap:14}}>
      <section style={{...card,background:C.ink,color:'#fff'}}>
        <div style={{display:'flex',justifyContent:'space-between',gap:12}}><div><small style={{color:'#B9B7BD',fontWeight:800,letterSpacing:1}}>NÍVEL NIIL</small><div style={{fontSize:30,fontWeight:900,marginTop:4}}>Nível {Number(game?.nivel||1)}</div><div style={{fontSize:12,color:'#C8C6CC'}}>{Number(game?.pontos||0).toLocaleString('pt-BR')} Pontos NIIL</div></div><div style={{width:54,height:54,borderRadius:18,background:C.green,color:C.ink,display:'grid',placeItems:'center'}}><Trophy size={25}/></div></div>
        <div style={{height:7,borderRadius:99,background:'#343239',overflow:'hidden',marginTop:17}}><div style={{height:'100%',width:`${Number(game?.pct||0)}%`,background:C.green,borderRadius:99}}/></div>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'#AAA7AF',marginTop:7}}><span>{Math.round(Number(game?.pct||0))}% deste nível</span><span>{Number(game?.faltam||0)} pts para o próximo</span></div>
      </section>

      <section style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:9}}>
        {[[pontosPeriodo,'Pontos'],[diasAtivos,'Dias ativos'],[Number(game?.streakAtual||0),'Sequência']].map(([v,l])=><div key={l} style={{...card,textAlign:'center',padding:13}}><strong style={{fontSize:22}}>{v}</strong><div style={{fontSize:10.5,color:C.muted,marginTop:3}}>{l}</div></div>)}
      </section>

      <section style={card}><div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}><div><strong>Desafios ativos</strong><div style={{fontSize:10.5,color:C.muted,marginTop:2}}>Comportamentos reais, não tempo de tela.</div></div><Target size={20}/></div>{desafios.length?desafios.map((x,i)=><div key={x.id||i} style={{padding:'11px 0',borderTop:i?`1px solid ${C.line}`:'none'}}><div style={{display:'flex',justifyContent:'space-between',gap:10}}><div><div style={{fontSize:12.5,fontWeight:800}}>{x.titulo}</div><div style={{fontSize:10,color:C.muted,marginTop:2}}>{x.descricao}</div></div><strong style={{fontSize:10,color:x.concluido?C.greenDark:C.muted}}>{x.atual||0}/{x.meta||0}</strong></div><div style={{height:6,borderRadius:99,background:'#ECEDE9',overflow:'hidden',marginTop:8}}><div style={{height:'100%',width:`${Number(x.pct||0)}%`,background:C.green}}/></div></div>):<div style={{fontSize:12,color:C.muted}}>Os desafios aparecem conforme você registra movimentos no NIIL.</div>}</section>

      <section style={card}><div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}><strong>Resumo do período</strong><CalendarDays size={19}/></div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9}}><div style={{background:C.soft,borderRadius:16,padding:13}}><small style={{color:C.muted}}>Humor médio</small><div style={{fontSize:22,fontWeight:900,marginTop:4}}>{mediaHumor}</div></div><div style={{background:C.soft,borderRadius:16,padding:13}}><small style={{color:C.muted}}>Checkpoints da Roda</small><div style={{fontSize:22,fontWeight:900,marginTop:4}}>{rodasFeitas.length}</div></div></div></section>

      <section style={card}><div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}><strong>Selos conquistados</strong><Trophy size={19}/></div>{badges.length?<div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>{badges.slice(0,8).map((b,i)=><div key={b.id||i} style={{textAlign:'center'}}><div style={{width:48,height:48,margin:'0 auto 7px',borderRadius:16,background:C.green,display:'grid',placeItems:'center',fontWeight:900}}>ii</div><div style={{fontSize:9,fontWeight:800,lineHeight:1.2}}>{b.titulo||'Selo NIIL'}</div></div>)}</div>:<div style={{fontSize:12,color:C.muted}}>Seu primeiro selo aparece quando uma ação real de evolução for registrada.</div>}</section>

      <section style={card}><div style={{display:'flex',gap:9,alignItems:'flex-start'}}><Flame size={18}/><div><strong style={{fontSize:13}}>Performance sem pressão</strong><div style={{fontSize:11,color:C.muted,lineHeight:1.5,marginTop:3}}>O NIIL mostra evolução, consistência e contexto. Métricas corporais ou financeiras não valem mais pontos só por serem maiores.</div></div></div></section>
    </main>
  </div>;
}
