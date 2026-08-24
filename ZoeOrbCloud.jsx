import React from 'react';

const css = `
@keyframes zoeCloudBreathe{0%,100%{transform:scale(.96)}50%{transform:scale(1.04)}}
@keyframes zoeCloudA{0%,100%{transform:translate(-18%,-8%) scale(.92)}35%{transform:translate(11%,9%) scale(1.22)}72%{transform:translate(-2%,23%) scale(1.04)}}
@keyframes zoeCloudB{0%,100%{transform:translate(13%,18%) scale(1.04)}38%{transform:translate(-17%,-7%) scale(.88)}73%{transform:translate(5%,-18%) scale(1.2)}}
@keyframes zoeCloudC{0%,100%{transform:translate(-2%,4%) scale(.84)}42%{transform:translate(17%,-14%) scale(1.18)}76%{transform:translate(-16%,8%) scale(1)}}
@keyframes zoeCloudD{0%,100%{transform:translate(4%,-12%) scale(1)}50%{transform:translate(-9%,16%) scale(1.2)}}
@keyframes zoeCloudTurn{from{transform:rotate(0deg) scale(1.08)}to{transform:rotate(360deg) scale(1.08)}}
@keyframes zoeCloudGlow{0%,100%{opacity:.48;transform:scale(.92)}50%{opacity:.9;transform:scale(1.08)}}
@media (prefers-reduced-motion: reduce){.zoe-cloud,.zoe-cloud *{animation:none!important}}
`;

export default function ZoeOrbCloud({ size = 150, active = true, style, label = 'ZOE Essencial' }) {
  const anim = active;
  return <>
    <style>{css}</style>
    <div
      className="zoe-cloud"
      role="img"
      aria-label={label}
      style={{
        width:size,height:size,position:'relative',borderRadius:'50%',background:'transparent',
        overflow:'hidden',WebkitMaskImage:'radial-gradient(circle at center,#000 0 66%,rgba(0,0,0,.98) 67%,rgba(0,0,0,.72) 72%,transparent 82%)',
        maskImage:'radial-gradient(circle at center,#000 0 66%,rgba(0,0,0,.98) 67%,rgba(0,0,0,.72) 72%,transparent 82%)',
        WebkitMaskRepeat:'no-repeat',maskRepeat:'no-repeat',WebkitMaskSize:'100% 100%',maskSize:'100% 100%',
        transform:'translateZ(0)',animation:anim?'zoeCloudBreathe 5.4s ease-in-out infinite':'none',
        ...style
      }}
    >
      <div style={{position:'absolute',inset:'2%',borderRadius:'50%',background:'radial-gradient(circle at 50% 50%,rgba(255,255,255,.22),rgba(255,255,255,.04) 46%,transparent 72%)'}}/>
      <div style={{position:'absolute',inset:'-24%',borderRadius:'50%',background:'conic-gradient(from 20deg,rgba(122,68,239,.3),rgba(74,214,190,.28),rgba(190,255,71,.24),rgba(133,82,245,.35),rgba(66,210,183,.25))',filter:'blur(24px)',animation:anim?'zoeCloudTurn 17s linear infinite':'none'}}/>
      <div style={{position:'absolute',width:'82%',height:'82%',left:'-18%',top:'-4%',borderRadius:'50%',background:'radial-gradient(circle,rgba(143,83,244,.98) 0%,rgba(117,72,235,.68) 34%,rgba(117,72,235,.18) 59%,transparent 76%)',filter:'blur(17px)',animation:anim?'zoeCloudA 7.4s ease-in-out infinite':'none'}}/>
      <div style={{position:'absolute',width:'88%',height:'88%',right:'-23%',bottom:'-8%',borderRadius:'50%',background:'radial-gradient(circle,rgba(43,216,178,.98) 0%,rgba(45,204,173,.68) 35%,rgba(45,204,173,.16) 60%,transparent 77%)',filter:'blur(18px)',animation:anim?'zoeCloudB 8.7s ease-in-out infinite':'none'}}/>
      <div style={{position:'absolute',width:'66%',height:'66%',left:'18%',top:'10%',borderRadius:'50%',background:'radial-gradient(circle,rgba(197,255,66,.95) 0%,rgba(170,255,0,.5) 35%,rgba(170,255,0,.1) 59%,transparent 77%)',filter:'blur(18px)',animation:anim?'zoeCloudC 6.9s ease-in-out infinite':'none'}}/>
      <div style={{position:'absolute',width:'72%',height:'72%',left:'14%',bottom:'2%',borderRadius:'50%',background:'radial-gradient(circle,rgba(109,110,255,.86) 0%,rgba(112,91,244,.42) 38%,transparent 73%)',filter:'blur(21px)',animation:anim?'zoeCloudD 9.2s ease-in-out infinite':'none'}}/>
      <div style={{position:'absolute',width:'58%',height:'48%',left:'21%',top:'22%',borderRadius:'50%',background:'radial-gradient(ellipse,rgba(255,255,255,.72),rgba(238,255,245,.28) 42%,transparent 73%)',filter:'blur(15px)',animation:anim?'zoeCloudGlow 4.1s ease-in-out infinite':'none'}}/>
      <div style={{position:'absolute',inset:'7%',borderRadius:'50%',boxShadow:'inset 0 0 34px rgba(255,255,255,.16)',background:'radial-gradient(circle at 37% 27%,rgba(255,255,255,.38),transparent 27%)'}}/>
    </div>
  </>;
}
