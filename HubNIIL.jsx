import React from 'react';
import { X, Moon, Utensils, Camera, Shirt } from 'lucide-react';

const PALETA={
  roxoEscuro:'#17151D',
  roxoClaro:'#6C9700',
  verdeEscuro:'#6C9700',
  verdeLima:'#B7F20C',
  laranja:'#17151D',
  cloud:'#F7F8F5',
  ink:'#17151D',
  muted:'#8B8791',
  line:'#E7E4EA'
};

export default function HubNIIL({fechar,setAba}){
  const modulos=[
    {id:'sono',nome:'Sono',Icone:Moon,cor:PALETA.roxoEscuro},
    {id:'comida',nome:'Refeição',Icone:Utensils,cor:PALETA.verdeEscuro},
    {id:'diario',nome:'Feed',Icone:Camera,cor:PALETA.roxoClaro},
    {id:'guarda-roupa',nome:'Guarda-roupa',Icone:Shirt,cor:PALETA.laranja}
  ];

  return <div className="hubx-overlay" onClick={fechar}>
    <style>{`
      @keyframes hubxIn{from{transform:translateY(100%)}to{transform:none}}
      @keyframes hubxPop{from{opacity:0;transform:scale(.88) translateY(8px)}to{opacity:1;transform:none}}
      .hubx-overlay{position:fixed;inset:0;z-index:90;background:rgba(23,21,29,.24);backdrop-filter:blur(7px);display:flex;align-items:flex-end;justify-content:center}
      .hubx-sheet{width:min(520px,100%);background:${PALETA.cloud};border-radius:30px 30px 0 0;padding:12px 18px 34px;box-shadow:0 -20px 60px rgba(23,21,29,.18);animation:hubxIn .35s cubic-bezier(.22,.9,.36,1) both}
      .hubx-handle{width:42px;height:5px;border-radius:99px;background:#D2CDD5;margin:0 auto 15px}
      .hubx-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:22px}
      .hubx-head span{font-size:10px;font-weight:900;letter-spacing:1.15px;color:${PALETA.roxoClaro}}
      .hubx-head h2{font-size:24px;line-height:1.06;margin:4px 0 0;color:${PALETA.ink};letter-spacing:-.025em}
      .hubx-close{width:40px;height:40px;border:0;border-radius:14px;background:#F3F9DB;color:${PALETA.ink};display:grid;place-items:center}
      .hubx-label{font-size:10px;font-weight:900;letter-spacing:1.1px;color:${PALETA.ink};margin:0 0 14px}
      .hubx-modules{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
      .hubx-module{border:0;background:transparent;padding:0;font:inherit;color:${PALETA.ink};min-width:0;animation:hubxPop .4s cubic-bezier(.2,.9,.3,1) both}
      .hubx-module:active .hubx-disc{transform:scale(.93)}
      .hubx-disc{width:min(86px,20vw);height:min(86px,20vw);max-width:86px;max-height:86px;border-radius:50%;margin:0 auto 9px;display:grid;place-items:center;position:relative;box-shadow:0 8px 20px rgba(23,21,29,.12);transition:transform .14s ease;border:3px solid rgba(255,255,255,.72)}
      .hubx-disc:after{content:"";position:absolute;bottom:-5px;left:50%;transform:translateX(-50%);width:12px;height:12px;border-radius:50%;background:${PALETA.verdeLima};border:3px solid #fff;box-shadow:0 2px 7px rgba(23,21,29,.12)}
      .hubx-disc svg{color:#fff;stroke-width:2.1}
      .hubx-module b{display:block;font-size:11px;font-weight:850;line-height:1.15;white-space:normal}
      .hubx-note{margin-top:22px;padding-top:14px;border-top:1px solid ${PALETA.line};font-size:9px;line-height:1.45;color:${PALETA.muted};text-align:center}
      @media(max-width:360px){.hubx-modules{gap:5px}.hubx-module b{font-size:9.5px}.hubx-disc{width:70px;height:70px}}
      @media(prefers-reduced-motion:reduce){.hubx-sheet,.hubx-module{animation:none!important}.hubx-disc{transition:none!important}}
    `}</style>
    <div className="hubx-sheet" onClick={e=>e.stopPropagation()}>
      <div className="hubx-handle"/>
      <div className="hubx-head">
        <div><span>HUB NIIL</span><h2>O que você quer fazer?</h2></div>
        <button className="hubx-close" onClick={fechar} aria-label="Fechar"><X size={19}/></button>
      </div>

      <div className="hubx-label">MÓDULOS</div>
      <div className="hubx-modules">
        {modulos.map((m,i)=><button key={m.id} className="hubx-module" style={{animationDelay:(i*55)+'ms'}} onClick={()=>{setAba(m.id);fechar()}}>
          <span className="hubx-disc" style={{background:m.cor}}><m.Icone size={31}/></span>
          <b>{m.nome}</b>
        </button>)}
      </div>

      <div className="hubx-note">Acesso rápido aos registros pessoais que complementam sua jornada.</div>
    </div>
  </div>;
}
