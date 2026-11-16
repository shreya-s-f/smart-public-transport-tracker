/**
 * Transit.IN Email Service
 * Zero-dependency pure Node.js SMTP transport & email generator
 */

const fs = require('fs');
const path = require('path');
const tls = require('tls');
const net = require('net');

const CONFIG_PATH = path.join(__dirname, '..', 'email_config.json');

function loadEmailConfig() {
    let config = {
        smtp: {
            enabled: false,
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            user: '',
            pass: '',
            fromName: 'Transit.IN Service Alerts',
            fromEmail: 'alerts@transit.in'
        },
        emailjs: {
            enabled: false,
            publicKey: '',
            serviceId: '',
            templateId: ''
        }
    };

    try {
        if (fs.existsSync(CONFIG_PATH)) {
            const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object') {
                config = {
                    ...config,
                    ...parsed,
                    smtp: { ...config.smtp, ...(parsed.smtp || {}) },
                    emailjs: { ...config.emailjs, ...(parsed.emailjs || {}) }
                };
            }
        }
    } catch (e) {
        console.warn('[EmailService] Failed to parse email_config.json:', e.message);
    }

    // Overlay environment variables if present
    if (process.env.SMTP_HOST) config.smtp.host = process.env.SMTP_HOST;
    if (process.env.SMTP_PORT) config.smtp.port = parseInt(process.env.SMTP_PORT, 10);
    if (process.env.SMTP_USER || process.env.EMAIL_USER) {
        config.smtp.user = process.env.SMTP_USER || process.env.EMAIL_USER;
        config.smtp.enabled = true;
    }
    if (process.env.SMTP_PASS || process.env.EMAIL_PASS) {
        config.smtp.pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
        config.smtp.enabled = true;
    }

    return config;
}

function saveEmailConfig(newConfig) {
    try {
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(newConfig, null, 2), 'utf8');
        return true;
    } catch (e) {
        console.error('[EmailService] Failed to save email_config.json:', e.message);
        return false;
    }
}

/**
 * Send email via SMTP using pure Node.js TLS / Net
 */
