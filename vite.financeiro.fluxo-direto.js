export default function financeiroFluxoDireto(){
  return {
    name:'zoe-financeiro-fluxo-direto',
    enforce:'pre',
    transform(code,id){
      if(!id.endsWith('/FinanceiroPlus.jsx')&&!id.endsWith('FinanceiroPlus.jsx')) return null;
      let out=code,changed=false;

      // Quando o CSV traz colunas separadas de crédito/débito, elas têm precedência sobre um campo genérico "valor".
      // Isso evita salário/receitas serem lidos por uma coluna auxiliar incorreta.
      const rawAntigo="rawv=iv>=0?n(c[iv]):(cred||-deb)";
      if(out.includes(rawAntigo)){
        out=out.replace(rawAntigo,"rawv=cred>0?cred:deb>0?-deb:(iv>=0?n(c[iv]):0)");
        changed=true;
      }

      // Substitui a restauração da antiga fila de conciliação por uma migração única que zera os dados financeiros importados.
      const efeitoAntigo=/useEffect\(\(\)=>\{let vivo=true;\(async\(\)=>\{const legado=fin\.importacaoPendente\|\|null;const salvo=importacaoMemoria\|\|legado\|\|await carregarConciliacaoPendente\(\);if\(!vivo\)return;if\(salvo\)\{importacaoMemoria=salvo;setImp\(salvo\);salvarConciliacaoPendente\(salvo\)\.catch\(\(\)=>\{\}\);\}if\(legado\)atualiza\(f=>\(\{\.\.\.f,importacaoPendente:null\}\)\);\}\)\(\);return\(\)=>\{vivo=false\}\},\[\]\);/;
      if(efeitoAntigo.test(out)){
        const novoEfeito=`useEffect(()=>{const chaveReset='zoe-financeiro-fluxo-direto-reset-v1';if(typeof window!=='undefined'&&localStorage.getItem(chaveReset)!=='1'){importacaoMemoria=null;setImp(null);limparConciliacaoPendente().catch(()=>{});atualiza(f=>({...f,transacoes:[],investimentos:[],ativos:[],compromissos:[],documentos:[],importacoesConciliadas:[],importacaoPendente:null,movimentosPatrimoniais:[],liquidezAtual:0,pontosFinanceiros:0}));localStorage.setItem(chaveReset,'1')}} ,[]);`;
        out=out.replace(efeitoAntigo,novoEfeito);changed=true;
      }

      // Fluxo novo: importa tudo direto na competência correta. A revisão/"conciliação" acontece depois no detalhamento de entradas e categorias.
      const prepararRx=/async function preparar\(file\)\{[\s\S]*?\}\n const mesImp=/;
      if(prepararRx.test(out)){
        const novoPreparar=`async function preparar(file){if(!file)return;setProcessando(true);try{let itens=await lerCsv(file);const desc=[...new Set(itens.filter(t=>t.categoria==='Outros').map(t=>norm(t.descricao)).filter(Boolean))].slice(0,300);if(desc.length){try{const r=await classificarDescricoesCsv(desc);if(r.ok&&Array.isArray(r.dados?.categorias)){const m=new Map(r.dados.categorias.filter(x=>Number(x.confianca||0)>=.7).map(x=>[desc[x.id],x.categoria]));itens=itens.map(t=>m.has(norm(t.descricao))?regras({...t,categoria:m.get(norm(t.descricao)),confianca:'INFERIDO'}):t)}}catch(e){console.warn('ZOE: classificação IA indisponível; usando regras locais.',e)}}itens=applyDuplicateDetection(itens,ts).map(t=>corrigirLegado(regras(t)));const validos=itens.filter(t=>!t.duplicado&&t.data&&Number(t.valor||0)>0).map(t=>({...t,statusConciliacao:t.statusConciliacao||'aguardando',revisar:false}));if(!validos.length)throw Error('Nenhum lançamento novo válido encontrado.');let inseridos=0;atualiza(f=>{const existentes=new Set((f.transacoes||[]).map(chave));const novas=validos.filter(t=>{const k=chave(t);if(existentes.has(k))return false;existentes.add(k);return true});inseridos=novas.length;return{...f,transacoes:[...(f.transacoes||[]),...novas],documentos:[...(f.documentos||[]),{id:uid('doc'),nome:file.name,mes:'multiplos',itens:novas.length,data:hoje(),automatico:true}],importacoesConciliadas:[...(f.importacoesConciliadas||[]),{arquivo:file.name,mes:'multiplos',itens:novas.length,data:hoje(),automatico:true}],importacaoPendente:null}});importacaoMemoria=null;setImp(null);await limparConciliacaoPendente().catch(()=>{});const mesesValidos=validos.map(t=>t.competenciaAnalitica||mes(t.data)).filter(Boolean).sort();if(mesesValidos.length)setMesRef(mesesValidos[mesesValidos.length-1]);setTela('resumo');aviso(\`Importação concluída. ${'${'}inseridos||validos.length} lançamento(s) foram distribuídos diretamente nos meses corretos. Revise entradas e gastos nas categorias.\`)}catch(e){aviso(e.message||'Não consegui importar.')}finally{setProcessando(false);if(input.current)input.current.value=''}}
 const mesImp=`;
        out=out.replace(prepararRx,novoPreparar);changed=true;
      }

      // O cartão deixa de representar conciliação mês a mês e passa a ser somente a porta de importação.
      const cardAntigo="<Card onClick={()=>imp?setTela('importacao'):input.current?.click()} style={{cursor:'pointer'}}><Upload/><b style={{display:'block',marginTop:8}}>{imp?'Continuar conciliação':'Importar'}</b><small>{imp?`${pendMeses} mês(es) pendente(s)`:'Conciliação mês a mês'}</small></Card>";
      if(out.includes(cardAntigo)){
        out=out.replace(cardAntigo,"<Card onClick={()=>input.current?.click()} style={{cursor:'pointer'}}><Upload/><b style={{display:'block',marginTop:8}}>Importar</b><small>Preenchimento automático por mês</small></Card>");changed=true;
      }

      // Garante que qualquer estado legado de fila não gere o card azul de pendências.
      const pendCard=/\{imp&&pendMeses>0&&<Card onClick=\{\(\)=>setTela\('importacao'\)\}[\s\S]*?<\/Card>\}/;
      if(pendCard.test(out)){
        out=out.replace(pendCard,'');changed=true;
      }

      if(!changed)console.warn('[zoe-financeiro-fluxo-direto] nenhum ponto de integração encontrado');
      return changed?{code:out,map:null}:null;
    }
  };
}
