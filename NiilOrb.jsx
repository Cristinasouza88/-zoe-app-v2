import React from 'react';
import orbOficial from './niil-orb-official.png';

const css=`@keyframes niilOrbBreath{0%,100%{transform:scale(1)}50%{transform:scale(1.025)}}@media(prefers-reduced-motion:reduce){.niil-orb-official{animation:none!important}}`;

export default function NiilOrb({size=112,active=true,style,label='NIIL Voice'}){
  return <><style>{css}</style><div className="niil-orb-official" role="img" aria-label={label} style={{width:size,height:size,position:'relative',overflow:'hidden',borderRadius:'50%',animation:active?'niilOrbBreath 5s ease-in-out infinite':'none',...style}}>
    <img src={orbOficial} alt="" aria-hidden="true" style={{position:'absolute',width:'164%',height:'164%',maxWidth:'none',left:'50%',top:'50%',transform:'translate(-50%,-49%)',objectFit:'cover',display:'block'}}/>
  </div></>;
}
