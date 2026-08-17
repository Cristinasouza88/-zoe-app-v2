/* ══════════ Trilha Inglês — Fluency Academy ══════════
   Extraído do mapeamento real da conta (agosto de 2026): trilha principal
   sequencial (First Steps → Basic → Intermediate → Independent) com 307
   aulas, mais 13 cursos complementares encaixados por fase, rotina semanal
   e desafios. A fonte não lista aula a aula — o rastreio de progresso é
   por fase (marcada como concluída) + checklist de desafios/rotina. */

export const PAINEL_URL = 'https://academy.fluency.io/';
export const MEMHACK_URL = 'https://memhack.fluency.io/home';

export const FASES = [
  {
    id: 'fase1',
    nome: 'First Steps',
    resumo: 'Base absoluta: apresentar-se, rotina, pedidos simples. Objetivo: criar o hábito diário sem pressão.',
    aulas: 42, horas: '7h35', unidades: 8,
    link: 'https://academy.fluency.io/programs/e866a78e-8993-45ee-9bba-ad303801df2e/courses/c8764c5d-9c2c-42d6-a47c-5dbc0cea60c1/modules/0778d06d-616e-40aa-a4ae-098a23d3eb5f',
    complementares: [
      { titulo: 'Mochilão com as Gêmeas', aulas: 7, horas: '3h12', desc: 'inglês para viagem', link: 'https://academy.fluency.io/programs/e866a78e-8993-45ee-9bba-ad303801df2e/courses/1c482d94-c320-4330-ac15-0dd1abe4d018/modules/04a9bd59-c40d-4690-9e7a-286c12fb4835' },
      { titulo: 'Behind the Lyrics', aulas: 10, horas: '4h10', desc: 'vocabulário via música', link: 'https://academy.fluency.io/programs/e866a78e-8993-45ee-9bba-ad303801df2e/courses/859140b2-645e-4744-be7d-070cc1088d1e/modules/2f9b6cad-9481-4859-9af1-2b46e9e8fc53' }
    ]
  },
  {
    id: 'fase2',
    nome: 'Basic',
    resumo: 'Passado, planos futuros, viagens, opiniões simples. Fase mais longa — é aqui que a rotina precisa estar bem consolidada.',
    aulas: 91, horas: '57h45', unidades: 15,
    link: 'https://academy.fluency.io/programs/e866a78e-8993-45ee-9bba-ad303801df2e/courses/c8764c5d-9c2c-42d6-a47c-5dbc0cea60c1/modules/4b8e41e5-0a19-4637-9ece-5b7c77ead707',
    complementares: [
      { titulo: 'Grammar Hacks', aulas: 44, horas: '29h20', desc: 'gramática na prática', link: 'https://academy.fluency.io/programs/e866a78e-8993-45ee-9bba-ad303801df2e/courses/28585070-a241-4e54-b754-b3660a1d4727/modules/9ee39178-0a60-40c4-98a7-3d1bb4d6d55f' },
      { titulo: 'Phrasal verbs essenciais', aulas: 21, horas: '14h', desc: '', link: 'https://academy.fluency.io/programs/e866a78e-8993-45ee-9bba-ad303801df2e/courses/bb139cb7-ed9e-424a-ad6f-01d9e3d80cdc/modules/d02087ba-6db0-445a-95b4-1f9e8726dc63' },
      { titulo: 'Expansão de vocabulário', aulas: 16, horas: '10h40', desc: '', link: 'https://academy.fluency.io/programs/e866a78e-8993-45ee-9bba-ad303801df2e/courses/ecf788d7-f3c0-4f93-9768-661bda9513a2/modules/9c998dd4-6d8f-485c-883d-1e084dfd1b36' }
    ]
  },
  {
    id: 'fase3',
    nome: 'Intermediate',
    resumo: 'Fluidez em conversas, phrasal verbs, argumentação. A fase de maior carga — vale intercalar bem com os cursos de imersão para não cansar.',
    aulas: 110, horas: '72h40', unidades: 16,
    link: 'https://academy.fluency.io/programs/e866a78e-8993-45ee-9bba-ad303801df2e/courses/c8764c5d-9c2c-42d6-a47c-5dbc0cea60c1/modules/47450ac4-275b-4aee-8ddf-1698d956b07f',
    complementares: [
      { titulo: 'Dialogue Class', aulas: 14, horas: '9h20', desc: '', link: 'https://academy.fluency.io/programs/e866a78e-8993-45ee-9bba-ad303801df2e/courses/c1f39cad-d4f1-490b-b842-2bd0bec9e81c/modules/cc8f0e41-9b2f-4ea9-95ce-1b49e9d4ddb2' },
      { titulo: 'Expressões idiomáticas', aulas: 16, horas: '10h40', desc: '', link: 'https://academy.fluency.io/programs/e866a78e-8993-45ee-9bba-ad303801df2e/courses/d7b109cd-ae94-4fa2-b672-b8f3b40fbe2c/modules/d5ea5430-26ad-4f1b-b932-1dbbaacfa018' },
      { titulo: 'Ear Candy', aulas: 16, horas: '10h40', desc: 'pronúncia com música', link: 'https://academy.fluency.io/programs/e866a78e-8993-45ee-9bba-ad303801df2e/courses/fa995e21-8c19-4611-bf3c-effbdc4ea2cf/modules/ebb7bed8-dc4f-4809-9ac4-0fbf062a1f9f' },
      { titulo: 'Inglês com filmes', aulas: 12, horas: '8h', desc: '', link: 'https://academy.fluency.io/programs/e866a78e-8993-45ee-9bba-ad303801df2e/courses/4be254b6-8f62-4ea8-a98c-0d35e6d71c53/modules/9762844e-d46c-4dc5-bdcc-a3ed5eb3b878' }
    ]
  },
  {
    id: 'fase4',
    nome: 'Independent',
    resumo: 'Naturalidade, debate, cultura e atualidades. Fase final — hora de aplicar tudo em contextos de negócios e situações reais.',
    aulas: 64, horas: '42h40', unidades: 16,
    link: 'https://academy.fluency.io/programs/e866a78e-8993-45ee-9bba-ad303801df2e/courses/c8764c5d-9c2c-42d6-a47c-5dbc0cea60c1/modules/f661f549-11e7-408d-a402-3434798308ed',
    complementares: [
      { titulo: 'Business: Diálogo', aulas: 28, horas: '18h40', desc: '', link: 'https://academy.fluency.io/programs/e866a78e-8993-45ee-9bba-ad303801df2e/courses/ba26828a-4b15-408f-ae47-f0f37d8b3189' },
      { titulo: 'Business: Native Talk', aulas: 23, horas: '11h30', desc: '', link: 'https://academy.fluency.io/programs/e866a78e-8993-45ee-9bba-ad303801df2e/courses/a4c58129-c468-4340-83fd-e9d1e8e77db4' },
      { titulo: 'Phrasal verbs avançados', aulas: 14, horas: '9h20', desc: '', link: 'https://academy.fluency.io/programs/e866a78e-8993-45ee-9bba-ad303801df2e/courses/33e7894f-286d-40ec-90a9-cacec9523d33/modules/d377f386-71dc-463c-ab7d-6172457df70c' },
      { titulo: 'Vivendo nos Estados Unidos', aulas: 16, horas: '10h40', desc: '', link: 'https://academy.fluency.io/programs/e866a78e-8993-45ee-9bba-ad303801df2e/courses/4c1f81bd-bf8f-48b0-b8ea-7c0d17fd8e12/modules/085a9685-564d-4c18-aa41-9afdfd821980' }
    ]
  }
];

