// Crystal-Clear, Zero-Buzz Web Audio Engine:
// - ZERO low-frequency sawtooth/square oscillators (eliminates 100% of raspy/farty buzz!)
// - Smooth Aerodynamic Turbine/Intake Purr + 5-Gear Sine/Triangle Harmonic Whine
// - Crisp Woodblock Hoof Clops for Royal Carriage
// - Bright Crystal Chimes for Countdown, Boost, Sparks & Rhodes Synthwave BGM
window.WHGP = window.WHGP || {};

window.WHGP.createAudioController = function() {
  let ctx = null;
  let master = null;
  let sfx = null;
  let musicBus = null;
  let pinkBuf = null;
  let whiteBuf = null;
  let muted = false;

  // Smooth turbine/air-intake engine nodes (no raw sawtooth/square buzz!)
  let engGain = null;
  let engAirFilter = null;
  let engToneOsc1 = null;
  let engToneOsc2 = null;
  let engToneGain = null;

  // Soft tire-scrub air hiss (high-frequency road tire hiss, never a harsh screech)
  let tireGain = null;
  let tireFilter = null;

  let currentVehicleType = 'ambassador';
  let hoofTimer = 0;
  let hoofStep = 0;
  let musicTimer = null;
  let nextNoteTime = 0;
  let musicStep = 0;

  function ensureContext() {
    if (ctx) {
      if (ctx.state === 'suspended') ctx.resume();
      return true;
    }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
    } catch (e) {
      return false;
    }

    // Master Limiter/Compressor + Gain
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.knee.value = 12;
    comp.ratio.value = 4;
    comp.attack.value = 0.005;
    comp.release.value = 0.15;
    comp.connect(ctx.destination);

    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.72;
    master.connect(comp);

    sfx = ctx.createGain();
    sfx.gain.value = 0.85;
    sfx.connect(master);

    musicBus = ctx.createGain();
    musicBus.gain.value = 0.45;
    musicBus.connect(master);

    // Build smooth Pink Noise & White Noise buffers
    const len = ctx.sampleRate * 2;
    pinkBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    whiteBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const pd = pinkBuf.getChannelData(0);
    const wd = whiteBuf.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      wd[i] = w;
      b0 = 0.99886 * b0 + w * 0.0555179;
      b1 = 0.99332 * b1 + w * 0.0750759;
      b2 = 0.96900 * b2 + w * 0.1538520;
      b3 = 0.86650 * b3 + w * 0.3104856;
      b4 = 0.55000 * b4 + w * 0.5329522;
      b5 = -0.7616 * b5 - w * 0.0168980;
      pd[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.045;
      b6 = w * 0.115926;
    }

    // 1. Smooth Aerodynamic Intake/Turbine Engine Loop (Pink Noise + Pure Sine/Triangle Harmonics)
    engGain = ctx.createGain();
    engGain.gain.value = 0.0;
    engGain.connect(sfx);

    const airSrc = ctx.createBufferSource();
    airSrc.buffer = pinkBuf;
    airSrc.loop = true;

    engAirFilter = ctx.createBiquadFilter();
    engAirFilter.type = 'bandpass';
    engAirFilter.frequency.value = 420;
    engAirFilter.Q.value = 1.6;

    const airSubGain = ctx.createGain();
    airSubGain.gain.value = 0.65;
    airSrc.connect(engAirFilter);
    engAirFilter.connect(airSubGain);
    airSubGain.connect(engGain);
    airSrc.start();

    // Pure Sine + Triangle harmonic overtone (sounds like a smooth turbo/RC motor, NEVER a buzzy saw/square!)
    engToneOsc1 = ctx.createOscillator();
    engToneOsc2 = ctx.createOscillator();
    engToneOsc1.type = 'sine';
    engToneOsc2.type = 'triangle';
    engToneOsc1.frequency.value = 180;
    engToneOsc2.frequency.value = 270;

    const toneFilter = ctx.createBiquadFilter();
    toneFilter.type = 'lowpass';
    toneFilter.frequency.value = 720;

    engToneGain = ctx.createGain();
    engToneGain.gain.value = 0.18;

    engToneOsc1.connect(toneFilter);
    engToneOsc2.connect(toneFilter);
    toneFilter.connect(engToneGain);
    engToneGain.connect(engGain);
    engToneOsc1.start();
    engToneOsc2.start();

    // 2. Clean Tire Road Scrub (soft high-frequency asphalt tire rush on drifts)
    const tireSrc = ctx.createBufferSource();
    tireSrc.buffer = whiteBuf;
    tireSrc.loop = true;

    tireFilter = ctx.createBiquadFilter();
    tireFilter.type = 'bandpass';
    tireFilter.frequency.value = 2400;
    tireFilter.Q.value = 4.5;

    tireGain = ctx.createGain();
    tireGain.gain.value = 0.0;

    tireSrc.connect(tireFilter);
    tireFilter.connect(tireGain);
    tireGain.connect(sfx);
    tireSrc.start();

    return true;
  }

  function playNote(freq, dur, type = 'sine', vol = 0.12, delay = 0, slideFreq = null, targetBus = null) {
    if (!ctx || muted) return;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideFreq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, slideFreq), t + dur);
    }
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + Math.min(0.012, dur * 0.25));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g);
    g.connect(targetBus || sfx);
    osc.start(t);
    osc.stop(t + dur + 0.03);
  }

  function playFilteredAir(dur, fStart, fEnd, vol = 0.12, q = 2.0, delay = 0) {
    if (!ctx || muted || !whiteBuf) return;
    const t = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    src.buffer = whiteBuf;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.Q.value = q;
    f.frequency.setValueAtTime(fStart, t);
    f.frequency.exponentialRampToValueAtTime(Math.max(80, fEnd), t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + dur * 0.15);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f);
    f.connect(g);
    g.connect(sfx);
    src.start(t, Math.random() * 0.5);
    src.stop(t + dur + 0.03);
  }

  // Crisp temple-block / cobblestone horse hoof clip-clop
  function playCrispHoofStep(stepIndex) {
    if (!ctx || muted) return;
    const isClop = (stepIndex % 2 === 1);
    const f1 = isClop ? 820 : 1080;
    const f2 = isClop ? 540 : 720;
    // Short wooden click + cobblestone tap
    playNote(f1, 0.032, 'triangle', 0.08, 0, f2);
    playFilteredAir(0.028, f1 * 1.4, f1 * 0.8, 0.06, 6.0, 0);
  }

  function setVehicleType(typeId) {
    currentVehicleType = typeId || 'ambassador';
  }

  function updateEngine(speed, maxSpeed, isDrifting, slipAngle, active, dt) {
    if (!ctx || !engGain) return;
    const t = ctx.currentTime;
    if (muted || !active) {
      engGain.gain.setTargetAtTime(0.0, t, 0.06);
      tireGain.gain.setTargetAtTime(0.0, t, 0.05);
      return;
    }

    const ratio = Math.min(1.25, Math.abs(speed) / Math.max(1, maxSpeed));

    if (currentVehicleType === 'carriage') {
      // Gentle wind breeze + crisp rhythmic horse hoof clip-clops
      engAirFilter.frequency.setTargetAtTime(360 + ratio * 420, t, 0.08);
      engToneGain.gain.setTargetAtTime(0.0, t, 0.05);
      engGain.gain.setTargetAtTime(ratio * 0.035, t, 0.08);

      hoofTimer += dt * (2.2 + ratio * 9.5);
      if (ratio > 0.03 && hoofTimer >= 1.0) {
        hoofTimer = 0;
        playCrispHoofStep(hoofStep++);
        // Second horse slightly offset
        setTimeout(() => playCrispHoofStep(hoofStep++), 45);
      }
    } else {
      // Smooth 5-speed transmission curve (whispers at idle, sporty turbine hum at speed)
      const gear = Math.min(4, Math.floor(ratio * 4.2));
      const gearFrac = (ratio * 4.2) - gear;
      const rpm = 0.35 + gearFrac * 0.55 + ratio * 0.35;

      const basePitch = currentVehicleType === 'rickshaw' ? 210 : (currentVehicleType === 'jeep' ? 145 : 165);
      const pitch = basePitch * (1.0 + rpm * 1.35);

      engToneOsc1.frequency.setTargetAtTime(pitch, t, 0.05);
      engToneOsc2.frequency.setTargetAtTime(pitch * 1.5, t, 0.05); // Clean musical 5th interval
      engAirFilter.frequency.setTargetAtTime(380 + rpm * 850, t, 0.06);
      engToneGain.gain.setTargetAtTime(0.14 + ratio * 0.10, t, 0.06);
      // Keep overall engine level smooth and refined so BGM & SFX shine!
      engGain.gain.setTargetAtTime(0.015 + ratio * 0.045, t, 0.06);
    }

    // Subtle high-frequency tire scrub on drift
    const driftAmt = isDrifting ? Math.min(1.0, Math.abs(slipAngle) * 2.2 + 0.3) : 0.0;
    tireFilter.frequency.setTargetAtTime(2100 + ratio * 700, t, 0.05);
    tireGain.gain.setTargetAtTime(driftAmt * 0.045, t, 0.04);
  }

  function playBoostWhoosh() {
    if (!ensureContext() || muted) return;
    // Bright jet-air whoosh + ascending crystal major triad (A4 - C#5 - E5 - A5)
    playFilteredAir(0.55, 600, 3600, 0.14, 2.2, 0);
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((f, idx) => {
      playNote(f, 0.32, 'triangle', 0.075, idx * 0.045, f * 1.06);
    });
  }

  function playSparkPing() {
    if (!ensureContext() || muted) return;
    // Crisp metallic spark chime (never a low bass thud!)
    const f = 2200 + Math.random() * 800;
    playNote(f, 0.065, 'sine', 0.055, 0, f * 0.72);
    playFilteredAir(0.05, 3200, 1400, 0.045, 4.0, 0);
  }

  function playCountdownBeep(isGo) {
    if (!ensureContext() || muted) return;
    if (isGo) {
      // Uplifting GO! chord (C5 + E5 + G5 + C6)
      [523.25, 659.25, 783.99, 1046.5].forEach((f, idx) => {
        playNote(f, 0.48, 'triangle', idx === 3 ? 0.11 : 0.07, 0);
      });
    } else {
      // Clean crystal countdown bell (C5 523.25Hz + octave harmonic)
      playNote(523.25, 0.20, 'sine', 0.11, 0);
      playNote(1046.5, 0.14, 'triangle', 0.04, 0);
    }
  }

  function playFinishFanfare(pos) {
    if (!ensureContext() || muted) return;
    const notes = [523.25, 659.25, 783.99, 1046.5, 987.77, 1046.5];
    notes.forEach((f, i) => {
      playNote(f, 0.36, 'triangle', 0.12, i * 0.14);
      playNote(f * 0.5, 0.36, 'sine', 0.06, i * 0.14);
    });
  }

  function playCollisionThud(strength = 1) {
    if (!ensureContext() || muted) return;
    playNote(185, 0.09, 'sine', Math.min(0.10, 0.05 * strength), 0, 85);
  }

  function playUIClick() {
    if (!ensureContext() || muted) return;
    // Crisp glassy UI tap
    playNote(987.77, 0.045, 'sine', 0.08, 0, 1318.5);
  }

  // Upbeat, Warm Rhodes Electric-Piano & Pluck Racing Soundtrack (120 BPM)
  function schedMusic() {
    if (!ctx || muted) return;
    const stepDur = 60 / 120 / 2; // 8th notes at 120 BPM (0.25s)
    const chords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [174.61, 220.00, 261.63, 349.23], // Fmaj7
      [196.00, 246.94, 293.66, 392.00]  // G6
    ];
    const arpPattern = [0, 1, 2, 3, 2, 1, 3, 2];
    const melody = [
      659.25, 0, 783.99, 659.25, 587.33, 0, 523.25, 0,
      523.25, 659.25, 783.99, 0, 880.00, 783.99, 659.25, 0
    ];

    while (nextNoteTime < ctx.currentTime + 0.35) {
      const s = musicStep;
      const bar = Math.floor(s / 8) % 4;
      const beatInBar = s % 8;
      const chord = chords[bar];
      const delay = Math.max(0, nextNoteTime - ctx.currentTime);

      // Warm sine/triangle bass note on beats 0 and 4
      if (beatInBar === 0 || beatInBar === 4) {
        playNote(chord[0] * 0.5, stepDur * 3.2, 'sine', 0.11, delay, null, musicBus);
        playNote(chord[0], stepDur * 2.2, 'triangle', 0.045, delay, null, musicBus);
      }

      // Silky Rhodes arpeggio pluck on every 8th note
      const arpFreq = chord[arpPattern[beatInBar]];
      playNote(arpFreq, stepDur * 1.4, 'sine', 0.045, delay, null, musicBus);

      // Bright bell lead melody
      const melFreq = melody[s % melody.length];
      if (melFreq > 0) {
        playNote(melFreq, stepDur * 1.6, 'triangle', 0.05, delay, null, musicBus);
        // Subtle stereo-style echo 125ms later
        playNote(melFreq, stepDur * 1.2, 'sine', 0.02, delay + stepDur * 0.5, null, musicBus);
      }

      // Soft brushed hi-hat on off-beats
      if (beatInBar % 2 === 1) {
        playFilteredAir(0.035, 7500, 9500, 0.018, 3.5, delay);
      }

      nextNoteTime += stepDur;
      musicStep++;
    }
  }

  function startMusic() {
    if (!ensureContext() || musicTimer !== null) return;
    nextNoteTime = ctx.currentTime + 0.08;
    musicStep = 0;
    musicTimer = setInterval(schedMusic, 100);
  }

  function stopMusic() {
    if (musicTimer !== null) {
      clearInterval(musicTimer);
      musicTimer = null;
    }
  }

  function toggleMute() {
    ensureContext();
    muted = !muted;
    if (ctx && master) {
      master.gain.setTargetAtTime(muted ? 0 : 0.72, ctx.currentTime, 0.04);
    }
    return muted;
  }

  return {
    ensureContext,
    setVehicleType,
    updateEngine,
    playBoostWhoosh,
    playSparkPing,
    playCountdownBeep,
    playFinishFanfare,
    playCollisionThud,
    playUIClick,
    startMusic,
    stopMusic,
    toggleMute,
    isMuted: () => muted
  };
};

