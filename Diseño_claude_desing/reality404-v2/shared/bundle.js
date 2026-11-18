/* @ds-bundle: {"format":4,"namespace":"R4","components":[]} */
/* reality404 — utilidades compartidas por las previews (sin dependencias, sin red).
   window.R4 = { PROJECTS, TECH, reduced, media, miniTablet, flyTo, el } */
(function () {
  var B = '../../assets/'; // relativo a components/<Comp>/preview.html
  var DEV = 'https://cdn.jsdelivr.net/npm/devicon@2.16.0/icons/';
  var PROJECTS = [
    { id: 'babia', title: 'BabIA', desc: 'App para el sueño de tu bebé: registro, evolución e integración con Telegram.', tags: ['React', 'Supabase', 'Telegram'], img: B + 'babia-900.webp', video: null, desktopNavId: 'babia' },
    { id: 'sonai', title: 'SonAI', desc: 'Landing page para vender automatizaciones por voz con IA.', tags: ['Landing', 'Voz IA'], img: B + 'sonai-900.webp', video: null, desktopNavId: 'sonai' },
    { id: 'ai-nav-corp', title: 'AI Nav Corp', desc: 'Juego en pixel art y portfolio jugable: cada personaje integra una IA y una misión.', tags: ['Phaser', 'IA'], img: B + 'ai-nav-corp-900.webp', video: null, desktopNavId: 'ai-nav-corp' },
    { id: 'desktop-nav', title: 'Desktop Nav', desc: 'Simula un escritorio en la web, con IA y flujos de trabajo integrados.', tags: ['React', 'Workflows'], img: B + 'desktop-nav-900.webp', video: null, desktopNavId: null },
    { id: 'criptofiscal', title: 'CriptoFiscal', desc: 'Registro de operaciones cripto e informes fiscales para España: FIFO, EUR histórico, IRPF en PDF.', tags: ['Fiscalidad', 'PDF'], img: null, video: null, desktopNavId: 'criptofiscal' }
  ];
  var t = function (n, f) { return DEV + n + '/' + n + '-' + (f || 'original') + '.svg'; };
  var TECH = [
    { name: 'JavaScript', src: t('javascript') }, { name: 'TypeScript', src: t('typescript') },
    { name: 'React', src: t('react') }, { name: 'Next.js', src: t('nextjs') },
    { name: 'Node.js', src: t('nodejs') }, { name: 'Python', src: t('python') },
    { name: 'HTML5', src: t('html5') }, { name: 'CSS3', src: t('css3') },
    { name: 'Tailwind', src: t('tailwindcss') }, { name: 'Git', src: t('git') },
    { name: 'Docker', src: t('docker') }, { name: 'PostgreSQL', src: t('postgresql') },
    { name: 'Jest', src: t('jest', 'plain') }, { name: 'Selenium', src: t('selenium') },
    { name: 'Figma', src: t('figma') }, { name: 'GitHub', src: t('github') }
  ];
  var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  /* Medio de proyecto: <video muted loop> si p.video; si no, captura (o placeholder 404) con barrido.
     Devuelve el nodo; play()/pause() alternan .r4-playing en el contenedor que le pases. */
  function media(p, host) {
    var m;
    if (p.video) {
      m = el('video', 'r4-media'); m.src = p.video; m.muted = true; m.loop = true; m.playsInline = true; m.preload = 'metadata';
      if (p.img) m.poster = p.img;
    } else if (p.img) {
      m = el('img', 'r4-media r4-media-img'); m.src = p.img; m.alt = ''; m.draggable = false; m.loading = 'lazy';
    } else {
      m = el('div', 'r4-media', '<div style="position:absolute;inset:0;display:grid;place-items:center;background:radial-gradient(circle at 50% 40%,#1b1c22,#050506)"><span class="r4-frost-text" style="font:700 56px/1 var(--font-display);letter-spacing:-.04em">404</span></div>');
    }
    var api = {
      node: m,
      play: function () { if (host) host.classList.add('r4-playing'); if (m.play && !reduced) { var q = m.play(); if (q && q.catch) q.catch(function () {}); } },
      pause: function () { if (host) host.classList.remove('r4-playing'); if (m.pause) m.pause(); }
    };
    if (host) { host.appendChild(m); host.appendChild(el('div', 'r4-sheen')); host.appendChild(el('span', 'r4-live', p.video ? 'Vídeo' : 'Preview')); }
    return api;
  }

  /* Tablet de juguete que representa a DeviceShowcase dentro de las previews */
  function miniTablet(parent) {
    var wrap = el('div', 'r4-mini-tablet');
    var screen = el('div', 'r4-mini-tablet__screen', '<div class="r4-mini-tablet__idle">tablet · DeviceShowcase<br>pincha un proyecto</div>');
    wrap.appendChild(screen); parent.appendChild(wrap);
    return {
      el: wrap, screen: screen,
      show: function (p) {
        screen.innerHTML = '';
        if (p.img) { var i = el('img'); i.src = p.img; i.alt = ''; screen.appendChild(i); }
        else screen.appendChild(el('div', '', '<span class="r4-frost-text" style="font:700 30px var(--font-display)">404</span>'));
        screen.appendChild(el('div', 'r4-mini-tablet__label', p.title));
        wrap.classList.remove('is-hit'); void wrap.offsetWidth; wrap.classList.add('is-hit');
      }
    };
  }

  /* La tarjeta "vuela" hasta la pantalla de la tablet (FLIP con un clon fijo) */
  function flyTo(fromEl, toEl, done) {
    if (reduced || !fromEl.animate) { done && done(); return; }
    var a = fromEl.getBoundingClientRect(), b = toEl.getBoundingClientRect();
    var ghost = fromEl.cloneNode(true);
    ghost.removeAttribute('id');
    Object.assign(ghost.style, { position: 'fixed', left: a.left + 'px', top: a.top + 'px', width: a.width + 'px', height: a.height + 'px', margin: 0, zIndex: 9999, pointerEvents: 'none', transform: 'none', transformOrigin: '0 0', overflow: 'hidden' });
    document.body.appendChild(ghost);
    var sx = b.width / a.width, sy = b.height / a.height, dx = b.left - a.left, dy = b.top - a.top;
    var anim = ghost.animate([
      { transform: 'translate(0,0) scale(1,1)', opacity: 1, filter: 'blur(0)' },
      { transform: 'translate(' + dx * .55 + 'px,' + (dy * .55 - 40) + 'px) scale(' + (1 + (sx - 1) * .5) + ',' + (1 + (sy - 1) * .5) + ')', opacity: 1, offset: .6 },
      { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + sx + ',' + sy + ')', opacity: .2, filter: 'blur(2px)' }
    ], { duration: 640, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
    anim.onfinish = function () { ghost.remove(); done && done(); };
  }

  window.R4 = { PROJECTS: PROJECTS, TECH: TECH, reduced: reduced, el: el, media: media, miniTablet: miniTablet, flyTo: flyTo };
})();
