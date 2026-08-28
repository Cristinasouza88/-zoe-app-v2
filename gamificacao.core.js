import { TRILHA_NIIL as TRILHA } from './trilha.niil.data.js';
import { normalizarFinanceiro, reservaResumo, mesDa } from './financeiro.core.js';

export const PONTOS_NIIL = Object.freeze({
  CHECKIN: 3,
  REGISTRO: 5,
  ACAO: 10,
  REFLEXAO: 15,
  FERRAMENTA: 20,
  MARCO: 25,
  FASE: 50,
  CONCLUSAO: 100
});

export const GAMIFICACAO_INICIAL = Object.freeze({
  versao: 1,
  pontos: 0,
  nivel: 1,
  ledger: [],
  badges: [],
  streakAtual: 0,
  melhorStreak: 0,
  diasAtivos: []
});

const NIVEL_LIMITES = [0, 250, 600, 1200, 2200, 3500, 5200, 7500];

export const BADGES_NIIL = Object.freeze([
  { id:'primeiro-movimento', titulo:'Primeiro movimento', descricao:'Você registrou sua primeira ação real de evolução.', tipo:'geral' },
  { id:'consistencia-7', titulo:'Consistência 7', descricao:'7 dias consecutivos colocando sua evolução em movimento.', tipo:'consistencia' },
  { id:'treinos-5', titulo:'5 treinos', descricao:'5 treinos registrados no NIIL.', tipo:'saude' },
  { id:'aulas-10', titulo:'10 aulas', descricao:'10 aulas concluídas em trilhas de estudo.', tipo:'estudos' },
  { id:'reflexoes-10', titulo:'10 reflexões', descricao:'10 reflexões significativas concluídas.', tipo:'autoconhecimento' },
  { id:'financeiro-base', titulo:'Base financeira', descricao:'Seu ponto de partida financeiro foi organizado.', tipo:'financas' },
  { id:'primeira-fase', titulo:'Primeira fase', descricao:'Uma fase completa da trilha central foi concluída.', tipo:'trilha' },
  { id:'mil-pontos', titulo:'1.000 pontos', descricao:'Você alcançou 1.000 Pontos NIIL.', tipo:'geral' }
]);

const isoHoje=()=>new Date().toISOString().slice(0,10);
const normalizaData=v=>{
  const s=String(v||'').slice(0,10);
  return /^\d{4}-\d{2}-\d{2}$/.test(s)?s:isoHoje();
};
const slug=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')||'item';
const uniq=arr=>Array.from(new Set(arr.filter(Boolean)));
const array=v=>Array.isArray(v)?v:[];

export function nivelPorPontos(pontos=0){
  const p=Math.max(0,Number(pontos)||0);
  let nivel=1;
  NIVEL_LIMITES.forEach((min,i)=>{if(p>=min)nivel=i+1});
  const atual=NIVEL_LIMITES[nivel-1]??0;
  const proximo=NIVEL_LIMITES[nivel]??(atual+3000);
  return{
    nivel,
    pontos:p,
    inicioNivel:atual,
    proximoNivel:proximo,
    faltam:Math.max(0,proximo-p),
    pct:proximo===atual?100:Math.max(0,Math.min(100,(p-atual)/(proximo-atual)*100))
  };
}

export function normalizarGamificacao(raw){
  const g=raw&&typeof raw==='object'?raw:{};
  const ledger=array(g.ledger).filter(x=>x&&x.key);
  const pontos=ledger.reduce((a,x)=>a+Math.max(0,Number(x.pontos)||0),0);
  const diasAtivos=uniq(ledger.filter(x=>x.contaConsistencia!==false).map(x=>normalizaData(x.data))).sort();
  const streak=calcularStreak(diasAtivos);
  return{
    ...GAMIFICACAO_INICIAL,
    ...g,
    versao:1,
    ledger,
    pontos,
    nivel:nivelPorPontos(pontos).nivel,
    diasAtivos,
    streakAtual:streak.atual,
    melhorStreak:Math.max(Number(g.melhorStreak)||0,streak.melhor),
    badges:array(g.badges)
  };
}

