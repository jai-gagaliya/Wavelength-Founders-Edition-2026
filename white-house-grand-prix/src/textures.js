// Upgraded High-Definition Procedural Textures, Reflection EnvMap & Soft VFX Sprites
window.WHGP = window.WHGP || {};

window.WHGP.createTextures = function(THREE, isMobile) {
  const scale = isMobile ? 0.5 : 1.0;
  function makeCanvas(w, h, drawFn, repeatX = 1, repeatY = 1) {
    const cw = Math.max(64, Math.floor(w * scale));
    const ch = Math.max(64, Math.floor(h * scale));
    const canvas = document.createElement('canvas');
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.scale(cw / w, ch / h);
    drawFn(ctx, w, h);
    ctx.restore();
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
    tex.anisotropy = isMobile ? 2 : 8;
    tex.needsUpdate = true;
    return tex;
  }

  let seed = 1337;
  function rand() {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  }

  // Procedural Equirectangular Environment Reflection Map for glossy vehicle paint, chrome & metal
  const envMap = makeCanvas(512, 256, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0.0, '#6991b5');
    g.addColorStop(0.38, '#b8cfe0');
    g.addColorStop(0.49, '#f5efe0');
    g.addColorStop(0.52, '#3d5e2e');
    g.addColorStop(1.0, '#1e2e18');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    // Warm sunlit clouds reflection
    ctx.fillStyle = 'rgba(255, 250, 235, 0.35)';
    for (let i = 0; i < 12; i++) {
      ctx.beginPath();
      ctx.ellipse((i / 12) * w + 20, h * 0.32 + Math.sin(i) * 14, 42, 12, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }, 1, 1);
  envMap.mapping = THREE.EquirectangularReflectionMapping;

  // Soft Radial Particle Sprite for volumetric drift smoke, nitro plasma & sparkles
  const particleSprite = makeCanvas(128, 128, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    const g = ctx.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2);
    g.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
    g.addColorStop(0.35, 'rgba(255, 255, 255, 0.75)');
    g.addColorStop(0.7, 'rgba(255, 255, 255, 0.22)');
    g.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }, 1, 1);

  // 1. Classic White Plaster
  const whitePlaster = makeCanvas(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#f5f4ee';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 3000; i++) {
      const x = rand() * w, y = rand() * h, r = 1 + rand() * 4;
      ctx.fillStyle = rand() > 0.5 ? 'rgba(218, 214, 204, 0.2)' : 'rgba(255, 255, 252, 0.25)';
      ctx.fillRect(x, y, r, r);
    }
    for (let i = 0; i < 35; i++) {
      const x = rand() * w;
      const grad = ctx.createLinearGradient(x, 0, x, h);
      grad.addColorStop(0, 'rgba(150, 148, 140, 0.12)');
      grad.addColorStop(0.5, 'rgba(175, 172, 165, 0.03)');
      grad.addColorStop(1, 'rgba(140, 138, 130, 0.14)');
      ctx.fillStyle = grad;
      ctx.fillRect(x, 0, 4 + rand() * 8, h);
    }
  }, 4, 2);

  const plasterNormal = makeCanvas(256, 256, (ctx, w, h) => {
    ctx.fillStyle = 'rgb(128, 128, 255)';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 2200; i++) {
      const dx = Math.floor(118 + rand() * 20);
      const dy = Math.floor(118 + rand() * 20);
      ctx.fillStyle = `rgb(${dx},${dy},250)`;
      ctx.fillRect(rand() * w, rand() * h, 2, 2);
    }
  }, 4, 2);

  // 2. Red Corrugated Metal Roofs
  const redCorrugated = makeCanvas(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#b54a3f';
    ctx.fillRect(0, 0, w, h);
    const stripeW = 8;
    for (let x = 0; x < w; x += stripeW) {
      const g = ctx.createLinearGradient(x, 0, x + stripeW, 0);
      g.addColorStop(0, '#8f332a');
      g.addColorStop(0.45, '#cc5a4e');
      g.addColorStop(1, '#7a2922');
      ctx.fillStyle = g;
      ctx.fillRect(x, 0, stripeW, h);
    }
    for (let i = 0; i < 140; i++) {
      ctx.fillStyle = rand() > 0.4 ? 'rgba(130, 62, 42, 0.18)' : 'rgba(90, 35, 25, 0.15)';
      ctx.beginPath();
      ctx.arc(rand() * w, rand() * h, 4 + rand() * 16, 0, Math.PI * 2);
      ctx.fill();
    }
  }, 6, 4);

  const corrugatedNormal = makeCanvas(256, 256, (ctx, w, h) => {
    for (let x = 0; x < w; x += 8) {
      ctx.fillStyle = 'rgb(165, 128, 255)';
      ctx.fillRect(x, 0, 4, h);
      ctx.fillStyle = 'rgb(92, 128, 255)';
      ctx.fillRect(x + 4, 0, 4, h);
    }
  }, 6, 4);

  // 3. Dark Grey Stone & White Mortar Blockwork
  const stoneCheckerboard = makeCanvas(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#f0efe9';
    ctx.fillRect(0, 0, w, h);
    const bw = 48, bh = 28;
    for (let y = 0; y < h; y += bh) {
      const rowOffset = (Math.floor(y / bh) % 2) * (bw / 2);
      for (let x = -bw; x < w + bw; x += bw) {
        const shade = 68 + Math.floor(rand() * 24);
        ctx.fillStyle = `rgb(${shade}, ${shade + 4}, ${shade + 8})`;
        ctx.fillRect(x + rowOffset + 3, y + 3, bw - 6, bh - 6);
      }
    }
  }, 3, 2);

  // 4. Lush Green Dehradun Lawn Grass
  const grass = makeCanvas(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#488829';
    ctx.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 32) {
      ctx.fillStyle = (y / 32) % 2 === 0 ? 'rgba(110, 178, 56, 0.16)' : 'rgba(58, 112, 32, 0.15)';
      ctx.fillRect(0, y, w, 16);
    }
    for (let i = 0; i < 6500; i++) {
      const x = rand() * w, y = rand() * h;
      ctx.fillStyle = rand() > 0.5 ? 'rgba(124, 195, 68, 0.35)' : 'rgba(44, 92, 22, 0.32)';
      ctx.fillRect(x, y, 2, 4);
    }
  }, 28, 28);

  // 5. High-Detail Racing Track Deck (Dark Slate Asphalt + Rubber Racing Groove + Luminous Guide Chevrons)
  const trackAsphalt = makeCanvas(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#23272e';
    ctx.fillRect(0, 0, w, h);

    // Subtle dark rubber tire wear tracks along racing lane
    const g = ctx.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0.0, 'rgba(15, 18, 22, 0.5)');
    g.addColorStop(0.25, 'rgba(38, 43, 52, 0.1)');
    g.addColorStop(0.5, 'rgba(18, 20, 25, 0.45)');
    g.addColorStop(0.75, 'rgba(38, 43, 52, 0.1)');
    g.addColorStop(1.0, 'rgba(15, 18, 22, 0.5)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // Fine asphalt aggregate grain
    for (let i = 0; i < 5500; i++) {
      const x = rand() * w, y = rand() * h;
      const v = 32 + Math.floor(rand() * 28);
      ctx.fillStyle = `rgb(${v},${v + 2},${v + 6})`;
      ctx.fillRect(x, y, 2, 2);
    }

    // Crisp dual side lane stripes (amber-gold inner + white outer)
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(10, 0, 8, h);
    ctx.fillRect(w - 18, 0, 8, h);

    ctx.fillStyle = 'rgba(56, 189, 248, 0.65)';
    ctx.fillRect(24, 0, 4, h);
    ctx.fillRect(w - 28, 0, 4, h);

    // Center subtle luminous cyan chevron arrows pointing forward
    ctx.fillStyle = 'rgba(56, 189, 248, 0.28)';
    for (let y = 24; y < h; y += 128) {
      ctx.beginPath();
      ctx.moveTo(w * 0.42, y + 36);
      ctx.lineTo(w * 0.50, y + 10);
      ctx.lineTo(w * 0.58, y + 36);
      ctx.lineTo(w * 0.58, y + 50);
      ctx.lineTo(w * 0.50, y + 24);
      ctx.lineTo(w * 0.42, y + 50);
      ctx.closePath();
      ctx.fill();
    }
  }, 1, 64);

  // Separate crisp Red-and-White Curb Texture for the 3D raised kerbs!
  const curbStripe = makeCanvas(128, 512, (ctx, w, h) => {
    const stripeH = 64;
    for (let y = 0; y < h; y += stripeH) {
      const isRed = (Math.floor(y / stripeH) % 2) === 0;
      ctx.fillStyle = isRed ? '#e11d48' : '#f8fafc';
      ctx.fillRect(0, y, w, stripeH);
      // Bevel highlight
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.fillRect(0, y, 16, stripeH);
    }
  }, 1, 72);

  // 6. Verandah Stone Tile
  const verandahTile = makeCanvas(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#cfc5b4';
    ctx.fillRect(0, 0, w, h);
    const ts = 64;
    for (let y = 0; y < h; y += ts) {
      for (let x = 0; x < w; x += ts) {
        const alt = ((x / ts) + (y / ts)) % 2 === 0;
        ctx.fillStyle = alt ? '#d8d0c0' : '#b5aa98';
        ctx.fillRect(x + 2, y + 2, ts - 4, ts - 4);
      }
    }
  }, 12, 4);

  // 7. Hedge Leaf
  const hedgeLeaf = makeCanvas(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#28591e';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 1800; i++) {
      const g = 75 + Math.floor(rand() * 70);
      ctx.fillStyle = `rgb(${30 + Math.floor(rand()*25)}, ${g}, ${20 + Math.floor(rand()*20)})`;
      ctx.beginPath();
      ctx.arc(rand() * w, rand() * h, 2 + rand() * 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }, 4, 1);

  // 8. Sandstone / Bleacher Stone
  const sandstone = makeCanvas(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#b8bec4';
    ctx.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 48) {
      ctx.fillStyle = (y / 48) % 2 === 0 ? 'rgba(160, 168, 175, 0.35)' : 'rgba(205, 210, 215, 0.35)';
      ctx.fillRect(0, y, w, 44);
      ctx.strokeStyle = '#8b9299';
      ctx.lineWidth = 2;
      ctx.strokeRect(4, y + 2, w - 8, 44);
    }
  }, 4, 2);

  // 9. Palm Bark
  const palmBark = makeCanvas(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#5c4838';
    ctx.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 14) {
      ctx.fillStyle = y % 28 === 0 ? '#473628' : '#6e5846';
      ctx.fillRect(0, y, w, 10);
    }
  }, 1, 6);

  // 10. Palm Frond
  const palmFrond = makeCanvas(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#2f6b25';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#4ea33c';
    ctx.lineWidth = 4;
    for (let y = 8; y < h; y += 16) {
      ctx.beginPath();
      ctx.moveTo(w / 2, y);
      ctx.lineTo(10, y - 6);
      ctx.moveTo(w / 2, y);
      ctx.lineTo(w - 10, y - 6);
      ctx.stroke();
    }
  }, 1, 1);

  // 11. Tree Canopy Billboard
  const treeCanopy = makeCanvas(256, 256, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) {
      const angle = rand() * Math.PI * 2;
      const dist = rand() * 85;
      const x = w / 2 + Math.cos(angle) * dist;
      const y = h / 2 + Math.sin(angle) * dist;
      const r = 18 + rand() * 28;
      const g = 75 + Math.floor(rand() * 55);
      ctx.fillStyle = `rgba(${32 + Math.floor(rand()*20)}, ${g}, ${28 + Math.floor(rand()*18)}, 0.95)`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }, 1, 1);

  // 12. Oxidized Dark Bronze Metal
  const oxidizedMetal = makeCanvas(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#33423c';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 400; i++) {
      ctx.fillStyle = rand() > 0.5 ? '#485e55' : '#242e2a';
      ctx.fillRect(rand() * w, rand() * h, 6, 6);
    }
  }, 1, 1);

  // 13. Framed Artworks
  const artworks = [];
  const artPalettes = [
    ['#2b4c65', '#e0a96d', '#d96b43', '#f4ede2'],
    ['#3d5a45', '#8fb996', '#e6c229', '#f2e8cf'],
    ['#6b2d5c', '#d972ff', '#f0a6ca', '#f7edf0'],
    ['#8c3b2b', '#e8985e', '#4b6b53', '#f5ebe0'],
    ['#1d3557', '#457b9d', '#e63946', '#f1faee']
  ];
  for (let idx = 0; idx < 5; idx++) {
    const pal = artPalettes[idx];
    artworks.push(makeCanvas(256, 256, (ctx, w, h) => {
      ctx.fillStyle = '#5c3c1e';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#c89d54';
      ctx.fillRect(10, 10, w - 20, h - 20);
      ctx.fillStyle = pal[3];
      ctx.fillRect(20, 20, w - 40, h - 40);
      ctx.fillStyle = pal[0];
      ctx.fillRect(32, 32, w - 64, h - 64);
      ctx.fillStyle = pal[1];
      ctx.beginPath();
      ctx.moveTo(32, h - 60);
      ctx.quadraticCurveTo(w * 0.4, h * 0.42, w - 32, h - 70);
      ctx.lineTo(w - 32, h - 32);
      ctx.lineTo(32, h - 32);
      ctx.fill();
      ctx.fillStyle = pal[2];
      ctx.beginPath();
      ctx.arc(w * (0.35 + idx * 0.08), h * 0.42, 22, 0, Math.PI * 2);
      ctx.fill();
    }, 1, 1));
  }

  // 14. Sky Gradient
  const skyGradient = makeCanvas(512, 512, (ctx, w, h) => {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#82a6c4');
    grad.addColorStop(0.42, '#bdd1e0');
    grad.addColorStop(0.76, '#e5ebe8');
    grad.addColorStop(1.0, '#c6d6c1');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(92, 118, 112, 0.38)';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.78);
    for (let x = 0; x <= w; x += 32) {
      ctx.lineTo(x, h * 0.72 + Math.sin(x * 0.025) * 18 + Math.cos(x * 0.06) * 8);
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.fill();
  }, 1, 1);

  // 15. Flower Beds
  const flowerBeds = makeCanvas(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#2b541e';
    ctx.fillRect(0, 0, w, h);
    const colors = ['#e11d48', '#fb7185', '#a855f7', '#facc15', '#ff4d6d'];
    for (let i = 0; i < 340; i++) {
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.arc(rand() * w, rand() * h, 4 + rand() * 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }, 3, 1);

  // 16 & 17. Chrome Trim
  const chromeTrim = makeCanvas(128, 128, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#d8dde3');
    g.addColorStop(0.5, '#ffffff');
    g.addColorStop(1, '#8c96a3');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }, 1, 1);

  // 18. Boost Pad Glow (Chevrons pointing toward +X / Right so on the BoxGeometry top face they point straight FORWARD along the track tangent!)
  const boostGlow = makeCanvas(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#062033';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 12;
    ctx.strokeRect(8, 8, w - 16, h - 16);
    ctx.fillStyle = '#e0f2fe';
    for (let x = 28; x < w - 36; x += 68) {
      ctx.beginPath();
      ctx.moveTo(x, 32);
      ctx.lineTo(x + 42, h / 2);
      ctx.lineTo(x, h - 32);
      ctx.lineTo(x + 22, h - 32);
      ctx.lineTo(x + 64, h / 2);
      ctx.lineTo(x + 22, 32);
      ctx.closePath();
      ctx.fill();
    }
  }, 1, 1);

  // 19. Start/Finish Checkerboard
  const startFinish = makeCanvas(256, 256, (ctx, w, h) => {
    const sq = 32;
    for (let y = 0; y < h; y += sq) {
      for (let x = 0; x < w; x += sq) {
        ctx.fillStyle = ((x / sq) + (y / sq)) % 2 === 0 ? '#ffffff' : '#0f172a';
        ctx.fillRect(x, y, sq, sq);
      }
    }
  }, 4, 1);

  // 20. Brick/Stone Courtyard Driveway
  const brickPath = makeCanvas(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#8b8d91';
    ctx.fillRect(0, 0, w, h);
    const bw = 32, bh = 16;
    for (let y = 0; y < h; y += bh) {
      const offset = (Math.floor(y / bh) % 2) * (bw / 2);
      for (let x = -bw; x < w + bw; x += bw) {
        ctx.fillStyle = ((x + y) % 3 === 0) ? '#9aa0a6' : '#7b8087';
        ctx.fillRect(x + offset + 1, y + 1, bw - 2, bh - 2);
      }
    }
  }, 10, 4);

  // 21. Dappled Light Shaft Cookie
  const lightShaftCookie = makeCanvas(256, 256, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    const g = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2);
    g.addColorStop(0, 'rgba(255, 250, 225, 0.38)');
    g.addColorStop(0.6, 'rgba(255, 248, 215, 0.16)');
    g.addColorStop(1, 'rgba(255, 248, 215, 0.0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }, 1, 1);

  // 22. Official Wavelength Grand Prix Racing Sponsor Banner
  const wavelengthBanner = makeCanvas(1024, 256, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0.0, '#071810');
    g.addColorStop(0.5, '#12301f');
    g.addColorStop(1.0, '#071810');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // Gold racing borders
    ctx.fillStyle = '#ddc889';
    ctx.fillRect(0, 0, w, 8);
    ctx.fillRect(0, h - 8, w, 8);

    // Subtle gold inner pinstripes
    ctx.fillStyle = 'rgba(221, 200, 137, 0.35)';
    ctx.fillRect(0, 14, w, 2);
    ctx.fillRect(0, h - 16, w, 2);

    // Fallback vector wave typography rendered immediately
    ctx.save();
    ctx.fillStyle = '#ddc889';
    ctx.font = 'bold 84px "Barlow Condensed", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('W A V E L E N G T H', w / 2, h / 2 - 2);

    ctx.strokeStyle = '#f5efe0';
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let x = w * 0.12; x <= w * 0.88; x += 8) {
      const y = h / 2 + Math.sin((x - w * 0.12) * 0.035) * 14;
      if (x === w * 0.12) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();

    // Overlay authentic high-res Wavelength logo image if available
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.drawImage(img, w * 0.12, h * 0.18, w * 0.76, h * 0.64);
      wavelengthBanner.needsUpdate = true;
    };
    img.src = './assets/images/logo.png';
  }, 1, 1);

  return {
    envMap,
    particleSprite,
    whitePlaster,
    plasterNormal,
    redCorrugated,
    corrugatedNormal,
    stoneCheckerboard,
    grass,
    trackAsphalt,
    curbStripe,
    verandahTile,
    hedgeLeaf,
    sandstone,
    palmBark,
    palmFrond,
    treeCanopy,
    oxidizedMetal,
    artworks,
    skyGradient,
    flowerBeds,
    chromeTrim,
    boostGlow,
    startFinish,
    brickPath,
    lightShaftCookie,
    wavelengthBanner
  };
};
