import React,{useEffect,useState}from'react';
import './niil-brand.css';
import './niil-flat-theme.css';
import './niil-interactions.css';
import './financeiro-mobile-fix.css';
import NIILAppCore from './NiilAppCore.jsx';
import AuthCoverNIIL from './AuthCoverNIIL.jsx';
import {supabase} from './supabase.js';
import {Wordmark} from './ui.jsx';

export default function App(){
  const[launch,setLaunch]=useState(true);
  const[saindo,setSaindo]=useState(false);
  const[authPronto,setAuthPronto]=useState(false);
  const[temSessao,setTemSessao]=useState(false);
  const recovery=typeof window!=='undefined'&&(window.location.hash.includes('type=recovery')||window.location.search.includes('type=recovery'));

  useEffect(()=>{
    const t1=window.setTimeout(()=>setSaindo(true),900);
    const t2=window.setTimeout(()=>setLaunch(false),1250);
    return()=>{window.clearTimeout(t1);window.clearTimeout(t2)};
  },[]);

  useEffect(()=>{
    let ativo=true;
    supabase.auth.getSession().then(({data})=>{
      if(!ativo)return;
      setTemSessao(!!data.session);
      setAuthPronto(true);
    }).catch(()=>ativo&&setAuthPronto(true));
    const{sub}=supabase.auth.onAuthStateChange((_event,session)=>{
      if(!ativo)return;
      setTemSessao(!!session);
      setAuthPronto(true);
    }).data;
    return()=>{ativo=false;sub?.subscription?.unsubscribe?.()};
  },[]);

  const conteudo=!authPronto&&!recovery
    ?<div style={{minHeight:'100dvh',background:'#F7F8F5'}}/>
    :(temSessao||recovery?<NIILAppCore/>:<AuthCoverNIIL/>);

  return <>
    {conteudo}
    {launch&&<div className={`niil-launch-screen ${saindo?'out':''}`} aria-hidden="true">
      <div className="niil-launch-inner">
        <Wordmark altura={64} cor="#17151D" corPontos="#17151D"/>
        <div className="niil-launch-sub">SUA VIDA, CONECTADA.</div>
      </div>
    </div>}
  </>;
}
