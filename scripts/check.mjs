import {readdir,readFile,stat,access} from 'node:fs/promises';
import {join,dirname,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
const root=resolve(import.meta.dirname,'..');
const pub=join(root,'public');
async function walk(dir){const result=[];for(const entry of await readdir(dir,{withFileTypes:true})){if(entry.name.startsWith('.')) continue;const p=join(dir,entry.name);if(entry.isDirectory())result.push(...await walk(p));else result.push(p);}return result;}
const files=await walk(pub);let checked=0;
for(const file of files){
 if(file.endsWith('.js')){const r=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(r.status)throw Error(r.stderr);}
 if(!/\.(html|js|css|md|json|svg)$/.test(file))continue;
 const text=await readFile(file,'utf8');
 for(const pattern of [/\/Users\//,/5725869865/,/h\.almubarak@sifi\.sa/,/hashem\.m\.almubarak@gmail\.com/,/\b\d{8,12}:[A-Za-z0-9_-]{30,}\b/,/sk-(?:proj-)?[A-Za-z0-9_-]{25,}/])if(pattern.test(text))throw Error(`Private-data boundary failed: ${file}`);
 if(file.endsWith('.html')){
  for(const match of text.matchAll(/(?:href|src)="([^"#?]+)(?:[^\"]*)"/g)){
   const path=match[1];if(/^(?:https?:|obsidian:|data:|mailto:)/.test(path))continue;
   const target=resolve(dirname(file),path);if(!target.startsWith(pub))throw Error(`Outside public root: ${path}`);
   try{await access(target);}catch{throw Error(`Missing local asset ${path} in ${file}`);}checked++;
  }
 }
}
for(const excluded of ['preparation.html','assets/second-mind-preparation.zip','presenter-notes.json','.env','server.mjs']){
 try{await stat(join(pub,excluded));throw Error(`Private file included: ${excluded}`);}catch(error){if(error.code!=='ENOENT')throw error;}
}
const starter=await readdir(join(root,'starter-vault'));
if(starter.includes('signup.html')||starter.includes('next-step.md'))throw Error('Starter contains generated state');
console.log(`Checked ${files.length} public files, ${checked} HTML asset/link references, JS syntax and publication boundaries.`);
