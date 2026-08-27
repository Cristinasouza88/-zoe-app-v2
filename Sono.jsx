import React,{useMemo,useState}from'react';
import{ArrowLeft,Moon,Clock3,BarChart3,History,AlarmClock,Target,ChevronLeft,ChevronRight,Plus,Trash2,Save,Watch,Mic2,Smartphone,Smile,NotebookPen,CheckCircle2,Info,Sunrise}from'lucide-react';
import'./Sono.css';

const P={plum:'#2F2545',lilac:'#9B8DD3',mist:'#DDD6F2',lime:'#C9E56C',cloud:'#F8F6F2',ink:'#2C2834',muted:'#817A89',line:'#E4DFE6',white:'#FFFFFF'};
const pad=n=>String(n).padStart(2,'0');
const hoje=()=>new Date().toISOString().slice(0,10);
const fmtData=iso=>new Intl.DateTimeFormat('pt-BR',{weekday:'short',day:'2-digit',month:'2-digit'}).format(new Date(iso+'T12:00'));
const fmtMin=m=>{m=Math.max(0,Math.round(Number(m)||0));return `${Math.floor(m/60)}h ${pad(m%60)}min`};
const timeMin=t=>{if(!t||!/\d{2}:\d{2}/.test(t))return 0;const[h,m]=t.split(':').map(Number);return h*60+m};
const diffNoite=(a,b)=>{let x=timeMin(a),y=timeMin(b);if(y<=x)y+=1440;return Math.max(0,y-x)};
const minHora=m=>{m=((Math.round(m)%1440)+1440)%1440;return `${pad(Math.floor(m/60))}:${pad(m%60)}`};
const uid=()=>`sono-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;

function Ring({value=0,label='Qualidade'}){
  const v=Math.max(0,Math.min(100,Number(value)||0));
  return <div className="sl-ring" style={{background:`conic-gradient(${P.lilac} ${v*3.6}deg,#ECE8F1 0)`}}><div><strong>{Math.round(v)}%</strong><span>{label}</span></div></div>
}
function MiniBars({values=[],max=100,suffix='',height=110}){
  const mx=Math.max(1,max,...values.map(v=>Number(v)||0));
  return <div className="sl-mini-chart" style={{height}}>{values.map((v,i)=><div className="sl-mini-col" key={i}><div className="sl-mini-bar" style={{height:`${Math.max(4,(Number(v)||0)/mx*100)}%`}}/><small>{suffix&&v!=null?`${Math.round(v)}${suffix}`:''}</small></div>)}</div>
}
function LineChart({values=[]}){
  if(values.length<2)return <div className="sl-empty-chart">Registre mais noites para formar a tendência.</div>;
  const W=360,H=118,p=12,min=Math.min(...values),max=Math.max(...values),span=Math.max(1,max-min);
  const pts=values.map((v,i)=>`${p+i*(W-p*2)/(values.length-1)},${H-p-(v-min)/span*(H-p*2)}`).join(' ');
  return <svg className="sl-line" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none"><line x1="0" y1={H/2} x2={W} y2={H/2} stroke="#E7E2EA" strokeWidth="1"/><polyline points={pts} fill="none" stroke={P.lilac} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>{values.map((v,i)=>{const[x,y]=pts.split(' ')[i].split(',');return <circle key={i} cx={x} cy={y} r="4.5" fill="#fff" stroke={P.plum} strokeWidth="2"/>})}</svg>
}
function Stat({label,value,sub,icon:Icon}){
  return <div className="sl-stat">{Icon&&<Icon size={18}/>}<span>{label}</span><strong>{value}</strong>{sub&&<small>{sub}</small>}</div>
}

