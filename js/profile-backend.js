/* Wires profile.html to the backend. Load at the END of <body>, after the inline script.
   Falls back to the page's original localStorage behaviour when the API is unreachable. */
(() => {
const API = window.API_BASE || 'http://localhost:5000/api';
const $ = id => document.getElementById(id);
const LS = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const email = () => localStorage.getItem('spt-user-email') || 'shreya.f@example.com';

// keep the original implementations (renderers + offline fallbacks)
const O = {};
['loadUserProfile', 'loadWalletDisplay', 'loadUserStatsAndTrips', 'renderTripsList', 'openNotificationSettingsModal', 'openPrivacyModal', 'openHelpModal', 'openFeedbackModal', 'renderUserTickets', 'renderCommunityFeedbacks', 'confirmLogoutAction', 'handleAvatarFileChosen', 'removeAvatarPhoto', 'quickRechargeWallet', 'saveNewPaymentMethod', 'saveNotificationSettings', 'saveSecurityPreferences', 'handleChangePassword', 'handleRaiseTicket', 'submitFeedback', 'clearCommuteHistory']
  .forEach(n => O[n] = window[n]);

// status pill
const pill = document.createElement('div');
pill.style.cssText = 'position:fixed;left:14px;bottom:14px;z-index:9000;padding:.35rem .8rem;border-radius:20px;font:600 .75rem Inter,sans-serif;background:rgba(15,23,42,.85);color:#fff;border:1px solid rgba(255,255,255,.15)';
document.body.append(pill);
const setOnline = on => { pill.innerHTML = `<i class="fa-solid fa-circle" style="color:${on ? '#10b981' : '#f59e0b'};font-size:.6rem"></i> ${on ? 'Backend connected' : 'Backend offline (saving locally)'}`; };
setOnline(false);

function notify(msg, good = true) {
  const t = $('save-toast'); if (!t) return alert(msg);
  t.style.background = good ? 'rgba(16,185,129,.15)' : 'rgba(239,68,68,.15)';
  t.style.borderColor = good ? 'var(--success-color)' : 'var(--danger-color)';
  t.style.color = good ? 'var(--success-color)' : 'var(--danger-color)';
  t.innerHTML = `<i class="fa-solid fa-${good ? 'circle-check' : 'circle-exclamation'}"></i> ${msg}`;
  t.style.display = 'block'; setTimeout(() => t.style.display = 'none', 3500);
}

async function api(path, method = 'GET', body) {
  let r;
  try {
    r = await fetch(API + path, { method, headers: { 'Content-Type': 'application/json', 'X-User-Email': email() }, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch (e) { setOnline(false); throw e; }          // network failure => offline
  setOnline(true);
  const j = await r.json().catch(() => ({}));
  if (!r.ok) { const e = new Error(j.error || r.statusText); e.api = true; throw e; }
  return j;
}
// run `fn` against the API; on network failure use `offline()`; on API validation error show it
async function run(fn, offline) {
  try { return await fn(); }
  catch (e) { if (e.api) notify(e.message, false); else { notify('Backend offline. Saved on this device only.', false); offline && offline(); } }
}

/* ---------- initial sync ---------- */
async function syncAll() {
  try {
    const [p, w] = await Promise.all([api('/profile'), api('/wallet')]);
    let t = await api('/trips');
    if (!t.length) t = await api('/trips/seed', 'POST', ALL_TRIPS_DATA);   // first run: store the sample trips
    LS('spt-user-profile-data', p); LS('spt-payment-wallet', w);
    if (t.length) ALL_TRIPS_DATA.splice(0, ALL_TRIPS_DATA.length, ...t);
    O.loadUserProfile(); O.loadWalletDisplay(); O.loadUserStatsAndTrips(); O.renderTripsList();
  } catch (e) { /* offline: page already rendered from localStorage */ }
}

/* ---------- profile ---------- */
document.addEventListener('submit', e => {            // capture phase: runs before the page's own handler
  if (e.target.id !== 'edit-profile-form') return;
  e.preventDefault(); e.stopImmediatePropagation();
  const v = id => $(id).value.trim();
  const body = { name: v('input-edit-name'), email: v('input-edit-email'), phone: v('input-edit-phone'), city: $('input-edit-city').value, userType: $('input-edit-type').value, location: v('input-edit-location'), emergencyName: v('input-edit-emergency-name'), emergencyPhone: v('input-edit-emergency-phone'), bio: v('input-edit-bio') };
  run(async () => {
    const p = await api('/profile', 'PUT', body);
    LS('spt-user-profile-data', p); localStorage.setItem('spt-profile-name', p.name);
    O.loadUserProfile(); closeEditModal(); notify('Personal information saved to your account.');
    scrollTo({ top: 0, behavior: 'smooth' });
  }, () => {
    const cur = JSON.parse(localStorage.getItem('spt-user-profile-data') || '{}'); LS('spt-user-profile-data', { ...cur, ...body });
    O.loadUserProfile(); closeEditModal();
  });
}, true);

window.handleAvatarFileChosen = ev => {
  const f = ev.target.files[0]; if (!f) return;
  if (f.size > 1.5 * 1024 * 1024) return notify('Image must be under 1.5 MB', false);
  const rd = new FileReader();
  rd.onload = () => run(async () => {
    const p = await api('/profile/avatar', 'PUT', { avatar: rd.result });
    LS('spt-user-profile-data', p); O.loadUserProfile(); notify('Profile photo updated.');
  }, () => O.handleAvatarFileChosen(ev));
  rd.readAsDataURL(f);
};
window.removeAvatarPhoto = () => run(async () => {
  const p = await api('/profile/avatar', 'DELETE'); LS('spt-user-profile-data', p); O.loadUserProfile(); notify('Profile photo removed.');
}, () => O.removeAvatarPhoto());

/* ---------- wallet & payments ---------- */
async function refreshWallet() { const w = await api('/wallet'); LS('spt-payment-wallet', w); O.loadWalletDisplay(); return w; }
window.openPaymentModal = () => { O.loadWalletDisplay(); $('payment-modal').style.display = 'flex'; refreshWallet().catch(() => {}); };
window.quickRechargeWallet = amount => run(async () => {
  const w = await api('/wallet/recharge', 'POST', { amount }); LS('spt-payment-wallet', w); O.loadWalletDisplay();
  notify(`₹${amount} added. New balance ₹${w.balance.toFixed(2)}`);
}, () => O.quickRechargeWallet(amount));
window.saveNewPaymentMethod = () => {
  const input = $('new-payment-input'), val = input.value.trim();
  run(async () => {
    const w = await api('/wallet/methods', 'POST', { value: val }); LS('spt-payment-wallet', w); O.loadWalletDisplay();
    input.value = ''; toggleAddPaymentMethod(); notify('Payment method linked.');
  }, () => O.saveNewPaymentMethod());
};

/* ---------- notification + security settings ---------- */
const loadSetting = async (name, key, open) => { try { LS(key, await api('/settings/' + name)); } catch (e) {} open(); };
window.openNotificationSettingsModal = () => loadSetting('notifications', 'spt-notification-settings', O.openNotificationSettingsModal);
window.openPrivacyModal = () => loadSetting('security', 'spt-security-settings', O.openPrivacyModal);

window.saveNotificationSettings = e => {
  e.preventDefault();
  const b = { delays: $('notif-toggle-delays').checked, arrival: $('notif-toggle-arrival').checked, offers: $('notif-toggle-offers').checked, email: $('notif-toggle-email').checked, emergency: $('notif-toggle-emergency').checked };
  run(async () => { LS('spt-notification-settings', await api('/settings/notifications', 'PUT', b)); closeNotificationSettingsModal(); notify('Notification preferences saved.'); },
    () => O.saveNotificationSettings({ preventDefault() {} }));
};
window.saveSecurityPreferences = () => {
  const b = { twoFactor: $('sec-toggle-2fa').checked, highGps: $('sec-toggle-gps').checked, anonymize: $('sec-toggle-anonymize').checked };
  run(async () => { LS('spt-security-settings', await api('/settings/security', 'PUT', b)); closePrivacyModal(); notify('Security settings saved.'); },
    () => O.saveSecurityPreferences());
};
window.terminateOtherSessions = () => run(async () => {
  await api('/security/sessions/terminate', 'POST'); const r = $('session-mobile-row'); if (r) r.style.display = 'none'; notify('Other sessions signed out.');
}, () => { const r = $('session-mobile-row'); if (r) r.style.display = 'none'; });
window.clearCommuteHistory = () => {
  if (!confirm('Clear your cached transit search history and recent route queries?')) return;
  run(async () => { await api('/history', 'DELETE'); localStorage.removeItem('spt-recent-searches'); notify('Route history cleared.'); },
    () => localStorage.removeItem('spt-recent-searches'));
};
window.handleChangePassword = e => {
  e.preventDefault();
  const cur = $('input-curr-password').value, nw = $('input-new-password').value, cf = $('input-confirm-password').value, err = $('password-error-msg');
  if (nw !== cf) { err.textContent = 'New passwords do not match.'; err.style.display = 'block'; return; }
  run(async () => {
    await api('/security/password', 'POST', { current: cur, next: nw });
    err.style.display = 'none'; $('change-password-form').reset(); switchSecurityTab('settings'); notify('Password updated.');
  }, () => O.handleChangePassword(e));
};

/* ---------- help desk + feedback ---------- */
window.openHelpModal = async () => {
  try { LS('spt-support-tickets', await api('/tickets')); } catch (e) {}
  switchHelpTab('faqs'); O.renderUserTickets(); $('help-modal').style.display = 'flex';
};
window.handleRaiseTicket = e => {
  e.preventDefault();
  const b = { category: $('ticket-category').value, route: $('ticket-route').value.trim(), description: $('ticket-description').value.trim() };
  run(async () => {
    const t = await api('/tickets', 'POST', b); LS('spt-support-tickets', await api('/tickets'));
    $('raise-ticket-form').reset(); O.renderUserTickets(); notify(`Ticket ${t.id} created. We will reply within 24 hours.`);
  }, () => O.handleRaiseTicket(e));
};
window.openFeedbackModal = async () => {
  try { LS('spt-user-feedbacks', await api('/feedback')); } catch (e) {}
  O.openFeedbackModal();
};
window.submitFeedback = e => {
  e.preventDefault();
  const b = { stars: feedbackRating, category: $('feedback-category').value, author: $('feedback-author-name').value.trim(), comment: $('feedback-comment').value.trim() };
  run(async () => {
    await api('/feedback', 'POST', b); LS('spt-user-feedbacks', await api('/feedback'));
    $('feedback-comment').value = ''; closeFeedbackModal(); notify(`Thanks for your ${b.stars}-star feedback.`);
  }, () => O.submitFeedback(e));
};

/* ---------- logout ---------- */
window.confirmLogoutAction = async ev => {
  const btn = ev?.currentTarget;
  if (btn) { btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Signing Out...'; btn.disabled = true; }
  try { await api('/auth/logout', 'POST'); } catch (e) { /* still sign out locally */ }
  ['spt-authenticated', 'spt-user-role', 'spt-user-email'].forEach(k => localStorage.removeItem(k));
  setTimeout(() => location.href = 'login.html', 400);
};

syncAll();
})();
