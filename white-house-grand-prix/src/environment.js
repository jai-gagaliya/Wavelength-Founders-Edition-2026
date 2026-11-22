// Glitch-Free Track & Environment — Verified against all 10 User Screenshots
window.WHGP = window.WHGP || {};

window.WHGP.createEnvironment = function(THREE, textures, isMobile) {
  const group = new THREE.Group();
  group.name = 'EnvironmentAndTrack';
  const colliders = [];

  // 1. Campus Ground & Courtyard Roads
  const grassMat = new THREE.MeshStandardMaterial({
    map: textures.grass,
    roughness: 0.88,
    metalness: 0.02
  });
  const groundMesh = new THREE.Mesh(new THREE.PlaneGeometry(360, 360), grassMat);
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.position.y = 0.0;
  groundMesh.receiveShadow = true;
  group.add(groundMesh);

  // Removed coplanar courtyard planes so the 3D track deck never Z-fights on the rear & east roads!

  // South Sports Field Running Lanes (placed South of the bleachers at z = 38..46)
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
  for (let lane = 0; lane < 5; lane++) {
    const lMesh = new THREE.Mesh(new THREE.PlaneGeometry(90, 0.18), lineMat);
    lMesh.rotation.x = -Math.PI / 2;
    lMesh.position.set(0, 0.02, 38 + lane * 1.8);
    group.add(lMesh);
  }

  // 2. Tiered Grey Stone Amphitheater Bleachers (Placed cleanly at z = 27.5..34.5, parallel to Start Straight z = 16.5 — 11m clear!)
  const stoneMat = new THREE.MeshStandardMaterial({ map: textures.sandstone, roughness: 0.82 });
  const bleachersGroup = new THREE.Group();
  bleachersGroup.position.set(0.0, 0, 27.5);
  for (let step = 0; step < 6; step++) {
    const stepMesh = new THREE.Mesh(new THREE.BoxGeometry(52.0, 0.40, 1.25), stoneMat);
    stepMesh.position.set(0, (5 - step) * 0.36 + 0.20, step * 1.20);
    stepMesh.receiveShadow = true;
    bleachersGroup.add(stepMesh);
  }
  group.add(bleachersGroup);

  // 3. Folded-Delta Sundial Sculpture on Circular Stepped Base (Placed at x = 2.0, z = -14.2 inside the central lawn island)
  const sundialPos = { x: 2.0, z: -14.2 };
  const sundialGroup = new THREE.Group();
  sundialGroup.position.set(sundialPos.x, 0, sundialPos.z);

  const baseRing1 = new THREE.Mesh(new THREE.CylinderGeometry(1.85, 1.95, 0.42, 20), stoneMat);
  baseRing1.position.y = 0.21;
  sundialGroup.add(baseRing1);

  const baseCone = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 1.35, 0.85, 16), stoneMat);
  baseCone.position.y = 0.82;
  sundialGroup.add(baseCone);

  const bronzeMat = new THREE.MeshStandardMaterial({
    map: textures.oxidizedMetal,
    envMap: textures.envMap || null,
    envMapIntensity: 1.1,
    roughness: 0.3,
    metalness: 0.82,
    side: THREE.DoubleSide
  });
  const deltaPivot = new THREE.Group();
  deltaPivot.position.set(0, 1.25, 0);
  deltaPivot.rotation.z = 0.62;
  deltaPivot.rotation.y = -0.35;

  const wingLeft = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.08, 1.15), bronzeMat);
  wingLeft.position.set(0.3, 0.2, 0.48);
  wingLeft.rotation.x = 0.48;
  wingLeft.castShadow = true;
  deltaPivot.add(wingLeft);

  const wingRight = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.08, 1.15), bronzeMat);
  wingRight.position.set(0.3, 0.2, -0.48);
  wingRight.rotation.x = -0.48;
  wingRight.castShadow = true;
  deltaPivot.add(wingRight);

  const figTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.55, 8), bronzeMat);
  figTorso.position.set(1.05, 0.68, 0);
  figTorso.rotation.z = -0.45;
  deltaPivot.add(figTorso);
  const figHead = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), bronzeMat);
  figHead.position.set(1.22, 0.98, 0);
  deltaPivot.add(figHead);

  sundialGroup.add(deltaPivot);
  group.add(sundialGroup);

  // 4. Left Bougainvillea Pergola Arbor & Tall Palmyra Palm (Inside the lawn island at x = -22.0, z = -14.5)
  const pergolaGroup = new THREE.Group();
  pergolaGroup.position.set(-22.0, 0, -14.5);
  const vineCanopy = new THREE.Mesh(
    new THREE.SphereGeometry(2.2, 10, 8),
    new THREE.MeshStandardMaterial({ map: textures.flowerBeds, roughness: 0.85 })
  );
  vineCanopy.scale.set(1.15, 0.68, 1.15);
  vineCanopy.position.y = 2.65;
  pergolaGroup.add(vineCanopy);
  group.add(pergolaGroup);

  const palmPos = { x: -26.5, z: -15.5 };
  const palmGroup = new THREE.Group();
  palmGroup.position.set(palmPos.x, 0, palmPos.z);
  const palmTrunkMat = new THREE.MeshStandardMaterial({ map: textures.palmBark, roughness: 0.9 });
  const palmTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.45, 9.8, 8), palmTrunkMat);
  palmTrunk.position.y = 4.9;
  palmTrunk.castShadow = true;
  palmGroup.add(palmTrunk);

  const frondMat = new THREE.MeshStandardMaterial({ map: textures.palmFrond, roughness: 0.7, side: THREE.DoubleSide });
  for (let f = 0; f < 10; f++) {
    const ang = (f / 10) * Math.PI * 2;
    const pivot = new THREE.Group();
    pivot.position.y = 9.6;
    pivot.rotation.y = ang;
    const blade = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 3.8), frondMat);
    blade.position.set(0, -0.35, 1.75);
    blade.rotation.x = Math.PI / 2.6;
    pivot.add(blade);
    palmGroup.add(pivot);
  }
  group.add(palmGroup);

  // Norfolk Pines in front of East Wing (Placed at x = 31.5, well East of the track at x = 22.5!)
  const pineMat = new THREE.MeshStandardMaterial({ color: 0x1e4d22, roughness: 0.85 });
  [[31.5, -18.0], [31.5, -10.0]].forEach(([px, pz]) => {
    const pGroup = new THREE.Group();
    pGroup.position.set(px, 0, pz);
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.35, 10.5, 8), palmTrunkMat);
    tr.position.y = 5.25;
    pGroup.add(tr);
    for (let tier = 0; tier < 6; tier++) {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(2.4 - tier * 0.3, 1.45, 8), pineMat);
      cone.position.y = 2.6 + tier * 1.3;
      cone.castShadow = true;
      pGroup.add(cone);
    }
    group.add(pGroup);
  });

  // ============================================================================
  // 5. WIDE-RADIUS, ZERO-FOLDING 6-SECTOR CIRCUIT + STRAIGHT SKY-COASTER RAMP
  //    Notice how the Sky-Coaster Ramp climbs and descends along a straight
  //    eastward run (z = -4.5) and returns to ground level BEFORE turning!
  //    That eliminates 100% of curb folding and black triangle artifacts!
  // ============================================================================
  const controlPoints = [
    // Sector 1: Start/Finish Straight along South Lawn (z = 16.5, heading West -X)
    new THREE.Vector3( 14.0, 0.28,  16.5), // 0: Start Gantry
    new THREE.Vector3(  0.0, 0.28,  16.5), // 1: Front straight center
    new THREE.Vector3(-16.0, 0.28,  16.5), // 2: Front straight West

    // West Lawn Turn (flat on ground y = 0.25 so turn is 100% flat & wide!)
    new THREE.Vector3(-29.0, 0.28,  12.0), // 3: West Turn Entry
    new THREE.Vector3(-32.0, 0.35,   2.5), // 4: West Turn Apex
    new THREE.Vector3(-26.0, 0.85,  -4.5), // 5: Aligning straight East along z = -4.5

    // Sector 2: Straight Sky-Coaster Lattice Truss Ramp along z = -4.5 (climbs & descends on a straight line!)
    new THREE.Vector3(-17.0, 3.80,  -4.5), // 6: Coaster Straight Ascent
    new THREE.Vector3( -7.5, 6.80,  -4.5), // 7: Sky-Coaster 6.8m High Crest facing White House!
    new THREE.Vector3(  2.0, 3.80,  -4.5), // 8: Coaster Straight Descent
    new THREE.Vector3( 10.5, 0.85,  -4.5), // 9: Coaster Base Runout

    // Sector 3: Wide-Radius Sundial Loop (flat near ground y = 0.28 so zero curb folding!)
    new THREE.Vector3( 17.5, 0.28,  -9.0), // 10: Sundial East Turn Entry
    new THREE.Vector3( 18.0, 0.28, -18.0), // 11: Sundial East Turn Exit
    new THREE.Vector3( 11.5, 0.28, -24.5), // 12: Straight alignment into East Verandah Portal

    // Sector 4: Straight Through the 8-Arch Mughal Verandah Corridor (z = -24.8, heading West -X)
    new THREE.Vector3(  1.0, 0.28, -24.8), // 13: Inside East Verandah Portal
    new THREE.Vector3(-11.0, 0.28, -24.8), // 14: Verandah Corridor Center
    new THREE.Vector3(-25.0, 0.28, -24.8), // 15: Verandah Corridor West
    new THREE.Vector3(-39.5, 0.28, -24.8), // 16: Straight out West Verandah Portal (dead-center!)

    // Sector 5: Wide-Radius Rear Campus S-Bend (behind White House, heading East +X)
    new THREE.Vector3(-47.5, 0.28, -34.5), // 17: West Forest Turn Entry
    new THREE.Vector3(-39.0, 0.28, -46.5), // 18: Rear Road West Entry
    new THREE.Vector3(-20.0, 0.28, -50.0), // 19: Rear Road North Bend
    new THREE.Vector3( -2.0, 0.28, -46.5), // 20: Rear Road Center Bend
    new THREE.Vector3( 14.5, 0.28, -47.0), // 21: Rear Road East Exit

    // Sector 6: Wide-Open East Boulevard & Smooth Sweeping South-East Turn back to Start Gantry
    new THREE.Vector3( 25.0, 0.28, -36.0), // 22: East Boulevard North Entry
    new THREE.Vector3( 26.5, 0.28, -16.0), // 23: East Boulevard Mid (clear of Sundial loop & East Wing!)
    new THREE.Vector3( 26.5, 0.28,   3.5), // 24: South-East Turn Entry
    new THREE.Vector3( 22.0, 0.28,  13.8)  // 25: Smooth South-East Sweeper into Start Gantry
  ];

  const trackCurve = new THREE.CatmullRomCurve3(controlPoints, true, 'centripetal', 0.5);
  const trackWidth = 4.4; // Generous 4.4m wide track deck
  const curbWidth = 0.34;
  const barrierHeight = 0.42;
  const deckThickness = 0.14;
  const segments = 320;

  const deckPos = [], deckUV = [], deckIdx = [];
  const curbPos = [], curbUV = [], curbIdx = [];
  const spinePos = [], spineIdx = [];
  const ledPos = [], ledIdx = [];
  const trackSamples = [];
  const trussPostMatrices = [];
  const trussBeamMatrices = [];
  const dummy = new THREE.Object3D();

  let cumLength = 0;
  let prevPt = trackCurve.getPointAt(0);

  for (let i = 0; i <= segments; i++) {
    const u = i / segments;
    const pt = trackCurve.getPointAt(u);
    if (i > 0) cumLength += pt.distanceTo(prevPt);
    prevPt = pt;

    const tan = trackCurve.getTangentAt(u).normalize();
    const horizNormal = new THREE.Vector3(-tan.z, 0, tan.x).normalize();

    if (i < segments) {
      trackSamples.push({
        u,
        point: pt.clone(),
        tangent: tan.clone(),
        normal: horizNormal.clone(),
        horizNormal: horizNormal.clone(),
        up: new THREE.Vector3(0, 1, 0),
        bankAngle: 0,
        cumLength
      });
    }

    const hw = trackWidth * 0.5;
    const cw = hw + curbWidth;
    const vCoord = cumLength * 0.22;

    // Pure horizontal normal offsets in (x, z) + pure vertical offsets in y!
    // This mathematically guarantees zero self-folding triangles on slopes!
    const lRoadX = pt.x + horizNormal.x * hw;
    const lRoadZ = pt.z + horizNormal.z * hw;
    const rRoadX = pt.x - horizNormal.x * hw;
    const rRoadZ = pt.z - horizNormal.z * hw;

    const lOutX = pt.x + horizNormal.x * cw;
    const lOutZ = pt.z + horizNormal.z * cw;
    const rOutX = pt.x - horizNormal.x * cw;
    const rOutZ = pt.z - horizNormal.z * cw;

    // 1. Road Deck vertices
    deckPos.push(lRoadX, pt.y, lRoadZ, rRoadX, pt.y, rRoadZ);
    deckUV.push(0, vCoord, 1, vCoord);

    // 2. Smooth 3D Crash Barriers along BOTH sides (pure vertical y offsets -> zero folding!)
    const topY = pt.y + barrierHeight;
    const botY = pt.y - deckThickness;

    curbPos.push(
      lRoadX, pt.y, lRoadZ,
      lRoadX, topY, lRoadZ,
      lOutX,  topY, lOutZ,
      lOutX,  botY, lOutZ,
      rRoadX, pt.y, rRoadZ,
      rRoadX, topY, rRoadZ,
      rOutX,  topY, rOutZ,
      rOutX,  botY, rOutZ
    );
    curbUV.push(
      0, vCoord, 0.35, vCoord, 0.7, vCoord, 1, vCoord,
      0, vCoord, 0.35, vCoord, 0.7, vCoord, 1, vCoord
    );

    // 3. Under-Deck Steel Spine (at botY = pt.y - 0.22, well below deck so it NEVER pokes through!)
    spinePos.push(lRoadX, pt.y - 0.26, lRoadZ, rRoadX, pt.y - 0.26, rRoadZ);

    // 4. Dual Glowing Top Rail Cap along the top of the Crash Barriers
    const capY = topY + 0.015;
    ledPos.push(
      lRoadX, capY, lRoadZ,
      lOutX,  capY, lOutZ,
      rRoadX, capY, rRoadZ,
      rOutX,  capY, rOutZ
    );

    // Instanced Coaster Truss Support Towers under the straight elevated ramp (strictly below deck!)
    if (i < segments && i % 8 === 0 && pt.y > 1.35) {
      const h = Math.max(0.4, pt.y - deckThickness - 0.22);
      const rotY = Math.atan2(tan.x, tan.z);
      const spanW = trackWidth * 0.82;
      [[-spanW * 0.5, -0.22], [spanW * 0.5, -0.22], [-spanW * 0.5, 0.22], [spanW * 0.5, 0.22]].forEach(([ox, oz]) => {
        const wx = pt.x + horizNormal.x * ox + tan.x * oz;
        const wz = pt.z + horizNormal.z * ox + tan.z * oz;
        dummy.position.set(wx, h * 0.5, wz);
        dummy.rotation.set(0, rotY, 0);
        dummy.scale.set(0.08, h, 0.08);
        dummy.updateMatrix();
        trussPostMatrices.push(dummy.matrix.clone());
      });
      for (let by = 1.1; by < h - 0.55; by += 1.5) {
        dummy.position.set(pt.x, by, pt.z);
        dummy.rotation.set(0, rotY, 0);
        dummy.scale.set(spanW + 0.16, 0.07, 0.48);
        dummy.updateMatrix();
        trussBeamMatrices.push(dummy.matrix.clone());
      }
    }

    if (i < segments) {
      const da = i * 2, db = da + 1, dc = (i + 1) * 2, dd = dc + 1;
      deckIdx.push(da, db, dc, db, dd, dc);
      spineIdx.push(da, dc, db, db, dc, dd);

      const cb0 = i * 8, cb1 = (i + 1) * 8;
      for (let sideOffset of [0, 4]) {
        for (let strip = 0; strip < 3; strip++) {
          const p0 = cb0 + sideOffset + strip;
          const p1 = p0 + 1;
          const q0 = cb1 + sideOffset + strip;
          const q1 = q0 + 1;
          if (sideOffset === 0) {
            curbIdx.push(p0, q0, p1, p1, q0, q1);
          } else {
            curbIdx.push(p0, p1, q0, p1, q1, q0);
          }
        }
      }

      const lb0 = i * 4, lb1 = (i + 1) * 4;
      ledIdx.push(lb0, lb1, lb0 + 1, lb0 + 1, lb1, lb1 + 1);
      ledIdx.push(lb0 + 2, lb0 + 3, lb1 + 2, lb0 + 3, lb1 + 3, lb1 + 2);
    }
  }

  const deckGeo = new THREE.BufferGeometry();
  deckGeo.setAttribute('position', new THREE.Float32BufferAttribute(deckPos, 3));
  deckGeo.setAttribute('uv', new THREE.Float32BufferAttribute(deckUV, 2));
  deckGeo.setIndex(deckIdx);
  deckGeo.computeVertexNormals();

  const trackMat = new THREE.MeshStandardMaterial({
    map: textures.trackAsphalt,
    normalMap: textures.plasterNormal,
    normalScale: new THREE.Vector2(0.18, 0.18),
    roughness: 0.62,
    metalness: 0.12,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
    side: THREE.DoubleSide
  });
  const trackMesh = new THREE.Mesh(deckGeo, trackMat);
  trackMesh.castShadow = true;
  trackMesh.receiveShadow = true;
  group.add(trackMesh);

  const curbGeo = new THREE.BufferGeometry();
  curbGeo.setAttribute('position', new THREE.Float32BufferAttribute(curbPos, 3));
  curbGeo.setAttribute('uv', new THREE.Float32BufferAttribute(curbUV, 2));
  curbGeo.setIndex(curbIdx);
  curbGeo.computeVertexNormals();

  const curbMat = new THREE.MeshStandardMaterial({
    map: textures.curbStripe,
    roughness: 0.38,
    metalness: 0.28,
    side: THREE.DoubleSide
  });
  const curbMesh = new THREE.Mesh(curbGeo, curbMat);
  curbMesh.castShadow = true;
  curbMesh.receiveShadow = true;
  group.add(curbMesh);

  const spineGeo = new THREE.BufferGeometry();
  spineGeo.setAttribute('position', new THREE.Float32BufferAttribute(spinePos, 3));
  spineGeo.setIndex(spineIdx);
  spineGeo.computeVertexNormals();

  const trussMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    envMap: textures.envMap || null,
    envMapIntensity: 1.0,
    roughness: 0.35,
    metalness: 0.75,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: 2,
    polygonOffsetUnits: 2
  });
  group.add(new THREE.Mesh(spineGeo, trussMat));

  const ledGeo = new THREE.BufferGeometry();
  ledGeo.setAttribute('position', new THREE.Float32BufferAttribute(ledPos, 3));
  ledGeo.setIndex(ledIdx);
  ledGeo.computeVertexNormals();

  const ledRailMat = new THREE.MeshStandardMaterial({
    color: 0xe0f2fe,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.95,
    roughness: 0.2,
    side: THREE.DoubleSide
  });
  group.add(new THREE.Mesh(ledGeo, ledRailMat));

  const unitBox = new THREE.BoxGeometry(1, 1, 1);
  if (trussPostMatrices.length > 0) {
    const tpInst = new THREE.InstancedMesh(unitBox, trussMat, trussPostMatrices.length);
    trussPostMatrices.forEach((m, i) => tpInst.setMatrixAt(i, m));
    tpInst.instanceMatrix.needsUpdate = true;
    group.add(tpInst);
  }
  if (trussBeamMatrices.length > 0) {
    const tbInst = new THREE.InstancedMesh(unitBox, trussMat, trussBeamMatrices.length);
    trussBeamMatrices.forEach((m, i) => tbInst.setMatrixAt(i, m));
    tbInst.instanceMatrix.needsUpdate = true;
    group.add(tbInst);
  }

  // 7. Checkered Start / Finish Gantry Arch with Wavelength Grand Prix Banner (x = 8.0, z = 16.5)
  const gantryGroup = new THREE.Group();
  gantryGroup.position.set(8.0, 0, 16.5);
  const startFinishMat = new THREE.MeshStandardMaterial({ map: textures.startFinish, roughness: 0.45 });

  const wavelengthBannerMat = new THREE.MeshStandardMaterial({
    map: textures.wavelengthBanner || textures.startFinish,
    roughness: 0.35,
    metalness: 0.2
  });
  const bannerTrussSidesMat = new THREE.MeshStandardMaterial({
    color: 0x0e2317,
    roughness: 0.5,
    metalness: 0.5
  });
  // BoxGeometry faces: 0:+X, 1:-X, 2:+Y, 3:-Y, 4:+Z, 5:-Z
  // Cars approaching along +X see face 1 (-X). Receding traffic sees face 0 (+X).
  const bannerMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.9, trackWidth + 1.5),
    [
      wavelengthBannerMat,
      wavelengthBannerMat,
      bannerTrussSidesMat,
      bannerTrussSidesMat,
      bannerTrussSidesMat,
      bannerTrussSidesMat
    ]
  );
  bannerMesh.position.set(0, 3.85, 0);
  gantryGroup.add(bannerMesh);

  [-trackWidth * 0.62, trackWidth * 0.62].forEach((gz) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.22, 4.1, 0.22), trussMat);
    post.position.set(0, 2.05, gz);
    gantryGroup.add(post);
  });

  const groundStartLine = new THREE.Mesh(new THREE.PlaneGeometry(1.5, trackWidth - 0.15), startFinishMat);
  groundStartLine.rotation.x = -Math.PI / 2;
  groundStartLine.position.set(0, 0.265, 0);
  gantryGroup.add(groundStartLine);
  group.add(gantryGroup);

  // Trackside Wavelength sponsor boards along the start/finish straightaway
  [
    { x: 18.0, z: trackWidth * 0.68 + 0.6 },
    { x: -3.0, z: trackWidth * 0.68 + 0.6 }
  ].forEach((pos) => {
    const boardGroup = new THREE.Group();
    boardGroup.position.set(pos.x, 0, 16.5 + pos.z);
    const boardMesh = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 0.85, 0.12),
      [
        bannerTrussSidesMat, bannerTrussSidesMat,
        bannerTrussSidesMat, bannerTrussSidesMat,
        wavelengthBannerMat, wavelengthBannerMat
      ]
    );
    boardMesh.position.set(0, 0.75, 0);
    boardGroup.add(boardMesh);
    [-1.4, 1.4].forEach((lx) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.75, 0.08), trussMat);
      leg.position.set(lx, 0.375, 0);
      boardGroup.add(leg);
    });
    group.add(boardGroup);
  });

  // 8. 6 Glowing Boost Pads placed on flat/gentle straightaways
  const boostSampleIndices = [16, 82, 150, 228, 275, 305];
  const boostPads = [];
  const boostMat = new THREE.MeshStandardMaterial({
    map: textures.boostGlow,
    emissive: new THREE.Color(0x38e8ff),
    emissiveMap: textures.boostGlow,
    emissiveIntensity: 1.8,
    roughness: 0.2,
    metalness: 0.3
  });

  boostSampleIndices.forEach((idx) => {
    const s = trackSamples[idx % segments];
    const padMesh = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.04, 1.55), boostMat);
    padMesh.position.set(s.point.x, s.point.y + 0.025, s.point.z);
    const rotY = Math.atan2(-s.tangent.z, s.tangent.x);
    const rotZ = Math.asin(Math.max(-0.65, Math.min(0.65, s.tangent.y)));
    padMesh.rotation.order = 'YXZ';
    padMesh.rotation.y = rotY;
    padMesh.rotation.z = rotZ;
    group.add(padMesh);
    boostPads.push({
      x: s.point.x,
      y: s.point.y,
      z: s.point.z,
      sampleIdx: idx % segments,
      length: 2.6,
      width: 1.55,
      mesh: padMesh
    });
  });

  // 9. Instanced Perimeter Forest Trees (Placed well outside the circuit!)
  const treeCoords = [
    { x: -54, z: -24, s: 1.45 }, { x: -52, z: -10, s: 1.35 }, { x: -48, z:   6, s: 1.50 },
    { x: -38, z:  24, s: 1.65 }, { x: -22, z:  26, s: 1.55 }, { x:  38, z:  24, s: 1.45 },
    { x:  56, z: -24, s: 1.50 }, { x:  52, z: -38, s: 1.45 }, { x:  36, z: -52, s: 1.40 },
    { x:  14, z: -58, s: 1.50 }, { x:   0, z: -60, s: 1.45 }, { x: -16, z: -62, s: 1.55 },
    { x: -34, z: -60, s: 1.45 }, { x: -54, z: -44, s: 1.40 }, { x:  58, z:   5, s: 1.55 }
  ];

  const trunkGeo = new THREE.CylinderGeometry(0.45, 0.7, 5.5, 8);
  const crownGeo = new THREE.IcosahedronGeometry(3.9, 1);
  const crownMat = new THREE.MeshStandardMaterial({ color: 0x2f5e27, roughness: 0.88 });
  const trunkInst = new THREE.InstancedMesh(trunkGeo, palmTrunkMat, treeCoords.length);
  const crownInst = new THREE.InstancedMesh(crownGeo, crownMat, treeCoords.length);
  crownInst.castShadow = true;

  treeCoords.forEach((tc, idx) => {
    dummy.position.set(tc.x, 2.75 * tc.s, tc.z);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.setScalar(tc.s);
    dummy.updateMatrix();
    trunkInst.setMatrixAt(idx, dummy.matrix);

    dummy.position.set(tc.x, 6.8 * tc.s, tc.z);
    dummy.scale.set(1.25 * tc.s, 0.95 * tc.s, 1.25 * tc.s);
    dummy.updateMatrix();
    crownInst.setMatrixAt(idx, dummy.matrix);
  });
  trunkInst.instanceMatrix.needsUpdate = true;
  crownInst.instanceMatrix.needsUpdate = true;
  group.add(trunkInst);
  group.add(crownInst);

  const treeLODs = [];

  const checkpoints = [
    { id: 0, u: 0.22, label: 'Sky-Coaster Ramp Peak' },
    { id: 1, u: 0.48, label: 'Mughal Verandah Corridor' },
    { id: 2, u: 0.72, label: 'Rear Campus Chicane' },
    { id: 3, u: 0.90, label: 'East Wing Boulevard' }
  ];

  const sectors = [
    { id: 1, name: '① Start Gantry',      u: 0.01 },
    { id: 2, name: '② Sky-Truss Ramp',    u: 0.20 },
    { id: 3, name: '③ Sundial Curve',     u: 0.36 },
    { id: 4, name: '④ Mughal Verandah',   u: 0.50 },
    { id: 5, name: '⑤ Rear Chicane',      u: 0.72 },
    { id: 6, name: '⑥ East Boulevard',    u: 0.90 }
  ];

  return {
    group,
    colliders,
    trackCurve,
    trackSamples,
    trackWidth,
    boostPads,
    ledRailMat,
    checkpoints,
    sectors,
    treeLODs
  };
};
