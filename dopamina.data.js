/* ══════════ Trilha Reservatório de Dopamina ══════════
   175 aulas, 12 semanas, 3 aulas por dia útil (segunda a sexta),
   na ordem cronológica oficial recomendada pela plataforma.
   Extraído do mapeamento real da conta (17 ago → 06 nov de 2026). */

const L = (id, num, titulo, produto, aula) => ({
  id, num, titulo, url: `https://reservatoriodedopamina.appmagic.link/products/${produto}/lessons/${aula}`
});

export const COMUNIDADE_ANTES = [
  { titulo: 'Ler as boas-vindas do Eslen', link: 'https://comunidade.reservatoriodedopamina.com.br/c/boas-vindas' },
  { titulo: 'Ler o FAQ "Como usar a Jugular"', link: 'https://comunidade.reservatoriodedopamina.com.br/c/como-usar' },
  { titulo: 'Postar um "Apresente-se"', link: 'https://comunidade.reservatoriodedopamina.com.br/c/apresente-se' }
];

export const COMUNIDADE_HABITO = [
  { titulo: 'Ver o Mural RD e os Recados da semana', link: 'https://comunidade.reservatoriodedopamina.com.br/c/mural-rd' },
  { titulo: 'Participar de 1 desafio em Metas e Desafios', link: 'https://comunidade.reservatoriodedopamina.com.br/c/metas-rd' }
];

export const COMUNIDADE_EXPLORAR = [
  { titulo: 'Autodesenvolvimento', link: 'https://comunidade.reservatoriodedopamina.com.br/c/autodesenvolvimento' },
  { titulo: 'Leitura e Estudos', link: 'https://comunidade.reservatoriodedopamina.com.br/c/leituraeestudos' },
  { titulo: 'Saúde', link: 'https://comunidade.reservatoriodedopamina.com.br/c/saude' },
  { titulo: 'Reservatório de Oportunidades', link: 'https://comunidade.reservatoriodedopamina.com.br/c/vagas' }
];

export const CLUBE_DO_LIVRO = { titulo: 'Acompanhar o clube e ver o próximo encontro', link: 'https://comunidade.reservatoriodedopamina.com.br/c/clube-do-livro/' };

export const EVENTOS_FINAL_SEMANA = [
  { data: '19 set', hora: '17h–18h', texto: '1ª corrida do RD RO (Aquecimento Corre RD) — presencial', link: 'https://comunidade.reservatoriodedopamina.com.br/c/lives-e-eventos' },
  { data: '27 set', hora: '05h–12h', texto: '2ª Corre RD (Florianópolis/SC) — evento presencial', link: 'https://comunidade.reservatoriodedopamina.com.br/c/lives-e-eventos' }
];

