import {iniciarReconhecimentoVoz,reconhecimentoDisponivel} from './ia.jsx';

const FLAG_HINT='niil:dictation-hint-seen-v2';
const ATTR='data-niil-dictation-ready';
let campoAtivo=null;
let reconhecimento=null;
let pressionando=false;
let mic=null;
let hint=null;
let toast=null;
let inicioReconhecimento=0;
let stopTimer=null;

const tipoTexto=el=>{
  if(!el||el.disabled||el.readOnly)return false;
  if(el.isContentEditable)return true;
  if(el.tagName==='TEXTAREA')return true;
  if(el.tagName!=='INPUT')return false;
  return ['text','search','email','url','tel'].includes(String(el.type||'text').toLowerCase());
};
const elegivel=el=>tipoTexto(el)&&!el.closest?.('[data-niil-no-dictation="true"],.niil-no-dictation');

const mostrarToast=mensagem=>{
  if(!toast){
    toast=document.createElement('div');
    toast.className='niil-dictation-toast';
    document.body.appendChild(toast);
  }
  toast.textContent=mensagem;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t=setTimeout(()=>toast?.classList.remove('show'),2600);
};

const valorAtual=el=>el?.isContentEditable?(el.textContent||''):(el?.value||'');

const definirValorReact=(el,valor)=>{
  if(!el)return;
  if(el.isContentEditable){
    el.textContent=valor;
    try{el.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:valor}))}
    catch{el.dispatchEvent(new Event('input',{bubbles:true}))}
    return;
  }
  const anterior=el.value;
  const proto=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;
  const setter=Object.getOwnPropertyDescriptor(proto,'value')?.set;
  if(setter)setter.call(el,valor);else el.value=valor;
  try{el._valueTracker?.setValue(anterior)}catch{}
  try{el.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:valor}))}
  catch{el.dispatchEvent(new Event('input',{bubbles:true}))}
};

const inserirTranscricao=(el,texto)=>{
  if(!el||!texto||!document.contains(el))return;
  const atual=valorAtual(el);
  if(el.isContentEditable){
    definirValorReact(el,(atual.trim()?atual.trimEnd()+' ':'')+texto.trim());
    return;
  }
  const inicio=Number.isFinite(el.selectionStart)?el.selectionStart:atual.length;
  const fim=Number.isFinite(el.selectionEnd)?el.selectionEnd:inicio;
  const antes=atual.slice(0,inicio),depois=atual.slice(fim);
  const espaco=antes&&/\S$/.test(antes)?' ':'';
  const trecho=texto.trim();
  const novo=antes+espaco+trecho+depois;
  definirValorReact(el,novo);
  const cursor=(antes+espaco+trecho).length;
  requestAnimationFrame(()=>{try{el.focus({preventScroll:true});el.setSelectionRange(cursor,cursor)}catch{}});
};

const limparReconhecimento=()=>{
  clearTimeout(stopTimer);stopTimer=null;
  pressionando=false;
  inicioReconhecimento=0;
  mic?.classList.remove('listening');
};

const parar=()=>{
  pressionando=false;
  mic?.classList.remove('listening');
  const rec=reconhecimento;
  if(!rec)return;
  const decorrido=Date.now()-inicioReconhecimento;
  const executar=()=>{
    try{rec.stop?.()}catch{}
  };
  if(decorrido<550)stopTimer=setTimeout(executar,550-decorrido);
  else executar();
};

const iniciar=()=>{
  if(!campoAtivo||!elegivel(campoAtivo))return;
  if(!reconhecimentoDisponivel()){
    mostrarToast('Ditado por voz não está disponível neste navegador. Você ainda pode usar o microfone do teclado.');
    return;
  }
  try{reconhecimento?.abort?.()}catch{}
  pressionando=true;
  inicioReconhecimento=Date.now();
  mic?.classList.add('listening');
  try{localStorage.setItem(FLAG_HINT,'1')}catch{}
  if(hint)hint.hidden=true;
  const alvo=campoAtivo;
  reconhecimento=iniciarReconhecimentoVoz({
    onResultado:texto=>{
      inserirTranscricao(alvo,texto);
      reconhecimento=null;
      limparReconhecimento();
    },
    onErro:erro=>{
      reconhecimento=null;
      limparReconhecimento();
      if(!['aborted','no-speech'].includes(String(erro)))mostrarToast('Não consegui ouvir. Segure o microfone enquanto fala e tente novamente.');
    },
    onFim:()=>{
      reconhecimento=null;
      limparReconhecimento();
    }
  });
  if(!reconhecimento)limparReconhecimento();
};

const posicionar=()=>{
  if(!mic||!campoAtivo||!document.contains(campoAtivo)||!elegivel(campoAtivo)){
    if(mic)mic.hidden=true;
    if(hint)hint.hidden=true;
    return;
  }
  const r=campoAtivo.getBoundingClientRect();
  const vv=window.visualViewport;
  const vw=vv?.width||window.innerWidth;
  const vh=vv?.height||window.innerHeight;
  if(r.bottom<0||r.top>vh||r.right<0||r.left>vw){
    mic.hidden=true;if(hint)hint.hidden=true;return;
  }
  const size=38;
  const left=Math.max(8,Math.min(vw-size-8,r.right-size-7));
  const top=Math.max(8,Math.min(vh-size-8,r.top+Math.max(4,(r.height-size)/2)));
  mic.style.left=left+'px';
  mic.style.top=top+'px';
  mic.hidden=false;
  let viu=false;
  try{viu=!!localStorage.getItem(FLAG_HINT)}catch{}
  if(hint&&!viu){
    hint.hidden=false;
    hint.style.left=Math.max(10,Math.min(vw-238,left-190))+'px';
    hint.style.top=Math.max(8,top-52)+'px';
  }else if(hint)hint.hidden=true;
};

