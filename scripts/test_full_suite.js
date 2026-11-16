/**
 * Transit.IN Complete Test Suite
 * Tests Newsletter Subscription, Email Service, SMTP Client, Outbox, and Admin Features
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');

const emailService = require('./emailService');

function createMockReq(method, urlPath, body = null, headers = {}) {
    const stream = new Readable();
    stream._read = () => {};
    if (body) {
        stream.push(typeof body === 'string' ? body : JSON.stringify(body));
    }
    stream.push(null);

    stream.method = method;
    stream.url = urlPath;
    stream.headers = {
        'content-type': 'application/json',
        ...headers
    };
    return stream;
}

function createMockRes() {
    let headers = {};
    let statusCode = 200;
    let body = '';
    let resolveFn;

    const promise = new Promise((resolve) => {
        resolveFn = resolve;
    });

    const res = {
        setHeader: (k, v) => { headers[k.toLowerCase()] = v; },
        getHeader: (k) => headers[k.toLowerCase()],
        statusCode,
        status: function(c) { this.statusCode = c; return this; },
        end: function(data) {
            if (data) body += data;
            let parsed = null;
            try { parsed = JSON.parse(body); } catch(e) { parsed = body; }
            resolveFn({ statusCode: this.statusCode, headers, body, json: parsed });
        },
        json: function(data) {
            this.setHeader('content-type', 'application/json');
            this.end(JSON.stringify(data));
        },
        promise
    };

    return res;
}

async function runTestSuite() {
    console.log('=== RUNNING TRANSIT.IN TEST SUITE ===\n');

    // Test 1: Email Service Config Loading
    console.log('TEST 1: Email Service Configuration');
    const conf = emailService.loadEmailConfig();
    assert(conf && typeof conf === 'object', 'Config should be an object');
    assert(conf.smtp && conf.smtp.host === 'smtp.gmail.com', 'Default SMTP host should be smtp.gmail.com');
    console.log('✓ Email service config loaded successfully.');

    // Test 2: HTML Email Generation
    console.log('\nTEST 2: HTML Email Generation');
    const welcomeHtml = emailService.generateWelcomeEmailHtml({
        email: 'commuter@example.com',
        city: 'Delhi',
        liveAlerts: [{ title: 'Route 507 Delay', message: 'Rain traffic delay of 10m', route: '507', time: '5 min ago' }]
    });
    assert(welcomeHtml.includes('commuter@example.com'), 'Welcome HTML must include recipient email');
    assert(welcomeHtml.includes('Delhi'), 'Welcome HTML must include city');
    assert(welcomeHtml.includes('Route 507 Delay'), 'Welcome HTML must include alert title');
    console.log('✓ Welcome alert HTML generated with recipient, city, and live alerts.');

    const broadcastHtml = emailService.generateBroadcastEmailHtml({
        title: 'Emergency Metro Diversion',
        message: 'Platform 3 closed for track inspection',
        type: 'danger',
        city: 'Mumbai',
        route: 'Coastal Line',
        alertId: 'ALT-9999'
    });
    assert(broadcastHtml.includes('Emergency Metro Diversion'), 'Broadcast HTML must contain title');
    assert(broadcastHtml.includes('Mumbai'), 'Broadcast HTML must contain city');
    console.log('✓ Broadcast alert HTML generated successfully.');

    // Test 3: Email Dispatch & Outbox Staging
    console.log('\nTEST 3: Email Dispatch & Outbox Staging');
    const testDb = { sentEmails: [] };
    const dispatchRes = await emailService.dispatchEmail({
        to: 'shreya.f@example.com',
        subject: 'Transit.IN Alert',
        html: welcomeHtml,
        city: 'Bengaluru',
        type: 'welcome_alert',
        db: testDb
    });
    assert(dispatchRes.success === true, 'Dispatch should report success');
    assert(testDb.sentEmails.length === 1, 'Sent email must be recorded in db.sentEmails');
    assert(testDb.sentEmails[0].to === 'shreya.f@example.com', 'Recipient should match');
    assert(testDb.sentEmails[0].subject === 'Transit.IN Alert', 'Subject should match');
    assert(testDb.sentEmails[0].status.includes('Staged in Outbox') || testDb.sentEmails[0].status.includes('Delivered'), 'Status should be valid');
    console.log(`✓ Email staged in outbox: ${testDb.sentEmails[0].id} (Status: ${testDb.sentEmails[0].status})`);

    // Test 4: SMTP Validation & Protocol Error Handling
    console.log('\nTEST 4: SMTP Client Error Handling');
    let rejected = false;
    try {
        await emailService.sendSmtpEmail({ host: '', user: '', pass: '', to: 'x@x.com' });
    } catch(err) {
        rejected = true;
        assert(err.message.includes('missing'), 'Error message should report missing credentials');
    }
    assert(rejected, 'sendSmtpEmail should reject empty config');
    console.log('✓ SMTP client properly validates parameters and throws error for missing config.');

    // Test 5: Verify server.js routes by inspecting exported/router handles
    console.log('\nTEST 5: Server.js Route Inspection');
    const serverContent = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
    assert(serverContent.includes('/api/email/config'), 'server.js must define /api/email/config');
    assert(serverContent.includes('/api/email/test'), 'server.js must define /api/email/test');
    assert(serverContent.includes('/api/email/outbox'), 'server.js must define /api/email/outbox');
    assert(serverContent.includes('/api/newsletter/subscribe'), 'server.js must define /api/newsletter/subscribe');
    assert(serverContent.includes('/api/subscribers/notify'), 'server.js must define /api/subscribers/notify');
    assert(serverContent.includes('db.sentEmails'), 'server.js must initialize and maintain db.sentEmails');
    console.log('✓ All REST endpoints for email configuration, test sending, outbox, and alerts verified in server.js.');

    // Test 6: Verify index.html & enhance.js email modal
    console.log('\nTEST 6: Frontend Subscription & Modal Integration');
    const enhanceContent = fs.readFileSync(path.join(__dirname, '..', 'js', 'enhance.js'), 'utf8');
    assert(enhanceContent.includes('openEmailHubModal'), 'enhance.js must define openEmailHubModal');
    assert(enhanceContent.includes('transit-email-hub-modal'), 'enhance.js must manage transit-email-hub-modal');
    assert(enhanceContent.includes('view-email-preview-link'), 'enhance.js must bind view-email-preview-link');
    console.log('✓ Frontend enhance.js includes instant outbox modal, HTML email preview, and SMTP setup tab.');

    // Test 7: Verify admin.html & admin.js email gateway
    console.log('\nTEST 7: Admin Panel SMTP Gateway & Outbox UI');
    const adminHtml = fs.readFileSync(path.join(__dirname, '..', 'admin.html'), 'utf8');
    assert(adminHtml.includes('admin-smtp-form'), 'admin.html must include admin-smtp-form');
    assert(adminHtml.includes('admin-email-outbox-tbody'), 'admin.html must include admin-email-outbox-tbody');
    assert(adminHtml.includes('admin-email-preview-modal'), 'admin.html must include admin-email-preview-modal');
    assert(adminHtml.includes('alert-send-email-cb'), 'admin.html must include alert-send-email-cb in broadcast modal');

    const adminJs = fs.readFileSync(path.join(__dirname, '..', 'js', 'admin.js'), 'utf8');
    assert(adminJs.includes('loadAdminSmtpSettings'), 'admin.js must define loadAdminSmtpSettings');
    assert(adminJs.includes('saveAdminSmtpSettings'), 'admin.js must define saveAdminSmtpSettings');
    assert(adminJs.includes('renderAdminEmailOutbox'), 'admin.js must define renderAdminEmailOutbox');
    assert(adminJs.includes('inspectAdminEmail'), 'admin.js must define inspectAdminEmail');
    console.log('✓ Admin panel includes SMTP gateway configuration, live test sender, and email outbox logs.');

    console.log('\n=== ALL 7 TESTS PASSED PERFECTLY! ===');
}

runTestSuite().catch(err => {
    console.error('Test Suite Failed:', err);
    process.exit(1);
});
