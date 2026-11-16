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
<form id="news"><input type="email" required placeholder="you@example.com" aria-label="Email"><button class="btn-primary" type="submit">Subscribe</button></form>
<div style="margin-top: 0.65rem; font-size: 0.8rem; color: var(--text-secondary); text-align: center;">
    <i class="fa-solid fa-bell" style="color: #38bdf8;"></i> Real-time alerts delivered to Outbox &amp; Email • <a href="javascript:void(0)" id="view-email-preview-link" style="color: #38bdf8; text-decoration: underline; font-weight: 500;"><i class="fa-solid fa-envelope-open-text"></i> View Dispatched Email &amp; SMTP Settings</a>
</div></div>`;
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
/* newsletter subscription -> backend persistence and instant notification delivery */
const newsForm = $('#news');
let lastSubscriptionEmailData = null;

if (newsForm) {
  newsForm.onsubmit = async e => {
    e.preventDefault();
    const input = $('input[type="email"]', newsForm);
    const email = input ? input.value.trim() : '';
    if (!email) return;

    const btn = $('button[type="submit"]', newsForm);
    const origText = btn ? btn.innerHTML : 'Subscribe';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-paper-plane fa-bounce"></i> Sending alert...';
    }

    const currentCity = localStorage.getItem('spt-city') || 'Delhi';
    const API = (window.location.protocol === 'file:' || (window.location.port && window.location.port !== '5000')) ? 'http://localhost:5000' : '';

    try {
      const res = await fetch(`${API}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, city: currentCity })
      });
      const data = await res.json();

      if (data && data.success) {
        lastSubscriptionEmailData = data;
        localStorage.setItem('spt-subscriber-email', email);
        localStorage.setItem('spt-subscriber-active', 'true');

        // Store notification locally for immediate visibility across tabs & pages
        const notif = data.welcomeNotification || {
          type: 'info',
          title: 'Welcome to Transit.IN Service Alerts!',
          message: `Live service alerts, diversions & transit updates are now active for ${email}.`,
          time: 'Just now',
          route: 'All Corridors'
        };
        let notifs = [];
        try { notifs = JSON.parse(localStorage.getItem(`spt-crowdsourced-${currentCity}`)) || []; } catch(e){}
        notifs.unshift(notif);
        localStorage.setItem(`spt-crowdsourced-${currentCity}`, JSON.stringify(notifs));

        if (data.emailSent) {
          toast(`Welcome alert sent to ${email}! Check your inbox.`, 'envelope-circle-check');
        } else {
          toast(`Alerts activated! Staged in Outbox for ${email}`, 'bell');
        }

        if (btn) {
          btn.style.background = '#10b981';
          btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Subscribed!';
        }
        input.value = '';

        // Open Email Notification & Delivery Hub Modal
        openEmailHubModal(email, data);

        setTimeout(() => {
          if (btn) {
            btn.disabled = false;
            btn.innerHTML = origText;
            btn.style.background = '';
          }
        }, 3500);
      } else {
        toast((data && data.error) || 'Could not subscribe. Please try again.', 'circle-exclamation');
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = origText;
        }
      }
    } catch(err) {
      console.warn('Backend subscribe offline fallback:', err);
      localStorage.setItem('spt-subscriber-email', email);
      toast(`Alerts activated for ${email}!`, 'bell');
      openEmailHubModal(email, {
        emailSent: false,
        emailPreview: {
          to: email,
          subject: `🚦 Transit.IN Service Alerts Activated - ${currentCity}`,
          html: `<div style="font-family: sans-serif; padding: 20px;"><h3>Transit.IN Service Alerts Activated</h3><p>Service alerts registered for <strong>${email}</strong> in <strong>${currentCity}</strong>.</p></div>`
        }
      });
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = origText;
      }
    }
  };
}