function sendSmtpEmail({ host, port, secure, user, pass, fromName, fromEmail, to, subject, text, html }) {
    return new Promise((resolve, reject) => {
        if (!host || !user || !pass) {
            return reject(new Error('SMTP configuration missing: host, user, and pass are required.'));
        }

        const isTls = (secure !== false && (port === 465 || !port));
        const targetPort = port || (isTls ? 465 : 587);
        const targetHost = host;
        const sender = fromEmail || user;
        const senderName = fromName || 'Transit.IN Alerts';
        const recipient = to;

        let step = 0;
        let buffer = '';
        let timer = null;

        const cleanup = () => {
            if (timer) clearTimeout(timer);
        };

        const onConnect = (socket) => {
            timer = setTimeout(() => {
                cleanup();
                socket.destroy();
                reject(new Error('SMTP connection timed out after 15 seconds'));
            }, 15000);

            const send = (cmd) => {
                socket.write(cmd + '\r\n');
            };

            socket.on('data', (chunk) => {
                buffer += chunk.toString('utf-8');
                const lines = buffer.split('\r\n');
                buffer = lines.pop(); // save incomplete line

                for (const line of lines) {
                    if (!line) continue;
                    const code = parseInt(line.substring(0, 3), 10);
                    const isMulti = line.charAt(3) === '-';
                    if (isMulti) continue; // wait for final response line

                    if (step === 0 && (code === 220)) {
                        step = 1;
                        send('EHLO transit.in');
                    } else if (step === 1 && (code === 250)) {
                        step = 2;
                        send('AUTH LOGIN');
                    } else if (step === 2 && (code === 334)) {
                        step = 3;
                        send(Buffer.from(user).toString('base64'));
                    } else if (step === 3 && (code === 334)) {
                        step = 4;
                        send(Buffer.from(pass).toString('base64'));
                    } else if (step === 4 && (code === 235)) {
                        step = 5;
                        send(`MAIL FROM:<${sender}>`);
                    } else if (step === 5 && (code === 250)) {
                        step = 6;
                        send(`RCPT TO:<${recipient}>`);
                    } else if (step === 6 && (code === 250)) {
                        step = 7;
                        send('DATA');
                    } else if (step === 7 && (code === 354)) {
                        step = 8;
                        const boundary = '----=_TransitPart_' + Date.now();
                        const messageId = `<transit.${Date.now()}.${Math.random().toString(36).substring(2)}@transit.in>`;
                        const dateStr = new Date().toUTCString();

                        const payload = [
                            `From: "${senderName}" <${sender}>`,
                            `To: <${recipient}>`,
                            `Subject: =?UTF-8?B?${Buffer.from(subject || 'Transit.IN Service Alert').toString('base64')}?=`,
                            `Date: ${dateStr}`,
                            `Message-ID: ${messageId}`,
                            `MIME-Version: 1.0`,
                            `Content-Type: multipart/alternative; boundary="${boundary}"`,
                            ``,
                            `--${boundary}`,
                            `Content-Type: text/plain; charset=UTF-8`,
                            `Content-Transfer-Encoding: base64`,
                            ``,
                            Buffer.from(text || 'Transit.IN Service Alert').toString('base64'),
                            ``,
                            `--${boundary}`,
                            `Content-Type: text/html; charset=UTF-8`,
                            `Content-Transfer-Encoding: base64`,
                            ``,
                            Buffer.from(html || `<p>${text || 'Transit.IN Service Alert'}</p>`).toString('base64'),
                            ``,
                            `--${boundary}--`,
                            `.`
                        ].join('\r\n');

                        send(payload);
                    } else if (step === 8 && (code === 250)) {
                        step = 9;
                        send('QUIT');
                    } else if (step === 9 && (code === 221)) {
                        cleanup();
                        socket.end();
                        return resolve({ success: true, message: 'Email sent successfully via SMTP' });
                    } else if (code >= 400) {
                        cleanup();
                        socket.destroy();
                        return reject(new Error(`SMTP server rejected: [${code}] ${line}`));
                    }
                }
            });

            socket.on('error', (err) => {
                cleanup();
                reject(err);
            });

            socket.on('close', () => {
                cleanup();
                if (step >= 8) {
                    resolve({ success: true, message: 'Email transmitted and socket closed.' });
                } else if (step < 8) {
                    reject(new Error(`SMTP connection closed prematurely at step ${step}. Please check SMTP credentials.`));
                }
            });
        };

        try {
            if (isTls) {
                const socket = tls.connect({
                    host: targetHost,
                    port: targetPort,
                    rejectUnauthorized: false
                }, () => onConnect(socket));
                socket.on('error', (err) => { cleanup(); reject(err); });
            } else {
                const socket = net.connect({
                    host: targetHost,
                    port: targetPort
                }, () => onConnect(socket));
                socket.on('error', (err) => { cleanup(); reject(err); });
            }
        } catch (err) {
            cleanup();
            reject(err);
        }
    });
}

/**
 * Generate Responsive HTML email for Service Alert Subscription Welcome
 */