const prepararCampo=el=>{
  if(!elegivel(el)||el.hasAttribute(ATTR))return;
  el.setAttribute(ATTR,'1');
};

const criarUI=()=>{
  if(mic)return;
  mic=document.createElement('button');
  mic.type='button';
  mic.className='niil-dictation-mic';
  mic.setAttribute('aria-label','Segure para falar e escrever');
  mic.title='Segure para falar e escrever';
  mic.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0M12 17v4M9 21h6"/></svg><span></span>';
  mic.hidden=true;
  mic.addEventListener('pointerdown',ev=>{
    ev.preventDefault();ev.stopPropagation();
    try{mic.setPointerCapture(ev.pointerId)}catch{}
    iniciar();
  });
  const soltar=ev=>{ev?.preventDefault?.();ev?.stopPropagation?.();parar()};
  mic.addEventListener('pointerup',soltar);
  mic.addEventListener('pointercancel',soltar);
  window.addEventListener('pointerup',()=>{if(pressionando)parar()},true);
  window.addEventListener('pointercancel',()=>{if(pressionando)parar()},true);
  mic.addEventListener('contextmenu',ev=>ev.preventDefault());
  document.body.appendChild(mic);

  hint=document.createElement('div');
  hint.className='niil-dictation-hint';
  hint.textContent='Prefere falar? Segure o microfone e eu escrevo para você.';
  hint.hidden=true;
  document.body.appendChild(hint);

  const style=document.createElement('style');
  style.textContent=`
    .niil-dictation-mic{position:fixed;z-index:2147483000;width:38px;height:38px;border:0;border-radius:13px;background:#17151D;color:#fff;display:grid;place-items:center;box-shadow:0 7px 18px rgba(23,21,29,.18);touch-action:none;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}
    .niil-dictation-mic[hidden]{display:none!important}.niil-dictation-mic svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}.niil-dictation-mic>span{position:absolute;right:5px;top:5px;width:6px;height:6px;border-radius:50%;background:#B7F20C}.niil-dictation-mic.listening{background:#6C9700;transform:scale(1.04)}.niil-dictation-mic.listening>span{animation:niilMicPulse .8s ease infinite alternate}
    .niil-dictation-hint{position:fixed;z-index:2147482999;max-width:228px;padding:9px 11px;border-radius:12px;background:#17151D;color:#fff;font:700 11px/1.35 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;box-shadow:0 8px 22px rgba(23,21,29,.16);pointer-events:none}.niil-dictation-hint[hidden]{display:none!important}
    .niil-dictation-toast{position:fixed;z-index:2147483001;left:50%;bottom:calc(22px + env(safe-area-inset-bottom));transform:translate(-50%,12px);width:min(88vw,360px);padding:11px 14px;border-radius:14px;background:#17151D;color:#fff;font:700 12px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;text-align:center;opacity:0;pointer-events:none;transition:.2s ease}.niil-dictation-toast.show{opacity:1;transform:translate(-50%,0)}
    [data-niil-dictation-ready="1"]{scroll-margin-bottom:130px}
    @keyframes niilMicPulse{to{transform:scale(1.6);opacity:.45}}
    @supports (-webkit-touch-callout:none){input[data-niil-dictation-ready="1"],textarea[data-niil-dictation-ready="1"],[contenteditable="true"]{font-size:16px!important}}
  `;
  document.head.appendChild(style);
};

const ativarCampo=el=>{
  if(!elegivel(el))return;
  prepararCampo(el);
  campoAtivo=el;
  el.setAttribute('data-niil-editing','true');
  criarUI();
  requestAnimationFrame(posicionar);
  setTimeout(posicionar,180);
  setTimeout(posicionar,420);
};

const desativarCampo=el=>{
  el?.removeAttribute?.('data-niil-editing');
  setTimeout(()=>{
    if(document.activeElement!==campoAtivo&&!pressionando){
      campoAtivo=null;
      if(mic)mic.hidden=true;
      if(hint)hint.hidden=true;
    }
  },220);
};

if(typeof document!=='undefined'){
  const iniciarRuntime=()=>{
    criarUI();
    document.querySelectorAll('input,textarea,[contenteditable="true"]').forEach(prepararCampo);
    document.addEventListener('focusin',ev=>ativarCampo(ev.target),true);
    document.addEventListener('focusout',ev=>{if(elegivel(ev.target))desativarCampo(ev.target)},true);
    const obs=new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{
      if(n.nodeType!==1)return;
      prepararCampo(n);
      n.querySelectorAll?.('input,textarea,[contenteditable="true"]').forEach(prepararCampo);
    })));
    obs.observe(document.body,{childList:true,subtree:true});
    window.addEventListener('scroll',posicionar,true);
    window.addEventListener('resize',posicionar);
    window.visualViewport?.addEventListener('resize',posicionar);
    window.visualViewport?.addEventListener('scroll',posicionar);
  };
  document.body?iniciarRuntime():document.addEventListener('DOMContentLoaded',iniciarRuntime,{once:true});
}
