import React, { useMemo, useState } from 'react';
import { Brain, CalendarDays, Check, ChevronRight, Circle, Compass, Plus, Sparkles, Target, Trash2 } from 'lucide-react';
import { C, Card, Btn, Campo, Area, Barra, hoje } from './ui.jsx';
import { RODA_SETORES } from './conteudo.js';

const EMOCOES = [
  { valor: 1, rosto: '︵', nome: 'Sobrecarregada', cor: '#D98B82' },
  { valor: 2, rosto: '⌢', nome: 'Desanimada', cor: '#D7A74E' },
  { valor: 3, rosto: '—', nome: 'Neutra', cor: '#98A5AE' },
  { valor: 4, rosto: '⌣', nome: 'Bem', cor: '#48BC8B' },
  { valor: 5, rosto: '★', nome: 'Energizada', cor: '#075B59' }
];

const DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

const som = (tipo = 'tap') => {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const mapa = tipo === 'ganho' ? [523, 659] : tipo === 'feito' ? [440, 660] : [420];
    osc.type = 'sine'; osc.frequency.value = mapa[0];
    gain.gain.setValueAtTime(.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(.08, ctx.currentTime + .015);
    gain.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + .18);
    osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + .2);
    if (mapa[1]) setTimeout(() => { try { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = mapa[1]; g.gain.value = .05; o.connect(g); g.connect(ctx.destination); o.start(); g.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + .15); o.stop(ctx.currentTime + .16); } catch {} }, 115);
  } catch {}
};

function Titulo({ icone: Icone, selo, titulo, texto, progresso }) {
  return <div className="niil-surge" style={{ marginBottom: 18 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 13 }}>
      <span style={{ display: 'inline-flex', gap: 7, alignItems: 'center', color: C.roxo, fontSize: 10.5, fontWeight: 900, letterSpacing: .8 }}><Icone size={16}/>{selo}</span>
      {progresso && <span style={{ color: C.ink3, fontSize: 10.5, fontWeight: 800 }}>{progresso}</span>}
    </div>
    <h2 style={{ margin: '0 0 7px', color: C.ink, fontSize: 23, lineHeight: 1.16 }}>{titulo}</h2>
    <p style={{ margin: 0, color: C.ink2, fontSize: 13.5, lineHeight: 1.55 }}>{texto}</p>
  </div>;
}

function EscalaRoda({ valores, onChange, cor = C.roxo }) {
  const preenchidos = RODA_SETORES.filter(s => valores[s]).length;
  return <div>
    <Card style={{ marginBottom: 15, background: '#FFFFFF', border: '1px solid #EEE6F8' }}>
      <div style={{ display:'flex',justifyContent:'space-between',fontSize:12,fontWeight:800,color:C.ink2,marginBottom:8 }}><span>Áreas avaliadas</span><span style={{ color:cor }}>{preenchidos}/{RODA_SETORES.length}</span></div>
      <Barra v={preenchidos} max={RODA_SETORES.length} cor={cor}/>
    </Card>
    {RODA_SETORES.map((setor, idx) => {
      const v = valores[setor] || 0;
      return <Card key={setor} cls="niil-surge" delay={idx * 25} style={{ marginBottom: 9, padding: 13 }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:9 }}><strong style={{ color:C.ink,fontSize:13 }}>{setor}</strong><span style={{ minWidth:28,textAlign:'center',padding:'4px 7px',borderRadius:8,background:v?`${cor}18`:'#F2F5F4',color:v?cor:C.ink3,fontSize:12,fontWeight:900 }}>{v || '–'}</span></div>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(10,1fr)',gap:4 }}>
          {Array.from({ length:10 },(_,i)=>i+1).map(n=><button key={n} onClick={()=>{som();onChange(setor,n)}} aria-label={`${setor}: ${n}`} style={{ height:28,border:0,borderRadius:8,background:n<=v?cor:'#EDF1F0',color:n<=v?'#fff':C.ink3,fontSize:10,fontWeight:800,fontFamily:'inherit',cursor:'pointer' }}>{n}</button>)}
        </div>
      </Card>;
    })}
  </div>;
}

