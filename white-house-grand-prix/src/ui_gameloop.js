// 60-FPS Pre-Cached Minimap Renderer & HUD Formatting Helpers
window.WHGP = window.WHGP || {};

window.WHGP.formatTime = function(sec) {
  if (sec === null || sec === undefined || !isFinite(sec)) return '--:--.--';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  const ms = Math.floor((sec % 1) * 100);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
};

window.WHGP.ordinal = function(n) {
  return ['1st', '2nd', '3rd', '4th'][n - 1] || (n + 'th');
};

let minimapBgCache = null;

window.WHGP.drawMinimap = function(canvas, trackSamples, racers) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  function toMapX(x) { return ((x + 48) / 92) * (w - 20) + 10; }
  function toMapY(z) { return ((z + 56) / 78) * (h - 20) + 10; }

  // Build static track & building background cache ONCE!
  if (!minimapBgCache && trackSamples && trackSamples.length > 0) {
    minimapBgCache = document.createElement('canvas');
    minimapBgCache.width = w;
    minimapBgCache.height = h;
    const bctx = minimapBgCache.getContext('2d');

    bctx.fillStyle = 'rgba(14, 35, 23, 0.82)';
    bctx.beginPath();
    bctx.roundRect(0, 0, w, h, 12);
    bctx.fill();

    // Main White House footprint
    bctx.fillStyle = 'rgba(214, 90, 75, 0.42)';
    bctx.fillRect(toMapX(-33), toMapY(-40), toMapX(3) - toMapX(-33), toMapY(-20) - toMapY(-40));

    // East Wing footprint
    bctx.fillStyle = 'rgba(214, 90, 75, 0.32)';
    bctx.fillRect(toMapX(24), toMapY(-26), toMapX(46) - toMapX(24), toMapY(-12) - toMapY(-26));

    // Single batched path for entire track outline
    bctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    bctx.lineWidth = 6.5;
    bctx.beginPath();
    trackSamples.forEach((s, i) => {
      if (i === 0) bctx.moveTo(toMapX(s.point.x), toMapY(s.point.z));
      else bctx.lineTo(toMapX(s.point.x), toMapY(s.point.z));
    });
    bctx.closePath();
    bctx.stroke();

    bctx.strokeStyle = 'rgba(235, 238, 218, 0.82)';
    bctx.lineWidth = 2.5;
    bctx.stroke();

    // Start Gantry marker
    bctx.fillStyle = '#ffffff';
    bctx.fillRect(toMapX(8.0) - 2, toMapY(16.5) - 4, 4, 8);
  }

  ctx.clearRect(0, 0, w, h);
  if (minimapBgCache) {
    ctx.drawImage(minimapBgCache, 0, 0);
  }

  // Draw only the 4 moving vehicle dots each frame
  for (let i = 0; i < racers.length; i++) {
    const r = racers[i];
    const mx = toMapX(r.x);
    const my = toMapY(r.z);
    ctx.beginPath();
    ctx.arc(mx, my, r.isPlayer ? 5.2 : 3.8, 0, Math.PI * 2);
    ctx.fillStyle = r.isPlayer ? '#38bdf8' : r.spec.accentHex;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = r.isPlayer ? '#ffffff' : '#0f172a';
    ctx.stroke();
  }
};
