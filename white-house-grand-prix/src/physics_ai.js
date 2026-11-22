// Planted, Grippy Arcade-Sim Car Physics with Continuous Crash Barrier Glide & Smart Cornering Assist
window.WHGP = window.WHGP || {};

window.WHGP.createRaceWorld = function(THREE, envData, buildingData, textures, audioCtrl, particleCtrl) {
  const trackSamples = envData.trackSamples;
  const sampleCount = trackSamples.length;
  const trackHalfWidth = envData.trackWidth * 0.5;

  let vehicleScale = 0.44;
  let topSpeedMultiplier = 1.0;
  let aiCruiseEnabled = false;

  // Fast allocation-free local window sample lookup + fractional interpolation
  function getClosestTrackSample(x, z, hintIdx = null) {
    let bestIdx = 0;
    let bestDistSq = Infinity;

    if (hintIdx !== null && hintIdx !== undefined) {
      const windowSize = 24;
      for (let offset = -windowSize; offset <= windowSize; offset++) {
        const i = (hintIdx + offset + sampleCount) % sampleCount;
        const pt = trackSamples[i].point;
        const dx = x - pt.x;
        const dz = z - pt.z;
        const d2 = dx * dx + dz * dz;
        if (d2 < bestDistSq) {
          bestDistSq = d2;
          bestIdx = i;
        }
      }
      if (bestDistSq < 49.0) {
        return refineSample(x, z, bestIdx);
      }
    }

    for (let i = 0; i < sampleCount; i++) {
      const pt = trackSamples[i].point;
      const dx = x - pt.x;
      const dz = z - pt.z;
      const d2 = dx * dx + dz * dz;
      if (d2 < bestDistSq) {
        bestDistSq = d2;
        bestIdx = i;
      }
    }
    return refineSample(x, z, bestIdx);
  }

  function refineSample(x, z, idx) {
    // Check both segment [idx-1 -> idx] and [idx -> idx+1] for true continuous closest point on the spline!
    let bestProj = null;
    for (let stepOffset of [-1, 0]) {
      const i0 = (idx + stepOffset + sampleCount) % sampleCount;
      const i1 = (i0 + 1) % sampleCount;
      const s0 = trackSamples[i0];
      const s1 = trackSamples[i1];
      const segVecX = s1.point.x - s0.point.x;
      const segVecZ = s1.point.z - s0.point.z;
      const segLenSq = Math.max(0.0001, segVecX * segVecX + segVecZ * segVecZ);
      const dx0 = x - s0.point.x;
      const dz0 = z - s0.point.z;
      const frac = Math.max(0, Math.min(1, (dx0 * segVecX + dz0 * segVecZ) / segLenSq));

      const cx = s0.point.x + segVecX * frac;
      const cz = s0.point.z + segVecZ * frac;
      const d2 = (x - cx) * (x - cx) + (z - cz) * (z - cz);

      if (!bestProj || d2 < bestProj.d2) {
        // Interpolate tangent and normal smoothly across the segment so there are ZERO corner kinks!
        let tx = s0.tangent.x + (s1.tangent.x - s0.tangent.x) * frac;
        let ty = s0.tangent.y + (s1.tangent.y - s0.tangent.y) * frac;
        let tz = s0.tangent.z + (s1.tangent.z - s0.tangent.z) * frac;
        const tLen = Math.hypot(tx, ty, tz) || 1;
        tx /= tLen; ty /= tLen; tz /= tLen;

        const hLen = Math.hypot(tx, tz) || 1;
        const nx = -tz / hLen;
        const nz =  tx / hLen;

        const latOffset = (x - cx) * nx + (z - cz) * nz;
        const interpY = s0.point.y + (s1.point.y - s0.point.y) * frac;
        const interpU = (i0 + frac) / sampleCount;

        bestProj = {
          d2,
          index: i0,
          sample: {
            u: interpU,
            point: { x: cx, y: interpY, z: cz },
            tangent: { x: tx, y: ty, z: tz, dot: (o) => tx * o.x + ty * o.y + tz * o.z },
            horizNormal: { x: nx, y: 0, z: nz },
            bankAngle: 0
          },
          distance: Math.abs(latOffset),
          latOffset,
          interpY,
          interpU
        };
      }
    }
    return bestProj;
  }

  function createRacer(spec, isPlayer, gridIndex) {
    const model = window.WHGP.createVehicleMesh(THREE, spec.id, textures);
    model.root.scale.setScalar(vehicleScale);

    const row = Math.floor(gridIndex / 2);
    const col = (gridIndex % 2 === 0) ? -1 : 1;
    const startX = 10.2 + row * 2.2;
    const startZ = 16.5 + col * 0.82;
    const startY = 0.24;
    const startYaw = Math.PI;

    model.root.position.set(startX, startY, startZ);
    model.root.rotation.y = startYaw;

    return {
      id: spec.id + '_' + gridIndex,
      name: isPlayer ? 'Player' : spec.name,
      spec,
      isPlayer,
      gridIndex,
      mesh: model.root,
      wheels: model.wheels,
      extraAnim: model.extraAnim,
      brakeLights: model.brakeLights || [],
      nitroFlames: model.nitroFlames || [],
      x: startX,
      y: startY,
      z: startZ,
      vx: 0,
      vy: 0,
      vz: 0,
      speed: 0,
      yaw: startYaw,
      steerAngle: 0,
      pitch: 0,
      roll: 0,
      suspOffset: 0,
      suspVel: 0,
      grounded: true,
      drifting: false,
      slipAngle: 0,
      offTrack: false,
      wrongWay: false,
      wrongWayTimer: 0,
      boostTimer: 0,
      boostCooldown: 0,
      sparkCooldown: 0,
      lap: 1,
      checkpointsPassed: new Set(),
      trackU: 0.01,
      lastValidU: 0.01,
      lastSampleIdx: 4,
      totalProgress: 0,
      lapStartTime: 0,
      currentLapTime: 0,
      bestLapTime: null,
      totalRaceTime: 0,
      finished: false,
      finishPosition: 0,
      aiSkill: 0.94 + (gridIndex * 0.025),
      aiLateralOffset: (gridIndex - 1.5) * 0.48,
      stuckTimer: 0,
      startX,
      startY,
      startZ,
      startYaw
    };
  }

  function resetRacer(r, nowSec) {
    r.x = r.startX;
    r.y = r.startY;
    r.z = r.startZ;
    r.vx = 0;
    r.vy = 0;
    r.vz = 0;
    r.speed = 0;
    r.yaw = r.startYaw;
    r.steerAngle = 0;
    r.pitch = 0;
    r.roll = 0;
    r.suspOffset = 0;
    r.suspVel = 0;
    r.grounded = true;
    r.drifting = false;
    r.slipAngle = 0;
    r.offTrack = false;
    r.wrongWay = false;
    r.wrongWayTimer = 0;
    r.boostTimer = 0;
    r.boostCooldown = 0;
    r.sparkCooldown = 0;
    r.lap = 1;
    r.checkpointsPassed.clear();
    const startLookup = getClosestTrackSample(r.startX, r.startZ, null);
    r.lastSampleIdx = startLookup.index;
    r.trackU = startLookup.interpU;
    r.lastValidU = startLookup.interpU;
    r.totalProgress = 0;
    r.lapStartTime = nowSec;
    r.currentLapTime = 0;
    r.bestLapTime = null;
    r.totalRaceTime = 0;
    r.finished = false;
    r.finishPosition = 0;
    r.stuckTimer = 0;
    r.mesh.scale.setScalar(vehicleScale);
    r.mesh.position.set(r.x, r.y, r.z);
    r.mesh.rotation.set(0, r.yaw, 0);
  }

  function respawnRacer(r) {
    const nearest = getClosestTrackSample(r.x, r.z, r.lastSampleIdx);
    const s = nearest.sample;
    r.x = s.point.x;
    r.y = s.point.y + 0.04;
    r.z = s.point.z;
    r.vx = 0;
    r.vy = 0;
    r.vz = 0;
    r.speed = 0;
    r.yaw = Math.atan2(-s.tangent.z, s.tangent.x);
    r.lastSampleIdx = nearest.index;
    r.stuckTimer = 0;
    r.wrongWay = false;
    r.wrongWayTimer = 0;
  }

  function teleportToSector(r, uTarget) {
    const idx = Math.floor(((uTarget % 1.0) + 1.0) % 1.0 * sampleCount) % sampleCount;
    const s = trackSamples[idx];
    r.x = s.point.x;
    r.y = s.point.y + 0.04;
    r.z = s.point.z;
    r.vx = 0;
    r.vy = 0;
    r.vz = 0;
    r.speed = r.spec.stats.maxSpeed * 0.65;
    r.yaw = Math.atan2(-s.tangent.z, s.tangent.x);
    r.lastSampleIdx = idx;
    r.trackU = s.u;
    r.lastValidU = s.u;
    r.wrongWay = false;
    r.wrongWayTimer = 0;
  }

  function setVehicleScale(newScale, racers) {
    vehicleScale = Math.max(0.28, Math.min(1.0, newScale));
    if (racers) {
      racers.forEach((r) => r.mesh.scale.setScalar(vehicleScale));
    }
  }

  function setTopSpeedMultiplier(mult) {
    topSpeedMultiplier = Math.max(0.6, Math.min(1.8, mult));
  }

  function setAICruise(enabled) {
    aiCruiseEnabled = !!enabled;
  }

  function computeAIControls(r, allRacers, playerRacer, dt) {
    const nearest = getClosestTrackSample(r.x, r.z, r.lastSampleIdx);
    r.lastSampleIdx = nearest.index;

    const lookIdx = (nearest.index + 8) % sampleCount;
    const furtherIdx = (nearest.index + 16) % sampleCount;
    const targetSample = trackSamples[lookIdx];
    const furtherSample = trackSamples[furtherIdx];

    let desiredOffset = r.isPlayer ? 0 : r.aiLateralOffset;

    for (let i = 0; i < allRacers.length; i++) {
      const other = allRacers[i];
      if (other === r) continue;
      const dist = Math.hypot(other.x - r.x, other.z - r.z);
      if (dist < 2.2) {
        const cross = Math.cos(r.yaw) * (other.z - r.z) - Math.sin(r.yaw) * (other.x - r.x);
        desiredOffset += (cross > 0 ? -0.65 : 0.65);
      }
    }
    desiredOffset = Math.max(-1.1, Math.min(1.1, desiredOffset));

    const aimX = targetSample.point.x + targetSample.horizNormal.x * desiredOffset;
    const aimZ = targetSample.point.z + targetSample.horizNormal.z * desiredOffset;

    const desiredYaw = Math.atan2(-(aimZ - r.z), aimX - r.x);
    let angleDiff = desiredYaw - r.yaw;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

    const steer = Math.max(-1, Math.min(1, angleDiff * 2.2));
    const turnDot = targetSample.tangent.dot(furtherSample.tangent);
    const isSharpTurn = turnDot < 0.86;

    let rubberBandFactor = 1.0;
    if (playerRacer && !r.isPlayer) {
      const progressDiff = playerRacer.totalProgress - r.totalProgress;
      rubberBandFactor = 1.0 + Math.max(-0.06, Math.min(0.08, progressDiff * 0.2));
    }

    const maxCornerSpeed = r.spec.stats.maxSpeed * topSpeedMultiplier * (isSharpTurn ? 0.82 : 0.99) * (r.isPlayer ? 1.02 : r.aiSkill * rubberBandFactor);
    const throttle = r.speed < maxCornerSpeed ? 1.0 : 0.25;
    const brake = (isSharpTurn && r.speed > maxCornerSpeed * 1.15) ? 0.4 : 0.0;
    const handbrake = (Math.abs(angleDiff) > 0.65 && r.speed > 10.5);

    if (Math.abs(r.speed) < 1.2) {
      r.stuckTimer += dt;
      if (r.stuckTimer > 2.5) {
        respawnRacer(r);
      }
    } else {
      r.stuckTimer = 0;
    }

    return { throttle, brake, steer, handbrake, rubberBandFactor };
  }

  function stepPhysics(racers, playerInput, dt, raceActive, nowSec, onFinishCallback, onCameraShake) {
    const playerRacer = racers.find((r) => r.isPlayer);
    const manualOverride = playerInput.forward || playerInput.backward || playerInput.left || playerInput.right || playerInput.drift;

    for (let rIdx = 0; rIdx < racers.length; rIdx++) {
      const r = racers[rIdx];
      if (!raceActive) {
        r.mesh.position.set(r.x, r.y + Math.sin(nowSec * 2.5 + r.gridIndex) * 0.008, r.z);
        continue;
      }

      let ctrl;
      if (r.isPlayer && !r.finished && (!aiCruiseEnabled || manualOverride)) {
        ctrl = {
          throttle: playerInput.forward ? 1 : 0,
          brake: playerInput.backward ? 1 : 0,
          steer: (playerInput.left ? 1 : 0) + (playerInput.right ? -1 : 0) + (playerInput.tiltSteer || 0),
          handbrake: !!playerInput.drift,
          rubberBandFactor: 1.0
        };
        ctrl.steer = Math.max(-1, Math.min(1, ctrl.steer));
      } else {
        ctrl = computeAIControls(r, racers, playerRacer, dt);
      }

      const st = r.spec.stats;
      const boostMultiplier = r.boostTimer > 0 ? 1.18 : 1.0;
      if (r.boostTimer > 0) r.boostTimer = Math.max(0, r.boostTimer - dt);
      if (r.boostCooldown > 0) r.boostCooldown = Math.max(0, r.boostCooldown - dt);
      if (r.sparkCooldown > 0) r.sparkCooldown = Math.max(0, r.sparkCooldown - dt);

      const effectiveMaxSpeed = st.maxSpeed * topSpeedMultiplier * boostMultiplier * (r.isPlayer ? 1.0 : ctrl.rubberBandFactor * r.aiSkill);

      // Smooth responsive throttle & braking
      if (ctrl.throttle > 0) {
        r.speed += st.accel * topSpeedMultiplier * ctrl.throttle * (r.boostTimer > 0 ? 1.28 : 1.0) * dt;
      }
      if (ctrl.brake > 0) {
        if (r.speed > 0.4) {
          r.speed -= st.brakeForce * ctrl.brake * dt;
        } else {
          r.speed -= (st.accel * 0.55) * ctrl.brake * dt;
        }
      }
      if (ctrl.throttle === 0 && ctrl.brake === 0) {
        r.speed *= Math.pow(0.32, dt);
      }

      r.speed = Math.max(-6.5, Math.min(effectiveMaxSpeed, r.speed));

      // Planted, Non-Fishtailing Steering Physics:
      // 1. Progressive speed-sensitive steering damping so high-speed straights are rock-solid
      // 2. Instant self-centering when steering input is released (dt * 32) so the car never oscillates!
      const speedRatio = Math.min(1, Math.abs(r.speed) / (st.maxSpeed * topSpeedMultiplier));
      const speedSteerDamp = 1.0 - speedRatio * 0.35;
      r.drifting = ctrl.handbrake && Math.abs(r.speed) > 6.0 && Math.abs(ctrl.steer) > 0.12;

      const driftTurnBonus = r.drifting ? 1.25 : 1.0;
      const steerDir = r.speed >= -0.2 ? 1 : -1;
      const targetSteer = ctrl.steer * st.turnRate * speedSteerDamp * driftTurnBonus * steerDir;

      // Fast response on turn-in, ultra-fast snap-back to 0 when key is released!
      const steerLerpRate = (Math.abs(ctrl.steer) < 0.05) ? 32.0 : 14.0;
      r.steerAngle += (targetSteer - r.steerAngle) * Math.min(1, dt * steerLerpRate);

      if (Math.abs(r.speed) > 0.2) {
        r.yaw += r.steerAngle * Math.min(1, Math.abs(r.speed) / 3.5) * dt;
      }

      // Controlled, bounded drift slip angle (never spins out!)
      const targetSlip = r.drifting ? (ctrl.steer * 0.22 * (1.85 - st.driftGrip)) : (ctrl.steer * speedRatio * 0.03);
      r.slipAngle += (targetSlip - r.slipAngle) * Math.min(1, dt * 12.0);

      // Lookup current track sample & apply Smart Cornering / Track-Follow Assist
      const preLookup = getClosestTrackSample(r.x, r.z, r.lastSampleIdx);
      r.lastSampleIdx = preLookup.index;
      const lookSample = trackSamples[(preLookup.index + 3) % sampleCount];
      const trackYaw = Math.atan2(-lookSample.tangent.z, lookSample.tangent.x);

      let yawDiff = trackYaw - r.yaw;
      while (yawDiff > Math.PI) yawDiff -= Math.PI * 2;
      while (yawDiff < -Math.PI) yawDiff += Math.PI * 2;

      // Gentle magnetic track-alignment assist when moving forward (keeps car planted around curves!)
      if (r.isPlayer && r.speed > 1.5 && Math.abs(yawDiff) < 1.35) {
        const assistStrength = (Math.abs(ctrl.steer) < 0.05) ? 2.4 : 1.15;
        r.yaw += yawDiff * Math.min(1, dt * assistStrength * speedRatio);
      }

      // Mathematical Sign Convention in Three.js (Y-up):
      // Forward vector: (fx, fz) = (cos(yaw), -sin(yaw))
      // Track tangent:  (tx, tz) = (cos(bYaw), -sin(bYaw))
      // Track normal:   (nx, nz) = (-tz, tx) = (sin(bYaw), cos(bYaw)) -> points to the RIGHT of the driving direction!
      // Therefore:
      // - latOffset > 0 is the RIGHT barrier (reached when steering right, ctrl.steer < 0, headingRel < 0)
      // - latOffset < 0 is the LEFT barrier  (reached when steering left,  ctrl.steer > 0, headingRel > 0)
      // - Lateral velocity toward +horizNormal is v_norm = fx*nx + fz*nz = -sin(yaw - bYaw) = -sin(headingRel)
      const edgeRatio = preLookup.latOffset / Math.max(1.0, trackHalfWidth - 0.65);
      if (edgeRatio > 0.80 && ctrl.steer < 0) {
        // Near RIGHT barrier (latOffset > 0) and steering RIGHT (ctrl.steer < 0) -> block outward steering!
        r.steerAngle = Math.max(r.steerAngle, 0);
      } else if (edgeRatio < -0.80 && ctrl.steer > 0) {
        // Near LEFT barrier (latOffset < 0) and steering LEFT (ctrl.steer > 0) -> block outward steering!
        r.steerAngle = Math.min(r.steerAngle, 0);
      }

      const moveAngle = r.yaw - r.slipAngle * 0.35;
      const horizSpeed = r.speed * Math.cos(r.pitch);
      r.vx = Math.cos(moveAngle) * horizSpeed;
      r.vz = -Math.sin(moveAngle) * horizSpeed;

      r.x += r.vx * dt;
      r.z += r.vz * dt;

      // Vehicle-to-vehicle collisions FIRST (so barrier clamp afterwards guarantees nobody gets pushed into a divider!)
      for (let i = 0; i < racers.length; i++) {
        const other = racers[i];
        if (other === r) continue;
        if (Math.abs(r.y - other.y) > 1.2) continue;
        const dx = r.x - other.x;
        const dz = r.z - other.z;
        const dist = Math.hypot(dx, dz);
        const minDist = 1.75 * vehicleScale;
        if (dist < minDist && dist > 0.001) {
          const nx = dx / dist;
          const nz = dz / dist;
          const overlap = (minDist - dist) * 0.5;
          r.x += nx * overlap;
          r.z += nz * overlap;
          other.x -= nx * overlap;
          other.z -= nz * overlap;
          if ((r.isPlayer || other.isPlayer) && r.sparkCooldown <= 0) {
            r.sparkCooldown = 0.18;
            if (particleCtrl) particleCtrl.emitSparks((r.x + other.x) * 0.5, r.y + 0.15, (r.z + other.z) * 0.5);
            if (audioCtrl) audioCtrl.playSparkPing();
          }
        }
      }

      // Project updated position onto the Continuous Segment-Interpolated Track Channel
      const lookup = getClosestTrackSample(r.x, r.z, r.lastSampleIdx);
      r.lastSampleIdx = lookup.index;
      const curSample = lookup.sample;

      // Compute oriented bounding-box lateral extent (accounting for car width AND yaw angle of nose/tail!)
      const bYaw = Math.atan2(-curSample.tangent.z, curSample.tangent.x);
      let headingRel = r.yaw - bYaw;
      while (headingRel > Math.PI) headingRel -= Math.PI * 2;
      while (headingRel < -Math.PI) headingRel += Math.PI * 2;

      const halfW = 0.92 * vehicleScale;
      const halfL = (r.spec && r.spec.id === 'carriage' ? 2.45 : 1.85) * vehicleScale;
      const orientedExtent = Math.min(0.85, Math.abs(Math.cos(headingRel)) * halfW + Math.abs(Math.sin(headingRel)) * halfL * 0.40);
      const barrierLimit = Math.max(0.95, trackHalfWidth - orientedExtent - 0.10);

      // Frictionless Pinball-Rail Glide & Instant Inward Deflection along Both Dividers!
      if (Math.abs(lookup.latOffset) > barrierLimit) {
        const wallSign = Math.sign(lookup.latOffset); // +1 = Right divider, -1 = Left divider
        const safeLat = wallSign * (barrierLimit - 0.05);
        r.x = curSample.point.x + curSample.horizNormal.x * safeLat;
        r.z = curSample.point.z + curSample.horizNormal.z * safeLat;

        // Retain 99.5% of speed so touching a divider at the end of a straight road glides around the turn!
        r.speed *= 0.995;
        r.slipAngle *= 0.25;

        // Correct Inward Deflection:
        // - At RIGHT divider (wallSign > 0): moving into wall means headingRel < 0 -> clamp headingRel >= +0.12 rad (steering inward left!)
        // - At LEFT divider  (wallSign < 0): moving into wall means headingRel > 0 -> clamp headingRel <= -0.12 rad (steering inward right!)
        const minInwardAngle = 0.12;
        if (wallSign > 0 && headingRel < minInwardAngle) {
          headingRel = minInwardAngle;
          r.yaw = bYaw + headingRel;
          if (r.steerAngle < 0) r.steerAngle = 0;
        } else if (wallSign < 0 && headingRel > -minInwardAngle) {
          headingRel = -minInwardAngle;
          r.yaw = bYaw + headingRel;
          if (r.steerAngle > 0) r.steerAngle = 0;
        }

        if (Math.abs(r.speed) > 4.5 && r.sparkCooldown <= 0) {
          r.sparkCooldown = 0.16;
          if (particleCtrl) particleCtrl.emitSparks(r.x, r.y + 0.12, r.z);
          if (r.isPlayer && audioCtrl) audioCtrl.playSparkPing();
        }
      }

      r.offTrack = false;

      // Smooth 3D elevation, slope pitch & banking roll alignment
      const targetGroundY = lookup.interpY;
      const forwardX = Math.cos(r.yaw);
      const forwardZ = -Math.sin(r.yaw);
      const alongTrack = forwardX * curSample.tangent.x + forwardZ * curSample.tangent.z;
      const splinePitch = Math.asin(Math.max(-0.65, Math.min(0.65, curSample.tangent.y))) * (alongTrack >= 0 ? 1 : -1);

      r.y += (targetGroundY - r.y) * Math.min(1, dt * 26);
      r.pitch += (splinePitch - r.pitch) * Math.min(1, dt * 16);
      const targetRoll = -ctrl.steer * speedRatio * 0.025;
      r.roll += (targetRoll - r.roll) * Math.min(1, dt * 14);

      if (r.drifting && particleCtrl) {
        particleCtrl.emitDriftSmoke(
          r.x - Math.cos(r.yaw) * 0.55 * vehicleScale,
          r.y,
          r.z + Math.sin(r.yaw) * 0.55 * vehicleScale,
          r.yaw
        );
      }

      const isBoosting = r.boostTimer > 0;
      for (let nf = 0; nf < r.nitroFlames.length; nf++) {
        const fg = r.nitroFlames[nf];
        fg.visible = isBoosting;
        if (isBoosting) {
          fg.scale.set(0.85 + Math.sin(nowSec * 45) * 0.28, 1, 1);
        }
      }
      if (isBoosting && particleCtrl) {
        particleCtrl.emitNitroTrail(
          r.x - Math.cos(r.yaw) * 0.75 * vehicleScale,
          r.y + 0.12 * vehicleScale,
          r.z + Math.sin(r.yaw) * 0.75 * vehicleScale
        );
      }

      const isBraking = ctrl.brake > 0 || r.drifting;
      for (let bl = 0; bl < r.brakeLights.length; bl++) {
        r.brakeLights[bl].emissiveIntensity = isBraking ? 2.2 : 0.45;
      }

      // Spring-damper suspension
      const springForce = -st.suspensionStiffness * r.suspOffset - 7.5 * r.suspVel;
      r.suspVel += springForce * dt;
      r.suspOffset += r.suspVel * dt;

      // Boost pad triggers
      for (let i = 0; i < envData.boostPads.length; i++) {
        const bp = envData.boostPads[i];
        if (Math.hypot(r.x - bp.x, r.z - bp.z) < 2.1 && Math.abs(r.y - bp.y) < 1.2) {
          if (r.boostCooldown <= 0) {
            r.boostTimer = 2.2;
            r.boostCooldown = 1.0;
            r.speed = Math.min(effectiveMaxSpeed * 1.18, Math.max(r.speed * 1.18, effectiveMaxSpeed * 0.95));
            if (particleCtrl) particleCtrl.emitBoostBurst(bp.x, bp.y, bp.z);
            if (r.isPlayer && audioCtrl) audioCtrl.playBoostWhoosh();
            if (r.isPlayer && onCameraShake) onCameraShake(0.14);
          }
        }
      }

      // Update Lap & Checkpoint Progress
      const u = lookup.interpU;
      if (r.isPlayer && r.speed > 2.5 && alongTrack < -0.4) {
        r.wrongWayTimer += dt;
        r.wrongWay = r.wrongWayTimer > 0.65;
      } else {
        r.wrongWayTimer = 0;
        r.wrongWay = false;
      }

      for (let cIdx = 0; cIdx < envData.checkpoints.length; cIdx++) {
        const cp = envData.checkpoints[cIdx];
        if (Math.abs(u - cp.u) < 0.08) {
          if (cp.id === 0 || r.checkpointsPassed.has(cp.id - 1)) {
            r.checkpointsPassed.add(cp.id);
          }
        }
      }

      if (r.lastValidU > 0.86 && u < 0.14 && r.checkpointsPassed.size >= 3) {
        const lapDuration = nowSec - r.lapStartTime;
        if (lapDuration > 5.0) {
          if (r.bestLapTime === null || lapDuration < r.bestLapTime) {
            r.bestLapTime = lapDuration;
          }
          r.lapStartTime = nowSec;
          r.checkpointsPassed.clear();
          if (r.lap < 3) {
            r.lap += 1;
            if (r.isPlayer && audioCtrl) audioCtrl.playCountdownBeep(true);
          } else if (!r.finished) {
            r.finished = true;
            r.totalRaceTime = nowSec;
            if (onFinishCallback) onFinishCallback(r);
          }
        }
      }
      r.lastValidU = u;
      r.trackU = u;
      r.currentLapTime = nowSec - r.lapStartTime;
      r.totalProgress = (r.lap - 1) + r.checkpointsPassed.size * 0.2 + u;

      r.mesh.position.set(r.x, Math.max(0.04, r.y + r.suspOffset * vehicleScale), r.z);
      r.mesh.rotation.order = 'YXZ';
      r.mesh.rotation.y = r.yaw + r.slipAngle * 0.32;
      r.mesh.rotation.z = r.pitch;
      r.mesh.rotation.x = r.roll;

      for (let wIdx = 0; wIdx < r.wheels.length; wIdx++) {
        const w = r.wheels[wIdx];
        if (w.children[0]) {
          w.children[0].rotation.x += (r.speed / vehicleScale) * dt * 2.2;
        }
        const isFront = (r.wheels.length === 3) ? (wIdx === 0) : (wIdx < 2);
        if (isFront) {
          w.rotation.y = r.steerAngle * 0.28;
        }
      }

      if (r.extraAnim && r.extraAnim.length > 0) {
        for (let eIdx = 0; eIdx < r.extraAnim.length; eIdx++) {
          const ea = r.extraAnim[eIdx];
          ea.group.position.y = ea.baseY + Math.abs(Math.sin(nowSec * Math.max(2, Math.abs(r.speed) * 1.1) + ea.phase)) * 0.12;
          ea.group.rotation.z = Math.sin(nowSec * Math.max(2, Math.abs(r.speed) * 1.1) + ea.phase) * 0.06;
        }
      }
    }
  }

  return {
    createRacer,
    resetRacer,
    respawnRacer,
    teleportToSector,
    setVehicleScale,
    setTopSpeedMultiplier,
    setAICruise,
    isAICruise: () => aiCruiseEnabled,
    getVehicleScale: () => vehicleScale,
    stepPhysics,
    getClosestTrackSample
  };
};
