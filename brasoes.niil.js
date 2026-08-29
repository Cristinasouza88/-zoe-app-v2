import { TRILHA_NIIL } from './trilha.niil.data.js';
import { PONTOS_NIIL } from './gamificacao.core.js';

const META = Object.freeze({
  m1:{nome:'Clareza',frase:'Eu sei o que merece meu esforço agora.',imagem:'/brasoes/M1_Clareza.png'},
  m2:{nome:'Vitalidade',frase:'Eu reconheço o recurso com que estou vivendo.',imagem:'/brasoes/M2_Vitalidade.png'},
  m3:{nome:'Consciência',frase:'Eu enxergo melhor o que me puxa.',imagem:'/brasoes/M3_Consciencia.png'},
  m4:{nome:'Contexto',frase:'Eu consigo fazer o ambiente trabalhar a meu favor.',imagem:'/brasoes/M4_Contexto.png'},
  m5:{nome:'Constância',frase:'Eu transformei intenção em algo repetível.',imagem:'/brasoes/M5_Constancia.png'},
  m6:{nome:'Conexão',frase:'Eu enxergo o sistema ao redor das minhas escolhas.',imagem:'/brasoes/M6_Conexao.png'},
  m7:{nome:'Escolha',frase:'Eu escolho sabendo o que essa escolha custa.',imagem:'/brasoes/M7_Escolha.png'},
  m8:{nome:'Ritmo',frase:'Minha intenção cabe na minha vida real.',imagem:'/brasoes/M8_Ritmo.png'},
  m9:{nome:'Evolução',frase:'Eu consigo aprender com a minha própria vida.',imagem:'/brasoes/M9_Evolucao.png'}
});

export const BRASOES_NIIL = Object.freeze(TRILHA_NIIL.map(fase=>{
  const meta=META[fase.id]||{};
  const pontosEtapas=fase.etapas.reduce((a,e)=>a+Math.max(0,Number(e.pontos)||0),0);
  return Object.freeze({
    id:fase.id,
    marco:fase.marco,
    nome:meta.nome||fase.nome,
    frase:meta.frase||fase.resumo,
    imagem:meta.imagem||null,
    tituloMarco:fase.nome,
    totalEtapas:fase.etapas.length,
    pontosEtapas,
    bonusMarco:PONTOS_NIIL.FASE,
    pontosPossiveis:pontosEtapas+PONTOS_NIIL.FASE,
    criterio:'Concluir todos os passos do marco. A pontuação acompanha o caminho; não substitui a conclusão.'
  });
}));

export function estadoBrasoesNIIL(d={}){
  const etapas=d?.etapas||{};
  return BRASOES_NIIL.map(brasao=>{
    const fase=TRILHA_NIIL.find(x=>x.id===brasao.id);
    const concluidas=fase?.etapas?.filter(e=>etapas?.[e.id]?.feito).length||0;
    const total=fase?.etapas?.length||brasao.totalEtapas||0;
    const desbloqueado=total>0&&concluidas===total;
    const ultima=fase?.etapas?.[total-1];
    const desbloqueadoEm=desbloqueado?(etapas?.[ultima?.id]?.concluidaEm||etapas?.[ultima?.id]?.data||null):null;
    return {
      ...brasao,
      concluidas,
      total,
      progresso:total?Math.round(concluidas/total*100):0,
      desbloqueado,
      desbloqueadoEm
    };
  });
}

export function brasaoPorMarco(id){
  return BRASOES_NIIL.find(x=>x.id===id)||null;
}
