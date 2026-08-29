import React,{useMemo,useState}from'react';
import{ArrowLeft,BarChart3,Trophy,Target,Flame,CalendarDays,Lock,X}from'lucide-react';
import{resumoGamificacao,desafiosGamificacao}from'./gamificacao.core.js';
import{estadoBrasoesNIIL}from'./brasoes.niil.js';
import'./PerformanceNIIL.css';

const safeObj=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
const safeArr=v=>Array.isArray(v)?v:[];

export default function PerformanceNIIL({d={},voltar=()=>{}}){
  const[periodo,setPeriodo]=useState('semana');
  const[brasaoAtivo,setBrasaoAtivo]=useState(null);
  const dias=useMemo(()=>safeObj(d?.dias),[d?.dias]);
  const rodas=useMemo(()=>safeObj(d?.rodas),[d?.rodas]);
  const game=useMemo(()=>{
    try{return resumoGamificacao({...d,gamificacao:safeObj(d?.gamificacao)})}
    catch(e){console.error('NIIL Performance: resumo indisponível',e);return{pontos:0,nivel:1,pct:0,faltam:250,streakAtual:0,pontosPorDia:{},badges:[],ledger:[]}}
  },[d]);
  const desafios=useMemo(()=>{
    try{return safeArr(desafiosGamificacao({...d,gamificacao:safeObj(d?.gamificacao)}))}
    catch(e){console.error('NIIL Performance: desafios indisponíveis',e);return[]}
  },[d]);
  const brasoes=useMemo(()=>estadoBrasoesNIIL(d||{}),[d?.etapas]);
  const conquistados=brasoes.filter(x=>x.desbloqueado).length;
  const nd=periodo==='semana'?7:periodo==='mes'?30:90;
  const serie=useMemo(()=>Array.from({length:nd},(_,i)=>{
    const dt=new Date();dt.setHours(12,0,0,0);dt.setDate(dt.getDate()-(nd-1-i));
    const iso=dt.toISOString().slice(0,10),dia=safeObj(dias[iso]);
    return{iso,pts:Number(game?.pontosPorDia?.[iso]||0),agua:Number(dia.agua||0),humor:Number(dia.humor||0)};
  }),[nd,dias,game?.pontosPorDia]);
  const pontosPeriodo=serie.reduce((a,x)=>a+x.pts,0);
  const diasAtivos=serie.filter(x=>x.pts>0).length;
  const mediaHumor=(()=>{const vals=serie.map(x=>x.humor).filter(x=>x>0);return vals.length?(vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1):'—'})();
  const rodasFeitas=Object.keys(rodas).filter(k=>safeObj(rodas[k])&&Object.keys(safeObj(rodas[k])).length);
  const badges=safeArr(game?.badges);

  const abrirBrasao=b=>setBrasaoAtivo(b);
  const dataBrasao=b=>{
    if(!b?.desbloqueadoEm)return null;
    const dt=new Date(b.desbloqueadoEm);
    return Number.isNaN(dt.getTime())?null:dt.toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'});
  };

  return <div className="performance-niil">
    <header className="pn-header">
      <div className="pn-head-row">
        <button className="pn-back" onClick={voltar} aria-label="Voltar ao início"><ArrowLeft size={20}/></button>
        <div className="pn-head-copy"><h1>Performance</h1><p>Sua evolução integrada no NIIL.</p></div>
        <div className="pn-head-icon"><BarChart3 size={21}/></div>
      </div>
      <div className="pn-tabs">
        {[['semana','Semana'],['mes','Mês'],['tri','3 meses']].map(([k,l])=><button key={k} className={periodo===k?'on':''} onClick={()=>setPeriodo(k)}>{l}</button>)}
      </div>
    </header>

    <main className="pn-main">
      <section className="pn-card pn-level">
        <div className="pn-level-top">
          <div><small>NÍVEL NIIL</small><h2>Nível {Number(game?.nivel||1)}</h2><p>{Number(game?.pontos||0).toLocaleString('pt-BR')} Pontos NIIL</p></div>
          <div className="pn-level-icon"><Trophy size={25}/></div>
        </div>
        <div className="pn-progress"><i style={{width:`${Number(game?.pct||0)}%`}}/></div>
        <div className="pn-progress-meta"><span>{Math.round(Number(game?.pct||0))}% deste nível</span><span>{Number(game?.faltam||0)} pts para o próximo</span></div>
      </section>

      <section className="pn-stats">
        {[[pontosPeriodo,'Pontos'],[diasAtivos,'Dias ativos'],[Number(game?.streakAtual||0),'Sequência']].map(([v,l])=><div className="pn-card pn-stat" key={l}><strong>{v}</strong><span>{l}</span></div>)}
      </section>

      <section className="pn-card pn-brasoes-card">
        <div className="pn-section-head">
          <div><strong>Brasões da Temporada</strong><p>Um brasão aparece quando o marco inteiro é concluído.</p></div>
          <span className="pn-count">{conquistados}/9</span>
        </div>
        <div className="pn-brasoes-progress"><i style={{width:`${Math.round(conquistados/9*100)}%`}}/></div>
        <div className="pn-brasoes-grid">
          {brasoes.map(b=><button key={b.id} className={`pn-brasao ${b.desbloqueado?'unlocked':'locked'}`} onClick={()=>abrirBrasao(b)} aria-label={b.desbloqueado?`${b.marco} · ${b.nome} conquistado`:`${b.marco} bloqueado · ${b.concluidas} de ${b.total} passos`}>
            <span className="pn-brasao-media">
              {b.desbloqueado
                ?<img src={b.imagem} alt="" loading="lazy" decoding="async"/>
                :<span className="pn-brasao-lock"><Lock size={22}/></span>}
            </span>
            <b>{b.desbloqueado?`${b.marco} · ${b.nome}`:b.marco}</b>
            <small>{b.desbloqueado?'Conquistado':`${b.concluidas}/${b.total} passos`}</small>
          </button>)}
        </div>
      </section>

      <section className="pn-card">
        <div className="pn-section-head"><div><strong>Desafios ativos</strong><p>Comportamentos reais, não tempo de tela.</p></div><Target size={20}/></div>
        {desafios.length?desafios.map((x,i)=><div className="pn-challenge" key={x.id||i}>
          <div className="pn-challenge-top"><div><b>{x.titulo}</b><p>{x.descricao}</p></div><strong className={x.concluido?'done':''}>{x.atual||0}/{x.meta||0}</strong></div>
          <div className="pn-mini-progress"><i style={{width:`${Number(x.pct||0)}%`}}/></div>
        </div>):<div style={{fontSize:12,color:'#8B8791'}}>Os desafios aparecem conforme você registra movimentos no NIIL.</div>}
      </section>

      <section className="pn-card">
        <div className="pn-section-head"><strong>Resumo do período</strong><CalendarDays size={19}/></div>
        <div className="pn-summary-grid"><div><small>Humor médio</small><strong>{mediaHumor}</strong></div><div><small>Checkpoints da Roda</small><strong>{rodasFeitas.length}</strong></div></div>
      </section>

      <section className="pn-card">
        <div className="pn-section-head"><div><strong>Conquistas extras</strong><p>Consistência e movimentos que atravessam os módulos.</p></div><Trophy size={19}/></div>
        {badges.length?<div className="pn-extra-badges">{badges.slice(0,8).map((b,i)=><div className="pn-extra-badge" key={b.id||i}><i>ii</i><b>{b.titulo||'Selo NIIL'}</b></div>)}</div>:<div style={{fontSize:12,color:'#8B8791'}}>As conquistas extras surgem conforme sua prática real se acumula.</div>}
      </section>

      <section className="pn-card"><div className="pn-note"><Flame size={18}/><div><strong>Performance sem pressão</strong><p>Pontos mostram movimento. Brasões comprovam marcos concluídos. Nota alta, peso, dinheiro ou ambição não liberam brasão por si só.</p></div></div></section>
    </main>

    {brasaoAtivo&&<div className="pn-modal" role="dialog" aria-modal="true" aria-label={brasaoAtivo.desbloqueado?brasaoAtivo.nome:`${brasaoAtivo.marco} bloqueado`} onClick={()=>setBrasaoAtivo(null)}>
      <div className="pn-modal-card" onClick={e=>e.stopPropagation()}>
        <button className="pn-modal-close" onClick={()=>setBrasaoAtivo(null)} aria-label="Fechar"><X size={19}/></button>
        {brasaoAtivo.desbloqueado
          ?<img className="pn-modal-badge" src={brasaoAtivo.imagem} alt={`Brasão ${brasaoAtivo.nome}`}/>
          :<div className="pn-modal-lock"><Lock size={38}/></div>}
        <div className="pn-modal-kicker">{brasaoAtivo.desbloqueado?'BRASÃO CONQUISTADO':`${brasaoAtivo.marco} · EM PROGRESSO`}</div>
        <h2>{brasaoAtivo.desbloqueado?brasaoAtivo.nome:'Continue o marco'}</h2>
        <p className="pn-modal-phrase">{brasaoAtivo.desbloqueado?brasaoAtivo.frase:`Você concluiu ${brasaoAtivo.concluidas} de ${brasaoAtivo.total} passos. O desenho do brasão só aparece quando o marco fecha.`}</p>
        <div className="pn-rule-box">
          <span>REGRA DE DESBLOQUEIO</span>
          <p>{brasaoAtivo.criterio}</p>
          <div className="pn-rule-line"><span>Passos do marco</span><b>{brasaoAtivo.concluidas}/{brasaoAtivo.total}</b></div>
          <div className="pn-rule-line"><span>Pontos dos passos</span><b>até {brasaoAtivo.pontosEtapas} pts</b></div>
          <div className="pn-rule-line"><span>Bônus ao fechar o marco</span><b>+{brasaoAtivo.bonusMarco} pts</b></div>
          {brasaoAtivo.desbloqueado&&<div className="pn-rule-line"><span>Conquistado em</span><b>{dataBrasao(brasaoAtivo)||'Concluído'}</b></div>}
        </div>
      </div>
    </div>}
  </div>;
}
