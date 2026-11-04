const fs = require('fs');
const path = require('path');

const pages = [
  'index.html', 'routes.html', 'tracking.html', 'timetable.html',
  'notifications.html', 'booking.html', 'safety.html', 'voice.html',
  'admin.html', 'profile.html'
];

const cssTag = '<link rel="stylesheet" href="css/ai-assistant.css">';
const jsTag  = '<script src="js/ai-assistant.js" defer></script>';

let updatedCount = 0;

pages.forEach(file => {
  if (!fs.existsSync(file)) {
    console.log(`Skipping ${file} — not found`);
    return;
  }

  let html = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Add CSS (before </head>)
  if (!html.includes('ai-assistant.css')) {
    html = html.replace('</head>', `    ${cssTag}\n</head>`);
    changed = true;
  }

  // Add JS (before </body>)
  if (!html.includes('ai-assistant.js')) {
    html = html.replace('</body>', `    ${jsTag}\n</body>`);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, html, 'utf8');
    console.log(`✅ Updated ${file}`);
    updatedCount++;
  } else {
    console.log(`⏭ No change in ${file}`);
  }
});

console.log(`\nDone. Updated ${updatedCount} files.`);
