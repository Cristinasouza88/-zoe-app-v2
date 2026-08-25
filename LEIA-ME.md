# NIIL

Sua vida extraordinária, um dia por vez.

---

## O que você precisa instalar antes

Só uma coisa: o **Node.js**. Baixe a versão LTS em https://nodejs.org
e instale normalmente, avançando em tudo. Serve para Mac e Windows.

Para conferir se deu certo, abra o Terminal (Mac) ou o Prompt de Comando
(Windows) e digite:

    node -v

Se aparecer um número tipo `v20.11.0`, está pronto.

---

## Rodar no seu computador

Abra o Terminal na pasta deste projeto e rode, uma linha de cada vez:

    npm install
    npm run dev

Vai aparecer um endereço tipo `http://localhost:5173`. Abra no navegador.

**Para testar no celular na mesma rede wifi:** rode `npm run dev -- --host`
e use o endereço "Network" que aparecer.

---

## Publicar de verdade

### Opção 1 — Vercel (a mais simples)

1. Crie conta em https://vercel.com
2. Suba esta pasta para um repositório no GitHub
3. No Vercel: **Add New → Project → Import** o repositório
4. Ele detecta Vite sozinho. Clique em **Deploy**

Pronto, você recebe um endereço `niil-app.vercel.app`. Cada vez que você
atualizar o GitHub, o site atualiza sozinho.

### Opção 2 — Netlify sem GitHub

1. Rode `npm run build`. Isso cria a pasta `dist`
2. Vá em https://app.netlify.com/drop
3. Arraste a pasta `dist` para a página

### Instalar no celular como aplicativo

Com o site publicado, abra o endereço no celular:

- **iPhone:** Safari → botão compartilhar → Adicionar à Tela de Início
- **Android:** Chrome → menu → Instalar aplicativo

Ele passa a abrir em tela cheia, com o ícone da NIIL, sem barra de navegador.

---

## Onde ficam os seus dados

Tudo fica salvo **no navegador do próprio aparelho**, não em um servidor.

Isso significa:

- Seus dados são só seus, ninguém tem acesso
- Não sincroniza entre celular e computador
- Se você limpar os dados do navegador, perde tudo
- Fotos são comprimidas antes de salvar, mas o espaço não é infinito
  (algumas centenas de fotos)

Quando quiser sincronizar entre aparelhos e ter backup automático, o passo
é trocar o armazenamento local por um banco de dados online. É a evolução
natural, mas não é necessária para começar a usar.

---

## O que tem dentro

**Trilha** — 15 blocos e 59 etapas na ordem do planner. Cada sessão segue
a mesma anatomia: conteúdo, ferramenta, que fichas caem, agenda de pontos.
Concluir uma etapa libera a seguinte.

**Diário de fotos** — registre corpo, estudo, treino, refeição ou momento.
O app monta o antes e depois automático e conta os dias entre as fotos.
Também dá para anexar fotos direto dentro de cada etapa da trilha.

**Agenda programada** — as tarefas com pontos, tipo e horário. Marcar uma
tarefa preenche a ferramenta ligada a ela (marcar Ritual do acordar
preenche os 9 passos do ritual do dia).

**Alimentação** — calorias, macros, refeições separadas e timer de jejum.

**Progresso** — gráficos animados de pontuação, calorias, água e energia,
mais a evolução da Roda da Vida entre os 5 checkpoints.

**Apoio** — lembretes com alarme por horário e dia, e a biblioteca de
livros, filmes e vídeos com resenha.

---

## Estrutura dos arquivos

    index.html              página base
    package.json            dependências
    vite.config.js          configuração do build
    manifest.webmanifest    dados para instalar como app
    favicon.svg             logo
    icone.png               ícone do app
    src/
      main.jsx              ponto de entrada
      App.jsx               o aplicativo
      conteudo.js           todo o conteúdo do planner

Para mudar textos do planner, mexa em `src/conteudo.js`.
Para mudar telas ou cores, mexa em `src/App.jsx` (a paleta está no
objeto `C`, logo no começo).
