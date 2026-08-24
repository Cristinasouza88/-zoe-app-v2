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

      // Persistência dedicada do Financeiro: não depende do objeto gigante do app.
      const estado=" const fin={...vazio,...(d.financeiro||{})};const atualiza=fn=>up(s=>({...s,financeiro:fn({...vazio,...(s.financeiro||{})})}));";
      if(out.includes(estado)&&!out.includes('zoe:financeiro:v3:')){
        const novo=` const financeKey='zoe:financeiro:v3:'+(d?.perfil?.email||'local');\n const compactarFinanceiro=f=>({...f,transacoes:(f.transacoes||[]).map(t=>({id:t.id,data:t.data,descricao:t.descricao,valor:t.valor,tipo:t.tipo,conta:t.conta,categoria:t.categoria,subcategoria:t.subcategoria||'',natureza:t.natureza,competenciaAnalitica:t.competenciaAnalitica,impactoReceita:t.impactoReceita,impactoDespesa:t.impactoDespesa,ignorarResumo:!!t.ignorarResumo,statusConciliacao:t.statusConciliacao||'aguardando',origemDocumento:t.origemDocumento||'',confianca:t.confianca||''}))});\n const salvarFinanceiroLocal=f=>{try{localStorage.setItem(financeKey,JSON.stringify(compactarFinanceiro(f)));return true}catch(e){console.error('ZOE financeiro: falha ao persistir',e);return false}};\n const fin={...vazio,...(d.financeiro||{})};const atualiza=fn=>up(s=>{const base={...vazio,...(s.financeiro||{})},next=fn(base);salvarFinanceiroLocal(next);return{...s,financeiro:next}});\n useEffect(()=>{try{const raw=localStorage.getItem(financeKey);if(!raw)return;const salvo=JSON.parse(raw);if(!salvo||!Array.isArray(salvo.transacoes))return;const atual=(d.financeiro?.transacoes||[]).length;if(salvo.transacoes.length>=atual)up(s=>({...s,financeiro:{...vazio,...(s.financeiro||{}),...salvo}}))}catch(e){console.warn('ZOE financeiro: não consegui restaurar',e)}},[financeKey]);`;
        out=out.replace(estado,novo);changed=true;
      }

      const prepararRx=/async function preparar\(file\)\{[\s\S]*?\}\n const mesImp=/;
      if(prepararRx.test(out)){
        const novoPreparar=`async function preparar(file){if(!file)return;setProcessando(true);try{let itens=await lerCsv(file);const lidas=itens.length;const desc=[...new Set(itens.filter(t=>t.categoria==='Outros').map(t=>norm(t.descricao)).filter(Boolean))].slice(0,500);if(desc.length){try{const r=await classificarDescricoesCsv(desc);if(r.ok&&Array.isArray(r.dados?.categorias)){const m=new Map(r.dados.categorias.filter(x=>Number(x.confianca||0)>=.7).map(x=>[desc[x.id],x.categoria]));itens=itens.map(t=>m.has(norm(t.descricao))?regras({...t,categoria:m.get(norm(t.descricao)),confianca:'INFERIDO'}):t)}}catch(e){console.warn('ZOE: classificação IA indisponível; usando regras locais.',e)}}const processados=itens.map(t=>corrigirLegado(regras(t))).map(t=>({...t,statusConciliacao:t.statusConciliacao||'aguardando',revisar:false}));const semData=processados.filter(t=>!t.data).length,semValor=processados.filter(t=>!Number(t.valor||0)).length;const validos=processados.filter(t=>t.data&&Number(t.valor||0)>0);if(!validos.length)throw Error('Nenhum lançamento válido encontrado no CSV.');const existentes=new Set(ts.map(chave)),novas=[],duplicadas=[];for(const t of validos){const k=chave(t);if(existentes.has(k)){duplicadas.push(t);continue}existentes.add(k);novas.push(t)}if(!novas.length)throw Error('Todos os lançamentos válidos deste arquivo já existem no Financeiro.');let gravado=null;atualiza(f=>{gravado={...f,transacoes:[...(f.transacoes||[]),...novas],documentos:[...(f.documentos||[]),{id:uid('doc'),nome:file.name,mes:'multiplos',itens:novas.length,data:hoje(),automatico:true}],importacoesConciliadas:[...(f.importacoesConciliadas||[]),{arquivo:file.name,mes:'multiplos',itens:novas.length,data:hoje(),automatico:true}],importacaoPendente:null};return gravado});if(gravado&&!salvarFinanceiroLocal(gravado))throw Error('Os lançamentos apareceram, mas o navegador não conseguiu gravá-los.');importacaoMemoria=null;setImp(null);await limparConciliacaoPendente().catch(()=>{});const porMes=novas.reduce((a,t)=>{const m=t.competenciaAnalitica||mes(t.data);if(m)(a[m]||=[]).push(t);return a},{});const meses=Object.keys(porMes).sort();const ultimo=meses[meses.length-1];if(ultimo)setMesRef(ultimo);setTela('resumo');const entradas=novas.filter(t=>t.tipo==='entrada'&&!t.ignorarResumo).length,saidas=novas.filter(t=>t.tipo==='saida'&&!t.ignorarResumo).length;aviso(\`Gravado: ${'${'}novas.length}/${'${'}lidas} linhas • ${'${'}entradas} entradas • ${'${'}saidas} despesas • ${'${'}duplicadas.length} duplicada(s) ignorada(s)${'${'}semData||semValor?` • ${semData} sem data • ${semValor} sem valor`:''}.\`)}catch(e){aviso(e.message||'Não consegui importar.')}finally{setProcessando(false);if(input.current)input.current.value=''}}\n const mesImp=`;
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
