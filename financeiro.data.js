export const VERSAO_FINANCEIRO = 2;

export const MOEDAS = [
  {codigo:'BRL',rotulo:'Real brasileiro',simbolo:'R$'},
  {codigo:'USD',rotulo:'Dólar americano',simbolo:'US$'},
  {codigo:'EUR',rotulo:'Euro',simbolo:'€'},
  {codigo:'GBP',rotulo:'Libra esterlina',simbolo:'£'},
  {codigo:'CAD',rotulo:'Dólar canadense',simbolo:'C$'},
  {codigo:'AUD',rotulo:'Dólar australiano',simbolo:'A$'}
];

export const formatoMoeda=(v,moeda='BRL')=>Number(v??0).toLocaleString('pt-BR',{style:'currency',currency:MOEDAS.some(m=>m.codigo===moeda)?moeda:'BRL'});
export const parseValorMonetario=valor=>{let s=String(valor??'').trim().replace(/\s/g,'').replace(/[^0-9,.-]/g,'');if(!s)return 0;const neg=s.startsWith('-');s=s.replace(/-/g,'');const p=(s.match(/\./g)||[]).length,v=(s.match(/,/g)||[]).length;let z=s;if(p&&v){const up=s.lastIndexOf('.'),uv=s.lastIndexOf(','),dec=up>uv?'.':',',mil=dec==='.'?',':'.';z=s.split(mil).join('').replace(dec,'.')}else if(p||v){const sep=p?'.':',',part=s.split(sep);if(part.length>2){const u=part.pop();z=u.length<=2?part.join('')+'.'+u:part.join('')+u}else{const c=part[1]?.length??0;z=c>0&&c<=2?part[0]+'.'+part[1]:part.join('')}}const n=Number(z);return Number.isFinite(n)?(neg?-n:n):0};

const logoBanco=dominio=>`https://www.google.com/s2/favicons?domain_url=https://${dominio}&sz=64`;

// 20 instituições mais úteis para o público brasileiro + Outros.
// Os logos vêm dos favicons dos domínios oficiais para manter a identificação visual real da marca.
export const INSTITUICOES_FINANCEIRAS=[
 {id:'bb',nome:'Banco do Brasil',dominio:'bb.com.br',logo:logoBanco('bb.com.br'),icone:''},
 {id:'caixa',nome:'Caixa Econômica Federal',dominio:'caixa.gov.br',logo:logoBanco('caixa.gov.br'),icone:''},
 {id:'itau',nome:'Itaú',dominio:'itau.com.br',logo:logoBanco('itau.com.br'),icone:''},
 {id:'bradesco',nome:'Bradesco',dominio:'bradesco.com.br',logo:logoBanco('bradesco.com.br'),icone:''},
 {id:'santander',nome:'Santander',dominio:'santander.com.br',logo:logoBanco('santander.com.br'),icone:''},
 {id:'nubank',nome:'Nubank',dominio:'nubank.com.br',logo:logoBanco('nubank.com.br'),icone:''},
 {id:'inter',nome:'Banco Inter',dominio:'inter.co',logo:logoBanco('inter.co'),icone:''},
 {id:'c6',nome:'C6 Bank',dominio:'c6bank.com.br',logo:logoBanco('c6bank.com.br'),icone:''},
 {id:'btg',nome:'BTG Pactual',dominio:'btgpactual.com',logo:logoBanco('btgpactual.com'),icone:''},
 {id:'xp',nome:'XP Investimentos',dominio:'xp.com.br',logo:logoBanco('xp.com.br'),icone:''},
 {id:'mercadopago',nome:'Mercado Pago',dominio:'mercadopago.com.br',logo:logoBanco('mercadopago.com.br'),icone:''},
 {id:'picpay',nome:'PicPay',dominio:'picpay.com',logo:logoBanco('picpay.com'),icone:''},
 {id:'pagbank',nome:'PagBank',dominio:'pagbank.com.br',logo:logoBanco('pagbank.com.br'),icone:''},
 {id:'sicredi',nome:'Sicredi',dominio:'sicredi.com.br',logo:logoBanco('sicredi.com.br'),icone:''},
 {id:'sicoob',nome:'Sicoob',dominio:'sicoob.com.br',logo:logoBanco('sicoob.com.br'),icone:''},
 {id:'safra',nome:'Banco Safra',dominio:'safra.com.br',logo:logoBanco('safra.com.br'),icone:''},
 {id:'bv',nome:'Banco BV',dominio:'bancobv.com.br',logo:logoBanco('bancobv.com.br'),icone:''},
 {id:'pan',nome:'Banco PAN',dominio:'bancopan.com.br',logo:logoBanco('bancopan.com.br'),icone:''},
 {id:'wise',nome:'Wise',dominio:'wise.com',logo:logoBanco('wise.com'),icone:''},
 {id:'nomad',nome:'Nomad',dominio:'nomadglobal.com',logo:logoBanco('nomadglobal.com'),icone:''},
 {id:'outro',nome:'Outra instituição',dominio:'',logo:'',icone:''}
];

