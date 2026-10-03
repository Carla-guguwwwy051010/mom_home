import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
const root=new URL('./',import.meta.url);
let code;
if(process.argv.includes('--prebundled'))code=await readFile(new URL('bundle-complete.js',root),'utf8');
else{const result=await build({entryPoints:[fileURLToPath(new URL('app-complete.js',root))],bundle:true,minify:true,format:'iife',target:'es2020',write:false});code=result.outputFiles[0].text;}
for(let i=1;i<=4;i++){const data=await readFile(new URL(`assets/embedded-card-${i}.jpg`,root));code=code.replace(`/*__CARD${i}__*/`,'data:image/jpeg;base64,'+data.toString('base64'));}
if(/__CARD[1-4]__/.test(code))throw Error('Unresolved card asset');
const template=await readFile(new URL('page.html',root),'utf8');
const theme=await readFile(new URL('theme.css',root),'utf8');
const license=await readFile(new URL('node_modules/three/LICENSE',root),'utf8');
if(!template.includes('/*__THEME__*/')||!template.includes('/*__APP__*/'))throw Error('Missing HTML injection marker');
const html=template.replace('/*__THEME__*/',()=>theme).replace('/*__APP__*/',()=>code)+'\n<!-- Third-party library: Three.js\n'+license+'\n-->';
await mkdir(new URL('dist/',root),{recursive:true});
await writeFile(new URL('dist/mom-home-complete.html',root),html);
console.log(`Built self-contained HTML: ${Buffer.byteLength(html)} bytes`);