// Bind "View Dispatched Email & SMTP Settings" link
const viewEmailLink = document.getElementById('view-email-preview-link');
if (viewEmailLink) {
    viewEmailLink.onclick = async () => {
        const storedEmail = localStorage.getItem('spt-subscriber-email') || 'you@example.com';
        if (lastSubscriptionEmailData) {
            openEmailHubModal(storedEmail, lastSubscriptionEmailData);
        } else {
            const API = (window.location.protocol === 'file:' || (window.location.port && window.location.port !== '5000')) ? 'http://localhost:5000' : '';
            try {
                const res = await fetch(`${API}/api/email/outbox?limit=1&email=${encodeURIComponent(storedEmail)}`);
                const data = await res.json();
                if (data && data.success && data.data && data.data.length > 0) {
                    const latest = data.data[0];
                    openEmailHubModal(latest.to || storedEmail, {
                        emailSent: latest.delivered,
                        emailPreview: latest
                    });
                    return;
                }
            } catch(e) {}
            openEmailHubModal(storedEmail, null);
        }
    };
}

/* Email Notification & Delivery Hub Modal */
function openEmailHubModal(email, emailData) {
    let modal = document.getElementById('transit-email-hub-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'transit-email-hub-modal';
        modal.style.cssText = 'position: fixed; inset: 0; z-index: 99999; display: flex; align-items: center; justify-content: center; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(8px); padding: 1.5rem;';
        document.body.appendChild(modal);
    }

    const currentCity = localStorage.getItem('spt-city') || 'Delhi';
    const recipientEmail = email || localStorage.getItem('spt-subscriber-email') || 'you@example.com';
    const emailSent = emailData && emailData.emailSent;
    const emailPreviewHtml = (emailData && emailData.emailPreview && emailData.emailPreview.html) 
        ? emailData.emailPreview.html 
        : `<div style="padding: 2.5rem; text-align: center; font-family: sans-serif; color: #475569;">
            <h3 style="color: #0f172a; margin-top: 0;">Transit.IN Service Alerts</h3>
            <p>Real-time transit delay notices, diversions, and network alerts are registered for <strong>${recipientEmail}</strong> in <strong>${currentCity}</strong>.</p>
            <p style="color: #94a3b8; font-size: 13px;">To deliver directly to your real Gmail inbox, use the "Connect Gmail / SMTP" tab above.</p>
           </div>`;
    const emailSubject = (emailData && emailData.emailPreview && emailData.emailPreview.subject)
        ? emailData.emailPreview.subject
        : `🚦 Transit.IN Service Alerts Activated - ${currentCity}`;

    modal.innerHTML = `
        <div style="background: #1e293b; border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 16px; max-width: 760px; width: 100%; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
            <!-- Modal Header -->
            <div style="padding: 1.2rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center; background: rgba(15, 23, 42, 0.6);">
                <div style="display: flex; align-items: center; gap: 0.6rem;">
                    <div style="width: 36px; height: 36px; border-radius: 10px; background: rgba(56, 189, 248, 0.2); color: #38bdf8; display: flex; align-items: center; justify-content: center; font-size: 1.1rem;">
                        <i class="fa-solid fa-envelope-open-text"></i>
                    </div>
                    <div>
                        <h3 style="margin: 0; font-size: 1.1rem; color: #ffffff;">Transit.IN Service Alert Email Notification</h3>
                        <div style="font-size: 0.75rem; color: var(--text-secondary);">Real-Time Alert Dispatcher &amp; Outbox Hub</div>
                    </div>
                </div>
                <button id="close-email-hub-modal" style="background: transparent; border: none; color: #94a3b8; font-size: 1.3rem; cursor: pointer; padding: 0.2rem 0.5rem;">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            <!-- Status Banner -->
            <div style="padding: 1rem 1.5rem 0.5rem 1.5rem;">
                ${emailSent ? `
                    <div style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 10px; padding: 0.8rem 1rem; display: flex; align-items: center; gap: 0.8rem;">
                        <i class="fa-solid fa-circle-check" style="color: #34d399; font-size: 1.3rem;"></i>
                        <div>
                            <strong style="color: #ffffff; font-size: 0.88rem;">Live SMTP Email Dispatched to: <span style="color: #34d399;">${recipientEmail}</span></strong>
                            <div style="font-size: 0.78rem; color: #a7f3d0;">A real transit alert was transmitted directly to your email inbox! Please check your inbox or spam folder.</div>
                        </div>
                    </div>
                ` : `
                    <div style="background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 10px; padding: 0.8rem 1rem; display: flex; align-items: center; gap: 0.8rem;">
                        <i class="fa-solid fa-inbox" style="color: #38bdf8; font-size: 1.3rem;"></i>
                        <div>
                            <strong style="color: #ffffff; font-size: 0.88rem;">Service Alert Email Generated &amp; Saved to Outbox</strong>
                            <div style="font-size: 0.78rem; color: #94a3b8;">Delivered to Transit.IN Outbox for <span style="color: #38bdf8;">${recipientEmail}</span>. Below is your rendered live email. You can also connect Gmail / SMTP to forward future alerts straight to your personal inbox.</div>
                        </div>
                    </div>
                `}
            </div>

            <!-- Tab Switcher -->
            <div style="display: flex; gap: 0.5rem; padding: 0.8rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.08);">
                <button id="email-tab-preview" style="padding: 0.4rem 0.9rem; border-radius: 8px; border: 1px solid #38bdf8; background: rgba(56, 189, 248, 0.2); color: #ffffff; font-size: 0.82rem; font-weight: 600; cursor: pointer;">
                    <i class="fa-solid fa-envelope"></i> Dispatched Email Preview
                </button>
                <button id="email-tab-setup" style="padding: 0.4rem 0.9rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); background: transparent; color: #94a3b8; font-size: 0.82rem; font-weight: 600; cursor: pointer;">
                    <i class="fa-solid fa-gear"></i> Connect Gmail / SMTP
                </button>
            </div>

            <!-- Content Area (Scrollable) -->
            <div style="flex: 1; overflow-y: auto; padding: 1.2rem 1.5rem;">
                <!-- Pane 1: Preview -->
                <div id="email-pane-preview">
                    <!-- Envelope details -->
                    <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 0.8rem 1rem; margin-bottom: 1rem; font-size: 0.82rem; line-height: 1.6;">
                        <div style="color: #94a3b8;"><strong>From:</strong> Transit.IN Service Alerts &lt;alerts@transit.in&gt;</div>
                        <div style="color: #94a3b8;"><strong>To:</strong> <span style="color: #38bdf8;">${recipientEmail}</span></div>
                        <div style="color: #94a3b8;"><strong>Subject:</strong> <span style="color: #ffffff;">${emailSubject}</span></div>
                        <div style="color: #94a3b8;"><strong>Status:</strong> ${emailSent ? '<span style="color: #34d399;">✓ Delivered via SMTP</span>' : '<span style="color: #fbbf24;">✓ Staged in Outbox</span>'}</div>
                    </div>

                    <!-- Email HTML iframe rendering -->
                    <div style="border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.15); background: #ffffff;">
                        <iframe id="email-html-frame" style="width: 100%; height: 380px; border: none; display: block;"></iframe>
                    </div>
                </div>

                <!-- Pane 2: SMTP Setup -->
                <div id="email-pane-setup" style="display: none;">
                    <div style="background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 10px; padding: 1.2rem; margin-bottom: 1.2rem;">
                        <h4 style="margin: 0 0 0.4rem 0; color: #38bdf8; font-size: 0.95rem;"><i class="fa-solid fa-paper-plane"></i> Want real emails in your personal inbox?</h4>
                        <p style="margin: 0 0 0.8rem 0; font-size: 0.82rem; color: #cbd5e1; line-height: 1.5;">
                            Transit.IN supports zero-config SMTP sending via your own Gmail or any mail server.
                            For Gmail, simply generate a free 16-character <strong>App Password</strong> in your Google Account:
                        </p>
                        <ol style="margin: 0 0 1rem 0; padding-left: 1.2rem; font-size: 0.8rem; color: #94a3b8; line-height: 1.6;">
                            <li>Go to <strong>Google Account</strong> (myaccount.google.com) ➔ <strong>Security</strong>.</li>
                            <li>Ensure <strong>2-Step Verification</strong> is ON, then search for <strong>App Passwords</strong>.</li>
                            <li>Create an app named <em>Transit.IN</em> and paste the 16-character code below:</li>
                        </ol>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; margin-bottom: 0.8rem;">
                            <div>
                                <label style="display: block; font-size: 0.78rem; color: #cbd5e1; margin-bottom: 0.3rem;">Your Gmail / Sender Address</label>
                                <input type="email" id="modal-smtp-user" placeholder="yourname@gmail.com" value="${recipientEmail.includes('@') ? recipientEmail : ''}" style="width: 100%; padding: 0.5rem 0.8rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.3); color: #fff; font-size: 0.85rem;">
                            </div>
                            <div>
                                <label style="display: block; font-size: 0.78rem; color: #cbd5e1; margin-bottom: 0.3rem;">Gmail App Password (16 chars)</label>
                                <input type="password" id="modal-smtp-pass" placeholder="xxxx xxxx xxxx xxxx" style="width: 100%; padding: 0.5rem 0.8rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.3); color: #fff; font-size: 0.85rem;">
                            </div>
                        </div>

                        <div style="display: flex; gap: 0.8rem; align-items: center; flex-wrap: wrap;">
                            <button id="modal-save-smtp-btn" class="btn-primary" style="padding: 0.5rem 1.2rem; font-size: 0.85rem; background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                                <i class="fa-solid fa-floppy-disk"></i> Save &amp; Send Real Test Email
                            </button>
                            <span id="modal-smtp-status-text" style="font-size: 0.8rem; color: #94a3b8;"></span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal Footer Actions -->
            <div style="padding: 1rem 1.5rem; border-top: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.8rem; background: rgba(15, 23, 42, 0.6);">
                <div style="display: flex; gap: 0.8rem;">
                    <a href="https://mail.google.com" target="_blank" rel="noopener noreferrer" class="btn-secondary-glass" style="padding: 0.45rem 0.9rem; font-size: 0.82rem; text-decoration: none; color: #fff; display: inline-flex; align-items: center; gap: 0.4rem;">
                        <i class="fa-brands fa-google" style="color: #EA4335;"></i> Open Gmail
                    </a>
                    <a href="notifications.html" class="btn-secondary-glass" style="padding: 0.45rem 0.9rem; font-size: 0.82rem; text-decoration: none; color: #fff; display: inline-flex; align-items: center; gap: 0.4rem;">
                        <i class="fa-solid fa-bell"></i> View Alerts Hub
                    </a>
                </div>
                <button id="modal-done-btn" class="btn-primary" style="padding: 0.45rem 1.2rem; font-size: 0.82rem;">
                    Close
                </button>
            </div>
        </div>
    `;

    setTimeout(() => {
        const frame = document.getElementById('email-html-frame');
        if (frame && frame.contentWindow) {
            frame.contentWindow.document.open();
            frame.contentWindow.document.write(emailPreviewHtml);
            frame.contentWindow.document.close();
        }
    }, 50);

    const closeBtn = document.getElementById('close-email-hub-modal');
    const doneBtn = document.getElementById('modal-done-btn');
    const closeModal = () => { modal.style.display = 'none'; };
    if (closeBtn) closeBtn.onclick = closeModal;
    if (doneBtn) doneBtn.onclick = closeModal;
    modal.onclick = (e) => { if (e.target === modal) closeModal(); };

    const tabPrev = document.getElementById('email-tab-preview');
    const tabSetup = document.getElementById('email-tab-setup');
    const panePrev = document.getElementById('email-pane-preview');
    const paneSetup = document.getElementById('email-pane-setup');

    if (tabPrev && tabSetup) {
        tabPrev.onclick = () => {
            tabPrev.style.border = '1px solid #38bdf8';
            tabPrev.style.background = 'rgba(56, 189, 248, 0.2)';
            tabPrev.style.color = '#ffffff';
            tabSetup.style.border = '1px solid rgba(255,255,255,0.15)';
            tabSetup.style.background = 'transparent';
            tabSetup.style.color = '#94a3b8';
            panePrev.style.display = 'block';
            paneSetup.style.display = 'none';
        };

        tabSetup.onclick = () => {
            tabSetup.style.border = '1px solid #10b981';
            tabSetup.style.background = 'rgba(16, 185, 129, 0.2)';
            tabSetup.style.color = '#ffffff';
            tabPrev.style.border = '1px solid rgba(255,255,255,0.15)';
            tabPrev.style.background = 'transparent';
            tabPrev.style.color = '#94a3b8';
            panePrev.style.display = 'none';
            paneSetup.style.display = 'block';
        };
    }

    const saveSmtpBtn = document.getElementById('modal-save-smtp-btn');
    const statusText = document.getElementById('modal-smtp-status-text');
    if (saveSmtpBtn) {
        saveSmtpBtn.onclick = async () => {
            const user = (document.getElementById('modal-smtp-user').value || '').trim();
            const pass = (document.getElementById('modal-smtp-pass').value || '').trim();
            if (!user || !pass) {
                alert('Please enter your Gmail address and 16-character App Password.');
                return;
            }

            saveSmtpBtn.disabled = true;
            saveSmtpBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating &amp; Sending Test Email...';
            if (statusText) statusText.textContent = 'Connecting to smtp.gmail.com:465...';

            const API = (window.location.protocol === 'file:' || (window.location.port && window.location.port !== '5000')) ? 'http://localhost:5000' : '';

            try {
                await fetch(`${API}/api/email/config`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        enabled: true,
                        service: 'gmail',
                        host: 'smtp.gmail.com',
                        port: 465,
                        secure: true,
                        user,
                        pass,
                        fromName: 'Transit.IN Service Alerts',
                        fromEmail: user
                    })
                });

                const testRes = await fetch(`${API}/api/email/test`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ to: recipientEmail || user, user, pass })
                });
                const testData = await testRes.json();

                if (testData.success) {
                    saveSmtpBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Connected &amp; Delivered!';
                    saveSmtpBtn.style.background = '#10b981';
                    if (statusText) {
                        statusText.style.color = '#34d399';
                        statusText.innerHTML = `✓ Real test email delivered to <strong>${recipientEmail || user}</strong>!`;
                    }
                    if (typeof toast === 'function') toast('🎉 Live email delivered to your inbox!', 'envelope-circle-check');
                } else {
                    saveSmtpBtn.disabled = false;
                    saveSmtpBtn.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Retry SMTP Connection';
                    if (statusText) {
                        statusText.style.color = '#f87171';
                        statusText.textContent = testData.error || 'SMTP Connection failed. Verify App Password.';
                    }
                }
            } catch (err) {
                saveSmtpBtn.disabled = false;
                saveSmtpBtn.innerHTML = 'Save &amp; Send Real Test Email';
                if (statusText) {
                    statusText.style.color = '#f87171';
                    statusText.textContent = 'Network or server error: ' + err.message;
                }
            }
        };
    }

    modal.style.display = 'flex';
}

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
const existingKbd = document.getElementById('navCmdKBtn');
if (existingKbd) {
  existingKbd.addEventListener('click', openP);
}

setTimeout(() => toast('Welcome to Transit.IN. Press Ctrl + K to jump anywhere.', 'bus'), 1500);
})();
