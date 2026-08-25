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
const texto=el=>(el?.textContent||'').replace(/\s+/g,' ').trim();
const todos=(scope,selector)=>{
  const itens=[];
  if(scope?.matches?.(selector))itens.push(scope);
  if(scope?.querySelectorAll)itens.push(...scope.querySelectorAll(selector));
  return itens;
};

const wordmarkSvg=`
<svg viewBox="0 0 420 190" role="img" aria-label="niil" class="niil-runtime-wordmark">
  <g fill="none" stroke="#9B8DD3" stroke-width="30" stroke-linecap="round" stroke-linejoin="round">
    <path d="M28 164V91C28 43 65 24 104 24s76 19 76 67v73"/>
    <path d="M244 79v85"/><path d="M313 79v85"/><path d="M382 25v139"/>
  </g>
  <circle cx="244" cy="29" r="15" fill="#9B8DD3"/><circle cx="313" cy="29" r="15" fill="#9B8DD3"/>
</svg>`;

const criarOrb=()=>{
  const orb=document.createElement('div');
  orb.className='niil-orb-runtime';
  orb.setAttribute('role','img');
  orb.setAttribute('aria-label','NIIL');
  orb.innerHTML='<span class="niil-orb-cloud"></span><i class="niil-orb-signal"></i>';
  return orb;
};

const aplicarMarcaInicio=(scope=document)=>{
  const marcadores=todos(scope,'div').filter(el=>texto(el)==='Sua trilha principal');
  marcadores.forEach(marcador=>{
    const centro=marcador.parentElement;
    const tela=centro?.parentElement;
    if(!centro||!tela)return;
    tela.classList.add('niil-home-screen');
    centro.classList.add('niil-home-main');
    const header=tela.firstElementChild;
    header?.classList.add('niil-home-header');

    const contaBtn=header?.querySelector('button[aria-label="Abrir menu da conta"]');
    if(contaBtn){
      contaBtn.classList.add('niil-home-account');
      contaBtn.style.setProperty('background-image',`url("${niilMascot}")`,'important');
      contaBtn.style.setProperty('background-size','36px 36px','important');
      contaBtn.style.setProperty('background-position','center','important');
      contaBtn.style.setProperty('background-repeat','no-repeat','important');
    }

    const filhos=[...centro.children];
    const ring=filhos.find(el=>el.tagName==='DIV'&&/conic-gradient/i.test(el.style?.background||''));
    if(ring){
      ring.classList.add('niil-home-life-ring');
      const badge=ring.firstElementChild;
      badge?.classList.add('niil-home-percent');
      const pct=Math.max(0,Math.min(100,parseFloat(texto(badge))||0));
      ring.style.setProperty('background',`conic-gradient(from 222deg,#C9E56C 0%,#9B8DD3 ${pct}%,#E9E4F3 ${pct}% 86%,transparent 86%)`,'important');
      const miolo=ring.children?.[1];
      miolo?.classList.add('niil-home-life-inner');
      const progresso=[...miolo?.children||[]].find(el=>texto(el)==='Progresso geral');
      progresso?.classList.add('niil-home-progress-label');
      const avatar=[...miolo?.querySelectorAll?.('img')||[]][0];
      if(avatar){avatar.src=niilMascot;avatar.classList.add('niil-home-mascot')}
    }

    const continuar=[...centro.querySelectorAll('button')].find(btn=>/Continuar trilha/i.test(texto(btn)));
    continuar?.classList.add('niil-home-continue');

    const outras=[...tela.querySelectorAll('div')].find(el=>texto(el)==='Outras trilhas que impulsionam você');
    outras?.classList.add('niil-home-other-title');
  });
};