export function calcularStreak(dias=[]){
  const set=new Set(uniq(dias).sort());
  let melhor=0,serie=0,anterior=null;
  [...set].sort().forEach(d=>{
    const dt=new Date(d+'T12:00:00');
    if(anterior){
      const diff=Math.round((dt-anterior)/86400000);
      serie=diff===1?serie+1:1;
    }else serie=1;
    melhor=Math.max(melhor,serie);
    anterior=dt;
  });
  let atual=0;
  for(let i=0;i<500;i++){
    const dt=new Date();dt.setHours(12,0,0,0);dt.setDate(dt.getDate()-i);
    const key=dt.toISOString().slice(0,10);
    if(set.has(key))atual++;
    else if(i===0)continue;
    else break;
  }
  return{atual,melhor};
}

const evento=(key,tipo,pontos,titulo,area,data,extra={})=>({
  key,
  tipo,
  pontos:Math.max(0,Number(pontos)||0),
  titulo,
  area,
  data:normalizaData(data),
  criadoEm:new Date().toISOString(),
  contaConsistencia:extra.contaConsistencia!==false,
  trilhaId:extra.trilhaId||null,
  metaId:extra.metaId||null,
  origemId:extra.origemId||null,
  contexto:extra.contexto||null
});

const pontosEtapa=et=>{
  if(Number(et.pontos)>0)return Number(et.pontos);
  if(et.tipo==='leitura')return PONTOS_NIIL.REGISTRO;
  if(et.tipo==='fichas'||et.tipo==='dia7')return PONTOS_NIIL.REFLEXAO;
  if(et.tipo==='agenda')return PONTOS_NIIL.ACAO;
  if(et.tipo==='roda'||et.tipo==='ferramenta')return PONTOS_NIIL.FERRAMENTA;
  if(et.tipo==='micro')return PONTOS_NIIL.ACAO;
  return PONTOS_NIIL.ACAO;
};

const mapaAgenda=()=>{
  const map={};
  TRILHA.forEach(bloco=>bloco.etapas.filter(e=>e.tipo==='agenda').forEach(et=>{
    (et.tarefas||[]).forEach((t,i)=>{map[`${et.id}-${i}`]={...t,etapaId:et.id,blocoId:bloco.id}});
  }));
  return map;
};
const AGENDA_MAP=mapaAgenda();

function eventosTrilha(d){
  const out=[];
  TRILHA.forEach(bloco=>{
    bloco.etapas.forEach(et=>{
      const estado=d.etapas?.[et.id];
      if(!estado?.feito)return;
      out.push(evento(
        `trilha:etapa:${et.id}`,
        et.tipo==='fichas'||et.tipo==='dia7'?'trail.reflection.completed':et.tipo==='leitura'?'trail.reading.completed':'trail.tool.completed',
        pontosEtapa(et),
        et.titulo,
        'trilha',
        estado.data||estado.concluidaEm,
        {trilhaId:'niil-central',origemId:et.id,contexto:{blocoId:bloco.id,bloco:bloco.nome,tipo:et.tipo}}
      ));
    });
    const completas=bloco.etapas.length>0&&bloco.etapas.every(et=>d.etapas?.[et.id]?.feito);
    if(completas){
      const ultima=bloco.etapas[bloco.etapas.length-1];
      out.push(evento(
        `trilha:bloco:${bloco.id}`,
        'trail.phase.completed',
        PONTOS_NIIL.FASE,
        `Fase concluída · ${bloco.nome}`,
        'trilha',
        d.etapas?.[ultima.id]?.data,
        {trilhaId:'niil-central',origemId:bloco.id}
      ));
    }
  });
  const tudo=TRILHA.length&&TRILHA.every(b=>b.etapas.every(et=>d.etapas?.[et.id]?.feito));
  if(tudo){
    const ultima=TRILHA.at(-1)?.etapas?.at(-1);
    out.push(evento('trilha:central:concluida','trail.completed',PONTOS_NIIL.CONCLUSAO,'Trilha NIIL concluída','trilha',d.etapas?.[ultima?.id]?.data,{trilhaId:'niil-central'}));
  }
  return out;
}

