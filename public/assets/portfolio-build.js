/* Original presentation choreography, independent of the Swarm Rebuild extension. */
(()=>{
  const runs=new WeakMap(),active=new Set(),colors=['#c55443','#487bb7','#6a5aae','#348976','#b18636','#a75a91'];
  const duration=13000,timeScale=duration/8500;
  function mount(root,{enabled=true}={}){
    const old=runs.get(root);if(old){old.setEnabled(enabled);if(enabled)old.start();else old.stop();return;}
    const overlay=root.querySelector('.portfolio-swarm'),hud=root.querySelector('.build-controls');
    if(!overlay||!hud)return;
    let raf=0,started=0,elapsed=0,paused=false,playing=false,done=false,targets=[];
    const names=['Draw','Type','Align','Size'];
    const labels=['intro','headline','portrait','bio','role','caption','education'];
    overlay.innerHTML=Array.from({length:28},(_,i)=>`<span class="build-cursor" style="--cursor-color:${colors[i%colors.length]}"><svg viewBox="0 0 24 30" aria-hidden="true"><path d="M2 2L21 18L12 19L8 27Z" fill="currentColor" stroke="white" stroke-width="1.5"/></svg><i>${i===9?'Reveal':names[i%4]} ${labels[Math.floor(i/4)]}</i></span>`).join('')+'<div class="build-guide guide-x"></div><div class="build-guide guide-y"></div>';
    const cursors=[...overlay.querySelectorAll('.build-cursor')],xguide=overlay.querySelector('.guide-x'),yguide=overlay.querySelector('.guide-y');
    const startButton=hud.querySelector('[data-build="start"]'),pauseButton=hud.querySelector('[data-build="pause"]'),finishButton=hud.querySelector('[data-build="finish"]'),status=hud.querySelector('.build-status');
    function restore(){for(const t of targets){for(const n of t.nodes)n.el.nodeValue=n.text;t.el.style.opacity='';t.el.style.clipPath='';t.el.style.height=t.height;t.el.style.width=t.width;t.el.style.overflow=t.overflow;t.box.remove();}targets=[];}
    function stop(){cancelAnimationFrame(raf);playing=false;paused=false;root.classList.remove('is-building','build-complete');restore();overlay.classList.remove('visible');startButton.hidden=false;pauseButton.hidden=true;finishButton.hidden=true;startButton.textContent='Watch it build';status.textContent='28 cursors · an animated introduction';active.delete(api);}
    function prepare(){restore();const base=root.getBoundingClientRect();const selectors=['.portfolio-copy .kicker','.portfolio-copy h2','.portfolio-portrait img','.portfolio-lead','.portfolio-role','.portfolio-portrait figcaption','.portfolio-education'];
      targets=selectors.map((sel,i)=>{const el=root.querySelector(sel),r=el.getBoundingClientRect(),walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),nodes=[];let n;while(n=walker.nextNode())nodes.push({el:n,text:n.nodeValue});const box=document.createElement('div');box.className='build-selection';box.style.setProperty('--selection-color',colors[i%colors.length]);box.innerHTML='<span class="build-size"></span><b></b><b></b><b></b><b></b>';overlay.append(box);const t={el,nodes,box,x:r.left-base.left,y:r.top-base.top,w:r.width,h:r.height,height:el.style.height,width:el.style.width,overflow:el.style.overflow,start:(120+i*520)*timeScale,end:(120+i*520+3200)*timeScale,media:el.tagName==='IMG',count:nodes.reduce((a,n)=>a+n.text.length,0)};return t;});
      for(const t of targets){t.el.style.height=t.h+'px';t.el.style.width=t.w+'px';t.el.style.overflow='hidden';t.el.style.opacity='0';}
    }
    function start(){stop();if(!enabled||matchMedia('(prefers-reduced-motion: reduce)').matches){status.textContent='Motion is off';return;}prepare();playing=true;done=false;paused=false;elapsed=0;started=performance.now();root.classList.add('is-building');overlay.classList.add('visible');startButton.hidden=true;pauseButton.hidden=false;finishButton.hidden=false;pauseButton.textContent='Pause';active.add(api);raf=requestAnimationFrame(tick);}
    function tick(now){if(!playing||!root.isConnected){stop();return;}if(paused)return;elapsed=Math.max(0,now-started);const w=root.clientWidth,h=root.clientHeight;let stage='Gathering the cursors';
      for(const [i,t] of targets.entries()){const p=Math.max(0,Math.min(1,(elapsed-t.start)/(t.end-t.start)));if(p<=0)continue;t.el.style.opacity=p<.24?'0':'1';const draw=Math.min(1,p/.24);t.box.style.cssText=`--selection-color:${colors[i%colors.length]};left:${t.x}px;top:${t.y}px;width:${Math.max(3,t.w*draw)}px;height:${Math.max(3,t.h*draw)}px;opacity:${p<1?1:0}`;t.box.querySelector('.build-size').textContent=`${Math.round(t.w*draw)} × ${Math.round(t.h*draw)}`;if(p>=.24){const f=Math.min(1,(p-.24)/.76);if(t.media)t.el.style.clipPath=`inset(0 0 ${100-f*100}% 0)`;else{let left=Math.floor(t.count*f);for(const n of t.nodes){n.el.nodeValue=n.text.slice(0,Math.max(0,left));left-=n.text.length;}}}if(p<1)stage=i===2?'Placing the portrait':i>4?'Adding the finishing touches':'Drawing and typing';}
      // Every pointer belongs to one content block and performs a visible task.
      const ease=v=>v*v*(3-2*v);
      const edge=(t,p)=>{p=((p%1)+1)%1;const length=2*(t.w+t.h),d=p*length;
        if(d<t.w)return [t.x+d,t.y];if(d<t.w+t.h)return [t.x+t.w,t.y+d-t.w];
        if(d<2*t.w+t.h)return [t.x+2*t.w+t.h-d,t.y+t.h];return [t.x,t.y+length-d];};
      cursors.forEach((c,i)=>{const t=targets[Math.floor(i/4)],role=i%4,p=Math.max(0,Math.min(1,(elapsed-t.start)/(t.end-t.start)));let point;
        if(role===0){point=edge(t,elapsed/(2800*timeScale)+i*.11);}
        else if(role===1){const f=p<.24?0:Math.min(1,(p-.24)/.76);point=t.media?[t.x+t.w*(.15+.7*((elapsed/(2200*timeScale))%1)),t.y+t.h*f]:[t.x+t.w*((f*2.4)%1),t.y+Math.min(t.h-4,Math.max(12,t.h*(.3+.45*Math.floor(f*2))))];}
        else if(role===2){const sweep=ease((Math.sin(elapsed/(600*timeScale)+i)+1)/2);point=[t.x+t.w*sweep,t.y+t.h];}
        else{const sweep=ease((Math.sin(elapsed/(680*timeScale)+i)+1)/2);point=[t.x+t.w,t.y+t.h*sweep];}
        const intro=Math.min(1,elapsed/(500*timeScale)),home=[w*(.15+(i%7)*.12),h*(.15+Math.floor(i/7)*.18)];
        const x=home[0]+(point[0]-home[0])*ease(intro),y=home[1]+(point[1]-home[1])*ease(intro);
        c.style.transform=`translate(${x}px,${y}px)`;c.style.opacity=elapsed>duration-450*timeScale?String((duration-elapsed)/(450*timeScale)):'1';
        c.classList.toggle('worker-active',p>0&&p<1);
      });
      const focus=targets[Math.max(0,Math.min(targets.length-1,Math.floor(elapsed/(1100*timeScale))))];xguide.style.top=Math.round(focus.y+focus.h)+'px';yguide.style.left=Math.round(focus.x+focus.w)+'px';status.textContent=elapsed<duration?`${stage} · ${Math.min(100,Math.floor(elapsed/duration*100))}%`:'Built. Take a look, or replay it.';
      if(elapsed>=duration&&!done){done=true;root.classList.add('build-complete');for(const t of targets){for(const n of t.nodes)n.el.nodeValue=n.text;t.el.style.clipPath='';t.el.style.opacity='1';t.box.style.opacity='0';}startButton.hidden=false;startButton.textContent='Replay';pauseButton.hidden=true;finishButton.hidden=true;playing=false;overlay.classList.remove('visible');root.classList.remove('is-building');restore();active.delete(api);return;}
      raf=requestAnimationFrame(tick);
    }
    const api={start,stop,setEnabled:value=>{enabled=value;}};runs.set(root,api);startButton.onclick=start;pauseButton.onclick=()=>{paused=!paused;pauseButton.textContent=paused?'Resume':'Pause';if(paused)cancelAnimationFrame(raf);else{started=performance.now()-elapsed;raf=requestAnimationFrame(tick);}};finishButton.onclick=stop;if(enabled)start();
  }
  window.PortfolioBuild={mount,cancel:root=>{for(const api of [...active])if(root.querySelector('.portfolio-opening')||!root.isConnected)api.stop();},stopAll:()=>{for(const api of [...active])api.stop();}};
})();
