export const TRILHA_NIIL = [
  {
    id:'m1', marco:'M1', nome:'O que vale o esforço?', icone:'target',
    resumo:'Descubra o que você quer construir e por que isso importa de verdade.',
    base:'recompensa, motivação, autopercepção e visão sistêmica',
    etapas:[
      {id:'m1-quer-v2',tipo:'micro',titulo:'O que você quer há tempo demais?',min:2,interacao:'sentence-choice',chave:'meta-inicial',pergunta:'Complete a frase',fraseInicio:'Eu mudaria',fraseFim:'primeiro.',opcoesFrase:[{valor:'Saúde',texto:'minha saúde'},{valor:'Energia',texto:'minha energia'},{valor:'Dinheiro',texto:'minhas finanças'},{valor:'Carreira',texto:'minha carreira'},{valor:'Aprendizado',texto:'meu aprendizado'},{valor:'Relacionamentos',texto:'meus relacionamentos'},{valor:'Organizar minha vida',texto:'minha organização'},{valor:'Outra coisa',texto:'outra coisa'}],pontos:10},
      {id:'m1-importa',tipo:'micro',titulo:'Quanto isso importa?',min:1,interacao:'scale',chave:'meta-importancia',pergunta:'Hoje, quanto isso realmente importa para você?',minimo:'Pouco',maximo:'Muito',pontos:5,ciencia:'Importância percebida ajuda a tornar a intenção explícita, mas uma nota alta não garante comportamento. O próximo passo procura as razões da própria pessoa para mudar.',fonte:'Entrevista motivacional · ciência comportamental'},
      {id:'m1-motivo',tipo:'micro',titulo:'Por que isso importa?',min:1,interacao:'motivation-why',chave:'meta-motivo',pergunta:'Encontre a razão que é sua — não a que parece certa.',pontos:10,ciencia:'Perguntas que evocam as próprias razões para mudança são usadas em entrevista motivacional para favorecer “change talk”: a pessoa verbaliza por que mudar importa para ela.',fonte:'Miller & Rollnick · Motivational Interviewing'},
      {id:'m1-recompensa',tipo:'micro',titulo:'O que você ganha de verdade?',min:1,interacao:'reward-choice',chave:'meta-recompensa',pergunta:'Se isso mudar, o que você ganha de verdade?',pontos:10,ciencia:'Sinais e recompensas antecipadas podem adquirir valor motivacional e orientar aproximação e aprendizagem. Dopamina não é um medidor simples de prazer; aqui o NIIL usa a recompensa desejada como pista de motivação.',fonte:'Berridge & Robinson · incentive salience / wanting'},
      {id:'m1-motivacao-base',tipo:'micro',titulo:'Seu motivo ficou mais claro',min:1,interacao:'motivation-insight',chave:'motivacao-base-confirmada',pergunta:'Insight NIIL',pontos:15},
      {id:'m1-roda-v4',tipo:'roda',rodaId:'m1-v4',titulo:'Roda da Vida',min:3,perguntaCurta:'Um scan rápido da sua vida, uma área por toque.',pontos:20,versaoFerramenta:4,papel:'abertura'},
      {id:'m1-ecossistema',tipo:'micro',titulo:'Tudo isso está conectado',min:3,interacao:'modules',chave:'ecossistema',pergunta:'Quais partes da sua vida parecem ter relação com o que você quer construir?',opcoes:['Sono','Água','Alimentação','Movimento','Leitura','Cursos','Inglês','Finanças','Ambiente','Minha Visão','Agenda'],pontos:15},
    ]
  },
  {
    id:'m2', marco:'M2', nome:'Seu corpo tem recurso?', icone:'moon',
    resumo:'Antes de exigir mais de você, entenda com que energia você está tentando viver.',
    base:'sono, ritmo circadiano, energia, hidratação e movimento',
    etapas:[
      {id:'m2-energia',tipo:'micro',titulo:'Quando você liga?',min:2,interacao:'energy',chave:'energia-dia',pergunta:'Como sua energia costuma mudar ao longo do dia?',pontos:10},
      {id:'m2-sono',tipo:'micro',titulo:'Seu sono cabe na vida que você quer?',min:2,interacao:'sleep',chave:'sono-janela',pergunta:'Qual é sua janela de sono mais comum?',pontos:10,modulo:'sono',ciencia:'Sono e ritmo circadiano influenciam alerta, desempenho e regulação fisiológica. O NIIL observa padrão; não faz diagnóstico clínico.',fonte:'Cronobiologia e ciência do sono'},
      {id:'m2-influencias',tipo:'micro',titulo:'O que muda sua energia?',min:2,interacao:'multi',chave:'energia-influencias',pergunta:'O que mais parece mexer com sua energia?',opcoes:['Sono','Comida','Água','Café','Exercício','Trabalho','Telas','Descanso'],limite:3,pontos:10},
      {id:'m2-experimento',tipo:'micro',titulo:'Um experimento. Não dez hábitos.',min:2,interacao:'experiment',chave:'experimento-corpo',pergunta:'Escolha só uma coisa para observar por alguns dias.',opcoes:['Observar sono por 5 noites','Registrar água por 3 dias','Registrar energia antes/depois do treino','Observar energia após as refeições'],pontos:20},
    ]
  },
  {
    id:'m3', marco:'M3', nome:'O que te puxa?', icone:'magnet',
    resumo:'Perceba recompensa, antecipação e aquilo que vence sua atenção antes da escolha consciente.',
    base:'dopamina, wanting/liking, recompensa, sinais e aprendizagem',
    etapas:[
      {id:'m3-quero-faco',tipo:'micro',titulo:'Você quer isso ou gosta da ideia de querer?',min:2,interacao:'dual-scale',chave:'quero-faco',pergunta:'Compare o quanto você quer com o quanto isso aparece no comportamento.',pontos:10,ciencia:'Querer uma recompensa e gostar dela não são processos idênticos. Essa diferença ajuda a observar desejos que puxam comportamento sem necessariamente gerar satisfação proporcional.',fonte:'Kent Berridge · incentive salience / wanting e liking'},
      {id:'m3-automatico',tipo:'micro',titulo:'O que te puxa sem pedir licença?',min:2,interacao:'swipe',chave:'recompensas-automaticas',pergunta:'Quais dessas coisas você faz quase no automático?',opcoes:['Celular','Compras','Comida','Vídeos/séries','Jogos','Trabalho','Outro'],pontos:10},
      {id:'m3-sinal',tipo:'micro',titulo:'Qual é o sinal?',min:3,interacao:'chain',chave:'cadeia-recompensa',pergunta:'Monte uma sequência simples do que costuma acontecer.',pontos:15,ciencia:'Sinais associados a recompensas podem ganhar valor preditivo e influenciar aproximação e aprendizagem. Aqui você mapeia uma hipótese sobre seu próprio padrão.',fonte:'Wolfram Schultz · reward prediction learning'},
      {id:'m3-agora-depois',tipo:'micro',titulo:'Agora ou depois?',min:2,interacao:'tradeoff',chave:'troca-recompensa',pergunta:'Qual recompensa costuma vencer agora e o que você diz que quer construir depois?',pontos:15},
    ]
  },
  {
    id:'m4', marco:'M4', nome:'Seu ambiente já decidiu?', icone:'home',
    resumo:'Veja como o espaço físico, digital e os recursos que você já possui facilitam ou dificultam ações.',
    base:'arquitetura de escolha, fricção, pistas contextuais e hábito',
    etapas:[
      {id:'m4-foto',tipo:'micro',titulo:'Olhe ao redor',min:2,interacao:'photo',chave:'ambiente-foto',pergunta:'Registre o lugar onde essa meta deveria acontecer.',pontos:10,modulo:'visao'},
      {id:'m4-ajuda',tipo:'micro',titulo:'O que ajuda e o que atrapalha?',min:2,interacao:'binary',chave:'ambiente-ajuda',pergunta:'Pense no seu ambiente e escolha o que está mais presente.',opcoes:['Meu ambiente facilita','Meu ambiente exige esforço demais','Depende do dia'],pontos:10},
      {id:'m4-recurso',tipo:'micro',titulo:'Você já comprou a solução?',min:2,interacao:'multi',chave:'recursos-parados',pergunta:'O que você já comprou para uma versão sua que ainda não apareceu?',opcoes:['Curso','Livro','Academia','Roupa/equipamento','Aplicativo','Assinatura','Material de estudo','Nada disso'],limite:4,pontos:10},
      {id:'m4-mudar',tipo:'micro',titulo:'Mude uma coisa',min:2,interacao:'choice',chave:'ambiente-mudanca',pergunta:'Qual mudança pequena reduziria fricção ainda hoje?',opcoes:['Deixar algo visível','Tirar algo do caminho','Preparar antes','Mudar notificações','Organizar um espaço','Outra'],pontos:15,ciencia:'Hábitos são fortemente dependentes de contexto e pistas recorrentes. Reduzir ou aumentar fricção pode mudar a probabilidade de uma ação sem depender apenas de força de vontade.',fonte:'Wendy Wood · hábitos e contexto'},
    ]
  },
  {
    id:'m5', marco:'M5', nome:'O que você repete vira caminho', icone:'repeat',
    resumo:'Transforme intenção em uma ação pequena, ligada a um contexto que já existe.',
    base:'hábito, implementation intentions, repetição, aprendizagem e agenda',
    etapas:[
      {id:'m5-automatico',tipo:'micro',titulo:'Isso já acontece sozinho?',min:2,interacao:'sort',chave:'automaticidade',pergunta:'Classifique algumas ações da sua rotina.',opcoes:['Já faço sem pensar','Preciso lembrar','Sempre adio'],pontos:10},
      {id:'m5-colar',tipo:'micro',titulo:'Cole a ação em algo que já acontece',min:3,interacao:'anchor',chave:'ancora-acao',pergunta:'Complete: depois de ___, eu vou ___.',pontos:15,ciencia:'Planos do tipo “quando X acontecer, farei Y” ajudam a reduzir a distância entre intenção e execução porque tornam o contexto de início mais específico.',fonte:'Peter Gollwitzer · implementation intentions'},
      {id:'m5-minimo',tipo:'micro',titulo:'Qual é a menor versão que ainda conta?',min:2,interacao:'minimum',chave:'acao-minima',pergunta:'Defina uma versão pequena o bastante para caber até num dia ruim.',pontos:10},
      {id:'m5-agenda',tipo:'micro',titulo:'Faça caber hoje',min:3,interacao:'agenda',chave:'agenda-primeira',pergunta:'Quer colocar essa ação na sua agenda agora?',pontos:20,modulo:'agenda'},
      {id:'m5-aprender',tipo:'micro',titulo:'Ler não é aprender',min:3,interacao:'choice',chave:'aprendizado-foco',pergunta:'Qual aprendizado você quer transformar em prática?',opcoes:['Livro','Curso','Inglês','Outro aprendizado','Agora não'],pontos:15,modulo:'cursos'},
    ]
  },
  {
    id:'m6', marco:'M6', nome:'O sistema ao seu redor', icone:'network',
    resumo:'Observe pessoas, papéis, obrigações e contextos que sustentam ou dificultam mudanças.',
    base:'coaching sistêmico como ferramenta reflexiva, contexto social e apoio',
    etapas:[
      {id:'m6-mapa',tipo:'micro',titulo:'Quem e o que entra nessa história?',min:5,interacao:'multi',chave:'sistema-nos',pergunta:'Quais sistemas mais influenciam o que você está tentando mudar?',opcoes:['Família','Trabalho','Relacionamento','Amigos','Dinheiro','Casa','Comunidade','Outro'],limite:4,pontos:20,ciencia:'Esta é uma lente reflexiva sistêmica: o objetivo é ampliar contexto e relações, não diagnosticar causas psicológicas.',fonte:'Coaching sistêmico · uso reflexivo, não clínico'},
      {id:'m6-impacto',tipo:'micro',titulo:'Se você mudar, quem sente?',min:4,interacao:'choice',chave:'sistema-impacto',pergunta:'Quando você muda esse comportamento, o que mais muda ao redor?',opcoes:['Meu tempo','Minhas relações','Meu dinheiro','Minha energia','Minhas responsabilidades','Ainda não sei'],pontos:15},
      {id:'m6-limite',tipo:'micro',titulo:'O que você está sustentando?',min:5,interacao:'voice',chave:'sistema-reflexao',pergunta:'Em uma frase: o que você continua fazendo porque sente que precisa?',pontos:20},
    ]
  },
  {
    id:'m7', marco:'M7', nome:'Escolher custa', icone:'flag',
    resumo:'Toda meta usa tempo, dinheiro e atenção. Torne esse custo visível antes de prometer mais.',
    base:'trade-offs, metas, congruência, ambivalência e planejamento',
    etapas:[
      {id:'m7-meta',tipo:'micro',titulo:'Escolha o que merece compromisso',min:4,interacao:'choice',chave:'meta-principal',pergunta:'Qual objetivo merece espaço real agora?',opcoes:['Saúde','Financeiro','Carreira','Aprendizado','Relacionamento','Outro'],pontos:20},
      {id:'m7-orcamento',tipo:'micro',titulo:'Orçamento da meta',min:5,interacao:'budget',chave:'meta-orcamento',pergunta:'Quanto essa meta pede de tempo, dinheiro e atenção?',pontos:20},
      {id:'m7-financas',tipo:'micro',titulo:'O dinheiro entra nessa história?',min:4,interacao:'module-decision',chave:'financeiro-vinculo',pergunta:'Essa meta depende de dinheiro, parcela, financiamento ou reserva?',opcoes:['Sim','Não','Ainda não sei'],pontos:15,modulo:'financeiro'},
      {id:'m7-ganhos-perdas',tipo:'micro',titulo:'O que você ganha e o que abre mão?',min:5,interacao:'tradeoff',chave:'ganhos-perdas',pergunta:'Toda escolha deixa alguma coisa de fora. O que vale a troca?',pontos:20},
    ]
  },
  {
    id:'m8', marco:'M8', nome:'Faça caber na terça-feira', icone:'calendar',
    resumo:'Não monte uma semana ideal. Trabalhe com a semana que você realmente tem.',
    base:'planejamento realista, intenção de implementação e gestão de energia',
    etapas:[
      {id:'m8-semana',tipo:'micro',titulo:'Sua semana real',min:6,interacao:'agenda',chave:'semana-real',pergunta:'Abra sua agenda e encontre um espaço que realmente existe.',pontos:20,modulo:'agenda',ciencia:'Planejar uma ação dentro de um contexto real tende a ser mais útil do que formular apenas uma intenção abstrata.',fonte:'Planejamento comportamental e implementation intentions'},
      {id:'m8-energia',tipo:'micro',titulo:'Isso pede qual energia?',min:3,interacao:'choice',chave:'acao-energia',pergunta:'Essa ação costuma exigir de você energia baixa, média ou alta?',opcoes:['Baixa','Média','Alta'],pontos:10},
      {id:'m8-proteger',tipo:'micro',titulo:'O que precisa ser protegido?',min:4,interacao:'choice',chave:'protecao-rotina',pergunta:'Para essa ação acontecer, o que você precisa proteger?',opcoes:['Tempo','Sono','Dinheiro','Ambiente','Limites com outras pessoas','Atenção'],pontos:15},
    ]
  },
  {
    id:'m9', marco:'M9', nome:'Aprender com a própria vida', icone:'chart',
    resumo:'Compare percepção, comportamento e registros. O objetivo é entender o que mudou — sem inventar causalidade.',
    base:'autorregulação, feedback, revisão e aprendizagem com evidências',
    etapas:[
      {id:'m9-roda-v4',tipo:'roda',rodaId:'m9-v4',titulo:'Sua vida vista de cima, de novo',min:5,perguntaCurta:'O mesmo retrato, em outro momento. O valor está na comparação, não em buscar uma nota perfeita.',pontos:20,versaoFerramenta:4,papel:'fechamento'},
      {id:'m9-padroes',tipo:'micro',titulo:'O que os seus registros estão mostrando?',min:4,interacao:'insight',chave:'revisao-padroes',pergunta:'Veja seus sinais de sono, agenda, treino, estudos e finanças antes de decidir o próximo passo.',pontos:20,ciencia:'O NIIL mostra associações e tendências dos seus registros. Ele não transforma correlação em causa.',fonte:'Feedback e autorregulação baseados em evidências pessoais'},
      {id:'m9-proximo',tipo:'micro',titulo:'Qual é o próximo ciclo?',min:4,interacao:'choice',chave:'proximo-ciclo',pergunta:'O que merece aprofundamento agora?',opcoes:['Sono e energia','Finanças','Aprendizado','Treino','Ambiente','Relacionamentos','Manter o que já funciona'],pontos:20},
    ]
  }
];