function eventosAgenda(d){
  const out=[];
  Object.entries(d.agenda||{}).forEach(([data,marcas])=>{
    Object.entries(marcas||{}).forEach(([key,feito])=>{
      if(!feito)return;
      if(key==='niil-experimento'){
        out.push(evento(`agenda:${data}:niil-experimento`,'action.experiment.completed',PONTOS_NIIL.FERRAMENTA,'Experimento NIIL realizado','trilha',data,{trilhaId:'niil-central',origemId:key}));
        return;
      }
      if(key.startsWith('niil-agenda-viva-')){
        out.push(evento(`agenda:${data}:${key}`,'action.completed',PONTOS_NIIL.ACAO,'Ação da trilha realizada','rotina',data,{trilhaId:'niil-central',origemId:key}));
        return;
      }
      const tarefa=AGENDA_MAP[key];
      if(!tarefa)return;
      if(/academia|treino/i.test(tarefa.t||''))return;
      out.push(evento(
        `agenda:${data}:${key}`,
        'action.completed',
        PONTOS_NIIL.ACAO,
        tarefa.t||'Ação concluída',
        'rotina',
        data,
        {trilhaId:'niil-central',origemId:key,contexto:{blocoId:tarefa.blocoId}}
      ));
    });
  });
  return out;
}

function eventosCursos(d){
  const out=[];
  array(d.cursos).forEach(curso=>{
    const aulas=array(curso.aulas);
    aulas.forEach(a=>{
      if(!a.feito)return;
      out.push(evento(
        `curso:aula:${curso.id}:${a.id}`,
        'course.lesson.completed',
        PONTOS_NIIL.ACAO,
        a.titulo||'Aula concluída',
        'estudos',
        a.data,
        {trilhaId:`curso:${curso.id}`,origemId:a.id,contexto:{cursoId:curso.id,curso:curso.nome}}
      ));
      if(a.avaliacao?.insight){
        out.push(evento(
          `curso:reflexao:${curso.id}:${a.id}`,
          'course.reflection.completed',
          PONTOS_NIIL.REGISTRO,
          `Reflexão · ${a.titulo||'aula'}`,
          'estudos',
          a.avaliacao.data||a.data,
          {trilhaId:`curso:${curso.id}`,origemId:a.id}
        ));
      }
    });
    const modulos=uniq(aulas.map(a=>a.modulo||'Comece por aqui'));
    modulos.forEach(mod=>{
      const grupo=aulas.filter(a=>(a.modulo||'Comece por aqui')===mod);
      if(grupo.length&&grupo.every(a=>a.feito)){
        out.push(evento(
          `curso:modulo:${curso.id}:${slug(mod)}`,
          'course.module.completed',
          PONTOS_NIIL.MARCO,
          `Módulo concluído · ${mod}`,
          'estudos',
          grupo.map(a=>a.data).filter(Boolean).sort().at(-1),
          {trilhaId:`curso:${curso.id}`,origemId:mod}
        ));
      }
    });
    if(aulas.length&&aulas.every(a=>a.feito)){
      out.push(evento(
        `curso:concluido:${curso.id}`,
        'course.completed',
        PONTOS_NIIL.CONCLUSAO,
        `Curso concluído · ${curso.nome||'Curso'}`,
        'estudos',
        aulas.map(a=>a.data).filter(Boolean).sort().at(-1),
        {trilhaId:`curso:${curso.id}`,origemId:curso.id}
      ));
    }
  });
  return out;
}

function eventosTreino(d){
  return array(d.treinos).map(t=>{
    const planejado=['agenda','curso'].includes(t.origem);
    return evento(
      `treino:${t.id||slug([t.data,t.titulo,t.criadoEm].join('-'))}`,
      planejado?'workout.planned.completed':'workout.completed',
      planejado?PONTOS_NIIL.FERRAMENTA:PONTOS_NIIL.ACAO,
      t.titulo||'Treino registrado',
      'saude',
      t.data||t.criadoEm,
      {trilhaId:t.origem==='curso'?'curso-vinculado':t.origem==='agenda'?'niil-central':null,origemId:t.id||null,contexto:{exercicios:array(t.exercicios).length}}
    );
  });
}

