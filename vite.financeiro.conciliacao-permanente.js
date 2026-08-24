export default function financeiroConciliacaoPermanente(){
  return {
    name:'zoe-financeiro-conciliacao-permanente',
    enforce:'pre',
    transform(code,id){
      if(!id.endsWith('/FinanceiroPlus.jsx')&&!id.endsWith('FinanceiroPlus.jsx')) return null;
      let out=code,changed=false;

      // O reset de teste precisa limpar tambem a copia local confirmadamente.
      const importUi="import{C,Card,Btn,Campo,Area,Barra,Sheet,hoje}from'./ui.jsx';";
      if(out.includes(importUi)){
        out=out.replace(importUi,"import{store,C,Card,Btn,Campo,Area,Barra,Sheet,hoje}from'./ui.jsx';");
        changed=true;
      }

      // Ao abrir uma categoria, congela os IDs que estavam nela naquele momento.
      // Assim, trocar a categoria durante a conciliacao nao faz o item desaparecer da tela.
      const abrirCategoria="onClick={()=>setSheet({tipo:'lancamentos',modo:'saida',categoria:x.categoria,titulo:x.categoria})}";
      const abrirCategoriaEstavel="onClick={()=>setSheet({tipo:'lancamentos',modo:'saida',categoria:x.categoria,titulo:x.categoria,idsOriginais:doMes.filter(t=>t.tipo==='saida'&&t.categoria===x.categoria&&!t.ignorarResumo).map(t=>t.id)})}";
      if(out.includes(abrirCategoria)){
        out=out.split(abrirCategoria).join(abrirCategoriaEstavel);
        changed=true;
      }

      const filtroAntigo="const itens=doMes.filter(t=>t.tipo===sheet.modo&&(!sheet.categoria||t.categoria===sheet.categoria)&&(sheet.somenteSemImpacto?!!t.ignorarResumo:true));";
      const filtroNovo="const itens=doMes.filter(t=>t.tipo===sheet.modo&&(Array.isArray(sheet.idsOriginais)?sheet.idsOriginais.includes(t.id):(!sheet.categoria||t.categoria===sheet.categoria))&&(sheet.somenteSemImpacto?!!t.ignorarResumo:true));";
      if(out.includes(filtroAntigo)){
        out=out.replace(filtroAntigo,filtroNovo);
        changed=true;
      }

      // Reset EXPLICITO e de uso unico somente para teste. Nao existe migracao, flag persistente
      // ou condicao de limpeza no carregamento normal. A URL e removida assim que local e remoto
      // confirmam o estado vazio, portanto importacoes futuras continuam gravando normalmente.
      const pronto=" const [finRemotoPronto,setFinRemotoPronto]=useState(false);";
      if(out.includes(pronto)&&!out.includes('resetFinanceiroTeste')){
        const reset=`${pronto}\n useEffect(()=>{\n   if(!finRemotoPronto||typeof window==='undefined')return;\n   const u=new URL(window.location.href);\n   if(u.searchParams.get('resetFinanceiroTeste')!=='1')return;\n   let ativo=true;\n   (async()=>{\n     try{\n       const limpo={...fin,transacoes:[],documentos:[],importacoesConciliadas:[],importacaoPendente:null};\n       const remoto=await salvarFinanceiroRemoto(limpo);\n       if(!ativo)return;\n       if(!remoto?.ok||Number(remoto.transacoes)!==0)throw new Error('O servidor nao confirmou a limpeza para o teste.');\n       const appLimpo={...d,financeiro:limpo};\n       const email=d?.perfil?.email;\n       if(email)await store.set(\`zoe:dados:\${email}\`,appLimpo);\n       if(!ativo)return;\n       up(()=>appLimpo);\n       importacaoMemoria=null;\n       setImp(null);\n       await limparConciliacaoPendente().catch(()=>{});\n       u.searchParams.delete('resetFinanceiroTeste');\n       window.history.replaceState({},'',u.toString());\n       aviso('Dados importados removidos. Financeiro pronto para um novo teste.');\n     }catch(e){\n       console.error('ZOE reset financeiro de teste',e);\n       if(ativo)aviso(e.message||'Nao consegui limpar os dados para o teste.');\n     }\n   })();\n   return()=>{ativo=false};\n },[finRemotoPronto]);`;
        out=out.replace(pronto,reset);
        changed=true;
      }

      if(!changed)console.warn('[zoe-financeiro-conciliacao-permanente] nenhum ponto aplicado');
      return changed?{code:out,map:null}:null;
    }
  };
}