export const SEMANAS = [
  {
    id: 'sem1', titulo: 'Semana 1', intervalo: '17 ago – 21 ago',
    dias: [
      { dia: 'Segunda', data: '17 ago', licoes: [L('l1', '001', 'Corrida e Cigarro', 1691, 5420), L('l2', '002', 'A montanha', 1696, 5483), L('l3', '003', 'Qual é o seu suco?', 1693, 5434)] },
      { dia: 'Terça', data: '18 ago', licoes: [L('l4', '004', 'Dinheiro (contém 1 desafio)', 1696, 5488), L('l5', '005', 'Roupas (coisas importantes que ninguém fala)', 1696, 5489), L('l6', '006', 'Onde busco artigo científico', 1696, 5484)] },
      { dia: 'Quarta', data: '19 ago', licoes: [L('l7', '007', 'Como dormir bem: guia completo', 1690, 5427), L('l8', '008', 'Jejum de dopamina e um tapa na sua cara', 1693, 5436), L('l9', '009', 'O que a pornografia faz no cérebro (segundo a ciência)', 1691, 5503)] },
      { dia: 'Quinta', data: '20 ago', licoes: [L('l10', '010', 'A melhor forma que encontrei de estudar', 1696, 5479), L('l11', '011', 'Como falar em público', 1696, 5485), L('l12', '012', 'Comportamento de soma zero', 1693, 5438)] },
      { dia: 'Sexta', data: '21 ago', licoes: [L('l13', '013', 'A neurociência da meditação (e como fazer)', 1692, 5468), L('l14', '014', 'Somos monogâmicos?', 1695, 5556), L('l15', '015', 'Fure a bolha homeostática', 1694, 5511)] }
    ]
  },
  {
    id: 'sem2', titulo: 'Semana 2', intervalo: '24 ago – 28 ago',
    dias: [
      { dia: 'Segunda', data: '24 ago', licoes: [L('l16', '016', 'Como organizo minha agenda (teoria e prática)', 1692, 5466), L('l17', '017', 'Como ter motivação para treinar (use seu sistema nervoso autônomo)', 1694, 5512), L('l18', '018', 'A neurociência dos vícios (e como manejar)', 1691, 5524)] },
      { dia: 'Terça', data: '25 ago', licoes: [L('l19', '019', 'Como ser mais racional (use seu córtex pré-frontal)', 1688, 5498), L('l20', '020', 'Estresse e incompatibilidade evolutiva obesidade e depressão', 1694, 5529), L('l21', '021', 'Como recompensar o processo', 1693, 5440)] },
      { dia: 'Quarta', data: '26 ago', licoes: [L('l22', '022', 'Como modular seu microambiente', 1691, 5474), L('l23', '023', 'Sobre o livre-arbítrio (e como quem manda é o seu ambiente)', 1689, 5453), L('l24', '024', 'Relacionamentos e como lidar com o término', 1695, 5558)] },
      { dia: 'Quinta', data: '27 ago', licoes: [L('l25', '025', 'Como escolhemos nossos pares e parcerios sexuais', 1695, 5559), L('l26', '026', 'A neurociência do ciúme (e como manejar)', 1695, 5560), L('l27', '027', 'A sociedade emburrece a concorrência', 1693, 5431)] },
      { dia: 'Sexta', data: '28 ago', licoes: [L('l28', '028', 'Os próximos cinco-dez anos (do aprendedor ao fazedor)', 1696, 5465), L('l29', '029', 'Como se comportar em uma entrevista de emprego (usando as neurociências)', 1696, 5490), L('l30', '030', 'A trivialidade da excelência', 1693, 5429)] }
    ]
  },
  {
    id: 'sem3', titulo: 'Semana 3', intervalo: '31 ago – 04 set',
    dias: [
      { dia: 'Segunda', data: '31 ago', licoes: [L('l31', '031', 'Suas lentes estão sujas', 1689, 5469), L('l32', '032', 'Como limpei minhas lentes', 1689, 5470), L('l33', '033', 'Ambiente: a estrutura que sustenta suas lentes', 1689, 5471)] },
      { dia: 'Terça', data: '01 set', licoes: [L('l34', '034', 'O estoicismo e as neurociências', 1688, 5548), L('l35', '035', 'A felicidade é um (des)equilíbrio', 1688, 5549), L('l36', '036', 'Sinal de segurança', 1688, 5486)] },
      { dia: 'Quarta', data: '02 set', evento: { hora: '18h30–19h30', texto: 'Clube do Livro: "1984" — Encontro Único (live, online)', link: CLUBE_DO_LIVRO.link }, licoes: [L('l37', '037', 'Por isso você vê problema em tudo (e como resolver)', 1688, 5539), L('l38', '038', 'Tudo sobre TDAH (sintomas, neurobiologia, diagnóstico e tratamentos)', 1688, 5574), L('l39', '039', 'Como aprender a gostar de estudar', 1696, 5478)] },
      { dia: 'Quinta', data: '03 set', licoes: [L('l40', '040', 'A felicidade vem antes do sucesso (e um papo reto no final)', 1688, 5550), L('l41', '041', 'Caminhar mudará sua vida (experiência pessoal + estudo)', 1694, 5516), L('l42', '042', 'Mescla com personagem (ferramenta para urgência)', 1688, 5487)] },
      { dia: 'Sexta', data: '04 set', licoes: [L('l43', '043', 'Zona de segurança x zona de conforto (cuide para não ficar exposto)', 1696, 5464), L('l44', '044', 'Como reduzir a procrastinação (passo a passo)', 1692, 5467), L('l45', '045', 'Como fazer uma boa apresentação (slides, fala e estrutura de conteúdo)', 1696, 5491)] }
    ]
  },
  {
    id: 'sem4', titulo: 'Semana 4', intervalo: '07 set – 11 set',
    dias: [
      { dia: 'Segunda', data: '07 set', licoes: [L('l46', '046', 'Desamparo aprendido (sim, você pode mudar)', 1689, 5573), L('l47', '047', 'Tudo sobre a cannabis (efeitos maléficos e medicinais)', 1691, 5528), L('l48', '048', 'O que o álcool faz no cérebro', 1691, 5525)] },
      { dia: 'Terça', data: '08 set', licoes: [L('l49', '049', 'O cérebro de quem dorme mal', 1690, 5425), L('l50', '050', 'O impacto do sobrepeso e da obesidade (Tenha esse conhecimento disponível)', 1694, 5530), L('l51', '051', 'Relação fisiológica entre obesidade e depressão', 1694, 5531)] },
      { dia: 'Quarta', data: '09 set', licoes: [L('l52', '052', 'A neurociência dos hábitos', 1691, 5477), L('l53', '053', 'Comida (e/ou álcool) como regulador emocional (estratégias de manejo)', 1694, 5532), L('l54', '054', 'Longevidade com qualidade (Peter Attia - engenharia reversa para viver mais)', 1694, 5533)] },
      { dia: 'Quinta', data: '10 set', licoes: [L('l55', '055', 'Como ser mais racional (pt. 2)', 1688, 5499), L('l56', '056', 'A felicidade se espalha como um vírus (e um exercício ao final)', 1688, 5552), L('l57', '057', 'O que são e onde ficam as memórias?', 1696, 5481)] },
      { dia: 'Sexta', data: '11 set', licoes: [L('l58', '058', 'Como melhorar a memória (e prevenir sua queda)', 1696, 5482), L('l59', '059', 'Eixo intestino-cérebro (cuide das suas bactérias)', 1694, 5534), L('l60', '060', 'Eixo intestino-cérebro (pt. 2)', 1694, 5536)] }
    ]
  },
  {
    id: 'sem5', titulo: 'Semana 5', intervalo: '14 set – 18 set',
    dias: [
      { dia: 'Segunda', data: '14 set', licoes: [L('l61', '061', 'Dinheiro traz felicidade? (pt 1 - sim)', 1688, 5554), L('l62', '062', 'Dinheiro não traz felicidade (pt 2 - não)', 1688, 5555), L('l63', '063', 'O poder da expectativa (sistema dopaminérgico)', 1693, 5553)] },
      { dia: 'Terça', data: '15 set', licoes: [L('l64', '064', 'Como não fazer a coisa errada no momento certo (ou: como ser mais racional pt. 3)', 1688, 5500), L('l65', '065', 'A prática (skin in the game)', 1694, 5444), L('l66', '066', 'Como o estresse potencializa hábitos (ruins)', 1691, 5522)] },
      { dia: 'Quarta', data: '16 set', licoes: [L('l67', '067', 'Cafeína e desempenho (físico e cognitivo)', 1690, 5515), L('l68', '068', 'Habituação do seu sistema de recompensa (e as decisões)', 1691, 5441), L('l69', '069', 'Quão influenciável é você? (ambiente e modulação de comportamento)', 1689, 5472)] },
      { dia: 'Quinta', data: '17 set', licoes: [L('l70', '070', 'Os efeitos do exercício físico no cérebro', 1694, 5513), L('l71', '071', 'O estresse (des)necessário', 1656, 5572), L('l72', '072', 'Somos um novo nicho (o estilo de vida RD)', 1696, 5421)] },
      { dia: 'Sexta', data: '18 set', licoes: [L('l73', '073', 'Quando desistir é uma boa opção', 1688, 5501), L('l74', '074', 'Alzheimer: por que é tão estudado e você deveria se cuidar', 1694, 5575), L('l75', '075', 'Transtornos de humor (pt. 1 - emoção vs humor)', 1688, 5576)] }
    ]
  },
  {
    id: 'sem6', titulo: 'Semana 6', intervalo: '21 set – 25 set',
    dias: [
      { dia: 'Segunda', data: '21 set', licoes: [L('l76', '076', 'Transtornos de humor (pt. 2 - depressão, cérebro e tratamentos)', 1688, 5577), L('l77', '077', 'Transtornos de humor (pt. 3 - transtono bipolar: espectro e neurobiologia)', 1688, 5578), L('l78', '078', 'Técnicas de estudo (qual é a melhor)', 1696, 5480)] },
      { dia: 'Terça', data: '22 set', licoes: [L('l79', '079', 'A neurociência da criatividade', 1696, 5508), L('l80', '080', 'Como o cérebro toma decisão', 1688, 5502), L('l81', '081', 'A nova aula 007: Como dormir bem', 1690, 5422)] },
      { dia: 'Quarta', data: '23 set', licoes: [L('l82', '082', 'Nicotina (e cigarros eletrônicos)', 1691, 5526), L('l83', '083', 'Camadas sedimentares de experiência (por isso você deve ser fazedor)', 1688, 5540), L('l84', '084', 'Transtorno obessivo compulsivo (TOC) - o que é e tratamentos', 1688, 5579)] },
      { dia: 'Quinta', data: '24 set', licoes: [L('l85', '085', 'Neurociência social', 1695, 5506), L('l86', '086', 'Neurociência social (pt. 2)', 1695, 5507), L('l87', '087', 'A neurociência da ansiedade', 1656, 5580)] },
      { dia: 'Sexta', data: '25 set', licoes: [L('l88', '088', 'Como mudar a opinião de alguém', 1695, 5563), L('l89', '089', 'A sociedade emburrece a concorrência (pt. 2)', 1693, 5432), L('l90', '090', 'Solitude x solidão', 1688, 5546)] }
    ]
  },
  {
    id: 'sem7', titulo: 'Semana 7', intervalo: '28 set – 02 out',
    dias: [
      { dia: 'Segunda', data: '28 set', licoes: [L('l91', '091', 'Motivação importa mais que disciplina', 1693, 5437), L('l92', '092', 'Cultura e comportamento (Teste do Marshmallow)', 1696, 5504), L('l93', '093', 'Luz, comida e exercício - ajuste seu ciclo circadiano', 1690, 5424)] },
      { dia: 'Terça', data: '29 set', licoes: [L('l94', '094', 'A trivialidade da excelência (pt. 2)', 1693, 5430), L('l95', '095', 'Você é seu nicho (Sam Sulek - estudo de caso)', 1696, 5492), L('l96', '096', 'Controle o que te controla (decisões difíceis)', 1691, 5473)] },
      { dia: 'Quarta', data: '30 set', licoes: [L('l97', '097', 'Como ter mais autoconfiança no relacionamento', 1695, 5561), L('l98', '098', 'Como ter conversas difïceis (não se esquive)', 1695, 5562), L('l99', '099', 'O que fazer em dias ruins (experiência própria)', 1688, 5542)] },
      { dia: 'Quinta', data: '01 out', licoes: [L('l100', '100', 'O melhor presente que você pode se dar (melhore seu VO2)', 1694, 5517), L('l101', '101', 'O problema das redes sociais (vício e dissociação)', 1691, 5494), L('l102', '102', 'Comportamento alimentar', 1694, 5537)] },
      { dia: 'Sexta', data: '02 out', licoes: [L('l103', '103', 'Comportamento alimentar (pt. 2 - compulsão)', 1694, 5538), L('l104', '104', 'O sono de quem trabalha em turnos (e como manejar)', 1690, 5426), L('l105', '105', 'FOMO e rede social (medo de estar perdendo algo)', 1691, 5495)] }
    ]
  },
  {
    id: 'sem8', titulo: 'Semana 8', intervalo: '05 out – 09 out',
    dias: [
      { dia: 'Segunda', data: '05 out', licoes: [L('l106', '106', 'A Sociedade emburrece a concorrência (pt.3 - soft skills)', 1693, 5433), L('l107', '107', 'Entendendo o suicídio', 1688, 5582), L('l108', '108', 'Amor (e rejeição)', 1695, 5557)] },
      { dia: 'Terça', data: '06 out', licoes: [L('l109', '109', 'Corrida como aliada contra a depressão', 1694, 5518), L('l110', '110', 'Redes sociais te convidam ao extremo (e um conselho)', 1691, 5496), L('l111', '111', 'Melhore seu autoconhecimento (exercícios práticos)', 1689, 5547)] },
      { dia: 'Quarta', data: '07 out', evento: { hora: '18h30–19h30', texto: 'Clube do Livro: "Como Fazer Amigos e Influenciar Pessoas" — Encontro Único (live, online)', link: CLUBE_DO_LIVRO.link }, licoes: [L('l112', '112', 'Cuidado com seus pensamentos (ferramenta para mudar)', 1688, 5545), L('l113', '113', 'Como o vício destrói o seu cérebro (mecanismos)', 1691, 5523), L('l114', '114', 'Cannabis e cognição', 1691, 5527)] },
      { dia: 'Quinta', data: '08 out', licoes: [L('l115', '115', 'Burnout e relação com o trabalho', 1688, 5581), L('l116', '116', 'O que correr 21km me ensinou', 1694, 5520), L('l117', '117', 'O sistema de recompensa do adolescente', 1691, 5443)] },
      { dia: 'Sexta', data: '09 out', licoes: [L('l118', '118', 'Como saber se um profissional da saúde é bom (use iso ao procurar tratamento)', 1696, 5564), L('l119', '119', 'Este é o meu suco (continuação da aula 003)', 1693, 5435), L('l120', '120', 'Meus dois centavos sobre mudanças climáticas', 1696, 5565)] }
    ]
  },
  {
    id: 'sem9', titulo: 'Semana 9', intervalo: '12 out – 16 out',
    dias: [
      { dia: 'Segunda', data: '12 out', licoes: [L('l121', '121', 'Meus dois centavos sobre mudanças climáticas (pt 2)', 1696, 5566), L('l122', '122', 'Como seu cérebro muda com a experiência (neuroplasticidade)', 1696, 5462), L('l123', '123', 'A felicidade está nas coisas intrínsecas (segundo a ciência)', 1688, 5551)] },
      { dia: 'Terça', data: '13 out', licoes: [L('l124', '124', 'Seu foco deve estar em 20% das coisas (para gerar 80% dos resultados)', 1692, 5439), L('l125', '125', 'Por que eu corro', 1689, 5519), L('l126', '126', 'Cultura e comportamento (individualista x coletivista)', 1696, 5505)] },
      { dia: 'Quarta', data: '14 out', licoes: [L('l127', '127', 'A consciência e a inconsciência (visões da psicanálise e neurociências)', 1690, 5510), L('l128', '128', 'Quatro aprendizados na primeira prova de triatlo (leve para a vida)', 1694, 5521), L('l129', '129', 'Apenas um desabafo', 1696, 5567)] },
      { dia: 'Quinta', data: '15 out', licoes: [L('l130', '130', 'Você não é algo, você está algo', 1689, 5541), L('l131', '131', 'Sobre o livre-arbítrio (pt. 2 - e mais complexa)', 1689, 5454), L('l132', '132', 'A neurociência do preconceito (e como mitigá-lo)', 1696, 5509)] },
      { dia: 'Sexta', data: '16 out', licoes: [L('l133', '133', 'Melhore sua escrita (dicas úteis)', 1696, 5568), L('l134', '134', 'A geração ansiedade (dica para os pais)', 1656, 5497), L('l135', '135', 'O que aprendi fazendo um doutorado', 1696, 5569)] }
    ]
  },
  {
    id: 'sem10', titulo: 'Semana 10', intervalo: '19 out – 23 out',
    dias: [
      { dia: 'Segunda', data: '19 out', licoes: [L('l136', '136', 'O gene determina o comportamento', 1689, 5475), L('l137', '137', 'O gene determina o comportamento (pt.2)', 1689, 5476), L('l138', '138', 'Os efeitos do exercício físico no cérebro (pt. 2)', 1694, 5514)] },
      { dia: 'Terça', data: '20 out', licoes: [L('l139', '139', '30 anos (meus dois principais aprendizados da vida)', 1689, 5570), L('l140', '140', '10 livros que todo mundo deveria ler', 1696, 5571), L('l141', '141', 'Personalidade e amadurecimento', 1689, 5544)] },
      { dia: 'Quarta', data: '21 out', licoes: [L('l142', '142', 'Ritual de passagem para a idade adulta (qual é o seu?)', 1688, 5543), L('l143', '143', 'Sobre o livre-arbítrio (pt. 3 - último round)', 1689, 5455), L('l144', '144', 'Síndrome do impostor (por que você faz coisas que te fazem mal)', 1689, 5442)] },
      { dia: 'Quinta', data: '22 out', licoes: [L('l145', '145', 'Dormir mal e pensamentos Instrusivos', 1690, 5423), L('l146', '146', 'Como sair do automatismo (tarefas práticas)', 1689, 5463), L('l147', '147', 'Tomada de decisão usando as probabilidades', 1688, 5445)] },
      { dia: 'Sexta', data: '23 out', licoes: [L('l148', '148', 'Sobre a sua escolha profissional (papo reto e reflexões)', 1689, 5446), L('l149', '149', 'A civilização do espetáculo (não seja assim)', 1696, 5456), L('l150', '150', 'Vício em apostas on-line (um dos maiores problemas!)', 1691, 5457)] }
    ]
  },
  {
    id: 'sem11', titulo: 'Semana 11', intervalo: '26 out – 30 out',
    dias: [
      { dia: 'Segunda', data: '26 out', licoes: [L('l151', '151', 'O cérebro tenta prever o mundo (e nem sempre isso é bom)', 1656, 5458), L('l152', '152', 'A dopamina responde ao valor relativo (expectativa vs mundo real)', 1693, 5459), L('l153', '153', 'Desconto temporal da recompensa (e o longo prazo)', 1693, 5460)] },
      { dia: 'Terça', data: '27 out', licoes: [L('l154', '154', 'Meu novo suco (pt. 2)', 1693, 5461), L('l155', '155', 'Tribos morais (Livro de Joshua Greene)', 1696, 5583), L('l156', '156', 'A arte para Denis Dutton', 1696, 5584)] },
      { dia: 'Quarta', data: '28 out', licoes: [L('l157', '157', 'ChatGPT nos deixa burros (dados e opinião)', 1696, 5585), L('l158', '158', 'Relatório global sobre felicidade', 1688, 5586), L('l159', '159', 'Ritalina e Venvanse aumentam inteligência?', 1696, 5587)] },
      { dia: 'Quinta', data: '29 out', licoes: [L('l160', '160', 'Livros lidos em 2025', 1696, 5588), L('l161', '161', 'React: 75 anos de estudo: Como as relações humanas moldam nossa saúde e felicidade', 1695, 5589), L('l162', '162', 'Efeito Câmara de eco na IA', 1688, 5590)] },
      { dia: 'Sexta', data: '30 out', licoes: [L('l163', '163', 'Papéis sociais e conscienciosidade', 1689, 5591), L('l164', '164', 'Pobreza de tempo e produtividade tóxica', 1692, 5592), L('l165', '165', 'Dinheiro e recompensa em diferentes culturas', 1693, 5593)] }
    ]
  },
  {
    id: 'sem12', titulo: 'Semana 12', intervalo: '02 nov – 06 nov',
    dias: [
      { dia: 'Segunda', data: '02 nov', licoes: [L('l166', '166', 'Tenha noção do distanciamento histórico (como focar no longo prazo)', 1693, 5594), L('l167', '167', 'Hikikomori e o isolamento social', 1695, 5595), L('l168', '168', 'Redes sociais estão destruindo a saúde mental dos jovens', 1656, 5596)] },
      { dia: 'Terça', data: '03 nov', licoes: [L('l169', '169', 'O cérebro de Especialistas vs Novatos', 1696, 5597), L('l170', '170', 'Estado de Flow e Felicidade (Livro A Hipótese da Felicidade)', 1696, 5598), L('l171', '171', 'Viés do prestígio (ou Por Que Admiramos Pessoas Vazias)', 1689, 5599)] },
      { dia: 'Quarta', data: '04 nov', licoes: [L('l172', '172', 'Sonhos e Sonhos e Lúcidos', 1690, 5428), L('l173', '173', 'Contra a Democracia (Jason Brennan)', 1696, 5600), L('l174', '174', 'O ser humano médio é mau (a vida que você pode salvar)', 1696, 6147)] },
      { dia: 'Quinta', data: '05 nov', licoes: [L('l175', '175', 'Encontrei o sentido da vida', 1689, 6311)] }
    ]
  }
];

export const totalLicoesDopamina = SEMANAS.reduce((a, s) => a + s.dias.reduce((b, d) => b + d.licoes.length, 0), 0); // 175
