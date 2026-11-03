const fs = require('fs');
const path = require('path');

const pages = [
  'index.html', 'routes.html', 'tracking.html', 'timetable.html',
  'notifications.html', 'booking.html', 'safety.html', 'voice.html',
  'admin.html', 'profile.html'
];

const cssTag = '<link rel="stylesheet" href="css/onboarding-tour.css">';
const jsTag  = '<script src="js/onboarding-tour.js" defer></script>';

// Profile page — add "Retake Tour" button somewhere useful
const retakeBtnHtml = `
<div id="retake-tour-card" style="
  background: rgba(139, 92, 246, 0.08);
  border: 1px solid rgba(139, 92, 246, 0.25);
  border-radius: 16px;
  padding: 1.4rem 1.6rem;
  margin: 1.5rem auto;
  max-width: 900px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
">
  <div style="display:flex;align-items:center;gap:1rem;">
    <div style="width:46px;height:46px;border-radius:12px;background:linear-gradient(135deg,#8B5CF6,#38BDF8);display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0;">🗺️</div>
    <div>
      <div style="font-weight:700;color:var(--text-primary,#0f172a);font-size:0.95rem;">Rediscover Transit.IN</div>
      <div style="color:#64748b;font-size:0.83rem;margin-top:0.2rem;">Take the guided tour again to explore all features</div>
    </div>
  </div>
  <button onclick="window.TransitTour.retake()" style="
    display:inline-flex;align-items:center;gap:0.5rem;
    padding:0.6rem 1.3rem;border-radius:10px;border:none;
    background:linear-gradient(135deg,#8B5CF6,#38BDF8);
    color:#fff;font-size:0.85rem;font-weight:700;cursor:pointer;
    box-shadow:0 4px 16px rgba(139,92,246,0.35);
    transition:all 0.18s ease;
  " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform=''">
    <i class="fa-solid fa-play"></i> Retake Tour
  </button>
</div>`;

let updatedCount = 0;

pages.forEach(file => {
  if (!fs.existsSync(file)) {
    console.log(`Skipping ${file} — not found`);
    return;
  }

  let html = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Add CSS (before </head>)
  if (!html.includes('onboarding-tour.css')) {
    html = html.replace('</head>', cssTag + '\n</head>');
    changed = true;
  }

  // Add JS (before </body>)
  if (!html.includes('onboarding-tour.js')) {
    html = html.replace('</body>', jsTag + '\n</body>');
    changed = true;
  }

  // Add retake button to profile.html (inside main, near start)
  if (file === 'profile.html' && !html.includes('retake-tour-card')) {
    html = html.replace('<main>', '<main>\n' + retakeBtnHtml);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, html, 'utf8');
    console.log(`✅ Updated ${file}`);
    updatedCount++;
  } else {
    console.log(`⏭  No change in ${file}`);
  }
});

console.log(`\nDone. Updated ${updatedCount} files.`);
