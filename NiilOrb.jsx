import React from 'react';
import orbOficial from './niil-orb-official.png';

const css=`
@keyframes niilOrbBreath{
  0%,100%{transform:scale(1)}
  50%{transform:scale(1.03)}
}
@keyframes niilOrbSmokeA{
  0%{transform:translate(-54%,-51%) scale(1.02) rotate(-1.2deg);opacity:.20}
  25%{transform:translate(-49%,-54%) scale(1.10) rotate(.5deg);opacity:.42}
  52%{transform:translate(-46%,-48%) scale(1.15) rotate(1.4deg);opacity:.34}
  76%{transform:translate(-52%,-45%) scale(1.09) rotate(-.3deg);opacity:.46}
  100%{transform:translate(-54%,-51%) scale(1.02) rotate(-1.2deg);opacity:.20}
}
@keyframes niilOrbSmokeB{
  0%{transform:translate(-47%,-46%) scale(1.08) rotate(1deg);opacity:.18}
  34%{transform:translate(-53%,-49%) scale(1.16) rotate(-.8deg);opacity:.38}
  67%{transform:translate(-48%,-55%) scale(1.11) rotate(.6deg);opacity:.31}
  100%{transform:translate(-47%,-46%) scale(1.08) rotate(1deg);opacity:.18}
}
@keyframes niilOrbLight{
  0%,100%{opacity:.20;transform:translate3d(-7%,-4%,0) scale(1)}
  50%{opacity:.38;transform:translate3d(8%,6%,0) scale(1.12)}
}
@media(prefers-reduced-motion:reduce){
  .niil-orb-official,.niil-orb-smoke-a,.niil-orb-smoke-b,.niil-orb-light{animation:none!important}
}
`;

const imagemBase={position:'absolute',width:'164%',height:'164%',maxWidth:'none',left:'50%',top:'50%',objectFit:'cover',display:'block'};

export default function NiilOrb({size=112,active=true,style,label='NIIL Voice'}){
  return <><style>{css}</style>
    <div className="niil-orb-official" role="img" aria-label={label} style={{
      width:size,height:size,position:'relative',overflow:'hidden',borderRadius:'50%',
      animation:active?'niilOrbBreath 5.4s ease-in-out infinite':'none',
      transformOrigin:'center',willChange:'transform',...style
    }}>
      <img src={orbOficial} alt="" aria-hidden="true" style={{...imagemBase,transform:'translate(-50%,-49%)'}}/>
      <img className="niil-orb-smoke-a" src={orbOficial} alt="" aria-hidden="true" style={{
        ...imagemBase,width:'184%',height:'184%',filter:'blur(3px) saturate(1.08) brightness(1.05)',
        mixBlendMode:'screen',animation:active?'niilOrbSmokeA 3.8s cubic-bezier(.45,.05,.28,.98) infinite':'none',
        willChange:'transform,opacity'
      }}/>
      <img className="niil-orb-smoke-b" src={orbOficial} alt="" aria-hidden="true" style={{
        ...imagemBase,width:'178%',height:'178%',filter:'blur(5px) saturate(1.04)',
        mixBlendMode:'soft-light',animation:active?'niilOrbSmokeB 5.1s ease-in-out infinite':'none',
        willChange:'transform,opacity'
      }}/>
      <div className="niil-orb-light" aria-hidden="true" style={{
        position:'absolute',inset:'16%',borderRadius:'50%',
        background:'radial-gradient(circle at 34% 33%,rgba(255,255,255,.72),rgba(221,214,242,.28) 38%,rgba(155,141,211,.06) 67%,transparent 76%)',
        filter:'blur(7px)',mixBlendMode:'screen',
        animation:active?'niilOrbLight 4.6s ease-in-out infinite':'none',
        willChange:'transform,opacity'
      }}/>
    </div>
  </>;
}
