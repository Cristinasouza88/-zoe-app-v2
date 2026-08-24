export default function financeiroFluxoDireto(){
  return {
    name:'zoe-financeiro-fluxo-direto',
    enforce:'pre',
    transform(code,id){
      if(!id.endsWith('/FinanceiroPlus.jsx')&&!id.endsWith('FinanceiroPlus.jsx')) return null;
      let out=code,changed=false;

      // Dependencia dedicada: o Financeiro passa a ter persistencia remota propria.
      if(!out.includes("from './financeiro.remote-store.js'")){
        const ancora="import{salvarConciliacaoPendente,carregarConciliacaoPendente,limparConciliacaoPendente}from'./financeiro.importacaoStore.js';";
        if(out.includes(ancora)){
          out=out.replace(ancora,ancora+"\nimport{carregarFinanceiroRemoto,salvarFinanceiroRemoto}from'./financeiro.remote-store.js';");
          changed=true;
        }
      }

      // CSV com credito/debito separado: essas colunas vencem o campo valor generico.
      const rawAntigo="rawv=iv>=0?n(c[iv]):(cred||-deb)";
      if(out.includes(rawAntigo)){
        out=out.replace(rawAntigo,"rawv=cred>0?cred:deb>0?-deb:(iv>=0?n(c[iv]):0)");
        changed=true;
      }

      // IMPORTANTE: nao deduplicar a colecao exibida. Duas compras iguais sao duas linhas reais.
      // A protecao contra reimportacao acontece pelo importKey na entrada do CSV, nao na visualizacao.
      const tsAntigo=" const ts=useMemo(()=>{const s=new Set();return(fin.transacoes||[]).map(corrigirLegado).filter(t=>{const k=chave(t);if(s.has(k))return false;s.add(k);return true})},[fin.transacoes]);";
      if(out.includes(tsAntigo)){
        out=out.replace(tsAntigo," const ts=useMemo(()=>(fin.transacoes||[]).map(corrigirLegado),[fin.transacoes]);");
        changed=true;
      }

      // Servidor e a fonte canonica do Financeiro. O estado do App continua sendo atualizado para a UI,
      // mas cada alteracao tambem e persistida na base remota dedicada.
      const estadoAntigo=" const fin={...vazio,...(d.financeiro||{})};const atualiza=fn=>up(s=>({...s,financeiro:fn({...vazio,...(s.financeiro||{})})}));";
      if(out.includes(estadoAntigo)){
        const estadoNovo=` const fin={...vazio,...(d.financeiro||{})};\n const [finRemotoPronto,setFinRemotoPronto]=useState(false);\n const atualiza=fn=>up(s=>{const base={...vazio,...(s.financeiro||{})},next=fn(base);salvarFinanceiroRemoto(next).catch(e=>{console.error('ZOE Financeiro: falha ao salvar alteracao',e);aviso('Nao consegui gravar a alteracao no servidor. Tente novamente.')});return{...s,financeiro:next}});\n useEffect(()=>{let vivo=true;(async()=>{try{const remoto=await carregarFinanceiroRemoto();if(!vivo)return;if(remoto&&Array.isArray(remoto.transacoes)){up(s=>({...s,financeiro:{...vazio,...remoto}}))}}catch(e){console.error('ZOE Financeiro: falha ao restaurar do servidor',e);if(vivo)aviso('Financeiro nao conseguiu carregar do servidor.')}finally{if(vivo)setFinRemotoPronto(true)}})();return()=>{vivo=false}},[]);`;
        out=out.replace(estadoAntigo,estadoNovo);changed=true;
      }

      // Fluxo definitivo de importacao: todas as linhas validas entram imediatamente no mes correto.
      // A conciliacao e somente um status posterior no detalhamento, nunca uma barreira de importacao.
      const prepararRx=/async function preparar\(file\)\{[\s\S]*?\}\n const mesImp=/;
      if(prepararRx.test(out)){
        const novoPreparar=`async function preparar(file){if(!file)return;if(!finRemotoPronto)return aviso('Aguarde o Financeiro terminar de carregar antes de importar.');setProcessando(true);try{let itens=await lerCsv(file);const lidas=itens.length;const desc=[...new Set(itens.filter(t=>t.categoria==='Outros').map(t=>norm(t.descricao)).filter(Boolean))].slice(0,500);if(desc.length){try{const r=await classificarDescricoesCsv(desc);if(r.ok&&Array.isArray(r.dados?.categorias)){const m=new Map(r.dados.categorias.filter(x=>Number(x.confianca||0)>=.7).map(x=>[desc[x.id],x.categoria]));itens=itens.map(t=>m.has(norm(t.descricao))?regras({...t,categoria:m.get(norm(t.descricao)),confianca:'INFERIDO'}):t)}}catch(e){console.warn('ZOE: classificacao IA indisponivel; regras locais mantidas.',e)}}const baseKey=t=>[t.data,norm(t.descricao),Number(t.valor||0).toFixed(2),t.tipo,norm(t.conta),norm(t.origemDocumento||file.name)].join('|');const ocorr=new Map();const processados=itens.map(t=>corrigirLegado(regras(t))).map(t=>{const b=baseKey(t),o=(ocorr.get(b)||0)+1;ocorr.set(b,o);return{...t,importKey:b+'|'+o,statusConciliacao:t.statusConciliacao||'aguardando',revisar:false}});const semData=processados.filter(t=>!t.data).length,semValor=processados.filter(t=>!Number(t.valor||0)).length;const validos=processados.filter(t=>t.data&&Number(t.valor||0)>0);if(!validos.length)throw Error('Nenhum lancamento valido encontrado no CSV.');const existentes=new Set((fin.transacoes||[]).map(t=>t.importKey).filter(Boolean));const novas=[],jaExistentes=[];for(const t of validos){if(existentes.has(t.importKey)){jaExistentes.push(t);continue}novas.push(t);existentes.add(t.importKey)}if(!novas.length)throw Error('Todos os lancamentos validos deste arquivo ja estao no Financeiro.');const novoFin={...fin,transacoes:[...(fin.transacoes||[]),...novas],documentos:[...(fin.documentos||[]),{id:uid('doc'),nome:file.name,mes:'multiplos',itens:novas.length,data:hoje(),automatico:true}],importacoesConciliadas:[...(fin.importacoesConciliadas||[]),{arquivo:file.name,mes:'multiplos',itens:novas.length,data:hoje(),automatico:true}],importacaoPendente:null};const confirmacao=await salvarFinanceiroRemoto(novoFin);if(!confirmacao?.ok)throw Error('O servidor nao confirmou a gravacao do Financeiro.');up(s=>({...s,financeiro:novoFin}));importacaoMemoria=null;setImp(null);await limparConciliacaoPendente().catch(()=>{});const meses=[...new Set(novas.map(t=>t.competenciaAnalitica||mes(t.data)).filter(Boolean))].sort();const ultimo=meses[meses.length-1];if(ultimo)setMesRef(ultimo);setTela('resumo');const entradas=novas.filter(t=>t.tipo==='entrada'&&!t.ignorarResumo).length,saidas=novas.filter(t=>t.tipo==='saida'&&!t.ignorarResumo).length,semImpacto=novas.filter(t=>t.ignorarResumo).length;aviso(\`GRAVADO NO SERVIDOR: ${'${'}novas.length}/${'${'}lidas} lancamentos • ${'${'}entradas} entradas • ${'${'}saidas} despesas • ${'${'}semImpacto} sem impacto • ${'${'}jaExistentes.length} ja existentes${'${'}semData||semValor?` • ${semData} sem data • ${semValor} sem valor`:''}.\`)}catch(e){console.error('ZOE importacao financeira',e);aviso(e.message||'Nao consegui importar e gravar.')}finally{setProcessando(false);if(input.current)input.current.value=''}}\n const mesImp=`;
        out=out.replace(prepararRx,novoPreparar);changed=true;
      }

      const cardAntigo="<Card onClick={()=>imp?setTela('importacao'):input.current?.click()} style={{cursor:'pointer'}}><Upload/><b style={{display:'block',marginTop:8}}>{imp?'Continuar conciliação':'Importar'}</b><small>{imp?`${pendMeses} mês(es) pendente(s)`:'Conciliação mês a mês'}</small></Card>";
      if(out.includes(cardAntigo)){
        out=out.replace(cardAntigo,"<Card onClick={()=>finRemotoPronto&&input.current?.click()} style={{cursor:finRemotoPronto?'pointer':'wait',opacity:finRemotoPronto?1:.6}}><Upload/><b style={{display:'block',marginTop:8}}>{finRemotoPronto?'Importar':'Carregando...'}</b><small>Preencher todos os meses</small></Card>");changed=true;
      }

      const pendCard=/\{imp&&pendMeses>0&&<Card onClick=\{\(\)=>setTela\('importacao'\)\}[\s\S]*?<\/Card>\}/;
      if(pendCard.test(out)){out=out.replace(pendCard,'');changed=true;}

      if(!changed)console.warn('[zoe-financeiro-fluxo-direto] nenhum ponto aplicado');
      return changed?{code:out,map:null}:null;
    }
  };
}