const aplicarMarcaTrilha=(scope=document)=>{
  const titulos=todos(scope,'h1').filter(h=>texto(h)==='Minha trilha');
  titulos.forEach(h1=>{
    let hero=h1.parentElement;
    while(hero&&hero!==document.body&&!(hero.style?.background||'').includes('linear-gradient'))hero=hero.parentElement;
    if(!hero)return;
    const tela=hero.parentElement;
    tela?.classList.add('niil-trail-screen');
    hero.classList.add('niil-trail-hero');

    const headingRow=h1.parentElement?.parentElement;
    if(headingRow){
      headingRow.classList.add('niil-trail-heading-row');
      const avatar=[...headingRow.querySelectorAll('img')].find(img=>/NIIL/i.test(img.alt||''));
      if(avatar){avatar.classList.add('niil-trail-heading-mascot');avatar.src=niilMascot}
      if(!headingRow.querySelector('.niil-orb-runtime'))headingRow.appendChild(criarOrb());
    }

    if(!hero.querySelector('.niil-runtime-brand')){
      const brand=document.createElement('div');
      brand.className='niil-runtime-brand';
      brand.innerHTML=wordmarkSvg;
      hero.insertBefore(brand,hero.firstChild);
    }

    const progresso=[...hero.querySelectorAll('span')].find(s=>texto(s)==='Progresso da jornada');
    const progressoCard=progresso?.parentElement?.parentElement;
    if(progressoCard)progressoCard.classList.add('niil-trail-progress-card');

    const faseBtns=[...tela.querySelectorAll('button')].filter(btn=>/\d+\s*\/\s*\d+/.test(texto(btn))&&btn.querySelector('div'));
    faseBtns.forEach((btn,i)=>{
      btn.classList.add('niil-trail-phase-card',`niil-phase-${i%4}`);
      if(/Fundação/i.test(texto(btn))||/Primeira volta/i.test(texto(btn)))btn.classList.add('niil-phase-foundation');
    });

    const titulosEtapa=[...tela.querySelectorAll('div')].filter(el=>{
      const t=texto(el);
      return /^(Como você chega hoje\?|Sua Roda da Vida inicial|Escolha sua alavanca|Matriz de ganhos e perdas|Mapa de influências|Experimento de 7 dias|Ative na agenda|Checkpoint da Roda da Vida)$/.test(t);
    });
    titulosEtapa.forEach(label=>{
      const node=label.parentElement;
      if(!node||node.style?.position!=='absolute')return;
      node.classList.add('niil-trail-node');
      if(node.classList.contains('niil-surge')||[...node.querySelectorAll('span')].some(s=>texto(s)==='AGORA'))node.classList.add('is-current');
      if(node.querySelector('svg.lucide-lock'))node.classList.add('is-locked');
      if(node.querySelector('svg.lucide-check'))node.classList.add('is-done');
    });

    tela.querySelectorAll('img').forEach(img=>{
      if(/NIIL/i.test(img.alt||'')){
        img.src=niilMascot;
        if(!img.closest('.niil-trail-heading-row'))img.classList.add('niil-trail-mascot');
      }
    });
  });
};

const protegerFinanceiro=(scope=document)=>{
  todos(scope,'.fx2-overlay').forEach(overlay=>{
    if(overlay.dataset.niilGuarded==='1')return;
    overlay.dataset.niilGuarded='1';
    overlay.dataset.niilOpenedAt=String(Date.now());
    const proteger=e=>{
      const idade=Date.now()-Number(overlay.dataset.niilOpenedAt||0);
      if(idade<700&&e.target===overlay){
        e.preventDefault?.();
        e.stopPropagation?.();
        e.stopImmediatePropagation?.();
      }
    };
    ['pointerdown','mousedown','touchend','click'].forEach(tipo=>overlay.addEventListener(tipo,proteger,true));
    overlay.querySelector('.fx2-sheet')?.addEventListener('click',e=>e.stopPropagation());
  });
};

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
  aplicarMarcaInicio(root);
  aplicarMarcaTrilha(root);
  protegerFinanceiro(root);
};

if(typeof document!=='undefined'){
  const iniciar=()=>{
    aplicar();
    const obs=new MutationObserver(ms=>{
      ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1)aplicar(n)}));
      aplicarMarcaInicio(document);
      aplicarMarcaTrilha(document);
      protegerFinanceiro(document);
    });
    obs.observe(document.body,{childList:true,subtree:true});
  };
  document.body?iniciar():document.addEventListener('DOMContentLoaded',iniciar,{once:true});
}
