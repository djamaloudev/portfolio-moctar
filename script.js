const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Thème clair / sombre (mémorisé) */
$('.theme').addEventListener('click', () => {
  const root = document.documentElement;
  const dark = root.dataset.theme === 'dark' ||
    (!root.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
  root.dataset.theme = dark ? 'light' : 'dark';
  try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
});

/* Menu mobile */
const burger = $('.burger'), nav = $('#nav');
burger.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
});
nav.addEventListener('click', e => {
  if (e.target.tagName === 'A') { nav.classList.remove('open'); burger.setAttribute('aria-expanded', false); }
});

/* Effet machine à écrire */
const words = ['passionné de développement web', 'curieux de nouvelles technologies', 'prêt à relever de nouveaux défis'];
const typed = $('#typed');
if (reduced) typed.textContent = words[0];
else {
  let w = 0, i = 0, del = false;
  (function tick() {
    const word = words[w];
    typed.textContent = word.slice(0, i);
    if (!del && i === word.length) { del = true; return setTimeout(tick, 1600); }
    if (del && i === 0) { del = false; w = (w + 1) % words.length; }
    i += del ? -1 : 1;
    setTimeout(tick, del ? 30 : 60);
  })();
}

/* Onglets (flèches gauche/droite) */
const tabs = $$('[role=tab]');
function selectTab(t) {
  tabs.forEach(b => {
    const on = b === t;
    b.setAttribute('aria-selected', on);
    b.tabIndex = on ? 0 : -1;
    $('#' + b.getAttribute('aria-controls')).hidden = !on;
  });
  t.focus();
}
tabs.forEach((t, i) => {
  t.addEventListener('click', () => selectTab(t));
  t.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') selectTab(tabs[(i + 1) % tabs.length]);
    if (e.key === 'ArrowLeft') selectTab(tabs[(i - 1 + tabs.length) % tabs.length]);
  });
});

/* Barres de compétences : se remplissent quand elles deviennent visibles */
const barObs = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) {
    $('i', e.target).style.width = e.target.dataset.level + '%';
    barObs.unobserve(e.target);
  }
}), { threshold: .4 });
$$('.skill').forEach(s => barObs.observe(s));

/* Filtres du parcours */
$$('.chip[data-f]').forEach(btn => btn.addEventListener('click', () => {
  $$('.chip[data-f]').forEach(b => { b.classList.toggle('on', b === btn); b.setAttribute('aria-pressed', b === btn); });
  $$('.timeline li').forEach(li => li.hidden = btn.dataset.f !== 'all' && li.dataset.type !== btn.dataset.f);
}));

/* Menu actif selon la section visible + barre de progression + retour en haut */
const links = $$('.top nav a');
const spy = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
}), { rootMargin: '-45% 0px -50% 0px' });
$$('main section').forEach(s => spy.observe(s));

const bar = $('.progress'), up = $('.totop');
addEventListener('scroll', () => {
  const h = document.documentElement;
  bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%';
  up.hidden = h.scrollTop < 600;
}, { passive: true });
up.addEventListener('click', () => scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }));

/* Copier l'e-mail */
$('#copy').addEventListener('click', async e => {
  try {
    await navigator.clipboard.writeText($('#mail').textContent);
    e.target.textContent = 'E-mail copié ✓';
  } catch (err) { e.target.textContent = 'Copie impossible'; }
  setTimeout(() => e.target.textContent = "Copier l'e-mail", 2000);
});

/* Formulaire : validation puis ouverture du client mail */
$('#form').addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target, msg = $('.msg', f);
  let ok = true;
  $$('input,textarea', f).forEach(el => {
    const bad = !el.value.trim() || (el.type === 'email' && !/^\S+@\S+\.\S+$/.test(el.value));
    el.classList.toggle('err', bad);
    if (bad) ok = false;
  });
  if (!ok) { msg.textContent = 'Merci de remplir tous les champs avec une adresse e-mail valide.'; return; }
  const d = Object.fromEntries(new FormData(f));
  const body = `${d.message}\n\n${d.prenom} ${d.nom} (${d.email})`;
  location.href = `mailto:syllamoctar04@gmail.com?subject=${encodeURIComponent('Message depuis ton portfolio')}&body=${encodeURIComponent(body)}`;
  msg.textContent = 'Ton application mail s’ouvre pour envoyer le message.';
  f.reset();
});
