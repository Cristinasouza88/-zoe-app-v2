import React from 'react';
import * as Base from './NiilUIBase.jsx';

Object.assign(Base.C,{
  bg:'#F8F6F2',card:'#FFFFFF',petroleo:'#2F2545',petroleoEsc:'#251D37',carvao:'#1E1927',
  ink:'#2C2834',ink2:'#625B69',ink3:'#817A89',line:'#E4DFE6',
  azul:'#9B8DD3',aqua:'#DDD6F2',aquaSuave:'#F1EEF7',
  lima:'#C9E56C',limaSuave:'#F4F8E8',lilas:'#DDD6F2',roxo:'#9B8DD3',roxoEletrico:'#7568B5'
});
Object.defineProperties(Base.C,{
  green:{get(){return this.plum||this.petroleo},configurable:true},
  greenDark:{get(){return this.petroleoEsc},configurable:true},
  mint:{get(){return this.aquaSuave},configurable:true},
  sky:{get(){return this.azul},configurable:true},
  gold:{get(){return this.lima},configurable:true},
  coral:{get(){return this.lilas},configurable:true},
  lilac:{get(){return this.roxo},configurable:true}
});
Base.C.plum='#2F2545';Base.C.mist='#DDD6F2';Base.C.cloud='#F8F6F2';Base.C.soft='#F1EEF7';

export const C=Base.C;
export const store=Base.store;
export const hoje=Base.hoje;
export const Card=Base.Card;
export const Btn=Base.Btn;
export const Campo=Base.Campo;
export const Area=Base.Area;
export const Barra=Base.Barra;
export const Sheet=Base.Sheet;
export const Foto=Base.Foto;
export const GraficoBarras=Base.GraficoBarras;
export const GraficoLinha=Base.GraficoLinha;
export const CLARAS=['#C9E56C','#DDD6F2','#F1EEF7','#F8F6F2','#FFFFFF','#fff','#FFF'];
export const sobre=cor=>CLARAS.includes(cor)?C.ink:'#fff';

export const CSS=Base.CSS+`
:root{--niil-plum:#2F2545;--niil-lilac:#9B8DD3;--niil-mist:#DDD6F2;--niil-lime:#C9E56C;--niil-cloud:#F8F6F2;--niil-ink:#2C2834;--niil-muted:#817A89;--niil-line:#E4DFE6;--niil-soft:#F1EEF7}
html,body,#root{background:var(--niil-cloud)!important;color:var(--niil-ink)}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
.niil-surge{animation-name:niilSurge}
::selection{background:var(--niil-mist);color:var(--niil-plum)}
`;

export function Wordmark({altura=54,cor='#9B8DD3'}){
  return <svg viewBox="0 0 420 190" style={{height:altura,display:'block',overflow:'visible'}} role="img" aria-label="niil">
    <g fill="none" stroke={cor} strokeWidth="30" strokeLinecap="round" strokeLinejoin="round">
      <path d="M28 164V91C28 43 65 24 104 24s76 19 76 67v73"/>
      <path d="M244 79v85"/><path d="M313 79v85"/><path d="M382 25v139"/>
    </g>
    <circle cx="244" cy="29" r="15" fill={cor}/><circle cx="313" cy="29" r="15" fill={cor}/>
  </svg>;
}
