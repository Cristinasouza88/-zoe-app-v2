export default function financeiroUxFinal(){
  return {
    name:'zoe-financeiro-ux-final',
    enforce:'pre',
    transform(code,id){
      let out=code,changed=false;

      // Migração no App: limpa o financeiro somente DEPOIS que os dados persistidos do usuário foram carregados.
      // Isso corrige o bug em que o reset rodava sobre o estado inicial vazio e, em seguida, os R$ 625 antigos eram restaurados pelo storage.
      if(id.endsWith('/App.jsx')||id.endsWith('App.jsx')){
        const carga="store.get(`zoe:dados:${perfil.email}`).then(dd => {\n        if (!ativo) return;\n        setD(dd ? { ...inicial, ...dd } : {";
        if(out.includes(carga)&&!out.includes('zoe:migracao:financeiro-direto-v3')){
          const nova="store.get(`zoe:dados:${perfil.email}`).then(async dd => {\n        if (!ativo) return;\n        const migrationKey=`zoe:migracao:financeiro-direto-v3:${perfil.email}`;\n        const jaMigrou=await store.get(migrationKey);\n        if(!jaMigrou){\n          if(dd){\n            dd={...dd,financeiro:{...(dd.financeiro||{}),transacoes:[],investimentos:[],ativos:[],compromissos:[],documentos:[],importacoesConciliadas:[],importacaoPendente:null,movimentosPatrimoniais:[],liquidezAtual:0,pontosFinanceiros:0}};\n            await store.set(`zoe:dados:${perfil.email}`,dd);\n          }\n          await store.set(migrationKey,true);\n        }\n        setD(dd ? { ...inicial, ...dd } : {";
          out=out.replace(carga,nova);changed=true;
        }
        return changed?{code:out,map:null}:null;
      }

      if(!id.endsWith('/FinanceiroPlus.jsx')&&!id.endsWith('FinanceiroPlus.jsx')) return null;

      // Remove o reset antigo baseado só em localStorage. Ele podia marcar como concluído antes dos dados reais chegarem.
      const persist=" const persistImp=next=>setImp(prev=>{const v=typeof next==='function'?next(prev):next;importacaoMemoria=v;if(v)salvarConciliacaoPendente(v).catch(()=>{});else limparConciliacaoPendente().catch(()=>{});return v});";
      if(out.includes(persist)&&!out.includes('zoe-fin-reset-ui-removido')){
        out=out.replace(persist,persist+"\n // zoe-fin-reset-ui-removido: o reset agora ocorre no carregamento persistido do App.");changed=true;
      }

      // Receita passa a ser uma porta clicável para TODAS as entradas do mês.
      const receitaCard="<Card style={{background:C.mint}}><small>Receita</small><h3>{formatoMoeda(receita)}</h3></Card>";
      if(out.includes(receitaCard)){
        out=out.replace(receitaCard,"<Card onClick={()=>setSheet({tipo:'categoriaDetalhe',categoria:'Receitas do mês',filtroTipo:'entrada',todasEntradas:true})} style={{background:C.mint,cursor:'pointer'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}><div><small>Receita</small><h3>{formatoMoeda(receita)}</h3></div><ChevronRight size={18} color={C.ink3}/></div></Card>");changed=true;
      }

      // O detalhe de receita mostra todas as entradas, independentemente da categoria sugerida.
      const filtro="(!sheet.filtroTipo||t.tipo===sheet.filtroTipo)&&t.categoria===sheet.categoria&&!t.ignorarResumo";
      if(out.includes(filtro)){
        out=out.split(filtro).join("(sheet.todasEntradas?t.tipo==='entrada':((!sheet.filtroTipo||t.tipo===sheet.filtroTipo)&&t.categoria===sheet.categoria))&&!t.ignorarResumo");changed=true;
      }

      // A importação não deve mais comunicar conciliação mês a mês.
      if(out.includes("{imp?'Continuar conciliação':'Importar'}")){
        out=out.split("{imp?'Continuar conciliação':'Importar'}").join('Importar');changed=true;
      }
      if(out.includes("'Conciliação mês a mês'")){
        out=out.split("'Conciliação mês a mês'").join("'Preenchimento automático por mês'");changed=true;
      }

      if(!changed)console.warn('[zoe-financeiro-ux-final] nenhum ponto aplicado');
      return changed?{code:out,map:null}:null;
    }
  };
}
