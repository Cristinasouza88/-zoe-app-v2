export default function financeiroVisualV4(){
  return {
    name:'zoe-financeiro-visual-v4',
    enforce:'pre',
    transform(code,id){
      if(!id.endsWith('/FinanceiroPlus.jsx')&&!id.endsWith('FinanceiroPlus.jsx')) return null;
      if(!code.includes(' const financeiroNovo=()=>')) return null;
      let out=code,changed=false;

      // Ícones reais da biblioteca do produto. Nada de emojis/símbolos improvisados.
      // Usamos somente nomes estáveis e compatíveis com a versão instalada do lucide-react.
      out=out.replace(/import\{([^}]*)\}from'lucide-react';/,(_,nomes)=>{
        const lista=nomes.split(',').map(x=>x.trim()).filter(Boolean);
        ['CreditCard','Home','Building2','Briefcase','Calendar','Gift','BarChart3','Wallet','Car','SlidersHorizontal'].forEach(x=>{if(!lista.includes(x))lista.push(x)});
        changed=true;
        return `import{${lista.join(',')}}from'lucide-react';`;
      });

      const viewAnchor=" const view=String(tela||'').startsWith('financeiro')?String(tela):'financeiroHome';";
      if(out.includes(viewAnchor)&&!out.includes('const iconeFinanceiro=')){
        const helpers=`${viewAnchor}\n const iconeFinanceiro=(tipo,size=20)=>{const mapa={planejamento:SlidersHorizontal,graficos:BarChart3,cartoes:CreditCard,patrimonio:Home,investimentos:PiggyBank,recompensas:Gift,painel:Wallet,objetivos:Target,trilha:Sparkles};const I=mapa[tipo]||Landmark;return <I size={size} strokeWidth={2}/>};\n const iconePatrimonio=(tipo,size=26)=>{const I=tipo==='Financiamento'?Building2:tipo==='Veículo / carro'?Car:tipo==='Consórcio'||tipo==='Imóvel / casa'||tipo==='Terreno'?Home:Briefcase;return <I size={size} strokeWidth={1.9}/>};\n const BauZoe=({ativo=false})=><div aria-hidden=\"true\" style={{width:116,height:92,margin:'0 auto',position:'relative',filter:ativo?'drop-shadow(0 12px 18px rgba(202,145,48,.24))':'none'}}><div style={{position:'absolute',left:9,right:9,bottom:6,height:54,borderRadius:16,background:ativo?'linear-gradient(180deg,#E7B457,#C88426)':'linear-gradient(180deg,#D9B77E,#B88C4D)',border:'1px solid rgba(112,72,26,.16)'}}/><div style={{position:'absolute',left:15,right:15,top:9,height:39,borderRadius:'18px 18px 8px 8px',background:ativo?'linear-gradient(180deg,#F1CB7D,#D89A36)':'linear-gradient(180deg,#E4CCA5,#C6A46F)',border:'1px solid rgba(112,72,26,.13)'}}/><div style={{position:'absolute',left:48,top:42,width:20,height:24,borderRadius:7,background:'#FFF8E8',border:'3px solid #B77A25',boxSizing:'border-box'}}/><div style={{position:'absolute',left:19,right:19,top:45,height:5,borderRadius:9,background:'rgba(118,72,23,.24)'}}/></div>;`;
        out=out.replace(viewAnchor,helpers);changed=true;
      }

      const voltarAntigo=/^ const voltar=t=>.*$/m;
      if(voltarAntigo.test(out)){
        out=out.replace(voltarAntigo,` const voltar=t=>{const destino=view.startsWith('financeiroPatrimonio:')?'financeiroPatrimonio':(view==='financeiroOfensiva'||view==='financeiroRecompensas')?'financeiroTrilha':'financeiroHome';return <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:22}}><button type=\"button\" aria-label=\"Voltar\" onClick={()=>go(destino)} style={{border:'1px solid #E7E9F2',background:'#F1F3FF',width:42,height:42,borderRadius:14,color:'#4F4BE3',display:'grid',placeItems:'center',padding:0,boxShadow:'0 5px 14px rgba(73,65,164,.07)'}}><ChevronLeft size={22} strokeWidth={2.1}/></button><b style={{fontSize:21,color:'#19192D',letterSpacing:-.2}}>{t}</b></div>};`);changed=true;
      }

      // O app já possui navegação inferior global. A segunda barra duplicava a interface.
      out=out.replace(/^ const nav=.*$/m,' const nav=null;');

      // Home: ícones de produto e cartões com a mesma linguagem visual do mockup aprovado.
      out=out.replace(`<div style={{width:54,height:54,borderRadius:18,display:'grid',placeItems:'center',background:'#EEF2FF',fontSize:25}}>💳</div>`,`<div style={{width:54,height:54,borderRadius:18,display:'grid',placeItems:'center',background:'#EEF2FF',color:'#4F4BE3'}}><Wallet size={25} strokeWidth={1.9}/></div>`);
      out=out.replace("[['financeiroPlanejamento','◫','Planejamento','Orçamento por categoria'],['financeiroGraficos','▥','Gráficos','Evolução e categorias'],['financeiroCartoes','▤','Cartões','Faturas mês a mês'],['financeiroPatrimonio','⌂','Patrimônio','Casa, carro e consórcios']]","[['financeiroPlanejamento','planejamento','Planejamento','Orçamento por categoria'],['financeiroGraficos','graficos','Gráficos','Evolução e categorias'],['financeiroCartoes','cartoes','Cartões','Faturas mês a mês'],['financeiroPatrimonio','patrimonio','Patrimônio','Casa, carro e consórcios']]");
      out=out.replace(`<span style={{fontSize:20,color:'#5B4BEA'}}>{ic}</span>`,`<span style={{width:36,height:36,borderRadius:12,display:'grid',placeItems:'center',background:'#F1F3FF',color:'#4F4BE3'}}>{iconeFinanceiro(ic,19)}</span>`);

      // Todas as subáreas recuperam uma seta real de voltar.
      out=out.replace("return <><div style={{textAlign:'center',padding:'8px 4px 18px'}}><div style={{fontSize:10,fontWeight:900,color:'#62B936'","return <>{voltar('Minha trilha financeira')}<div style={{textAlign:'center',padding:'2px 4px 18px'}}><div style={{fontSize:10,fontWeight:900,color:'#62B936'");
      out=out.replace("const Painel=()=> <>{titulo('Resumo do mês','A visão executiva da sua vida financeira.')}","const Painel=()=> <>{voltar('Painel financeiro')}<div style={{fontSize:10.5,color:'#77798A',margin:'-12px 0 16px'}}>A visão executiva da sua vida financeira.</div>");
      out=out.replace("const Objetivos=()=> <>{titulo('Objetivos','Ativos, alcançados e arquivados ficam no mesmo lugar.')}","const Objetivos=()=> <>{voltar('Objetivos')}<div style={{fontSize:10.5,color:'#77798A',margin:'-12px 0 16px'}}>Ativos, alcançados e arquivados ficam no mesmo lugar.</div>");
      out=out.replace("const Mais=()=> <>{titulo('Mais do Financeiro','Tudo conectado à mesma base de dados.')}","const Mais=()=> <>{voltar('Mais do Financeiro')}<div style={{fontSize:10.5,color:'#77798A',margin:'-12px 0 16px'}}>Tudo conectado à mesma base de dados.</div>");

      // Ofensiva, recompensas e reserva sem emojis.
      out=out.replace(`<div style={{fontSize:42}}>🗓️</div>`,`<div style={{width:86,height:86,borderRadius:28,margin:'0 auto',display:'grid',placeItems:'center',background:'linear-gradient(145deg,#F1F3FF,#FFFFFF)',color:'#4F4BE3',border:'1px solid #E4E7F4',boxShadow:'0 12px 28px rgba(61,70,170,.08)'}}><Calendar size={42} strokeWidth={1.8}/></div>`);
      out=out.replace(`<div style={{fontSize:72,filter:recompensaPct>=100?'none':'grayscale(.15)'}}>🧰</div>`,`<BauZoe ativo={recompensaPct>=100}/>`);
      out=out.replace(`<div style={{fontSize:34}}>🐷</div>`,`<div style={{color:'#4F58E8',display:'grid',placeItems:'center'}}><PiggyBank size={38} strokeWidth={1.8}/></div>`);

      // Cartões.
      out=out.replace(`<span style={{fontSize:18}}>💳</span>`,`<span style={{width:34,height:34,borderRadius:11,display:'grid',placeItems:'center',background:'#EEF2FF',color:'#4F4BE3'}}><CreditCard size={18}/></span>`);
      out=out.replace(`<div style={{fontSize:36}}>💳</div>`,`<div style={{width:64,height:64,borderRadius:21,margin:'0 auto',display:'grid',placeItems:'center',background:'#EEF2FF',color:'#4F4BE3'}}><CreditCard size={30} strokeWidth={1.8}/></div>`);
      out=out.replace(`>＋ IMPORTAR CSV DA FATURA</button>`,`><Upload size={16} strokeWidth={2}/><span>IMPORTAR CSV DA FATURA</span></button>`);
      out=out.replace(`style={{width:'100%',border:'1px dashed #B9B2EA',borderRadius:14,padding:13,background:'#F8F6FF',color:'#5B4BEA',fontWeight:900,fontSize:10,marginBottom:12}}><Upload`,`style={{width:'100%',border:'1px dashed #B9B2EA',borderRadius:14,padding:13,background:'#F8F6FF',color:'#5B4BEA',fontWeight:900,fontSize:10,marginBottom:12,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}><Upload`);

      // Patrimônio: ícones vetoriais personalizados e hierarquia correta de retorno.
      out=out.replace(`{cons?'🏠':finan?'🏢':'💼'}`,`{iconePatrimonio(item.tipo,30)}`);
      out=out.replace(`{x.tipo==='Consórcio'?'🏠':x.tipo==='Financiamento'?'🏢':'💼'}`,`{iconePatrimonio(x.tipo,22)}`);
      out=out.replace(`<div style={{fontSize:32}}>{iconePatrimonio(item.tipo,30)}</div>`,`<div style={{width:54,height:54,borderRadius:18,display:'grid',placeItems:'center',background:'#F1F3FF',color:'#4F4BE3'}}>{iconePatrimonio(item.tipo,27)}</div>`);
      out=out.replace(`<span style={{fontSize:22}}>{iconePatrimonio(x.tipo,22)}</span>`,`<span style={{width:38,height:38,borderRadius:13,display:'grid',placeItems:'center',background:'#F1F3FF',color:'#4F4BE3'}}>{iconePatrimonio(x.tipo,20)}</span>`);

      // Menu Mais sem pictogramas de sistema/emoji.
      out=out.replace("[['financeiroInvestimentos','🐷','Reserva e investimentos'],['financeiroPlanejamento','📊','Planejamento mensal'],['financeiroGraficos','📈','Gráficos e categorias'],['financeiroCartoes','💳','Cartões e faturas'],['financeiroPatrimonio','🏠','Patrimônio detalhado'],['financeiroRecompensas','🧰','Recompensas']]","[['financeiroInvestimentos','investimentos','Reserva e investimentos'],['financeiroPlanejamento','planejamento','Planejamento mensal'],['financeiroGraficos','graficos','Gráficos e categorias'],['financeiroCartoes','cartoes','Cartões e faturas'],['financeiroPatrimonio','patrimonio','Patrimônio detalhado'],['financeiroRecompensas','recompensas','Recompensas']]");
      out=out.replace(`<span style={{fontSize:20}}>{ic}</span><b style={{fontSize:11,color:'#2D2D3C'}}>{l}</b><span style={{marginLeft:'auto',color:'#9698A2'}}>›</span>`,`<span style={{width:36,height:36,borderRadius:12,display:'grid',placeItems:'center',background:'#F1F3FF',color:'#4F4BE3'}}>{iconeFinanceiro(ic,18)}</span><b style={{fontSize:11,color:'#2D2D3C'}}>{l}</b><span style={{marginLeft:'auto',color:'#9698A2',display:'grid',placeItems:'center'}}><ChevronRight size={17}/></span>`);

      // Acabamento geral: mais próximo do layout aprovado e sem uma segunda barra inferior.
      out=out.replace("const go=v=>setTela(v),card=(children,style={})=><div style={{background:'#fff',border:'1px solid #E9EAF0',borderRadius:18,padding:14,boxShadow:'0 8px 24px rgba(35,30,80,.05)',...style}}>{children}</div>;","const go=v=>setTela(v),card=(children,style={})=><div style={{background:'#fff',border:'1px solid #E7E9F0',borderRadius:20,padding:15,boxShadow:'0 10px 28px rgba(35,30,80,.055)',...style}}>{children}</div>;");
      out=out.replace("const mini=(label,valor,sub,cor='#5B4BEA')=><div style={{padding:12,border:'1px solid #E9EAF0',borderRadius:14,background:'#fff'}}>","const mini=(label,valor,sub,cor='#5B4BEA')=><div style={{padding:14,border:'1px solid #E7E9F0',borderRadius:18,background:'#fff',boxShadow:'0 5px 16px rgba(35,30,80,.035)'}}>" );
      out=out.replace("return <div style={{margin:'-18px -16px 0',padding:'24px 18px 18px',minHeight:'100vh',background:'linear-gradient(180deg,#FFFFFF 0%,#FBFBFE 100%)'}}><div style={{maxWidth:430,margin:'0 auto'}}>{conteudo}{nav}</div></div>;","return <div style={{margin:'-18px -16px 0',padding:'22px 18px 112px',minHeight:'100vh',background:'#FCFCFE'}}><div style={{maxWidth:430,margin:'0 auto'}}>{conteudo}</div></div>;");

      // Segurança: caracteres pictográficos antigos não devem reaparecer no Financeiro.
      ['💳','🗓️','🧰','🐷','🏠','🏢','💼','📊','📈','◫','▥','▤','⌂','✦','▦','◎'].forEach(ch=>{if(out.includes(ch)){out=out.split(ch).join('');changed=true}});

      return changed?{code:out,map:null}:null;
    }
  };
}
