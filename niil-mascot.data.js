import niilMascot from './niil-mascot-official.webp';

export const niilMascotFallback = niilMascot;
export { niilMascot };

const estados = ['acolher', 'refletir', 'incentivar', 'celebrar'];
const expressoes = Object.fromEntries(
  estados.map(e => [e, { niil: niilMascot, fun: niilMascot, essencial: niilMascot }])
);

export default expressoes;
