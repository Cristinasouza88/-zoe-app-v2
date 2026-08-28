import React from 'react';
import './NIILOrb.css';

const LABELS={
  idle:'NIIL disponível',
  listening:'NIIL ouvindo',
  thinking:'NIIL processando',
  responding:'NIIL respondendo',
  done:'NIIL concluído'
};

export default function NIILOrb({
  state='idle',
  size=160,
  label,
  className='',
  showStatus=false
}){
  const normalized=['idle','listening','thinking','responding','done'].includes(state)?state:'idle';
  return(
    <div
      className={`niil-orb-wrap ${className}`}
      style={{'--niil-orb-size':`${size}px`}}
    >
      <div
        className={`niil-orb niil-orb--${normalized}`}
        role="img"
        aria-label={label||LABELS[normalized]}
      >
        <span className="niil-orb__glass"/>
        <span className="niil-orb__blob niil-orb__blob--green"/>
        <span className="niil-orb__blob niil-orb__blob--ink"/>
        <span className="niil-orb__blob niil-orb__blob--light"/>
        <span className="niil-orb__blob niil-orb__blob--soft"/>
        <span className="niil-orb__orbit niil-orb__orbit--one"/>
        <span className="niil-orb__orbit niil-orb__orbit--two"/>
      </div>
      {showStatus&&<span className="niil-orb__status">{label||LABELS[normalized]}</span>}
    </div>
  );
}