function eventosBemEstar(d){
  const out=[];
  array(d.sono?.registros).forEach(r=>out.push(evento(
    `sono:${r.id||r.data}`,
    'sleep.logged',
    PONTOS_NIIL.REGISTRO,
    'Noite de sono registrada',
    'saude',
    r.data,
    {origemId:r.id||r.data}
  )));
  Object.entries(d.dias||{}).forEach(([data,dia])=>{
    if(Number(dia?.humor)>0)out.push(evento(`humor:${data}`,'mood.logged',PONTOS_NIIL.CHECKIN,'Check-in de humor','bem-estar',data,{origemId:data}));
    const metaAgua=Number(d.perfil?.metaAgua||0);
    if(metaAgua>0&&Number(dia?.agua||0)>=metaAgua)out.push(evento(`agua:meta:${data}`,'water.goal.completed',PONTOS_NIIL.REGISTRO,'Meta de água atingida','saude',data,{origemId:data}));
  });
  array(d.medidas).forEach((m,i)=>out.push(evento(
    `medidas:${m.id||[m.data,m.peso,m.cintura,m.barriga,i].join(':')}`,
    'body.measurement.logged',
    PONTOS_NIIL.REGISTRO,
    'Medidas registradas',
    'saude',
    m.data,
    {origemId:m.id||null}
  )));
  array(d.fotos).filter(f=>f.etapaId).forEach(f=>out.push(evento(
    `foto:evolucao:${f.id}`,
    'progress.photo.logged',
    2,
    'Foto de evolução registrada',
    'progresso',
    f.data,
    {trilhaId:'niil-central',origemId:f.id,contexto:{etapaId:f.etapaId}}
  )));
  return out;
}

function eventosPraticas(d){
  const out=[];

  /* Um check-in conta no máximo uma vez por dia, mesmo que a pessoa ajuste a emoção. */
  const checkinsPorDia=new Map();
  array(d.jornada?.checkins).forEach(x=>{
    const data=normalizaData(x.data);
    if(!checkinsPorDia.has(data))checkinsPorDia.set(data,x);
  });
  checkinsPorDia.forEach((x,data)=>out.push(evento(
    `jornada:checkin:${data}`,
    'wellbeing.checkin.completed',
    PONTOS_NIIL.CHECKIN,
    'Check-in de percepção',
    'bem-estar',
    data,
    {trilhaId:'niil-central',origemId:data}
  )));

  /* Ritual vale pela prática completa do dia, nunca pela quantidade de passos isolados. */
  Object.entries(d.ritual||{}).forEach(([data,marcas])=>{
    const completo=Object.values(marcas||{}).filter(Boolean).length>=9;
    if(completo)out.push(evento(
      `ritual:${data}`,
      'routine.ritual.completed',
      PONTOS_NIIL.ACAO,
      'Ritual concluído',
      'rotina',
      data,
      {trilhaId:'niil-central',origemId:data}
    ));
  });

  /* Ativação 40 é uma prática completa; repetir cliques não multiplica pontos. */
  if(Object.values(d.ativacao40?.marcas||{}).filter(Boolean).length>=40){
    const data=isoHoje();
    out.push(evento(
      `ativacao40:${data}`,
      'practice.activation.completed',
      PONTOS_NIIL.ACAO,
      'Ativação 40 concluída',
      'autoconhecimento',
      data,
      {trilhaId:'niil-central',origemId:data}
    ));
  }

  /* Desafio 100: cada dia sustentado é uma evidência pequena, limitada a 5 pontos. */
  Object.entries(d.desafio100||{}).forEach(([dia,feito])=>{
    if(!feito)return;
    out.push(evento(
      `desafio100:dia:${dia}`,
      'practice.challenge100.day',
      PONTOS_NIIL.REGISTRO,
      `Desafio 100 · dia ${dia}`,
      'consistencia',
      isoHoje(),
      {trilhaId:'niil-central',origemId:String(dia)}
    ));
  });

  return out;
}

function eventosBiblioteca(d){
  const out=[];
  array(d.biblioteca).forEach(x=>{
    out.push(evento(`biblioteca:registro:${x.id}`,'library.item.logged',PONTOS_NIIL.REGISTRO,`Registro · ${x.titulo||x.tipo||'Biblioteca'}`,'estudos',x.data,{origemId:x.id}));
    if(String(x.resenha||'').trim())out.push(evento(`biblioteca:reflexao:${x.id}`,'library.reflection.completed',PONTOS_NIIL.ACAO,`Reflexão · ${x.titulo||'Biblioteca'}`,'estudos',x.data,{origemId:x.id}));
  });
  return out;
}