export default function Sono({d,up,aviso,voltar}){
  const base=d.sono||{};
  const registros=Array.isArray(base.registros)?base.registros:[];
  const objetivoHoras=Number(base.objetivoHoras||8);
  const despertador=base.despertador||{ativo:false,hora:'07:00',janelaMin:30,dias:[1,2,3,4,5]};
  const[tab,setTab]=useState('hoje');
  const[dataSel,setDataSel]=useState(registros[0]?.data||hoje());
  const[periodo,setPeriodo]=useState('7');
  const[form,setForm]=useState(()=>({
    data:dataSel,foiCama:'23:00',acordou:'07:00',latenciaMin:15,acordadoMin:10,humorAcordar:'Ok',roncoMin:0,notas:''
  }));

  const salvarSono=patch=>up(s=>({...s,sono:{...(s.sono||{}),...patch}}));
  const ordenar=arr=>[...arr].sort((a,b)=>String(b.data).localeCompare(String(a.data)));
  const atual=registros.find(r=>r.data===dataSel)||registros[0]||null;

  const calcular=()=>{
    const cama=diffNoite(form.foiCama,form.acordou);
    const lat=Math.max(0,Number(form.latenciaMin)||0),ac=Math.max(0,Number(form.acordadoMin)||0);
    const dormindo=Math.max(0,cama-lat-ac);
    const eficiencia=cama?Math.min(100,dormindo/cama*100):0;
    const meta=Math.max(1,objetivoHoras*60);
    const duracaoScore=Math.min(100,dormindo/meta*100);
    const qualidade=Math.round(eficiencia*.62+duracaoScore*.38);
    return{tempoNaCamaMin:cama,tempoDormindoMin:dormindo,eficiencia:Math.round(eficiencia),qualidade};
  };
  const salvarNoite=()=>{
    if(!form.data||!form.foiCama||!form.acordou)return aviso('Preencha data, hora de dormir e hora de acordar');
    const calc=calcular();
    if(calc.tempoNaCamaMin<60||calc.tempoNaCamaMin>960)return aviso('Confira os horários desta noite');
    const registro={
      id:registros.find(r=>r.data===form.data)?.id||uid(),data:form.data,foiCama:form.foiCama,acordou:form.acordou,
      latenciaMin:Number(form.latenciaMin)||0,acordadoMin:Number(form.acordadoMin)||0,roncoMin:Number(form.roncoMin)||0,
      humorAcordar:form.humorAcordar||'Ok',notas:form.notas||'',fonte:'manual',...calc
    };
    const next=ordenar([...registros.filter(r=>r.data!==registro.data),registro]);
    salvarSono({registros:next});
    setDataSel(registro.data);
    aviso('Noite de sono salva');
  };
  const editarAtual=r=>{setDataSel(r.data);setForm({data:r.data,foiCama:r.foiCama||'23:00',acordou:r.acordou||'07:00',latenciaMin:r.latenciaMin||0,acordadoMin:r.acordadoMin||0,roncoMin:r.roncoMin||0,humorAcordar:r.humorAcordar||'Ok',notas:r.notas||''});setTab('hoje')};
  const excluir=id=>{salvarSono({registros:registros.filter(r=>r.id!==id)});aviso('Registro removido')};

  const filtrados=useMemo(()=>{
    const n=periodo==='all'?99999:Number(periodo);
    return [...registros].slice(0,n).reverse();
  },[registros,periodo]);

  const media=campo=>filtrados.length?filtrados.reduce((a,r)=>a+(Number(r[campo])||0),0)/filtrados.length:0;
  const mediaHora=campo=>{
    if(!filtrados.length)return 0;
    const vals=filtrados.map(r=>{let m=timeMin(r[campo]);if(campo==='foiCama'&&m<720)m+=1440;return m});
    return vals.reduce((a,b)=>a+b,0)/vals.length;
  };
  const regularidade=useMemo(()=>{
    if(filtrados.length<2)return 0;
    const a=filtrados.map(r=>{let m=timeMin(r.foiCama);if(m<720)m+=1440;return m});
    const b=filtrados.map(r=>{let m=timeMin(r.acordou);return m});
    const dev=arr=>{const m=arr.reduce((x,y)=>x+y,0)/arr.length;return arr.reduce((x,y)=>x+Math.abs(y-m),0)/arr.length};
    return Math.max(0,Math.round(100-(dev(a)+dev(b))*.55));
  },[filtrados]);

  const mudarData=dir=>{
    const dt=new Date((dataSel||hoje())+'T12:00');dt.setDate(dt.getDate()+dir);
    const iso=dt.toISOString().slice(0,10);setDataSel(iso);
    const r=registros.find(x=>x.data===iso);
    if(r)editarAtual(r);else setForm(f=>({...f,data:iso}));
  };

  return <div className="sl-page">
    <header className="sl-header"><button onClick={voltar} aria-label="Voltar"><ArrowLeft size={21}/></button><div><span>NIIL · SONO</span><h1>Seu sono, em contexto.</h1></div><Moon size={28}/></header>
    <nav className="sl-tabs">
      {[['hoje','Hoje',Moon],['historico','Histórico',History],['estatisticas','Estatísticas',BarChart3],['alarme','Despertador',AlarmClock]].map(([id,n,I])=><button key={id} onClick={()=>setTab(id)} className={tab===id?'on':''}><I size={17}/><span>{n}</span></button>)}
    </nav>

    {tab==='hoje'&&<main className="sl-main">
      <div className="sl-date-nav"><button onClick={()=>mudarData(-1)}><ChevronLeft size={18}/></button><div><strong>{fmtData(dataSel)}</strong><small>{dataSel}</small></div><button onClick={()=>mudarData(1)} disabled={dataSel>=hoje()}><ChevronRight size={18}/></button></div>

      {atual?.data===dataSel?<section className="sl-hero">
        <Ring value={atual.qualidade}/>
        <div className="sl-hero-numbers"><div><strong>{fmtMin(atual.tempoNaCamaMin)}</strong><span>na cama</span></div><div><strong>{fmtMin(atual.tempoDormindoMin)}</strong><span>dormindo</span></div></div>
        <div className="sl-source">Estimativa NIIL · {atual.fonte==='manual'?'registro manual':'fonte conectada'}</div>
      </section>:<section className="sl-empty"><Moon size={30}/><strong>Nenhuma noite registrada</strong><p>Registre os horários agora. Quando o app nativo estiver conectado aos sensores, estes campos poderão ser preenchidos automaticamente.</p></section>}

      {atual?.data===dataSel&&<section className="sl-card">
        <div className="sl-title"><h2>Resumo da noite</h2><span>Qualidade NIIL</span></div>
        <div className="sl-grid4">
          <Stat icon={Clock3} label="Foi para a cama" value={atual.foiCama}/>
          <Stat icon={Sunrise} label="Acordou" value={atual.acordou}/>
          <Stat icon={Moon} label="Adormeceu após" value={`${atual.latenciaMin||0} min`}/>
          <Stat icon={CheckCircle2} label="Eficiência" value={`${atual.eficiencia||0}%`}/>
          <Stat icon={Mic2} label="Ronco" value={`${atual.roncoMin||0} min`}/>
          <Stat icon={Smile} label="Humor ao despertar" value={atual.humorAcordar||'—'}/>
        </div>
      </section>}

      <section className="sl-card">
        <div className="sl-title"><h2>{atual?.data===dataSel?'Editar noite':'Registrar noite'}</h2><span>Manual agora · automático depois</span></div>
        <div className="sl-form-grid">
          <label>Data<input type="date" max={hoje()} value={form.data} onChange={e=>{setForm(f=>({...f,data:e.target.value}));setDataSel(e.target.value)}}/></label>
          <label>Foi para a cama<input type="time" value={form.foiCama} onChange={e=>setForm(f=>({...f,foiCama:e.target.value}))}/></label>
          <label>Acordou<input type="time" value={form.acordou} onChange={e=>setForm(f=>({...f,acordou:e.target.value}))}/></label>
          <label>Adormeceu após (min)<input type="number" min="0" max="180" inputMode="numeric" value={form.latenciaMin} onChange={e=>setForm(f=>({...f,latenciaMin:e.target.value}))}/></label>
          <label>Tempo acordado à noite (min)<input type="number" min="0" max="360" inputMode="numeric" value={form.acordadoMin} onChange={e=>setForm(f=>({...f,acordadoMin:e.target.value}))}/></label>
          <label>Ronco percebido (min)<input type="number" min="0" max="480" inputMode="numeric" value={form.roncoMin} onChange={e=>setForm(f=>({...f,roncoMin:e.target.value}))}/></label>
          <label>Humor ao despertar<select value={form.humorAcordar} onChange={e=>setForm(f=>({...f,humorAcordar:e.target.value}))}><option>Ótimo</option><option>Bem</option><option>Ok</option><option>Cansada</option><option>Muito cansada</option></select></label>
          <label className="wide">Anotações<textarea rows="3" placeholder="Cafeína, treino, álcool, estresse, viagem..." value={form.notas} onChange={e=>setForm(f=>({...f,notas:e.target.value}))}/></label>
        </div>
        <div className="sl-preview"><Info size={16}/><span>Com esses horários, o NIIL estima <b>{fmtMin(calcular().tempoDormindoMin)}</b> dormindo, <b>{calcular().eficiencia}%</b> de eficiência e <b>{calcular().qualidade}%</b> de qualidade. Essa qualidade ainda não usa sensores.</span></div>
        <button className="sl-primary" onClick={salvarNoite}><Save size={18}/>Salvar noite</button>
      </section>

      <section className="sl-card">
        <div className="sl-title"><h2>Fases do sono</h2><span>Preparado para integração nativa</span></div>
        {atual?.fases?.length?<div className="sl-phases">{atual.fases.map((f,i)=><div key={i} className={`phase ${f.tipo}`} style={{flex:Math.max(1,f.minutos||1)}} title={`${f.tipo}: ${f.minutos} min`}/>)}</div>:<div className="sl-native-note"><Watch size={22}/><div><b>Não vamos inventar suas fases.</b><p>Leve, profundo e REM só aparecerão quando vierem de uma fonte compatível — Apple Health, Health Connect, wearable ou monitoramento nativo do NIIL.</p></div></div>}
      </section>

      <section className="sl-card">
        <div className="sl-title"><h2>Objetivo de sono</h2><Target size={19}/></div>
        <div className="sl-goal"><div><strong>{objetivoHoras}h</strong><span>por noite</span></div><input type="range" min="5" max="10" step=".5" value={objetivoHoras} onChange={e=>salvarSono({objetivoHoras:Number(e.target.value)})}/></div>
      </section>
    </main>}

    {tab==='historico'&&<main className="sl-main">
      <section className="sl-card">
        <div className="sl-title"><h2>Histórico</h2><span>{registros.length} noites</span></div>
        {!registros.length?<div className="sl-empty small"><History size={25}/><strong>Seu histórico começa na primeira noite salva.</strong></div>:<div className="sl-history">{registros.map(r=><article key={r.id}><div className="sl-day-score"><strong>{Math.round(r.qualidade||0)}%</strong><span>{fmtData(r.data)}</span></div><div className="sl-hinfo"><b>{fmtMin(r.tempoDormindoMin)}</b><small>{r.foiCama} → {r.acordou} · eficiência {r.eficiencia||0}%</small></div><button onClick={()=>editarAtual(r)}>Abrir</button><button className="danger" onClick={()=>excluir(r.id)} aria-label="Excluir"><Trash2 size={16}/></button></article>)}</div>}
      </section>
    </main>}

    {tab==='estatisticas'&&<main className="sl-main">
      <div className="sl-period">{[['7','Dias'],['28','Semanas'],['90','Meses'],['all','Todos']].map(([id,n])=><button className={periodo===id?'on':''} key={id} onClick={()=>setPeriodo(id)}>{n}</button>)}</div>
      <section className="sl-card sl-stat-hero"><div><span>Qualidade média</span><strong>{Math.round(media('qualidade'))||0}%</strong></div><div><span>Regularidade</span><strong>{regularidade||0}%</strong></div><div><span>Eficiência</span><strong>{Math.round(media('eficiencia'))||0}%</strong></div></section>
      <section className="sl-card"><div className="sl-title"><h2>Qualidade do sono</h2><span>média {Math.round(media('qualidade'))||0}%</span></div><MiniBars values={filtrados.map(r=>r.qualidade||0)} max={100} suffix="%"/><div className="sl-xlabels">{filtrados.map(r=><span key={r.id}>{new Date(r.data+'T12:00').getDate()}/{new Date(r.data+'T12:00').getMonth()+1}</span>)}</div></section>
      <section className="sl-card"><div className="sl-title"><h2>Tempo dormindo</h2><span>média {fmtMin(media('tempoDormindoMin'))}</span></div><LineChart values={filtrados.map(r=>(r.tempoDormindoMin||0)/60)}/></section>
      <section className="sl-card"><div className="sl-title"><h2>Foi para a cama</h2><span>média {minHora(mediaHora('foiCama'))}</span></div><LineChart values={filtrados.map(r=>{let m=timeMin(r.foiCama);return m<720?m+1440:m})}/></section>
      <section className="sl-card"><div className="sl-title"><h2>Acordou</h2><span>média {minHora(mediaHora('acordou'))}</span></div><LineChart values={filtrados.map(r=>timeMin(r.acordou))}/></section>
      <section className="sl-card"><div className="sl-title"><h2>Eficiência</h2><span>média {Math.round(media('eficiencia'))||0}%</span></div><MiniBars values={filtrados.map(r=>r.eficiencia||0)} max={100} suffix="%"/></section>
    </main>}

    {tab==='alarme'&&<main className="sl-main">
      <section className="sl-alarm-hero"><AlarmClock size={32}/><span>Quero acordar às</span><input type="time" value={despertador.hora||'07:00'} onChange={e=>salvarSono({despertador:{...despertador,hora:e.target.value}})}/><label className="sl-switch"><input type="checkbox" checked={!!despertador.ativo} onChange={e=>salvarSono({despertador:{...despertador,ativo:e.target.checked}})}/><span/>{despertador.ativo?'Ativo':'Desativado'}</label></section>
      <section className="sl-card">
        <div className="sl-title"><h2>Janela inteligente</h2><span>{despertador.janelaMin||30} min</span></div>
        <input className="sl-range" type="range" min="10" max="45" step="5" value={despertador.janelaMin||30} onChange={e=>salvarSono({despertador:{...despertador,janelaMin:Number(e.target.value)}})}/>
        <p className="sl-copy">O horário e a janela já ficam salvos no seu perfil. O despertar pelo estágio mais leve será ativado apenas no app nativo, quando houver monitoramento real do sono em segundo plano.</p>
      </section>
      <section className="sl-card">
        <div className="sl-title"><h2>Dias</h2></div>
        <div className="sl-week">{[['D',0],['S',1],['T',2],['Q',3],['Q',4],['S',5],['S',6]].map(([n,id])=>{const on=(despertador.dias||[]).includes(id);return <button className={on?'on':''} key={id} onClick={()=>{const ds=on?(despertador.dias||[]).filter(x=>x!==id):[...(despertador.dias||[]),id];salvarSono({despertador:{...despertador,dias:ds}})}}>{n}</button>})}</div>
      </section>
      <section className="sl-card">
        <div className="sl-title"><h2>Fontes de dados</h2><Smartphone size={19}/></div>
        <div className="sl-connect"><div><Watch size={21}/><span><b>Apple Health / Health Connect</b><small>Estrutura preparada para receber duração, estágios e sinais do dispositivo.</small></span><em>App nativo</em></div><div><Mic2 size={21}/><span><b>Monitoramento pelo microfone</b><small>Será opcional, com consentimento explícito e controles de privacidade.</small></span><em>App nativo</em></div></div>
      </section>
    </main>}
  </div>
}
