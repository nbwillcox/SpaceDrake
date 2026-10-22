// Procedural Cinder: a small teal dragon built from primitives and animated by transforms.
// Local forward = +z, up = +y, feet at y=0. About 0.9 m tall.
import * as THREE from 'three';

const M = (c, o = {}) => new THREE.MeshLambertMaterial(Object.assign({ color: c, flatShading: true }, o));
const mesh = (g, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); return o; };
const ico = (r, d = 1) => new THREE.IcosahedronGeometry(r, d);

export function createDragon() {
  const teal = M(0x14b8a6), tealD = M(0x0d8f84), tealL = M(0x3be0c8), amber = M(0xffb23e), amberD = M(0xe08a1a);
  const white = M(0xffffff, { emissive: 0x222222 }), black = M(0x10222a);
  const wingMat = M(0x2fd9c3, { side: THREE.DoubleSide, transparent: true, opacity: 0.93 });
  const glowMat = new THREE.MeshBasicMaterial({ color: 0xffd36a });

  const root = new THREE.Group();
  const rig = new THREE.Group(); root.add(rig);

  // body
  const body = new THREE.Group(); body.position.y = 0.44; rig.add(body);
  const torso = mesh(ico(0.34), teal); torso.scale.set(1, 0.82, 1.38); body.add(torso);
  const belly = mesh(ico(0.3), amber, 0, -0.1, 0.06); belly.scale.set(0.92, 0.6, 1.25); body.add(belly);

  // neck + head
  const neck = new THREE.Group(); neck.position.set(0, 0.16, 0.34); body.add(neck);
  const head = new THREE.Group(); head.position.set(0, 0.12, 0.12); neck.add(head);
  head.add(mesh(ico(0.26), teal));
  const snout = mesh(ico(0.15), tealL, 0, -0.07, 0.24); snout.scale.set(1, 0.75, 1.3); head.add(snout);
  head.add(mesh(ico(0.03, 0), black, 0.055, 0.01, 0.41), mesh(ico(0.03, 0), black, -0.055, 0.01, 0.41));
  for (const s of [-1, 1]) {
    const eye = mesh(new THREE.SphereGeometry(0.095, 10, 8), white, 0.125 * s, 0.07, 0.17);
    const pup = mesh(new THREE.SphereGeometry(0.052, 8, 6), black, 0.13 * s, 0.075, 0.245);
    head.add(eye, pup);
    const horn = mesh(new THREE.ConeGeometry(0.055, 0.24, 6), amber, 0.12 * s, 0.25, -0.04);
    horn.rotation.x = -0.7; horn.rotation.z = -0.25 * s; head.add(horn);
    const cheek = mesh(ico(0.05, 0), amber, 0.2 * s, -0.04, 0.02); head.add(cheek);
  }
  const jaw = mesh(ico(0.1), tealD, 0, -0.17, 0.2); jaw.scale.set(1, 0.5, 1.3); head.add(jaw);

  // back crest
  const crest = [];
  for (let i = 0; i < 5; i++) {
    const c = mesh(new THREE.ConeGeometry(0.055 - i * 0.004, 0.16 - i * 0.012, 5), amber, 0, 0.33 - i * 0.015, 0.27 - i * 0.14);
    c.rotation.x = -0.3; body.add(c); crest.push(c);
  }

  // legs
  const legs = [];
  const legAt = (x, z) => {
    const hip = new THREE.Group(); hip.position.set(x, -0.1, z); body.add(hip);
    const up = mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.26, 6), teal, 0, -0.12, 0);
    const foot = mesh(ico(0.095, 0), amber, 0, -0.27, 0.05); foot.scale.set(1, 0.6, 1.4);
    hip.add(up, foot); legs.push(hip); return hip;
  };
  legAt(0.18, 0.25); legAt(-0.18, 0.25); legAt(0.18, -0.25); legAt(-0.18, -0.25);

  // wings
  const wings = [];
  const wingGeo = new THREE.BufferGeometry();
  wingGeo.setAttribute('position', new THREE.Float32BufferAttribute([
    0, 0, 0, 0.62, 0.2, -0.1, 0.5, 0.02, -0.34,
    0, 0, 0, 0.5, 0.02, -0.34, 0.22, -0.02, -0.34,
    0, 0, 0, 0.22, -0.02, -0.34, 0.06, 0, -0.26,
  ], 3));
  wingGeo.computeVertexNormals();
  for (const s of [1, -1]) {
    const pivot = new THREE.Group(); pivot.position.set(0.16 * s, 0.22, 0.02); body.add(pivot);
    const w = mesh(wingGeo, wingMat); w.scale.x = s; pivot.add(w);
    const bone = mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.64, 4), amberD, 0.31 * s, 0.1, -0.05);
    bone.rotation.z = Math.PI / 2 - 0.3 * s * -1 * 0 + (s > 0 ? -0.32 : 0.32); pivot.add(bone);
    wings.push(pivot);
  }

  // tail
  const tail = [];
  let parent = body, off = -0.4, rad = 0.17;
  for (let i = 0; i < 5; i++) {
    const seg = new THREE.Group(); seg.position.set(0, i === 0 ? -0.03 : 0, off); parent.add(seg);
    seg.add(mesh(ico(rad), i % 2 ? teal : tealD, 0, 0, -rad * 0.6));
    tail.push(seg); parent = seg; off = -rad * 1.1; rad *= 0.82;
  }
  const tip = mesh(new THREE.ConeGeometry(0.08, 0.26, 6), amber, 0, 0, -0.2); tip.rotation.x = -Math.PI / 2; tail[4].add(tip);
  const tipGlow = mesh(ico(0.07, 0), glowMat, 0, 0, -0.34); tail[4].add(tipGlow);

  const st = { phase: 0, squash: 0, flap: 0, lean: 0, wing: 0, t: 0, bob: 0 };

  function update(dt, p) {
    st.t += dt;
    const sp = Math.hypot(p.vx, p.vz);
    const run = p.onGround && !p.sliding ? Math.min(1, sp / 6) : 0;
    st.phase += dt * (6 + sp * 1.3) * (p.onGround ? 1 : 0.2);
    st.squash += (0 - st.squash) * (1 - Math.exp(-14 * dt));

    // legs
    for (let i = 0; i < 4; i++) {
      const diag = (i === 0 || i === 3) ? 0 : Math.PI;
      let r = Math.sin(st.phase + diag) * 0.9 * run;
      if (!p.onGround) r = p.gliding ? 0.6 : (p.vy > 0 ? -0.5 : 0.5);
      if (p.charging) r = 0.9;
      legs[i].rotation.x += (r - legs[i].rotation.x) * (1 - Math.exp(-18 * dt));
    }
    // body bob + lean
    const bob = p.onGround ? Math.abs(Math.sin(st.phase)) * 0.045 * run : 0;
    const idle = Math.sin(st.t * 2) * 0.012;
    let tl = p.charging ? 0.38 : p.gliding ? 0.2 : !p.onGround ? (p.vy > 2 ? -0.1 : 0.12) : 0.14 * run;
    st.lean += (tl - st.lean) * (1 - Math.exp(-12 * dt));
    body.rotation.x = st.lean;
    body.position.y = 0.44 + bob + idle - st.squash * 0.08;
    body.scale.set(1 + st.squash * 0.15, 1 - st.squash * 0.2, 1 + st.squash * 0.1);
    // roll while turning (visual only): small z tilt from yaw rate
    const yr = (p.yawRate || 0);
    body.rotation.z += ((-yr * 0.04) - body.rotation.z) * (1 - Math.exp(-10 * dt));

    // wings: folded on ground, flap in air, spread to glide
    let wz, wy;
    if (p.gliding) { wz = 0.05 + Math.sin(st.t * 14) * 0.03; wy = 0; }
    else if (!p.onGround) { st.flap += dt * (p.vy > 0 ? 18 : 9); wz = 0.4 + Math.sin(st.flap) * 0.55; wy = 0; }
    else if (p.charging) { wz = -1.4; wy = 0; }
    else { wz = -1.15 + Math.sin(st.t * 3) * 0.04; wy = 0; }
    st.wing += (wz - st.wing) * (1 - Math.exp(-16 * dt));
    wings[0].rotation.z = st.wing; wings[1].rotation.z = -st.wing;
    const spread = p.gliding ? 0 : (p.onGround ? 0.8 : 0.25);
    wings[0].rotation.y = -spread; wings[1].rotation.y = spread;

    // head: look up when flaming, down when charging
    const hp = p.flaming ? -0.45 : p.charging ? 0.4 : (p.vy > 3 ? -0.15 : 0.05);
    head.rotation.x += (hp - head.rotation.x) * (1 - Math.exp(-14 * dt));
    jaw.rotation.x = p.flaming ? 0.5 + Math.sin(st.t * 30) * 0.1 : 0;
    neck.rotation.x = -st.lean * 0.5;

    // tail sway
    for (let i = 0; i < tail.length; i++) {
      const a = Math.sin(st.t * 3 + i * 0.7) * 0.18 + Math.sin(st.phase * 0.5 + i) * 0.14 * run - (yr * 0.05);
      tail[i].rotation.y += (a - tail[i].rotation.y) * (1 - Math.exp(-10 * dt));
      tail[i].rotation.x = p.charging ? -0.12 : (!p.onGround ? 0.1 : 0);
    }
    tipGlow.scale.setScalar(1 + Math.sin(st.t * 9) * 0.2);
    crest.forEach((c, i) => { c.rotation.x = -0.3 + Math.sin(st.t * 4 + i) * 0.05 + st.lean * 0.3; });
  }

  return {
    root, update,
    pulse(type) { if (type === 'land') st.squash = 1; else if (type === 'jump') st.squash = -0.5; },
    snoutWorld(out, yaw) { out.x = Math.sin(yaw) * 0.85; out.z = Math.cos(yaw) * 0.85; out.y = 0.7; },
  };
}
