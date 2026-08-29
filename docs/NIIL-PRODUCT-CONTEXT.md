# NIIL — Contexto de Produto, Trilha e Decisões

> **Fonte de verdade de produto.**  
> Atualizado em 29/08/2026.  
> Este documento existe para preservar decisões aprovadas e permitir continuidade entre chats, pessoas e implementações sem reabrir conceitos já descartados.

---

## 1. Identidade do produto

**APROVADO**

NIIL é o nome atual e oficial do produto. ZOE é apenas o nome anterior e não deve ser tratado como produto separado.

O NIIL é um **aplicativo comercial real**, pensado para Apple App Store e Google Play, com arquitetura que deve suportar usuários reais, escala, segurança, privacidade, performance, monetização, analytics e evolução contínua.

O NIIL não deve parecer:
- um dashboard genérico;
- um app de hábitos comum;
- um app que exige registrar a vida inteira;
- um jogo infantil;
- uma coleção de módulos sem relação.

A visão central é:

> **O NIIL é um sistema de vida pessoal inteligente.**

E a arquitetura conceitual é:

> **A Trilha explica.  
> A ferramenta aplica.  
> A Agenda sustenta.  
> A Performance mostra.  
> O Insight interpreta.  
> A Temporada preserva a história.**

---

## 2. Princípio central da Trilha

**APROVADO**

A Trilha é o produto principal. Os outros módulos existem como **ferramentas convocadas pela Trilha quando existe motivo real para usá-las**.

O usuário não deve precisar entender a arquitetura interna do produto nem escolher manualmente “qual módulo usar”.

Exemplo correto:

> “Você disse que sua energia cai à tarde. Vamos observar se o sono entra nessa história.”

Exemplo incorreto:

> “Escolha quais módulos têm relação com sua meta.”

### Regra estrutural

> **Descobrir não significa adicionar uma tarefa.**

E:

> **O NIIL pode descobrir muitas oportunidades, mas ativa poucas por vez.**

A Agenda é construída gradualmente pela jornada. Uma descoberta só vira ação quando é escolhida como **próximo movimento real**.

---

## 3. Modelo de funcionamento

A Trilha deve operar em ciclos:

**PERCEBER → ENTENDER → ESCOLHER → APLICAR → VIVER → OBSERVAR → AJUSTAR → COMPARAR**

Algumas etapas acontecem dentro do app. Outras precisam acontecer na vida real.

Por isso, a Trilha não deve ser “zerável” em duas horas.

Exemplos de estados:

- Observando · 2/5 noites
- Experimento · 2/3 treinos
- Ação ativa
- Evidência coletada
- Insight disponível

---

## 4. Temporadas

**APROVADO**

A Trilha não cresce infinitamente em conteúdo. O mesmo método se repete ao longo do tempo em **temporadas**.

Fluxo da temporada:

1. Início
2. O que vale o esforço?
3. Motivação-base
4. Roda da Vida inicial
5. Trilha + ferramentas + evidências
6. Roda da Vida final
7. Comparação
8. Insight NIIL
9. Fechamento
10. Nova temporada futura

Princípio:

> **A pessoa não repete a Trilha para responder as mesmas perguntas. Ela repete para descobrir como suas respostas mudaram.**

A duração da temporada não é fixa em 7, 21, 30 ou 90 dias. Ela acompanha o processo real do usuário.

---

## 5. Estrutura aprovada dos 9 marcos

**APROVADO**

- **M1 · O que vale o esforço?**
- **M2 · Seu corpo tem recurso?**
- **M3 · O que te puxa?**
- **M4 · Seu ambiente já decidiu?**
- **M5 · O que você repete vira caminho**
- **M6 · O sistema ao seu redor**
- **M7 · Escolher custa**
- **M8 · Faça caber na terça-feira**
- **M9 · Aprender com a própria vida**

O formato visual de progressão em caminho sinuoso/Olimpo deve ser preservado.

---

## 6. Filosofia de interação

**APROVADO**

A Trilha usa uma linguagem de microinterações inspirada em bons produtos de aprendizagem, sem copiar visual, mascote ou gamificação de terceiros.

Ritmo desejado:

> tap → escolher → feedback → pequena descoberta → próximo passo

Uma ação cognitiva por tela.

### Tipos de nó

**DESCOBRIR**  
Escolher, completar, ordenar, falar, ouvir, perceber.

**APLICAR**  
Abrir uma ferramenta com contexto.

**VIVER**  
Executar algo fora do app e gerar evidência.

**PERCEBER**  
Receber um Insight NIIL e decidir o próximo teste.

### Regras de navegação

- escolhas rápidas podem avançar automaticamente;
- escalas/reflexões importantes exigem Continuar;
- ações complexas exigem confirmação explícita;
- não usar excesso de texto;
- não transformar toda etapa em formulário.

