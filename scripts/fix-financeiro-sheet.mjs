import fs from 'node:fs';

const p = 'Financeiro.jsx';
let s = fs.readFileSync(p, 'utf8');

// O Financeiro declara as telas como funções locais. Renderizá-las como <Componente/>
// faz o React enxergar um novo tipo a cada rerender do Financeiro, desmontando a árvore
// e apagando estados locais do FinanceiroStart (ex.: sheet "Sua moeda").
// Aqui mantemos as funções locais, mas as executamos como render functions, preservando
// a identidade dos componentes externos que elas devolvem.
const oldRender = "const render=()=>{if(tela==='trilha')return <Trilha/>;if(tela==='ofensiva')return <Ofensiva/>;if(tela==='bau')return <Bau/>;if(tela==='painel')return <Painel/>;if(tela==='reserva')return <Reserva/>;if(tela==='objetivos')return <Objetivos/>;if(tela==='cartoes')return <Cartoes/>;if(tela==='contas')return <Contas/>;if(tela==='dividas')return <Dividas/>;if(tela==='movimentacoes')return <Movimentacoes/>;if(tela==='revisoes')return <Revisoes/>;if(tela==='importar')return <Importar/>;if(tela==='mais')return <Mais/>;return <Visao/>};";
const newRender = "const render=()=>{if(tela==='trilha')return Trilha();if(tela==='ofensiva')return Ofensiva();if(tela==='bau')return Bau();if(tela==='painel')return Painel();if(tela==='reserva')return Reserva();if(tela==='objetivos')return Objetivos();if(tela==='cartoes')return Cartoes();if(tela==='contas')return Contas();if(tela==='dividas')return Dividas();if(tela==='movimentacoes')return Movimentacoes();if(tela==='revisoes')return Revisoes();if(tela==='importar')return Importar();if(tela==='mais')return Mais();return Visao()};";

if (s.includes(oldRender)) {
  s = s.replace(oldRender, newRender);
  fs.writeFileSync(p, s);
  console.log('Financeiro: telas locais convertidas em render functions; estado do FinanceiroStart preservado.');
} else if (s.includes(newRender)) {
  console.log('Financeiro: correção de estabilidade já aplicada.');
} else {
  throw new Error('Bloco render() esperado do Financeiro não foi encontrado; patch não aplicado.');
}