export default function JornadaSistemica({ id, d, up, campo, setCampo, aviso, avatar }) {
  const [novoNo, setNovoNo] = useState('');
  const jornada = d.jornada || {};
  const roda1 = d.rodas?.[1] || {};
  const roda2 = d.rodas?.[2] || {};
  const prioridade = campo('niil-prioridade');
  const menores = useMemo(() => RODA_SETORES.filter(s => roda1[s]).sort((a,b)=>(roda1[a]||0)-(roda1[b]||0)).slice(0,4), [roda1]);

  if (id === 'checkinEmocional') return <div>
    <Titulo icone={Sparkles} selo="COMEÇO" progresso="1 de 8" titulo="Como você chega hoje?" texto="Não existe resposta certa. A NIIL usa este estado para ajustar o ritmo da sua jornada."/>
    <div style={{ display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:7 }}>
      {EMOCOES.map(e=>{ const on=jornada.emocaoAtual?.valor===e.valor; return <button key={e.valor} onClick={()=>{som('ganho');up(s=>({...s,jornada:{...(s.jornada||{}),emocaoAtual:{...e,data:new Date().toISOString()},checkins:[...((s.jornada||{}).checkins||[]),{...e,data:new Date().toISOString()}]}}))}} style={{ border:`2px solid ${on?e.cor:C.line}`,background:on?`${e.cor}12`:'#fff',borderRadius:18,padding:'14px 4px 11px',fontFamily:'inherit',cursor:'pointer',boxShadow:on?`0 7px 18px ${e.cor}20`:'none' }}><div style={{ width:38,height:38,borderRadius:'50%',background:on?e.cor:'#F2F5F4',color:on?'#fff':C.ink3,display:'grid',placeItems:'center',margin:'0 auto 8px',fontSize:23,fontWeight:900 }}>{e.rosto}</div><span style={{ display:'block',fontSize:8.5,lineHeight:1.2,fontWeight:800,color:on?e.cor:C.ink3 }}>{e.nome}</span></button>})}
    </div>
    {jornada.emocaoAtual && <Card cls="niil-surge" style={{ marginTop:16,background:C.aquaSuave,border:'1px solid #CDEFE9' }}><strong style={{ color:C.petroleo,fontSize:13 }}>Entendi.</strong><p style={{ color:C.ink2,fontSize:12.5,lineHeight:1.5,margin:'5px 0 0' }}>Vamos observar o que está por trás desse estado, sem tentar corrigir você às pressas.</p></Card>}
  </div>;

  if (id === 'rodaInicial') return <div>
    <Titulo icone={Target} selo="MAPEAR" progresso="2 de 8" titulo="Sua vida, área por área" texto="Dê uma nota de 1 a 10 para a sua satisfação atual. Esta fotografia ficará salva para comparação."/>
    <EscalaRoda valores={roda1} onChange={(s,n)=>up(st=>({...st,rodas:{...st.rodas,1:{...(st.rodas?.[1]||{}),[s]:n}},jornada:{...(st.jornada||{}),rodaInicialEm:st.jornada?.rodaInicialEm||new Date().toISOString()}}))}/>
  </div>;

  if (id === 'escolhaPrioridade') return <div>
    <Titulo icone={Compass} selo="ESCOLHER" progresso="3 de 8" titulo="Onde uma mudança faria diferença?" texto="A menor nota nem sempre é a prioridade. Escolha a área que pode gerar efeito positivo nas demais."/>
    {(menores.length?menores:RODA_SETORES.slice(0,4)).map((s,i)=><button key={s} onClick={()=>{som();setCampo('niil-prioridade',s)}} style={{ width:'100%',display:'flex',alignItems:'center',gap:12,padding:14,marginBottom:9,borderRadius:17,border:`2px solid ${prioridade===s?C.roxo:C.line}`,background:prioridade===s?'#FFFFFF':'#fff',fontFamily:'inherit',textAlign:'left',cursor:'pointer' }}><span style={{ width:34,height:34,borderRadius:11,background:prioridade===s?C.roxo:C.aquaSuave,color:prioridade===s?'#fff':C.roxo,display:'grid',placeItems:'center',fontWeight:900 }}>{roda1[s]||i+1}</span><span style={{ flex:1,color:C.ink,fontSize:14,fontWeight:850 }}>{s}</span>{prioridade===s&&<Check size={19} color={C.roxo}/>}</button>)}
    <Area label="Por que esta área importa agora?" value={campo('niil-prioridade-porque')} onChange={e=>setCampo('niil-prioridade-porque',e.target.value)} placeholder="O que mudaria na sua vida se ela avançasse um pouco?"/>
  </div>;

  if (id === 'matrizGanhosPerdas') {
    const qs=[['ganho-mudar','O que ganho mudando?','Possibilidades, alívio, resultados…',C.green],['perda-mudar','O que posso perder mudando?','Conforto, aprovação, hábitos…',C.roxo],['ganho-nao','O que ganho não mudando?','O benefício escondido de permanecer…',C.gold],['perda-nao','O que perco se nada mudar?','Como isso estará em 6 ou 12 meses?',C.coral]];
    return <div><Titulo icone={Brain} selo="COMPREENDER" progresso="4 de 8" titulo="Toda mudança tem dois lados" texto={`Vamos enxergar a decisão sobre ${prioridade||'sua prioridade'} sem respostas bonitas ou culpa.`}/><div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:9 }}>{qs.map(([k,t,p,c],i)=><Card key={k} cls="niil-surge" delay={i*60} style={{ padding:12,borderTop:`4px solid ${c}` }}><label style={{ display:'block',minHeight:34,color:C.ink,fontSize:11.5,fontWeight:900,lineHeight:1.3 }}>{t}</label><textarea value={campo(`matriz-${k}`)} onChange={e=>setCampo(`matriz-${k}`,e.target.value)} placeholder={p} style={{ width:'100%',height:96,resize:'none',border:0,outline:0,background:'#F7F9F8',borderRadius:11,padding:9,color:C.ink,fontFamily:'inherit',fontSize:12,lineHeight:1.4 }}/></Card>)}</div></div>;
  }

  if (id === 'mapaMental') {
    const nos=jornada.mapaNos||[];
    const adicionar=()=>{if(!novoNo.trim())return;som();up(s=>({...s,jornada:{...(s.jornada||{}),mapaNos:[...((s.jornada||{}).mapaNos||[]),{id:Date.now(),texto:novoNo.trim()}]}}));setNovoNo('')};
    return <div><Titulo icone={Compass} selo="CONECTAR" progresso="5 de 8" titulo="O que influencia esta área?" texto="Crie um mapa com pessoas, ambientes, hábitos, pensamentos e acontecimentos ligados à sua prioridade."/><Card style={{ textAlign:'center',padding:22,background:'#FFFFFF',border:`1px solid ${C.line}` }}><div style={{ width:112,height:112,borderRadius:'50%',background:C.roxo,color:'#fff',display:'grid',placeItems:'center',margin:'0 auto 18px',padding:14,fontWeight:900,fontSize:13,boxShadow:'0 10px 24px rgba(142,45,226,.22)' }}>{prioridade||'Minha prioridade'}</div><div style={{ display:'flex',flexWrap:'wrap',justifyContent:'center',gap:8 }}>{nos.map((n,i)=><div key={n.id} className="niil-surge" style={{ display:'inline-flex',alignItems:'center',gap:5,padding:'9px 10px',borderRadius:13,background:i%2?C.aquaSuave:C.aquaSuave,color:C.ink,fontSize:11.5,fontWeight:750 }}><span>{n.texto}</span><button onClick={()=>up(s=>({...s,jornada:{...(s.jornada||{}),mapaNos:((s.jornada||{}).mapaNos||[]).filter(x=>x.id!==n.id)}}))} style={{border:0,background:'transparent',padding:0,color:C.ink3}}><Trash2 size={12}/></button></div>)}</div>{!nos.length&&<p style={{ color:C.ink3,fontSize:12,margin:0 }}>Seu mapa começa no centro.</p>}</Card><div style={{ display:'flex',gap:8,marginTop:12 }}><input value={novoNo} onChange={e=>setNovoNo(e.target.value)} onKeyDown={e=>e.key==='Enter'&&adicionar()} placeholder="Ex.: horário de trabalho, medo, uma pessoa…" style={{ flex:1,minWidth:0,padding:'12px 13px',borderRadius:13,border:`1.5px solid ${C.line}`,fontFamily:'inherit',fontSize:13,outline:0 }}/><button onClick={adicionar} style={{ width:44,border:0,borderRadius:13,background:C.green,color:C.ink }}><Plus size={19}/></button></div></div>;
  }

  if (id === 'experimentoSemana') return <div>
    <Titulo icone={Sparkles} selo="EXPERIMENTAR" progresso="6 de 8" titulo="Um teste, não uma promessa eterna" texto="Escolha uma ação pequena o suficiente para caber na vida real e relevante o bastante para ensinar algo."/>
    <Campo label="Ação que vou testar" value={campo('exp-acao')} onChange={e=>setCampo('exp-acao',e.target.value)} placeholder="Ex.: estudar inglês por 15 minutos"/>
    <Campo label="Quando e em qual contexto?" value={campo('exp-contexto')} onChange={e=>setCampo('exp-contexto',e.target.value)} placeholder="Ex.: depois do café, antes de abrir as redes"/>
    <Area label="Se o obstáculo aparecer, então eu…" value={campo('exp-plano-b')} onChange={e=>setCampo('exp-plano-b',e.target.value)} placeholder="Ex.: faço apenas 5 minutos, mas mantenho o compromisso" style={{ minHeight:80 }}/>
    <Card style={{ background:C.aquaSuave,border:'1px solid #CDEFE9' }}><span style={{ color:C.petroleo,fontSize:11,fontWeight:900 }}>PLANO SE–ENTÃO</span><p style={{ color:C.ink,fontSize:13,lineHeight:1.5,margin:'6px 0 0' }}>Se <strong>{campo('exp-contexto')||'o contexto combinado acontecer'}</strong>, então eu vou <strong>{campo('exp-acao')||'realizar minha pequena ação'}</strong>.</p></Card>
  </div>;

  if (id === 'ativarAgenda') {
    const plano=jornada.planoSemana||{dias:[],hora:'07:30',duracao:15};
    const salvar=()=>{ if(!campo('exp-acao'))return aviso('Defina a ação da etapa anterior'); if(!plano.dias?.length)return aviso('Escolha ao menos um dia'); som('feito');up(s=>({...s,jornada:{...(s.jornada||{}),planoSemana:{...plano,acao:campo('exp-acao'),contexto:campo('exp-contexto'),planoB:campo('exp-plano-b'),criadoEm:new Date().toISOString(),ativo:true}}}));aviso('Experimento ativado na agenda') };
    return <div><Titulo icone={CalendarDays} selo="ORGANIZAR" progresso="7 de 8" titulo="Quando isso cabe na sua semana?" texto="A NIIL colocará o experimento na agenda. Você poderá ajustar sem perder seu progresso."/><Card style={{ marginBottom:13 }}><div style={{ color:C.ink,fontSize:14,fontWeight:900,marginBottom:11 }}>{campo('exp-acao')||'Defina a ação na etapa anterior'}</div><div style={{ display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:5 }}>{DIAS.map(dia=>{const on=plano.dias?.includes(dia);return <button key={dia} onClick={()=>{som();up(s=>{const p=s.jornada?.planoSemana||plano;const ds=p.dias||[];return {...s,jornada:{...(s.jornada||{}),planoSemana:{...p,dias:on?ds.filter(x=>x!==dia):[...ds,dia]}}}})}} style={{ height:38,border:0,borderRadius:10,background:on?C.roxo:'#F1F3F2',color:on?'#fff':C.ink3,fontSize:9.5,fontWeight:850,fontFamily:'inherit' }}>{dia}</button>})}</div><div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginTop:13 }}><Campo label="Horário" type="time" value={plano.hora||'07:30'} onChange={e=>up(s=>({...s,jornada:{...(s.jornada||{}),planoSemana:{...(s.jornada?.planoSemana||plano),hora:e.target.value}}}))}/><Campo label="Minutos" type="number" value={plano.duracao||15} onChange={e=>up(s=>({...s,jornada:{...(s.jornada||{}),planoSemana:{...(s.jornada?.planoSemana||plano),duracao:+e.target.value}}}))}/></div></Card><Btn onClick={salvar} style={{ width:'100%',padding:15 }}>ATIVAR NA MINHA AGENDA</Btn>{plano.ativo&&<Card cls="niil-surge" style={{ marginTop:12,background:C.limaSuave,border:'1px solid #DDF3B4' }}><div style={{ display:'flex',gap:9,alignItems:'center' }}><Check size={20} color={C.petroleo}/><div><strong style={{ display:'block',color:C.petroleo,fontSize:13 }}>Experimento ativo</strong><span style={{ color:C.ink2,fontSize:11 }}>{plano.dias.join(', ')} · {plano.hora} · {plano.duracao} min</span></div></div></Card>}</div>;
  }

  if (id === 'checkpointRoda') {
    const preenchidos=RODA_SETORES.filter(s=>roda2[s]).length;
    const inicial=RODA_SETORES.reduce((a,s)=>a+(roda1[s]||0),0)/Math.max(1,RODA_SETORES.filter(s=>roda1[s]).length);
    const agora=RODA_SETORES.reduce((a,s)=>a+(roda2[s]||0),0)/Math.max(1,preenchidos);
    return <div><Titulo icone={Target} selo="APRENDER" progresso="8 de 8" titulo="O que mudou nesta primeira volta?" texto="Refaça a fotografia. A mudança pode ser pequena; o importante é reconhecer o que os dados mostram."/><EscalaRoda valores={roda2} cor={C.green} onChange={(s,n)=>up(st=>({...st,rodas:{...st.rodas,2:{...(st.rodas?.[2]||{}),[s]:n}},jornada:{...(st.jornada||{}),checkpointEm:new Date().toISOString()}}))}/>{preenchidos===RODA_SETORES.length&&<Card cls="niil-celebra" style={{ marginTop:16,textAlign:'center',padding:22,background:C.aquaSuave,border:'1px solid #DDE8B8' }}><div style={{ width:72,height:72,borderRadius:24,background:C.green,color:C.ink,display:'grid',placeItems:'center',margin:'0 auto 14px',boxShadow:'0 8px 18px rgba(23,21,29,.08)' }}><Check size={34} strokeWidth={2.5}/></div><h3 style={{ color:C.petroleo,fontSize:20,margin:'5px 0 7px' }}>Primeira volta concluída!</h3><p style={{ color:C.ink2,fontSize:12.5,lineHeight:1.5,margin:0 }}>Sua média foi de {inicial.toFixed(1)} para {agora.toFixed(1)}. Mais importante que subir a nota é entender o que funcionou.</p><button onClick={()=>som('ganho')} style={{ marginTop:14,border:0,borderRadius:13,background:C.green,color:C.ink,padding:'11px 16px',fontWeight:900,fontFamily:'inherit' }}>OUVIR CONQUISTA</button></Card>}</div>;
  }

  return null;
}

