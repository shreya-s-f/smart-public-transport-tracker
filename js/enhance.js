/* Transit.IN enhancement layer: load at END of body, after the inline script */
(() => {
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const el = h => { const t = document.createElement('template'); t.innerHTML = h.trim(); return t.content.firstChild; };

/* progress bar, aurora, back-to-top, toasts */
document.body.append(el('<div id="scroll-progress"></div>'), el('<div class="aurora"><i></i><i></i><i></i></div>'));
const bar = $('#scroll-progress'), btt = el('<button id="to-top" aria-label="Back to top"><i class="fa-solid fa-arrow-up"></i></button>');
const tw = el('<div id="toasts"></div>'); document.body.append(btt, tw);
btt.onclick = () => scrollTo({ top: 0, behavior: 'smooth' });
addEventListener('scroll', () => {
  const h = document.documentElement;
  bar.style.width = (scrollY / (h.scrollHeight - innerHeight || 1)) * 100 + '%';
  btt.classList.toggle('show', scrollY > 600);
  $('.navbar')?.classList.toggle('scrolled', scrollY > 20);
}, { passive: true });
window.toast = (m, i = 'circle-check') => {
  const t = el(`<div class="toast"><i class="fa-solid fa-${i}"></i> ${m}</div>`); tw.append(t);
  setTimeout(() => t.classList.add('out'), 2800); setTimeout(() => t.remove(), 3300);
};

/* moving road strip + rotating ticker */
$('.transit-ticker')?.after(el('<div class="road-strip"><i class="fa-solid fa-bus-simple b b0"></i><i class="fa-solid fa-bus-simple b b1"></i><i class="fa-solid fa-bus-simple b b2"></i><span class="dash"></span></div>'));
const tk = $('#live-network-ticker');
if (tk) {
  const msgs = [tk.textContent.trim(), 'Express corridors running 6% faster than yesterday • 12 new electric buses added this week', 'Tip: press Ctrl + K to jump anywhere instantly', 'Women-safety SOS shield active on every route • Helpline 1091'];
  let i = 0; setInterval(() => { tk.classList.add('swap'); setTimeout(() => { tk.textContent = msgs[++i % msgs.length]; tk.classList.remove('swap'); }, 350); }, 5000);
}

/* carousel: progress bar, swipe, arrow keys */
const hero = $('#main-hero-carousel');
if (hero) {
  hero.append(el('<div class="hero-progress"></div>'));
  const pr = $('.hero-progress', hero), kick = () => { pr.classList.remove('run'); void pr.offsetWidth; pr.classList.add('run'); };
  const o = window.showHeroSlide; if (o) window.showHeroSlide = i => { o(i); kick(); }; kick();
  let sx = 0;
  hero.addEventListener('touchstart', e => sx = e.touches[0].clientX, { passive: true });
  hero.addEventListener('touchend', e => { const d = e.changedTouches[0].clientX - sx; if (Math.abs(d) > 50) d < 0 ? nextHeroSlide() : prevHeroSlide(); });
  addEventListener('keydown', e => {
    if (/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
    if (e.key === 'ArrowRight') nextHeroSlide(); if (e.key === 'ArrowLeft') prevHeroSlide();
  });
}

/* typewriter placeholder */
const gs = $('#global-search');
if (gs) {
  const ph = ['Search route 507…', 'Try “Airport”…', 'Try “Navanagar”…', 'Try “Majestic”…']; let p = 0, c = 0, d = 1;
  setInterval(() => {
    if (document.activeElement === gs) return;
    const w = ph[p]; c += d; gs.placeholder = w.slice(0, c) + '▏';
    if (c > w.length + 8) d = -1; if (c <= 0) { d = 1; p = (p + 1) % ph.length; }
  }, 90);
}

/* new sections */
const main = $('main');
const feats = [['satellite-dish', 'Live GPS radar', 'Watch every bus glide along real road curves, refreshed every 3 seconds.', '#3b82f6'], ['route', 'Smart journey planner', 'Door-to-door plans with transfers, walking steps and exact fares.', '#10b981'], ['shield-heart', 'SOS safety shield', 'One-tap panic beacon plus live ride sharing with trusted contacts.', '#ef4444'], ['qrcode', 'QR e-tickets', 'Contactless passes and wallet top-ups. No queues, no paper.', '#8b5cf6'], ['bell', 'Instant alerts', 'Diversion and delay pings the moment your route changes.', '#f59e0b'], ['leaf', 'Carbon tracker', 'See the CO₂ you save with every ride you take.', '#0ea5e9']];
const rank = [['Bagalkot', 97], ['Hyderabad', 95], ['Delhi', 94], ['Chennai', 93], ['Mumbai', 92], ['Bangalore', 91], ['Pune', 90]];
const says = [['Aditi, Pune', 'The live radar is spot on. I stopped waiting at the stop and leave home when the bus is 4 minutes away.'], ['Ravi, Bangalore', 'Planner found a transfer I never knew existed. Saves me 15 minutes every morning.'], ['Meera, Delhi', 'The SOS shield and live ride sharing make late commutes feel far safer.'], ['Kiran, Bagalkot', 'QR tickets mean no more fumbling for change. Clean and quick.'], ['Farhan, Hyderabad', 'The delay alerts alone are worth it. Rainy days are finally predictable.']];
const faq = [['Is the bus location really live?', 'Positions refresh every few seconds and follow actual road geometry through the OSRM routing engine.'], ['How are fares calculated?', 'A base fare plus a per-kilometre rate for the mode you choose. The estimator above shows it instantly.'], ['Can I share my ride with family?', 'Yes. Open the Safety Hub to send live vehicle coordinates and ETA over WhatsApp or SMS.'], ['Which cities are supported?', 'Delhi, Mumbai, Bangalore, Bagalkot, Hyderabad, Chennai and Pune. Switch from the top bar or press Ctrl + K.']];
const card = t => `<div class="glass-card tcard"><div class="stars">${'<i class="fa-solid fa-star"></i>'.repeat(5)}</div><p>${t[1]}</p><small>${t[0]}</small></div>`;
const html = `
<h2 class="sec-title rv"><i class="fa-solid fa-wand-magic-sparkles" style="color:var(--ac)"></i> Everything your commute needs</h2>
<div class="feat-grid">${feats.map(f => `<div class="glass-card feat rv"><div class="ic" style="background:${f[3]}26;color:${f[3]}"><i class="fa-solid fa-${f[0]}"></i></div><h4>${f[1]}</h4><p>${f[2]}</p></div>`).join('')}</div>
<h2 class="sec-title rv"><i class="fa-solid fa-calculator" style="color:var(--ac)"></i> Fare &amp; time estimator</h2>
<div class="glass-card fare-wrap rv"><div><p style="margin:0;color:var(--text-secondary)">Pick a ride type and drag the distance. Figures are demo estimates.</p>
<div class="mode-tabs"><button class="on" data-m="bus">City bus</button><button data-m="ev">Electric AC</button><button data-m="feeder">Metro feeder</button></div>
<label style="font-weight:700">Distance: <span id="fare-km-l" style="color:var(--ac)">12 km</span></label><input type="range" id="fare-km" min="1" max="45" value="12"></div>
<div class="fare-out"><div><b id="fare-amt">₹0</b><span>Fare</span></div><div><b id="fare-time">0 min</b><span>Travel time</span></div><div><b id="fare-co2">0 kg</b><span>CO₂ saved vs car</span></div></div></div>
<h2 class="sec-title rv"><i class="fa-solid fa-ranking-star" style="color:var(--ac)"></i> On-time ranking by city</h2>
<div class="glass-card rv" style="padding:1.6rem" id="lb">${rank.map(r => `<div class="lb-row"><strong>${r[0]}</strong><div class="lb-bar"><i data-w="${r[1]}"></i></div><span>${r[1]}%</span></div>`).join('')}</div>
<h2 class="sec-title rv"><i class="fa-solid fa-heart" style="color:#ef4444"></i> Loved by commuters</h2>
<div class="marquee rv"><div class="marquee-track">${says.concat(says).map(card).join('')}</div></div>
<h2 class="sec-title rv"><i class="fa-solid fa-circle-question" style="color:var(--ac)"></i> Quick answers</h2>
<div class="faq rv">${faq.map(f => `<details><summary>${f[0]}</summary><p>${f[1]}</p></details>`).join('')}</div>
<div class="cta rv"><h2 style="margin:0 0 .4rem">Get service alerts in your inbox</h2><p style="margin:0;color:var(--text-secondary)">Delays, diversions and new routes for your city. No spam.</p>
<form id="news"><input type="email" required placeholder="you@example.com" aria-label="Email"><button class="btn-primary" type="submit">Subscribe</button></form></div>`;
main.append(el('<div id="extra"></div>'));
$('#extra').innerHTML = html;

/* estimator */
const modes = { bus: { b: 10, r: 2.2, s: 22, c: .089 }, ev: { b: 15, r: 2.8, s: 26, c: .089 }, feeder: { b: 10, r: 1.8, s: 34, c: .04 } };
let m = 'bus';
const tween = (e, to, f) => { const from = +e.dataset.v || 0, t0 = performance.now(); const st = n => { const k = Math.min(1, (n - t0) / 500); e.textContent = f(from + (to - from) * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(st); else e.dataset.v = to; }; requestAnimationFrame(st); };
const calc = () => {
  const d = +$('#fare-km').value, M = modes[m]; $('#fare-km-l').textContent = d + ' km';
  tween($('#fare-amt'), Math.round(M.b + M.r * d), v => '₹' + Math.round(v));
  tween($('#fare-time'), Math.round(d / M.s * 60) + 6, v => Math.round(v) + ' min');
  tween($('#fare-co2'), (.17 - M.c) * d, v => v.toFixed(1) + ' kg');
};
$('#fare-km').oninput = calc;
$$('.mode-tabs button').forEach(b => b.onclick = () => { $$('.mode-tabs button').forEach(x => x.classList.remove('on')); b.classList.add('on'); m = b.dataset.m; calc(); });
calc();
$('#news').onsubmit = e => { e.preventDefault(); e.target.reset(); toast('Subscribed. Alerts are on.', 'bell'); };

/* scroll reveal + leaderboard bars */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return; e.target.classList.add('in'); io.unobserve(e.target);
  if (e.target.id === 'lb') $$('.lb-bar i', e.target).forEach((b, i) => setTimeout(() => b.style.width = b.dataset.w + '%', i * 120));
}), { threshold: .12 });
$$('main > h2, main .glass-card, .journey-planner-card, .rv').forEach((n, i) => { n.classList.add('rv'); n.style.transitionDelay = (i % 4) * 70 + 'ms'; io.observe(n); });

/* spotlight + 3D tilt */
if (matchMedia('(hover:hover)').matches) {
  $$('.glass-card').forEach(c => {
    c.addEventListener('mousemove', e => {
      const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      c.style.setProperty('--mx', x * 100 + '%'); c.style.setProperty('--my', y * 100 + '%');
      if (r.width < 520) c.style.transform = `perspective(900px) rotateX(${(.5 - y) * 7}deg) rotateY(${(x - .5) * 9}deg) translateY(-4px)`;
    });
    c.addEventListener('mouseleave', () => c.style.transform = '');
  });
}

/* ripple */
document.addEventListener('click', e => {
  const b = e.target.closest('.btn-primary,.sim-btn,.city-chip'); if (!b) return;
  const r = b.getBoundingClientRect(), s = Math.max(r.width, r.height), n = el('<span class="ripple"></span>');
  Object.assign(n.style, { width: s + 'px', height: s + 'px', left: e.clientX - r.left - s / 2 + 'px', top: e.clientY - r.top - s / 2 + 'px' });
  b.append(n); setTimeout(() => n.remove(), 600);
});

/* command palette (Ctrl/Cmd + K) */
const pages = [['Dashboard', 'index.html', 'gauge'], ['Routes', 'routes.html', 'map-location-dot'], ['Live Tracking', 'tracking.html', 'satellite-dish'], ['Timetable', 'timetable.html', 'calendar-days'], ['Alerts', 'notifications.html', 'bell'], ['Book Ticket', 'booking.html', 'ticket'], ['Safety Shield', 'safety.html', 'shield-heart'], ['Profile', 'profile.html', 'user']];
const items = [
  ...pages.map(([t, u, i]) => ({ t: 'Go to ' + t, i, a: () => location.href = u })),
  ...rank.map(([c]) => ({ t: 'Switch city: ' + c, i: 'city', a: () => { localStorage.setItem('spt-city', c); location.reload(); } })),
  { t: 'Toggle dark / light mode', i: 'circle-half-stroke', a: () => $('#theme-toggle')?.click() },
  { t: 'Open Safety Shield', i: 'shield-heart', a: () => location.href = 'safety.html' }
];
const pal = el('<div id="pal"><div class="box"><input placeholder="Type a page, city or action…" aria-label="Command palette"><ul></ul></div></div>');
document.body.append(pal);
const pi = $('input', pal), pu = $('ul', pal); let sel = 0, list = items;
const draw = () => { pu.innerHTML = list.map((x, i) => `<li class="${i === sel ? 'sel' : ''}" data-i="${i}"><i class="fa-solid fa-${x.i}"></i>${x.t}</li>`).join('') || '<li>No matches</li>'; };
const openP = () => { pal.classList.add('open'); pi.value = ''; list = items; sel = 0; draw(); pi.focus(); };
const closeP = () => pal.classList.remove('open');
const run = i => { const x = list[i]; if (x) { closeP(); x.a(); } };
pi.oninput = () => { const q = pi.value.toLowerCase(); list = items.filter(x => x.t.toLowerCase().includes(q)); sel = 0; draw(); };
pu.onclick = e => { const l = e.target.closest('li'); if (l?.dataset.i) run(+l.dataset.i); };
pal.onclick = e => { if (e.target === pal) closeP(); };
addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); pal.classList.contains('open') ? closeP() : openP(); return; }
  if (!pal.classList.contains('open')) return;
  if (e.key === 'Escape') closeP();
  if (e.key === 'ArrowDown') { sel = Math.min(sel + 1, list.length - 1); draw(); e.preventDefault(); }
  if (e.key === 'ArrowUp') { sel = Math.max(sel - 1, 0); draw(); e.preventDefault(); }
  if (e.key === 'Enter') run(sel);
});
const kb = el('<button class="kbd-btn" aria-label="Open command palette"><i class="fa-solid fa-magnifying-glass"></i> Search <kbd>Ctrl K</kbd></button>');
kb.onclick = openP; $('.nav-actions')?.prepend(kb);

setTimeout(() => toast('Welcome to Transit.IN. Press Ctrl + K to jump anywhere.', 'bus'), 1500);
})();
