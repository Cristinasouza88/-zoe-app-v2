import React,{useMemo,useState}from'react';
import{ArrowLeft,Moon,Clock3,BarChart3,History,AlarmClock,Target,ChevronLeft,ChevronRight,Trash2,Save,Watch,Mic2,Smartphone,Smile,Info,Sunrise,Flame,Edit3,Sparkles,Check,Plus,CalendarDays}from'lucide-react';
import{Wordmark}from'./ui.jsx';
import{niilMascot}from'./niil-mascot.data.js';
import'./Sono.css';

const P={plum:'#2F2545',lilac:'#9B8DD3',mist:'#DDD6F2',lime:'#C9E56C',cloud:'#F8F6F2',ink:'#2C2834',muted:'#817A89',line:'#E4DFE6',white:'#FFFFFF'};
const pad=n=>String(n).padStart(2,'0');
const hoje=()=>new Date().toISOString().slice(0,10);
const fmtData=iso=>new Intl.DateTimeFormat('pt-BR',{weekday:'short',day:'2-digit',month:'2-digit'}).format(new Date(iso+'T12:00'));
const fmtDataLonga=iso=>new Intl.DateTimeFormat('pt-BR',{weekday:'long',day:'numeric',month:'long'}).format(new Date(iso+'T12:00'));
const fmtMin=m=>{m=Math.max(0,Math.round(Number(m)||0));return `${Math.floor(m/60)}h ${pad(m%60)}min`};
const timeMin=t=>{if(!t||!/\d{2}:\d{2}/.test(t))return 0;const[h,m]=t.split(':').map(Number);return h*60+m};
const diffNoite=(a,b)=>{let x=timeMin(a),y=timeMin(b);if(y<=x)y+=1440;return Math.max(0,y-x)};
const minHora=m=>{m=((Math.round(m)%1440)+1440)%1440;return `${pad(Math.floor(m/60))}:${pad(m%60)}`};
const uid=()=>`sono-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;

function Ring({value=0,label='Qualidade'}){
  const v=Math.max(0,Math.min(100,Number(value)||0));
  return <div className="sn-ring-wrap"><div className="sn-ring" style={{'--score':`${v*3.6}deg`}}><div><strong>{Math.round(v)}%</strong><span>{label}</span></div></div></div>
}
function MiniBars({values=[],max=100}){
  const mx=Math.max(1,max,...values.map(v=>Number(v)||0));
  return <div className="sn-mini-chart">{values.map((v,i)=><div className="sn-mini-col" key={i}><div className="sn-mini-bar" style={{'--h':`${Math.max(5,(Number(v)||0)/mx*100)}%`}}/></div>)}</div>
}
function LineChart({values=[]}){
  if(values.length<2)return <div className="sn-empty-chart">Mais duas noites e eu já consigo mostrar uma tendência.</div>;
  const W=360,H=118,p=12,min=Math.min(...values),max=Math.max(...values),span=Math.max(1,max-min);
  const pts=values.map((v,i)=>`${p+i*(W-p*2)/(values.length-1)},${H-p-(v-min)/span*(H-p*2)}`).join(' ');
  return <svg className="sn-line" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none"><line x1="0" y1={H/2} x2={W} y2={H/2} stroke="#E7E2EA" strokeWidth="1"/><polyline points={pts} fill="none" stroke={P.lilac} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>{values.map((v,i)=>{const[x,y]=pts.split(' ')[i].split(',');return <circle key={i} cx={x} cy={y} r="4.5" fill="#fff" stroke={P.plum} strokeWidth="2"/>})}</svg>
}
function Stat({label,value,sub,icon:Icon}){
  return <div className="sn-stat">{Icon&&<span className="sn-stat-icon"><Icon size={17}/></span>}<span>{label}</span><strong>{value}</strong>{sub&&<small>{sub}</small>}</div>
}

export default function Sono({d,up,aviso,voltar}){
  const base=d.sono||{};
  const registros=Array.isArray(base.registros)?base.registros:[];
  const objetivoHoras=Number(base.objetivoHoras||8);
  const despertador=base.despertador||{ativo:false,hora:'07:00',janelaMin:30,dias:[1,2,3,4,5]};
  const[tab,setTab]=useState('hoje');
  const[dataSel,setDataSel]=useState(registros[0]?.data||hoje());
  const[periodo,setPeriodo]=useState('7');
  const[editando,setEditando]=useState(false);
  const[form,setForm]=useState(()=>({data:dataSel,foiCama:'23:00',acordou:'07:00',latenciaMin:15,acordadoMin:10,humorAcordar:'Ok',roncoMin:0,notas:''}));

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
    const registro={id:registros.find(r=>r.data===form.data)?.id||uid(),data:form.data,foiCama:form.foiCama,acordou:form.acordou,latenciaMin:Number(form.latenciaMin)||0,acordadoMin:Number(form.acordadoMin)||0,roncoMin:Number(form.roncoMin)||0,humorAcordar:form.humorAcordar||'Ok',notas:form.notas||'',fonte:'manual',...calc};
    const next=ordenar([...registros.filter(r=>r.data!==registro.data),registro]);
    salvarSono({registros:next});
    setDataSel(registro.data);setEditando(false);aviso('Noite de sono salva');
  };
  const editarAtual=r=>{setDataSel(r.data);setForm({data:r.data,foiCama:r.foiCama||'23:00',acordou:r.acordou||'07:00',latenciaMin:r.latenciaMin||0,acordadoMin:r.acordadoMin||0,roncoMin:r.roncoMin||0,humorAcordar:r.humorAcordar||'Ok',notas:r.notas||''});setTab('hoje');setEditando(true)};
  const novaNoite=()=>{setForm({data:dataSel,foiCama:'23:00',acordou:'07:00',latenciaMin:15,acordadoMin:10,humorAcordar:'Ok',roncoMin:0,notas:''});setEditando(true)};
  const excluir=id=>{salvarSono({registros:registros.filter(r=>r.id!==id)});aviso('Registro removido')};

  const filtrados=useMemo(()=>{const n=periodo==='all'?99999:Number(periodo);return [...registros].slice(0,n).reverse()},[registros,periodo]);
  const media=campo=>filtrados.length?filtrados.reduce((a,r)=>a+(Number(r[campo])||0),0)/filtrados.length:0;
  const mediaHora=campo=>{if(!filtrados.length)return 0;const vals=filtrados.map(r=>{let m=timeMin(r[campo]);if(campo==='foiCama'&&m<720)m+=1440;return m});return vals.reduce((a,b)=>a+b,0)/vals.length};
  const regularidade=useMemo(()=>{if(filtrados.length<2)return 0;const a=filtrados.map(r=>{let m=timeMin(r.foiCama);if(m<720)m+=1440;return m}),b=filtrados.map(r=>timeMin(r.acordou));const dev=arr=>{const m=arr.reduce((x,y)=>x+y,0)/arr.length;return arr.reduce((x,y)=>x+Math.abs(y-m),0)/arr.length};return Math.max(0,Math.round(100-(dev(a)+dev(b))*.55))},[filtrados]);
  const streak=useMemo(()=>{let n=0;for(const r of registros){if((r.tempoDormindoMin||0)>=objetivoHoras*60*.9)n++;else break}return n},[registros,objetivoHoras]);
  const insight=useMemo(()=>{
    if(!atual)return'Quando você registrar a primeira noite, eu começo a conectar sono, rotina e energia.';
    if((atual.qualidade||0)>=85)return'Sua noite ficou acima do seu padrão de qualidade. Vale observar o que você repetiu ontem.';
    if((atual.eficiencia||0)<80)return'Você passou um tempo relevante na cama sem dormir. Regularidade e desaceleração podem ser os primeiros sinais para acompanhar.';
    if((atual.tempoDormindoMin||0)<objetivoHoras*60*.85)return'Você dormiu abaixo da sua meta. Hoje eu priorizaria consistência de horário antes de tentar compensar tudo de uma vez.';
    return'Sua noite ficou estável. Se esse padrão se repetir por alguns dias, eu consigo comparar com seu humor e sua energia.';
  },[atual,objetivoHoras]);

  const mudarData=dir=>{
    const dt=new Date((dataSel||hoje())+'T12:00');dt.setDate(dt.getDate()+dir);
    const iso=dt.toISOString().slice(0,10);setDataSel(iso);
    const r=registros.find(x=>x.data===iso);
    if(r)setForm({data:r.data,foiCama:r.foiCama||'23:00',acordou:r.acordou||'07:00',latenciaMin:r.latenciaMin||0,acordadoMin:r.acordadoMin||0,roncoMin:r.roncoMin||0,humorAcordar:r.humorAcordar||'Ok',notas:r.notas||''});
    else setForm(f=>({...f,data:iso}));
  };

  return <div className="sn-page">
    <header className="sn-header">
      <button className="sn-back" onClick={voltar} aria-label="Voltar"><ArrowLeft size={21}/></button>
      <Wordmark altura={32}/>
      <div className="sn-moon"><Moon size={20}/></div>
    </header>

    <section className="sn-intro">
      <div><span>SONO</span><h1>Como foi sua noite?</h1><p>Menos números soltos. Mais contexto para entender seu ritmo.</p></div>
      <img src={niilMascot} alt="NIIL" className="sn-mascot"/>
    </section>

    <nav className="sn-tabs">
      {[['hoje','Hoje',Moon],['historico','Histórico',History],['estatisticas','Insights',BarChart3],['alarme','Despertar',AlarmClock]].map(([id,n,I])=><button key={id} onClick={()=>setTab(id)} className={tab===id?'on':''}><I size={17}/><span>{n}</span></button>)}
    </nav>

    {tab==='hoje'&&<main className="sn-main">
      <div className="sn-date-nav"><button onClick={()=>mudarData(-1)}><ChevronLeft size={18}/></button><div><strong>{fmtDataLonga(dataSel)}</strong><small>{dataSel}</small></div><button onClick={()=>mudarData(1)} disabled={dataSel>=hoje()}><ChevronRight size={18}/></button></div>

      {atual?.data===dataSel?<>
        <section className="sn-hero sn-enter">
          <div className="sn-score"><Ring value={atual.qualidade}/><div className="sn-streak"><Flame size={16}/><b>{streak}</b><span>noites na sequência</span></div></div>
          <div className="sn-hero-copy"><span>ÚLTIMA NOITE</span><strong>{fmtMin(atual.tempoDormindoMin)}</strong><small>dormindo · {fmtMin(atual.tempoNaCamaMin)} na cama</small><button onClick={()=>editarAtual(atual)}><Edit3 size={15}/>Ajustar</button></div>
        </section>

        <section className="sn-coach sn-enter delay1">
          <div className="sn-coach-orb"><Sparkles size={18}/></div><div><span>NIIL percebeu</span><p>{insight}</p></div>
        </section>

        <section className="sn-card sn-enter delay2">
          <div className="sn-title"><div><span>RESUMO</span><h2>Sua noite em um olhar</h2></div><span className="sn-pill">{Math.round(atual.eficiencia||0)}% eficiência</span></div>
          <div className="sn-grid">
            <Stat icon={Clock3} label="Foi para a cama" value={atual.foiCama}/>
            <Stat icon={Sunrise} label="Acordou" value={atual.acordou}/>
            <Stat icon={Moon} label="Adormeceu após" value={`${atual.latenciaMin||0} min`}/>
            <Stat icon={Smile} label="Humor ao despertar" value={atual.humorAcordar||'—'}/>
          </div>
        </section>

        <section className="sn-card sn-enter delay3">
          <div className="sn-title"><div><span>FASES DO SONO</span><h2>Quando tivermos uma fonte real</h2></div><Watch size={19}/></div>
          {atual?.fases?.length?<div className="sn-phases">{atual.fases.map((f,i)=><div key={i} className={`phase ${f.tipo}`} style={{flex:Math.max(1,f.minutos||1)}} title={`${f.tipo}: ${f.minutos} min`}/>)}</div>:<div className="sn-native-note"><div className="sn-native-icon"><Watch size={20}/></div><div><b>Eu não vou inventar seu REM ou sono profundo.</b><p>Esses dados entram quando vierem de Apple Health, Health Connect, wearable ou monitoramento nativo do NIIL.</p></div></div>}
        </section>
      </>:<section className="sn-empty sn-enter"><img src={niilMascot} alt="" /><div><span>PRIMEIRA NOITE</span><strong>Vamos começar pelo básico.</strong><p>Registre quando foi para a cama e quando acordou. Depois eu começo a construir sua tendência.</p><button onClick={novaNoite}><Plus size={17}/>Registrar noite</button></div></section>}

      <section className="sn-goal-card sn-enter delay3">
        <div className="sn-goal-head"><div><Target size={19}/><span><b>Meta de sono</b><small>{objetivoHoras}h por noite</small></span></div><strong>{atual?Math.min(100,Math.round((atual.tempoDormindoMin||0)/(objetivoHoras*60)*100)):0}%</strong></div>
        <div className="sn-goal-track"><div style={{width:`${atual?Math.min(100,(atual.tempoDormindoMin||0)/(objetivoHoras*60)*100):0}%`}}/></div>
        <input type="range" min="5" max="10" step=".5" value={objetivoHoras} onChange={e=>salvarSono({objetivoHoras:Number(e.target.value)})}/>
      </section>
    </main>}

    {tab==='historico'&&<main className="sn-main">
      <section className="sn-section-head"><div><span>HISTÓRICO</span><h2>Seu ritmo ao longo do tempo</h2></div><button onClick={novaNoite}><Plus size={16}/>Nova noite</button></section>
      {!registros.length?<section className="sn-empty compact"><img src={niilMascot} alt=""/><div><strong>Seu histórico começa na primeira noite.</strong><button onClick={novaNoite}>Registrar agora</button></div></section>:<div className="sn-history">{registros.map((r,i)=><article className="sn-history-row sn-enter" style={{animationDelay:`${Math.min(i,6)*55}ms`}} key={r.id}><div className="sn-day-score"><strong>{Math.round(r.qualidade||0)}%</strong><span>{fmtData(r.data)}</span></div><div className="sn-hinfo"><b>{fmtMin(r.tempoDormindoMin)}</b><small>{r.foiCama} → {r.acordou} · eficiência {r.eficiencia||0}%</small></div><button onClick={()=>editarAtual(r)}>Abrir</button><button className="danger" onClick={()=>excluir(r.id)} aria-label="Excluir"><Trash2 size={15}/></button></article>)}</div>}
    </main>}

    {tab==='estatisticas'&&<main className="sn-main">
      <section className="sn-section-head"><div><span>INSIGHTS</span><h2>O que está mudando no seu sono</h2></div><Sparkles size={20}/></section>
      <div className="sn-period">{[['7','7 dias'],['28','4 semanas'],['90','3 meses'],['all','Tudo']].map(([id,n])=><button className={periodo===id?'on':''} key={id} onClick={()=>setPeriodo(id)}>{n}</button>)}</div>
      <section className="sn-scoreboard">
        <div><span>Qualidade</span><strong>{Math.round(media('qualidade'))||0}%</strong><small>média</small></div>
        <div><span>Regularidade</span><strong>{regularidade||0}%</strong><small>ritmo</small></div>
        <div><span>Eficiência</span><strong>{Math.round(media('eficiencia'))||0}%</strong><small>média</small></div>
      </section>
      <section className="sn-card"><div className="sn-title"><div><span>QUALIDADE</span><h2>Como suas noites variaram</h2></div></div><MiniBars values={filtrados.map(r=>r.qualidade||0)} max={100}/><div className="sn-xlabels">{filtrados.map(r=><span key={r.id}>{new Date(r.data+'T12:00').getDate()}/{new Date(r.data+'T12:00').getMonth()+1}</span>)}</div></section>
      <section className="sn-card"><div className="sn-title"><div><span>DURAÇÃO</span><h2>Tempo dormindo</h2></div><span className="sn-pill">{fmtMin(media('tempoDormindoMin'))} média</span></div><LineChart values={filtrados.map(r=>(r.tempoDormindoMin||0)/60)}/></section>
      <section className="sn-card"><div className="sn-title"><div><span>REGULARIDADE</span><h2>Horário de dormir</h2></div><span className="sn-pill">média {minHora(mediaHora('foiCama'))}</span></div><LineChart values={filtrados.map(r=>{let m=timeMin(r.foiCama);return m<720?m+1440:m})}/></section>
      <section className="sn-card"><div className="sn-title"><div><span>DESPERTAR</span><h2>Horário de acordar</h2></div><span className="sn-pill">média {minHora(mediaHora('acordou'))}</span></div><LineChart values={filtrados.map(r=>timeMin(r.acordou))}/></section>
    </main>}

    {tab==='alarme'&&<main className="sn-main">
      <section className="sn-alarm-hero sn-enter"><div className="sn-alarm-icon"><AlarmClock size={27}/></div><span>QUERO ACORDAR ÀS</span><input type="time" value={despertador.hora||'07:00'} onChange={e=>salvarSono({despertador:{...despertador,hora:e.target.value}})}/><label className="sn-switch"><input type="checkbox" checked={!!despertador.ativo} onChange={e=>salvarSono({despertador:{...despertador,ativo:e.target.checked}})}/><span/>{despertador.ativo?'Ativo':'Desativado'}</label></section>
      <section className="sn-card"><div className="sn-title"><div><span>JANELA INTELIGENTE</span><h2>{despertador.janelaMin||30} minutos</h2></div></div><input className="sn-range" type="range" min="10" max="45" step="5" value={despertador.janelaMin||30} onChange={e=>salvarSono({despertador:{...despertador,janelaMin:Number(e.target.value)}})}/><p className="sn-copy">No app nativo, essa janela poderá usar o estágio mais leve do sono para escolher o melhor momento de despertar.</p></section>
      <section className="sn-card"><div className="sn-title"><div><span>REPETIR</span><h2>Dias da semana</h2></div><CalendarDays size={19}/></div><div className="sn-week">{[['D',0],['S',1],['T',2],['Q',3],['Q',4],['S',5],['S',6]].map(([n,id])=>{const on=(despertador.dias||[]).includes(id);return <button className={on?'on':''} key={id} onClick={()=>{const ds=on?(despertador.dias||[]).filter(x=>x!==id):[...(despertador.dias||[]),id];salvarSono({despertador:{...despertador,dias:ds}})}}>{n}</button>})}</div></section>
      <section className="sn-card"><div className="sn-title"><div><span>FONTES</span><h2>Pronto para o app nativo</h2></div><Smartphone size={19}/></div><div className="sn-connect"><div><Watch size={21}/><span><b>Apple Health / Health Connect</b><small>Duração, estágios e sinais do dispositivo.</small></span><em>em breve</em></div><div><Mic2 size={21}/><span><b>Monitoramento pelo microfone</b><small>Opcional e com consentimento explícito.</small></span><em>em breve</em></div></div></section>
    </main>}

    {editando&&<div className="sn-modal" role="dialog" aria-modal="true"><div className="sn-sheet">
      <div className="sn-sheet-head"><div><span>REGISTRO DE SONO</span><h2>{registros.some(r=>r.data===form.data)?'Ajustar noite':'Registrar noite'}</h2></div><button onClick={()=>setEditando(false)}>×</button></div>
      <div className="sn-form-grid">
        <label>Data<input type="date" max={hoje()} value={form.data} onChange={e=>{setForm(f=>({...f,data:e.target.value}));setDataSel(e.target.value)}}/></label>
        <label>Foi para a cama<input type="time" value={form.foiCama} onChange={e=>setForm(f=>({...f,foiCama:e.target.value}))}/></label>
        <label>Acordou<input type="time" value={form.acordou} onChange={e=>setForm(f=>({...f,acordou:e.target.value}))}/></label>
        <label>Adormeceu após (min)<input type="number" min="0" max="180" inputMode="numeric" value={form.latenciaMin} onChange={e=>setForm(f=>({...f,latenciaMin:e.target.value}))}/></label>
        <label>Tempo acordado à noite<input type="number" min="0" max="360" inputMode="numeric" value={form.acordadoMin} onChange={e=>setForm(f=>({...f,acordadoMin:e.target.value}))}/></label>
        <label>Ronco percebido (min)<input type="number" min="0" max="480" inputMode="numeric" value={form.roncoMin} onChange={e=>setForm(f=>({...f,roncoMin:e.target.value}))}/></label>
        <label>Humor ao despertar<select value={form.humorAcordar} onChange={e=>setForm(f=>({...f,humorAcordar:e.target.value}))}><option>Ótimo</option><option>Bem</option><option>Ok</option><option>Cansada</option><option>Muito cansada</option></select></label>
        <label className="wide">Anotações<textarea rows="3" placeholder="Cafeína, treino, estresse, viagem..." value={form.notas} onChange={e=>setForm(f=>({...f,notas:e.target.value}))}/></label>
      </div>
      <div className="sn-preview"><Info size={16}/><span>Estimativa atual: <b>{fmtMin(calcular().tempoDormindoMin)}</b> dormindo · <b>{calcular().eficiencia}%</b> eficiência · <b>{calcular().qualidade}%</b> qualidade.</span></div>
      <button className="sn-primary" onClick={salvarNoite}><Save size={18}/>Salvar noite</button>
    </div></div>}
  </div>
}
