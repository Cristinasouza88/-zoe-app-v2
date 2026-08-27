import React from 'react';
import * as Base from './NiilUIBase.jsx';

Object.assign(Base.C,{
  bg:'#F7F8F5',card:'#FFFFFF',petroleo:'#17151D',petroleoEsc:'#6C9700',carvao:'#17151D',
  ink:'#17151D',ink2:'#5F5A66',ink3:'#8B8791',line:'#E7E4EA',
  azul:'#17151D',aqua:'#F3F9DB',aquaSuave:'#F3F9DB',
  lima:'#B7F20C',limaSuave:'#F3F9DB',lilas:'#B7F20C',roxo:'#17151D',roxoEletrico:'#6C9700',
  laranja:'#FF8A3D'
});
Object.defineProperties(Base.C,{
  green:{get(){return this.lima},configurable:true},
  greenDark:{get(){return this.petroleoEsc},configurable:true},
  mint:{get(){return this.aquaSuave},configurable:true},
  sky:{get(){return this.petroleoEsc},configurable:true},
  gold:{get(){return this.petroleo},configurable:true},
  coral:{get(){return this.laranja},configurable:true},
  lilac:{get(){return this.petroleoEsc},configurable:true}
});
Base.C.plum='#17151D';Base.C.mist='#F3F9DB';Base.C.cloud='#F7F8F5';Base.C.soft='#F3F9DB';

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
export const CLARAS=['#B7F20C','#F3F9DB','#F7F8F5','#FF8A3D','#FFFFFF','#fff','#FFF'];
export const sobre=cor=>CLARAS.includes(cor)?C.ink:'#fff';

export const CSS=Base.CSS+`
:root{--niil-green:#B7F20C;--niil-green-dark:#6C9700;--niil-green-soft:#F3F9DB;--niil-plum:#17151D;--niil-lilac:#6C9700;--niil-mist:#F3F9DB;--niil-orange:#FF8A3D;--niil-cloud:#F7F8F5;--niil-ink:#17151D;--niil-muted:#8B8791;--niil-line:#E7E4EA;--niil-soft:#F3F9DB;--niil-lime:#B7F20C}
html,body,#root{background:var(--niil-cloud)!important;color:var(--niil-ink)}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
.niil-surge{animation-name:niilSurge}
::selection{background:var(--niil-green-soft);color:var(--niil-ink)}
:focus-visible{outline:3px solid rgba(183,242,12,.55);outline-offset:2px}
`;

// Wordmark oficial NIIL: forma preservada; aplicação padrão em grafite com pontos verdes.
export function Wordmark({altura=54,cor='#17151D',corPontos='#B7F20C'}){
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
