export default function financeiroPatch(){
  return {
    name:'zoe-financeiro-conciliacao-parcial',
    enforce:'pre',
    transform(code,id){
      if(!id.endsWith('/FinanceiroPlus.jsx')&&!id.endsWith('FinanceiroPlus.jsx')) return null;
      let out=code;

      const blocoFuncoes=/ const mesImp=imp\?\.meses\?\.\[imp\.indice\],pend=mesImp\?\.itens\?\.filter\(t=>t\.revisar&&!t\.duplicado\)\|\|\[\];[\s\S]*? const concluirImportacao=/;
      const novoBloco=` const mesImp=imp?.meses?.[imp.indice],pend=mesImp?.itens?.filter(t=>t.revisar&&!t.duplicado)||[],prontos=mesImp?.itens?.filter(t=>!t.revisar&&!t.duplicado)||[];
 const gravarLancamentos=(itens,mesAlvo,parcial=false)=>{const novas=(itens||[]).map(corrigirLegado);atualiza(f=>{const existentes=new Set((f.transacoes||[]).map(chave)),realmenteNovas=novas.filter(t=>{const k=chave(t);if(existentes.has(k))return false;existentes.add(k);return true});return{...f,transacoes:[...(f.transacoes||[]),...realmenteNovas],documentos:[...(f.documentos||[]),{id:uid('doc'),nome:imp?.arquivo||'Importação',mes:mesAlvo,itens:realmenteNovas.length,data:hoje(),parcial}],importacoesConciliadas:[...(f.importacoesConciliadas||[]),{arquivo:imp?.arquivo||'Importação',mes:mesAlvo,itens:realmenteNovas.length,data:hoje(),parcial}],importacaoPendente:null}})};
 const montarFilaAposRemocao=(base,indice,itensRestantes,etapaPreferida='conciliacao')=>{let meses=(base?.meses||[]).map((m,i)=>i===indice?{...m,itens:itensRestantes,status:'aguardando'}:m);if(!itensRestantes.length)meses=meses.filter((_,i)=>i!==indice);if(!meses.length)return{...base,meses:[],indice:0,etapa:'finalizado'};const novoIndice=Math.min(indice,meses.length-1);return{...base,meses,indice:novoIndice,etapa:itensRestantes.length?etapaPreferida:'meses'}};
 const enviarItemResolvido=id=>{const atual=importacaoMemoria||imp;if(!atual)return;let mi=-1,item=null;(atual.meses||[]).some((m,i)=>{const achou=(m.itens||[]).find(t=>t.id===id);if(achou){mi=i;item=achou;return true}return false});if(!item||item.revisar||item.duplicado)return;gravarLancamentos([item],atual.meses[mi].mes,true);const restantes=(atual.meses[mi].itens||[]).filter(t=>t.id!==id&&t.revisar&&!t.duplicado);const next=montarFilaAposRemocao(atual,mi,restantes,restantes.length?'conciliacao':'meses');importacaoMemoria=next;setImp(next);salvarConciliacaoPendente(next).catch(()=>{});setMesRef(atual.meses[mi].mes)};
 const resolver=(id,categoria)=>{let deveEnviar=false;persistImp(o=>({...o,meses:o.meses.map((m,i)=>i!==o.indice?m:{...m,itens:m.itens.map(t=>{if(t.id!==id)return t;const z=regras({...t,categoria,confianca:'CONFIRMADO_MANUAL'}),final={...z,revisar:Boolean(z.possivelDuplicado)||z.categoria==='Outros'};deveEnviar=!final.revisar&&!final.duplicado;return final})})}));if(deveEnviar)setTimeout(()=>enviarItemResolvido(id),0)};
 const resolverDuplicado=(id,acao)=>{if(acao==='ignorar'){const atual=importacaoMemoria||imp;if(!atual)return;const m=atual.meses?.[atual.indice];if(!m)return;const restantes=(m.itens||[]).filter(t=>t.id!==id);const next=montarFilaAposRemocao(atual,atual.indice,restantes.filter(t=>t.revisar&&!t.duplicado),restantes.length?'conciliacao':'meses');importacaoMemoria=next;setImp(next);salvarConciliacaoPendente(next).catch(()=>{});return}let deveEnviar=false;persistImp(o=>({...o,meses:o.meses.map((m,i)=>i!==o.indice?m:{...m,itens:m.itens.map(t=>{if(t.id!==id)return t;const z=regras({...t,duplicado:false,possivelDuplicado:false,duplicadoStatus:'kept',confianca:t.categoria==='Outros'?'A_REVISAR':'CONFIRMADO_MANUAL'}),final={...z,revisar:z.categoria==='Outros'};deveEnviar=!final.revisar;return final})})}));if(deveEnviar)setTimeout(()=>enviarItemResolvido(id),0)};
 const enviarProntos=()=>{if(!mesImp||confirmando)return;const enviar=(mesImp.itens||[]).filter(t=>!t.revisar&&!t.duplicado);if(!enviar.length)return aviso(pend.length?\`Ainda faltam \${pend.length} pendência(s) neste mês.\`:'Não há lançamentos prontos para enviar.');setConfirmando(true);try{gravarLancamentos(enviar,mesImp.mes,pend.length>0);const restantes=(mesImp.itens||[]).filter(t=>t.revisar&&!t.duplicado);const next=montarFilaAposRemocao(imp,imp.indice,restantes,restantes.length?'conciliacao':'meses');importacaoMemoria=next;setImp(next);salvarConciliacaoPendente(next).catch(()=>{});setMesRef(mesImp.mes);if(restantes.length){setTela('importacao');aviso(\`\${enviar.length} lançamento(s) enviados. Ficou só \${restantes.length} pendência(s) em \${mesLabel(mesImp.mes)}.\`)}else{setTela(next.etapa==='finalizado'?'importacao':'resumo');aviso(\`\${mesLabel(mesImp.mes)} enviado e retirado da fila de conciliação.\`)}}catch(e){aviso(e.message||'Não consegui enviar os lançamentos conciliados.')}finally{setConfirmando(false)}};
 const confirmarMes=enviarProntos;
 const concluirImportacao=`;
      if(!blocoFuncoes.test(out)) throw new Error('Patch financeiro: bloco de conciliação não encontrado');
      out=out.replace(blocoFuncoes,novoBloco);

      const listaAntiga='mesImp.itens.filter(t=>!t.duplicado).slice(0,120).map';
      if(!out.includes(listaAntiga)) throw new Error('Patch financeiro: lista de itens não encontrada');
      out=out.replace(listaAntiga,'pend.slice(0,120).map');

      const botaoRegex=/<Btn onClick=\{confirmarMes\} disabled=\{pend\.length>0\|\|confirmando\} style=\{\{width:'100%',marginTop:12\}\}>\{confirmando\?'Confirmando\.\.\.':`Finalizar e lançar em \$\{mesLabel\(mesImp\.mes\)\}`\}<\/Btn>/;
      if(!botaoRegex.test(out)) throw new Error('Patch financeiro: botão final não encontrado');
      out=out.replace(botaoRegex,`<Card style={{marginTop:12,background:'#F7F3FF'}}><div style={{fontSize:12,color:C.ink2}}><b>{prontos.length}</b> lançamento(s) já conciliado(s) podem ser enviados agora.</div>{pend.length>0&&<div style={{fontSize:11,color:'#92400E',marginTop:4}}>As {pend.length} pendência(s) ficam guardadas e serão as únicas exibidas quando você voltar para este mês.</div>}</Card><Btn onClick={enviarProntos} disabled={prontos.length===0||confirmando} style={{width:'100%',marginTop:10}}>{confirmando?'Enviando...':pend.length>0?\`Enviar \${prontos.length} conciliado(s) e deixar \${pend.length} pendente(s)\`:\`Finalizar e lançar em \${mesLabel(mesImp.mes)}\`}</Btn>`);

      return {code:out,map:null};
    }
  };
}
