/* ══════════════════════════════════════════════════════════════
   ZOË · Conteúdo do planner My Year 2026
   Os textos aqui são os do planner. A trilha respeita a ordem
   original das páginas: conteúdo → ferramenta → fichas → agenda.
   ══════════════════════════════════════════════════════════════ */

export const PILARES = [
  'Espiritual', 'Parentes', 'Conjugal', 'Filhos', 'Social', 'Saúde',
  'Servir', 'Intelectual', 'Financeiro', 'Profissional', 'Emocional'
];

export const RODA_SETORES = [
  'Saúde', 'Família', 'Relacionamentos', 'Lazer', 'Espiritualidade', 'Carreira',
  'Finanças', 'Crescimento pessoal', 'Social', 'Emocional', 'Intelectual', 'Contribuição'
];

export const RITUAL_ACORDAR = [
  { n: 1, t: 'Não pegue o celular', min: 1, d: 'Senta na cama. Eu vou vencer. Eu vou vencer. Eu vou vencer! Sim.' },
  { n: 2, t: 'Coloque Deus em primeiro lugar', min: 1, d: 'Deus é meu escudo e proteção, que no início desse dia eu possa louvá-lo e colocá-lo sempre em primeiro lugar.' },
  { n: 3, t: 'Banho gelado', min: 3, d: 'Desperte o corpo.' },
  { n: 4, t: 'Mantra pessoal', min: 1, d: 'Eu me respeito. Eu me escolho. Eu confio no plano de Deus para mim.' },
  { n: 5, t: 'Escrita de alinhamento', min: 2, campos: ['Como eu quero me sentir hoje?', 'O que preciso fazer para me sentir assim?', 'O que eu NÃO tolero hoje?'], d: 'Exemplos: leve, produtiva, em paz. Terminar X, delegar Y, não absorver tensões. Desrespeito, caos, pressa emocional.' },
  { n: 6, t: 'A ativação dos 40x', min: 5, d: 'Você escreve 40 vezes a mesma frase todos os dias.' },
  { n: 7, t: 'Visualização de 3 coisas', min: 2, d: 'Eu forte e confiante no seu trabalho. Eu sendo honrada, respeitada e reconhecida. Eu vivendo paz: casa, saúde, financeiro, espiritual.' },
  { n: 8, t: 'Mini ação física', min: 1, d: '20 polichinelos ou 30 segundos de alongamento ou 10 agachamentos.' },
  { n: 9, t: 'Pequeno comando final', min: 1, d: 'Hoje eu decido vencer. Hoje eu honro quem eu sou.' }
];

export const VISAO_PILARES = [
  {
    id: 'profissional', nome: 'Minha vida profissional extraordinária', icone: '💼',
    texto: [
      'Eu me vejo dirigindo um grande departamento ou assumindo um cargo de diretoria nacional ou internacional.',
      'Tenho autonomia, respeito, voz ativa e impacto real.',
      'Minha agenda é estratégica.',
      'Eu lidero projetos de milhões com maestria.',
      'Eu inspiro, ensino, transformo e deixo legado.',
      'Recebo convites para palestrar, participar de eventos, mentorias e criar tendências no mercado.',
      'Sou referência em marketing, branding e estratégia.',
      'Eu ganho o que mereço e finalmente vivo uma vida financeira tranquila, próspera e expansiva.'
    ]
  },
  {
    id: 'amorosa', nome: 'Minha vida amorosa extraordinária', icone: '💛',
    texto: [
      'Eu vivo um relacionamento leve, profundo e recíproco, com Deus no centro.',
      'Com um parceiro que me admira, me respeita, me deseja e me escolhe todos os dias.',
      'Um homem que combina com minha força, acompanha meu ritmo e acalma meu coração.',
      'Que me chama para a vida, para a construção, para o futuro.',
      'Vivemos parceria, afeto, paixão e segurança emocional.',
      'É um amor que soma, não que pesa.',
      'É um amor adulto, verdadeiro e blindado em Deus.'
    ]
  },
  {
    id: 'espiritual', nome: 'Minha vida espiritual extraordinária', icone: '🕊️',
    texto: [
      'Eu coloco Deus em primeiro lugar.',
      'E por isso minha vida flui com graça, direção e propósito.',
      'Eu sigo minha intuição, minha força e meu chamado interno.',
      'E por isso nada falta, tudo chega.'
    ]
  },
  {
    id: 'saude', nome: 'Minha saúde extraordinária', icone: '🌿',
    texto: [
      'Tenho um corpo forte, saudável, belo e confortável para mim.',
      'Treino com disciplina, como com consciência, descanso com qualidade.',
      'Eu me sinto bonita. Eu me sinto capaz. Eu me sinto viva.',
      'E o espelho não é mais um julgamento, é um retrato da minha evolução.'
    ]
  },
  {
    id: 'pessoal', nome: 'Minha vida pessoal extraordinária', icone: '✨',
    texto: [
      'Eu viajo, conheço lugares novos, vivo experiências únicas e me permito aproveitar a vida.',
      'Tenho uma casa linda, organizada, com minha energia.',
      'Cultivo amizades verdadeiras, conversas profundas e momentos de alegria.',
      'Eu tenho paz. Eu tenho tempo. Eu tenho brilho.'
    ]
  }
];

