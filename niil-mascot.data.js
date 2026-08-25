import p1 from './niil-mascot.asset.1.js';
import p2 from './niil-mascot.asset.2.js';
import p3 from './niil-mascot.asset.3.js';
import p4 from './niil-mascot.asset.4.js';
import p5 from './niil-mascot.asset.5.js';
import p6 from './niil-mascot.asset.6.js';

const niilMascotWebp=[p1,p2,p3,p4,p5,p6].join('');
export const niilMascot=`data:image/webp;base64,${niilMascotWebp}`;

const estados=['acolher','refletir','incentivar','celebrar'];
const expressoes=Object.fromEntries(
  estados.map(e=>[e,{niil:niilMascot,fun:niilMascot,essencial:niilMascot}])
);

export default expressoes;
