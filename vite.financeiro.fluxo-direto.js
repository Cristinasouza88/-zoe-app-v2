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

      const prepararRx=/async function preparar\(file\)\{[\s\S]*?\}\n const mesImp=/;
      if(prepararRx.test(out)){
        const novoPreparar=`async function preparar(file){if(!file)return;setProcessando(true);try{let itens=await lerCsv(file);const desc=[...new Set(itens.filter(t=>t.categoria==='Outros').map(t=>norm(t.descricao)).filter(Boolean))].slice(0,300);if(desc.length){try{const r=await classificarDescricoesCsv(desc);if(r.ok&&Array.isArray(r.dados?.categorias)){const m=new Map(r.dados.categorias.filter(x=>Number(x.confianca||0)>=.7).map(x=>[desc[x.id],x.categoria]));itens=itens.map(t=>m.has(norm(t.descricao))?regras({...t,categoria:m.get(norm(t.descricao)),confianca:'INFERIDO'}):t)}}catch(e){console.warn('ZOE: classificação IA indisponível; usando regras locais.',e)}}const validos=itens.map(t=>corrigirLegado(regras(t))).filter(t=>t.data&&Number(t.valor||0)>0);if(!validos.length)throw Error('Nenhum lançamento válido encontrado no CSV.');const existentes=new Set(ts.map(chave)),novas=[];for(const t of validos){const k=chave(t);if(existentes.has(k))continue;existentes.add(k);novas.push({...t,statusConciliacao:t.statusConciliacao||'aguardando',revisar:false})}if(!novas.length)throw Error('Este arquivo não possui lançamentos novos; os registros já estão no Financeiro.');atualiza(f=>({...f,transacoes:[...(f.transacoes||[]),...novas],documentos:[...(f.documentos||[]),{id:uid('doc'),nome:file.name,mes:'multiplos',itens:novas.length,data:hoje(),automatico:true}],importacoesConciliadas:[...(f.importacoesConciliadas||[]),{arquivo:file.name,mes:'multiplos',itens:novas.length,data:hoje(),automatico:true}],importacaoPendente:null}));importacaoMemoria=null;setImp(null);await limparConciliacaoPendente().catch(()=>{});const meses=[...new Set(novas.map(t=>t.competenciaAnalitica||mes(t.data)).filter(Boolean))].sort();const ultimo=meses[meses.length-1];if(ultimo)setMesRef(ultimo);setTela('resumo');const entradas=novas.filter(t=>t.tipo==='entrada'&&!t.ignorarResumo).length,saidas=novas.filter(t=>t.tipo==='saida'&&!t.ignorarResumo).length;aviso(\`Importação concluída: ${'${'}novas.length} lançamentos • ${'${'}entradas} entradas • ${'${'}saidas} despesas.\`)}catch(e){aviso(e.message||'Não consegui importar.')}finally{setProcessando(false);if(input.current)input.current.value=''}}
 const mesImp=`;
        out=out.replace(prepararRx,novoPreparar);changed=true;
      }

      const cardAntigo="<Card onClick={()=>imp?setTela('importacao'):input.current?.click()} style={{cursor:'pointer'}}><Upload/><b style={{display:'block',marginTop:8}}>{imp?'Continuar conciliação':'Importar'}</b><small>{imp?`${pendMeses} mês(es) pendente(s)`:'Conciliação mês a mês'}</small></Card>";
      if(out.includes(cardAntigo)){
        out=out.replace(cardAntigo,"<Card onClick={()=>input.current?.click()} style={{cursor:'pointer'}}><Upload/><b style={{display:'block',marginTop:8}}>Importar</b><small>Preenchimento automático por mês</small></Card>");changed=true;
      }

      const pendCard=/\{imp&&pendMeses>0&&<Card onClick=\{\(\)=>setTela\('importacao'\)\}[\s\S]*?<\/Card>\}/;
      if(pendCard.test(out)){out=out.replace(pendCard,'');changed=true;}

      if(!changed)console.warn('[zoe-financeiro-fluxo-direto] nenhum ponto aplicado');
      return changed?{code:out,map:null}:null;
    }
  };
}
