import React from 'react';
import * as Base from './NiilUIBase.jsx';

Object.assign(Base.C,{
  bg:'#F7F8F5',card:'#FFFFFF',petroleo:'#B7F20C',petroleoEsc:'#6C9700',carvao:'#17151D',
  ink:'#17151D',ink2:'#5F5A66',ink3:'#8B8791',line:'#E7E4EA',
  azul:'#5B2D86',aqua:'#F3F9DB',aquaSuave:'#F3F9DB',
  lima:'#B7F20C',limaSuave:'#F3F9DB',lilas:'#EEE7F7',roxo:'#5B2D86',roxoEletrico:'#6C46C8',
  laranja:'#FF8A3D'
});
Object.defineProperties(Base.C,{
  green:{get(){return this.petroleo},configurable:true},
  greenDark:{get(){return this.petroleoEsc},configurable:true},
  mint:{get(){return this.aquaSuave},configurable:true},
  sky:{get(){return this.azul},configurable:true},
  gold:{get(){return this.laranja},configurable:true},
  coral:{get(){return this.laranja},configurable:true},
  lilac:{get(){return this.roxo},configurable:true}
});
Base.C.plum='#5B2D86';Base.C.mist='#EEE7F7';Base.C.cloud='#F7F8F5';Base.C.soft='#F3F9DB';

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
export const CLARAS=['#B7F20C','#F3F9DB','#EEE7F7','#F7F8F5','#FF8A3D','#FFFFFF','#fff','#FFF'];
export const sobre=cor=>CLARAS.includes(cor)?C.ink:'#fff';

export const CSS=Base.CSS+`
:root{--niil-green:#B7F20C;--niil-green-dark:#6C9700;--niil-green-soft:#F3F9DB;--niil-plum:#5B2D86;--niil-lilac:#6C46C8;--niil-mist:#EEE7F7;--niil-orange:#FF8A3D;--niil-cloud:#F7F8F5;--niil-ink:#17151D;--niil-muted:#8B8791;--niil-line:#E7E4EA;--niil-soft:#F3F9DB;--niil-lime:#B7F20C}
html,body,#root{background:var(--niil-cloud)!important;color:var(--niil-ink)}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
.niil-surge{animation-name:niilSurge}
::selection{background:var(--niil-mist);color:var(--niil-plum)}
`;

// Wordmark oficial NIIL: letras lilás, dois pontos lime e terminal curvo no “l”.
export function Wordmark({altura=54,cor='#5B2D86',corPontos='#B7F20C'}){
  return <svg viewBox="0 0 420 190" style={{height:altura,display:'block',overflow:'visible'}} role="img" aria-label="niil">
    <g fill="none" stroke={cor} strokeWidth="28" strokeLinecap="round" strokeLinejoin="round">
      <path d="M28 160V92C28 48 61 26 103 26s75 22 75 66v68"/>
      <path d="M236 70v90"/>
      <path d="M304 70v90"/>
      <path d="M370 25v112c0 15 9 23 24 23"/>
    </g>
    <circle cx="236" cy="24" r="15" fill={corPontos}/>
    <circle cx="304" cy="24" r="15" fill={corPontos}/>
  </svg>;
}
