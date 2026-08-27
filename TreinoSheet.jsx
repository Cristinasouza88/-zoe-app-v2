import React,{useEffect,useMemo,useState}from'react';
import{Dumbbell,Plus,Trash2,CheckCircle2}from'lucide-react';
import{Sheet,C,Btn}from'./ui.jsx';
import'./TreinoSheet.css';

const clamp=(n,min,max)=>Math.max(min,Math.min(max,Number(n)||min));
const uid=()=>`ex-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
const novoExercicio=()=>({id:uid(),nome:'',series:3,repsAlvo:12,carga:'',repeticoes:['','','']});
const vazio=()=>({calorias:'',passos:'',observacao:'',exercicios:[novoExercicio()]});

export default function TreinoSheet({aberto,fechar,contexto,onSalvar,historico=[]}){
  const[form,setForm]=useState(vazio);
  const ultimo=useMemo(()=>historico?.[0]||null,[historico]);

  useEffect(()=>{
    if(aberto)setForm(vazio());
  },[aberto,contexto?.etapaId,contexto?.indice,contexto?.data]);

  const setCampo=(k,v)=>setForm(f=>({...f,[k]:v}));
  const atualizar=(id,patch)=>setForm(f=>({...f,exercicios:f.exercicios.map(e=>e.id===id?{...e,...patch}:e)}));

  const mudarSeries=(id,valor)=>{
    const series=clamp(valor,1,8);
    setForm(f=>({...f,exercicios:f.exercicios.map(e=>{
      if(e.id!==id)return e;
      const reps=[...(e.repeticoes||[])];
      while(reps.length<series)reps.push('');
      return{...e,series,repeticoes:reps.slice(0,series)};
    })}));
  };

  const add=()=>setForm(f=>f.exercicios.length>=12?f:{...f,exercicios:[...f.exercicios,novoExercicio()]});
  const remover=id=>setForm(f=>({...f,exercicios:f.exercicios.length===1?[novoExercicio()]:f.exercicios.filter(e=>e.id!==id)}));

  const salvar=()=>{
    const exercicios=form.exercicios
      .filter(e=>String(e.nome||'').trim())
      .map(e=>({
        id:e.id,
        nome:String(e.nome).trim(),
        series:clamp(e.series,1,8),
        repsAlvo:Math.max(0,Number(e.repsAlvo)||0),
        carga:String(e.carga||'').trim(),
        repeticoes:(e.repeticoes||[]).slice(0,clamp(e.series,1,8)).map(v=>v===''?null:Math.max(0,Number(v)||0))
      }));

    onSalvar?.({
      titulo:contexto?.titulo||'Treino',
      calorias:Math.max(0,Number(form.calorias)||0),
      passos:Math.max(0,Number(form.passos)||0),
      observacao:String(form.observacao||'').trim(),
      exercicios
    });
  };

  return <Sheet aberto={aberto} fechar={fechar} titulo="Registrar treino">
    <div className="trn-intro">
      <span className="trn-intro-icon"><Dumbbell size={21}/></span>
      <div>
        <b>{contexto?.titulo||'Treino'}</b>
        <small>{contexto?.data?new Date(contexto.data+'T12:00').toLocaleDateString('pt-BR'):'Hoje'} · exercícios, séries e repetições</small>
      </div>
    </div>

    <div className="trn-fields two">
      <label><span>Calorias <em>opcional</em></span><input type="number" inputMode="numeric" min="0" value={form.calorias} onChange={e=>setCampo('calorias',e.target.value)} placeholder="0"/></label>
      <label><span>Passos <em>opcional</em></span><input type="number" inputMode="numeric" min="0" value={form.passos} onChange={e=>setCampo('passos',e.target.value)} placeholder="0"/></label>
    </div>

    <div className="trn-section-head">
      <div><span>EXERCÍCIOS</span><h3>O que você precisa fazer</h3></div>
      <button type="button" onClick={add} disabled={form.exercicios.length>=12}><Plus size={16}/>Adicionar</button>
    </div>

    <div className="trn-list">
      {form.exercicios.map((ex,idx)=><article className="trn-ex" key={ex.id}>
        <div className="trn-ex-head">
          <strong>{idx+1}. Exercício</strong>
          <button type="button" onClick={()=>remover(ex.id)} aria-label="Remover exercício"><Trash2 size={15}/></button>
        </div>

        <label className="trn-wide"><span>Nome do exercício</span><input value={ex.nome} onChange={e=>atualizar(ex.id,{nome:e.target.value})} placeholder="Ex.: Leg press"/></label>

        <div className="trn-fields three">
          <label><span>Séries</span><input type="number" inputMode="numeric" min="1" max="8" value={ex.series} onChange={e=>mudarSeries(ex.id,e.target.value)}/></label>
          <label><span>Reps planejadas</span><input type="number" inputMode="numeric" min="0" value={ex.repsAlvo} onChange={e=>atualizar(ex.id,{repsAlvo:e.target.value})}/></label>
          <label><span>Carga <em>opcional</em></span><input value={ex.carga} onChange={e=>atualizar(ex.id,{carga:e.target.value})} placeholder="Ex.: 30 kg"/></label>
        </div>

        <div className="trn-reps">
          <span>Repetições realizadas por série <em>opcional</em></span>
          <div>
            {Array.from({length:clamp(ex.series,1,8)},(_,serie)=><label key={serie}>
              <small>S{serie+1}</small>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                value={ex.repeticoes?.[serie]??''}
                placeholder={String(ex.repsAlvo||'—')}
                onChange={e=>{
                  const reps=[...(ex.repeticoes||[])];
                  reps[serie]=e.target.value;
                  atualizar(ex.id,{repeticoes:reps});
                }}
              />
            </label>)}
          </div>
        </div>
      </article>)}
    </div>

    <label className="trn-note"><span>Observação <em>opcional</em></span><textarea value={form.observacao} onChange={e=>setCampo('observacao',e.target.value)} placeholder="Como foi o treino, ajuste de carga, dor, evolução..."/></label>

    {ultimo&&<div className="trn-last"><CheckCircle2 size={17}/><span><b>Último treino salvo</b><small>{new Date((ultimo.data||new Date().toISOString().slice(0,10))+'T12:00').toLocaleDateString('pt-BR')} · {(ultimo.exercicios||[]).length} exercício(s)</small></span></div>}

    <Btn onClick={salvar} style={{width:'100%',marginTop:14,padding:15}}>Salvar treino</Btn>
  </Sheet>;
}
