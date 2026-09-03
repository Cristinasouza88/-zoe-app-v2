import React,{useMemo}from'react';
import{ChevronRight,Sparkles,Target,Compass,Check,Clock3,Wallet,Moon,Dumbbell,Utensils,CalendarDays,GraduationCap,Languages,Camera,Brain,Footprints}from'lucide-react';
import'./TrilhaCoachHome.css';

const MODULOS=[
  {id:'financeiro',nome:'Financeiro',icon:Wallet,areas:['Dinheiro','Finanças','Organizar minha vida'],acao:'Olhar um movimento real do seu dinheiro',texto:'Organizar o que entra, sai e ocupa espaço na sua cabeça.'},
  {id:'agenda',nome:'Agenda',icon:CalendarDays,areas:['Organizar minha vida','Carreira','Aprendizado','Relacionamentos'],acao:'Proteger tempo para o que importa agora',texto:'Transformar intenção em um espaço real na sua semana.'},
  {id:'sono',nome:'Sono',icon:Moon,areas:['Energia','Saúde'],acao:'Observar como você está recuperando energia',texto:'Seu corpo também faz parte de qualquer mudança sustentável.'},
  {id:'comida',nome:'Nutrição',icon:Utensils,areas:['Saúde','Energia'],acao:'Registrar uma refeição sem tentar “comer perfeito”',texto:'Primeiro observamos o padrão; depois decidimos o que vale ajustar.'},
  {id:'treino',nome:'Treino',icon:Dumbbell,areas:['Saúde','Energia'],acao:'Fazer um movimento possível hoje',texto:'A ideia é criar evidência de ação, não cobrar performance.'},
  {id:'cursos',nome:'Cursos',icon:GraduationCap,areas:['Aprendizado','Carreira'],acao:'Retomar algo que você quer realmente aprender',texto:'Aprender entra na vida quando encontra contexto e continuidade.'},
  {id:'ingles',nome:'Inglês',icon:Languages,areas:['Aprendizado','Carreira'],acao:'Fazer um contato curto com o inglês hoje',texto:'Uma habilidade cresce melhor quando aparece com frequência.'},
  {id:'visao',nome:'Minha Visão',icon:Camera,areas:['Organizar minha vida','Outra coisa'],acao:'Registrar um contexto da sua vida em imagem',texto:'Algumas mudanças ficam mais claras quando você consegue vê-las.'}
];

const legivel=o=>o==='Dinheiro'?'Finanças':o||'sua vida';

function escolherModulo(d,objetivo){
  const visitados=d.trilhaNIIL?.modulosVisitados||{};
  const ordenados=[...MODULOS].sort((a,b)=>{
    const ap=a.areas.includes(objetivo)?0:1,bp=b.areas.includes(objetivo)?0:1;
    if(ap!==bp)return ap-bp;
    const av=visitados[a.id]?1:0,bv=visitados[b.id]?1:0;
    return av-bv;
  });
  return ordenados.find(m=>!visitados[m.id])||ordenados[0];
}

