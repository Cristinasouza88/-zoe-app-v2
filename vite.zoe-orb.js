export default function zoeOrbAnimado(){
  return {
    name:'zoe-orb-animado',
    enforce:'pre',
    transform(code,id){
      let out=code,changed=false;

      if(id.endsWith('/App.jsx')||id.endsWith('App.jsx')){
        const importAnchor="import avatarZoeEssencial from './avatar-zoe-essencial.data.js';";
        if(out.includes(importAnchor)&&!out.includes("import ZoeOrb from './ZoeOrb.jsx';")){
          out=out.replace(importAnchor,importAnchor+"\nimport ZoeOrb from './ZoeOrb.jsx';");
          changed=true;
        }

        const essencial="{ id: 'essencial', nome: 'ZOE Essencial', texto: 'Mais madura, discreta e reflexiva.', imagem: avatarZoeEssencial, fundo: '#F4EDFF' }";
        if(out.includes(essencial)){
          out=out.replace(essencial,"{ id: 'essencial', nome: 'ZOE Essencial', texto: 'Mais madura, discreta e reflexiva.', imagem: avatarZoeEssencial, fundo: '#F4EDFF', orb: true }");
          changed=true;
        }

        const opcaoImg=`<img src={opcao.imagem} alt="" style={{ width: opcao.id === 'essencial' ? '78%' : '92%', height: '94%', objectFit: 'contain' }} />`;
        if(out.includes(opcaoImg)){
          out=out.replace(opcaoImg,`{opcao.orb ? <ZoeOrb size={124} active={true} /> : <img src={opcao.imagem} alt="" style={{ width:'92%',height:'94%',objectFit:'contain' }} />}`);
          changed=true;
        }

        const trilhaImg=`<img src={avatarImagem} alt="ZOE" style={{ width:88,height:96,objectFit:'contain',objectPosition:'center',filter:'drop-shadow(0 8px 12px rgba(55,28,105,.18))' }}/>`;
        if(out.includes(trilhaImg)){
          out=out.replace(trilhaImg,`{avatarId==='essencial'?<ZoeOrb size={82} />:<img src={avatarImagem} alt="ZOE" style={{ width:88,height:96,objectFit:'contain',objectPosition:'center',filter:'drop-shadow(0 8px 12px rgba(55,28,105,.18))' }}/>} `);
          changed=true;
        }

        const homeImg=`<img src={avatarImagem} alt="ZOE, sua coach" style={{ width: avatarId === 'essencial' ? 130 : 190, height: 159, objectFit: 'contain', margin: '-2px 0 -4px', filter: 'drop-shadow(0 12px 13px rgba(74,25,133,.13))', zIndex: 1 }} />`;
        if(out.includes(homeImg)){
          out=out.replace(homeImg,`{avatarId==='essencial'?<div style={{margin:'8px 0 8px',zIndex:1}}><ZoeOrb size={138}/></div>:<img src={avatarImagem} alt="ZOE, sua coach" style={{ width:190,height:159,objectFit:'contain',margin:'-2px 0 -4px',filter:'drop-shadow(0 12px 13px rgba(74,25,133,.13))',zIndex:1 }} />}`);
          changed=true;
        }

        const coachImg=`<img src={avatarImagem} alt="ZOE celebrando" style={{ height: avatarId === 'essencial' ? 220 : 190, maxWidth: 205, objectFit: 'contain' }} />`;
        if(out.includes(coachImg)){
          out=out.replace(coachImg,`{avatarId==='essencial'?<ZoeOrb size={178}/>:<img src={avatarImagem} alt="ZOE celebrando" style={{height:190,maxWidth:205,objectFit:'contain'}}/>}`);
          changed=true;
        }

        const jornadaCall=`<JornadaSistemica id={id} d={d} up={up} campo={campo} setCampo={setCampo} aviso={aviso} avatar={avatarImagem} />`;
        if(out.includes(jornadaCall)){
          out=out.replace(jornadaCall,`<JornadaSistemica id={id} d={d} up={up} campo={campo} setCampo={setCampo} aviso={aviso} avatar={avatarImagem} avatarId={avatarId} />`);
          changed=true;
        }
      }

      if(id.endsWith('/JornadaSistemica.jsx')||id.endsWith('JornadaSistemica.jsx')){
        const reactImport="import React, { useMemo, useState } from 'react';";
        if(out.includes(reactImport)&&!out.includes("import ZoeOrb from './ZoeOrb.jsx';")){
          out=out.replace(reactImport,reactImport+"\nimport ZoeOrb from './ZoeOrb.jsx';");
          changed=true;
        }
        const sig="export default function JornadaSistemica({ id, d, up, campo, setCampo, aviso, avatar })";
        if(out.includes(sig)){
          out=out.replace(sig,"export default function JornadaSistemica({ id, d, up, campo, setCampo, aviso, avatar, avatarId })");
          changed=true;
        }
        const celebra=`<img src={avatar} alt="ZOE celebrando" style={{ width:130,height:130,objectFit:'contain',filter:'drop-shadow(0 10px 12px rgba(55,28,105,.15))' }}/>`;
        if(out.includes(celebra)){
          out=out.replace(celebra,`{avatarId==='essencial'?<div style={{display:'grid',placeItems:'center',marginBottom:5}}><ZoeOrb size={122}/></div>:<img src={avatar} alt="ZOE celebrando" style={{width:130,height:130,objectFit:'contain',filter:'drop-shadow(0 10px 12px rgba(55,28,105,.15))'}}/>}`);
          changed=true;
        }
      }

      return changed?{code:out,map:null}:null;
    }
  };
}