export const RESUMO_VISAO =
  'Eu sou uma mulher alinhada, realizada, amada, bem-sucedida, saudável e em paz. ' +
  'Minha vida é intensa, próspera e conduzida com consciência. ' +
  'Eu vivo o extraordinário porque eu decidi isso, e porque eu mereço isso.';

/* ─── agendas programadas ─── */
const R = 'Rotineiro', S1 = '1x semana', S2 = '2x semana';

const AG1 = [
  ['Ritual do acordar', R, 20, '05:00'], ['Oração São Miguel', R, 10, '05:20'],
  ['Liturgia das horas', R, 10], ['Novena Nossa Senhora Aparecida', R, 10],
  ['Rezar o terço + meditação 5 min', R, 20], ['Ler provérbio do dia', R, 10],
  ['Poder além da vida', 'Filme', 20], ['O poder da autorresponsabilidade', 'Livro', 30],
  ['30 coisas positivas sobre mim (escrever e verbalizar)', R, 20],
  ['Escrever 40 motivos de gratidão', S1, 10], ['Ativação de recursos 5x ao dia', R, 10],
  ['Validar 5x5 (lar e social)', R, 10], ['Caderno de ganhos', R, 20, '21:00'],
  ['Surpresa de amor', S1, 30], ['Academia', R, 50, '18:00'],
  ['Planejamento financeiro', R, 20], ['Inglês', R, 30], ['Espanhol', R, 20],
  ['Reservatório de dopamina', R, 20], ['Curso extra', R, 10],
  ['Afirmação antes de dormir', R, 20, '22:00']
];

const AG2 = [
  ['Ritual do acordar', R, 20, '05:00'], ['Oração São Miguel', R, 10, '05:20'],
  ['Liturgia das horas', R, 10], ['Novena Nossa Senhora Aparecida', R, 10],
  ['Rezar o terço + meditação 5 min', R, 20], ['Ler provérbio do dia', R, 10],
  ['Academia', R, 50, '18:00'], ['Desafiando gigantes', 'Filme', 20],
  ['A boa sorte', 'Livro', 30], ['30 coisas positivas sobre mim (escrever e verbalizar)', R, 20],
  ['Escrever 40 motivos de gratidão', S1, 10], ['Ativação de recursos 5x ao dia', R, 10],
  ['Validar 5x5 (lar e social)', R, 10], ['Caderno de ganhos', R, 20],
  ['Surpresa de amor', S1, 30], ['Planejamento financeiro', R, 20],
  ['Inglês', R, 30], ['Espanhol', R, 20], ['Reservatório de dopamina', R, 20],
  ['Curso extra', R, 10], ['Afirmação antes de dormir', R, 20, '22:00']
];

const AG3 = [
  ['O cavaleiro preso na armadura', 'Livro', 30], ['Mãos talentosas', 'Filme', 20],
  ['O poder da água', 'Vídeo', 20], ['Ritual do acordar', R, 20, '05:00'],
  ['Ler provérbio do dia', R, 10], ['Escrever 30 características + eu sou e verbalizar', R, 20],
  ['Escrever 40 motivos de gratidão', S1, 10], ['V0 e abraço de 40s', R, 10],
  ['Ativação dos estados de recurso 5x ao dia', R, 10], ['Validar 5x5 (lar e social)', R, 10],
  ['Caderno de ganhos', R, 20], ['Surpresa de amor', S1, 30],
  ['Afirmação antes de dormir', R, 20, '22:00'], ['Reunião consigo', S1, 30],
  ['Orçamento financeiro', S2, 20], ['Caderno de críticas', R, 30]
];

const AG4 = [
  ['Picos e vales', 'Livro', 30], ['O homem que mudou o jogo', 'Filme', 20],
  ['Click', 'Filme', 20], ['Ritual do acordar', R, 20, '05:00'],
  ['Ler provérbio do dia', R, 10], ['Escrever 30 características + eu sou e verbalizar', R, 20],
  ['Escrever 40 motivos de gratidão', S1, 10], ['V0 e abraço de 40s', R, 10],
  ['Ativação dos estados de recurso 5x ao dia', R, 10], ['Validar 5x5 (lar e social)', R, 10],
  ['Caderno de ganhos', R, 20], ['Mural vida extraordinária', S1, 30],
  ['Meditação 3 min', R, 20], ['Detox redes sociais', S1, 30],
  ['Afirmação antes de dormir', S2, 20], ['Escrever uma visão detalhada para cada pilar', R, 30],
  ['Reunião consigo', S1, 30]
];

