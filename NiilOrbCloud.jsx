import React from 'react';
import NiilOrb from './NiilOrb.jsx';
export default function NiilOrbCloud({size=128,active=true,style}){return <div style={{position:'relative',width:size,height:size,...style}}><div style={{position:'absolute',inset:'12%',borderRadius:'46% 54% 48% 52% / 56% 46% 54% 44%',background:'#F1EEF7',filter:'blur(1px)',transform:'scale(1.12)',boxShadow:'0 18px 38px rgba(47,37,69,.12)'}}/><NiilOrb size={size} active={active} style={{position:'relative',zIndex:1}}/></div>}