export const TOTAL_MARCOS_NIIL = TRILHA_NIIL.length;
export const TOTAL_PASSOS_NIIL = TRILHA_NIIL.reduce((a,b)=>a+b.etapas.length,0);

export const moduloParaAba = {
  sono:'sono',
  agenda:'agenda',
  financeiro:'financeiro',
  comida:'comida',
  cursos:'cursos',
  ingles:'ingles',
  guardaRoupa:'guarda-roupa',
  visao:'progresso',
  treino:'inicio'
};

export function faseAtualNIIL(etapas={}){
  for(let i=0;i<TRILHA_NIIL.length;i++){
    const fase=TRILHA_NIIL[i];
    const concluidas=fase.etapas.filter(e=>etapas?.[e.id]?.feito).length;
    if(concluidas<fase.etapas.length)return{fase,indice:i,concluidas,total:fase.etapas.length};
  }
  const fase=TRILHA_NIIL.at(-1);
  return{fase,indice:TRILHA_NIIL.length-1,concluidas:fase.etapas.length,total:fase.etapas.length,concluida:true};
}

export function marcosConcluidosNIIL(etapas={}){
  return TRILHA_NIIL.filter(f=>f.etapas.every(e=>etapas?.[e.id]?.feito)).length;
}

export function recomendacoesContextuaisNIIL(d={}){
  const r=[];
  const foco=d.trilhaNIIL?.motivacaoBase?.objetivo;
  if(foco==='Saúde'){
    r.push({id:'saude-nutricao',modulo:'comida',titulo:'Sua saúde também passa pelo que você repete à mesa',texto:'Seu foco inicial é Saúde. Quando fizer sentido, uma dose curta de Nutrição ajuda a transformar intenção em escolhas observáveis.'});
    if((d.treinos||[]).length===0)r.push({id:'saude-treino',modulo:'treino',titulo:'Movimento pode entrar como evidência, não como cobrança',texto:'Seu foco inicial é Saúde e ainda não há treinos registrados. O NIIL pode conectar movimento quando ele couber na sua rotina real.'});
  }
  if(foco==='Energia'&&!(d.sono?.registros||[]).length){
    r.push({id:'energia-sono',modulo:'sono',titulo:'Sua energia precisa de contexto de sono',texto:'Seu foco inicial é Energia. Antes de exigir mais desempenho, vale observar algumas noites e o ritmo do seu dia.'});
  }
  const fin=d.financeiro||{};
  const temDivida=(fin.dividas||[]).length>0;
  const diagFin=!!(d.financeiroDiagnosticoConcluido||fin.configuracao?.diagnosticoFinanceiroConcluido||fin.startFinanceiroConcluido||fin.onboardingConcluido);
  if((temDivida||(fin.objetivos||[]).length>0)&&!diagFin)r.push({id:'fin-base',modulo:'financeiro',titulo:'Coloque seu dinheiro no mapa',texto:'Você já tem compromissos ou objetivos financeiros. Vale organizar a base para o NIIL considerar isso nas próximas decisões.'});
  if((d.cursos||[]).some(c=>(c.aulas||[]).length&&(c.aulas||[]).filter(a=>a.feito).length<(c.aulas||[]).length))r.push({id:'curso-retomar',modulo:'cursos',titulo:'Você já tem um recurso para usar',texto:'Há um curso em andamento. Antes de buscar outro recurso, vale entender como ele entra na sua semana.'});
  if(!(d.sono?.registros||[]).length)r.push({id:'sono-base',modulo:'sono',titulo:'Ainda falta uma peça de energia',texto:'Você ainda não registrou uma noite. Um pequeno período de observação já ajuda a construir contexto.'});
  if((d.treinos||[]).length===0)r.push({id:'movimento-base',modulo:'treino',titulo:'Movimento ainda não entrou no mapa',texto:'Se movimento for relevante para sua meta, você pode começar registrando apenas quando ele realmente acontecer.'});
  return r.slice(0,3);
}
