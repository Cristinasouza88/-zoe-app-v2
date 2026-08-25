import p1 from './niil-mascot.asset.1.js';
import p2 from './niil-mascot.asset.2.js';
import p3 from './niil-mascot.asset.3.js';
import p4 from './niil-mascot.asset.4.js';
import p5 from './niil-mascot.asset.5.js';
import p6 from './niil-mascot.asset.6.js';

const niilMascotWebp=[p1,p2,p3,p4,p5,p6].join('');
const niilMascotDataUri=`data:image/webp;base64,${niilMascotWebp}`;

const criarBlobUrl=()=>{
  if(typeof window==='undefined'||typeof window.atob!=='function'||typeof Blob==='undefined'||typeof URL==='undefined'||typeof URL.createObjectURL!=='function')return niilMascotDataUri;
  try{
    const bin=window.atob(niilMascotWebp);
    const bytes=new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
    return URL.createObjectURL(new Blob([bytes],{type:'image/webp'}));
  }catch(e){
    console.warn('NIIL: fallback de imagem ativado',e);
    return niilMascotDataUri;
  }
};

export const niilMascot=criarBlobUrl();
export const niilMascotFallback=niilMascotDataUri;

const estados=['acolher','refletir','incentivar','celebrar'];
const expressoes=Object.fromEntries(
  estados.map(e=>[e,{niil:niilMascot,fun:niilMascot,essencial:niilMascot}])
);

export default expressoes;
