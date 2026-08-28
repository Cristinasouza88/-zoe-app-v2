import React from 'react';
import { Trophy, Lock, Check, Flame, Target } from 'lucide-react';
import { C, Card, Barra } from './ui.jsx';
import { BADGES_NIIL, desafiosGamificacao, resumoGamificacao } from './gamificacao.core.js';

export default function Conquistas({ d }) {
  const game=resumoGamificacao(d);
  const desafios=desafiosGamificacao(d);
  const desbloqueados=new Map((game.badges||[]).map(b=>[b.id,b]));

  return (
    <div style={{ padding: '20px 16px 110px', maxWidth: 520, margin: '0 auto' }}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4}}>
        <Trophy size={22} color={C.greenDark}/>
        <h1 style={{fontSize:24,fontWeight:800,color:C.ink,margin:0}}>Conquistas</h1>
      </div>
      <p style={{color:C.ink2,fontSize:13.5,margin:'0 0 16px'}}>Selos, consistência e desafios ligados à sua evolução real.</p>

      <Card style={{marginBottom:14,background:C.ink,color:'#fff',borderRadius:22}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,textAlign:'center'}}>
          <div><strong style={{display:'block',fontSize:22}}>{game.pontos}</strong><small style={{fontSize:9,color:'#BEBBC2'}}>Pontos NIIL</small></div>
          <div><strong style={{display:'block',fontSize:22}}>{game.nivel}</strong><small style={{fontSize:9,color:'#BEBBC2'}}>Nível</small></div>
          <div><strong style={{display:'flex',justifyContent:'center',alignItems:'center',gap:4,fontSize:22}}><Flame size={18} color={C.green}/>{game.streakAtual}</strong><small style={{fontSize:9,color:'#BEBBC2'}}>Sequência</small></div>
        </div>
      </Card>

      <div style={{display:'flex',alignItems:'center',gap:7,margin:'18px 0 9px'}}>
        <Target size={17} color={C.greenDark}/><h2 style={{fontSize:16,margin:0,color:C.ink}}>Desafios ativos</h2>
      </div>
      {desafios.map((x,i)=><Card key={x.id} style={{marginBottom:10,padding:14}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:10}}>
          <div><div style={{fontSize:13.5,fontWeight:800,color:C.ink}}>{x.titulo}</div><div style={{fontSize:10.5,color:C.ink3,marginTop:3}}>{x.descricao}</div></div>
          <strong style={{fontSize:10,color:x.concluido?C.greenDark:C.ink3}}>{x.atual}/{x.meta}</strong>
        </div>
        <div style={{marginTop:9}}><Barra v={x.atual} max={x.meta} cor={C.green}/></div>
      </Card>)}

      <div style={{display:'flex',alignItems:'center',gap:7,margin:'20px 0 9px'}}>
        <Trophy size={17} color={C.greenDark}/><h2 style={{fontSize:16,margin:0,color:C.ink}}>Coleção de selos</h2>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        {BADGES_NIIL.map(meta=>{
          const b=desbloqueados.get(meta.id),on=!!b;
          return <Card key={meta.id} style={{padding:13,opacity:on?1:.55}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{
                width:48,height:48,flex:'0 0 auto',
                clipPath:'polygon(25% 7%,75% 7%,100% 50%,75% 93%,25% 93%,0 50%)',
                background:on?C.green:'#E9EAE6',color:on?C.ink:C.ink3,
                display:'grid',placeItems:'center',fontWeight:900
              }}>{on?'ii':<Lock size={16}/>}</div>
              <div style={{minWidth:0}}>
                <div style={{fontSize:11.5,fontWeight:850,color:C.ink}}>{meta.titulo}</div>
                <div style={{fontSize:8.5,lineHeight:1.3,color:C.ink3,marginTop:3}}>{meta.descricao}</div>
                {on&&<div style={{fontSize:8,color:C.greenDark,fontWeight:800,marginTop:5,display:'flex',alignItems:'center',gap:3}}><Check size={11}/> conquistado</div>}
              </div>
            </div>
          </Card>
        })}
      </div>
    </div>
  );
}
