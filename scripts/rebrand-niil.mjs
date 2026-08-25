import fs from 'node:fs';import path from 'node:path';
const raiz=process.cwd();
const extensoes=new Set(['.js','.jsx','.mjs','.css','.html','.json','.md','.webmanifest','.toml','.yml','.yaml','.svg']);
const excluir=new Set(['niil-runtime.js','scripts/rebrand-niil.mjs','functions/niil-data.mjs']);
function andar(dir){for(const nome of fs.readdirSync(dir)){if(['.git','node_modules','dist'].includes(nome))continue;const p=path.join(dir,nome),rel=path.relative(raiz,p).replaceAll('\\','/');const st=fs.statSync(p);if(st.isDirectory()){andar(p);continue}if(!extensoes.has(path.extname(nome))||excluir.has(rel))continue;let s=fs.readFileSync(p,'utf8');const original=s;s=s.replaceAll('Zoë','NIIL').replaceAll('zoë','niil').replaceAll('ZOE','NIIL').replaceAll('Zoe','NIIL').replaceAll('zoe','niil');if(s!==original)fs.writeFileSync(p,s)}}
andar(raiz);
const app=path.join(raiz,'NiilAppCore.jsx');if(fs.existsSync(app)){let s=fs.readFileSync(app,'utf8');s=s.replace("perfil: { nome: '', email: '', metaKcal: 1500, metaAgua: 3000, avatar: null }","perfil: { nome: '', email: '', metaKcal: 1500, metaAgua: 3000, avatar: 'niil' }");s=s.replace(/\n\s*<button onClick=\{\(\) => setSheet\('avatar'\)\}[\s\S]*?<\/button>\n\s*<button onClick=\{\(\) => \{ setSheet\(null\); permissao\(\); \}\}/m,'\n            <button onClick={() => { setSheet(null); permissao(); }}');s=s.replace(/\n\s*<Sheet\s+aberto=\{sheet === 'avatar'[\s\S]*?<\/Sheet>\n\n\s*<Sheet aberto=\{sheet === 'treino'\}/m,"\n\n        <Sheet aberto={sheet === 'treino'}");fs.writeFileSync(app,s)}
const renames=[['avatar-zoe-fun.data.js','avatar-niil-fun.data.js'],['avatar-zoe-essencial.data.js','avatar-niil-essencial.data.js']];for(const [a,b] of renames){if(fs.existsSync(a)&&!fs.existsSync(b))fs.renameSync(a,b)}
for(const p of ['ZoeOrb.jsx','ZoeOrbCloud.jsx','functions/zoe-data.mjs'])if(fs.existsSync(p))fs.rmSync(p);
console.log('Rebrand NIIL aplicado.');
