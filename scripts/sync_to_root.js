const fs = require('fs');
const path = require('path');

const root = '..';
const src = '.';

// New files to copy to root
const newFiles = [
  ['css/onboarding-tour.css', path.join(root, 'css/onboarding-tour.css')],
  ['js/onboarding-tour.js',  path.join(root, 'js/onboarding-tour.js')],
  ['css/ai-assistant.css',   path.join(root, 'css/ai-assistant.css')],
  ['js/ai-assistant.js',     path.join(root, 'js/ai-assistant.js')],
  ['css/style.css',          path.join(root, 'css/style.css')],
  ['css/landing-page.css',    path.join(root, 'css/landing-page.css')],
  ['css/design-system.css',  path.join(root, 'css/design-system.css')],
  ['css/transit-3d-bg.css',  path.join(root, 'css/transit-3d-bg.css')],
  ['js/transit-3d-bg.js',    path.join(root, 'js/transit-3d-bg.js')],
];

newFiles.forEach(([from, to]) => {
  if (fs.existsSync(from)) {
    fs.copyFileSync(from, to);
    console.log(`Copied ${from} -> ${to}`);
  }
});

// Sync all HTML pages to root
const pages = [
  'index.html', 'routes.html', 'tracking.html', 'timetable.html',
  'notifications.html', 'booking.html', 'safety.html', 'voice.html',
  'admin.html', 'profile.html', 'login.html'
];

pages.forEach(f => {
  if (fs.existsSync(f)) {
    fs.copyFileSync(f, path.join(root, f));
    console.log(`Synced ${f} to root`);
  }
});

console.log('Done syncing to root.');
