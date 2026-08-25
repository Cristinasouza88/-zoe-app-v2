import {niilMascot} from './niil-mascot.data.js';

const migrarObjeto=v=>{
  if(Array.isArray(v))return v.map(migrarObjeto);
  if(!v||typeof v!=='object')return v;
  return Object.fromEntries(Object.entries(v).map(([k,val])=>[k.replace(/zoe/gi,'niil'),migrarObjeto(val)]));
};

if(typeof window!=='undefined'&&window.localStorage){
  try{
    const antigas=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k?.startsWith('zoe:'))antigas.push(k)}
    antigas.forEach(k=>{const nk=k.replace(/^zoe:/,'niil:');if(localStorage.getItem(nk)!=null)return;const raw=localStorage.getItem(k);if(raw==null)return;try{localStorage.setItem(nk,JSON.stringify(migrarObjeto(JSON.parse(raw))))}catch{localStorage.setItem(nk,raw)}});
  }catch(e){console.warn('NIIL: migração local não concluída',e)}
}

const trocarTexto=(s='')=>s.replace(/ZOE/g,'NIIL').replace(/Zoë/g,'NIIL').replace(/zoë/g,'niil').replace(/Zoe/g,'NIIL').replace(/\bNiil\b/g,'NIIL');

const aplicar=(root=document)=>{
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(n=>{const novo=trocarTexto(n.nodeValue);if(novo!==n.nodeValue)n.nodeValue=novo});
  root.querySelectorAll?.('img').forEach(img=>{if(/ZOE|Zoë|Zoe|NIIL/i.test(img.alt||'')){img.src=niilMascot;img.alt=trocarTexto(img.alt||'NIIL')}});
  root.querySelectorAll?.('button').forEach(btn=>{if(/trocar avatar/i.test(btn.textContent||''))btn.style.display='none'});
  root.querySelectorAll?.('h2').forEach(h=>{
    if(/Como a (ZOE|NIIL) acompanha você\?/i.test(h.textContent||'')){
      const sheet=h.closest('[style*="position: fixed"]');
      const escolha=[...(sheet?.querySelectorAll('button')||[])].find(b=>/Essencial|Fun/i.test(b.textContent||''));
      if(escolha)setTimeout(()=>escolha.click(),0);if(sheet)sheet.style.display='none';
    }
  });
};

if(typeof document!=='undefined'){
  const iniciar=()=>{aplicar();new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1)aplicar(n)}))).observe(document.body,{childList:true,subtree:true})};
  document.body?iniciar():document.addEventListener('DOMContentLoaded',iniciar,{once:true});
}
