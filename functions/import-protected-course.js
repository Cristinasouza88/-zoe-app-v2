const json=(statusCode,body)=>({statusCode,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'},body:JSON.stringify(body)});
const text=v=>typeof v==='string'?v.trim():'';
const first=(o,keys)=>{for(const k of keys)if(text(o?.[k]))return text(o[k]);return''};
const request=async(url,options={})=>{const c=new AbortController(),timer=setTimeout(()=>c.abort(),15000);try{const response=await fetch(url,{...options,signal:c.signal}),raw=await response.text();let data={};try{data=raw?JSON.parse(raw):{}}catch{}return{response,data}}finally{clearTimeout(timer)}};
const minutes=o=>{const v=o?.duration_seconds??o?.duration??o?.time_seconds??o?.video_duration;if(typeof v==='number')return Math.max(2,Math.ceil(v>300?v/60:v));const p=text(v).split(':').map(Number);if(p.length>1&&p.every(Number.isFinite)){const s=p.reverse().reduce((a,n,i)=>a+n*60**i,0);return Math.max(2,Math.ceil(s/60))}return 10};
const isLesson=o=>{const type=first(o,['type','content_type','lesson_type']).toUpperCase(),title=first(o,['title','name','lesson_name','lesson_title']);return !!(title&&(o?.lesson_id||o?.lessonId||/VIDEO|SOUND|FILE|QUIZ|HTML|EXTERNAL/.test(type)||o?.action?.can_access!==undefined))};
const collect=(node,out,seen,courseUrl)=>{if(!node||typeof node!=='object')return;if(isLesson(node)){const id=node.id??node.lesson_id??node.lessonId,title=first(node,['title','name','lesson_name','lesson_title']),key=`${id||''}:${title}`;if(!seen.has(key)){seen.add(key);const link=first(node,['url','external_url','link','permalink']);out.push({titulo:title,minutos:minutes(node),url:/^https?:\/\//i.test(link)?link:courseUrl})}}for(const value of Object.values(node))collect(value,out,seen,courseUrl)};

exports.handler=async event=>{
  if(event.httpMethod!=='POST')return json(405,{erro:'Método não permitido.'});
  let payload;try{payload=JSON.parse(event.body||'{}')}catch{return json(400,{erro:'Dados inválidos.'})}
  const courseUrl=text(payload.url),email=text(payload.email),password=String(payload.password||'');
  if(!courseUrl||!email||!password)return json(400,{erro:'Informe o e-mail e a senha usados no curso.'});
  let origin;try{origin=new URL(courseUrl)}catch{return json(400,{erro:'URL do curso inválida.'})}
  const host=origin.hostname.toLowerCase(),suffix='.entregadigital.app.br';
  if(!host.endsWith(suffix)||host.startsWith('api-'))return json(400,{erro:'Este conector é exclusivo para cursos da Entrega Digital.'});
  const slug=host.slice(0,-suffix.length);if(!/^[a-z0-9-]+$/.test(slug))return json(400,{erro:'Endereço da plataforma não reconhecido.'});
  const base=`https://api-${slug}.entregadigital.app.br/api/v1/pwa/`,baseHeaders={accept:'application/json','content-type':'application/json',os:'Web','os-version':'browser','device-model':'ZOE Web','app-version':'2.69.0','device-id':`zoe-${Date.now()}`};
  try{
    const login=await request(`${base}login`,{method:'POST',headers:baseHeaders,body:JSON.stringify({email,password,type:'PWA'})});
    if(!login.response.ok)return json(login.response.status===401||login.response.status===422?401:502,{erro:first(login.data,['message','error','erro'])||'E-mail ou senha não reconhecidos pela plataforma do curso.'});
    const token=login.data?.api_token||login.data?.token||login.data?.data?.api_token;
    if(!token)return json(502,{erro:'A plataforma autorizou o acesso, mas não retornou a chave da sessão.'});
    const headers={...baseHeaders,authorization:`Bearer ${token}`},timeline=await request(`${base}timeline/auth`,{headers});
    if(!timeline.response.ok)return json(502,{erro:'Login aceito, mas a plataforma não liberou a lista de cursos.'});
    const sources=[timeline.data],ids=new Set();
    const findIds=node=>{if(!node||typeof node!=='object')return;const title=first(node,['title','name','product_name']);if(title&&node.id&&(node.modules||node.lessons||node.courses||node.progress!==undefined))ids.add(node.id);for(const value of Object.values(node))findIds(value)};
    findIds(timeline.data);
    for(const id of [...ids].slice(0,20)){const product=await request(`${base}products/${encodeURIComponent(id)}/auth`,{headers});if(product.response.ok)sources.push(product.data)}
    const aulas=[],seen=new Set();sources.forEach(source=>collect(source,aulas,seen,courseUrl));
    if(!aulas.length)return json(422,{erro:'O acesso funcionou, mas a plataforma não devolveu aulas disponíveis para este usuário.'});
    return json(200,{tipo:'entregadigital',origem:'Entrega Digital',nome:first(timeline.data,['title','name','product_name'])||'Curso da Entrega Digital',url:courseUrl,aulas});
  }catch(e){return json(502,{erro:e?.name==='AbortError'?'A plataforma demorou demais para responder.':'Não foi possível conectar à plataforma do curso.'})}
};
