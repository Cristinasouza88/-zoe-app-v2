import React,{useMemo,useState}from'react';
import{ArrowLeft,ChevronRight,Sparkles,Target,Mic,Check}from'lucide-react';
import TrilhaCoachHome from'./TrilhaCoachHome.jsx';
import{moduloParaAba}from'./trilha.niil.data.js';
import'./TrilhaNIIL.css';

const FOCOS=[
  ['Saúde','Quero cuidar melhor do meu corpo e da minha saúde.'],
  ['Energia','Quero ter mais disposição e parar de viver no limite.'],
  ['Dinheiro','Quero organizar minha vida financeira.'],
  ['Carreira','Quero avançar profissionalmente.'],
  ['Aprendizado','Quero aprender e realmente colocar em prática.'],
  ['Relacionamentos','Quero cuidar melhor das minhas relações.'],
  ['Organizar minha vida','Quero sentir menos caos e mais direção.'],
  ['Outra coisa','Tem outra mudança ocupando espaço para mim agora.']
];

const RECOMPENSAS={
  Saúde:['Ter mais disposição','Me sentir melhor no meu corpo','Sentir que estou me cuidando'],
  Energia:['Acordar melhor','Ter energia mais estável','Chegar ao fim do dia menos esgotada'],
  Dinheiro:['Ter mais tranquilidade','Parar de apagar incêndios','Ter mais liberdade de escolha'],
  Carreira:['Sentir que estou avançando','Ter mais autonomia','Criar novas oportunidades'],
  Aprendizado:['Concluir o que começo','Usar o que aprendo','Me sentir mais preparada'],
  Relacionamentos:['Ter relações mais leves','Criar mais conexão','Ter limites mais claros'],
  'Organizar minha vida':['Ter uma semana mais leve','Saber o que fazer primeiro','Ter tempo para o que importa'],
  'Outra coisa':['Sentir progresso real','Ter mais clareza','Parar de adiar essa mudança']
};

const hoje=()=>new Date().toISOString();