export default function TrilhaCoachHome({d,onContinue,abrirModulo,iniciarNovaTemporada,concluida=false,progresso={}}){
  const base=d.trilhaNIIL?.motivacaoBase||{};
  const objetivo=base.objetivo||d.trilhaNIIL?.respostas?.['meta-inicial']||null;
  const visitados=d.trilhaNIIL?.modulosVisitados||{};
  const totalVisitados=MODULOS.filter(m=>visitados[m.id]).length;
  const modulo=useMemo(()=>escolherModulo(d,objetivo),[d.trilhaNIIL?.modulosVisitados,objetivo]);
  const Icon=modulo.icon;
  const temBase=!!base.confirmadaEm||!!d.trilhaNIIL?.respostas?.['meta-recompensa'];
  const passosRestantes=Math.max(0,Number(progresso.total||0)-Number(progresso.concluidas||0));
  const foco=objetivo?legivel(objetivo):'entender o que merece sua energia agora';
  const motivo=base.recompensa||d.trilhaNIIL?.respostas?.['meta-recompensa']||null;

  if(concluida)return <div className="tc-shell">
    <section className="tc-coach-card complete">
      <div className="tc-orb"><Check size={30}/></div><span>UM CICLO FOI FECHADO</span>
      <h1>Você já tem dados suficientes para olhar sua vida de outro ponto.</h1>
      <p>O NIIL guardou escolhas, ações e registros deste ciclo. Uma nova temporada começa com você de hoje, não com uma folha em branco.</p>
      <button onClick={iniciarNovaTemporada}>Começar um novo ciclo <ChevronRight size={18}/></button>
    </section>
  </div>;

  return <div className="tc-shell">
    <header className="tc-top">
      <div><span>SUA JORNADA AGORA</span><h1>NIIL Coach</h1></div>
      <div className="tc-progress"><b>{totalVisitados}</b><small>módulos<br/>conectados</small></div>
    </header>

    <section className="tc-coach-card">
      <div className="tc-coach-head"><div className="tc-orb"><Sparkles size={25}/></div><div><span>O QUE ESTAMOS TRABALHANDO</span><h2>{objetivo?`Melhorar ${legivel(objetivo).toLowerCase()}`:'Entender seu ponto de partida'}</h2></div></div>
      <p className="tc-coach-copy">{objetivo?`Você colocou ${legivel(objetivo).toLowerCase()} entre as coisas que mais merecem atenção agora.${motivo?` E disse que quer ${String(motivo).toLowerCase()}.`:''}`:'Antes de criar metas, quero entender o que está pedindo mudança na sua vida e por quê.'}</p>
    </section>

    {!temBase?
      <section className="tc-next primary">
        <div className="tc-next-label"><Compass size={16}/><span>SEU PRÓXIMO MOVIMENTO</span></div>
        <h2>Quero entender melhor o que importa para você.</h2>
        <p>Vamos por uma pergunta de cada vez. Sem diagnóstico e sem transformar sua vida numa lista de metas.</p>
        <button onClick={onContinue}>CONTINUAR COM A NIIL <ChevronRight size={18}/></button>
        {passosRestantes>0&&<small>Você pode sair e voltar quando quiser. O ponto em que parou fica salvo.</small>}
      </section>
      :
      <>
        <section className="tc-next primary">
          <div className="tc-next-label"><Footprints size={16}/><span>SEU PRÓXIMO MOVIMENTO</span></div>
          <div className="tc-module-icon"><Icon size={27}/></div>
          <h2>{modulo.acao}</h2>
          <p>{modulo.texto}</p>
          <button onClick={()=>abrirModulo(modulo.id)}>FAZER AGORA · {modulo.nome.toUpperCase()} <ChevronRight size={18}/></button>
          <small>O NIIL vai conectando ferramentas conforme elas ganham uma razão para entrar na sua vida.</small>
        </section>

        <section className="tc-insight">
          <div className="tc-insight-title"><Brain size={18}/><span>O QUE A NIIL ESTÁ OBSERVANDO</span></div>
          <p>Seu foco continua sendo <b>{foco.toLowerCase()}</b>. Agora quero colocar esse foco em contato com a vida real antes de sugerir a próxima mudança.</p>
        </section>

        {passosRestantes>0&&<button className="tc-reflect" onClick={onContinue}><Target size={19}/><div><b>Continuar a conversa</b><small>Responder uma reflexão curta da sua jornada</small></div><ChevronRight size={18}/></button>}
      </>
    }

    <section className="tc-ecosystem">
      <div className="tc-ecosystem-head"><span>SEU SISTEMA ESTÁ SENDO CONSTRUÍDO</span><b>{totalVisitados}/{MODULOS.length}</b></div>
      <div className="tc-dots">{MODULOS.map(m=><i key={m.id} className={visitados[m.id]?'on':''} title={visitados[m.id]?`${m.nome} conectado`:'Ainda não conectado'}/>)}</div>
      <p>Você não precisa escolher todos os módulos agora. O coach apresenta cada ferramenta quando existir contexto para ela fazer sentido.</p>
    </section>
  </div>;
}
