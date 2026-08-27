import React,{useMemo,useRef,useState}from'react';
import{ArrowLeft,Shirt,Plus,Camera,Trash2,Heart,Sparkles,X,Upload,Check}from'lucide-react';
import{Wordmark}from'./ui.jsx';
import'./GuardaRoupa.css';

const uid=()=>`gr-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
const lerImagem=file=>new Promise((resolve,reject)=>{if(!file)return resolve('');const fr=new FileReader();fr.onload=()=>resolve(fr.result);fr.onerror=()=>reject(fr.error);fr.readAsDataURL(file)});

export default function GuardaRoupa({d,up,aviso,voltar}){
  const dados=d.guardaRoupa||{pecas:[]};
  const pecas=Array.isArray(dados.pecas)?dados.pecas:[];
  const[tab,setTab]=useState('pecas');
  const[modal,setModal]=useState(false);
  const[nome,setNome]=useState('');
  const[categoria,setCategoria]=useState('Parte de cima');
  const[imagem,setImagem]=useState('');
  const fileRef=useRef(null);
  const categorias=['Parte de cima','Parte de baixo','Vestido','Calçado','Bolsa','Acessório','Outro'];
  const contagens=useMemo(()=>categorias.map(c=>({c,n:pecas.filter(p=>p.categoria===c).length})).filter(x=>x.n),[pecas]);

  const salvar=()=>{
    if(!nome.trim()&&!imagem)return aviso('Adicione uma foto ou um nome para a peça');
    const p={id:uid(),nome:nome.trim()||categoria,categoria,imagem,favorita:false,criadaEm:new Date().toISOString()};
    up(s=>({...s,guardaRoupa:{...(s.guardaRoupa||{}),pecas:[...(s.guardaRoupa?.pecas||[]),p]}}));
    setNome('');setImagem('');setCategoria('Parte de cima');setModal(false);aviso('Peça adicionada');
  };
  const excluir=id=>up(s=>({...s,guardaRoupa:{...(s.guardaRoupa||{}),pecas:(s.guardaRoupa?.pecas||[]).filter(p=>p.id!==id)}}));
  const favorita=id=>up(s=>({...s,guardaRoupa:{...(s.guardaRoupa||{}),pecas:(s.guardaRoupa?.pecas||[]).map(p=>p.id===id?{...p,favorita:!p.favorita}:p)}}));
  const escolherImagem=async file=>{try{setImagem(await lerImagem(file))}catch{aviso('Não consegui abrir essa imagem')}};
  const visiveis=tab==='favoritos'?pecas.filter(p=>p.favorita):pecas;

  return <div className="gr-page">
    <header className="gr-head"><button onClick={voltar} aria-label="Voltar"><ArrowLeft size={20}/></button><Wordmark altura={31}/><span><Shirt size={20}/></span></header>

    <section className="gr-intro">
      <div><span>GUARDA-ROUPA</span><h1>O que você já tem.</h1><p>Organize suas peças para usar melhor, repetir com intenção e comprar menos no impulso.</p></div>
      <div className="gr-hero-icon"><Shirt size={44}/></div>
    </section>

    <nav className="gr-tabs">
      <button className={tab==='pecas'?'on':''} onClick={()=>setTab('pecas')}>Peças <b>{pecas.length}</b></button>
      <button className={tab==='favoritos'?'on':''} onClick={()=>setTab('favoritos')}>Favoritos <b>{pecas.filter(p=>p.favorita).length}</b></button>
    </nav>

    <main className="gr-main">
      {contagens.length>0&&<section className="gr-cats">{contagens.map(x=><div key={x.c}><strong>{x.n}</strong><span>{x.c}</span></div>)}</section>}
      <div className="gr-section-title"><div><span>{tab==='favoritos'?'FAVORITOS':'SUAS PEÇAS'}</span><h2>{tab==='favoritos'?'O que você mais usa':'Seu acervo'}</h2></div><button onClick={()=>setModal(true)}><Plus size={17}/>Adicionar</button></div>

      {visiveis.length?<section className="gr-grid">{visiveis.map((p,i)=><article key={p.id} className="gr-item" style={{animationDelay:(Math.min(i,8)*40)+'ms'}}>
        <div className="gr-photo">{p.imagem?<img src={p.imagem} alt={p.nome}/>:<Shirt size={37}/>}<button className={p.favorita?'fav on':'fav'} onClick={()=>favorita(p.id)}><Heart size={15} fill={p.favorita?'currentColor':'none'}/></button></div>
        <div className="gr-item-copy"><strong>{p.nome}</strong><span>{p.categoria}</span></div>
        <button className="gr-trash" onClick={()=>excluir(p.id)} aria-label="Excluir"><Trash2 size={14}/></button>
      </article>)}</section>:<section className="gr-empty"><div><Sparkles size={24}/></div><h3>{tab==='favoritos'?'Nenhum favorito ainda.':'Seu guarda-roupa começa pela primeira peça.'}</h3><p>Fotografe uma peça e deixe o NIIL organizar o restante com você.</p><button onClick={()=>setModal(true)}><Camera size={17}/>Adicionar primeira peça</button></section>}
    </main>

    {modal&&<div className="gr-overlay" onClick={()=>setModal(false)}><div className="gr-sheet" onClick={e=>e.stopPropagation()}>
      <div className="gr-sheet-head"><div><span>NOVA PEÇA</span><h2>Adicionar ao guarda-roupa</h2></div><button onClick={()=>setModal(false)}><X size={18}/></button></div>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={e=>escolherImagem(e.target.files?.[0])}/>
      <button className="gr-upload" onClick={()=>fileRef.current?.click()}>{imagem?<img src={imagem} alt="Prévia"/>:<><Upload size={25}/><b>Adicionar foto</b><small>Galeria ou câmera</small></>}</button>
      <label>Nome da peça<input value={nome} onChange={e=>setNome(e.target.value)} placeholder="Ex.: blazer preto"/></label>
      <label>Categoria<select value={categoria} onChange={e=>setCategoria(e.target.value)}>{categorias.map(c=><option key={c}>{c}</option>)}</select></label>
      <button className="gr-save" onClick={salvar}><Check size={18}/>Salvar peça</button>
    </div></div>}
  </div>
}
