# NIIL — Memória curta para continuar este trabalho em outro chat

Use este texto como contexto inicial ao retomar o projeto.

---

O produto se chama **NIIL**. ZOE é apenas o nome anterior. O NIIL é um app comercial real, pensado para App Store e Google Play.

A **Trilha é o produto principal**. Os outros módulos são ferramentas que a Trilha chama quando existe um motivo real. O usuário não escolhe módulos nem precisa entender a arquitetura interna.

Princípio central:

> **A Trilha explica. A ferramenta aplica. A Agenda sustenta. A Performance mostra. O Insight interpreta. A Temporada preserva a história.**

Regras aprovadas:

> **Descobrir não significa adicionar uma tarefa.**

> **O NIIL pode descobrir muitas oportunidades, mas ativa poucas por vez.**

A Agenda deve ser construída gradualmente pela Trilha. Cada fase pode encontrar várias oportunidades, mas só o **próximo movimento real** entra na Agenda.

A Trilha tem 9 marcos e o formato de caminho/Olimpo deve ser preservado:

M1 O que vale o esforço?  
M2 Seu corpo tem recurso?  
M3 O que te puxa?  
M4 Seu ambiente já decidiu?  
M5 O que você repete vira caminho  
M6 O sistema ao seu redor  
M7 Escolher custa  
M8 Faça caber na terça-feira  
M9 Aprender com a própria vida

## M1 — decisão mais recente

O M1 foi redesenhado para gerar **direção da temporada + motivação-base + Roda inicial + um único primeiro movimento**.

Fluxo aprovado:

1. “Eu mudaria ____ primeiro.”
2. gravação da frase com a própria voz
3. importância 1–10
4. razão própria / lógica de Entrevista Motivacional
5. mapa de motivação
6. recompensa desejada
7. valores pessoais, até 2
8. contraste Hoje × Desejado
9. Insight NIIL de motivação
10. Roda da Vida inicial
11. Insight NIIL de síntese
12. um único primeiro movimento

A Roda inicial é baseline da temporada. **Não cria meta e não abre módulo automaticamente.**

O antigo `m1-ecossistema` foi removido. O usuário não escolhe “Sono, Finanças, Cursos etc.”; o NIIL deve fazer esse roteamento futuramente.

O primeiro movimento oferece poucas opções pequenas e contextualizadas. Apenas uma entra na Agenda. Se já existe outra ação ativa, a nova fica guardada para depois.

## M2 — próximo desenvolvimento

M2 pergunta: **“Seu corpo tem recurso para sustentar o que você quer construir?”**

Ferramentas candidatas:
- mapa de energia
- sono
- nutrição
- água
- treino/movimento
- check-in corporal
- diário de energia
- experimentos corporais

Conceito central do M2:

**hipótese → pequena experiência → vida real → evidência → Insight NIIL**

Exemplo: observar sono por 5 noites. Não usar períodos arbitrários como 21 dias. Cada ferramenta define a evidência mínima necessária.

Antes de implementar M2 inteiro, definir fase por fase:
- pergunta que queremos responder
- ferramenta usada
- trigger
- evidência mínima
- interação
- como entra na Agenda
- quando termina
- que Insight devolve

## Linguagem

Toda interpretação aparece como **INSIGHT NIIL**.

Não usar:
- diagnóstico
- causalidade sem evidência
- “dopamina baixa/alta”
- reset/detox de dopamina
- personagens dizendo “a NIIL percebeu...”

## Produto

Não criar excesso de registros obrigatórios. O NIIL coleta **evidência suficiente para ajudar a pessoa a entender a própria vida**.

Módulos atuais úteis à Trilha incluem Agenda, Performance, Voz, Minha Visão, Financeiro, Sono, Nutrição, Treino, Cursos, Inglês e Jornada Sistêmica.

**Guarda-Roupa saiu do NIIL e será um app separado.**

## Gamificação

Pontos NIIL é a moeda única. Não usar gemas, cristais, vidas, baús ou recompensas aleatórias. Recompensar ações significativas/evidências, não volume, carga, peso, dinheiro ou tempo de tela.

## Visual

Sem gradientes. Verde NIIL `#B7F20C`, graphite `#17151D`, fundo claro. Sem mascote recorrente. Orb é apenas manifestação funcional da IA.

## Regra de trabalho

Preservar decisões já aprovadas. Nunca reintroduzir conceitos descartados sem sinalizar. Sempre diferenciar APROVADO, EM DESENVOLVIMENTO, HIPÓTESE, IDEIA, PENDENTE, DESCARTADO e SUBSTITUÍDO.

Fonte de verdade detalhada no repositório: `docs/NIIL-PRODUCT-CONTEXT.md`.