function generateWelcomeEmailHtml({ email, city, liveAlerts }) {
    const cityName = city || 'Delhi';
    const alertItems = (Array.isArray(liveAlerts) && liveAlerts.length > 0)
        ? liveAlerts.slice(0, 3).map(a => `
            <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 12px 16px; margin-bottom: 10px; border-radius: 4px;">
                <div style="font-weight: 700; color: #1e293b; font-size: 14px;">${a.title || 'Transit Notice'}</div>
                <div style="color: #475569; font-size: 13px; margin-top: 4px;">${a.message || 'Corridor functioning normally.'}</div>
                <div style="color: #94a3b8; font-size: 11px; margin-top: 6px;">📍 ${a.route || 'All Routes'} • ${a.time || 'Live'}</div>
            </div>
        `).join('')
        : `
            <div style="background: #f8fafc; border-left: 4px solid #10b981; padding: 12px 16px; border-radius: 4px;">
                <div style="font-weight: 700; color: #1e293b; font-size: 14px;">🟢 Normal Transit Operations</div>
                <div style="color: #475569; font-size: 13px; margin-top: 4px;">All bus, metro and feeder lines are running on schedule in ${cityName}.</div>
            </div>
        `;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Transit.IN Service Alerts Activated</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f172a; padding: 30px 15px;">
        <tr>
            <td align="center">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 32px 30px; text-align: center; border-bottom: 3px solid #38bdf8;">
                            <div style="display: inline-block; padding: 8px 16px; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 999px; margin-bottom: 12px;">
                                <span style="color: #38bdf8; font-weight: 700; font-size: 13px; letter-spacing: 1px;">TRANSIT.IN SMART MOBILITY</span>
                            </div>
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800;">Real-Time Service Alerts Activated</h1>
                            <p style="color: #94a3b8; font-size: 14px; margin: 8px 0 0 0;">Automated Delays, Diversions & Network Updates</p>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 30px;">
                            <p style="font-size: 16px; color: #1e293b; margin: 0 0 16px 0; font-weight: 600;">
                                Hello Commuter,
                            </p>
                            <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px 0;">
                                Your email (<strong style="color: #0284c7;">${email}</strong>) has been successfully subscribed to live service bulletins and traffic alerts for <strong style="color: #1e293b;">${cityName}</strong>.
                            </p>

                            <!-- City Badge -->
                            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px 16px; margin-bottom: 24px; display: flex; align-items: center;">
                                <span style="font-size: 18px; margin-right: 10px;">🛡️</span>
                                <div>
                                    <div style="font-weight: 700; color: #166534; font-size: 13px;">Active Network Monitoring</div>
                                    <div style="color: #15803d; font-size: 12px;">Monitoring ${cityName} buses, metro corridors, and feeder shuttles.</div>
                                </div>
                            </div>

                            <!-- Live Alerts Section -->
                            <div style="margin-bottom: 24px;">
                                <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin: 0 0 12px 0;">
                                    Current Service Bulletins (${cityName})
                                </h3>
                                ${alertItems}
                            </div>

                            <!-- Quick Action Buttons -->
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 24px;">
                                <tr>
                                    <td align="center" style="padding-bottom: 12px;">
                                        <a href="http://localhost:5000/tracking.html" style="display: inline-block; background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 12px rgba(37,99,235,0.25);">
                                            View Live Bus Tracking Map →
                                        </a>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center">
                                        <a href="http://localhost:5000/notifications.html" style="display: inline-block; color: #0284c7; text-decoration: none; font-size: 13px; font-weight: 600;">
                                            Manage Alert Preferences &amp; View History
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; line-height: 1.5;">
                                <strong>Safety Helpline:</strong> Emergency SOS: 112 | Women Helpline: 1091 | Transit Desk: 1800-TRANSIT<br>
                                You received this email because you subscribed on Transit.IN. If this was not you, you can <a href="http://localhost:5000/notifications.html?unsub=${encodeURIComponent(email)}" style="color: #64748b; text-decoration: underline;">unsubscribe here</a>.
                            </div>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0; font-size: 12px; color: #64748b;">
                                © ${new Date().getFullYear()} Transit.IN Intelligent Public Transport Tracker. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
}

/**
 * Generate Responsive HTML email for Admin Broadcast Alert
 */
