import React,{useEffect,useRef}from'react';

export default function Financeiro({d,up}){
  const limpou=useRef(false);

  useEffect(()=>{
    if(limpou.current)return;
    limpou.current=true;
    if(typeof up==='function'){
      up(s=>({...s,financeiro:{}}));
    }
  },[up]);

  return(
    <div style={{padding:'26px 18px 110px',minHeight:'100vh',background:'#FFFFFF'}}>
      <div style={{maxWidth:430,margin:'0 auto'}}>
        <h1 style={{fontSize:24,lineHeight:1.1,margin:0,color:'#17172D'}}>Financeiro</h1>
        <div style={{fontSize:11,color:'#858795',marginTop:6}}>Módulo zerado para reconstrução.</div>
      </div>
    </div>
  );
}