export const totalAulasIngles = FASES.reduce((a, f) => a + f.aulas, 0); // 307
export const totalAulasComplementares = FASES.reduce((a, f) => a + f.complementares.reduce((b, c) => b + c.aulas, 0), 0);

export const ROTINA_SEMANAL = [
  { dia: 'Segunda', texto: 'Aula ao vivo com professor + 1 aula do módulo principal (20 min) + Memhack (10 min)' },
  { dia: 'Terça', texto: '1-2 aulas do módulo principal (30-40 min) + Memhack (10 min)' },
  { dia: 'Quarta', texto: 'Sessão de conversação individual ou em grupo (30 min) + revisão rápida no Memhack (10 min)' },
  { dia: 'Quinta', texto: '1-2 aulas do módulo principal (30-40 min) + curso complementar da fase atual (20 min)' },
  { dia: 'Sexta', texto: 'Curso complementar (30 min) + Memhack (10 min) + desafio da semana' },
  { dia: 'Sábado', texto: 'Sessão de conversação em grupo (imersão) + curso de música/filme — 30-40 min, no seu ritmo' },
  { dia: 'Domingo', texto: 'Check semanal + planejamento da próxima semana + Memhack revisão geral + descanso ativo (podcast/série em inglês, sem cobrança)' }
];

