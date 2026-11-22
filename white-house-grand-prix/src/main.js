// Upgraded Main Engine with Arena Option B Editorial Landing Page, Hero Photo Gallery, Garage Cards & How-To-Play Modal
window.WHGP = window.WHGP || {};

window.WHGP.initGame = function() {
  const THREE = window.THREE;
  if (!THREE) return;

  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '') || (window.innerWidth < 768);
  const canvasContainer = document.getElementById('canvas-container');

  // 1. Scene, Camera, WebGLRenderer
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xc8d5de, 0.0038);

  const camera = new THREE.PerspectiveCamera(56, window.innerWidth / window.innerHeight, 0.15, 420);
  camera.position.set(-28, 12.5, 24.0);
  camera.lookAt(-6, 3.8, -14);

  const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, powerPreference: 'high-performance' });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.0 : 1.25));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  if (THREE.ACESFilmicToneMapping !== undefined) {
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
  }
  canvasContainer.innerHTML = '';
  canvasContainer.appendChild(renderer.domElement);

  // 2. Textures & Skybox
  const textures = window.WHGP.createTextures(THREE, isMobile);
  scene.background = textures.skyGradient;

  const skyGeo = new THREE.SphereGeometry(240, 24, 16);
  const skyMat = new THREE.MeshBasicMaterial({
    map: textures.skyGradient,
    side: THREE.BackSide,
    depthWrite: false
  });
  scene.add(new THREE.Mesh(skyGeo, skyMat));

  // 3. Soft Overcast Dehradun Lighting
  const hemiLight = new THREE.HemisphereLight(0xd5e3ef, 0x5c7a49, 0.88);
  hemiLight.position.set(0, 65, 0);
  scene.add(hemiLight);

  const sunLight = new THREE.DirectionalLight(0xfff6e5, 1.22);
  sunLight.position.set(-35, 55, 32);
  sunLight.castShadow = true;
  const shadowRes = 1024;
  sunLight.shadow.mapSize.width = shadowRes;
  sunLight.shadow.mapSize.height = shadowRes;
  sunLight.shadow.camera.near = 5;
  sunLight.shadow.camera.far = 175;
  sunLight.shadow.camera.left = -65;
  sunLight.shadow.camera.right = 65;
  sunLight.shadow.camera.top = 60;
  sunLight.shadow.camera.bottom = -65;
  sunLight.shadow.bias = -0.0005;
  scene.add(sunLight);

  // 4. Build Full White House Campus Complex & 6-Sector Coaster Circuit
  const buildingData = window.WHGP.createBuilding(THREE, textures, isMobile);
  scene.add(buildingData.group);

  const envData = window.WHGP.createEnvironment(THREE, textures, isMobile);
  scene.add(envData.group);

  // 5. Audio, Particles & Race World
  const audioCtrl = window.WHGP.createAudioController();
  const particleCtrl = window.WHGP.createParticleSystem(THREE, scene, textures);
  const raceWorld = window.WHGP.createRaceWorld(THREE, envData, buildingData, textures, audioCtrl, particleCtrl);

  let gameState = 'TITLE';
  let isPaused = false;
  let playerName = 'Racer';
  let selectedVehicleId = 'ambassador';
  let racers = [];
  let playerRacer = null;
  let stateTimer = 0;
  let lastCountdownBeep = 4;
  let finishOrder = [];
  let cameraShakeAmt = 0;
  let vehiclePreviews = {};
  let showcaseGroup = null;

  setTimeout(() => {
    if (window.WHGP.renderVehiclePreviews) {
      vehiclePreviews = window.WHGP.renderVehiclePreviews(THREE);
      if (gameState === 'VEHICLE_SELECT') renderVehicleCards();
    }
  }, 60);

  function setShowcaseVehicle(vId) {
    if (showcaseGroup) {
      scene.remove(showcaseGroup);
      showcaseGroup = null;
    }
    if (window.WHGP.buildClaudeVehicle) {
      const built = window.WHGP.buildClaudeVehicle(THREE, vId);
      showcaseGroup = built.group;
      // Place on the front lawn directly in front of the Mughal verandah arches!
      showcaseGroup.position.set(-12.0, 0.12, -13.2);
      showcaseGroup.rotation.y = 0.6;
      showcaseGroup.scale.setScalar(1.15);
      scene.add(showcaseGroup);
    }
  }

  function removeShowcaseVehicle() {
    if (showcaseGroup) {
      scene.remove(showcaseGroup);
      showcaseGroup = null;
    }
  }

  // Hero Backdrop Photo Gallery State
  let currentSlideIdx = 0;
  let live3DBackdrop = false;
  const heroSlides = window.WHGP.HERO_BACKDROP_SLIDES || [];
  const menuBackdropEl = document.getElementById('menu-photo-backdrop');
  const menuVignetteEl = document.getElementById('menu-photo-vignette');
  const slideCaptionEl = document.getElementById('hero-photo-caption');

  function applyHeroSlide(idx) {
    if (!heroSlides.length) return;
    currentSlideIdx = ((idx % heroSlides.length) + heroSlides.length) % heroSlides.length;
    const slide = heroSlides[currentSlideIdx];
    if (menuBackdropEl && !live3DBackdrop) {
      menuBackdropEl.style.backgroundImage = `url('${slide.src}')`;
      menuBackdropEl.classList.remove('opacity-0');
    }
    if (menuVignetteEl) {
      menuVignetteEl.classList.toggle('opacity-0', live3DBackdrop);
    }
    if (slideCaptionEl) {
      slideCaptionEl.textContent = live3DBackdrop ? 'LIVE 3D CIRCUIT DIORAMA' : slide.label;
    }
    document.querySelectorAll('[data-hero-slide]').forEach((btn, bIdx) => {
      const active = !live3DBackdrop && (bIdx === currentSlideIdx);
      btn.classList.toggle('active-slide-dot', active);
    });
    const btn3d = document.getElementById('btn-hero-live3d');
    if (btn3d) {
      btn3d.classList.toggle('active-slide-pill', live3DBackdrop);
    }
  }

  // Initialize hero photo backdrop
  applyHeroSlide(0);

  // Auto-cycle hero photos every 9 seconds when on the landing page (unless viewing live 3D)
  setInterval(() => {
    if ((gameState === 'TITLE' || gameState === 'USERNAME') && !live3DBackdrop && heroSlides.length > 1) {
      applyHeroSlide(currentSlideIdx + 1);
    }
  }, 9000);

  document.querySelectorAll('[data-hero-slide]').forEach((btn) => {
    btn.addEventListener('click', () => {
      audioCtrl.playUIClick();
      live3DBackdrop = false;
      const idx = parseInt(btn.getAttribute('data-hero-slide'), 10) || 0;
      applyHeroSlide(idx);
    });
  });

  const btnHeroLive3D = document.getElementById('btn-hero-live3d');
  if (btnHeroLive3D) {
    btnHeroLive3D.addEventListener('click', () => {
      audioCtrl.playUIClick();
      live3DBackdrop = !live3DBackdrop;
      if (menuBackdropEl) {
        menuBackdropEl.classList.toggle('opacity-0', live3DBackdrop);
      }
      applyHeroSlide(currentSlideIdx);
    });
  }

  // Camera Modes
  let cameraMode = 'ESTABLISHING';
  let orbitState = { theta: -0.55, phi: 0.42, dist: 46, target: new THREE.Vector3(-6, 3.2, -14), dragging: false, lastX: 0, lastY: 0 };

  function spawnRaceGrid(chosenId) {
    racers.forEach((r) => scene.remove(r.mesh));
    racers = [];
    finishOrder = [];

    const catalog = window.WHGP.VEHICLE_CATALOG;
    const playerSpec = catalog.find((c) => c.id === chosenId) || catalog[0];
    const otherSpecs = catalog.filter((c) => c.id !== playerSpec.id);
    const gridSpecs = [
      { spec: playerSpec, isPlayer: true },
      { spec: otherSpecs[0], isPlayer: false },
      { spec: otherSpecs[1], isPlayer: false },
      { spec: otherSpecs[2], isPlayer: false }
    ];

    const nowSec = performance.now() * 0.001;
    gridSpecs.forEach((entry, idx) => {
      const r = raceWorld.createRacer(entry.spec, entry.isPlayer, idx);
      if (entry.isPlayer) {
        r.name = playerName || 'Racer';
        playerRacer = r;
      }
      racers.push(r);
      scene.add(r.mesh);
      raceWorld.resetRacer(r, nowSec);
    });

    audioCtrl.setVehicleType(playerSpec.id);
  }

  spawnRaceGrid('ambassador');

  // 7. Screens & Modals
  const screens = {
    TITLE: document.getElementById('screen-title'),
    USERNAME: document.getElementById('screen-username'),
    VEHICLE_SELECT: document.getElementById('screen-vehicle'),
    TRACK_PREVIEW: document.getElementById('screen-preview'),
    COUNTDOWN: document.getElementById('screen-countdown'),
    RACING: document.getElementById('screen-hud'),
    FINISH: document.getElementById('screen-finish')
  };
  const menuShell = document.getElementById('editorial-menu-shell');
  const topUtilityBar = document.getElementById('top-utility-bar');
  const pauseModal = document.getElementById('modal-pause');
  const howModal = document.getElementById('modal-how-to-play');
  const boostFlashOverlay = document.getElementById('boost-flash');
  const wrongWayBanner = document.getElementById('wrong-way-banner');
  const minimapCanvas = document.getElementById('minimap-canvas');
  const inspectorPanel = document.getElementById('diorama-inspector-panel');

  function setGameState(nextState) {
    gameState = nextState;
    stateTimer = 0;
    isPaused = false;
    if (pauseModal) pauseModal.classList.add('hidden');

    const isMenuState = (nextState === 'TITLE' || nextState === 'USERNAME');
    if (menuShell) {
      menuShell.classList.toggle('hidden', !isMenuState);
    }
    if (nextState === 'VEHICLE_SELECT') {
      racers.forEach((r) => { r.mesh.visible = false; });
      setShowcaseVehicle(selectedVehicleId);
      const greetEl = document.getElementById('garage-driver-greeting');
      if (greetEl) {
        greetEl.textContent = `Welcome, ${playerName || 'Player'}`;
      }
      renderVehicleCards();
    } else {
      removeShowcaseVehicle();
      racers.forEach((r) => { r.mesh.visible = true; });
    }
    if (topUtilityBar) {
      topUtilityBar.classList.toggle('hidden', isMenuState && !live3DBackdrop);
    }
    if (inspectorPanel && isMenuState && !live3DBackdrop) {
      inspectorPanel.classList.add('hidden');
    }

    Object.keys(screens).forEach((key) => {
      const el = screens[key];
      if (!el) return;
      if (key === nextState || (nextState === 'COUNTDOWN' && key === 'RACING')) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    });

    if (nextState === 'TITLE') {
      cameraMode = 'ESTABLISHING';
      audioCtrl.stopMusic();
    } else if (nextState === 'USERNAME') {
      cameraMode = 'ESTABLISHING';
      audioCtrl.stopMusic();
    } else if (nextState === 'VEHICLE_SELECT') {
      audioCtrl.stopMusic();
      // Handled above
    } else if (nextState === 'TRACK_PREVIEW') {
      audioCtrl.stopMusic();
      spawnRaceGrid(selectedVehicleId);
      const nowSec = performance.now() * 0.001;
      racers.forEach((r) => raceWorld.resetRacer(r, nowSec));
      cameraMode = 'CHASE';
    } else if (nextState === 'COUNTDOWN') {
      lastCountdownBeep = 4;
      cameraMode = 'CHASE';
      const nowSec = performance.now() * 0.001;
      if (!racers || racers.length === 0 || racers[0].spec.id !== selectedVehicleId) {
        spawnRaceGrid(selectedVehicleId);
      }
      racers.forEach((r) => raceWorld.resetRacer(r, nowSec));
    } else if (nextState === 'RACING') {
      cameraMode = 'CHASE';
      const nowSec = performance.now() * 0.001;
      racers.forEach((r) => { r.lapStartTime = nowSec; });
      audioCtrl.startMusic();
    } else if (nextState === 'FINISH') {
      audioCtrl.stopMusic();
      renderFinishStandings();
    }
    updateCameraPills();
  }

  // Render 4 Arena Claude Vehicle Selection Cards with 3D Offscreen Previews & Live 3D Showcase
  function renderVehicleCards() {
    const container = document.getElementById('vehicle-cards-grid');
    if (!container) return;
    container.innerHTML = '';

    window.WHGP.VEHICLE_CATALOG.forEach((v) => {
      const isSel = v.id === selectedVehicleId;
      const previewSrc = vehiclePreviews[v.id] || v.image;
      const card = document.createElement('button');
      card.type = 'button';
      card.className = `snap-center shrink-0 w-[165px] sm:w-[215px] lg:w-[245px] text-left rounded-md overflow-hidden border-2 transition-all duration-200 bg-gradient-to-b from-[#2a2118]/90 to-[#120d09]/95 ${
        isSel
          ? 'border-[#e8c872] -translate-y-1.5 shadow-[0_10px_30px_rgba(232,200,114,0.35)]'
          : 'border-white/15 hover:border-white/40'
      }`;
      card.setAttribute('aria-pressed', isSel ? 'true' : 'false');
      card.innerHTML = `
        <div class="card-img h-[96px] sm:h-[130px] lg:h-[145px] bg-gradient-to-b from-[#8fa5b5]/40 to-[#d8e0dc]/30 flex items-center justify-center overflow-hidden">
          ${previewSrc ? `<img src="${previewSrc}" alt="${v.name}" class="h-full w-auto object-contain" />` : `<div class="text-white/40 text-xs">…</div>`}
        </div>
        <div class="p-2.5 sm:p-3">
          <div class="font-display font-bold text-[#f3e3b0] tracking-wide text-xs sm:text-base truncate">${v.name}</div>
          <div class="card-tag text-white/70 text-[11px] sm:text-[13px] mt-1 leading-snug line-clamp-2 min-h-[2.4em]">${v.tagline}</div>
        </div>
      `;
      card.addEventListener('click', () => {
        audioCtrl.playUIClick();
        selectedVehicleId = v.id;
        setShowcaseVehicle(selectedVehicleId);
        renderVehicleCards();
      });
      container.appendChild(card);
    });
  }

  function onRacerFinished(r) {
    if (!finishOrder.includes(r)) {
      finishOrder.push(r);
      r.finishPosition = finishOrder.length;
    }
    if (r.isPlayer) {
      const remaining = racers.filter((x) => !finishOrder.includes(x)).sort((a, b) => b.totalProgress - a.totalProgress);
      remaining.forEach((rem, idx) => {
        finishOrder.push(rem);
        rem.finishPosition = finishOrder.length;
        rem.totalRaceTime = r.totalRaceTime + (idx + 1) * 1.45;
      });
      audioCtrl.playFinishFanfare(r.finishPosition);
      setGameState('FINISH');
    }
  }

  function renderFinishStandings() {
    const tbody = document.getElementById('finish-results-body');
    const headline = document.getElementById('finish-headline');
    const subcopy = document.getElementById('finish-subcopy');
    if (!tbody) return;
    tbody.innerHTML = '';

    const sorted = [...racers].sort((a, b) => (a.finishPosition || 99) - (b.finishPosition || 99));
    const pPos = playerRacer ? playerRacer.finishPosition : 1;
    if (headline) {
      headline.innerHTML = pPos === 1
        ? `A RACE <em>TO REMEMBER.</em>`
        : `${window.WHGP.ordinal(pPos).toUpperCase()} PLACE <em>FINISH.</em>`;
    }
    if (subcopy) {
      subcopy.textContent = `Well driven, ${playerName}. Here's how the field finished around The White House.`;
    }

    sorted.forEach((r, i) => {
      const pos = i + 1;
      const tr = document.createElement('tr');
      tr.className = r.isPlayer ? 'arena-result-row arena-result-player' : 'arena-result-row';
      tr.innerHTML = `
        <td class="arena-result-rank">${String(pos).padStart(2, '0')}</td>
        <td class="arena-result-name">
          <strong>${r.isPlayer ? playerName : r.spec.name}${r.isPlayer ? '<small> YOU</small>' : ''}</strong>
          <span>${r.spec.name}</span>
        </td>
        <td class="arena-result-vehicle">${r.spec.shortName || r.spec.name}</td>
        <td class="arena-result-time">${window.WHGP.formatTime(r.totalRaceTime)}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // 8. Controls & Hotkeys
  const playerInput = { forward: false, backward: false, left: false, right: false, drift: false, tiltSteer: 0 };
  let tiltEnabled = false;

  const hotkeyCamMap = {
    '1': 'CHASE',
    '2': 'POV',
    '3': 'ESTABLISHING',
    '4': 'DRONE',
    '5': 'ORBIT',
    '6': 'RAMP',
    '7': 'VERANDAH',
    '8': 'SUNDIAL',
    '9': 'AMPHITHEATER'
  };

  window.addEventListener('keydown', (e) => {
    if (document.activeElement && document.activeElement.tagName === 'INPUT') {
      if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('btn-username-next').click();
      }
      return;
    }
    const k = e.key.toLowerCase();
    if (k === 'w' || e.key === 'ArrowUp') playerInput.forward = true;
    if (k === 's' || e.key === 'ArrowDown') playerInput.backward = true;
    if (k === 'a' || e.key === 'ArrowLeft') playerInput.left = true;
    if (k === 'd' || e.key === 'ArrowRight') playerInput.right = true;
    if (e.code === 'Space') playerInput.drift = true;
    if (k === 'r' && playerRacer) raceWorld.respawnRacer(playerRacer);
    if (k === 'p') {
      document.getElementById('btn-ai-cruise').click();
    }
    if (k === 'm') {
      document.getElementById('btn-mute-toggle').click();
    }
    if (hotkeyCamMap[e.key]) {
      cameraMode = hotkeyCamMap[e.key];
      updateCameraPills();
    }
    if (e.key === 'Escape') {
      if (howModal && !howModal.classList.contains('hidden')) {
        howModal.classList.add('hidden');
      } else if (gameState === 'RACING') {
        togglePause();
      }
    }
  });

  window.addEventListener('keyup', (e) => {
    const k = e.key.toLowerCase();
    if (k === 'w' || e.key === 'ArrowUp') playerInput.forward = false;
    if (k === 's' || e.key === 'ArrowDown') playerInput.backward = false;
    if (k === 'a' || e.key === 'ArrowLeft') playerInput.left = false;
    if (k === 'd' || e.key === 'ArrowRight') playerInput.right = false;
    if (e.code === 'Space') playerInput.drift = false;
  });

  function bindHoldButton(btnId, field) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    const start = (ev) => {
      ev.preventDefault();
      if (btn.setPointerCapture && ev.pointerId !== undefined) {
        try { btn.setPointerCapture(ev.pointerId); } catch (e) {}
      }
      audioCtrl.ensureContext();
      playerInput[field] = true;
      btn.classList.add('active-touch');
    };
    const end = (ev) => {
      ev.preventDefault();
      if (btn.releasePointerCapture && ev.pointerId !== undefined) {
        try { btn.releasePointerCapture(ev.pointerId); } catch (e) {}
      }
      playerInput[field] = false;
      btn.classList.remove('active-touch');
    };
    btn.addEventListener('pointerdown', start);
    btn.addEventListener('pointerup', end);
    btn.addEventListener('pointercancel', end);
    btn.addEventListener('lostpointercapture', end);
  }
  bindHoldButton('touch-left', 'left');
  bindHoldButton('touch-right', 'right');
  bindHoldButton('touch-accel', 'forward');
  bindHoldButton('touch-brake', 'backward');
  bindHoldButton('touch-drift', 'drift');

  window.addEventListener('deviceorientation', (e) => {
    if (!tiltEnabled || e.gamma === null) return;
    const clamped = Math.max(-30, Math.min(30, e.gamma));
    playerInput.tiltSteer = Math.abs(clamped) < 4 ? 0 : (-clamped / 30);
  });

  renderer.domElement.addEventListener('pointerdown', (e) => {
    audioCtrl.ensureContext();
    if (cameraMode === 'ORBIT') {
      orbitState.dragging = true;
      orbitState.lastX = e.clientX;
      orbitState.lastY = e.clientY;
    }
  });
  window.addEventListener('pointermove', (e) => {
    if (!orbitState.dragging || cameraMode !== 'ORBIT') return;
    const dx = e.clientX - orbitState.lastX;
    const dy = e.clientY - orbitState.lastY;
    orbitState.lastX = e.clientX;
    orbitState.lastY = e.clientY;
    orbitState.theta -= dx * 0.007;
    orbitState.phi = Math.max(0.12, Math.min(1.42, orbitState.phi + dy * 0.006));
  });
  window.addEventListener('pointerup', () => { orbitState.dragging = false; });
  renderer.domElement.addEventListener('wheel', (e) => {
    if (cameraMode !== 'ORBIT') return;
    orbitState.dist = Math.max(8, Math.min(95, orbitState.dist + e.deltaY * 0.035));
  }, { passive: true });

  // 9. UI Button Event Listeners
  // Brand Logo Home Click
  document.querySelectorAll('.js-brand-home').forEach((btn) => {
    btn.addEventListener('click', () => {
      audioCtrl.playUIClick();
      if (howModal) howModal.classList.add('hidden');
      setGameState('TITLE');
    });
  });

  // How To Play Modal Open/Close
  function openHowModal() {
    audioCtrl.ensureContext();
    audioCtrl.playUIClick();
    if (howModal) howModal.classList.remove('hidden');
  }
  function closeHowModal() {
    audioCtrl.playUIClick();
    if (howModal) howModal.classList.add('hidden');
  }
  const btnHeaderHow = document.getElementById('btn-header-how');
  if (btnHeaderHow) btnHeaderHow.addEventListener('click', openHowModal);
  const btnHeroHow = document.getElementById('btn-hero-how');
  if (btnHeroHow) btnHeroHow.addEventListener('click', openHowModal);
  const btnHowClose = document.getElementById('btn-how-close');
  if (btnHowClose) btnHowClose.addEventListener('click', closeHowModal);
  const btnHowGotIt = document.getElementById('btn-how-got-it');
  if (btnHowGotIt) btnHowGotIt.addEventListener('click', closeHowModal);

  document.getElementById('btn-title-play').addEventListener('click', () => {
    audioCtrl.ensureContext();
    audioCtrl.playUIClick();
    setGameState('USERNAME');
    const inp = document.getElementById('input-username');
    if (inp) inp.focus();
  });

  document.getElementById('btn-username-next').addEventListener('click', () => {
    audioCtrl.playUIClick();
    const inp = document.getElementById('input-username');
    const val = inp ? inp.value.trim() : '';
    playerName = val.length > 0 ? val.slice(0, 18) : 'Racer';
    const badge = document.getElementById('hud-driver-name');
    if (badge) badge.textContent = playerName;
    setGameState('VEHICLE_SELECT');
  });

  document.getElementById('btn-username-back').addEventListener('click', () => {
    audioCtrl.playUIClick();
    setGameState('TITLE');
  });

  document.getElementById('btn-vehicle-ready').addEventListener('click', () => {
    audioCtrl.playUIClick();
    setGameState('TRACK_PREVIEW');
  });

  document.getElementById('btn-vehicle-back').addEventListener('click', () => {
    audioCtrl.playUIClick();
    setGameState('USERNAME');
  });

  document.getElementById('btn-skip-preview').addEventListener('click', () => {
    audioCtrl.playUIClick();
    setGameState('COUNTDOWN');
  });

  document.getElementById('btn-rematch').addEventListener('click', () => {
    audioCtrl.playUIClick();
    spawnRaceGrid(selectedVehicleId);
    setGameState('COUNTDOWN');
  });

  document.getElementById('btn-change-vehicle').addEventListener('click', () => {
    audioCtrl.playUIClick();
    setGameState('VEHICLE_SELECT');
  });

  function togglePause() {
    if (gameState !== 'RACING') return;
    isPaused = !isPaused;
    if (pauseModal) pauseModal.classList.toggle('hidden', !isPaused);
  }

  document.getElementById('btn-hud-pause').addEventListener('click', () => {
    audioCtrl.playUIClick();
    togglePause();
  });

  document.getElementById('btn-pause-resume').addEventListener('click', () => {
    audioCtrl.playUIClick();
    togglePause();
  });

  document.getElementById('btn-pause-restart').addEventListener('click', () => {
    audioCtrl.playUIClick();
    spawnRaceGrid(selectedVehicleId);
    setGameState('COUNTDOWN');
  });

  document.getElementById('btn-pause-quit').addEventListener('click', () => {
    audioCtrl.playUIClick();
    setGameState('TITLE');
  });

  document.getElementById('btn-hud-respawn').addEventListener('click', () => {
    audioCtrl.playUIClick();
    if (playerRacer) raceWorld.respawnRacer(playerRacer);
  });

  document.getElementById('btn-hud-tilt').addEventListener('click', async (e) => {
    audioCtrl.playUIClick();
    const btn = e.currentTarget;
    if (!tiltEnabled && typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const perm = await DeviceOrientationEvent.requestPermission();
        if (perm !== 'granted') return;
      } catch (err) {}
    }
    tiltEnabled = !tiltEnabled;
    if (!tiltEnabled) playerInput.tiltSteer = 0;
    btn.textContent = tiltEnabled ? 'TILT: ON' : 'TILT: OFF';
    btn.classList.toggle('active-touch', tiltEnabled);
  });

  const btnTouchCruise = document.getElementById('btn-touch-cruise');
  if (btnTouchCruise) {
    btnTouchCruise.addEventListener('click', () => {
      const mainCruise = document.getElementById('btn-ai-cruise');
      if (mainCruise) mainCruise.click();
      const isOn = raceWorld.isAICruise();
      btnTouchCruise.textContent = isOn ? 'AI: ON' : 'AI: OFF';
      btnTouchCruise.classList.toggle('active-touch', isOn);
    });
  }

  function syncMuteUI(isMuted) {
    const muteBtn = document.getElementById('btn-mute-toggle');
    if (muteBtn) muteBtn.textContent = isMuted ? '🔇 Muted' : '🔊 Audio';
    const headerMuteIcon = document.getElementById('header-mute-icon');
    if (headerMuteIcon) {
      headerMuteIcon.innerHTML = isMuted
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>`;
    }
  }

  document.getElementById('btn-mute-toggle').addEventListener('click', () => {
    const isMuted = audioCtrl.toggleMute();
    syncMuteUI(isMuted);
  });

  const btnHeaderSound = document.getElementById('btn-header-sound');
  if (btnHeaderSound) {
    btnHeaderSound.addEventListener('click', () => {
      const isMuted = audioCtrl.toggleMute();
      syncMuteUI(isMuted);
    });
  }

  const toggleInspectorBtn = document.getElementById('btn-toggle-inspector');
  toggleInspectorBtn.addEventListener('click', () => {
    audioCtrl.playUIClick();
    if (inspectorPanel) inspectorPanel.classList.toggle('hidden');
  });

  const aiCruiseBtn = document.getElementById('btn-ai-cruise');
  aiCruiseBtn.addEventListener('click', () => {
    audioCtrl.playUIClick();
    const nextVal = !raceWorld.isAICruise();
    raceWorld.setAICruise(nextVal);
    aiCruiseBtn.textContent = nextVal ? 'P  AI Coaster Cruise: ON' : 'P  AI Coaster Cruise: OFF';
    aiCruiseBtn.className = nextVal
      ? 'w-full py-1.5 px-3 rounded-lg bg-amber-400/25 border border-amber-300 text-amber-200 text-xs font-bold transition'
      : 'w-full py-1.5 px-3 rounded-lg bg-slate-800 border border-slate-600 text-slate-300 text-xs font-semibold transition';
  });

  document.querySelectorAll('[data-teleport-u]').forEach((btn) => {
    btn.addEventListener('click', () => {
      audioCtrl.playUIClick();
      const uVal = parseFloat(btn.getAttribute('data-teleport-u'));
      if (playerRacer && !isNaN(uVal)) {
        raceWorld.teleportToSector(playerRacer, uVal);
      }
    });
  });

  const sliderSun = document.getElementById('slider-sun');
  if (sliderSun) {
    sliderSun.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      sunLight.intensity = val;
      const lbl = document.getElementById('val-sun');
      if (lbl) lbl.textContent = val.toFixed(2) + 'x';
    });
  }

  const sliderLed = document.getElementById('slider-led');
  if (sliderLed) {
    sliderLed.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (envData.ledRailMat) envData.ledRailMat.emissiveIntensity = val;
      const lbl = document.getElementById('val-led');
      if (lbl) lbl.textContent = val.toFixed(2) + 'x';
    });
  }

  const sliderSpeed = document.getElementById('slider-speed');
  if (sliderSpeed) {
    sliderSpeed.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      raceWorld.setTopSpeedMultiplier(val);
      const lbl = document.getElementById('val-speed');
      if (lbl) lbl.textContent = val.toFixed(2) + 'x';
    });
  }

  const sliderScale = document.getElementById('slider-scale');
  if (sliderScale) {
    sliderScale.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      raceWorld.setVehicleScale(val, racers);
      const lbl = document.getElementById('val-scale');
      if (lbl) lbl.textContent = val.toFixed(2) + 'x';
    });
  }

  const camButtons = document.querySelectorAll('[data-cam-mode]');
  function updateCameraPills() {
    camButtons.forEach((btn) => {
      const m = btn.getAttribute('data-cam-mode');
      if (m === cameraMode) {
        btn.classList.add('bg-[#ddc889]', 'text-[#162a1e]', 'font-bold');
        btn.classList.remove('bg-[#0e2317]/85', 'text-[#f6f4e9]');
      } else {
        btn.classList.remove('bg-[#ddc889]', 'text-[#162a1e]', 'font-bold');
        btn.classList.add('bg-[#0e2317]/85', 'text-[#f6f4e9]');
      }
    });
  }
  camButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      audioCtrl.playUIClick();
      cameraMode = btn.getAttribute('data-cam-mode');
      updateCameraPills();
    });
  });
  updateCameraPills();

  function syncResponsiveCameraAspect() {
    const w = Math.max(1, window.innerWidth);
    const h = Math.max(1, window.innerHeight);
    const aspect = w / h;
    camera.aspect = aspect;
    // Widen vertical FOV automatically on portrait phones/tablets so horizontal view stays generous!
    const baseFov = (gameState === 'VEHICLE_SELECT') ? 48 : 54;
    camera.fov = aspect < 1.0 ? Math.min(78, baseFov / Math.pow(aspect, 0.42)) : baseFov;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', syncResponsiveCameraAspect);
  window.addEventListener('orientationchange', () => setTimeout(syncResponsiveCameraAspect, 120));
  syncResponsiveCameraAspect();

  // 10. Multi-Viewport Camera Controller
  const camPosTarget = new THREE.Vector3();
  const camLookTarget = new THREE.Vector3();
  const currentLook = new THREE.Vector3(-8, 3.0, -14);

  function updateCamera(dt, nowSec) {
    if (gameState === 'VEHICLE_SELECT') {
      // Arena Claude 3D Vehicle Showcase Camera in front of The White House Mughal arches!
      camPosTarget.set(-12.0 + Math.sin(nowSec * 0.25) * 3.5, 2.55, -5.2);
      camLookTarget.set(-12.0, -0.35, -13.2);
      camera.position.lerp(camPosTarget, Math.min(1, dt * 3.5));
      currentLook.lerp(camLookTarget, Math.min(1, dt * 4.5));
      camera.lookAt(currentLook);
      const targetShowcaseFov = camera.aspect < 1.0 ? Math.min(74, 48 / Math.pow(camera.aspect, 0.42)) : 48;
      if (Math.abs(camera.fov - targetShowcaseFov) > 0.2) {
        camera.fov = targetShowcaseFov;
        camera.updateProjectionMatrix();
      }
      if (showcaseGroup) {
        showcaseGroup.rotation.y += dt * 0.5;
      }
      return;
    }
    if (gameState === 'TRACK_PREVIEW') {
      const u = (stateTimer / 8.0) % 1.0;
      const pt = envData.trackCurve.getPointAt(u);
      const lookPt = envData.trackCurve.getPointAt((u + 0.05) % 1.0);
      camera.position.set(pt.x, pt.y + 2.2, pt.z);
      camera.lookAt(lookPt.x, lookPt.y + 0.6, lookPt.z);
      return;
    }

    if (cameraMode === 'ESTABLISHING') {
      const sway = Math.sin(nowSec * 0.3) * 2.0;
      camPosTarget.set(-28.0 + sway, 10.5, 23.5);
      camLookTarget.set(-6.0, 3.6, -15.0);
      camera.position.lerp(camPosTarget, Math.min(1, dt * 4));
      currentLook.lerp(camLookTarget, Math.min(1, dt * 5));
      camera.lookAt(currentLook);
      return;
    }

    if (cameraMode === 'DRONE') {
      const sway = Math.cos(nowSec * 0.25) * 3.0;
      camPosTarget.set(-10.0 + sway, 32.0, 42.0);
      camLookTarget.set(0.0, 2.0, -16.0);
      camera.position.lerp(camPosTarget, Math.min(1, dt * 4));
      currentLook.lerp(camLookTarget, Math.min(1, dt * 5));
      camera.lookAt(currentLook);
      return;
    }

    if (cameraMode === 'RAMP') {
      camPosTarget.set(-14.5, 4.2, 16.5);
      camLookTarget.set(-8.0, 5.2, -5.0);
      camera.position.lerp(camPosTarget, Math.min(1, dt * 5));
      currentLook.lerp(camLookTarget, Math.min(1, dt * 6));
      camera.lookAt(currentLook);
      return;
    }

    if (cameraMode === 'VERANDAH') {
      camPosTarget.set(-28.5 + Math.sin(nowSec * 0.35) * 2.5, 1.9, -24.8);
      camLookTarget.set(4.0, 1.8, -24.5);
      camera.position.lerp(camPosTarget, Math.min(1, dt * 5));
      currentLook.lerp(camLookTarget, Math.min(1, dt * 6));
      camera.lookAt(currentLook);
      return;
    }

    if (cameraMode === 'SUNDIAL') {
      camPosTarget.set(8.5, 2.2, -3.5);
      camLookTarget.set(-8.0, 3.2, -21.0);
      camera.position.lerp(camPosTarget, Math.min(1, dt * 5));
      currentLook.lerp(camLookTarget, Math.min(1, dt * 6));
      camera.lookAt(currentLook);
      return;
    }

    if (cameraMode === 'AMPHITHEATER') {
      camPosTarget.set(36.0, 6.5, 24.0);
      camLookTarget.set(16.0, 2.5, -10.0);
      camera.position.lerp(camPosTarget, Math.min(1, dt * 5));
      currentLook.lerp(camLookTarget, Math.min(1, dt * 6));
      camera.lookAt(currentLook);
      return;
    }

    if (cameraMode === 'ORBIT') {
      const cx = orbitState.target.x + orbitState.dist * Math.sin(orbitState.theta) * Math.cos(orbitState.phi);
      const cy = orbitState.target.y + orbitState.dist * Math.sin(orbitState.phi);
      const cz = orbitState.target.z + orbitState.dist * Math.cos(orbitState.theta) * Math.cos(orbitState.phi);
      camera.position.set(cx, Math.max(1.0, cy), cz);
      camera.lookAt(orbitState.target);
      return;
    }

    if (cameraMode === 'POV' && playerRacer) {
      const r = playerRacer;
      const sc = raceWorld.getVehicleScale();
      camera.position.set(
        r.x + Math.cos(r.yaw) * 0.4 * sc,
        r.y + 0.95 * sc,
        r.z - Math.sin(r.yaw) * 0.4 * sc
      );
      camera.lookAt(
        r.x + Math.cos(r.yaw) * 12.0,
        r.y + 0.8 * sc - Math.sin(r.pitch) * 8.0,
        r.z - Math.sin(r.yaw) * 12.0
      );
      return;
    }

    if (playerRacer) {
      const r = playerRacer;
      const sc = raceWorld.getVehicleScale();
      const isCarriage = r.spec && r.spec.id === 'carriage';
      const baseDist = isCarriage ? 4.4 : (r.spec && r.spec.id === 'rickshaw' ? 3.1 : 3.5);
      const baseHeight = isCarriage ? 2.15 : 1.55;
      const followDist = baseDist * Math.max(0.75, sc * 1.65);
      const followHeight = baseHeight * Math.max(0.75, sc * 1.65);
      const driftAngleOffset = r.drifting ? r.slipAngle * 0.5 : 0;
      const camAngle = r.yaw - driftAngleOffset;

      let desiredX = r.x - Math.cos(camAngle) * followDist;
      let desiredZ = r.z + Math.sin(camAngle) * followDist;
      const camTrackCheck = raceWorld.getClosestTrackSample(desiredX, desiredZ, r.lastSampleIdx);
      let desiredY = Math.max(r.y + followHeight - Math.sin(r.pitch) * 1.2, camTrackCheck.interpY + followHeight * 0.88);
      // Keep camera below the verandah ceiling when driving through the Mughal Verandah corridor!
      if (desiredZ < -20.2 && desiredZ > -28.8 && desiredX > -35.0 && desiredX < 8.5) {
        desiredY = Math.min(desiredY, 3.85);
      }

      if (cameraShakeAmt > 0.005) {
        desiredY += (Math.random() - 0.5) * cameraShakeAmt;
        cameraShakeAmt *= Math.pow(0.04, dt);
      }

      camPosTarget.set(desiredX, desiredY, desiredZ);
      camLookTarget.set(
        r.x + Math.cos(r.yaw) * 3.4,
        r.y + (isCarriage ? 0.95 : 0.65) + Math.sin(r.pitch) * 2.2,
        r.z - Math.sin(r.yaw) * 3.4
      );

      camera.position.lerp(camPosTarget, Math.min(1, dt * 10.5));
      currentLook.lerp(camLookTarget, Math.min(1, dt * 13.0));
      camera.lookAt(currentLook);
    }
  }

  // 11. Main Animation Loop
  let lastTime = performance.now();
  let fpsFrames = 0;
  let fpsAccum = 0;
  const fpsEl = document.getElementById('fps-counter');
  const lapEl = document.getElementById('hud-lap');
  const posEl = document.getElementById('hud-position');
  const speedEl = document.getElementById('hud-speed');
  const gearEl = document.getElementById('hud-gear');
  const speedNeedle = document.getElementById('hud-speed-bar');
  const boostBar = document.getElementById('hud-boost-bar');
  const boostStatusEl = document.getElementById('hud-boost-status');
  const curLapEl = document.getElementById('hud-cur-lap');
  const bestLapEl = document.getElementById('hud-best-lap');
  const countdownText = document.getElementById('countdown-text');
  const previewProgress = document.getElementById('preview-progress-bar');

  // Spawn racers on starting grid
  spawnRaceGrid(selectedVehicleId);

  // Check URL parameters for starting screen (e.g. from parent site or direct link)
  const urlParams = new URLSearchParams(window.location.search);
  const startParam = (urlParams.get('start') || '').toLowerCase();
  if (startParam === 'name' || startParam === 'username' || startParam === 'driver' || startParam === '1') {
    setGameState('USERNAME');
    setTimeout(() => {
      const inp = document.getElementById('input-username');
      if (inp) inp.focus();
    }, 150);
  } else if (startParam === 'garage' || startParam === 'vehicle') {
    setGameState('VEHICLE_SELECT');
  } else if (startParam === 'preview' || startParam === 'tour') {
    setGameState('TRACK_PREVIEW');
  } else if (startParam === 'countdown' || startParam === 'race') {
    setGameState('COUNTDOWN');
  } else {
    // Default: Cinematic Title Screen with live 3D diorama background
    setGameState('TITLE');
  }

  function animate(nowMs) {
    requestAnimationFrame(animate);
    const rawDt = (nowMs - lastTime) * 0.001;
    lastTime = nowMs;
    const dt = Math.min(0.05, Math.max(0.001, rawDt));
    const nowSec = nowMs * 0.001;

    fpsFrames++;
    fpsAccum += rawDt;
    if (fpsAccum >= 0.5) {
      const fps = Math.round(fpsFrames / fpsAccum);
      if (fpsEl) fpsEl.textContent = `${fps} FPS`;
      fpsFrames = 0;
      fpsAccum = 0;
    }

    if (!isPaused) {
      stateTimer += dt;

      if (gameState === 'TRACK_PREVIEW') {
        if (previewProgress) {
          previewProgress.style.width = `${Math.min(100, (stateTimer / 8.0) * 100)}%`;
        }
        if (stateTimer >= 8.0) {
          setGameState('COUNTDOWN');
        }
        raceWorld.stepPhysics(racers, playerInput, dt, false, nowSec, null, null);
      } else if (gameState === 'COUNTDOWN') {
        const rem = Math.ceil(3.2 - stateTimer);
        if (rem >= 1 && rem <= 3) {
          if (countdownText) countdownText.textContent = String(rem);
          if (rem < lastCountdownBeep) {
            lastCountdownBeep = rem;
            audioCtrl.playCountdownBeep(false);
          }
        } else if (stateTimer < 3.85) {
          if (countdownText) countdownText.textContent = 'GO!';
          if (lastCountdownBeep > 0) {
            lastCountdownBeep = 0;
            audioCtrl.playCountdownBeep(true);
          }
        } else {
          setGameState('RACING');
        }
        raceWorld.stepPhysics(racers, playerInput, dt, false, nowSec, null, null);
      } else if (gameState === 'RACING') {
        raceWorld.stepPhysics(
          racers,
          playerInput,
          dt,
          true,
          nowSec,
          onRacerFinished,
          (shake) => { cameraShakeAmt = Math.max(cameraShakeAmt, shake); }
        );
      } else if (gameState === 'TITLE') {
        raceWorld.stepPhysics(racers, playerInput, dt, true, nowSec, null, null);
      } else {
        raceWorld.stepPhysics(racers, playerInput, dt, false, nowSec, null, null);
      }

      particleCtrl.update(dt, nowSec);
    }

    if (playerRacer) {
      audioCtrl.updateEngine(
        playerRacer.speed,
        playerRacer.spec.stats.maxSpeed,
        playerRacer.drifting,
        playerRacer.slipAngle,
        gameState === 'RACING' && !isPaused,
        dt,
        playerRacer.y
      );

      const targetFov = 56 + (playerRacer.boostTimer > 0 ? 9 : 0) + Math.min(6, Math.abs(playerRacer.speed) * 0.22);
      if (Math.abs(camera.fov - targetFov) > 0.05) {
        camera.fov += (targetFov - camera.fov) * Math.min(1, dt * 6);
        camera.updateProjectionMatrix();
      }

      const sorted = [...racers].sort((a, b) => b.totalProgress - a.totalProgress);
      const playerRank = sorted.indexOf(playerRacer) + 1;

      if (lapEl) {
        lapEl.innerHTML = `${String(Math.min(3, playerRacer.lap)).padStart(2, '0')} <small>/ 03</small>`;
      }
      if (posEl) {
        posEl.innerHTML = `${window.WHGP.ordinal(playerRank).toUpperCase()} <small>/ 4</small>`;
      }

      const kmh = Math.round(Math.abs(playerRacer.speed) * 9.2);
      if (speedEl) speedEl.textContent = String(kmh).padStart(2, '0');
      if (gearEl) {
        let gearStr = 'N';
        if (playerRacer.speed < -0.4) {
          gearStr = 'R';
        } else if (kmh >= 2) {
          const gNum = Math.min(5, Math.max(1, Math.ceil((kmh / 120) * 5)));
          gearStr = String(gNum);
        }
        gearEl.textContent = gearStr;
      }
      if (speedNeedle) {
        const pct = Math.min(100, Math.round((kmh / 160) * 100));
        speedNeedle.style.width = `${pct}%`;
      }
      if (boostBar) {
        const bPct = Math.max(6, Math.min(100, Math.round((playerRacer.boostTimer / 2.2) * 100)));
        boostBar.style.width = `${bPct}%`;
      }
      if (boostStatusEl) {
        boostStatusEl.textContent = playerRacer.boostTimer > 0 ? 'ACTIVE' : 'READY';
      }
      if (boostFlashOverlay) {
        boostFlashOverlay.style.opacity = playerRacer.boostTimer > 1.4 ? '1' : '0';
      }
      if (wrongWayBanner) {
        wrongWayBanner.classList.toggle('hidden', !(gameState === 'RACING' && playerRacer.wrongWay));
      }
      if (curLapEl) curLapEl.textContent = window.WHGP.formatTime(playerRacer.currentLapTime);
      if (bestLapEl) bestLapEl.textContent = window.WHGP.formatTime(playerRacer.bestLapTime);
    }

    window.WHGP.drawMinimap(minimapCanvas, envData.trackSamples, racers);
    updateCamera(dt, nowSec);
    renderer.render(scene, camera);
  }

  requestAnimationFrame(animate);
};

window.addEventListener('load', () => {
  window.WHGP.initGame();
});
