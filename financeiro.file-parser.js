const norm = (v='') => String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const pad = x => String(x).padStart(2,'0');

const money = v => {
  const raw = String(v ?? '').trim();
  if (!raw) return 0;
  let s = raw.replace(/R\$|US\$|USD|BRL|\s/g,'');
  const neg = /^\(.*\)$/.test(s) || /^-/.test(s);
  s = s.replace(/[()]/g,'');
  if (s.includes(',') && s.includes('.')) {
    if (s.lastIndexOf(',') > s.lastIndexOf('.')) s = s.replace(/\./g,'').replace(',','.');
    else s = s.replace(/,/g,'');
  } else if (s.includes(',')) {
    s = s.replace(/\./g,'').replace(',','.');
  }
  s = s.replace(/[^0-9.-]/g,'');
  const n = Number(s);
  return Number.isFinite(n) ? (neg ? -Math.abs(n) : n) : 0;
};

const parseDate = (v='', fallbackYear='') => {
  const s = String(v).trim();
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return `${m[1]}-${pad(m[2])}-${pad(m[3])}`;
  m = s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})/);
  if (m) return `${m[3].length===2?'20'+m[3]:m[3]}-${pad(m[2])}-${pad(m[1])}`;
  m = s.match(/^(\d{1,2})[\/-](\d{1,2})$/);
  if (m && fallbackYear) return `${fallbackYear}-${pad(m[2])}-${pad(m[1])}`;
  const x = Number(s.replace(',','.'));
  if (x > 25000 && x < 80000) return new Date(Date.UTC(1899,11,30)+x*86400000).toISOString().slice(0,10);
  return '';
};

const inferYear = (text, fileName='') => {
  const all = `${fileName} ${text}`;
  const years = [...all.matchAll(/\b(20\d{2})\b/g)].map(m=>Number(m[1])).filter(y=>y>=2000&&y<=2100);
  if (years.length) return String(years.sort((a,b)=>b-a)[0]);
  return String(new Date().getFullYear());
};

const inferType = (desc, rawValue, tipoDocumento) => {
  const d = norm(desc);
  if (tipoDocumento === 'fatura_cartao') {
    if (/estorno|credito|reembolso|devolucao|pagamento recebido/.test(d)) return 'entrada';
    return 'saida';
  }
  if (/credito|entrada|receb|salario|rendimento|estorno|reembolso|deposito/.test(d) && !/debito/.test(d)) return 'entrada';
  if (/debito|saida|pagamento|pix enviado|compra|boleto|tarifa|saque/.test(d)) return 'saida';
  return Number(rawValue) < 0 ? 'saida' : 'entrada';
};

const mk = ({id,data,descricao,valor,tipo,conta,origemDocumento}) => ({
  id,
  data,
  descricao: descricao || 'Sem descrição',
  valor: Math.abs(Number(valor||0)),
  tipo,
  conta: conta || 'Conta importada',
  categoria:'Outros',
  subcategoria:'',
  natureza:'',
  confianca:'',
  competenciaAnalitica: data ? String(data).slice(0,7) : '',
  impactoReceita:0,
  impactoDespesa:0,
  transferenciaInterna:false,
  pagamentoFatura:false,
  origemDocumento
});

function transactionsFromLines(lines,{tipoDocumento,fileName,uid}) {
  const year = inferYear(lines.join(' '), fileName);
  const out=[];
  const moneyRx = /(?:R\$\s*)?[-+]?\(?\d{1,3}(?:\.\d{3})*,\d{2}\)?|(?:R\$\s*)?[-+]?\(?\d+\.\d{2}\)?/g;
  const dateRx = /\b(\d{1,2}[\/-]\d{1,2}(?:[\/-]\d{2,4})?|\d{4}-\d{1,2}-\d{1,2})\b/;
  for (let i=0;i<lines.length;i++) {
    const line=String(lines[i]||'').replace(/\s+/g,' ').trim();
    if (!line) continue;
    const dm=line.match(dateRx);
    if (!dm) continue;
    const vals=[...line.matchAll(moneyRx)].map(m=>({raw:m[0],index:m.index,value:money(m[0])}));
    if (!vals.length) continue;
    const chosen=vals[vals.length-1];
    if (!chosen.value) continue;
    const d=parseDate(dm[1],year);
    if (!d) continue;
    let desc=line.slice(dm.index+dm[0].length, chosen.index).trim().replace(/^[|;:,\-–—\s]+|[|;:,\-–—\s]+$/g,'');
    if (!desc) desc=line.replace(dm[0],'').replace(chosen.raw,'').trim();
    if (/saldo anterior|saldo do dia|saldo final|saldo disponivel|total da fatura|limite disponivel|vencimento|melhor dia/i.test(norm(desc))) continue;
    const tipo=inferType(desc,chosen.value,tipoDocumento);
    out.push(mk({id:uid(`doc${i}`),data:d,descricao:desc,valor:chosen.value,tipo,conta:'Documento importado',origemDocumento:fileName}));
  }
  return out;
}

