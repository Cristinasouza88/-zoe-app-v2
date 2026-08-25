import {niilMascot} from './niil-mascot.data.js';

const trocarTexto=(s='')=>s
  .replace(/ZOE/g,'NIIL').replace(/Zoë/g,'NIIL').replace(/zoë/g,'niil')
  .replace(/Zoe/g,'NIIL');

const aplicar=(root=document)=>{
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(n=>{const novo=trocarTexto(n.nodeValue);if(novo!==n.nodeValue)n.nodeValue=novo});
  root.querySelectorAll?.('img').forEach(img=>{
    if(/ZOE|Zoë|Zoe/i.test(img.alt||'')){img.src=niilMascot;img.alt=trocarTexto(img.alt||'NIIL')}
  });
  root.querySelectorAll?.('button').forEach(btn=>{
    if(/trocar avatar/i.test(btn.textContent||''))btn.style.display='none';
  });
  root.querySelectorAll?.('h2').forEach(h=>{
    if(/Como a (ZOE|NIIL) acompanha você\?/i.test(h.textContent||'')){
      const sheet=h.closest('[style*="position: fixed"]');
      const escolha=[...(sheet?.querySelectorAll('button')||[])].find(b=>/Essencial|Fun/i.test(b.textContent||''));
      if(escolha)setTimeout(()=>escolha.click(),0);
      if(sheet)sheet.style.display='none';
    }
  });
};

if(typeof document!=='undefined'){
  const iniciar=()=>{aplicar();new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1)aplicar(n)}))).observe(document.body,{childList:true,subtree:true})};
  document.body?iniciar():document.addEventListener('DOMContentLoaded',iniciar,{once:true});
}