// ============================================================================
// High-Impact 3D VFX Engine:
// - Soft-Sprite Volumetric Drift Smoke, Nitro Plasma & Grass Dust
// - Directional Metallic Friction Sparks on Rail / Car Contact
// - Expanding 3D Cyan Shockwave Rings on Boost Pad Activation
// - Persistent Tire Skidmark Marks on the Asphalt Deck
// - Ambient Floating Golden Sunbeam Dust Motes
// ============================================================================
window.WHGP.createParticleSystem = function(THREE, scene, textures) {
  const spriteTex = (textures && textures.particleSprite) || null;

  // 1. Pooled Soft Billboard Sprites (140 sprites)
  const poolSize = 140;
  const particles = [];
  for (let i = 0; i < poolSize; i++) {
    const mat = new THREE.SpriteMaterial({
      map: spriteTex,
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      depthWrite: false
    });
    const sprite = new THREE.Sprite(mat);
    sprite.visible = false;
    scene.add(sprite);
    particles.push({
      sprite,
      vx: 0,
      vy: 0,
      vz: 0,
      life: 0,
      maxLife: 0.5,
      growRate: 1.4,
      baseAlpha: 0.7
    });
  }

  let cursor = 0;
  function spawnSprite(x, y, z, colorHex, vx, vy, vz, scale, maxLife, growRate = 1.6, additive = false, alpha = 0.75) {
    const p = particles[cursor];
    cursor = (cursor + 1) % poolSize;
    p.sprite.position.set(x, y, z);
    p.sprite.scale.setScalar(scale);
    p.sprite.material.color.setHex(colorHex);
    p.sprite.material.blending = additive ? THREE.AdditiveBlending : THREE.NormalBlending;
    p.sprite.material.opacity = alpha;
    p.sprite.visible = true;
    p.vx = vx;
    p.vy = vy;
    p.vz = vz;
    p.life = maxLife;
    p.maxLife = maxLife;
    p.growRate = growRate;
    p.baseAlpha = alpha;
  }

  // 2. Pooled Expanding 3D Boost Shockwave Rings (8 torus rings)
  const rings = [];
  const ringGeo = new THREE.TorusGeometry(0.45, 0.045, 8, 24);
  ringGeo.rotateX(Math.PI / 2);
  for (let i = 0; i < 8; i++) {
    const rMat = new THREE.MeshBasicMaterial({
      color: 0x38f8ff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const rMesh = new THREE.Mesh(ringGeo, rMat);
    rMesh.visible = false;
    scene.add(rMesh);
    rings.push({ mesh: rMesh, life: 0, maxLife: 0.45 });
  }
  let ringCursor = 0;

  // 3. Persistent Asphalt Tire Skidmarks Pool (90 decal quads on track)
  const skidPoolSize = 90;
  const skids = [];
  const skidGeo = new THREE.PlaneGeometry(0.24, 0.55);
  skidGeo.rotateX(-Math.PI / 2);
  const skidMat = new THREE.MeshBasicMaterial({
    color: 0x090b0e,
    transparent: true,
    opacity: 0.48,
    depthWrite: false
  });
  for (let i = 0; i < skidPoolSize; i++) {
    const sm = new THREE.Mesh(skidGeo, skidMat);
    sm.visible = false;
    scene.add(sm);
    skids.push(sm);
  }
  let skidCursor = 0;

  // 4. Ambient Floating Golden Sunbeam Dust Motes across the Estate
  const moteCount = 65;
  const moteGeo = new THREE.BufferGeometry();
  const motePos = new Float32Array(moteCount * 3);
  for (let i = 0; i < moteCount; i++) {
    motePos[i * 3]     = (Math.random() - 0.5) * 65;
    motePos[i * 3 + 1] = 0.8 + Math.random() * 9.5;
    motePos[i * 3 + 2] = (Math.random() - 0.5) * 55 - 10;
  }
  moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
  const moteMat = new THREE.PointsMaterial({
    map: spriteTex,
    color: 0xfef08a,
    size: 0.45,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const motePoints = new THREE.Points(moteGeo, moteMat);
  scene.add(motePoints);

  return {
    emitGrassDust(x, y, z) {
      if (Math.random() > 0.55) return;
      spawnSprite(
        x + (Math.random() - 0.5) * 0.4,
        y,
        z + (Math.random() - 0.5) * 0.4,
        Math.random() > 0.4 ? 0x65a30d : 0x854d0e,
        (Math.random() - 0.5) * 1.6,
        0.9 + Math.random() * 1.4,
        (Math.random() - 0.5) * 1.6,
        0.35,
        0.42,
        1.8,
        false,
        0.72
      );
    },
    emitDriftSmoke(x, y, z, yaw = 0) {
      // Spawn billowing soft smoke puff
      if (Math.random() < 0.75) {
        spawnSprite(
          x + (Math.random() - 0.5) * 0.35,
          y + 0.05,
          z + (Math.random() - 0.5) * 0.35,
          0xe2e8f0,
          (Math.random() - 0.5) * 1.1,
          0.55 + Math.random() * 0.75,
          (Math.random() - 0.5) * 1.1,
          0.42,
          0.52,
          2.4,
          false,
          0.55
        );
      }
      // No flat quad skidmarks that poke out on 3D slopes
    },
    emitNitroTrail(x, y, z) {
      if (Math.random() > 0.45) return;
      spawnSprite(
        x + (Math.random() - 0.5) * 0.12,
        y,
        z + (Math.random() - 0.5) * 0.12,
        0x38bdf8,
        (Math.random() - 0.5) * 0.4,
        0.15 + Math.random() * 0.3,
        (Math.random() - 0.5) * 0.4,
        0.18,
        0.16,
        1.1,
        true,
        0.45
      );
    },
    emitSparks(x, y, z) {
      for (let i = 0; i < 6; i++) {
        spawnSprite(
          x,
          y + 0.1,
          z,
          Math.random() > 0.4 ? 0xfbbf24 : 0xffedd5,
          (Math.random() - 0.5) * 5.5,
          1.5 + Math.random() * 3.2,
          (Math.random() - 0.5) * 5.5,
          0.22,
          0.26,
          0.8,
          true,
          0.95
        );
      }
    },
    emitBoostBurst(x, y, z) {
      // Expanding cyan shockwave ring
      const r = rings[ringCursor];
      ringCursor = (ringCursor + 1) % rings.length;
      r.mesh.position.set(x, y + 0.12, z);
      r.mesh.scale.setScalar(0.5);
      r.mesh.material.opacity = 0.92;
      r.mesh.visible = true;
      r.life = r.maxLife;

      for (let i = 0; i < 14; i++) {
        spawnSprite(
          x + (Math.random() - 0.5) * 1.1,
          y + Math.random() * 0.3,
          z + (Math.random() - 0.5) * 1.1,
          i % 2 === 0 ? 0x38f8ff : 0xf472b6,
          (Math.random() - 0.5) * 5.2,
          1.6 + Math.random() * 2.8,
          (Math.random() - 0.5) * 5.2,
          0.48,
          0.48,
          1.9,
          true,
          0.9
        );
      }
    },
    update(dt, nowSec = 0) {
      for (let i = 0; i < poolSize; i++) {
        const p = particles[i];
        if (p.life > 0) {
          p.life -= dt;
          if (p.life <= 0) {
            p.sprite.visible = false;
          } else {
            p.sprite.position.x += p.vx * dt;
            p.sprite.position.y += p.vy * dt;
            p.sprite.position.z += p.vz * dt;
            p.sprite.scale.multiplyScalar(1 + dt * p.growRate);
            p.sprite.material.opacity = (p.life / p.maxLife) * p.baseAlpha;
          }
        }
      }

      for (let i = 0; i < rings.length; i++) {
        const r = rings[i];
        if (r.life > 0) {
          r.life -= dt;
          if (r.life <= 0) {
            r.mesh.visible = false;
          } else {
            const prog = 1.0 - (r.life / r.maxLife);
            r.mesh.scale.setScalar(0.6 + prog * 4.2);
            r.mesh.material.opacity = (r.life / r.maxLife) * 0.85;
          }
        }
      }

      // Gently float golden sunbeam dust motes
      motePoints.position.y = Math.sin(nowSec * 0.8) * 0.25;
    }
  };
};