async function parsePdf(file,opts){
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  try {
    if (pdfjs.GlobalWorkerOptions && !pdfjs.GlobalWorkerOptions.workerSrc) {
      pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/legacy/build/pdf.worker.min.mjs', import.meta.url).toString();
    }
  } catch {}
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjs.getDocument({data}).promise;
  const lines=[];
  for(let p=1;p<=pdf.numPages;p++){
    const page=await pdf.getPage(p);
    const content=await page.getTextContent();
    const rows=new Map();
    for(const item of content.items||[]){
      const txt=String(item.str||'').trim(); if(!txt) continue;
      const y=Math.round((item.transform?.[5]||0)*2)/2;
      const x=Number(item.transform?.[4]||0);
      const arr=rows.get(y)||[]; arr.push({x,txt}); rows.set(y,arr);
    }
    [...rows.entries()].sort((a,b)=>b[0]-a[0]).forEach(([,items])=>{
      lines.push(items.sort((a,b)=>a.x-b.x).map(i=>i.txt).join(' '));
    });
  }
  const useful=lines.filter(Boolean);
  if (!useful.length) throw new Error('Este PDF parece ser escaneado e não contém texto selecionável. Exporte o documento em PDF digital ou use CSV para importar sem erro.');
  const tx=transactionsFromLines(useful,{...opts,fileName:file.name});
  if (!tx.length) throw new Error('Consegui abrir o PDF, mas não encontrei lançamentos com data e valor. Você pode tentar CSV/XLSX ou conferir se este é o documento correto.');
  return tx;
}

function parseOfxText(raw,{tipoDocumento,fileName,uid}){
  const out=[];
  const blocks=String(raw).split(/<STMTTRN>/i).slice(1);
  blocks.forEach((b,i)=>{
    const val = tag => (b.match(new RegExp(`<${tag}>([^<\\r\\n]+)`,'i'))||[])[1]?.trim()||'';
    const dt=val('DTPOSTED').slice(0,8);
    const data=dt.length===8?`${dt.slice(0,4)}-${dt.slice(4,6)}-${dt.slice(6,8)}`:'';
    const rawValue=money(val('TRNAMT'));
    if(!data||!rawValue)return;
    const desc=[val('NAME'),val('MEMO')].filter(Boolean).join(' - ')||'Movimentação OFX';
    out.push(mk({id:uid(`ofx${i}`),data,descricao:desc,valor:rawValue,tipo:inferType(desc,rawValue,tipoDocumento),conta:'Conta OFX',origemDocumento:fileName}));
  });
  return out;
}

async function parseSpreadsheet(file,{tipoDocumento,fileName,uid}){
  const XLSX=await import('xlsx');
  const wb=XLSX.read(await file.arrayBuffer(),{type:'array',cellDates:false});
  const ws=wb.Sheets[wb.SheetNames[0]];
  const rows=XLSX.utils.sheet_to_json(ws,{header:1,defval:''});
  if(!rows.length)throw new Error('Planilha vazia.');
  const texts=rows.map(r=>r.map(v=>String(v)).join(' | '));
  const tx=transactionsFromLines(texts,{tipoDocumento,fileName,uid});
  if(tx.length)return tx;
  const hi=rows.findIndex((r,i)=>i<30&&r.some(v=>/data|date/i.test(norm(v)))&&r.some(v=>/valor|amount|debito|credito/i.test(norm(v))));
  if(hi<0)throw new Error('Não encontrei colunas de data e valor nesta planilha.');
  const h=rows[hi].map(norm),ix=(...q)=>h.findIndex(x=>q.some(y=>x===y||x.includes(y)));
  const id=ix('data','date'),idesc=ix('descricao','historico','estabelecimento','memo'),iv=ix('valor','amount'),ideb=ix('debito','saida','despesa'),icred=ix('credito','entrada','receita'),ico=ix('conta','banco','cartao','instituicao');
  const year=inferYear(texts.join(' '),fileName),out=[];
  rows.slice(hi+1).forEach((r,j)=>{
    const d=parseDate(r[id],year); if(!d)return;
    const deb=ideb>=0?Math.abs(money(r[ideb])):0,cred=icred>=0?Math.abs(money(r[icred])):0,rawValue=iv>=0?money(r[iv]):(cred||-deb); if(!rawValue)return;
    const desc=idesc>=0?String(r[idesc]||'Sem descrição'):'Sem descrição';
    const conta=ico>=0?String(r[ico]||'Planilha importada'):'Planilha importada';
    out.push(mk({id:uid(`xls${j}`),data:d,descricao:desc,valor:rawValue,tipo:deb>0&&!cred?'saida':cred>0&&!deb?'entrada':inferType(desc,rawValue,tipoDocumento),conta,origemDocumento:fileName}));
  });
  if(!out.length)throw new Error('Não encontrei lançamentos válidos na planilha.');
  return out;
}

export async function lerDocumentoFinanceiro(file,{tipoDocumento='extrato_bancario',parseCsv,uid}){
  if(!file) return [];
  const name=String(file.name||'arquivo'),ext=(name.split('.').pop()||'').toLowerCase();
  if(ext==='csv') return parseCsv(file);
  if(ext==='pdf') return parsePdf(file,{tipoDocumento,uid});
  if(ext==='ofx'||ext==='qfx'){
    const tx=parseOfxText(await file.text(),{tipoDocumento,fileName:name,uid});
    if(!tx.length)throw new Error('Não encontrei lançamentos neste arquivo OFX/QFX.');
    return tx;
  }
  if(ext==='xls'||ext==='xlsx') return parseSpreadsheet(file,{tipoDocumento,fileName:name,uid});
  if(ext==='txt'){
    const lines=(await file.text()).split(/\r?\n/).filter(Boolean);
    const tx=transactionsFromLines(lines,{tipoDocumento,fileName:name,uid});
    if(!tx.length)throw new Error('Não encontrei lançamentos com data e valor neste arquivo de texto.');
    return tx;
  }
  throw new Error('Formato não suportado. Use CSV, PDF, XLS/XLSX, OFX/QFX ou TXT.');
}