---

## 7. Linguagem de Insight

**APROVADO**

Toda interpretação produzida pelo sistema deve ser apresentada como:

### **INSIGHT NIIL**

Evitar:
- “A NIIL percebeu que...”
- afirmações diagnósticas;
- causalidade sem evidência;
- linguagem terapêutica indevida;
- “dopamina baixa/alta”;
- “reset/detox de dopamina”.

Preferir:
- “aparece uma diferença”;
- “existe uma tendência”;
- “vale observar”;
- “esses dados caminharam juntos”;
- “isso ainda não prova causa”.

A IA não deve inventar explicações psicológicas.

---

## 8. Base conceitual usada por trás do produto

Os autores/referências orientam o desenho, mas **não aparecem como autoridade na interface**.

### M1 — principais pilares

- William Miller + Stephen Rollnick — Entrevista Motivacional
- Edward Deci + Richard Ryan — autonomia e qualidade da motivação
- Kent Berridge — wanting × liking / recompensa
- Gabriele Oettingen — contraste mental
- ACT/valores em uso não clínico como repertório complementar
- Eslen Delanogare apenas como referência de tradução/linguagem, nunca como fonte científica primária

UX/Produto:
- Rian Dutra
- Carolina Leslie
- Silvia Melo
- Leo Natsume
- UX Unicórnio / Leandro Rezende

---

# 9. M1 · O que vale o esforço?

## Status

**APROVADO / EM DESENVOLVIMENTO / PARCIALMENTE IMPLEMENTADO**

Objetivo:

> Fazer a pessoa sair de uma vontade genérica e chegar a uma direção que realmente importa, sem transformar a abertura da temporada em uma lista de metas.

O resultado do M1 deve ser:

**direção da temporada + motivação-base + Roda inicial + um único primeiro movimento real**

### Sequência aprovada

1. **Complete a frase**
   - “Eu mudaria ____ primeiro.”
   - opções: Saúde, Energia, Dinheiro/Finanças, Carreira, Aprendizado, Relacionamentos, Organizar minha vida, Outra coisa
   - Saúde e Energia são diferentes

2. **Compromisso pela própria voz**
   - exemplo: “Eu mudaria minhas finanças primeiro.”
   - gravação feita após toque explícito
   - usuário consegue ouvir e refazer
   - áudio atual é local-only
   - fallback técnico impede bloqueio da Trilha

3. **Escala de importância**
   - “Hoje, quanto isso realmente importa para você?”
   - 1–10
   - não avança automaticamente

4. **Razão própria**
   - lógica inspirada em Entrevista Motivacional
   - exemplo: “Por que 8 e não 5?”
   - a pessoa produz as próprias razões

5. **Mapa de Motivação**
   - identifica o que está por trás da escolha
   - opções adaptadas ao foco inicial

6. **Mapa de Recompensa Desejada**
   - “Se isso mudar, o que você ganha de verdade?”
   - trabalha resultado percebido e motivacional
   - não usa linguagem pseudocientífica de dopamina

7. **Valores pessoais**
   - microinteração
   - até 2 valores
   - exemplos: liberdade, segurança, autonomia, confiança, tranquilidade, crescimento, conexão, vitalidade, pertencimento, realização

8. **Contraste Hoje × Desejado**
   - onde a pessoa se percebe agora
   - onde gostaria de chegar
   - não cria automaticamente uma meta numérica

9. **Insight de motivação**
   - sintetiza objetivo, importância, motivo, recompensa, valores e contraste
   - reforça que isso é contexto, não tarefas

10. **Roda da Vida inicial**
   - 12 áreas
   - uma por tela
   - nota 0–10
   - avanço rápido
   - snapshot imutável da temporada
   - serve como baseline
   - **não cria meta**
   - **não abre módulo automaticamente**

11. **Insight NIIL de síntese**
   - junta apenas dados realmente informados
   - pode relacionar foco inicial e nota correspondente na Roda
   - não cria causalidade

12. **Primeiro movimento**
   - uma única ação pequena
   - 3 opções contextualizadas ao foco
   - apenas uma entra na Agenda
   - se já houver outra ação ativa, nova ação é guardada para depois
   - o usuário não sai do M1 com várias mudanças simultâneas

### Regra aprovada para a Agenda

> **A Agenda nasce da Trilha.**

A pessoa não monta uma lista genérica de hábitos.

O NIIL vai inserindo ações gradativamente conforme cada fase descobre evidências e escolhe o próximo movimento.

### Substituições do M1

**SUBSTITUÍDO**
- `m1-ecossistema`: usuário não escolhe módulos relacionados
- Roda inicial criando meta automaticamente
- Roda inicial abrindo módulo automaticamente
- ideia de sair do M1 com múltiplas metas

