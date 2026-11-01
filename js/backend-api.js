/**
 * Transit.IN - Client Backend API Connector & Diagnostics Hub
 * Bridges Frontend with Node.js / Python REST API
 */

const TransitBackendAPI = (function() {
    // Detect Backend URL (relative or fallback to localhost:5000)
    const isFileProtocol = window.location.protocol === 'file:';
    const API_BASE_URL = isFileProtocol ? 'http://localhost:5000' : '';

    let isConnected = false;
    let backendMetadata = null;

    // 1. Probing Server Health
    async function checkHealth() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2500);

            const res = await fetch(`${API_BASE_URL}/api/health`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (res.ok) {
                const data = await res.json();
                isConnected = true;
                backendMetadata = data;
                window.isBackendConnected = true;
                updateStatusBadge(true, data);
                return data;
            }
        } catch (err) {
            // Server not reached, fallback to local standalone mode
            isConnected = false;
            window.isBackendConnected = false;
            updateStatusBadge(false);
            return null;
        }
    }

    // 2. Inject Dynamic Backend Status Badge into Navbar
    function updateStatusBadge(online, meta) {
        const navActions = document.querySelector('.nav-actions');
        if (!navActions) return;

        let badge = document.getElementById('backend-status-pill');
        if (!badge) {
            badge = document.createElement('div');
            badge.id = 'backend-status-pill';
            badge.className = 'backend-status-pill';
            badge.onclick = showDiagnosticsModal;
            navActions.insertBefore(badge, navActions.firstChild);
        }

        if (online) {
            badge.className = 'backend-status-pill online';
            badge.title = `Backend Connected (Port ${meta?.port || 5000}) - Click for API Diagnostics`;
            badge.innerHTML = `
                <span class="backend-dot-live"></span>
                <span>Backend: Connected</span>
            `;
        } else {
            badge.className = 'backend-status-pill offline';
            badge.title = 'Backend Offline - Running in Local Mode. Run "node server.js" to connect.';
            badge.innerHTML = `
                <span class="backend-dot-offline"></span>
                <span>Backend: Standalone</span>
            `;
        }
    }

    // 3. Diagnostics Modal
    function showDiagnosticsModal() {
        let modal = document.getElementById('backend-diagnostics-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'backend-diagnostics-modal';
            modal.className = 'booking-modal-overlay';
            modal.style.display = 'none';
            document.body.appendChild(modal);

            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.style.display = 'none';
            });
        }

        const statusColor = isConnected ? 'var(--success-color)' : 'var(--warning-color)';
        const statusText = isConnected ? 'ONLINE & CONNECTED' : 'STANDALONE LOCAL MODE';
        const portText = backendMetadata?.port || 5000;
        const uptime = backendMetadata?.uptimeSeconds ? `${backendMetadata.uptimeSeconds}s` : 'Active';

        modal.innerHTML = `
            <div class="booking-modal-card glass-card animate-zoom-in" style="max-width: 580px; padding: 2rem; border: 1px solid var(--card-border); text-align: left;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.2rem;">
                    <div style="display: flex; align-items: center; gap: 0.8rem;">
                        <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(59, 130, 246, 0.15); color: var(--accent-color); display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">
                            <i class="fa-solid fa-server"></i>
                        </div>
                        <div>
                            <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--text-primary); margin: 0;">Transit.IN Backend Status</h3>
                            <p style="font-size: 0.82rem; color: var(--text-secondary); margin: 0;">Node.js / Express REST API Controller</p>
                        </div>
                    </div>
                    <button onclick="document.getElementById('backend-diagnostics-modal').style.display='none'" style="background: transparent; border: none; font-size: 1.4rem; color: var(--text-secondary); cursor: pointer;">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <!-- Live Status Banner -->
                <div style="background: rgba(15, 23, 42, 0.05); border: 1px solid var(--card-border); border-radius: 12px; padding: 1rem 1.2rem; margin-bottom: 1.2rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem;">
                        <span style="font-size: 0.85rem; color: var(--text-secondary);">Connection State:</span>
                        <strong style="color: ${statusColor}; font-size: 0.9rem;">
                            <i class="fa-solid fa-circle" style="font-size: 0.6rem; vertical-align: middle;"></i> ${statusText}
                        </strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem;">
                        <span style="font-size: 0.85rem; color: var(--text-secondary);">Server Port:</span>
                        <strong style="color: var(--text-primary); font-family: monospace;">http://localhost:${portText}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 0.85rem; color: var(--text-secondary);">Active Cities Supported:</span>
                        <span style="font-size: 0.82rem; font-weight: 700; color: var(--accent-color);">7 Pan-India Metros</span>
                    </div>
                </div>

                <!-- API Endpoints Roster -->
                <h4 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 0.6rem; color: var(--text-primary); text-transform: uppercase;">
                    <i class="fa-solid fa-network-wired" style="color: var(--accent-color);"></i> Live REST API Endpoints
                </h4>
                <div style="background: rgba(0, 0, 0, 0.04); border-radius: 10px; padding: 0.6rem 0.9rem; max-height: 180px; overflow-y: auto; font-family: monospace; font-size: 0.78rem; border: 1px solid var(--card-border); margin-bottom: 1.2rem;">
                    <div style="padding: 0.3rem 0; border-bottom: 1px dashed var(--card-border); display: flex; justify-content: space-between;">
                        <span style="color: #10b981; font-weight: 700;">GET</span>
                        <span>/api/health</span>
                        <span style="color: var(--text-secondary);">Server heartbeat &amp; metrics</span>
                    </div>
                    <div style="padding: 0.3rem 0; border-bottom: 1px dashed var(--card-border); display: flex; justify-content: space-between;">
                        <span style="color: #10b981; font-weight: 700;">GET</span>
                        <span>/api/routes?city=Delhi</span>
                        <span style="color: var(--text-secondary);">7-city routes catalog</span>
                    </div>
                    <div style="padding: 0.3rem 0; border-bottom: 1px dashed var(--card-border); display: flex; justify-content: space-between;">
                        <span style="color: #10b981; font-weight: 700;">GET</span>
                        <span>/api/track/:routeId</span>
                        <span style="color: var(--text-secondary);">Live GPS telemetry &amp; crowd</span>
                    </div>
                    <div style="padding: 0.3rem 0; border-bottom: 1px dashed var(--card-border); display: flex; justify-content: space-between;">
                        <span style="color: #3b82f6; font-weight: 700;">POST</span>
                        <span>/api/auth/login</span>
                        <span style="color: var(--text-secondary);">Commuter &amp; admin session</span>
                    </div>
                    <div style="padding: 0.3rem 0; border-bottom: 1px dashed var(--card-border); display: flex; justify-content: space-between;">
                        <span style="color: #3b82f6; font-weight: 700;">POST</span>
                        <span>/api/tickets/book</span>
                        <span style="color: var(--text-secondary);">Contactless digital e-pass</span>
                    </div>
                    <div style="padding: 0.3rem 0; border-bottom: 1px dashed var(--card-border); display: flex; justify-content: space-between;">
                        <span style="color: #f59e0b; font-weight: 700;">POST</span>
                        <span>/api/alerts/report</span>
                        <span style="color: var(--text-secondary);">Crowdsourced delay broadcast</span>
                    </div>
                    <div style="padding: 0.3rem 0; display: flex; justify-content: space-between;">
                        <span style="color: #ef4444; font-weight: 700;">POST</span>
                        <span>/api/safety/sos</span>
                        <span style="color: var(--text-secondary);">24/7 Police distress beacon</span>
                    </div>
                </div>

                <!-- Actions -->
                <div style="display: flex; gap: 0.75rem; justify-content: flex-end; flex-wrap: wrap;">
                    <button onclick="TransitBackendAPI.checkHealth()" class="btn-primary" style="padding: 0.55rem 1.1rem; font-size: 0.85rem;">
                        <i class="fa-solid fa-arrows-rotate"></i> Ping Server Now
                    </button>
                    <button onclick="document.getElementById('backend-diagnostics-modal').style.display='none'" class="sim-btn" style="padding: 0.55rem 1rem; font-size: 0.85rem;">
                        Close
                    </button>
                </div>
            </div>
        `;

        modal.style.display = 'flex';
    }

    // Auto-probe on script load
    document.addEventListener('DOMContentLoaded', () => {
        checkHealth();
    });

    return {
        checkHealth: checkHealth,
        showDiagnosticsModal: showDiagnosticsModal,
        isConnected: () => isConnected,
        getBaseUrl: () => API_BASE_URL
    };
})();
