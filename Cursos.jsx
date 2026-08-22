import React, { useMemo, useState } from 'react';
import { ArrowLeft, BookOpen, Check, ChevronRight, ExternalLink, Link2, LoaderCircle, Lock, LogIn, PlaySquare, Plus, Search, ShieldCheck, Sparkles, Trash2, Youtube } from 'lucide-react';
import { C, Card, Btn, Campo, Area, Barra, hoje } from './ui.jsx';

const novaId = prefixo => `${prefixo}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

function interpretarPrograma(texto, urlBase, minutos) {
  const linhas = texto.split('\n').map(x => x.trim()).filter(Boolean);
  const origem = linhas.length ? linhas : ['Começar o curso'];
  return origem.map((linha, i) => {
    const partes = linha.split('|').map(x => x.trim());
    const link = partes.find(x => /^https?:\/\//i.test(x)) || urlBase;
    const tempo = partes.find(x => /^\d+\s*(min|minutos?)?$/i.test(x));
    const titulo = partes.filter(x => x !== link && x !== tempo).join(' · ') || `Aula ${i + 1}`;
    return { id: novaId('aula'), titulo, url: link, minutos: parseInt(tempo, 10) || minutos, feito: false, data: null };
  });
}

export default function Cursos({ d, up, aviso, voltar }) {
  const cursos = d.cursos || [];
  const [tela, setTela] = useState('lista');
  const [cursoId, setCursoId] = useState(null);
  const [nome, setNome] = useState('');
  const [url, setUrl] = useState('');
  const [programa, setPrograma] = useState('');
  const [minutos, setMinutos] = useState(10);
  const [analisando, setAnalisando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState('');
  const curso = cursos.find(x => x.id === cursoId);

  const totais = useMemo(() => cursos.reduce((acc, c) => {
    acc.aulas += c.aulas.length;
    acc.feitas += c.aulas.filter(a => a.feito).length;
    return acc;
  }, { aulas: 0, feitas: 0 }), [cursos]);

  const criar = () => {
    if (!nome.trim() || !url.trim()) return aviso('Informe o nome e o link do curso');
    const novo = {
      id: novaId('curso'), nome: nome.trim(), url: url.trim(), minutosDia: +minutos || 10,
      criadoEm: hoje(), aulas: interpretarPrograma(programa, url.trim(), +minutos || 10)
    };
    up(s => ({ ...s, cursos: [...(s.cursos || []), novo] }));
    setNome(''); setUrl(''); setPrograma(''); setMinutos(10);
    setCursoId(novo.id); setTela('curso'); aviso('Trilha criada pela ZOE');
  };

  const analisar = async () => {
    setErro(''); setResultado(null);
    if (!/^https?:\/\//i.test(url.trim())) return setErro('Cole uma URL completa iniciando com https://');
    setAnalisando(true);
    try {
      const resp = await fetch('/.netlify/functions/import-course', {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ url: url.trim() })
      });
      const dados = await resp.json();
      if (!resp.ok) throw new Error(dados.erro || 'Não foi possível analisar o link.');
      setResultado(dados);
      if (dados.nome) setNome(dados.nome);
    } catch (e) { setErro(e.message || 'Não foi possível analisar o link.'); }
    finally { setAnalisando(false); }
  };

  const importarResultado = () => {
    if (!resultado?.aulas?.length) return;
    const novo = {
      id: novaId('curso'), nome: (nome || resultado.nome).trim(), url: resultado.url,
      origem: resultado.origem, minutosDia: +minutos || 10, criadoEm: hoje(),
      aulas: resultado.aulas.map(a => ({ ...a, id: novaId('aula'), feito: false, data: null }))
    };
    up(s => ({ ...s, cursos: [...(s.cursos || []), novo] }));
    setUrl(''); setNome(''); setResultado(null); setCursoId(novo.id); setTela('curso');
    aviso(`${novo.aulas.length} aulas importadas · trilha criada`);
  };

  const concluir = aulaId => {
    up(s => ({ ...s, cursos: (s.cursos || []).map(c => c.id !== curso.id ? c : {
      ...c, aulas: c.aulas.map(a => a.id === aulaId ? { ...a, feito: true, data: hoje() } : a)
    }) }));
    aviso('Etapa concluída · próxima aula liberada');
  };

  if (tela === 'adicionar') return (
    <div style={{ padding: '18px 16px 120px', minHeight: '100vh', background: '#F7FAF9' }}>
      <button onClick={() => setTela('lista')} style={{ border: 0, background: 'transparent', color: C.ink, display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'inherit', fontWeight: 800, padding: '4px 0 18px' }}><ArrowLeft size={19}/> Minhas trilhas</button>
      <h1 style={{ margin: 0, color: C.ink, fontSize: 24 }}>Transformar em trilha</h1>
      <p style={{ color: C.ink3, fontSize: 12.5, lineHeight: 1.55, margin: '6px 0 18px' }}>Cole o link de um curso ou de uma playlist. A ZOE procura as aulas e organiza a jornada.</p>
      <Card style={{ padding: 18 }}>
        <Campo label="URL do curso ou playlist" type="url" placeholder="https://youtube.com/playlist?list=..." value={url} onChange={e => { setUrl(e.target.value); setResultado(null); setErro(''); }} />
        <Btn onClick={analisar} disabled={analisando} style={{ width: '100%', padding: 15 }}>{analisando ? <LoaderCircle className="zoe-gira" size={18} style={{ verticalAlign:'middle',marginRight:7 }}/> : <Search size={17} style={{ verticalAlign:'middle',marginRight:7 }}/>} {analisando ? 'Buscando aulas…' : 'Buscar conteúdo'}</Btn>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginTop:14 }}><div style={{ padding:12,borderRadius:14,background:'#FFF3F3',color:'#D23B31',fontSize:10.5,fontWeight:800,display:'flex',gap:7,alignItems:'center' }}><Youtube size={18}/>Playlist pública</div><div style={{ padding:12,borderRadius:14,background:C.aquaSuave,color:C.petroleo,fontSize:10.5,fontWeight:800,display:'flex',gap:7,alignItems:'center' }}><LogIn size={18}/>Curso com login</div></div>
        {erro && <div className="zoe-surge" style={{ marginTop:13,padding:12,borderRadius:13,background:'#FFF1F1',color:'#A43C3C',fontSize:11.5,lineHeight:1.45 }}>{erro}</div>}
      </Card>
      {resultado?.tipo === 'youtube' && <Card cls="zoe-surge" style={{ marginTop:14,border:'1px solid #E9E1F3' }}><div style={{ display:'flex',gap:11,alignItems:'center',marginBottom:13 }}><div style={{ width:42,height:42,borderRadius:14,background:'#FFEEEE',color:'#E62B24',display:'grid',placeItems:'center' }}><PlaySquare size={22}/></div><div style={{ flex:1 }}><div style={{ color:C.ink,fontSize:14,fontWeight:900 }}>{resultado.nome}</div><div style={{ color:C.ink3,fontSize:10.5,marginTop:3 }}>{resultado.aulas.length} vídeos encontrados · {resultado.aulas.reduce((n,a)=>n+a.minutos,0)} min</div></div></div><Campo label="Nome da trilha" value={nome} onChange={e=>setNome(e.target.value)}/><Campo label="Minutos disponíveis por dia" type="number" min="2" value={minutos} onChange={e=>setMinutos(e.target.value)}/><div style={{ maxHeight:180,overflow:'auto',borderTop:`1px solid ${C.line}`,margin:'2px 0 14px',paddingTop:8 }}>{resultado.aulas.slice(0,12).map((a,i)=><div key={a.url} style={{ display:'flex',gap:8,padding:'7px 2px',fontSize:10.5,color:C.ink2 }}><strong style={{ color:C.roxo }}>{i+1}</strong><span style={{ flex:1 }}>{a.titulo}</span><span style={{ color:C.ink3 }}>{a.minutos} min</span></div>)}{resultado.aulas.length>12&&<div style={{ textAlign:'center',fontSize:10,color:C.ink3,padding:7 }}>+ {resultado.aulas.length-12} aulas</div>}</div><Btn onClick={importarResultado} style={{ width:'100%',padding:15 }}><Sparkles size={17} style={{verticalAlign:'middle',marginRight:7}}/>Criar trilha automaticamente</Btn></Card>}
      {resultado?.tipo === 'protegido' && <Card cls="zoe-surge" style={{ marginTop:14,border:'1px solid #D9EFEB' }}><div style={{ display:'flex',gap:11,alignItems:'center' }}><div style={{ width:44,height:44,borderRadius:15,background:C.aquaSuave,color:C.petroleo,display:'grid',placeItems:'center' }}><ShieldCheck size={22}/></div><div><div style={{ color:C.ink,fontSize:14,fontWeight:900 }}>Login necessário</div><div style={{ color:C.ink3,fontSize:10.5,marginTop:3 }}>{resultado.plataforma}</div></div></div><p style={{ color:C.ink2,fontSize:12,lineHeight:1.5,margin:'13px 0' }}>A ZOE identificou uma área protegida. O próximo passo é conectar essa plataforma para ler módulos e aulas sem guardar sua senha.</p><Btn onClick={()=>window.open(resultado.url,'_blank','noopener,noreferrer')} style={{ width:'100%',padding:14 }}>Entrar na plataforma <ExternalLink size={15} style={{verticalAlign:'middle',marginLeft:6}}/></Btn><div style={{ color:C.ink3,fontSize:10.5,lineHeight:1.45,marginTop:10 }}>O conector seguro desta plataforma precisa estar habilitado para concluir a importação automática.</div></Card>}
      <details style={{ marginTop:15 }}><summary style={{ color:C.ink3,fontSize:11,fontWeight:800,cursor:'pointer' }}>Adicionar manualmente se a plataforma bloquear</summary><Card style={{ marginTop:9 }}><Campo label="Nome do curso" value={nome} onChange={e=>setNome(e.target.value)}/><Campo label="Minutos por dia" type="number" value={minutos} onChange={e=>setMinutos(e.target.value)}/><Area label="Uma aula por linha" value={programa} onChange={e=>setPrograma(e.target.value)} style={{minHeight:120}}/><Btn onClick={criar} style={{width:'100%'}}>Criar trilha manual</Btn></Card></details>
    </div>
  );

  if (tela === 'curso' && curso) {
    const feitas = curso.aulas.filter(a => a.feito).length;
    const atual = curso.aulas.findIndex(a => !a.feito);
    const pos = [48, 67, 58, 34, 26, 45, 69, 61];
    return (
      <div style={{ paddingBottom: 120, minHeight: '100vh', background: 'linear-gradient(180deg,#F4EDFF 0,#F8FAF9 280px)' }}>
        <div style={{ padding: '18px 16px 12px' }}>
          <button onClick={() => setTela('lista')} style={{ border: 0, background: 'transparent', color: C.ink, display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'inherit', fontWeight: 800, padding: '4px 0 16px' }}><ArrowLeft size={19}/> Minhas trilhas</button>
          <Card style={{ background: 'linear-gradient(135deg,#8E2DE2,#5D00FF)', color: '#fff', padding: 18, boxShadow: '0 13px 28px rgba(93,0,255,.2)' }}>
            <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: 1, opacity: .75 }}>CURSO EXTERNO</div>
            <h1 style={{ fontSize: 21, margin: '5px 0 7px' }}>{curso.nome}</h1>
            <div style={{ fontSize: 11.5, opacity: .82, marginBottom: 13 }}>{curso.minutosDia} minutos por dia · conteúdo na plataforma original</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 7 }}><span>Progresso</span><strong>{feitas}/{curso.aulas.length}</strong></div>
            <Barra v={feitas} max={curso.aulas.length} cor={C.lima} h={8}/>
          </Card>
        </div>
        <div style={{ position: 'relative', height: curso.aulas.length * 128 + 30, margin: '10px 14px' }}>
          <svg viewBox={`0 0 100 ${curso.aulas.length * 128 + 30}`} preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} aria-hidden="true">
            <polyline points={curso.aulas.map((_, i) => `${pos[i % pos.length]},${i * 128 + 42}`).join(' ')} fill="none" stroke="#DDE3E3" strokeWidth="2.2" strokeDasharray="2 3" vectorEffect="non-scaling-stroke"/>
            {curso.aulas.slice(0,-1).map((a,i) => a.feito && <line key={a.id} x1={pos[i%pos.length]} y1={i*128+42} x2={pos[(i+1)%pos.length]} y2={(i+1)*128+42} stroke="#8E2DE2" strokeWidth="3" vectorEffect="non-scaling-stroke"/>)}
          </svg>
          {curso.aulas.map((a, i) => {
            const liberada = i <= atual || atual === -1 || a.feito;
            const agora = i === atual;
            return <div key={a.id} style={{ position: 'absolute', top: i * 128, left: `${pos[i%pos.length]}%`, transform: 'translateX(-50%)', width: 160, textAlign: 'center', opacity: liberada ? 1 : .48 }}>
              {agora && <span style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', padding: '4px 10px', borderRadius: 9, background: C.lima, color: C.greenDark, fontSize: 9, fontWeight: 950, zIndex: 2 }}>PRÓXIMA</span>}
              <button disabled={!liberada} onClick={() => liberada && window.open(a.url || curso.url, '_blank', 'noopener,noreferrer')} style={{ width: agora ? 82 : 74, height: agora ? 82 : 74, borderRadius: '50%', border: agora ? '8px solid #fff' : '6px solid #fff', background: a.feito ? '#8E2DE2' : '#E1E6E5', color: a.feito ? '#fff' : '#A8B1B1', boxShadow: agora ? '0 0 0 5px rgba(142,45,226,.28),0 9px 0 rgba(120,132,132,.25)' : '0 7px 0 rgba(46,61,67,.16)', display: 'grid', placeItems: 'center', margin: 'auto', cursor: liberada ? 'pointer' : 'default' }}>
                {a.feito ? <Check size={27}/> : liberada ? <ExternalLink size={23}/> : <Lock size={21}/>}</button>
              <div style={{ marginTop: 10, padding: '7px 8px', borderRadius: 11, background: '#fff', boxShadow: agora ? '0 6px 18px rgba(20,43,48,.09)' : 'none' }}>
                <div style={{ color: liberada ? C.ink : C.ink3, fontSize: 10.5, fontWeight: 850, lineHeight: 1.25 }}>{a.titulo}</div>
                <div style={{ color: C.ink3, fontSize: 8.8, marginTop: 3 }}>{a.minutos} min {a.data ? `· ${new Date(a.data+'T12:00').toLocaleDateString('pt-BR')}` : ''}</div>
                {agora && <button onClick={() => concluir(a.id)} style={{ marginTop: 7, border: 0, borderRadius: 8, padding: '6px 8px', background: C.petroleo, color: '#fff', fontFamily: 'inherit', fontSize: 9.5, fontWeight: 850 }}>Concluir etapa</button>}
              </div>
            </div>;
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 16px 120px', minHeight: '100vh', background: '#F7FAF9' }}>
      <button onClick={voltar} style={{ border: 0, background: 'transparent', color: C.ink, display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'inherit', fontWeight: 800, padding: '2px 0 16px' }}><ArrowLeft size={19}/> Início</button>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 18 }}><div><h1 style={{ margin: 0, color: C.ink, fontSize: 24 }}>Minhas trilhas</h1><p style={{ color: C.ink3, fontSize: 12.5, margin: '5px 0 0' }}>Seus cursos organizados pela ZOE</p></div><button onClick={() => setTela('adicionar')} style={{ width: 44, height: 44, border: 0, borderRadius: 15, background: C.petroleo, color: '#fff', display: 'grid', placeItems: 'center' }}><Plus size={21}/></button></div>
      {cursos.length > 0 && <Card style={{ marginBottom: 15 }}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}><span style={{ color: C.ink2 }}>Progresso em cursos</span><strong style={{ color: C.roxo }}>{totais.feitas}/{totais.aulas}</strong></div><Barra v={totais.feitas} max={totais.aulas || 1} cor={C.roxo} h={7}/></Card>}
      {cursos.length === 0 ? <Card style={{ textAlign: 'center', padding: '34px 20px' }}><div style={{ width: 58, height: 58, borderRadius: 20, background: '#F0E5FF', color: C.roxo, display: 'grid', placeItems: 'center', margin: '0 auto 14px' }}><BookOpen size={27}/></div><strong style={{ color: C.ink }}>Transforme um curso em trilha</strong><p style={{ color: C.ink3, fontSize: 12, lineHeight: 1.55, margin: '8px 0 17px' }}>Adicione o curso que você já comprou. A ZOE organiza a sequência e leva você até a aula certa.</p><Btn onClick={() => setTela('adicionar')}>Adicionar meu primeiro curso</Btn></Card> : cursos.map(c => {
        const feitas = c.aulas.filter(a => a.feito).length;
        return <Card key={c.id} onClick={() => { setCursoId(c.id); setTela('curso'); }} style={{ marginBottom: 12, cursor: 'pointer', border: `1px solid ${C.line}` }}><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><div style={{ width: 46, height: 46, borderRadius: 15, background: '#F0E5FF', color: C.roxo, display: 'grid', placeItems: 'center' }}><Link2 size={21}/></div><div style={{ flex: 1, minWidth: 0 }}><div style={{ color: C.ink, fontWeight: 900, fontSize: 14 }}>{c.nome}</div><div style={{ color: C.ink3, fontSize: 10.5, margin: '4px 0 7px' }}>{feitas}/{c.aulas.length} etapas · {c.minutosDia} min/dia</div><Barra v={feitas} max={c.aulas.length} cor={C.roxo} h={5}/></div><ChevronRight size={18} color={C.ink3}/><button onClick={e => { e.stopPropagation(); up(s => ({ ...s, cursos: (s.cursos || []).filter(x => x.id !== c.id) })); aviso('Curso removido'); }} style={{ border: 0, background: 'transparent', color: C.ink3, padding: 5 }}><Trash2 size={16}/></button></div></Card>;
      })}
    </div>
  );
}