export const RITMOS = [
  { id: 'leve', nome: 'Leve', resumo: '~20 min/dia, 3-4h/semana → conclusão em ~20 meses', detalhe: 'Segunda a sexta: 1 aula do módulo principal (15-20 min). Sem bloco fixo de complementares — use-os aos sábados, 20-30 min. Sessão de conversação 1x por semana. Memhack: 5 min por dia.' },
  { id: 'padrao', nome: 'Padrão', resumo: '~45 min/dia, 5-6h/semana → conclusão em ~13-14 meses', detalhe: 'Rotina semanal completa (ver acima).' },
  { id: 'intensivo', nome: 'Intensivo', resumo: '~1h30/dia, 8-10h/semana → conclusão em ~8-9 meses', detalhe: 'Segunda a sexta: 2-3 aulas do módulo principal (50-60 min) + curso complementar (20-30 min) + Memhack (10 min). Sessões de conversação 3x por semana. Sábado: maratona de um curso complementar completo.' }
];

export const DESAFIOS = [
  { id: 'd1', freq: 'Diário', titulo: 'Fale em voz alta', desc: 'Repita 5 frases da aula de hoje em voz alta (ou grave um áudio de 30s) imitando a pronúncia do professor.' },
  { id: 'd2', freq: 'Diário', titulo: 'Caça-palavras', desc: 'Anote pelo menos 5 palavras ou expressões novas no Memhack, com uma frase de exemplo cada.' },
  { id: 'd3', freq: 'Diário', titulo: 'Diário em inglês', desc: 'Escreva 3 a 5 frases sobre o seu dia em inglês, mesmo com erros — o objetivo é praticar a produção.' },
  { id: 'd4', freq: 'Semanal', titulo: 'Modo nativo', desc: 'Assista 10-15 min de conteúdo em inglês sem legenda e anote 3 expressões novas.' },
  { id: 'd5', freq: 'Semanal', titulo: 'Karaokê Fluency', desc: 'Use o Ear Candy ou o Behind the Lyrics para cantar uma música inteira em inglês, prestando atenção na pronúncia.' },
  { id: 'd6', freq: 'Semanal', titulo: 'Unidade completa', desc: 'Termine 100% de uma unidade do módulo principal (todas as aulas e atividades) até o fim da semana.' },
  { id: 'd7', freq: 'Quinzenal', titulo: 'Curso relâmpago', desc: 'Finalize um curso complementar curto em uma única sessão de estudo.' },
  { id: 'd8', freq: 'Quinzenal', titulo: 'Conversa sem roteiro', desc: 'Participe de uma sessão de conversação em grupo com um tema que você ainda não praticou, sem preparar frases antes.' },
  { id: 'd9', freq: 'Mensal', titulo: 'Autoavaliação gravada', desc: 'Grave um áudio ou vídeo de 1-2 min falando sobre o que aprendeu no mês. Compare com o do mês seguinte.' }
];

export const CHECK_DIARIO = [
  '1 aula do módulo principal assistida',
  'Atividades da aula concluídas',
  'Revisão no Memhack feita (mín. 5-10 min)',
  '1 frase nova praticada em voz alta',
  'Desafio do dia cumprido'
];

export const CHECK_SEMANAL = [
  'Todas as aulas planejadas da semana concluídas',
  'Participei de pelo menos 1 sessão de conversação',
  'Assisti à aula ao vivo (quando disponível)',
  'Avancei no curso complementar da fase atual',
  'Atualizei e revisei os decks do Memhack',
  'Conferi o % de progresso do curso na home e ajustei a rotina se necessário'
];

export const LINKS_OUTROS = [
  { titulo: 'Sessões de conversação', desc: 'Agendamento individual/grupo, direto na home', link: PAINEL_URL },
  { titulo: 'Aulas ao vivo', desc: 'Calendário de aulas com professores, widget na home', link: PAINEL_URL },
  { titulo: 'Memhack (Memorização)', desc: 'Flashcards de revisão espaçada', link: MEMHACK_URL },
  { titulo: 'Seu perfil', desc: 'Dados da conta', link: 'https://academy.fluency.io/profile' },
  { titulo: 'Declarações e certificados', desc: 'Comprovantes de conclusão', link: 'https://academy.fluency.io/documents' },
  { titulo: 'Preferências da plataforma', desc: 'Configurações gerais', link: 'https://academy.fluency.io/platform-preferences' },
  { titulo: 'Programa de indicações', desc: 'Creators Club', link: 'https://academy.fluency.io/br/fa/creatorsclub/alunos' }
];