function eventosIngles(d){
  const out=[];
  const ing=d.ingles||{};
  Object.entries(ing.fasesConcluidas||{}).forEach(([id,feito])=>{
    if(feito)out.push(evento(`ingles:fase:${id}`,'language.phase.completed',30,'Fase de inglês concluída','estudos',isoHoje(),{trilhaId:'ingles',origemId:id}));
  });
  Object.entries(ing.desafiosMarcados||{}).forEach(([id,feito])=>{
    if(feito)out.push(evento(`ingles:desafio:${id}`,'language.challenge.completed',PONTOS_NIIL.REFLEXAO,'Desafio de inglês concluído','estudos',isoHoje(),{trilhaId:'ingles',origemId:id}));
  });
  Object.entries(ing.checkDiario||{}).forEach(([data,checks])=>{
    if(array(checks).length&&array(checks).every(Boolean))out.push(evento(`ingles:dia:${data}`,'language.daily.completed',PONTOS_NIIL.ACAO,'Rotina diária de inglês concluída','estudos',data,{trilhaId:'ingles',origemId:data}));
  });
  Object.entries(ing.checkSemanal||{}).forEach(([semana,checks])=>{
    if(array(checks).length&&array(checks).every(Boolean))out.push(evento(`ingles:semana:${semana}`,'language.week.completed',PONTOS_NIIL.FERRAMENTA,'Rotina semanal de inglês concluída','estudos',isoHoje(),{trilhaId:'ingles',origemId:semana}));
  });
  return out;
}

function eventosFinanceiros(d){
  const out=[];
  const fin=normalizarFinanceiro(d.financeiro);
  const diag=!!(d.financeiroDiagnosticoConcluido||fin.configuracao?.diagnosticoFinanceiroConcluido||fin.startFinanceiroConcluido||fin.onboardingConcluido);
  if(diag)out.push(evento('financeiro:diagnostico','finance.diagnosis.completed',30,'Diagnóstico financeiro concluído','financas',fin.configuracao?.diagnosticoConcluidaEm||isoHoje(),{trilhaId:'financeiro'}));

  array(fin.importacoes).forEach(i=>out.push(evento(
    `financeiro:importacao:${i.id||slug([i.arquivo,i.data].join('-'))}`,
    'finance.import.reviewed',
    PONTOS_NIIL.REFLEXAO,
    'Dados financeiros importados e revisados',
    'financas',
    i.data,
    {trilhaId:'financeiro',origemId:i.id||i.arquivo}
  )));
  if(array(fin.receitasRecorrentes).some(x=>x.ativo!==false))out.push(evento('financeiro:renda-base','finance.income.mapped',PONTOS_NIIL.ACAO,'Renda recorrente mapeada','financas',isoHoje(),{trilhaId:'financeiro'}));
  if(array(fin.gastosFixos).some(x=>x.ativo!==false))out.push(evento('financeiro:fixos-base','finance.fixed.expenses.mapped',PONTOS_NIIL.ACAO,'Gastos fixos mapeados','financas',isoHoje(),{trilhaId:'financeiro'}));

  array(fin.orcamentos).filter(x=>x.ativo!==false).forEach(o=>out.push(evento(
    `financeiro:orcamento:${o.id||slug([o.categoria,o.limite].join('-'))}`,
    'finance.budget.created',
    PONTOS_NIIL.ACAO,
    'Orçamento definido',
    'financas',
    o.criadoEm||o.data||isoHoje(),
    {trilhaId:'financeiro',origemId:o.id||null}
  )));
  array(fin.objetivos).filter(x=>x.status!=='arquivado').forEach(o=>out.push(evento(
    `financeiro:objetivo:${o.id||slug(o.nome||o.titulo)}`,
    'finance.goal.created',
    PONTOS_NIIL.ACAO,
    `Objetivo financeiro · ${o.nome||o.titulo||'Objetivo'}`,
    'financas',
    o.criadoEm||o.data||isoHoje(),
    {trilhaId:'financeiro',origemId:o.id||null}
  )));
  array(fin.transacoes).filter(t=>t.aporteInvestimento).forEach(t=>out.push(evento(
    `financeiro:aporte:${t.id}`,
    'finance.investment.contribution',
    PONTOS_NIIL.ACAO,
    'Aporte registrado',
    'financas',
    t.data,
    {trilhaId:'financeiro',origemId:t.id}
  )));

  const meses=uniq(array(fin.transacoes).map(mesDa).filter(Boolean));
  meses.forEach(mes=>{
    const tx=array(fin.transacoes).filter(t=>mesDa(t)===mes&&t.status!=='ignorado');
    if(tx.length&&tx.every(t=>!t.revisar)){
      out.push(evento(`financeiro:classificado:${mes}`,'finance.month.classified',PONTOS_NIIL.REFLEXAO,'Movimentações do mês organizadas','financas',`${mes}-28`,{trilhaId:'financeiro',origemId:mes}));
    }
  });

  const res=reservaResumo(fin);
  [25,50,75,100].forEach(marco=>{
    if(Number(res.pct||0)>=marco)out.push(evento(
      `financeiro:reserva:${marco}`,
      'finance.reserve.milestone',
      PONTOS_NIIL.MARCO,
      `Reserva · ${marco}% da meta`,
      'financas',
      isoHoje(),
      {trilhaId:'financeiro',origemId:String(marco)}
    ));
  });
  return out;
}