const baseRotina = (extras) => [
  ...extras,
  ['Ritual do acordar', R, 20, '05:00'], ['Ler provérbio do dia', R, 10],
  ['Escrever 30 características + eu sou e verbalizar', R, 20],
  ['Escrever 40 motivos de gratidão', S1, 10], ['V0 e abraço de 40s', R, 10],
  ['Ativação dos estados de recurso 5x ao dia', R, 10],
  ['Validar 5x5 (lar e social)', R, 10], ['Caderno de ganhos', R, 20],
  ['Afirmação antes de dormir', R, 20, '22:00'], ['Reunião consigo', S1, 30]
];

const AG5 = baseRotina([['Salomão, o homem mais rico que já existiu', 'Livro', 30]]);
const AG6 = baseRotina([['Quem mexeu no meu queijo', 'Livro', 30]]);
const AG7 = baseRotina([['Raízes da rejeição', 'Livro', 30], ['As 5 linguagens do amor', 'Livro', 30], ['À prova de fogo', 'Filme', 20]]);
const AG8 = baseRotina([['A ciência de ficar rico', 'Livro', 30], ['Orçamento financeiro', S2, 20]]);
const AG9 = baseRotina([['Metanoia', 'Livro', 30]]);
const AG10 = baseRotina([['O poder da ação', 'Livro', 30]]);

const agenda = (linhas) => linhas.map(([t, tipo, p, hora]) => ({ t, tipo, p, hora }));

/* ─── etapas ───
   tipo: 'leitura' | 'ferramenta' | 'fichas' | 'agenda' | 'roda' | 'ritual'
   ferramenta: id da ferramenta interativa que a etapa abre
*/