// A seleção original é um <select> controlado pelo React. No iOS opções nativas não aceitam imagens.
// Este enhancer mantém o select como fonte de verdade, mas apresenta por cima um picker com logos reais.
// Ao escolher "Outros", abre um campo de texto e o nome digitado é enviado de volta ao mesmo select/estado.
if(typeof window!=='undefined'&&typeof document!=='undefined'&&!window.__niilBankPickerInstalled){
 window.__niilBankPickerInstalled=true;
 window.__niilCustomInstitutions=window.__niilCustomInstitutions||{};
 const keyDoSelect=sel=>{
   const step=(document.querySelector('.fxstart-sheet-head small')?.textContent||'').replace(/\s+/g,' ').trim();
   const label=sel.closest('.fxstart-field')?.querySelector(':scope > span')?.textContent||'Instituição';
   return `${step}|${label}`;
 };
 const setSelectValue=(sel,value)=>{
   let opt=[...sel.options].find(o=>o.value===value);
   if(!opt&&value){opt=document.createElement('option');opt.value=value;opt.textContent=value;opt.dataset.niilCustom='1';sel.appendChild(opt)}
   const setter=Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype,'value')?.set;
   if(setter)setter.call(sel,value);else sel.value=value;
   sel.dispatchEvent(new Event('change',{bubbles:true}));
 };
 const renderBankPicker=sel=>{
   if(!sel?.closest?.('.fxstart-sheet'))return;
   const field=sel.closest('.fxstart-field');
   const label=(field?.querySelector(':scope > span')?.textContent||'').toLowerCase();
   if(!label.includes('instituição'))return;
   if(field.querySelector('.niil-bank-picker'))return;
   const key=keyDoSelect(sel),known=INSTITUICOES_FINANCEIRAS.find(b=>b.nome===sel.value),custom=window.__niilCustomInstitutions[key]||(!known&&sel.value?sel.value:'');
   const wrap=document.createElement('div');wrap.className='niil-bank-picker';wrap.style.cssText='position:relative;margin-top:8px';
   const trigger=document.createElement('button');trigger.type='button';trigger.style.cssText='width:100%;min-height:54px;border:1px solid #D9E3E1;border-radius:14px;background:#fff;display:flex;align-items:center;gap:10px;padding:10px 12px;font:inherit;color:#173F3E;text-align:left';
   const refreshTrigger=()=>{const bank=INSTITUICOES_FINANCEIRAS.find(b=>b.nome===sel.value),name=window.__niilCustomInstitutions[key]||sel.value||'Selecione';trigger.innerHTML='';if(bank?.logo){const img=document.createElement('img');img.src=bank.logo;img.alt='';img.width=28;img.height=28;img.style.cssText='border-radius:7px;object-fit:contain;background:#fff';trigger.appendChild(img)}else{const ic=document.createElement('span');ic.textContent='🏦';ic.style.fontSize='22px';trigger.appendChild(ic)}const txt=document.createElement('span');txt.textContent=name;txt.style.flex='1';trigger.appendChild(txt);const chevron=document.createElement('span');chevron.textContent='⌄';chevron.style.color='#71807F';trigger.appendChild(chevron)};
   const menu=document.createElement('div');menu.style.cssText='display:none;position:absolute;z-index:50;left:0;right:0;top:60px;max-height:310px;overflow:auto;background:#fff;border:1px solid #D9E3E1;border-radius:16px;padding:8px;box-shadow:0 16px 40px rgba(5,60,58,.16)';
   INSTITUICOES_FINANCEIRAS.forEach(bank=>{const b=document.createElement('button');b.type='button';b.style.cssText='width:100%;border:0;background:#fff;display:flex;align-items:center;gap:10px;padding:10px;border-radius:11px;text-align:left;font:inherit;color:#173F3E';if(bank.logo){const img=document.createElement('img');img.src=bank.logo;img.alt='';img.width=30;img.height=30;img.loading='lazy';img.style.cssText='border-radius:7px;object-fit:contain;background:#fff';b.appendChild(img)}else{const ic=document.createElement('span');ic.textContent='➕';ic.style.cssText='width:30px;text-align:center';b.appendChild(ic)}const txt=document.createElement('span');txt.textContent=bank.id==='outro'?'Outros':bank.nome;b.appendChild(txt);b.addEventListener('click',()=>{menu.style.display='none';if(bank.id==='outro'){window.__niilCustomInstitutions[key]='';setSelectValue(sel,'Outra instituição');customBox.style.display='block';customInput.focus();refreshTrigger()}else{delete window.__niilCustomInstitutions[key];customBox.style.display='none';setSelectValue(sel,bank.nome);refreshTrigger()}});menu.appendChild(b)});
   const customBox=document.createElement('div');customBox.style.cssText=`display:${custom||sel.value==='Outra instituição'?'block':'none'};margin-top:8px`;
   const customInput=document.createElement('input');customInput.type='text';customInput.placeholder='Digite o nome da instituição';customInput.value=custom;customInput.style.cssText='width:100%;min-height:50px;border:1px solid #D9E3E1;border-radius:14px;padding:10px 12px;font:inherit;box-sizing:border-box';
   customInput.addEventListener('input',()=>{const v=customInput.value;window.__niilCustomInstitutions[key]=v;if(v.trim())setSelectValue(sel,v.trim());refreshTrigger()});
   customBox.appendChild(customInput);
   trigger.addEventListener('click',()=>{menu.style.display=menu.style.display==='block'?'none':'block'});
   wrap.appendChild(trigger);wrap.appendChild(menu);wrap.appendChild(customBox);
   sel.style.cssText+=';position:absolute!important;opacity:0!important;pointer-events:none!important;width:1px!important;height:1px!important;';
   sel.insertAdjacentElement('afterend',wrap);refreshTrigger();
 };
 const enhance=()=>document.querySelectorAll('.fxstart-sheet .fxstart-field select').forEach(renderBankPicker);
 const obs=new MutationObserver(enhance);const start=()=>{if(document.body){obs.observe(document.body,{childList:true,subtree:true});enhance()}else setTimeout(start,50)};start();
 document.addEventListener('click',e=>{const btn=e.target.closest?.('button');if(!btn)return;const t=(btn.textContent||'').replace(/\s+/g,' ').trim().toUpperCase();if(/^SALVAR\b/.test(t)){const step=(document.querySelector('.fxstart-sheet-head small')?.textContent||'').replace(/\s+/g,' ').trim();Object.keys(window.__niilCustomInstitutions).filter(k=>k.startsWith(step+'|')).forEach(k=>delete window.__niilCustomInstitutions[k])}},true);
}