function coletarEventos(d){
  return[
    ...eventosTrilha(d),
    ...eventosAgenda(d),
    ...eventosCursos(d),
    ...eventosTreino(d),
    ...eventosBemEstar(d),
    ...eventosPraticas(d),
    ...eventosBiblioteca(d),
    ...eventosIngles(d),
    ...eventosFinanceiros(d)
  ];
}

function badgesDoLedger(ledger,melhorStreak,pontos){
  const tipos=tipo=>ledger.filter(x=>x.tipo===tipo).length;
  const reflexoes=ledger.filter(x=>/reflection|reflexao/.test(x.tipo)).length;
  const ids=[];
  if(ledger.length)ids.push('primeiro-movimento');
  if(melhorStreak>=7)ids.push('consistencia-7');
  if(ledger.filter(x=>x.tipo.startsWith('workout.')).length>=5)ids.push('treinos-5');
  if(tipos('course.lesson.completed')>=10)ids.push('aulas-10');
  if(reflexoes>=10)ids.push('reflexoes-10');
  if(tipos('finance.diagnosis.completed')>=1)ids.push('financeiro-base');
  if(tipos('trail.phase.completed')>=1)ids.push('primeira-fase');
  if(pontos>=1000)ids.push('mil-pontos');
  return ids;
}

export function reconciliarGamificacao(state){
  if(!state||typeof state!=='object')return state;
  const atual=normalizarGamificacao(state.gamificacao);
  const keys=new Set(atual.ledger.map(x=>x.key));
  const novos=coletarEventos(state).filter(e=>!keys.has(e.key));
  const ledger=novos.length?[...atual.ledger,...novos]:atual.ledger;
  const pontos=ledger.reduce((a,x)=>a+Math.max(0,Number(x.pontos)||0),0);
  const diasAtivos=uniq(ledger.filter(x=>x.contaConsistencia!==false).map(x=>normalizaData(x.data))).sort();
  const streak=calcularStreak(diasAtivos);
  const badgeIds=badgesDoLedger(ledger,Math.max(atual.melhorStreak,streak.melhor),pontos);
  const badgeExistentes=new Map(array(atual.badges).map(b=>[b.id,b]));
  const badges=badgeIds.map(id=>badgeExistentes.get(id)||{
    id,
    desbloqueadoEm:new Date().toISOString(),
    ...BADGES_NIIL.find(b=>b.id===id)
  });
  const proximo={
    ...atual,
    pontos,
    nivel:nivelPorPontos(pontos).nivel,
    ledger,
    diasAtivos,
    streakAtual:streak.atual,
    melhorStreak:Math.max(atual.melhorStreak,streak.melhor),
    badges
  };

  const mudou=novos.length||
    !state.gamificacao||
    Number(state.gamificacao.pontos||0)!==proximo.pontos||
    Number(state.gamificacao.nivel||0)!==proximo.nivel||
    Number(state.gamificacao.streakAtual||0)!==proximo.streakAtual||
    Number(state.gamificacao.melhorStreak||0)!==proximo.melhorStreak||
    array(state.gamificacao.badges).length!==badges.length;

  return mudou?{...state,gamificacao:proximo}:state;
}