### Dados que o M1 deve preservar

- objetivo/foco inicial
- importância
- motivo
- recompensa desejada
- valores
- contraste atual × desejado
- compromisso de voz
- Roda inicial
- primeiro movimento
- vínculo com temporada

---

# 10. M2 · Seu corpo tem recurso?

## Status

**DIRETRIZ APROVADA / DESENVOLVIMENTO DETALHADO PENDENTE**

Objetivo:

> Entender se a pessoa tem recurso físico/energético para sustentar aquilo que quer construir.

O M2 não deve virar questionário clínico ou checklist de saúde.

### Ferramentas candidatas aprovadas para o M2

- Mapa de Energia do Dia
- Sono
- Nutrição
- Água / hidratação
- Treino / movimento
- Check-in corporal
- Diário de energia
- Experimentos corporais curtos

### Lógica de produto

O M2 começa com um scan curto de energia.

Exemplo:
- ao acordar
- manhã
- tarde
- noite

A partir disso, o NIIL decide **se precisa aprofundar**.

Exemplos:
- sinal ligado a sono → ferramenta Sono
- alimentação relevante → Nutrição
- movimento relevante → Treino
- hidratação relevante → Água

### Regra fundamental

A ferramenta não entra apenas por existir no produto.

Ela entra quando responde a uma pergunta concreta da Trilha.

Exemplo:

> “Sua energia costuma cair no meio da tarde. Vamos observar o sono por 5 noites antes de tirar uma conclusão.”

### Experimentos de vida

**APROVADO COMO CONCEITO CENTRAL**

Algumas etapas funcionam assim:

**hipótese → pequena experiência → vida real → evidência → Insight NIIL**

Exemplos:
- observar sono por 5 noites
- água por 3 dias
- energia antes/depois de 3 treinos
- energia após refeições por alguns dias

A ferramenta define a quantidade de evidência necessária. Não usar durações arbitrárias como “21 dias”.

### Pendente para M2

Antes de considerar M2 fechado, definir:
- ordem final das telas
- gatilhos de roteamento
- contrato de cada ferramenta
- critérios mínimos de evidência
- como um experimento fica “em andamento”
- como a Agenda exibe coleta de evidência
- quando um Insight é liberado
- como evitar sobreposição com ações já ativas do M1

---

# 11. M3–M9 — ferramentas previstas

## M3 · O que te puxa?
- Mapa de Recompensas
- Wanting × Liking
- Mapa de gatilhos
- Sinal → Ação → Recompensa
- estímulos digitais
- recompensa imediata × futura

## M4 · Seu ambiente já decidiu?
- Auditoria de ambiente
- Minha Visão / foto
- Mapa de fricção
- ambiente físico
- ambiente digital
- recursos já existentes
- arquitetura de escolha

## M5 · O que você repete vira caminho
- Mapa de hábitos
- implementation intentions
- “Depois de X, eu vou Y”
- ação mínima
- agenda
- plano de contingência
- experimentos de hábito

## M6 · O sistema ao seu redor
- Jornada Sistêmica
- mapa de relações
- papéis
- rede de apoio
- responsabilidades
- limites
- voz para reflexão

## M7 · Escolher custa
- tempo
- dinheiro
- atenção
- energia
- trade-offs
- Financeiro
- viabilidade
- priorização

**PENDENTE:** substituir a redundância de uma nova escolha de meta, já que foco nasce antes.

## M8 · Faça caber na terça-feira
- Agenda real
- time blocking
- calendário de energia
- planejamento semanal
- ação mínima para dias ruins
- plano A/B/C
- if–then
- proteção de horário

## M9 · Aprender com a própria vida
- Roda da Vida final
- Performance
- comparação início × fim
- histórico de temporadas
- replay da própria voz
- revisão de experimentos
- linha do tempo
- Insights NIIL
- retrospectiva
- próximo ciclo

---

# 12. Ferramentas transversais

- Agenda
- Performance
- Pontos NIIL
- Insights NIIL
- Orb
- Voz
- Fotos / Minha Visão
- Experimentos
- Histórico longitudinal
- Cursos
- Inglês
- Financeiro
- Sono
- Nutrição
- Treino
- Jornada Sistêmica

### Guarda-Roupa

**REMOVIDO DO NIIL**

O Guarda-Roupa não faz mais parte do produto NIIL. Será desenvolvido como aplicativo separado.

O código legado pode existir no repositório temporariamente para reaproveitamento, mas não deve voltar a ser conectado ao fluxo NIIL sem uma nova decisão explícita.

---

# 13. Tool Router — arquitetura futura

**PENDENTE**

O NIIL precisa evoluir para um motor de roteamento de ferramentas.

Cada ferramenta deve declarar:

