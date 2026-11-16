/* An inspectable workspace illustration; no model calls or file writes. */
(() => {
 const files={
  "IDENTITY.md": [
    "Who is my assistant?",
    "# Identity\n\nName: Demo AI assistant\nRole: Help me build useful AI workflows.\nStyle: clear and practical."
  ],
  "SOUL.md": [
    "How should it respond to me?",
    "# Response style\n\nUse simple, natural English.\nBe direct. No hype or flattery.\nExplain clearly; say when unsure."
  ],
  "AGENTS.md": [
    "How should it work with my files?",
    "# Working with my project\n\nRead signup-plan.md before changing the page.\nKeep the saved decision and output aligned.\nRecord the reason; name the files used."
  ],
  "USER.md": [
    "What should it know about me?",
    "# About the demo user\n\nRole: project owner\nPrefers clear, practical steps.\nDemo updates: 3 short bullets, no greeting."
  ],
  "MEMORY.md": [
    "What is useful to keep for me?",
    "# Useful context\n\nProject: Building a Second Mind.\nSingapore · 24 November 2026.\nDemo: a signup page with one email field.\nCurrent decisions live in signup-plan.md."
  ],
  "memory/2026-11-24.md": [
    "What happened in my demo today?",
    "# 24 November · Project demo\n\nOpened the plan in Obsidian.\nClaude built the page; Codex revised it.\nSaved the button change and its reason.\nNext: continue with OpenClaw + Telegram."
  ]
};
 const rows=Object.entries(files).map(([name,[role]],i)=>`<button id="oc-f${i}" data-step="file" class="oc-file ${i===0?'selected':''}" data-oc-file="${name}" aria-pressed="${i===0}"><strong>${name}</strong><span>${role}</span></button>`).join('');
 sceneViews[18]=()=>`<div class="oc-local-slide sv-host" data-choreo="workspace"><div class="oc-heading"><span class="kicker">MY OPENCLAW WORKSPACE</span><h2>A name. A way of working.<br><em>A memory you can inspect.</em></h2></div><div class="oc-file-layout"><div class="oc-file-list" aria-label="Workspace files">${rows}</div><section class="oc-file-preview"><small id="oc-file-role">Who is my assistant?</small><h3 id="oc-file-title">IDENTITY.md</h3><pre id="oc-file-content">${files['IDENTITY.md'][1]}</pre><div class="oc-file-footer" id="oc-foot" data-step="footer"><img src="assets/brands/obsidian.svg" alt="Obsidian"><span>The same Markdown files can be opened in Obsidian.</span></div></section></div><p class="oc-bottom">Instructions shape behaviour. Memory stores selected knowledge. Permissions are configured separately.</p></div>`;
 sceneViews[20]=()=>`<div class="oc-local-slide sv-host" data-choreo="usecases"><div class="oc-heading"><span class="kicker">BEYOND THIS DEMO</span><h2>What would you<br><em>connect next?</em></h2></div><div class="oc-use-cases"><section id="oc-use0" data-step="use"><span class="oc-use-icon">◉</span><h3>Catch an idea</h3><p>Voice note → a useful note<br>linked to the right project.</p></section><section id="oc-use1" data-step="use"><span class="oc-use-icon">⌕</span><h3>Research a question</h3><p>Selected sources → a brief<br>with references and next steps.</p></section><section id="oc-use2" data-step="use"><span class="oc-use-icon">☷</span><h3>Start the day informed</h3><p>Calendar + tasks → a short<br>morning update in your chat.</p></section><section id="oc-use3" data-step="use"><span class="oc-use-icon">↗</span><h3>Keep work moving</h3><p>A project update → a saved<br>next step you can pick up later.</p></section></div><p class="oc-bottom" id="oc-use-footer" data-step="footer">Start with one routine. Add the supported tools, permissions and schedule it needs.</p></div>`;
 sceneMeta[20]=['What you could do next','','Ideas to try with supported tools and permissions.'];
 sceneMeta[18]=['The assistant’s workspace','','Identity, behaviour, user preferences and saved knowledge.'];
 mainScenes.splice(0,mainScenes.length,0,17,2,4,10,11,12,13,3,18,8,20,16);
 document.addEventListener('click',e=>{const b=e.target.closest('[data-oc-file]');if(!b)return;PresentationMotion.cancel(document.querySelector('#scene'));const name=b.dataset.ocFile;document.querySelectorAll('[data-oc-file]').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',String(x===b))});document.querySelector('#oc-file-title').textContent=name;document.querySelector('#oc-file-role').textContent=files[name][0];document.querySelector('#oc-file-content').textContent=files[name][1];});
 const old=sceneViews[3];sceneViews[3]=()=>old().replace('Telegram is our chosen channel. OpenClaw connects more than messaging.','Start with the local UI. Add Telegram, WhatsApp or Slack when you need them.').replace('Extension design','Self-hosted assistant').replace('<small>CLI</small>','<small>Agent<br>interface</small>').replace('<small>MCP tools</small>','<small>File<br>tools</small>').replace('Claude Code</h3><p>Our chosen agent runtime.<br>Other routes: provider APIs.','Agent runtime</h3><p>Claude Code or Codex.<br>Other routes: provider APIs.').replace('Sessions, routing + automation.','Workspace, sessions + automation.');
 const ask=sceneViews[8];sceneViews[8]=()=>ask().replace('THE SAME SIGNUP PROJECT','OPTIONAL · TELEGRAM').replace('Intended project inputs','The same project inputs').replace('Signup demo bot','Demo AI assistant');
 // Keep old bookmarks usable without exposing the retired handoff example.
 sceneViews[14]=sceneViews[3];sceneMeta[14]=sceneMeta[3];
 sceneViews[19]=sceneViews[18];sceneMeta[19]=sceneMeta[18];
 const n=Number(location.hash.slice(1));if(n===14){state.scene=3;history.replaceState(null,'','#3');}else if(n===19){state.scene=18;history.replaceState(null,'','#18');}else if(n===20)state.scene=n;render(true);
})();