function generateBroadcastEmailHtml({ title, message, type, city, route, alertId }) {
    const alertType = (type || 'warning').toUpperCase();
    const typeColor = alertType === 'DANGER' ? '#ef4444' : (alertType === 'WARNING' ? '#f59e0b' : '#3b82f6');
    const cityName = city || 'All Cities';

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Transit.IN Service Alert: ${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f172a; padding: 30px 15px;">
        <tr>
            <td align="center">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 28px 30px; text-align: center; border-bottom: 4px solid ${typeColor};">
                            <div style="display: inline-block; padding: 6px 14px; background: ${typeColor}22; border: 1px solid ${typeColor}; border-radius: 999px; margin-bottom: 10px;">
                                <span style="color: ${typeColor}; font-weight: 800; font-size: 12px; letter-spacing: 1px;">SERVICE ALERT BULLETIN</span>
                            </div>
                            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800;">${title}</h1>
                            <p style="color: #94a3b8; font-size: 13px; margin: 6px 0 0 0;">Region: ${cityName} • Corridor: ${route || 'General Network'}</p>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 30px;">
                            <div style="background: #fef2f2; border-left: 5px solid ${typeColor}; padding: 16px 20px; border-radius: 8px; margin-bottom: 24px;">
                                <div style="font-size: 15px; color: #1e293b; line-height: 1.6; font-weight: 500;">
                                    ${message}
                                </div>
                                <div style="margin-top: 10px; font-size: 12px; color: #64748b;">
                                    Reported: ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} • Alert ID: #${alertId || 'ALT'}
                                </div>
                            </div>

                            <div style="margin-bottom: 24px;">
                                <h4 style="font-size: 13px; text-transform: uppercase; color: #475569; margin: 0 0 8px 0;">Commuter Advisory</h4>
                                <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 13px; line-height: 1.6;">
                                    <li>Please plan for additional travel time if traveling along this corridor.</li>
                                    <li>Check the live tracking map for alternate buses and connecting metro lines.</li>
                                    <li>Transit controllers are actively working to normalize traffic flow.</li>
                                </ul>
                            </div>

                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td align="center">
                                        <a href="http://localhost:5000/tracking.html" style="display: inline-block; background: #0284c7; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 14px;">
                                            Check Live Route Tracking
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <div style="margin-top: 30px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center;">
                                Emergency Transport Desk: 1800-TRANSIT | Police: 112<br>
                                Automated bulletin from Transit.IN Dispatch Operations.
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
}

/**
 * Dispatch an email: If SMTP enabled, sends via SMTP; always records in db.sentEmails outbox
 */
async function dispatchEmail({ to, subject, html, text, city, type, db, saveDb }) {
    const config = loadEmailConfig();
    const emailId = 'EML-' + Date.now().toString().slice(-6) + '-' + Math.floor(Math.random() * 1000);
    const sentAt = new Date().toISOString();

    let emailSent = false;
    let deliveryStatus = 'Queued (Simulation / Needs SMTP setup)';
    let errorMsg = null;

    if (config.smtp && config.smtp.enabled && config.smtp.user && config.smtp.pass) {
        try {
            await sendSmtpEmail({
                host: config.smtp.host,
                port: config.smtp.port,
                secure: config.smtp.secure,
                user: config.smtp.user,
                pass: config.smtp.pass,
                fromName: config.smtp.fromName,
                fromEmail: config.smtp.fromEmail,
                to,
                subject,
                text,
                html
            });
            emailSent = true;
            deliveryStatus = 'Delivered (SMTP)';
        } catch (err) {
            console.error('[EmailService] SMTP transmission failed:', err.message);
            errorMsg = err.message;
            deliveryStatus = `Failed (SMTP: ${err.message})`;
        }
    } else {
        deliveryStatus = 'Staged in Outbox (Local Mode - SMTP not configured)';
    }

    const outboxRecord = {
        id: emailId,
        to,
        from: (config.smtp && config.smtp.fromEmail) ? `"${config.smtp.fromName || 'Transit.IN'}" <${config.smtp.fromEmail}>` : 'Transit.IN Alerts <alerts@transit.in>',
        subject,
        html,
        text: text || (html ? html.replace(/<[^>]*>/g, ' ') : ''),
        city: city || 'All',
        type: type || 'alert',
        status: deliveryStatus,
        sentAt,
        delivered: emailSent,
        error: errorMsg
    };

    if (db) {
        if (!Array.isArray(db.sentEmails)) db.sentEmails = [];
        db.sentEmails.unshift(outboxRecord);
        if (typeof saveDb === 'function') saveDb();
    }

    return {
        success: true,
        emailSent,
        status: deliveryStatus,
        error: errorMsg,
        outboxRecord
    };
}

module.exports = {
    loadEmailConfig,
    saveEmailConfig,
    sendSmtpEmail,
    generateWelcomeEmailHtml,
    generateBroadcastEmailHtml,
    dispatchEmail
};
