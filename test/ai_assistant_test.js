const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 Starting AI Assistant Automated Test Suite...\n');

// Test 1: Verify CSS exists and contains bottom-right positioning & mobile rules
const cssPath = path.join(__dirname, '..', 'css', 'ai-assistant.css');
assert(fs.existsSync(cssPath), 'css/ai-assistant.css must exist');
const cssContent = fs.readFileSync(cssPath, 'utf8');
assert(cssContent.includes('.transit-ai-fab-container'), 'CSS must define .transit-ai-fab-container');
assert(cssContent.includes('right: 24px'), 'CSS must position launcher in bottom-right corner');
assert(cssContent.includes('.transit-ai-window'), 'CSS must define .transit-ai-window');
assert(cssContent.includes('@media (max-width: 520px)'), 'CSS must define mobile responsive styles');
console.log('✅ Test 1 Passed: CSS rules and bottom-right positioning verified.');

// Test 2: Verify JS exists and defines TransitAI and core methods
const jsPath = path.join(__dirname, '..', 'js', 'ai-assistant.js');
assert(fs.existsSync(jsPath), 'js/ai-assistant.js must exist');
const jsContent = fs.readFileSync(jsPath, 'utf8');
assert(jsContent.includes('window.TransitAI'), 'JS must expose window.TransitAI');
assert(jsContent.includes('TRANSIT_KB'), 'JS must include TRANSIT_KB knowledge base');
assert(jsContent.includes('processNLPQuery'), 'JS must include processNLPQuery NLP engine');
assert(jsContent.includes('playUiChime'), 'JS must include Web Audio sound effects');
assert(jsContent.includes('speakResponse'), 'JS must include speech synthesis integration');
console.log('✅ Test 2 Passed: AI assistant engine, NLP, and audio methods verified.');

// Test 3: Verify all 10 HTML files include CSS and JS tags
const pages = [
  'index.html', 'routes.html', 'tracking.html', 'timetable.html',
  'notifications.html', 'booking.html', 'safety.html', 'voice.html',
  'admin.html', 'profile.html'
];

pages.forEach(p => {
  const filePath = path.join(__dirname, '..', p);
  assert(fs.existsSync(filePath), `${p} must exist`);
  const content = fs.readFileSync(filePath, 'utf8');
  assert(content.includes('ai-assistant.css'), `${p} must include ai-assistant.css`);
  assert(content.includes('ai-assistant.js'), `${p} must include ai-assistant.js`);
});
console.log('✅ Test 3 Passed: All 10 HTML pages successfully integrated.');

console.log('\n🎉 ALL AI ASSISTANT AUTOMATED TESTS PASSED SUCCESSFULLY!\n');
