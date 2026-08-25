export default function campoPrefixo(){
  return {
    name:'niil-ui-campo-prefixo',
    enforce:'pre',
    transform(code,id){
      if(!id.endsWith('/ui.jsx')&&!id.endsWith('ui.jsx')) return null;
      const antigo=`export const Campo = ({ label, ...p }) => (\n  <div style={{ marginBottom: 12 }}>\n    {label && <label style={{ fontSize: 12, fontWeight: 700, color: C.ink2, display: 'block', marginBottom: 6 }}>{label}</label>}\n    <input {...p} style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: \`1.5px solid \${C.line}\`, fontSize: 15, color: C.ink, fontFamily: 'inherit', outline: 'none', background: '#FAFCFB', ...p.style }} />\n  </div>\n);`;
      if(!code.includes(antigo)) return null;
      const novo=`export const Campo = ({ label, prefix, ...p }) => (\n  <div style={{ marginBottom: 12 }}>\n    {label && <label style={{ fontSize: 12, fontWeight: 700, color: C.ink2, display: 'block', marginBottom: 6 }}>{label}</label>}\n    <div style={{ position: 'relative' }}>\n      {prefix && <span aria-hidden=\"true\" style={{ position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',zIndex:1,color:C.petroleo,fontSize:13,fontWeight:900,pointerEvents:'none' }}>{prefix}</span>}\n      <input {...p} style={{ width: '100%', padding: prefix ? '12px 14px 12px 54px' : '12px 14px', borderRadius: 12, border: \`1.5px solid \${C.line}\`, fontSize: 15, color: C.ink, fontFamily: 'inherit', outline: 'none', background: '#FAFCFB', ...p.style }} />\n    </div>\n  </div>\n);`;
      return {code:code.replace(antigo,novo),map:null};
    }
  };
}
