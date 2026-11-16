/* Public companion: educational content only, no model or local runtime. */
(() => {
  const close = sceneViews[16];
  sceneViews[16] = () => close().replace('assets/hashem-linkedin-qr.svg','assets/audience-repo-qr.svg').replace('Scan to open Hashem Almubarak’s LinkedIn profile','Scan to open the audience repository').replace('href="https://www.linkedin.com/in/hashem-almubarak/"','href="https://github.com/Hashim11Mub/building-a-second-mind"').replace('Let’s connect.','Build your own.').replace('linkedin.com/in/hashem-almubarak','github.com/Hashim11Mub/building-a-second-mind').replace('<span class="linkedin-badge" aria-hidden="true">in</span>','');
  render(true);
})();