export function registrarEventoGamificacao(state,dados){
  if(!state||!dados?.key)return state;
  const atual=normalizarGamificacao(state.gamificacao);
  if(atual.ledger.some(x=>x.key===dados.key))return state;
  const ev=evento(
    dados.key,
    dados.tipo||'custom.completed',
    dados.pontos??PONTOS_NIIL.ACAO,
    dados.titulo||'Ação concluída',
    dados.area||'geral',
    dados.data||isoHoje(),
    dados
  );
  const base={...state,gamificacao:{...atual,ledger:[...atual.ledger,ev]}};
  return reconciliarGamificacao(base);
}

export function resumoGamificacao(state,agora=new Date()){
  const g=normalizarGamificacao(state?.gamificacao);
  const nivel=nivelPorPontos(g.pontos);
  const porDia={};
  const porArea={};
  g.ledger.forEach(e=>{
    const data=normalizaData(e.data);
    porDia[data]=(porDia[data]||0)+Number(e.pontos||0);
    porArea[e.area||'geral']=(porArea[e.area||'geral']||0)+Number(e.pontos||0);
  });
  const hoje=agora.toISOString().slice(0,10);
  const inicioSemana=new Date(agora);inicioSemana.setHours(12,0,0,0);inicioSemana.setDate(inicioSemana.getDate()-((inicioSemana.getDay()+6)%7));
  const inicioMes=`${agora.getFullYear()}-${String(agora.getMonth()+1).padStart(2,'0')}-01`;
  const pontosSemana=g.ledger.filter(e=>new Date(normalizaData(e.data)+'T12:00:00')>=inicioSemana).reduce((a,e)=>a+Number(e.pontos||0),0);
  const pontosMes=g.ledger.filter(e=>normalizaData(e.data)>=inicioMes).reduce((a,e)=>a+Number(e.pontos||0),0);
  return{
    ...g,
    ...nivel,
    pontosHoje:porDia[hoje]||0,
    pontosSemana,
    pontosMes,
    pontosPorDia:porDia,
    pontosPorArea:porArea,
    badges:g.badges.map(b=>({...BADGES_NIIL.find(x=>x.id===b.id),...b})).filter(Boolean),
    eventosRecentes:[...g.ledger].sort((a,b)=>String(b.criadoEm||b.data).localeCompare(String(a.criadoEm||a.data))).slice(0,20)
  };
}

export function desafiosGamificacao(state,agora=new Date()){
  const r=resumoGamificacao(state,agora);
  const inicioSemana=new Date(agora);inicioSemana.setHours(12,0,0,0);inicioSemana.setDate(inicioSemana.getDate()-((inicioSemana.getDay()+6)%7));
  const evSemana=r.ledger.filter(e=>new Date(normalizaData(e.data)+'T12:00:00')>=inicioSemana);
  const conta=pred=>evSemana.filter(pred).length;
  return[
    {id:'semana-5-movimentos',titulo:'5 movimentos na semana',descricao:'Conclua 5 ações reais de evolução.',atual:Math.min(5,evSemana.length),meta:5},
    {id:'semana-reflexao',titulo:'Uma reflexão que move',descricao:'Conclua ao menos uma reflexão significativa.',atual:Math.min(1,conta(e=>/reflection|reflexao/.test(e.tipo))),meta:1},
    {id:'semana-multiarea',titulo:'Evolução integrada',descricao:'Movimente 3 áreas diferentes da sua vida.',atual:Math.min(3,new Set(evSemana.map(e=>e.area)).size),meta:3}
  ].map(x=>({...x,pct:Math.round(x.atual/x.meta*100),concluido:x.atual>=x.meta}));
}
