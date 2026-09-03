import React,{useEffect,useState}from'react';
import './niil-brand.css';
import './niil-flat-theme.css';
import './niil-interactions.css';
import './financeiro-mobile-fix.css';
import NIILAppCore from './NiilAppCore.jsx';
import {Wordmark} from './ui.jsx';

export default function App(){
  const[launch,setLaunch]=useState(true);
  const[saindo,setSaindo]=useState(false);

  useEffect(()=>{
    const t1=window.setTimeout(()=>setSaindo(true),900);
    const t2=window.setTimeout(()=>setLaunch(false),1250);
    return()=>{window.clearTimeout(t1);window.clearTimeout(t2)};
  },[]);

  return <>
    <NIILAppCore/>
    {launch&&<div className={`niil-launch-screen ${saindo?'out':''}`} aria-hidden="true">
      <div className="niil-launch-inner">
        <Wordmark altura={64} cor="#17151D" corPontos="#17151D"/>
        <div className="niil-launch-sub">SUA VIDA, CONECTADA.</div>
      </div>
    </div>}
  </>;
}