- quando usar
- por que usar
- quais dados recebe da Trilha
- qual ação mínima pede
- que evidência produz
- quanto tempo/quantidade precisa observar
- quando considera experimento concluído
- o que devolve para a Trilha

Exemplo:

### Sono

**Trigger:** energia baixa + pouco histórico de sono  
**Ação:** observar 5 noites  
**Evidência:** horário, duração, percepção  
**Saída:** padrão suficiente para um Insight  
**Retorno:** Trilha M2

---

# 14. Arquitetura de IA

**DIREÇÃO APROVADA / IMPLEMENTAÇÃO COMERCIAL PENDENTE**

A IA não deve decidir tudo.

Ordem preferencial:

1. dados estruturados
2. regras
3. comparação
4. IA para verbalizar o Insight

A IA recebe contexto pequeno e permitido e devolve interpretações curtas, seguras e rastreáveis.

Nunca inferir traumas, diagnósticos, medo de sucesso, vícios ou causalidade sem base.

---

# 15. Gamificação

**APROVADO**

- moeda única: Pontos NIIL
- sem gemas/cristais/vidas/baús
- sem recompensar maior carga, peso, renda, gasto, calorias ou ambição
- recompensar ação significativa e evidência
- um único sinal de continuidade
- Olimpo preservado
- idempotência por ledger de eventos
- ledger deve ser season-aware

A gamificação serve para tornar progresso visível, não para competir com a vida real.

---

# 16. Roda da Vida

**APROVADO**

12 áreas:
- Saúde
- Família
- Relacionamentos
- Lazer
- Espiritualidade
- Carreira
- Finanças
- Crescimento pessoal
- Social
- Emocional
- Intelectual
- Contribuição

Regras:
- uma área por tela
- 0–10
- snapshot imutável
- abertura e fechamento comparáveis
- não diagnostica
- não prova causa
- opening Roda serve como baseline
- closing Roda mostra diferenças

**PENDENTE:** revisar roteamento Saúde → Sono para alinhar com a separação Saúde = Nutrição/Treino e Energia = Sono.

---

# 17. Voz

**APROVADO / IMPLEMENTADO NO M1**

Uso da própria voz é um ritual de compromisso e memória da perspectiva inicial.

Atual:
- MediaRecorder
- permissão apenas após toque
- player nativo
- fallback técnico
- armazenamento local

**PENDENTE PARA PRODUTO COMERCIAL**
- storage privado autenticado
- RLS por usuário
- exclusão
- retenção
- sincronização cross-device
- strings de permissão iOS/Android

**IDEIA APROVADA CONCEITUALMENTE, AINDA NÃO IMPLEMENTADA**
No M9, devolver o áudio inicial com algo como:

> “Foi assim que você começou.”

---

# 18. Visual e UX

**APROVADO**

- sem gradientes
- verde NIIL `#B7F20C`
- graphite `#17151D`
- fundo claro
- UI madura, limpa, proprietária
- sem mascote recorrente
- Orb é manifestação funcional da IA, sem rosto/olhos
- acessibilidade e reduced motion
- não sacrificar clareza por estética

---

# 19. Estado técnico recente

Repositório:
`Cristinasouza88/-zoe-app-v2`

Produção:
`https://cozy-faun-51ca8b.netlify.app/`

Principais arquivos:
- `TrilhaNIIL.jsx`
- `TrilhaNIIL.css`
- `trilha.niil.data.js`
- `NiilAppCore.jsx`
- `gamificacao.core.js`

### Alterações recentes relevantes

- Guarda-Roupa removido do fluxo NIIL
- M1 evoluído para direção + primeiro movimento
- Roda inicial transformada em baseline
- snapshots de Roda vinculados à temporada
- reset de Trilha criado para teste
- reset **não deve aparecer para usuários**
- reset está sendo mantido apenas como mecanismo interno temporário de QA

---

# 20. Prioridade de desenvolvimento

## Agora

1. testar ponta a ponta o novo M1
2. corrigir bugs/UX encontrados no teste
3. fechar M1 antes de aprofundar M2
4. depois desenvolver M2 fase por fase

## Para cada nova fase

Seguir esta sequência:

**Problema → Usuário → Contexto → Objetivo → Jornada → Fluxo → Arquitetura da informação → Comportamento → Interface → Validação → Implementação → Métrica**

Não começar pela tela.

---

# 21. Regra de continuidade

Qualquer pessoa/IA que continuar o NIIL deve:

- preservar decisões marcadas como APROVADO;
- não reintroduzir itens DESCARTADOS/SUBSTITUÍDOS;
- sinalizar quando uma nova decisão substituir outra;
- tratar este documento como referência antes de alterar M1–M9;
- sempre pensar Produto + UX + Tecnologia + Negócio + Escala + App Store + Google Play.

