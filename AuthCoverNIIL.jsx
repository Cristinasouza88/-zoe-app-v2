import React,{useState}from'react';
import{Apple,Mail,ArrowLeft,ChevronRight,ShieldCheck}from'lucide-react';
import{Wordmark}from'./ui.jsx';
import{supabase}from'./supabase.js';
import'./AuthCoverNIIL.css';

function GoogleIcon(){return <svg width="20" height="20" viewBox="0 0 18 18" aria-hidden="true"><path fill="#4285F4" d="M17.64 9.205c0-.638-.057-1.252-.164-1.841H9v3.482h4.844a4.14 4.14 0 0 1-1.797 2.715v2.259h2.909c1.702-1.567 2.684-3.875 2.684-6.615Z"/><path fill="#34A853" d="M9 18c2.43 0 4.468-.806 5.956-2.18l-2.909-2.259c-.806.54-1.835.859-3.047.859-2.344 0-4.328-1.585-5.037-3.714H.956v2.332A9 9 0 0 0 9 18Z"/><path fill="#FBBC05" d="M3.963 10.706A5.42 5.42 0 0 1 3.681 9c0-.592.102-1.168.282-1.706V4.962H.956A9 9 0 0 0 0 9c0 1.452.347 2.827.956 4.038l3.007-2.332Z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.507.454 3.441 1.346l2.581-2.581C13.464.892 11.426 0 9 0A9 9 0 0 0 .956 4.962l3.007 2.332C4.672 5.165 6.656 3.58 9 3.58Z"/></svg>}

const traduzirErro=message=>{
  const m=String(message||'');
  if(/invalid login credentials/i.test(m))return'E-mail ou senha incorretos.';
  if(/user already registered/i.test(m))return'Esse e-mail já tem uma conta. Entre com ele.';
  if(/password should be at least/i.test(m))return'A senha precisa ter pelo menos 6 caracteres.';
  if(/email rate limit/i.test(m))return'Muitas tentativas. Aguarde alguns minutos.';
  if(/provider is not enabled/i.test(m))return'Este método de acesso ainda precisa ser ativado no servidor.';
  return'Não foi possível continuar. Tente novamente.';
};

export default function AuthCoverNIIL(){
  const[painel,setPainel]=useState('capa');
  const[modo,setModo]=useState('entrar');
  const[nome,setNome]=useState('');
  const[email,setEmail]=useState('');
  const[senha,setSenha]=useState('');
  const[erro,setErro]=useState('');
  const[mensagem,setMensagem]=useState('');
  const[carregando,setCarregando]=useState('');

  const oauth=async provider=>{
    setErro('');setMensagem('');setCarregando(provider);
    const{error}=await supabase.auth.signInWithOAuth({provider,options:{redirectTo:window.location.origin}});
    if(error){setErro(traduzirErro(error.message));setCarregando('')}
  };

  const submeterEmail=async()=>{
    setErro('');setMensagem('');
    const mail=email.trim().toLowerCase();
    if(!mail.includes('@'))return setErro('Digite um e-mail válido.');
    if(senha.length<6)return setErro('A senha precisa ter pelo menos 6 caracteres.');
    if(modo==='criar'&&!nome.trim())return setErro('Como você quer ser chamada?');
    setCarregando('email');
    try{
      if(modo==='criar'){
        const{data,error}=await supabase.auth.signUp({email:mail,password:senha,options:{data:{full_name:nome.trim()},emailRedirectTo:window.location.origin}});
        if(error)throw error;
        if(!data.session)setMensagem('Conta criada. Confira seu e-mail para confirmar o cadastro.');
      }else{
        const{error}=await supabase.auth.signInWithPassword({email:mail,password:senha});
        if(error)throw error;
      }
    }catch(e){setErro(traduzirErro(e.message))}finally{setCarregando('')}
  };

  const recuperar=async()=>{
    setErro('');setMensagem('');
    const mail=email.trim().toLowerCase();
    if(!mail.includes('@'))return setErro('Digite seu e-mail primeiro.');
    setCarregando('reset');
    const{error}=await supabase.auth.resetPasswordForEmail(mail,{redirectTo:window.location.origin});
    setCarregando('');
    if(error)return setErro(traduzirErro(error.message));
    setMensagem('Enviamos um link para redefinir sua senha.');
  };

  return <main className="authniil">
    <section className="authniil-identity">
      <Wordmark altura={54}/>
      <div className="authniil-orbit" aria-hidden="true"><i/><i/><i/><b/></div>
      <div className="authniil-copy">
        <span>SEU COACH PARA A VIDA REAL</span>
        <h1>Sua vida, conectada.</h1>
        <p>Rotina, energia, finanças, aprendizado e decisões trabalhando juntas — uma coisa por vez.</p>
      </div>
    </section>

    {painel==='capa'?<section className="authniil-actions" aria-label="Acessar NIIL">
      <button className="authniil-provider apple" onClick={()=>oauth('apple')} disabled={!!carregando}><Apple size={21} fill="currentColor"/>{carregando==='apple'?'Conectando…':'Continuar com Apple'}</button>
      <button className="authniil-provider google" onClick={()=>oauth('google')} disabled={!!carregando}><GoogleIcon/>{carregando==='google'?'Conectando…':'Continuar com Google'}</button>
      <button className="authniil-provider email" onClick={()=>{setPainel('email');setErro('');setMensagem('')}}><Mail size={20}/>Continuar com e-mail<ChevronRight size={18}/></button>
      {erro&&<div className="authniil-error" role="alert">{erro}</div>}
      <div className="authniil-trust"><ShieldCheck size={15}/><span>Seus dados ficam vinculados à sua conta NIIL.</span></div>
      <p className="authniil-legal">Ao continuar, você concorda com os Termos de Uso e a Política de Privacidade do NIIL.</p>
    </section>:<section className="authniil-email-card">
      <button className="authniil-back" onClick={()=>{setPainel('capa');setErro('');setMensagem('')}}><ArrowLeft size={18}/> Voltar</button>
      <div className="authniil-email-title"><span>ACESSO POR E-MAIL</span><h2>{modo==='entrar'?'Bem-vinda de volta.':'Comece sua jornada no NIIL.'}</h2></div>
      <div className="authniil-tabs">{[['entrar','Entrar'],['criar','Criar conta']].map(([id,label])=><button key={id} className={modo===id?'on':''} onClick={()=>{setModo(id);setErro('');setMensagem('')}}>{label}</button>)}</div>
      {modo==='criar'&&<label>Nome<input autoComplete="name" value={nome} onChange={e=>setNome(e.target.value)} placeholder="Como quer ser chamada"/></label>}
      <label>E-mail<input type="email" autoComplete="email" inputMode="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="voce@email.com"/></label>
      <label>Senha<input type="password" autoComplete={modo==='criar'?'new-password':'current-password'} value={senha} onChange={e=>setSenha(e.target.value)} placeholder="Mínimo de 6 caracteres" onKeyDown={e=>e.key==='Enter'&&submeterEmail()}/></label>
      {modo==='entrar'&&<button className="authniil-forgot" onClick={recuperar} disabled={!!carregando}>{carregando==='reset'?'Enviando…':'Esqueci minha senha'}</button>}
      {erro&&<div className="authniil-error" role="alert">{erro}</div>}
      {mensagem&&<div className="authniil-success">{mensagem}</div>}
      <button className="authniil-submit" onClick={submeterEmail} disabled={!!carregando}>{carregando==='email'?'Aguarde…':modo==='criar'?'Criar minha conta':'Entrar'}</button>
    </section>}
  </main>;
}
