/**
 * WAVELENGTH — Founders' Edition 2026
 * Core Systems & Interactive Elements
 *
 * Implements:
 * 1. Metadata synchronization from WAVELENGTH_CONFIG
 * 2. Interactive Game Vehicle Fleet Selector & Arcade Frame Loader
 * 3. Mobile-Optimized Controls HUD
 * 4. VFX AR Simulator & Printable Markers Modals
 * 5. Smooth Anchor Scrolling & Active Link Highlighting
 */

document.addEventListener("DOMContentLoaded", () => {
  // ==========================================================================
  // 1. METADATA SYNCHRONIZATION
  // ==========================================================================
  if (window.WAVELENGTH_CONFIG) {
    const config = window.WAVELENGTH_CONFIG;

    document.querySelectorAll(".dynamic-edition").forEach((el) => {
      el.textContent = config.magazine.edition;
    });

    document.querySelectorAll(".dynamic-mag-title").forEach((el) => {
      el.textContent = config.magazine.title;
    });
  }

  // ==========================================================================
  // 2. GAME VEHICLE FLEET SELECTOR & ARCADE LAUNCHER
  // ==========================================================================
  const vehicleCards = document.querySelectorAll(".vehicle-card-btn");
  const vehiclePreviewImg = document.getElementById("vehicleActiveImg");
  const vehicleNameEl = document.getElementById("vehicleActiveName");
  const vehicleBadgeEl = document.getElementById("vehicleActiveBadge");
  const vehicleTaglineEl = document.getElementById("vehicleActiveTagline");
  const vehicleTopSpeedVal = document.getElementById("vehicleTopSpeedVal");
  const vehicleTopSpeedUnit = document.getElementById("vehicleTopSpeedUnit");
  const vehicleAccelSecVal = document.getElementById("vehicleAccelSecVal");
  const vehicleNumEl = document.getElementById("vehicleActiveNum");

  const statSpeedEl = document.getElementById("statSpeed");
  const statAccelEl = document.getElementById("statAccel");
  const statDriftEl = document.getElementById("statDrift");
  const statHandlingEl = document.getElementById("statHandling");

  const statSpeedPct = document.getElementById("statSpeedPct");
  const statAccelPct = document.getElementById("statAccelPct");
  const statDriftPct = document.getElementById("statDriftPct");
  const statHandlingPct = document.getElementById("statHandlingPct");

  const btnStartEngine = document.getElementById("btnStartEngine");
  const gameConsoleFrame = document.getElementById("gameConsoleFrame");
  const gameIframe = document.getElementById("gameIframe");
  const gamePosterOverlay = document.getElementById("gamePosterOverlay");

  const vehiclesData = (window.WAVELENGTH_CONFIG && window.WAVELENGTH_CONFIG.game && window.WAVELENGTH_CONFIG.game.vehicles) || [];

  function selectVehicle(vehicleId) {
    const v = vehiclesData.find((item) => item.id === vehicleId);
    if (!v) return;

    vehicleCards.forEach((c) => {
      const isSelected = c.getAttribute("data-vehicle-id") === vehicleId;
      c.classList.toggle("is-active", isSelected);
      c.setAttribute("aria-selected", isSelected ? "true" : "false");
    });

    if (vehiclePreviewImg) vehiclePreviewImg.src = v.image;
    if (vehicleNameEl) vehicleNameEl.textContent = v.name;
    if (vehicleBadgeEl) vehicleBadgeEl.textContent = v.badge;
    if (vehicleTaglineEl) vehicleTaglineEl.textContent = v.tagline;
    if (vehicleNumEl) vehicleNumEl.textContent = v.number;

    if (vehicleTopSpeedVal) vehicleTopSpeedVal.textContent = v.topSpeedDisplay || "140";
    if (vehicleTopSpeedUnit) vehicleTopSpeedUnit.textContent = v.topSpeedUnit || "KM/H";
    if (vehicleAccelSecVal) vehicleAccelSecVal.textContent = v.accelDisplay || "3.5s";

    if (statSpeedEl) statSpeedEl.style.width = `${v.stats.topSpeed}%`;
    if (statAccelEl) statAccelEl.style.width = `${v.stats.accel}%`;
    if (statDriftEl) statDriftEl.style.width = `${v.stats.drift}%`;
    if (statHandlingEl) statHandlingEl.style.width = `${v.stats.handling}%`;

    if (statSpeedPct) statSpeedPct.textContent = `${v.stats.topSpeed}%`;
    if (statAccelPct) statAccelPct.textContent = `${v.stats.accel}%`;
    if (statDriftPct) statDriftPct.textContent = `${v.stats.drift}%`;
    if (statHandlingPct) statHandlingPct.textContent = `${v.stats.handling}%`;
    // Update fullscreen links with selected vehicle
    document.querySelectorAll('a[href*="white-house-grand-prix"]').forEach((link) => {
      link.href = `./white-house-grand-prix/index.html?vehicle=${encodeURIComponent(vehicleId)}&start=name`;
    });
  }

  vehicleCards.forEach((btn) => {
    btn.addEventListener("click", () => {
      const vid = btn.getAttribute("data-vehicle-id");
      selectVehicle(vid);
    });
  });

  // Launch Game Inline in Arcade Frame
  if (btnStartEngine && gameIframe && gamePosterOverlay) {
    btnStartEngine.addEventListener("click", () => {
      gamePosterOverlay.style.display = "none";
      const activeVehicleBtn = document.querySelector(".vehicle-card-btn.is-active");
      const currentVid = activeVehicleBtn ? activeVehicleBtn.getAttribute("data-vehicle-id") : "ambassador";
      gameIframe.src = `./white-house-grand-prix/index.html?vehicle=${encodeURIComponent(currentVid)}&start=name`;
      gameIframe.focus();
    });
  }
});
