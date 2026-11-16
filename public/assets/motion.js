/* Presentation choreography. Visual timing only; it never makes model requests. */
(()=>{
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  let requested=true;
  try{requested=localStorage.getItem('second-mind-motion')!=='off';}catch{}
  const jobs=new Set(),sequences=new WeakMap(),originals=new WeakMap();
  const enabled=()=>requested&&!preference.matches;
  function paintControls(){
    document.body.classList.toggle('motion-off',!enabled());
    const toggle=document.querySelector('#motion-toggle');
    if(toggle){toggle.textContent=enabled()?'Motion on':'Motion off';toggle.setAttribute('aria-pressed',String(enabled()));toggle.title=preference.matches?'Reduced motion follows your system setting':'Toggle presentation animations (M)';toggle.disabled=preference.matches;}
    const replay=document.querySelector('#motion-replay');if(replay)replay.disabled=false;
  }
  function prepare(el){
    let text=originals.get(el);if(text===undefined){text=el.textContent;originals.set(el,text);}
    el.classList.add('type-copy');
    el.replaceChildren();
    const accessible=document.createElement('span');accessible.className='sr-only';accessible.textContent=text;
    const reserve=document.createElement('span');reserve.className='type-reserve';reserve.setAttribute('aria-hidden','true');reserve.textContent=text;
    const visible=document.createElement('span');visible.className='type-visible';visible.setAttribute('aria-hidden','true');
    const letters=document.createElement('span');letters.className='type-letters';
    const caret=document.createElement('span');caret.className='type-caret';caret.textContent='';visible.append(letters,caret);
    const dots=document.createElement('span');dots.className='type-dots';dots.setAttribute('aria-hidden','true');for(let i=0;i<3;i++)dots.append(document.createElement('i'));
    el.append(accessible,reserve,visible,dots);el.dataset.phase='queued';
    return {text,letters};
  }
  function type(el,role='assistant'){
    const {text,letters}=prepare(el);
    const slow = el.closest('[data-choreo=ask]') ? 1.5 : 1;
    if(!enabled()){letters.textContent=text;el.dataset.phase='done';return Promise.resolve();}
    return new Promise(resolve=>{
      let frame=0,timer=0,finished=false;
      const finish=()=>{if(finished)return;finished=true;clearTimeout(timer);cancelAnimationFrame(frame);letters.textContent=text;el.dataset.phase='done';jobs.delete(job);resolve();};
      const job={el,finish};jobs.add(job);el.dataset.phase='waiting';
      timer=setTimeout(()=>{if(!el.isConnected||!enabled())return finish();el.dataset.phase='typing';const start=performance.now(),duration=slow*Math.min(role==='user'?6500:4500,Math.max(600,Array.from(text).length*(role==='user'?24:18)));const chars=Array.from(text);
        const tick=now=>{if(!el.isConnected||!enabled())return finish();const fraction=Math.min(1,(now-start)/duration);letters.textContent=chars.slice(0,Math.ceil(chars.length*fraction)).join('');if(fraction===1)finish();else frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);
      },slow*(role==='user'?500:650));
    });
  }
  function cancel(root){
    window.PortfolioBuild?.cancel(root);
    const old=sequences.get(root);
    if(old){old.cancelled=true;for(const stop of [...old.gates])stop();}
    for(const job of [...jobs])if(root.contains(job.el)||!job.el.isConnected)job.finish();
  }
  function lockAnswer(group,locked){const answer=group.querySelector('[data-demo-answer]');if(answer){answer.classList.toggle('is-locked',locked);answer.setAttribute('aria-hidden',String(locked));answer.inert=locked;}}
  function initializeExchange(group){lockAnswer(group,true);const button=group.querySelector('[data-demo-send]');if(button){button.disabled=true;button.dataset.sendState='writing';button.innerHTML='Send <span aria-hidden="true">↑</span>';button.setAttribute('aria-label','Send example question');}}
  function waitForSend(group,sequence){
    const button=group.querySelector('[data-demo-send]');
    if(!button||sequence.cancelled)return Promise.resolve(false);
    return new Promise(resolve=>{
      let finished=false;
      const finish=sent=>{if(finished)return;finished=true;button.removeEventListener('click',send);sequence.gates.delete(stop);button.disabled=true;if(sent){button.dataset.sendState='sent';button.innerHTML='Sent <span aria-hidden="true">✓</span>';button.setAttribute('aria-label','Example question sent');}resolve(sent);};
      const send=()=>finish(true),stop=()=>finish(false);
      sequence.gates.add(stop);button.disabled=false;button.dataset.sendState='ready';button.addEventListener('click',send);
    });
  }
  function mount(root,{reveal=false}={}){
    cancel(root);const sequence={cancelled:false,gates:new Set()};sequences.set(root,sequence);
    const portfolio=root.querySelector(".portfolio-opening");if(portfolio)window.PortfolioBuild?.mount(portfolio,{enabled:enabled()});
    const intro=root.querySelector(".speaker-intro");if(intro){intro.classList.remove("build-active");if(enabled()){void intro.offsetWidth;intro.classList.add("build-active");}}
    if(reveal&&enabled()){
      const selectors='.kicker,h1,h2,.lead,.speaker-line,.tool-row,.speaker-portrait,.intro-role,.intro-origin,.intro-focus,.intro-education,.capability,.context-option,.context-preview,.choice,.learning-item,.room-summary>div,.plan-step,.proof-row,.version-card';
      const items=[...root.querySelectorAll(selectors)];items.forEach((el,i)=>{el.classList.remove('reveal-item');el.style.setProperty('--reveal-delay',`${Math.min(i*45,360)}ms`);});
      void root.offsetWidth;items.forEach(el=>el.classList.add('reveal-item'));
    }
    const groups=[...(root.matches?.('[data-demo-exchange]')?[root]:[]),...root.querySelectorAll('[data-demo-exchange]')];groups.forEach(initializeExchange);
    const lines=[...root.querySelectorAll('[data-write]')];lines.forEach(prepare);
    (async()=>{for(const el of lines){
      if(sequence.cancelled||!root.isConnected)return;
      const answer=el.closest('[data-demo-answer]'),group=answer?.closest('[data-demo-exchange]');
      if(group){const sent=await waitForSend(group,sequence);if(!sent||sequence.cancelled||!root.isConnected)return;lockAnswer(group,false);}
      await type(el,el.dataset.write||'assistant');
    }})();
  }
  function set(value){if(!value)window.PortfolioBuild?.stopAll();requested=value;try{localStorage.setItem('second-mind-motion',value?'on':'off');}catch{}paintControls();if(!enabled()){document.querySelectorAll(".build-active").forEach(el=>el.classList.remove("build-active"));for(const job of [...jobs])job.finish();}}
  preference.addEventListener('change',()=>{paintControls();if(!enabled())for(const job of [...jobs])job.finish();});
  window.PresentationMotion={enabled,mount,cancel,type,toggle:()=>set(!requested),replay:()=>{const stage=document.querySelector('#scene');if(stage)mount(stage,{reveal:true});}};
  paintControls();
})();