export const METAANUAL_PADRAO={alvo:0,ano:new Date().getFullYear()};
export const MESES_LBL=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
export const CATEGORIAS_DESPESA=['Moradia','Mercado','Alimentação','Transporte','Saúde','Educação','Beleza e cuidados pessoais','Fitness','Filhos e família','Pets','Carreira','Assinaturas','Compras','Lazer','Viagens','Impostos','Seguros','Consórcio','Financiamento','Presentes e doações','Investimentos','Outros'];
export const CATEGORIAS_RECEITA=['Salário','Salário PJ','Pró-labore','Trabalho','Renda variável','Rendimentos','Reembolso','Aluguel recebido','Outros'];
export const TIPOS_CONTA=['Conta corrente','Conta pagamento','Carteira','Poupança','Investimento'];
export const TIPOS_INVESTIMENTO=['Reserva','CDB','Tesouro','Fundo de renda fixa','Fundo imobiliário (FII)','Ações','ETF','Previdência','Cripto','Outro'];
export const TIPOS_DIVIDA=['Financiamento imobiliário - imóvel pronto','Financiamento imobiliário - em construção','Financiamento de veículo','Consórcio imobiliário','Consórcio de veículo','Empréstimo','Parcelamento','Outro compromisso'];
export const TIPOS_PATRIMONIO=['Imóvel','Veículo','Terreno','Empresa/participação','Bem de valor','Outro'];
export const CONTAS_PADRAO=[];
export const FINANCEIRO_REFERENCIA={azul:'#246BFD',azulEscuro:'#1756D7',verde:'#31B65A',vermelho:'#EF5B5B',roxo:'#8157E8'};

export const ESTADO_FINANCEIRO_INICIAL={
 versao:VERSAO_FINANCEIRO,onboardingConcluido:false,startFinanceiroConcluido:false,
 transacoes:[],contas:[],cartoes:[],investimentos:[],dividas:[],patrimonios:[],receitasRecorrentes:[],gastosFixos:[],objetivos:[],orcamentos:[],regrasClassificacao:[],importacoes:[],alocacoesSobra:[],
 configuracao:{ocultarValores:false,moedaBase:'BRL',metaReserva:0,prazoReserva:'',aporteReservaMensal:0,metaReservaMeses:6,metasPrioritarias:[],trilhasEducacao:[]},
 gamificacao:{xp:0,cristais:0,nivel:1,missoesPremiadas:[],ofensiva:null,atividadeDias:[],bausAbertos:[]},metaAnual:METAANUAL_PADRAO
};
export const cloneFinanceiroInicial=()=>JSON.parse(JSON.stringify(ESTADO_FINANCEIRO_INICIAL));