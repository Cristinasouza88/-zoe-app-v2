export default function financeiroRebuildLimpo(){
  return {
    name:'zoe-financeiro-rebuild-limpo',
    enforce:'pre',
    transform(code,id){
      if(!id.endsWith('/FinanceiroPlus.jsx')&&!id.endsWith('FinanceiroPlus.jsx')) return null;
      let out=code,changed=false;

      // Depois de concluir a trilha, escondemos todo o Financeiro legado.
      // Os dados continuam preservados; apenas a interface antiga fica fora do fluxo
      // enquanto a nova experiência é reconstruída a partir da trilha aprovada.
      const ini=out.indexOf(" if(concluida)return <div style={{margin:'-18px -16px 0'");
      const fim=ini>=0?out.indexOf('\n\n let conteudo=null;',ini):-1;
      if(ini>=0&&fim>ini){
        const limpo=` if(concluida)return <div style={{margin:'-18px -16px 0',padding:'42px 22px 110px',minHeight:'100vh',background:'linear-gradient(180deg,#FFFFFF 0%,#FBFAFF 100%)'}}><div style={{maxWidth:420,margin:'0 auto'}}><div style={{width:86,height:86,borderRadius:'42% 58% 55% 45%',margin:'10px auto 22px',background:'linear-gradient(135deg,#E5C8FF,#C9F3E2 58%,#FFF0B8)',boxShadow:'0 16px 36px rgba(92,61,172,.12)'}}/><div style={{fontSize:10,fontWeight:900,letterSpacing:.7,color:'#6D45E8',textAlign:'center',marginBottom:8}}>BASE FINANCEIRA SALVA</div><h1 style={{textAlign:'center',fontSize:25,lineHeight:1.12,margin:'0 0 10px',color:'#15152C'}}>Sua trilha está pronta.</h1><p style={{textAlign:'center',fontSize:12.5,color:'#666879',lineHeight:1.5,margin:'0 auto 24px',maxWidth:320}}>O restante do Financeiro foi temporariamente retirado para ser reconstruído do zero a partir dos dados que você definiu aqui.</p><div style={{padding:14,border:'1px solid #E9E5F5',borderRadius:15,background:'#fff',marginBottom:12}}><b style={{fontSize:12,color:'#232338'}}>O que foi preservado</b><div style={{fontSize:10.5,color:'#727486',lineHeight:1.55,marginTop:7}}>Receitas base, despesas base, reserva e investimentos, patrimônio e dívidas, metas e o seu ponto zero financeiro.</div></div><div style={{padding:14,border:'1px solid #E7EFEA',borderRadius:15,background:'#F8FCF9',marginBottom:18}}><b style={{fontSize:12,color:'#1F6C43'}}>Próxima etapa</b><div style={{fontSize:10.5,color:'#66756D',lineHeight:1.55,marginTop:7}}>Vamos reconstruir dashboard, lançamentos, compromissos patrimoniais, evolução de obra, importações e regras de cálculo sem reaproveitar a interface antiga.</div></div><button type="button" onClick={()=>{setPlanoDraft({...planoDraft,...(fin.planoFinanceiro||{})});setPassoPlano(1);atualiza(f=>({...f,planoFinanceiro:{...(f.planoFinanceiro||{}),concluida:false,passo:1}}));}} style={{width:'100%',border:'1.5px solid #BDAEF1',borderRadius:12,padding:12,background:'#fff',color:'#6943D8',fontWeight:900,fontSize:10}}>EDITAR MINHA TRILHA</button></div></div>;`;
        out=out.slice(0,ini)+limpo+out.slice(fim);
        changed=true;
      }

      // A partir de agora o módulo Financeiro inteiro aponta somente para a trilha.
      // O código legado permanece no repositório/backup, mas não é mais renderizado.
      const body=/ const body=[^\n]+;/;
      if(body.test(out)){
        out=out.replace(body,' const body=trilhaFinanceiro();');
        changed=true;
      }

      if(!changed) console.warn('[zoe-financeiro-rebuild-limpo] nenhum ponto de montagem encontrado');
      return changed?{code:out,map:null}:null;
    }
  };
}
