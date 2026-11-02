/**
 * TRANSIT.IN — Mobile-First Driver Console Logic
 * In-cabin touch telemetry, passenger counter, and emergency beacons
 */

(function () {
  'use strict';

  let tripActive = false;
  let tripSeconds = 0;
  let tripTimerInterval = null;
  let passengerCount = 32;
  const maxCapacity = 50;

  // Elements
  const timerEl = document.getElementById('trip-elapsed-timer');
  const statusPill = document.getElementById('trip-status-pill');
  const startBtn = document.getElementById('startTripBtn');
  const endBtn = document.getElementById('endTripBtn');
  const countDisplay = document.getElementById('passenger-count-display');
  const levelBadge = document.getElementById('occupancy-level-badge');
  const speedEl = document.getElementById('live-speed-value');

  // Trip Start/End Controller
  window.toggleTripState = function (start) {
    if (start) {
      tripActive = true;
      startBtn.disabled = true;
      startBtn.style.opacity = '0.5';
      endBtn.disabled = false;
      endBtn.style.opacity = '1';

      if (statusPill) {
        statusPill.className = 'pill-badge pill-badge-green';
        statusPill.innerHTML = '<span class="live-pulse-dot" style="background:#34D399;"></span> IN TRANSIT';
      }

      tripTimerInterval = setInterval(() => {
        tripSeconds++;
        const hrs = String(Math.floor(tripSeconds / 3600)).padStart(2, '0');
        const mins = String(Math.floor((tripSeconds % 3600) / 60)).padStart(2, '0');
        const secs = String(tripSeconds % 60).padStart(2, '0');
        if (timerEl) timerEl.textContent = `${hrs}:${mins}:${secs}`;

        // Fluctuate speed realistically
        if (speedEl && Math.random() > 0.6) {
          const s = Math.floor(34 + Math.random() * 12);
          speedEl.textContent = s;
        }
      }, 1000);

      // Notify backend
      syncDriverTelemetry({ status: 'IN_TRANSIT', passengerCount });
    } else {
      if (!confirm('End current transit trip and finalize route log?')) return;
      tripActive = false;
      clearInterval(tripTimerInterval);
      startBtn.disabled = false;
      startBtn.style.opacity = '1';
      endBtn.disabled = true;
      endBtn.style.opacity = '0.5';

      if (statusPill) {
        statusPill.className = 'pill-badge pill-badge-blue';
        statusPill.textContent = 'TRIP COMPLETED';
      }

      alert('Trip completed successfully! Telematics log uploaded to Central Depot.');
      syncDriverTelemetry({ status: 'COMPLETED', durationSec: tripSeconds, passengerCount });
      tripSeconds = 0;
    }
  };

  // Passenger Occupancy Stepper
  window.adjustPassengerCount = function (delta) {
    passengerCount = Math.max(0, Math.min(maxCapacity, passengerCount + delta));
    if (countDisplay) countDisplay.textContent = passengerCount;

    const percentage = Math.round((passengerCount / maxCapacity) * 100);
    let label = 'AVAILABLE';
    let pillClass = 'pill-badge pill-badge-green';

    if (percentage > 80) {
      label = 'CROWDED';
      pillClass = 'pill-badge pill-badge-purple';
    } else if (percentage > 45) {
      label = 'MODERATE';
      pillClass = 'pill-badge pill-badge-blue';
    }

    if (levelBadge) {
      levelBadge.className = pillClass;
      levelBadge.textContent = `${label} (${percentage}%)`;
    }

    // Persist locally for instant map reflection
    localStorage.setItem('driver_live_occupancy', JSON.stringify({
      vehId: 'KA-01-F-2024',
      routeId: '500A',
      count: passengerCount,
      percentage,
      label
    }));

    syncDriverTelemetry({ passengerCount, percentage, label });
  };

  // Driver SOS
  window.triggerDriverEmergency = function () {
    if (confirm('BROADCAST HIGH-PRIORITY IN-CABIN EMERGENCY BEACON TO CENTRAL DISPATCH?')) {
      alert('EMERGENCY SIGNAL TRANSMITTED! Transit Police Unit & Dispatcher alerted with your vehicle GPS coordinates.');
      syncDriverTelemetry({ emergency: true, timestamp: new Date().toISOString() });
    }
  };

  // Defect Modal
  window.openDriverDefectModal = function () {
    const modal = document.getElementById('driver-defect-modal');
    if (modal) modal.style.display = 'flex';
  };

  window.closeDriverDefectModal = function () {
    const modal = document.getElementById('driver-defect-modal');
    if (modal) modal.style.display = 'none';
  };

  window.submitDriverDefect = function (e) {
    e.preventDefault();
    const symptom = document.getElementById('defect-type')?.value;
    const notes = document.getElementById('defect-notes')?.value;
    alert(`Vehicle Defect Report for KA-01-F-2024 [${symptom}] logged. Mechanics scheduled at terminal.`);
    window.closeDriverDefectModal();
  };

  async function syncDriverTelemetry(data) {
    try {
      await fetch('/api/driver/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (err) {
      console.log('Driver offline telemetry mode');
    }
  }
})();
