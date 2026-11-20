import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {chromium} from '@playwright/test';

const root=resolve(import.meta.dirname,'../public');
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.webm':'video/webm'};
const server=createServer(async(req,res)=>{
 const path=resolve(root,'.'+new URL(req.url,'http://localhost').pathname.replace(/\/$/,'/index.html'));
 if(!path.startsWith(root+'/')){res.writeHead(403).end();return;}
 try{res.setHeader('Content-Type',mime[extname(path)]||'application/octet-stream');res.end(await readFile(path));}
 catch{res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const url=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||undefined});
const slides=[0,17,2,4,10,11,12,13,3,18,8,20,16];
const screens=[[1440,900],[1920,1080],[3840,2160],[2560,1080],[1024,768],[1280,720],[800,600],[390,844]];
let checked=0;
async function checkBounds(page,label){
 const errors=await page.evaluate(()=>{
  const scene=document.querySelector('#scene'),b=scene.getBoundingClientRect(),errors=[];
  for(const el of scene.querySelectorAll('*')){
   if(el.closest('[hidden],.sv-layer,.portfolio-swarm,.build-controls,.sv-ideas')||!el.textContent.trim()||el.children.length)continue;
   const style=getComputedStyle(el);
   if(style.display==='none'||style.visibility==='hidden'||!el.getClientRects().length)continue;
   const r=el.getBoundingClientRect();
   if(r.left<b.left-2||r.right>b.right+2||(innerWidth>700&&(r.top<b.top-2||r.bottom>b.bottom+2)))errors.push(el.textContent.slice(0,60));
  }
  if(document.documentElement.scrollWidth>innerWidth+1||document.documentElement.scrollHeight>innerHeight+1)errors.push('Page overflows viewport');
  return errors;
 });
 assert.deepEqual(errors,[],label);
}
try{
 const sizes=new Map();
 for(const [width,height] of screens){
  const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
  await page.goto(url+'/#0');
  for(const slide of slides){
   await page.evaluate(n=>location.hash=String(n),slide);
   await page.waitForFunction(n=>document.querySelector('#scene').dataset.scene===String(n),slide);
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   await checkBounds(page,`${width}x${height}, slide ${slide}`);checked++;
   if(slide===10)sizes.set(width,await page.locator('.story-head h2').evaluate(el=>parseFloat(getComputedStyle(el).fontSize)));
   if(slide===2){
    for(const reveal of [false,true]){
     if(reveal)await page.locator('[data-action="reveal"]').click();
     for(let i=(reveal?2:0);i<(reveal?3:2);i++){
      await page.locator('[data-demo-send]:enabled').first().click();
      await page.waitForFunction(n=>document.querySelectorAll('.ba-chats .demo-answer:not(.is-locked)').length===n,i+1);
      await checkBounds(page,`${width}x${height}, comparison answer ${i+1}, note ${reveal}`);
     }
    }
   }
   if(slide===4){
    await page.locator('#ob-plan').click();
    assert.equal(await page.locator('#detail-dialog').evaluate(el=>el.open),true);
    await page.locator('#detail-dialog .close-dialog').click();
   }
   if(slide===18){
    await page.locator('[data-oc-file="memory/2026-11-24.md"]').click();
    await checkBounds(page,`${width}x${height}, longest workspace file`);
   }
   if(slide===8){
    await page.locator('[data-demo-send]:enabled').click();
    await page.waitForFunction(()=>!document.querySelector('.sv-after .demo-answer').classList.contains('is-locked'));
    await checkBounds(page,`${width}x${height}, Telegram reply`);
   }
  }
  if(width===1920){await page.locator('#fullscreen').click();await page.waitForFunction(()=>!!document.fullscreenElement);await checkBounds(page,'Full screen');await page.evaluate(()=>document.exitFullscreen());}
  await page.close();
 }
 assert(sizes.get(3840)>sizes.get(1440)*2,'4K type must scale with the slide instead of stopping at the laptop cap');
 console.log(`Passed ${checked} slide layouts, comparison replies, file dialogs, longest memory note, Telegram reply and full-screen mode.`);
}finally{await browser.close();server.close();}
