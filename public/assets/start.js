document.querySelector('#copy-prompt').addEventListener('click', async () => {
const status = document.querySelector('#copy-status');
try { await navigator.clipboard.writeText(document.querySelector('#build-prompt').textContent); status.textContent='Copied'; }
catch { status.textContent='Select and copy the prompt above.'; }
});
