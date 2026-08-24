export default function financeiroFluxoDireto(){
  return {
    name:'zoe-financeiro-fluxo-direto',
    enforce:'pre',
    transform(code,id){
      if(!id.endsWith('/FinanceiroPlus.jsx')&&!id.endsWith('FinanceiroPlus.jsx')) return null;
      let out=code,changed=false;

      const rawAntigo="rawv=iv>=0?n(c[iv]):(cred||-deb)";
      if(out.includes(rawAntigo)){
        out=out.replace(rawAntigo,"rawv=cred>0?cred:deb>0?-deb:(iv>=0?n(c[iv]):0)");
        changed=true;
      }

      // Remove a persistencia paralela antiga do Financeiro. A fonte unica passa a ser o store global (IndexedDB).
      const persistRx=/ const financeKey='zoe:financeiro:v3:'[\s\S]*?\},\[financeKey\]\);/;
      if(persistRx.test(out)){
        out=out.replace(persistRx," const fin={...vazio,...(d.financeiro||{})};const atualiza=fn=>up(s=>({...s,financeiro:fn({...vazio,...(s.financeiro||{})})}));");
        changed=true;
      }

      const prepararRx=/async function preparar\(file\)\{[\s\S]*?\}\n const mesImp=/;
      if(prepararRx.test(out)){
        const novoPreparar=`async function preparar(file){if(!file)return;setProcessando(true);try{let itens=await lerCsv(file);const lidas=itens.length;const desc=[...new Set(itens.filter(t=>t.categoria==='Outros').map(t=>norm(t.descricao)).filter(Boolean))].slice(0,500);if(desc.length){try{const r=await classificarDescricoesCsv(desc);if(r.ok&&Array.isArray(r.dados?.categorias)){const m=new Map(r.dados.categorias.filter(x=>Number(x.confianca||0)>=.7).map(x=>[desc[x.id],x.categoria]));itens=itens.map(t=>m.has(norm(t.descricao))?regras({...t,categoria:m.get(norm(t.descricao)),confianca:'INFERIDO'}):t)}}catch(e){console.warn('ZOE: classificacao IA indisponivel; usando regras locais.',e)}}const baseKey=t=>[t.data,norm(t.descricao),Number(t.valor||0).toFixed(2),t.tipo,norm(t.conta)].join('|');const ocorr=new Map();const processados=itens.map(t=>corrigirLegado(regras(t))).map(t=>{const b=baseKey(t),o=(ocorr.get(b)||0)+1;ocorr.set(b,o);return{...t,importKey:b+'|'+o,statusConciliacao:t.statusConciliacao||'aguardando',revisar:false}});const semData=processados.filter(t=>!t.data).length,semValor=processados.filter(t=>!Number(t.valor||0)).length;const validos=processados.filter(t=>t.data&&Number(t.valor||0)>0);if(!validos.length)throw Error('Nenhum lancamento valido encontrado no CSV.');const existentesImport=new Set(ts.map(t=>t.importKey).filter(Boolean));const legadoContagem=new Map();ts.filter(t=>!t.importKey).forEach(t=>{const b=baseKey(t);legadoContagem.set(b,(legadoContagem.get(b)||0)+1)});const novas=[],duplicadas=[];for(const t of validos){if(existentesImport.has(t.importKey)){duplicadas.push(t);continue}const b=baseKey(t),oc=Number(String(t.importKey).split('|').at(-1)||1),leg=legadoContagem.get(b)||0;if(leg>=oc){duplicadas.push(t);continue}novas.push(t);existentesImport.add(t.importKey)}if(!novas.length)throw Error('Todos os lancamentos validos deste arquivo ja existem no Financeiro.');atualiza(f=>({...f,transacoes:[...(f.transacoes||[]),...novas],documentos:[...(f.documentos||[]),{id:uid('doc'),nome:file.name,mes:'multiplos',itens:novas.length,data:hoje(),automatico:true}],importacoesConciliadas:[...(f.importacoesConciliadas||[]),{arquivo:file.name,mes:'multiplos',itens:novas.length,data:hoje(),automatico:true}],importacaoPendente:null}));importacaoMemoria=null;setImp(null);await limparConciliacaoPendente().catch(()=>{});const meses=[...new Set(novas.map(t=>t.competenciaAnalitica||mes(t.data)).filter(Boolean))].sort();const ultimo=meses[meses.length-1];if(ultimo)setMesRef(ultimo);setTela('resumo');const entradas=novas.filter(t=>t.tipo==='entrada'&&!t.ignorarResumo).length,saidas=novas.filter(t=>t.tipo==='saida'&&!t.ignorarResumo).length;aviso(\`Importados ${'${'}novas.length}/${'${'}lidas} lancamentos • ${'${'}entradas} entradas • ${'${'}saidas} despesas • ${'${'}duplicadas.length} ja existentes${'${'}semData||semValor?` • ${semData} sem data • ${semValor} sem valor`:''}.\`)}catch(e){aviso(e.message||'Nao consegui importar.')}finally{setProcessando(false);if(input.current)input.current.value=''}}\n const mesImp=`;
        out=out.replace(prepararRx,novoPreparar);changed=true;
      }

      const cardAntigo="<Card onClick={()=>imp?setTela('importacao'):input.current?.click()} style={{cursor:'pointer'}}><Upload/><b style={{display:'block',marginTop:8}}>{imp?'Continuar conciliação':'Importar'}</b><small>{imp?`${pendMeses} mês(es) pendente(s)`:'Conciliação mês a mês'}</small></Card>";
      if(out.includes(cardAntigo)){
        out=out.replace(cardAntigo,"<Card onClick={()=>input.current?.click()} style={{cursor:'pointer'}}><Upload/><b style={{display:'block',marginTop:8}}>Importar</b><small>Preencher todos os meses</small></Card>");changed=true;
      }

      const pendCard=/\{imp&&pendMeses>0&&<Card onClick=\{\(\)=>setTela\('importacao'\)\}[\s\S]*?<\/Card>\}/;
      if(pendCard.test(out)){out=out.replace(pendCard,'');changed=true;}

      if(!changed)console.warn('[zoe-financeiro-fluxo-direto] nenhum ponto aplicado');
      return changed?{code:out,map:null}:null;
    }
  };
}