export default function TrilhaNIIL({d={},up=()=>{},setAba=()=>{},aviso=()=>{},abrirTreino=null}){
  const base=d.trilhaNIIL?.motivacaoBase||{};
  const objetivo=base.objetivo||d.trilhaNIIL?.respostas?.['meta-inicial']||null;
  const[modo,setModo]=useState(objetivo?'home':'conversa');
  const[etapa,setEtapa]=useState(objetivo?2:0);
  const[foco,setFoco]=useState(objetivo||'');
  const[importancia,setImportancia]=useState(Number(base.importancia||7));
  const[recompensa,setRecompensa]=useState(base.recompensa||'');
  const[significado,setSignificado]=useState(base.significado||'');
  const visitados=d.trilhaNIIL?.modulosVisitados||{};
  const totalConectados=Object.values(visitados).filter(Boolean).length;
  const temporadaAtual=(d.trilhaNIIL?.temporadas||[]).find(t=>t.id===d.trilhaNIIL?.temporadaAtualId)||null;
  const concluida=temporadaAtual?.status==='concluida';

  const progresso=useMemo(()=>({
    total:4,
    concluidas:objetivo?Math.min(4,1+(base.importancia?1:0)+(base.recompensa?1:0)+(base.significado?1:0)):0
  }),[objetivo,base.importancia,base.recompensa,base.significado]);

  const persistirBase=patch=>up(s=>{
    const trilha=s.trilhaNIIL||{},respostas=trilha.respostas||{},anterior=trilha.motivacaoBase||{};
    const novo={...anterior,...patch,versao:4,atualizadaEm:hoje()};
    const obj=novo.objetivo||respostas['meta-inicial']||'Outra coisa';
    const temporadas=Array.isArray(trilha.temporadas)?trilha.temporadas:[];
    const ativa=temporadas.find(t=>t.id===trilha.temporadaAtualId&&t.status==='ativa');
    const id=ativa?.id||`temporada-${Date.now()}`;
    const temporada=ativa?{...ativa,objetivo:obj,motivacaoBase:novo}:{id,numero:temporadas.length+1,status:'ativa',iniciadaEm:hoje(),objetivo:obj,motivacaoBase:novo};
    return{...s,trilhaNIIL:{...trilha,respostas:{...respostas,'meta-inicial':obj,'meta-importancia':novo.importancia??respostas['meta-importancia'],'meta-recompensa':novo.recompensa??respostas['meta-recompensa'],'meta-significado':novo.significado??respostas['meta-significado']},motivacaoBase:novo,temporadas:ativa?temporadas.map(t=>t.id===id?temporada:t):[...temporadas,temporada],temporadaAtualId:id,coach:{...(trilha.coach||{}),versao:1,ativadoEm:trilha.coach?.ativadoEm||hoje()}}};
  });

  const abrirModulo=modulo=>{
    up(s=>({...s,trilhaNIIL:{...(s.trilhaNIIL||{}),modulosVisitados:{...(s.trilhaNIIL?.modulosVisitados||{}),[modulo]:true},coach:{...(s.trilhaNIIL?.coach||{}),ultimoModulo:modulo,ultimoMovimentoEm:hoje()}}}));
    if(modulo==='treino'&&typeof abrirTreino==='function'){
      abrirTreino({origem:'trilha-coach',titulo:'Treino'});return;
    }
    const aba=moduloParaAba[modulo];
    if(aba)setAba(aba);else aviso('Este módulo ainda está sendo conectado ao Coach.');
  };

  const iniciarNovaTemporada=()=>{
    up(s=>({...s,trilhaNIIL:{...(s.trilhaNIIL||{}),motivacaoBase:null,temporadaAtualId:null,coach:{...(s.trilhaNIIL?.coach||{}),reiniciadoEm:hoje()}}}));
    setFoco('');setRecompensa('');setSignificado('');setImportancia(7);setEtapa(0);setModo('conversa');
  };

  const finalizarConversa=()=>{
    persistirBase({objetivo:foco||objetivo||'Outra coisa',importancia,recompensa:recompensa||null,significado:significado.trim()||null,confirmadaEm:base.confirmadaEm||hoje()});
    setModo('home');
    window.scrollTo({top:0,behavior:'smooth'});
  };

  if(modo==='home')return <TrilhaCoachHome d={d} progresso={progresso} concluida={concluida} abrirModulo={abrirModulo} iniciarNovaTemporada={iniciarNovaTemporada} onContinue={()=>{setFoco(objetivo||foco);setEtapa(objetivo?1:0);setModo('conversa');window.scrollTo({top:0,behavior:'smooth'})}}/>;

  const recompensas=RECOMPENSAS[foco]||RECOMPENSAS['Outra coisa'];
  return <div className="tn-shell tn-detail tc-conversation">
    <header className="tn-detail-head">
      <button onClick={()=>objetivo?setModo('home'):setAba('inicio')}><ArrowLeft size={20}/></button>
      <div><span>CONVERSA COM A NIIL</span><b>Uma coisa por vez</b></div><i>{etapa+1}/4</i>
    </header>
    <div className="tn-detail-progress"><i style={{width:`${((etapa+1)/4)*100}%`}}/></div>
    <main className="tn-detail-main">
      {etapa===0&&<section className="tc-talk-step">
        <div className="tc-talk-icon"><Sparkles size={27}/></div><span>COMEÇAMOS POR VOCÊ</span>
        <h1>Se pudesse melhorar uma coisa agora, qual faria mais diferença?</h1>
        <p>Não pense no que você deveria escolher. Pense no que está realmente ocupando espaço na sua vida.</p>
        <div className="tc-focus-list">{FOCOS.map(([id,texto])=><button key={id} className={foco===id?'on':''} onClick={()=>{setFoco(id);persistirBase({objetivo:id});setEtapa(1)}}><div><b>{id}</b><small>{texto}</small></div><ChevronRight size={18}/></button>)}</div>
      </section>}

      {etapa===1&&<section className="tc-talk-step">
        <div className="tc-talk-icon"><Target size={27}/></div><span>QUANTO ISSO IMPORTA HOJE?</span>
        <h1>{foco?`Você escolheu ${foco==='Dinheiro'?'finanças':foco.toLowerCase()}.`:'Quero entender a força desse foco.'}</h1>
        <p>Pense menos no quanto deveria importar e mais no espaço que isso realmente ocupa na sua cabeça hoje.</p>
        <div className="tc-importance"><b>{importancia}<small>/10</small></b><input type="range" min="1" max="10" value={importancia} onChange={e=>setImportancia(Number(e.target.value))}/></div>
        <button className="tc-talk-next" onClick={()=>{persistirBase({objetivo:foco||objetivo,importancia});setEtapa(2)}}>CONTINUAR <ChevronRight size={18}/></button>
      </section>}

      {etapa===2&&<section className="tc-talk-step">
        <div className="tc-talk-icon"><Sparkles size={27}/></div><span>O QUE VOCÊ QUER GANHAR DE VERDADE?</span>
        <h1>Se isso melhorar, o que muda para você?</h1>
        <p>Escolha o resultado que faria essa mudança valer o esforço.</p>
        <div className="tc-focus-list compact">{recompensas.map(x=><button key={x} className={recompensa===x?'on':''} onClick={()=>{setRecompensa(x);persistirBase({objetivo:foco||objetivo,importancia,recompensa:x});setEtapa(3)}}><div><b>{x}</b></div><ChevronRight size={18}/></button>)}</div>
      </section>}

      {etapa===3&&<section className="tc-talk-step">
        <div className="tc-talk-icon"><Mic size={27}/></div><span>NAS SUAS PALAVRAS</span>
        <h1>O que essa mudança representa para você?</h1>
        <p>Uma frase já basta. Isso ajuda o Coach a não transformar sua escolha em uma meta genérica.</p>
        <textarea value={significado} onChange={e=>setSignificado(e.target.value)} placeholder="Se isso mudasse, eu sentiria que…"/>
        <button className="tc-talk-next" onClick={finalizarConversa}><Check size={17}/> GUARDAR E COMEÇAR</button>
        <button className="tc-skip" onClick={finalizarConversa}>Prefiro responder depois</button>
      </section>}
    </main>
    <style>{`.tc-conversation{min-height:100vh;background:#fff}.tc-talk-step{padding:8px 0 90px}.tc-talk-step>span{font-size:9px;font-weight:900;letter-spacing:.1em;color:#6C9700}.tc-talk-step h1{font-size:27px;line-height:1.08;margin:13px 0 10px;letter-spacing:-.025em}.tc-talk-step p{font-size:12px;line-height:1.55;color:#77717D;margin:0 0 19px}.tc-talk-icon{width:52px;height:52px;border-radius:18px;background:#B7F20C;display:grid;place-items:center;margin-bottom:15px}.tc-focus-list{display:grid;gap:9px}.tc-focus-list button{border:1px solid #E7E4EA;border-radius:17px;background:#fff;padding:14px;display:flex;align-items:center;gap:10px;text-align:left;color:#17151D;min-height:68px}.tc-focus-list button.on{border-color:#B7F20C;background:#F7FBE9}.tc-focus-list button div{flex:1}.tc-focus-list b{font-size:12px;display:block}.tc-focus-list small{font-size:9px;color:#85808A;line-height:1.35;display:block;margin-top:4px}.tc-focus-list.compact button{min-height:54px}.tc-importance{background:#F7F8F4;border-radius:22px;padding:22px;margin:18px 0}.tc-importance b{display:block;font-size:42px;line-height:1;text-align:center}.tc-importance b small{font-size:13px;color:#8A858E}.tc-importance input{width:100%;accent-color:#B7F20C;margin-top:20px}.tc-talk-next{width:100%;border:0;border-radius:15px;background:#B7F20C;color:#17151D;min-height:50px;font:inherit;font-size:10px;font-weight:950;display:flex;align-items:center;justify-content:center;gap:7px}.tc-talk-step textarea{width:100%;min-height:145px;border:1px solid #E7E4EA;border-radius:18px;padding:15px;font:inherit;font-size:16px;resize:vertical;margin-bottom:12px}.tc-skip{width:100%;border:0;background:transparent;color:#77717D;font:inherit;font-size:10px;font-weight:800;padding:14px}`}</style>
  </div>;
}
