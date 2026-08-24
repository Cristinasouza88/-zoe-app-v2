import React from 'react';

const css = `
@keyframes zoeOrbBreath{0%,100%{transform:scale(1)}50%{transform:scale(1.035)}}
@keyframes zoeOrbDrift1{0%,100%{transform:translate(-8%,-4%) scale(1)}33%{transform:translate(18%,10%) scale(1.18)}66%{transform:translate(2%,24%) scale(.9)}}
@keyframes zoeOrbDrift2{0%,100%{transform:translate(12%,18%) scale(1)}35%{transform:translate(-18%,-4%) scale(.92)}70%{transform:translate(4%,-20%) scale(1.16)}}
@keyframes zoeOrbDrift3{0%,100%{transform:translate(2%,-8%) scale(.9)}40%{transform:translate(15%,19%) scale(1.15)}75%{transform:translate(-17%,8%) scale(1)}}
@keyframes zoeOrbTurn{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes zoeOrbGlow{0%,100%{opacity:.46;transform:scale(.94)}50%{opacity:.86;transform:scale(1.08)}}
@media (prefers-reduced-motion: reduce){.zoe-orb,.zoe-orb *{animation:none!important}}
`;

export default function ZoeOrb({ size = 112, active = true, style, label = 'ZOE Essencial' }) {
  return <>
    <style>{css}</style>
    <div
      className="zoe-orb"
      role="img"
      aria-label={label}
      style={{
        width:size,height:size,borderRadius:'50%',position:'relative',overflow:'hidden',isolation:'isolate',
        background:'radial-gradient(circle at 35% 28%,#F7FFD9 0%,#D8FF72 11%,transparent 28%), radial-gradient(circle at 70% 72%,#42D6B0 0%,#36CBB0 21%,transparent 48%), linear-gradient(145deg,#8D45EA 0%,#6954F1 43%,#2DD3B0 100%)',
        boxShadow:'0 12px 32px rgba(100,63,217,.22), inset 0 0 0 1px rgba(255,255,255,.5)',
        animation:active?'zoeOrbBreath 4.5s ease-in-out infinite':'none',
        ...style
      }}
    >
      <div style={{position:'absolute',inset:'-18%',borderRadius:'50%',background:'conic-gradient(from 10deg,rgba(255,255,255,.0),rgba(255,255,255,.32),rgba(168,255,0,.22),rgba(255,255,255,.0),rgba(139,72,237,.32),rgba(255,255,255,.0))',filter:'blur(10px)',animation:active?'zoeOrbTurn 13s linear infinite':'none'}}/>
      <div style={{position:'absolute',width:'72%',height:'72%',left:'-7%',top:'4%',borderRadius:'50%',background:'radial-gradient(circle,rgba(194,129,255,.95) 0%,rgba(135,69,232,.52) 42%,rgba(135,69,232,0) 72%)',filter:'blur(11px)',mixBlendMode:'screen',animation:active?'zoeOrbDrift1 7.2s ease-in-out infinite':'none'}}/>
      <div style={{position:'absolute',width:'76%',height:'76%',right:'-15%',bottom:'-4%',borderRadius:'50%',background:'radial-gradient(circle,rgba(96,255,191,.95) 0%,rgba(38,209,166,.55) 42%,rgba(38,209,166,0) 72%)',filter:'blur(12px)',mixBlendMode:'screen',animation:active?'zoeOrbDrift2 8.1s ease-in-out infinite':'none'}}/>
      <div style={{position:'absolute',width:'58%',height:'58%',left:'22%',top:'16%',borderRadius:'50%',background:'radial-gradient(circle,rgba(222,255,96,.88) 0%,rgba(168,255,0,.42) 42%,rgba(168,255,0,0) 72%)',filter:'blur(10px)',mixBlendMode:'screen',animation:active?'zoeOrbDrift3 6.6s ease-in-out infinite':'none'}}/>
      <div style={{position:'absolute',inset:'15%',borderRadius:'50%',background:'radial-gradient(circle at 36% 30%,rgba(255,255,255,.72),rgba(255,255,255,.12) 35%,rgba(255,255,255,.02) 64%,transparent 72%)',backdropFilter:'blur(5px)',WebkitBackdropFilter:'blur(5px)',boxShadow:'inset 0 0 22px rgba(255,255,255,.2)'}}/>
      <div style={{position:'absolute',inset:'-10%',borderRadius:'50%',background:'radial-gradient(circle,rgba(147,255,224,.28),transparent 62%)',filter:'blur(13px)',animation:active?'zoeOrbGlow 3.2s ease-in-out infinite':'none'}}/>
      <div style={{position:'absolute',top:'13%',left:'20%',width:'31%',height:'17%',borderRadius:'50%',background:'linear-gradient(145deg,rgba(255,255,255,.8),rgba(255,255,255,0))',filter:'blur(2px)',transform:'rotate(-18deg)',opacity:.78}}/>
    </div>
  </>;
}