export const TRILHA = [

  /* ═══════════ FASE 0 ═══════════ */
  {
    id: 'f0', bloco: 'Fundação', nome: 'Ponto de partida', cor: '#3ECF8E',
    resumo: 'Antes de começar, você precisa saber de onde parte.',
    etapas: [
      {
        id: 'f0-decisoes', tipo: 'ferramenta', ferramenta: 'decisoes',
        titulo: 'Lista de decisões',
        texto: ['Ação com data e horário. Uma decisão por pilar da vida.']
      },
      {
        id: 'f0-roda1', tipo: 'roda', rodaId: 1, titulo: 'Roda da vida · diagnóstico inicial',
        texto: [
          'A Roda da Vida é uma ferramenta para equilibrar diferentes áreas da vida.',
          'Identifique as áreas que precisam de mais atenção preenchendo os anéis de acordo com sua satisfação em 12 setores, formando quatro áreas principais da experiência humana.',
          'No final, avalie sua evolução ao longo do ano com outra Roda da Vida.'
        ],
        perguntas: [
          'O que preciso melhorar na área profissional nesse ano?',
          'O que preciso melhorar na área pessoal nesse ano?',
          'O que preciso melhorar na área de relacionamento nesse ano?',
          'O que preciso melhorar na área de qualidade de vida nesse ano?'
        ]
      },
      {
        id: 'f0-medidas', tipo: 'ferramenta', ferramenta: 'medidas', titulo: 'Medidas e metas',
        texto: ['O cálculo do IMC é feito dividindo o peso da pessoa em quilogramas pela sua altura em metros elevada ao quadrado.', 'Meta: entre 18,5 e 24,9, peso normal.']
      },
      {
        id: 'f0-visao', tipo: 'ferramenta', ferramenta: 'visao', titulo: 'Visão extraordinária',
        texto: ['Escreva a visão de cada pilar no presente, como se já fosse real. Este texto é o seu norte quando a rotina apertar.']
      },
      {
        id: 'f0-ritual', tipo: 'ritual', titulo: 'Ritual do acordar',
        texto: ['Acordou? 05:00. Não pegue o celular.', 'Nove passos, doze minutos. É o que define o tom do dia inteiro.']
      },
      {
        id: 'f0-carac', tipo: 'ferramenta', ferramenta: 'caracteristicas', titulo: '30 características positivas',
        texto: ['Escreva 30 características positivas suas. Depois leia em voz alta começando com eu sou.']
      },
      {
        id: 'f0-40x', tipo: 'ferramenta', ferramenta: 'ativacao40', titulo: 'Ativação dos 40x',
        texto: ['Você escreve 40 vezes a mesma frase todos os dias.']
      },
      {
        id: 'f0-100', tipo: 'ferramenta', ferramenta: 'desafio100', titulo: 'Desafio 100 dias',
        texto: ['Defina a meta e a data de início. Marque cada dia cumprido.']
      }
    ]
  },

  /* ═══════════ SESSÃO 1 ═══════════ */
  {
    id: 's1', bloco: 'Sessão 1', nome: 'Autorresponsabilidade', cor: '#8FB8E8',
    resumo: 'A base de tudo: o que acontece é 10%, o que você faz com isso é 90%.',
    etapas: [
      {
        id: 's1-conteudo', tipo: 'leitura', titulo: 'Conceito 10 por 90',
        texto: [
          'O que acontece é 10%; os outros 90% é o que eu faço com o acontecimento. O mais importante é o que você faz com o que lhe acontece.',
          'O sentimento que você der aos 10% definirá os 90%.',
          'Não existe fracasso, apenas resultado.'
        ],
        citacao: 'Assim, também a fé, se não tiver obras, por si só é morta. Tiago 2:17'
      },
      {
        id: 's1-fichas', tipo: 'fichas', titulo: 'Que fichas caem?',
        texto: ['Que fichas caem sobre o sentimento e a intensidade que você dá para seus resultados?']
      },
      { id: 's1-agenda', tipo: 'agenda', titulo: 'Agenda programada · Sessão 1', meta: 400, tarefas: agenda(AG1) }
    ]
  },

  /* ═══════════ SESSÃO 2 ═══════════ */
  {
    id: 's2', bloco: 'Sessão 2', nome: 'Sorte e preparo', cor: '#8FB8E8',
    resumo: 'A vontade de se preparar deve ser maior que a vontade de vencer.',
    etapas: [
      {
        id: 's2-conteudo', tipo: 'leitura', titulo: 'Meta não é tarefa',
        texto: [
          'Traçar metas é a capacidade de nos determinar a buscar algo. As metas nascem dos nossos sonhos mais íntimos, de um desejo profundo de realização pessoal que nos fascina.',
          '80% dos nossos problemas são devido à ausência de metas e objetivos.',
          'Lembre-se que meta não é tarefa. Determine um objetivo a médio ou longo prazo e depois disso a sua meta serão as etapas que serão concluídas para que ele se realize.',
          'Na vida sistêmica você alimenta todos os pilares tornando a jornada prazerosa.'
        ],
        citacao: 'Uma meta fraca traz resultados fracos, assim como pouco fogo produz pouco calor. Napoleon Hill'
      },
      { id: 's2-fichas', tipo: 'fichas', titulo: 'Que fichas caem?', texto: ['O que você percebeu sobre a diferença entre as metas que você tem e as tarefas que você faz?'] },
      { id: 's2-agenda', tipo: 'agenda', titulo: 'Agenda programada · Sessão 2', meta: 400, tarefas: agenda(AG2) }
    ]
  },

  /* ═══════════ PROGRAMA 7 DIAS ═══════════ */
  {
    id: 'p7', bloco: 'Programa 7 dias', nome: 'Sete dias de reencontro', cor: '#B9A6F0',
    resumo: 'Um tema por dia, um vídeo por dia, uma decisão por dia.',
    etapas: [
      { id: 'p7-1', tipo: 'dia7', dia: 1, titulo: 'O poder do não', autor: 'Monja Coen', texto: ['Onde na sua vida o sim automático está custando caro?'] },
      { id: 'p7-2', tipo: 'dia7', dia: 2, titulo: 'Identidade e coerência', autor: 'Clóvis de Barros Filho', texto: ['Onde você deixa de ser você mesma para caber num lugar?'] },
      { id: 'p7-3', tipo: 'dia7', dia: 3, titulo: 'Vulnerabilidade como força', autor: 'Brené Brown', texto: ['O que você esconde por achar que é fraqueza e na verdade é ponte?'] },
      { id: 'p7-4', tipo: 'dia7', dia: 4, titulo: 'Soltar o peso que não é meu', autor: 'Rubem Alves', texto: ['Que peso você carrega que pertence a outra pessoa?'] },
      { id: 'p7-5', tipo: 'dia7', dia: 5, titulo: 'Autorresponsabilidade sem culpa', texto: ['Onde você confunde assumir responsabilidade com se punir?'] },
      { id: 'p7-6', tipo: 'dia7', dia: 6, titulo: 'Encontrando o meu centro', autor: 'Eckhart Tolle', texto: ['Quanto silêncio real você teve nos últimos sete dias?'] },
      { id: 'p7-7', tipo: 'dia7', dia: 7, titulo: 'Coragem e autoexpressão', autor: 'Mário Sérgio Cortella', texto: ['O que você precisa dizer e ainda não disse?'] }
    ]
  },

  /* ═══════════ CHECKPOINT + SKILL OPEN LIMITS ═══════════ */
  {
    id: 'sol', bloco: 'Skill Open Limits', nome: 'Metas e plano de ação', cor: '#F2B441',
    resumo: 'Reavaliar a roda e transformar visão em plano com data, quem e quanto.',
    etapas: [
      {
        id: 'sol-roda2', tipo: 'roda', rodaId: 2, titulo: 'Roda da vida · checkpoint 2',
        texto: ['Reavalie os 12 setores. Compare com o diagnóstico inicial.'],
        perguntas: ['O que mudou desde a primeira roda?', 'Qual área ainda pede mais atenção?']
      },
      {
        id: 'sol-metas', tipo: 'ferramenta', ferramenta: 'skillopenlimits', titulo: 'Skill Open Limits',
        texto: [
          'Visão do objetivo, vida extraordinária. Relação de metas e objetivos por pilar.',
          'Para cada meta: o que fazer, quem, quando, com o quê, recursos necessários e status.',
          'Depois responda: todos os ganhos que terei realizando minhas metas, as perdas que terei realizando, e as perdas que terei não realizando.'
        ]
      },
      {
        id: 'sol-agenda-extra', tipo: 'ferramenta', ferramenta: 'agendaExtraordinaria', titulo: 'Nova agenda da vida extraordinária',
        texto: [
          'Felicidade se conquista de segunda a sexta e não apenas no final de semana. Para conseguir você precisa ter clareza de como é a sua rotina no momento, o estado atual, e como gostaria que ela fosse, o estado desejado.',
          'Escolha o dia mais produtivo da semana e detalhe as atividades na coluna atual, hora a hora, desde a hora em que acorda até a hora em que vai dormir.',
          'Agora feche os olhos e imagine como seria aquele dia criando um mar de possibilidades, e preencha a coluna extraordinária. Sem pensar se será difícil executar. Contemple o máximo de pilares possíveis.'
        ]
      },
      { id: 'sol-fichas', tipo: 'fichas', titulo: 'Que fichas caem?', texto: ['Que fichas caem? Que decisão você toma?'] }
    ]
  },

  /* ═══════════ SESSÃO 3 ═══════════ */
  {
    id: 's3', bloco: 'Sessão 3', nome: 'A armadura', cor: '#8FB8E8',
    resumo: 'O que você veste para se proteger e já não te deixa sentir.',
    etapas: [
      {
        id: 's3-conteudo', tipo: 'leitura', titulo: 'A armadura que virou pele',
        texto: [
          'O cavaleiro colocou a armadura para proteger-se e lutar suas batalhas. Com o tempo passou a usá-la o tempo todo, até não conseguir mais tirá-la.',
          'A armadura protege, mas também impede o toque, o cheiro, o abraço e a lágrima.',
          'A pergunta desta sessão é simples e difícil: qual é a sua armadura?'
        ]
      },
      { id: 's3-fichas', tipo: 'fichas', titulo: 'Que fichas caem?', texto: ['Qual é a sua armadura, quando você a vestiu e o que ela está te impedindo de sentir?'] },
      { id: 's3-agenda', tipo: 'agenda', titulo: 'Agenda programada · Sessão 3', meta: 300, tarefas: agenda(AG3) }
    ]
  },

  /* ═══════════ SESSÃO 4 · MATRIZ DE CRENÇAS ═══════════ */
  {
    id: 's4', bloco: 'Sessão 4', nome: 'Matriz de geração de crenças', cor: '#F2755F',
    resumo: 'A chave para mudanças profundas e rápidas.',
    etapas: [
      {
        id: 's4-conteudo', tipo: 'leitura', titulo: 'Matriz de geração de crenças',
        texto: [
          'Já sabemos que nossas crenças determinam nossas vidas. O que não sabíamos é que podemos alterar e refazer nossas crenças a qualquer momento através da LINGUAGEM, e assim refazer as nossas vidas.',
          'O ciclo: crença gera sentimento, que gera pensamento, que gera comunicação, que reforça a crença. E o caminho de volta é o mesmo, o que significa que dá para entrar pelo outro lado.'
        ],
        ciclo: ['Crença', 'Sentimento', 'Pensamento', 'Comunicação']
      },
      {
        id: 's4-neural', tipo: 'leitura', titulo: 'Rede neural e plasticidade',
        texto: [
          'Rede neural ou circuitos neurais são representadas pela união de neurônios. São bilhões de neurônios conectados a outros bilhões. Nesta vasta rede está registrado todo aprendizado e memória do ser humano.',
          'Tudo que somos, fazemos e temos está registrado nas conexões neurais. Da mesma forma, tudo aquilo em que acreditamos, o que sentimos, pensamos e falamos também está registrado nessas conexões.',
          'Fases de formação: 1ª de 0 a 2 anos, 2ª de 3 a 8 anos, 3ª até a puberdade.',
          'Plasticidade neural é a capacidade do cérebro de desenvolver novas conexões sinápticas. É por isso que a mudança é possível em qualquer idade.'
        ]
      },
      {
        id: 's4-diagnostico', tipo: 'ferramenta', ferramenta: 'diagnostico', titulo: 'Diagnóstico composto',
        texto: [
          'Escreva o resultado atual de uma área da sua vida. Depois faça o diagnóstico: quais crenças, sentimentos, pensamentos e comunicação sustentam esse resultado.',
          'Em seguida escreva a solução para cada um dos quatro, e por fim o resultado desejado.'
        ]
      },
      { id: 's4-fichas', tipo: 'fichas', titulo: 'Que fichas caem?', texto: ['Que fichas caem? Que decisão você toma?'] },
      { id: 's4-agenda', tipo: 'agenda', titulo: 'Agenda programada · Sessão 4', meta: 280, tarefas: agenda(AG4) }
    ]
  },

  /* ═══════════ SESSÃO 5 ═══════════ */
  {
    id: 's5', bloco: 'Sessão 5', nome: 'Mudança de comportamento', cor: '#F2755F',
    resumo: 'Quatro estados possíveis. Em qual você está hoje?',
    etapas: [
      {
        id: 's5-estados', tipo: 'ferramenta', ferramenta: 'estados', titulo: 'Os quatro estados',
        texto: [
          'Parasita: age como tomador, beneficiando-se muito mais do que contribuindo. Comporta-se de forma egoísta e autocentrada. É o tipo que quer, e busca, tomar vantagem em tudo.',
          'Hospedeiro: não sabe dizer não e apenas contribui para o crescimento dos outros enquanto esquece de si. Normalmente não é reconhecido pela sua doação, muito menos valorizado ou respeitado. Os outros prosperam com sua ajuda, mas ele continua estagnado.',
          'Autofagismo: consome a própria carne. Não contribui e muito menos cresce. O mundo passa e ele é um espectador inerte no tempo. Faz o básico para sobreviver e, por isso, não é capaz de contribuir nem consigo nem com ninguém.',
          'Plenitude: cresce e cresce forte e rápido. Sua vida dá certo. Ela é feliz e faz o que tem de ser feito. Não procrastina nem se sabota. É plena em realizações e, além disso, empodera e ajuda muitas pessoas.'
        ]
      },
      {
        id: 's5-comportamento', tipo: 'ferramenta', ferramenta: 'comportamento', titulo: 'Protocolo de mudança de comportamento',
        texto: [
          'O grande objetivo deste programa é um novo estilo de vida. Qualquer coisa diferente de abundância na sua vida é disfunção. E toda disfunção deve e merece ser tratada.',
          'A vontade de se preparar deve ser maior que a vontade de vencer.'
        ],
        passos: [
          'Enumere os comportamentos que te fazem mal',
          'Detalhe: como se sente ao agir assim, por que ocorre, o que as pessoas dizem, quais crenças estão por trás, o que ganha ao fazer, o que ocorreu na infância',
          'O que você perde com cada um deles',
          'Como será a sua vida se continuar a mantê-los, em 1, 2 e 5 anos',
          'Escreva: eu me arrependo do comportamento X. Depois fale em voz alta em frente ao espelho',
          'Peça perdão a você e às pessoas a quem causou dor com esse comportamento, em voz alta',
          'Substitua por escrito os comportamentos ruins pelos novos comportamentos',
          'Quais decisões e ações para vivê-los'
        ]
      },
      { id: 's5-fichas', tipo: 'fichas', titulo: 'Que fichas caem?', texto: ['Agora você sabe o seu estado atual. Quais fichas caem? A partir desse entendimento, que decisão você toma?'] },
      { id: 's5-agenda', tipo: 'agenda', titulo: 'Agenda programada · Sessão 5', meta: 260, tarefas: agenda(AG5) }
    ]
  },

  /* ═══════════ CHECKPOINT 3 ═══════════ */
  {
    id: 'r3', bloco: 'Checkpoint', nome: 'Roda da vida 3', cor: '#F2B441', resumo: 'Meio do caminho. Onde a roda mudou?',
    etapas: [{
      id: 'r3-roda', tipo: 'roda', rodaId: 3, titulo: 'Roda da vida · checkpoint 3',
      texto: ['Reavalie os 12 setores.'], perguntas: ['Que área subiu mais e por quê?', 'Que área continua parada e o que ela está pedindo?']
    }]
  },

  /* ═══════════ SESSÃO 6 ═══════════ */
  {
    id: 's6', bloco: 'Sessão 6', nome: 'Gestão do contágio social', cor: '#B9A6F0',
    resumo: 'Diga-me com quem tu andas e te direi quem és.',
    etapas: [
      {
        id: 's6-conteudo', tipo: 'leitura', titulo: 'O contágio é real e tem número',
        texto: [
          'Raramente nos damos conta de que opiniões, atitudes e até estados de humor daqueles com quem convivemos, mesmo sem muita proximidade, influenciam de forma intensa nossos pensamentos, sentimentos e ações.',
          'Fowler e Christakis avaliaram as relações sociais de mais de 5 mil cidadãos americanos. A análise estatística revelou que a variação de peso dos participantes dependia intensamente do fato de os três mais próximos do sujeito terem engordado ou emagrecido.',
          'Em 30 de janeiro de 1962, três moças de um vilarejo na Tanzânia tiveram um ataque de riso incontrolado. Até 18 de março, 94 habitantes caíram em alegria histérica, e a onda contagiou milhares de pessoas.',
          'Quem está em contato direto com uma pessoa feliz aumenta em média 15% seus níveis de felicidade. Quem conhece apenas o amigo de uma pessoa feliz tem proveito de cerca de 10%.',
          'O mesmo vale para a solidão: se um amigo que mora nas redondezas sente-se solitário, nossos próprios dias solitários aumentam.'
        ],
        destaques: [
          'Cada uma de nossas redes possui em média 6 pessoas',
          'Não existe equilíbrio: ou estamos carregando alguém nas costas ou alguém está nos carregando',
          'Suas redes devem ser parecidas com os seus objetivos por pilar',
          'A tendência natural é atrairmos redes parecidas com quem somos hoje'
        ]
      },
      {
        id: 's6-redes', tipo: 'ferramenta', ferramenta: 'redes', titulo: 'Mapa de redes',
        texto: ['Mapeie suas redes e defina a estratégia para cada uma.'],
        estrategias: [
          'Blindagem: continuidade', 'Tempo e especialidade nas relações', 'Perfeita linguagem de amor',
          'Não conectar visual, auditivo e tátil, fugir das mensagens negativas', 'Mudança pessoal de ambiente',
          'Rapport para mudanças de atitudes de outras pessoas', 'Frequentar novos ambientes sociais',
          'Sair de redes atuais', 'Acrescentar novas redes', 'Eliminar pessoas das suas redes',
          'Não ajudar quem não quer ser ajudado', 'Não tentar convencer os céticos'
        ]
      },
      { id: 's6-fichas', tipo: 'fichas', titulo: 'Que fichas caem?', texto: ['Que fichas caem? Que decisão você toma?'] },
      { id: 's6-agenda', tipo: 'agenda', titulo: 'Agenda programada · Sessão 6', meta: 260, tarefas: agenda(AG6) }
    ]
  },

  /* ═══════════ CHECKPOINT 4 ═══════════ */
  {
    id: 'r4', bloco: 'Checkpoint', nome: 'Roda da vida 4', cor: '#F2B441', resumo: 'Depois de mexer nas redes, a roda muda.',
    etapas: [{
      id: 'r4-roda', tipo: 'roda', rodaId: 4, titulo: 'Roda da vida · checkpoint 4',
      texto: ['Reavalie os 12 setores.'], perguntas: ['O que mudou depois de gerenciar suas redes?']
    }]
  },

  /* ═══════════ SESSÃO 7 ═══════════ */
  {
    id: 's7', bloco: 'Sessão 7', nome: 'Vício emocional', cor: '#F2755F',
    resumo: 'A proporção de Losada: 2,9013.',
    etapas: [
      {
        id: 's7-conteudo', tipo: 'leitura', titulo: 'Vício emocional e a proporção de Losada',
        texto: [
          'Vício emocional é todo comportamento, pensamento ou sentimento destrutivo que se repete mesmo sabendo do prejuízo que causa.',
          'Com base em extensa modelagem matemática desenvolvida por Losada, 2,9013 é a proporção mínima de interações positivas para cada interação negativa necessária para que uma relação ou equipe floresça.',
          'Abaixo dessa proporção, a relação entra em deterioração. Vale para casamento, família e trabalho.'
        ]
      },
      { id: 's7-fichas', tipo: 'fichas', titulo: 'Que fichas caem?', texto: ['Em quais relações da sua vida a proporção está abaixo de 3 para 1? O que você faz a respeito a partir de hoje?'] },
      { id: 's7-agenda', tipo: 'agenda', titulo: 'Agenda programada · Sessão 7', meta: 280, tarefas: agenda(AG7) }
    ]
  },

  /* ═══════════ SESSÃO 8 ═══════════ */
  {
    id: 's8', bloco: 'Sessão 8', nome: 'Dinheiro', cor: '#3ECF8E',
    resumo: 'Na vida financeira, nada tem a ver com dinheiro.',
    etapas: [
      {
        id: 's8-conteudo', tipo: 'leitura', titulo: 'Intimidade com dinheiro',
        texto: [
          'Na vida financeira nada tem a ver com o dinheiro. Riqueza é consequência de crença, comportamento e relação.',
          'Como está a sua intimidade com dinheiro? Como você o guarda na bolsa ou na carteira? O que você fala sobre ele quando ninguém está ouvindo?'
        ]
      },
      {
        id: 's8-matriz', tipo: 'ferramenta', ferramenta: 'matrizDinheiro', titulo: 'Matriz de crenças financeiras',
        texto: ['Enumere 5 motivos para não ser pobre. Enumere 5 motivos para ser rica. Depois monte o caminho de recursos.']
      },
      { id: 's8-fichas', tipo: 'fichas', titulo: 'Que fichas caem?', texto: ['Que fichas caem? Que decisão você toma?'] },
      { id: 's8-agenda', tipo: 'agenda', titulo: 'Agenda programada · Sessão 8', meta: 280, tarefas: agenda(AG8) }
    ]
  },

  /* ═══════════ SESSÃO 9 ═══════════ */
  {
    id: 's9', bloco: 'Sessão 9', nome: 'Sentimentos tóxicos', cor: '#F2755F',
    resumo: 'Raiva, vergonha, orgulho, e as três cartas.',
    etapas: [
      {
        id: 's9-conteudo', tipo: 'leitura', titulo: 'Os sentimentos tóxicos',
        texto: [
          'Raiva é um sentimento de protesto, insegurança, timidez ou frustração.',
          'Vergonha, ou timidez, é o sentimento que leva a pessoa a se esconder dentro de si, temendo o julgamento.',
          'Orgulho é o que se apresenta como autossuficiência: pensar ter bastante força e não precisar de ninguém.',
          'Enquanto esses sentimentos não forem trabalhados, eles estarão presentes na fase adulta e continuarão a escrever os mesmos resultados.'
        ]
      },
      {
        id: 's9-padrao', tipo: 'ferramenta', ferramenta: 'repeticao', titulo: 'Repetição de padrão',
        texto: [
          'Mapeie as atitudes e palavras que recebeu, positivas e negativas, de mãe, pai e de si mesma.',
          'A maioria das pessoas passa a vida procurando pais amorosos e dignos de confiança que não tiveram. Esse conflito destrói os relacionamentos.',
          'As pessoas tendem a internalizar as programações aprendidas com os pais e reproduzir na vida adulta os cenários que viveram na infância.'
        ]
      },
      {
        id: 's9-cartas', tipo: 'ferramenta', ferramenta: 'cartas', titulo: 'As três cartas',
        texto: ['Carta de prejuízo, carta de acusação e carta de perdão. Nesta ordem. Escreva sem editar.']
      },
      { id: 's9-roda5', tipo: 'roda', rodaId: 5, titulo: 'Roda da vida · checkpoint 5', texto: ['Reavalie os 12 setores.'], perguntas: ['O que se abriu depois das cartas?'] },
      { id: 's9-agenda', tipo: 'agenda', titulo: 'Agenda programada · Sessão 9', meta: 280, tarefas: agenda(AG9) }
    ]
  },

  /* ═══════════ SESSÃO 10 ═══════════ */
  {
    id: 's10', bloco: 'Sessão 10', nome: 'Gratidão', cor: '#F2B441',
    resumo: 'Estrutura psicoemocional e seus resultados.',
    etapas: [
      {
        id: 's10-conteudo', tipo: 'leitura', titulo: 'Gratidão como estrutura',
        texto: [
          'A gratidão não é um gesto de educação, é uma estrutura psicoemocional. Ela reorganiza o que o cérebro escolhe enxergar.',
          'Quem treina gratidão muda a base de onde toma decisões, e por isso muda os resultados.'
        ]
      },
      {
        id: 's10-mapa', tipo: 'ferramenta', ferramenta: 'gratidao', titulo: 'Mapeamento de gratidões',
        texto: ['Relacione pessoas e a gratidão que você tem a elas. Depois escreva a carta de gratidão para uma delas e entregue.']
      },
      { id: 's10-fichas', tipo: 'fichas', titulo: 'Que fichas caem?', texto: ['Que fichas caem? Que decisão você toma?'] },
      { id: 's10-agenda', tipo: 'agenda', titulo: 'Agenda programada · Sessão 10', meta: 280, tarefas: agenda(AG10) }
    ]
  }
];

/* mapeia tarefa da agenda → ferramenta, para o preenchimento cruzado */
export const VINCULOS = [
  { padrao: /ritual do acordar/i, ferramenta: 'ritual' },
  { padrao: /30 (coisas positivas|caracter)/i, ferramenta: 'caracteristicas' },
  { padrao: /ativa[çc][ãa]o|recursos 5x/i, ferramenta: 'ativacao40' },
  { padrao: /academia/i, ferramenta: 'treino' },
  { padrao: /gratid[ãa]o/i, ferramenta: 'gratidao' },
  { padrao: /or[çc]amento|planejamento financeiro/i, ferramenta: 'matrizDinheiro' }
];

export const totalEtapas = TRILHA.reduce((a, b) => a + b.etapas.length, 0);
