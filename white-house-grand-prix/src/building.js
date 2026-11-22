// Optimized White House Complex with Instanced Details & Open East/West Verandah Portals (Zero Track Walls!)
window.WHGP = window.WHGP || {};

window.WHGP.createBuilding = function(THREE, textures, isMobile) {
  const group = new THREE.Group();
  group.name = 'WhiteHouseComplex';
  const colliders = [];

  const plasterMat = new THREE.MeshStandardMaterial({
    map: textures.whitePlaster,
    normalMap: textures.plasterNormal,
    normalScale: new THREE.Vector2(0.3, 0.3),
    roughness: 0.78,
    metalness: 0.04
  });

  const darkGreyStoneMat = new THREE.MeshStandardMaterial({
    color: 0x4b5158,
    roughness: 0.82,
    metalness: 0.08
  });

  const roofMat = new THREE.MeshStandardMaterial({
    map: textures.redCorrugated,
    normalMap: textures.corrugatedNormal,
    normalScale: new THREE.Vector2(0.45, 0.45),
    roughness: 0.48,
    metalness: 0.28,
    side: THREE.DoubleSide
  });

  const flatTerraceMat = new THREE.MeshStandardMaterial({
    color: 0x7b8086,
    roughness: 0.88
  });

  const checkerMat = new THREE.MeshStandardMaterial({
    map: textures.stoneCheckerboard,
    roughness: 0.75,
    metalness: 0.08
  });

  const verandahFloorMat = new THREE.MeshStandardMaterial({
    map: textures.verandahTile,
    roughness: 0.65,
    metalness: 0.1
  });

  const darkWoodMat = new THREE.MeshStandardMaterial({
    color: 0x3b2415,
    roughness: 0.6
  });

  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x22323d,
    envMap: textures.envMap || null,
    envMapIntensity: 1.3,
    roughness: 0.12,
    metalness: 0.82
  });

  function createHipRoofGeometry(w, d, h, ridgeRatio = 0.55) {
    const hw = w / 2, hd = d / 2, hr = (w * ridgeRatio) / 2;
    const geom = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      -hw, 0,  hd,   hw, 0,  hd,   hr, h, 0,
      -hw, 0,  hd,   hr, h,  0,   -hr, h, 0,
       hw, 0, -hd,  -hw, 0, -hd,  -hr, h, 0,
       hw, 0, -hd,  -hr, h,  0,    hr, h, 0,
      -hw, 0, -hd,  -hw, 0,  hd,  -hr, h, 0,
       hw, 0,  hd,   hw, 0, -hd,   hr, h, 0
    ]);
    const uvs = new Float32Array([
      0, 0, 4, 0, 3, 2,  0, 0, 3, 2, 1, 2,
      0, 0, 4, 0, 3, 2,  0, 0, 3, 2, 1, 2,
      0, 0, 2, 0, 1, 2,  0, 0, 2, 0, 1, 2
    ]);
    geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geom.computeVertexNormals();
    return geom;
  }

  function createPointedArchBay(bayW, wallH, depth, openRatio = 0.82) {
    const bayGroup = new THREE.Group();
    const hw = bayW / 2;
    const openHalf = (bayW * openRatio) * 0.5;
    const springY = 2.65;
    const apexY = 4.65;

    const shape = new THREE.Shape();
    shape.moveTo(-hw, 0);
    shape.lineTo(-openHalf, 0);
    shape.lineTo(-openHalf, springY);
    shape.bezierCurveTo(-openHalf, springY + 0.95, -openHalf * 0.35, apexY - 0.5, 0, apexY);
    shape.bezierCurveTo(openHalf * 0.35, apexY - 0.5, openHalf, springY + 0.95, openHalf, springY);
    shape.lineTo(openHalf, 0);
    shape.lineTo(hw, 0);
    shape.lineTo(hw, wallH);
    shape.lineTo(-hw, wallH);
    shape.closePath();

    const geom = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
    geom.translate(0, 0, -depth / 2);
    const mesh = new THREE.Mesh(geom, plasterMat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    bayGroup.add(mesh);

    // Clean top cornice moulding strip (non-overlapping, zero Z-fighting!)
    const cornice = new THREE.Mesh(new THREE.BoxGeometry(bayW, 0.18, depth + 0.14), darkGreyStoneMat);
    cornice.position.set(0, wallH - 0.12, 0);
    bayGroup.add(cornice);

    return bayGroup;
  }

  // ============================================================================
  // 1. MAIN WHITE HOUSE BUILDING & 8-ARCH MUGHAL VERANDAH (x = -32.2 to +3.0, z = -20)
  // ============================================================================
  const numMainArches = 8;
  const bayWidth = 4.4;
  const startArchX = -32.2;
  const verandahFrontZ = -20.0;
  const corridorCenterZ = -24.8;
  const wallH = 5.5;

  // Verandah stone tiled floor
  const vFloor = new THREE.Mesh(new THREE.BoxGeometry(41.5, 0.12, 8.8), verandahFloorMat);
  vFloor.position.set(-14.2, 0.06, -24.4);
  vFloor.receiveShadow = true;
  group.add(vFloor);

  // Flat grey roof terrace over the verandah + white parapet wall
  const terraceSlab = new THREE.Mesh(new THREE.BoxGeometry(39.2, 0.35, 10.0), flatTerraceMat);
  terraceSlab.position.set(-14.6, wallH + 0.15, corridorCenterZ);
  terraceSlab.castShadow = true;
  terraceSlab.receiveShadow = true;
  group.add(terraceSlab);

  const parapetCap = new THREE.Mesh(new THREE.BoxGeometry(39.4, 0.32, 0.78), plasterMat);
  parapetCap.position.set(-14.6, wallH + 0.45, verandahFrontZ);
  group.add(parapetCap);

  // Build 8 front pointed arches along z = -20.0
  const archTemplate = createPointedArchBay(bayWidth, wallH, 0.65, 0.82);
  for (let i = 0; i < numMainArches; i++) {
    const cx = startArchX + (i + 0.5) * bayWidth;
    const bay = archTemplate.clone();
    bay.position.set(cx, 0, verandahFrontZ);
    group.add(bay);
  }

  // Arch columns with dark grey stone capitals & plinths
  for (let i = 0; i <= numMainArches; i++) {
    const px = startArchX + i * bayWidth;
    const basePlinth = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.55, 0.92), darkGreyStoneMat);
    basePlinth.position.set(px, 0.28, verandahFrontZ);
    group.add(basePlinth);

    const capMoulding = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.22, 0.96), darkGreyStoneMat);
    capMoulding.position.set(px, 2.62, verandahFrontZ);
    group.add(capMoulding);
  }

  // Instanced dentil frieze & corner quoins (1 single draw call!)
  const quoinMatrices = [];
  const dummy = new THREE.Object3D();
  for (let x = startArchX; x <= startArchX + numMainArches * bayWidth; x += 0.44) {
    dummy.position.set(x, wallH - 0.35, verandahFrontZ + 0.32);
    dummy.scale.set(0.18, 0.22, 0.18);
    dummy.updateMatrix();
    quoinMatrices.push(dummy.matrix.clone());
  }
  [startArchX, startArchX + numMainArches * bayWidth].forEach((qx) => {
    let idx = 0;
    for (let y = 0.2; y < wallH + 0.2; y += 0.36) {
      dummy.position.set(qx, y, verandahFrontZ + 0.25);
      dummy.scale.set((idx % 2 === 0) ? 0.58 : 0.36, 0.24, 0.26);
      dummy.updateMatrix();
      quoinMatrices.push(dummy.matrix.clone());
      idx++;
    }
  });
  const unitBox = new THREE.BoxGeometry(1, 1, 1);
  const quoinInst = new THREE.InstancedMesh(unitBox, darkGreyStoneMat, quoinMatrices.length);
  quoinMatrices.forEach((m, i) => quoinInst.setMatrixAt(i, m));
  quoinInst.instanceMatrix.needsUpdate = true;
  group.add(quoinInst);

  // WIDE-OPEN EAST PORTE-COCHÈRE ARCHWAY & WEST VERANDAH PORTAL (Oriented perpendicular to track so cars drive straight through!)
  const widePortalTemplate = createPointedArchBay(11.6, wallH, 1.0, 0.86); // 8.33m wide clear opening!
  const eastPortal = widePortalTemplate.clone();
  eastPortal.position.set(6.5, 0, corridorCenterZ);
  eastPortal.rotation.y = Math.PI / 2;
  group.add(eastPortal);

  const westPortal = widePortalTemplate.clone();
  westPortal.position.set(-33.0, 0, corridorCenterZ);
  westPortal.rotation.y = Math.PI / 2; // Arch opening faces directly along the X-axis track!
  group.add(westPortal);

  // Main Rear Building Block behind Verandah (z = -30.5 to -41.5, well clear of corridor at z = -24.8!)
  const rearHall = new THREE.Mesh(new THREE.BoxGeometry(36.0, 6.8, 11.0), plasterMat);
  rearHall.position.set(-14.6, 3.4, -36.0);
  rearHall.castShadow = true;
  rearHall.receiveShadow = true;
  group.add(rearHall);

  const rearRoofLeft = new THREE.Mesh(createHipRoofGeometry(19.5, 12.5, 3.6, 0.58), roofMat);
  rearRoofLeft.position.set(-23.8, 6.8, -36.0);
  rearRoofLeft.castShadow = true;
  group.add(rearRoofLeft);

  const rearRoofRight = new THREE.Mesh(createHipRoofGeometry(18.5, 12.2, 3.4, 0.55), roofMat);
  rearRoofRight.position.set(-5.8, 6.8, -36.0);
  rearRoofRight.castShadow = true;
  group.add(rearRoofRight);

  // ============================================================================
  // 2. TWO OCTAGONAL CLERESTORY TURRETS + WHITE CHIMNEYS
  // ============================================================================
  const turret1 = new THREE.Group();
  turret1.position.set(-23.8, wallH, -28.8);
  const t1Radius = 5.4;
  const t1Body = new THREE.Mesh(new THREE.CylinderGeometry(t1Radius, t1Radius, 3.4, 8), checkerMat);
  t1Body.position.y = 1.7;
  t1Body.castShadow = true;
  turret1.add(t1Body);

  for (let a = 0; a < 8; a++) {
    const ang = (a * Math.PI) / 4 + Math.PI / 8;
    const win = new THREE.Mesh(new THREE.BoxGeometry(1.55, 1.05, 0.2), glassMat);
    win.position.set(Math.cos(ang) * (t1Radius * 0.92), 1.8, Math.sin(ang) * (t1Radius * 0.92));
    win.rotation.y = -ang + Math.PI / 2;
    turret1.add(win);
  }
  const t1Roof = new THREE.Mesh(new THREE.ConeGeometry(t1Radius * 1.16, 3.2, 8), roofMat);
  t1Roof.position.y = 5.0;
  t1Roof.castShadow = true;
  turret1.add(t1Roof);

  [[-1.8, -2.2], [0.8, -2.6]].forEach(([cx, cz]) => {
    const ch = new THREE.Mesh(new THREE.BoxGeometry(0.75, 3.4, 0.75), plasterMat);
    ch.position.set(cx, 5.2, cz);
    turret1.add(ch);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.22, 0.95), darkGreyStoneMat);
    cap.position.set(cx, 6.9, cz);
    turret1.add(cap);
  });
  group.add(turret1);

  const turret2 = new THREE.Group();
  turret2.position.set(-11.2, wallH, -27.8);
  const t2Radius = 3.6;
  const t2Body = new THREE.Mesh(new THREE.CylinderGeometry(t2Radius, t2Radius, 2.6, 8), plasterMat);
  t2Body.position.y = 1.3;
  t2Body.castShadow = true;
  turret2.add(t2Body);

  for (let a = 0; a < 8; a++) {
    const ang = (a * Math.PI) / 4 + Math.PI / 8;
    const win = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.85, 0.18), glassMat);
    win.position.set(Math.cos(ang) * (t2Radius * 0.92), 1.4, Math.sin(ang) * (t2Radius * 0.92));
    win.rotation.y = -ang + Math.PI / 2;
    turret2.add(win);
  }
  const t2Roof = new THREE.Mesh(new THREE.ConeGeometry(t2Radius * 1.18, 2.5, 8), roofMat);
  t2Roof.position.y = 3.85;
  t2Roof.castShadow = true;
  turret2.add(t2Roof);

  const ch3 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 2.9, 0.7), plasterMat);
  ch3.position.set(2.2, 4.1, -1.8);
  turret2.add(ch3);
  group.add(turret2);

  // ============================================================================
  // 3. VERANDAH INTERIOR DETAILS (Placed along sides so center track is 100% clear)
  // ============================================================================
  const ttBlueMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.35 });
  const ttWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
  [-26.5, -17.5, -8.5].forEach((tx) => {
    const ttGroup = new THREE.Group();
    ttGroup.position.set(tx, 0, -20.75);
    const top = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.08, 1.15), ttBlueMat);
    top.position.y = 0.76;
    ttGroup.add(top);
    const net = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.16, 1.22), ttWhiteMat);
    net.position.y = 0.88;
    ttGroup.add(net);
    group.add(ttGroup);
  });

  for (let i = 0; i < 8; i++) {
    const wx = startArchX + (i + 0.5) * bayWidth;
    if (i % 2 === 0) {
      const artMat = new THREE.MeshStandardMaterial({
        map: textures.artworks[(i / 2) % textures.artworks.length],
        roughness: 0.4
      });
      const frame = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.45, 0.08), artMat);
      frame.position.set(wx, 2.85, -30.35);
      group.add(frame);
    } else {
      const door = new THREE.Mesh(new THREE.BoxGeometry(1.65, 3.4, 0.12), darkWoodMat);
      door.position.set(wx, 1.7, -30.35);
      group.add(door);
    }
  }

  const lanternColors = [0xff6b35, 0xf7c548, 0xe63946, 0x4cc9f0, 0xff9f1c, 0x10b981];
  for (let i = 0; i < 6; i++) {
    const lx = -29.0 + i * 5.8;
    const lMat = new THREE.MeshStandardMaterial({
      color: lanternColors[i],
      emissive: lanternColors[i],
      emissiveIntensity: 0.7
    });
    const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), lMat);
    lantern.position.set(lx, 4.5, corridorCenterZ);
    group.add(lantern);
  }

  // ============================================================================
  // 4. RIGHT BUILDING — EAST TWO-STORY COLONIAL WING (Placed cleanly at x = 38.5, z = -19.5)
  // ============================================================================
  const eastWing = new THREE.Group();
  eastWing.position.set(48.0, 0, -24.0);
  eastWing.rotation.y = 0.0;

  const ewBody = new THREE.Mesh(new THREE.BoxGeometry(28.0, 7.4, 11.5), plasterMat);
  ewBody.position.set(0, 3.7, 0);
  ewBody.castShadow = true;
  ewBody.receiveShadow = true;
  eastWing.add(ewBody);

  const ewRoof = new THREE.Mesh(createHipRoofGeometry(29.8, 13.2, 3.8, 0.68), roofMat);
  ewRoof.position.set(0, 7.4, 0);
  ewRoof.castShadow = true;
  eastWing.add(ewRoof);

  const ewBalconyFloor = new THREE.Mesh(new THREE.BoxGeometry(26.0, 0.3, 2.8), plasterMat);
  ewBalconyFloor.position.set(0, 3.8, 6.8);
  eastWing.add(ewBalconyFloor);

  const ewBalconyRail = new THREE.Mesh(new THREE.BoxGeometry(26.0, 0.95, 0.15), darkGreyStoneMat);
  ewBalconyRail.position.set(0, 4.4, 8.1);
  eastWing.add(ewBalconyRail);

  for (let x = -11.5; x <= 11.5; x += 3.8) {
    const col = new THREE.Mesh(new THREE.BoxGeometry(0.55, 3.8, 0.55), plasterMat);
    col.position.set(x, 1.9, 8.0);
    eastWing.add(col);
    const win = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.8, 0.2), glassMat);
    win.position.set(x, 5.5, 5.76);
    eastWing.add(win);
  }

  const tentMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4, side: THREE.DoubleSide });
  const tentTop = new THREE.Mesh(createHipRoofGeometry(10.5, 7.5, 1.8, 0.5), tentMat);
  tentTop.position.set(18.5, 3.4, 3.5);
  eastWing.add(tentTop);
  group.add(eastWing);

  return { group, colliders };
};
