/* Stage visuals: large coded illustrations and scripted cursors for the signup route.
   Loaded last. Visual timing only: nothing here calls a model, writes a file or sends a message.
   Every slide is authored in its finished state. A script hides the parts it is about to
   build, performs them with labelled cursors, then removes every cursor. Motion off or
   leaving the slide jumps straight to the finished state. */
(() => {
  const COLORS = ['#b83f27', '#2f6fb0', '#6a5aae', '#2f8872', '#a8782a'];
  const STOP = Symbol('stop');
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  let run = null;

  function stop() {
    if (!run) return;
    const me = run; run = null;
    me.cancelled = true;
    for (const finish of me.finish.splice(0)) finish();
    me.layer.remove();
    me.root.classList.remove('sv-pre');
  }

  function play(root) {
    stop();
    if (!root || !scripts[root.dataset.choreo] || !PresentationMotion.enabled()) return;
    root.querySelectorAll('.on,.sv-marked').forEach(el => el.classList.remove('on', 'sv-marked'));
    const layer = document.createElement('div');
    layer.className = 'sv-layer'; layer.setAttribute('aria-hidden', 'true'); root.append(layer);
    const me = run = { root, layer, cancelled: false, finish: [] };
    root.classList.add('sv-pre');
    const c = api(me);
    c.wait(['cover', 'clip', 'cartoon'].includes(root.dataset.choreo) ? 380 : 1400) // leave a reading beat before teaching sequences
      .then(() => scripts[root.dataset.choreo](c))
      .catch(error => { if (error !== STOP) console.error(error); })
      .finally(() => { if (run === me) stop(); });
  }

  function api(me) {
    const q = s => typeof s === 'string' ? me.root.querySelector(s) : s;
    const alive = () => { if (me.cancelled || !me.root.isConnected) throw STOP; };
    const pace = ['folder','tools','requirement','build','change','continued','pipeline','ask','close','workspace','usecases'].includes(me.root.dataset.choreo) ? 1.7 : 1;
    const wait = async ms => { await sleep(ms * pace); alive(); };
    const base = () => me.root.getBoundingClientRect();
    const on = sel => me.root.querySelectorAll(sel).forEach(el => el.classList.add('on'));
    let count = 0;

    // A draggable is authored at its destination. place() parks it at its starting point.
    function place(target, from, fx = .5, fy = .5) {
      const t = q(target), f = q(from).getBoundingClientRect(), r = t.getBoundingClientRect();
      t._from = [f.left + f.width * fx - (r.left + r.width / 2), f.top + f.height * fy - (r.top + r.height / 2)];
      me.finish.push(() => { t.style.transition = ''; t.style.transform = ''; t.classList.remove('sv-drag'); });
      t.style.transition = 'none';
      t.style.transform = `translate(${t._from[0]}px,${t._from[1]}px)`;
    }
    // Temporarily show an earlier value; the authored (final) value returns at the end.
    function set(target, text) {
      const t = q(target), final = t.textContent;
      me.finish.push(() => { t.textContent = final; });
      t.textContent = text;
      return () => { t.textContent = final; };
    }

    function cursor(label, fx, fy) {
      const color = COLORS[count++ % COLORS.length];
      const el = document.createElement('span');
      el.className = 'build-cursor sv-cursor';
      el.style.setProperty('--cursor-color', color);
      el.innerHTML = `<svg viewBox="0 0 24 30"><path d="M2 2L21 18L12 19L8 27Z" fill="currentColor" stroke="white" stroke-width="1.5"/></svg><i>${label}</i>`;
      let x = base().width * fx, y = base().height * fy;
      const move = ms => { el.style.transitionDuration = (ms * pace) + 'ms'; el.style.transform = `translate(${x}px,${y}px)`; el.classList.toggle('flip', x > base().width * .78); }; // labels near the right edge sit to the left
      move(0); me.layer.append(el); void el.offsetWidth; el.classList.add('on');
      const self = {
        async to(target, { fx = .5, fy = .5, ms = 400 } = {}) {
          alive();
          const b = base(), r = q(target).getBoundingClientRect();
          x = r.left - b.left + r.width * fx; y = r.top - b.top + r.height * fy;
          move(ms); await wait(ms + 30); return self;
        },
        async click(target, opts) {
          await self.to(target, opts);
          el.classList.add('press'); await wait(150); el.classList.remove('press'); return self;
        },
        // Draw a selection box around the target, corner to corner.
        async select(target, { tag = '', hold = 900 } = {}) {
          const t = q(target), pad = 5;
          await self.to(t, { fx: 0, fy: 0, ms: 340 });
          const b = base(), r = t.getBoundingClientRect();
          const box = document.createElement('div');
          box.className = 'build-selection sv-box';
          box.style.cssText = `--selection-color:${color};left:${r.left - b.left - pad}px;top:${r.top - b.top - pad}px;width:4px;height:4px;opacity:1`;
          box.innerHTML = (tag ? `<span class="build-size">${tag}</span>` : '') + '<b></b><b></b><b></b><b></b>';
          me.layer.append(box); void box.offsetWidth;
          box.style.width = r.width + pad * 2 + 'px'; box.style.height = r.height + pad * 2 + 'px';
          await self.to(t, { fx: 1, fy: 1, ms: 360 });
          t.classList.add('sv-marked');
          await wait(hold);
          box.style.opacity = '0'; setTimeout(() => box.remove(), 300);
          return self;
        },
        // Type the element's own text. The untyped remainder keeps its space, so nothing jumps.
        async type(target, { ms = 20 } = {}) {
          const t = q(target), final = t.textContent, chars = [...final];
          me.finish.push(() => { t.textContent = final; });
          await self.to(t, { fx: 0, fy: .5, ms: 320 });
          t.innerHTML = '<span class="sv-typed"></span><span class="sv-rest"></span>';
          const [typed, rest] = t.children;
          rest.textContent = final; t.classList.add('on');
          for (let i = 1; i <= chars.length; i++) {
            typed.textContent = chars.slice(0, i).join(''); rest.textContent = chars.slice(i).join('');
            if (i % 3 === 0 || i === chars.length) {
              const lines = typed.getClientRects(), last = lines[lines.length - 1], b = base();
              if (last) { x = last.right - b.left + 2; y = last.top - b.top + last.height * .6; move(60); }
            }
            await wait(ms);
          }
          t.textContent = final; return self;
        },
        // Carry a placed element to where it belongs.
        async drag(target, { ms = 560 } = {}) {
          const t = q(target), [dx, dy] = t._from;
          t.classList.add('on');
          await self.to(t, { ms: 360 });
          el.classList.add('press'); t.classList.add('sv-drag'); await wait(130);
          t.style.transition = `transform ${ms * pace}ms cubic-bezier(.3,.7,.2,1)`; t.style.transform = 'translate(0,0)';
          x -= dx; y -= dy; move(ms); await wait(ms + 40);
          el.classList.remove('press'); t.classList.remove('sv-drag'); return self;
        },
        label(text) { el.querySelector('i').textContent = text; return self; },
        async leave() { el.classList.remove('on'); await wait(240); el.remove(); }
      };
      return self;
    }
    return { q, wait, on, place, set, cursor, finish: f => me.finish.push(f) };
  }

  /* ---------- choreography: one short script per slide ---------- */
  const scripts = {
    // Opening: three loose decisions are collected into one saved note, then the tools line up along it.
    async cover(c) {
      c.place('#r1', '.keynote-cover h1', .05, .2); c.place('#r2', '.keynote-cover h1', .55, .25); c.place('#r3', '.keynote-cover h1 em', .8, .6);
      const ideas = [...c.q('.sv-ideas').children].filter(el => el.offsetParent), note = c.q('#r-note'); // none on very narrow windows
      for (const idea of ideas) c.finish(() => { idea.style.transition = idea.style.transform = idea.style.opacity = ''; });
      await c.wait(5000); // leave all three decisions still long enough to read
      const cursors = [c.cursor('Collect', .55, .05), c.cursor('Collect', .98, .2), c.cursor('Collect', .6, .6)];
      await c.wait(500);
      for (const [i, idea] of ideas.entries()) {
        await cursors[i].click(idea, { ms: 600 });
        await c.wait(800); // show one selected decision at a time
        const to = note.getBoundingClientRect(), from = idea.getBoundingClientRect();
        idea.style.transition = 'transform 1.1s cubic-bezier(.3,.7,.2,1), opacity .25s .9s';
        idea.style.transform = `translate(${to.left + to.width / 2 - from.left - from.width / 2}px,${to.top + to.height / 2 - from.top - from.height / 2}px) scale(.6)`;
        idea.style.opacity = '0';
        await cursors[i].to(note, { ms: 1100 }); c.on('#r-note');
        await c.wait(300);
      }
      c.on('#r-note');
      await c.wait(1200); // let the shared note register before introducing the tools
      const tools = [['Plan', '#r1', '#rl1'], ['Build', '#r2', '#rl2'], ['Message', '#r3', '#rl3']];
      await Promise.all(tools.map(async ([label, logo, line], i) => {
        cursors[i].label(label); await c.wait(i * 400); await cursors[i].drag(logo, { ms: 700 }); c.on(line); await c.wait(350); await cursors[i].leave();
      }));
    },
    async folder(c) {
      const a = c.cursor('Open the note', .08, .95), b = c.cursor('Same file', .92, .95), d = c.cursor('Give access', .6, 1);
      await Promise.all([
        (async () => {
          await a.click('#ob-plan'); c.on('#ob-plan');
          await a.type('.sv-note h3'); c.on('[data-step=n2]');
          await a.type('#ob-decision'); c.on('[data-step=n3]');
          await a.select('#ob-label mark', { tag: 'the decision' }); await a.leave();
        })(),
        (async () => {
          await c.wait(1500); await b.select('#fi-plan', { tag: 'signup-plan.md' }); c.on('[data-step=same]');
          await b.select('#fi-build', { tag: 'build-signup.md' }); await b.leave();
        })(),
        (async () => {
          await c.wait(3800); c.on('[data-step=path]'); await d.type('.sv-path code', { ms: 34 }); await c.wait(300); await d.leave();
        })()
      ]);
    },
    async tools(c) {
      c.place('#f-page', '#t-cc'); c.place('#f-next', '#t-oc');
      const a = c.cursor('Edit the plan', .1, .1), b = c.cursor('Build', .4, .05), e = c.cursor('Same files', .65, .1), d = c.cursor('Planned', .9, .1);
      await Promise.all([
        (async () => { await a.select('#f-plan', { tag: 'you edit' }); await a.select('#f-build', { tag: 'you edit' }); await a.leave(); })(),
        (async () => { await c.wait(1500); await b.drag('#f-page'); await b.leave(); })(),
        (async () => { await c.wait(2700); await e.select('#t-gpt', { tag: 'same folder', hold: 1300 }); await e.leave(); })(),
        (async () => { await c.wait(3300); await d.drag('#f-next'); await d.select('#f-next', { tag: 'extension' }); await d.leave(); })()
      ]);
    },
    async requirement(c) {
      const a = c.cursor('The email field', .1, .2), b = c.cursor('The button', .5, .1), d = c.cursor('The confirmation', .95, .8);
      await Promise.all([
        (async () => { await a.select('#rq-1'); c.on('[data-step=k1]'); await c.wait(1200); await a.leave(); })(),
        (async () => { await c.wait(1700); await b.select('#rq-2'); c.on('[data-step=k2]'); await c.wait(1200); await b.leave(); })(),
        (async () => { await c.wait(3400); await d.select('#rq-3'); c.on('[data-step=k3]'); await c.wait(1500); await d.leave(); })()
      ]);
    },
    async build(c) {
      const a = c.cursor('Run the build', .1, .95);
      await a.type('#tm-cmd', { ms: 22 });
      for (const step of ['t1', 't2', 't3']) { await c.wait(850); c.on(`[data-step=${step}]`); }
      await c.wait(900); c.on('[data-step=page]');
      const b = c.cursor('Count the fields', .7, .1), d = c.cursor('Try it', .95, .9);
      await Promise.all([
        a.leave(),
        b.select('#bf-input', { tag: '1 field · email' }).then(() => b.leave()),
        (async () => { await c.wait(2200); await d.type('#bf-text', { ms: 30 }); await d.click('#bf-btn'); c.on('[data-step=ok]'); await c.wait(1400); await d.leave(); })()
      ]);
    },
    async change(c) {
      const a = c.cursor('Edit the source', .1, .2), b = c.cursor('Read the same folder', .5, 1), d = c.cursor('Edit and check', .95, .2);
      await a.select('#ch-old1', { tag: 'old label', hold: 1000 }); c.on('#ch-old1'); await a.type('#ch-1', { ms: 60 });
      await a.select('#ch-old2', { tag: 'old label', hold: 1000 }); c.on('#ch-old2'); await a.type('#ch-2', { ms: 60 });
      await a.type('#ch-log', { ms: 26 }); await a.leave();
      await b.select('#ch-attach', { tag: 'current files', hold: 1500 });
      c.on('[data-step=revise]'); await b.type('#ch-prompt', { ms: 30 }); await b.click('#ch-run'); await b.leave();
      await c.wait(1600); c.on('[data-step=returned]');
      await d.select('#ch-btn', { tag: 'edited in place · verify', hold: 1600 }); await d.leave();
    },
    async pipeline(c) {
      const a = c.cursor('Connect', .05, .5), b = c.cursor('Route', .3, .1), d = c.cursor('Project access', .6, .9);
      const link = async (cur, from, line, to, delay) => {
        await c.wait(delay); await cur.to(from, { fx: .95 }); c.on(line); await cur.to(to, { fx: .08, ms: 700 });
      };
      await Promise.all([link(a, '#p1', '#l1', '#p2', 0), link(b, '#p2', '#l2', '#p3', 1000), link(d, '#p3', '#l3', '#p4', 2000)]);
      const e = c.cursor('Status', .9, 0);
      await Promise.all([
        b.leave(), d.leave(),
        (async () => { for (const s of ['s1', 's2', 's3', 's4']) { await a.click(`[data-step=${s}]`, { fx: .04, ms: 450 }); c.on(`[data-step=${s}]`); await c.wait(500); } await a.leave(); })(),
        e.select('.sv-stamp', { tag: 'extension', hold: 900 }).then(() => e.leave())
      ]);
    },
    async ask(c) {
      const a = c.cursor('Plan', .6, .05), b = c.cursor('Page', .8, .05);
      await Promise.all([
        a.select('#ak-1').then(() => a.leave()),
        c.wait(700).then(() => b.select('#ak-2')).then(() => b.leave())
      ]);
    },
    async workspace(c) {
      const a = c.cursor('Identity + instructions', .06, .12);
      for (const id of ['#oc-f0','#oc-f1','#oc-f2']) {
        c.on(id); await a.select(id, {hold: 1100});
      }
      await a.leave();
      const b = c.cursor('Preferences + memory', .48, .12);
      for (const id of ['#oc-f3','#oc-f4','#oc-f5']) {
        c.on(id); await b.select(id, {hold: 1100});
      }
      c.on('#oc-foot'); await b.select('#oc-foot', {tag:'Readable in Obsidian',hold:1400});
      await b.leave();
    },
    async usecases(c) {
      const a = c.cursor('Capture + explore', .05, .12);
      for (const id of ['#oc-use0','#oc-use1']) {
        c.on(id); await a.select(`${id} h3`, {hold:1500}); await c.wait(650);
      }
      await a.leave();
      const b = c.cursor('Make it useful', .55, .12);
      for (const id of ['#oc-use2','#oc-use3']) {
        c.on(id); await b.select(`${id} h3`, {hold:1500}); await c.wait(650);
      }
      c.on('#oc-use-footer'); await b.leave();
    },
    async close(c) {
      const a = c.cursor('Recap', .05, .5), b = c.cursor('Connect', .95, .1);
      await Promise.all([
        (async () => { for (const chip of c.q('.sv-recap').children) { await a.click(chip, { ms: 450 }); chip.classList.add('on'); await c.wait(600); } await a.leave(); })(),
        c.wait(2000).then(() => b.select('.linkedin-qr', { tag: 'LinkedIn', hold: 2000 })).then(() => b.leave())
      ]);
    },
    // Legacy note-motion fallback. The new 19.8-second motion film has its own captions.
    // The new film holds its final frame and does not start this legacy animation.
    async clip(c) {
      c.place('#ct-note', '#ct-cap', .5, .5);
      const a = c.cursor('Pass the note', .5, 1);
      await a.drag('#ct-note', { ms: 800 });
      await a.leave();
    },
    async cartoon(c) {
      const cap = c.q('#ct-cap'), final = cap.textContent;
      c.finish(() => { cap.textContent = final; cap.classList.add('on'); });
      const say = async (text, ms) => { cap.classList.remove('on'); await c.wait(200); cap.textContent = text; cap.classList.add('on'); await c.wait(ms); };
      c.place('#ct-note', '#ct-cap', .5, .5);
      await say('Yesterday: a really good planning chat.', 2300);
      await say('Today: a new chat, in a different tool.', 2500);
      await say('The plan was in the other chat.', 2300);
      const a = c.cursor('Pass the note', .5, 1);
      await a.drag('#ct-note', { ms: 800 });
      await Promise.all([a.leave(), say(final, 1600)]);
    }
  };

  /* ---------- slide markup ---------- */
  const win = (cls, title, body) => `<div class="sv-win ${cls}"><div class="sv-bar"><i></i><i></i><i></i><span>${title}</span></div><div class="sv-body">${body}</div></div>`;
  const file = (name, attrs = '', by = '') => `<span class="sv-file" ${attrs}><b>${name.endsWith('.html') ? 'HTML' : 'MD'}</b>${name}${by ? `<i>${by}</i>` : ''}</span>`;
  const doc = (name, note, body) => `<article class="sv-doc"><header><b>MD</b>${name}${note ? `<em>${note}</em>` : ''}</header><div>${body}</div></article>`;
  const foot = () => ``; // Speaker instructions live in the separate files, not the audience deck.
  const slide = (name, kicker, title, stage, footer) => `<div class="simple-deck sv" data-choreo="${name}">${storyHead(kicker, title)}${stage}${footer}</div>`;
  const icon = {
    plane: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M6 23 42 8 34 40 22 30 30 18 16 28Z" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/></svg>',
    model: '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="12" y="12" width="24" height="24" rx="4" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M19 6v6M29 6v6M19 36v6M29 36v6M6 19h6M6 29h6M36 19h6M36 29h6" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>',
    folder: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M5 12h14l4 5h20v22H5Z" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/></svg>'
  };
  const telegramRequest = 'Read signup-plan.md and signup.html. Tell me the current button label and why it changed, quoting the saved decision log. Suggest one useful next action, save it as next-step.md and tell me which files you used. Do not modify signup.html. If a file is unavailable, say what is missing.';

  const cover = sceneViews[0];
  sceneViews[0] = () => cover()
    .replace('class="keynote-cover"', 'class="keynote-cover sv-host" data-choreo="cover"')
    .replace('<div class="cover-byline">', '<div class="sv-coverfoot"><div class="cover-byline">')
    .replace(/<\/div><\/div>$/, `</div><div class="sv-ideas" aria-hidden="true"><span>One email field</span><span>Button: Join waitlist</span><span>Local confirmation</span></div><div class="sv-rail"><img id="r1" data-step="r" src="assets/brands/chatgpt.svg" alt="ChatGPT"><i class="sv-link" id="rl1"></i>${file('signup-plan.md', 'id="r-note" data-step="r"')}<i class="sv-link" id="rl2"></i><img id="r2" data-step="r" src="assets/brands/claude.svg" alt="Claude"><i class="sv-link" id="rl3"></i><img id="r3" data-step="r" src="assets/brands/openclaw.svg" alt="OpenClaw"></div></div></div>`);

  let obsidianIntroduced = false;
  sceneViews[2] = () => `
    <div class="story-reset sv-before-after">
      <header class="story-reset-head"><span class="kicker">THE SAME QUESTION · BEFORE AND AFTER</span><h2>Give the next tool <em>the plan.</em></h2></header>
      <div class="story-reset-body">
        <div class="decision-story">
          <div class="earlier-decision"><span>TEAM PROJECT</span><strong>Signup page</strong><p>We agreed on one email field.</p></div>
          <p class="lead">The conversation knows.<br>The next tool needs the note.</p>
          <section id="obsidian-intro" class="ba-obsidian-intro" aria-label="Obsidian introduction" ${contextRevealed || obsidianIntroduced ? '' : 'hidden'}><div><img src="assets/brands/obsidian.svg" alt="Obsidian logo"><h3>Obsidian</h3></div><p>A note-taking app.<br>A vault is a folder of Markdown notes.</p></section>
          <div class="button-row"><button class="button" data-action="reveal" aria-controls="latest-decision" aria-expanded="${contextRevealed}" ${contextRevealed?'':'disabled'} ${contextRevealed || obsidianIntroduced ? '' : 'hidden'}>${contextRevealed?'Hide the note':'Show the note'} <span aria-hidden="true">→</span></button><button class="button secondary" data-cartoon="open">▶ Watch the clip</button></div>
        </div>
        <div class="chat-study ba-chats">
          <section class="chat-example ba-chatgpt" data-demo-exchange>
            <div class="chat-example-head"><img src="assets/brands/chatgpt.svg" alt="">ChatGPT <small>Existing project chat</small></div>
            <div class="ba-context">Earlier in this chat: one email field.</div>
            <div class="demo-composer chat-composer"><p class="chat-line user-line" data-write="user">What should the signup page ask for?</p>${demoSendButton()}</div>
            <div class="demo-answer is-locked" data-demo-answer aria-hidden="true" inert><p class="chat-line reply-line" data-write="assistant">Just an email address, as we agreed.</p></div>
          </section>
          <section class="chat-example ba-before" data-demo-exchange>
            <div class="chat-example-head"><img src="assets/brands/claude.svg" alt="">Claude <small>Fresh session · no project files</small></div>
            <div class="demo-composer chat-composer"><p class="chat-line user-line" data-write="user">What should the signup page ask for?</p>${demoSendButton()}</div>
            <div class="demo-answer is-locked" data-demo-answer aria-hidden="true" inert><p class="chat-line reply-line" data-write="assistant">I don’t have the project requirements here. What should the form collect?</p></div>
          </section>
          <section id="latest-decision" class="chat-example ba-after" ${contextRevealed?'data-demo-exchange':''}>
            <div class="chat-example-head"><img src="assets/brands/claude.svg" alt="">Claude <small>After the note is provided</small></div>
            ${contextRevealed?`<div class="context-slip"><button type="button" class="signup-file-link" data-detail="signupPlan" aria-label="Open signup-plan.md" aria-haspopup="dialog" aria-controls="detail-dialog"><span aria-hidden="true">MD</span> signup-plan.md <span aria-hidden="true">↗</span></button><span>Ask for exactly one thing: an email address.</span></div>
            <div class="demo-composer chat-composer"><p class="chat-line user-line" data-write="user">Read signup-plan.md. What should the signup page ask for?</p>${demoSendButton()}</div>
            <div class="demo-answer is-locked" data-demo-answer aria-hidden="true" inert><p class="chat-line reply-line" data-write="assistant">The plan says one email field. I can build the signup page from that.</p></div>`:'<p class="decision-placeholder">Next: show the saved note and ask again.</p>'}
          </section>
          <p class="study-caption">Illustrative conversations · We build the real page on slide 7</p>
        </div>
      </div>
    </div>
    <div class="sv-cartoon" data-choreo="cartoon" hidden><figure><img src="assets/video/context-handoff-v3-poster.jpg" alt="A builder and a robot passing a project note.">${file('signup-plan.md', 'id="ct-note" data-step="note"')}</figure><p class="sv-caption" id="ct-cap">So we save the decision, and pass the file.</p><div class="button-row"><button class="text-button" data-cartoon="toggle" hidden>Pause ❚❚</button><button class="text-button" data-cartoon="replay">Replay ↻</button><button class="button" data-cartoon="close">Back to the slide</button></div></div>`;

  // The presenter completes the before example before revealing the shared note.
  document.addEventListener('click', e => {
    if (e.target.closest('.ba-before [data-demo-send]')) {
      obsidianIntroduced = true;
      const intro = document.querySelector('#obsidian-intro');
      if (intro) intro.hidden = false;
      const reveal = document.querySelector('.sv-before-after [data-action="reveal"]');
      if (reveal) { reveal.disabled = false; reveal.hidden = false; }
    }
  });

  sceneViews[4] = () => slide('folder', 'THE SIGNUP PROJECT', 'One folder. <em>Two views.</em>',
    `<div class="sv-stage sv-folder">
      ${win('sv-obsidian', '<img src="assets/brands/obsidian.svg" alt="">Obsidian · Second-Mind-Demo', `<nav class="sv-tree"><small>Files</small><button type="button" class="sv-row" id="ob-plan" data-detail="signupPlan" aria-label="Open signup-plan.md in Obsidian view" aria-haspopup="dialog" aria-controls="detail-dialog">signup-plan.md</button><button type="button" class="sv-row" id="ob-build" data-detail="signupWorkflow" aria-label="Open build-signup.md in Obsidian view" aria-haspopup="dialog" aria-controls="detail-dialog">build-signup.md</button></nav><article class="sv-note"><h3 data-step="n1">Team signup page</h3><small data-step="n2">Current decision</small><p data-step="n2" id="ob-decision">Ask for exactly one thing: an email address.</p><p data-step="n3" id="ob-label">Button label: <mark>Join waitlist</mark>.</p></article>`)}
      <div class="sv-same" data-step="same"><b>=</b><span>same<br>files</span></div>
      ${win('sv-finder', 'Finder · Second-Mind-Demo', `<div class="sv-icons"><button type="button" class="sv-icon" id="fi-plan" data-detail="signupPlan" aria-label="Open signup-plan.md in Finder view" aria-haspopup="dialog" aria-controls="detail-dialog"><b>MD</b>signup-plan.md</button><button type="button" class="sv-icon" id="fi-build" data-detail="signupWorkflow" aria-label="Open build-signup.md in Finder view" aria-haspopup="dialog" aria-controls="detail-dialog"><b>MD</b>build-signup.md</button></div><div class="sv-path" data-step="path"><code>Second-Mind-Demo</code><span>Selected project folder in Claude Code desktop</span></div>`)}
    </div>`,
    foot('Obsidian and Claude Code use the same local files. No Obsidian API needed.', '<button class="text-button" data-detail="signupPlan">signup-plan.md ↗</button><button class="text-button" data-detail="signupWorkflow">build-signup.md ↗</button><button class="button secondary" data-detail="obsidian">Open the signup vault ↗</button>'));

  sceneViews[10] = () => slide('tools', 'EACH TOOL HAS A JOB', 'Give each tool <em>a clear job.</em>',
    `<div class="sv-stage sv-tools">
      <div class="sv-cards">
        <section class="sv-tool" id="t-ob"><img src="assets/brands/obsidian.svg" alt="Obsidian"><div><h3>Obsidian</h3><p>A note-taking app.</p><small>Local Markdown notes + links</small></div></section>
        <section class="sv-tool" id="t-cc"><img src="assets/brands/claude.svg" alt="Claude"><div><h3>Claude Code</h3><p>An AI coding agent.</p><small>Reads and edits project files</small></div></section>
        <section class="sv-tool" id="t-gpt"><img src="assets/brands/chatgpt.svg" alt="OpenAI"><div><h3>Codex</h3><p>An AI coding agent.</p><small>Revise in the same local folder</small></div></section>
        <section class="sv-tool" id="t-oc"><img src="assets/brands/openclaw.svg" alt="OpenClaw"><div><h3>OpenClaw</h3><p>A self-hosted AI gateway.</p><small>Models + tools + chat channels</small></div></section>
      </div>
      <div class="sv-tray"><small>Current project files · share them with the next tool</small><div class="sv-chips">
        ${file('signup-plan.md', 'id="f-plan"', 'you edit')}${file('build-signup.md', 'id="f-build"', 'you edit')}
        ${file('signup.html', 'id="f-page" data-step="f" data-kind="made"', 'Build + revision')}
        ${file('next-step.md', 'id="f-next" data-step="f" data-kind="planned"', 'OpenClaw · extension')}
      </div></div>
    </div>`,
    foot('Shared files carry the project. Each tool has a different job.', '<button class="text-button" data-detail="tools">How they connect · API vs MCP ↗</button><button class="button secondary" data-detail="signupWorkflow">Our build workflow ↗</button>'));

  sceneViews[11] = () => slide('requirement', 'BEFORE THE LIVE DEMO', 'What should <em>we build?</em>',
    `<div class="sv-stage sv-req sv-brief-target">
      <div class="sv-brief"><small>The saved plan · signup-plan.md</small><h3>A simple waitlist page.</h3><p>Three things we will check:</p><ol><li id="rq-1"><b>1</b><span>One required <strong>email field.</strong></span></li><li id="rq-2"><b>2</b><span>A button that says <strong>Join waitlist.</strong></span></li><li id="rq-3"><b>3</b><span>A <strong>confirmation</strong> after a valid email.</span></li></ol></div>
      ${win('sv-browser', 'Target result · illustration', `<div class="sv-form"><h3>Join the waitlist</h3><label data-step="k1">Email address <small>required</small></label><div class="sv-input" data-step="k1"><span class="sv-placeholder">you@example.com</span></div><span class="sv-btn" data-step="k2">Join waitlist</span><p class="sv-ok" data-step="k3">✓ Thanks for trying the signup demo.</p><p class="sv-kept">Local demo · no data sent or stored</p></div>`)}
    </div>`,
    foot('This is the target. Next, we ask Claude Code to build it.', '<button class="button secondary" data-detail="signupPlan">Read the saved plan ↗</button>'));

  sceneViews[12] = () => slide('build', 'LIVE BUILD · CLAUDE CODE DESKTOP', 'Give it the plan. <em>Watch it build.</em>',
    `<div class="sv-stage sv-build">
      <div class="sv-code"><header><img src="assets/brands/claude.svg" alt="Claude Code"><strong>Claude Code</strong><span>Second-Mind-Demo</span></header><div class="sv-code-thread"><small>New session · selected project folder</small><div class="sv-code-prompt"><p id="tm-cmd">Read build-signup.md and signup-plan.md. Follow the workflow to create signup.html in this folder. Report which notes you used and what you built.</p><span class="sv-code-send" aria-hidden="true">↑</span></div><div class="sv-code-activity"><p data-step="t1">✓ Read <b>build-signup.md</b></p><p data-step="t2">✓ Read <b>signup-plan.md</b></p><p data-step="t3">✓ Write <b>signup.html</b></p></div><em>Illustration of a file-backed build.</em></div></div>
      ${win('sv-browser', 'signup.html', `<div class="sv-form" data-step="page"><h3>Join the waitlist</h3><label>Email address</label><div class="sv-input" id="bf-input"><span id="bf-text" data-step="mail">demo@example.com</span></div><span class="sv-btn" id="bf-btn">Join waitlist</span><p class="sv-ok" data-step="ok">✓ Thanks for trying the signup demo.</p></div>`)}
    </div>`,
    foot('Select the folder. Send the request. Open the real page.', '<a class="text-button" href="signup-preview.html" target="_blank" rel="noopener">Prepared example ↗</a><button class="button" data-detail="signup">Desktop demo steps ↗</button>'));

  sceneViews[13] = () => slide('change', 'SELECT THE SAME FOLDER IN ANOTHER TOOL', 'Same project. <em>Another AI.</em>',
    `<div class="sv-stage sv-change sv-cross-tool">
      ${doc('signup-plan.md', 'edited in Obsidian', `<small>Current decision</small><p>Ask for exactly one thing: an email address.</p><p>Button label: <del id="ch-old1">Join waitlist</del> <ins id="ch-1" data-step="i1">Notify me</ins>.</p><small>Success check</small><p>One required email field and a <del id="ch-old2">Join waitlist</del> <ins id="ch-2" data-step="i2">Notify me</ins> button.</p><small>Decision log</small><p id="ch-log" data-step="log">Date + the room’s reason for changing it.</p>`)}
      <div class="sv-rebuild"><b>→</b><span>Same folder.<br>New agent.</span></div>
      <div class="sv-code"><header><img src="assets/brands/chatgpt.svg" alt="OpenAI"><strong>Codex · Local</strong><span>Second-Mind-Demo</span></header><div class="sv-code-thread"><div class="sv-chips" id="ch-attach">${file('signup-plan.md')}${file('signup.html','','current page')}</div><div class="sv-code-prompt" data-step="revise"><p id="ch-prompt">Read the plan and page in this folder. Update only signup.html. Keep the email field and confirmation.</p><span class="sv-code-send" id="ch-run">↑</span></div><div class="sv-returned" data-step="returned"><small>Illustrated revision</small>${file('signup.html','','edited in the same folder')}<p id="ch-btn">Check: button now says <strong>Notify me</strong>.</p></div></div></div>
    </div>`,
    foot('Update the plan → Codex reads the same folder → edit → check.', '<button class="button" data-detail="signupUpdate">Cross-tool handoff steps ↗</button>'));

  sceneViews[3] = () => slide('pipeline', 'WHAT IS OPENCLAW?', 'One assistant. <em>Many ways in.</em>',
    `<span class="sv-stamp">Extension design</span>
    <div class="sv-stage sv-pipe">
      <div class="sv-nodes sv-labeled-nodes">
        <section id="p1">${icon.plane}<h3>Chat channels</h3><div class="sv-channel-list"><span>WhatsApp</span><span class="selected">Telegram · chosen</span><span>Slack + more</span></div></section><div class="sv-edge"><small>Telegram<br>Bot API</small><i class="sv-link" id="l1"></i></div>
        <section id="p2"><img src="assets/brands/openclaw.svg" alt="OpenClaw"><h3>OpenClaw</h3><p>Self-hosted gateway.<br>Sessions, routing + automation.</p></section><div class="sv-edge"><small>CLI</small><i class="sv-link" id="l2"></i></div>
        <section id="p3"><img src="assets/brands/claude.svg" alt="Claude Code"><h3>Claude Code</h3><p>Our chosen agent runtime.<br>Other routes: provider APIs.</p></section><div class="sv-edge"><small>MCP tools</small><i class="sv-link" id="l3"></i></div>
        <section id="p4">${icon.folder}<h3>Files + tools</h3><p>Intended read/write tools.<br>The same project folder.</p></section>
      </div>
      <div class="sv-protocols"><section><strong data-step="s1">API · call a service</strong><p data-step="s2">Telegram’s Bot API carries our messages.</p></section><section><strong data-step="s3">MCP · connect AI tools</strong><p data-step="s4">A supported backend can expose OpenClaw tools through its MCP bridge.</p></section></div>
    </div>`,
    foot('Telegram is our chosen channel. OpenClaw connects more than messaging.', '<button class="text-button" data-detail="tools">API vs MCP · exact route ↗</button><button class="button" data-detail="openclaw">What OpenClaw adds ↗</button><button class="button secondary" data-detail="telegram">Bot setup ↗</button>'));

  sceneViews[8] = () => slide('ask', 'THE SAME SIGNUP PROJECT', 'Ask it to <em>pick up the work.</em>',
    `<span class="sv-stamp">Illustration</span>
    <div class="sv-stage sv-askgrid" data-demo-exchange>
      <div class="sv-phone"><header><img src="assets/brands/openclaw.svg" alt="">Signup demo bot<small>private</small></header><div class="sv-thread"><p class="sv-rule">Intended setup: my account only.<br>Read/write access to Second-Mind-Demo.</p><div class="demo-composer sv-bubble"><p class="chat-line user-line" data-write="user">Read the plan and page. What is the current label and why? Save one next step as next-step.md. Do not change the page.</p>${demoSendButton()}</div></div></div>
      <div class="sv-after">
        <div class="sv-approved"><small>Intended project inputs</small><div class="sv-chips">${file('signup-plan.md', 'id="ak-1"')}${file('signup.html', 'id="ak-2" data-kind="made"')}</div></div>
        <div class="demo-answer is-locked" data-demo-answer aria-hidden="true" inert><small>After I send it, I check two things</small><p data-write="assistant">1 · The reply names the current label, the saved reason and the files it used.</p><p>2 · next-step.md appears in the same vault and fits the latest plan.</p></div>
      </div>
    </div>`,
    foot('Verify the real reply and the real file before calling this working.', '<button class="text-button" data-detail="optional">Optional research and scheduling ↗</button><button class="button" data-detail="telegram">Message and file check ↗</button>'));
  // The setup dialog shows the same request as the slide.
  document.addEventListener('click', e => {
    if (e.target.closest('[data-detail="telegram"]')) $('#detail-content').insertAdjacentHTML('beforeend', `<p><strong>The request</strong></p><pre><code>${esc(telegramRequest)}</code></pre>`);
  });

  const closing = sceneViews[16];
  sceneViews[16] = () => closing()
    .replace('class="closing-keynote"', 'class="closing-keynote sv-host" data-choreo="close"')
    .replace('<span class="kicker">BUILD ONE THING THAT REMEMBERS</span>', '<span class="kicker">ONE SMALL PROJECT TO TRY</span>')
    .replace('<p class="lead">Keep the context.<br>Make the next action useful.</p>', '<p class="lead">Write one decision down. Build from it.<br>Check it. Keep going.</p><div class="sv-recap"><span>Plan</span><span>Page</span><span>Change</span><span>Local assistant</span><span class="planned">Telegram extension</span></div>');

  /* ---------- wiring into the existing motion controls ---------- */
  const motion = window.PresentationMotion, mount = motion.mount, cancel = motion.cancel, toggle = motion.toggle;
  motion.mount = (root, options) => { mount(root, options); if (root.id === 'scene') play(root.querySelector('[data-choreo]:not([hidden])')); };
  motion.cancel = root => { cancel(root); if (root.id === 'scene') { if (root.dataset.scene === '2' && state.scene !== 2) { obsidianIntroduced = false; contextRevealed = false; } stop(); root.querySelector('.sv-cartoon video')?.pause(); } }; // leaving a slide stops its motion and its clip
  motion.toggle = () => { toggle(); if (!motion.enabled()) stop(); };
  motion.replay = () => { const root = document.querySelector('#scene'); if (root?.dataset.scene === '2') { obsidianIntroduced = false; contextRevealed = false; render(true); return; } if (root) motion.mount(root, { reveal: true }); };

  // Slide 3 layer. A local generated clip plays when the file exists; otherwise, or if it
  // fails to load, the coded cartoon plays instead.
  const CLIP = 'assets/video/context-handoff-v3.mp4';
  const CAPTIONS = [[0, '']]; // The new film carries its own precisely timed typography.
  function mountClip(layer) {
    const still = layer.querySelector('figure img'), fallback = still.outerHTML;
    still.outerHTML = `<video src="${CLIP}" poster="assets/video/context-handoff-v3-poster.jpg" muted playsinline preload="auto"></video>`;
    const video = layer.querySelector('video'), cap = layer.querySelector('#ct-cap'), toggle = layer.querySelector('[data-cartoon=toggle]');
    layer.dataset.choreo = 'clip'; layer.classList.add('sv-has-clip'); toggle.hidden = false;
    video.playbackRate = 1; cap.textContent = CAPTIONS[0][1];
    const caption = () => { cap.textContent = CAPTIONS.findLast(([time]) => video.currentTime >= time)[1]; };
    video.ontimeupdate = caption;
    video.onplay = () => { stop(); layer.classList.remove('clip-ended'); toggle.hidden = false; toggle.textContent = 'Pause ❚❚'; };
    video.onpause = () => { toggle.textContent = 'Play ▶'; };
    video.onended = () => { caption(); layer.classList.add('clip-ended'); toggle.hidden = true; };
    video.onerror = () => {
      video.outerHTML = fallback; layer.dataset.choreo = 'cartoon'; layer.dataset.noclip = '1';
      layer.classList.remove('sv-has-clip', 'clip-ended'); toggle.hidden = true;
      play(layer);
    };
  }
  document.addEventListener('click', async e => {
    const action = e.target.closest('[data-cartoon]')?.dataset.cartoon, layer = $('.sv-cartoon');
    if (!action || !layer) return;
    const video = () => layer.querySelector('video');
    if (action === 'toggle') return video().paused ? video().play() : video().pause();
    stop();
    layer.hidden = action === 'close';
    if (action === 'close') return video()?.pause();
    if (!video() && !layer.dataset.noclip && await fetch(CLIP, { method: 'HEAD' }).then(r => r.ok, () => false)) mountClip(layer);
    if (video()) { video().currentTime = 0; layer.querySelector('#ct-cap').textContent = CAPTIONS[0][1]; video().play().catch(() => {}); } else play(layer);
  });

  render(true);
})();
