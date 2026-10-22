// Procedural props and creatures (all primitives, flat shaded).
import * as THREE from 'three';

const M = (c, o = {}) => new THREE.MeshLambertMaterial(Object.assign({ color: c, flatShading: true }, o));
const B = (c, o = {}) => new THREE.MeshBasicMaterial(Object.assign({ color: c }, o));
const mesh = (g, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); return o; };
const ico = (r, d = 0) => new THREE.IcosahedronGeometry(r, d);

export const GEM_COLORS = { 1: 0xff4d6a, 2: 0x3ee07f, 5: 0x4da6ff, 10: 0xffd23e, 25: 0xd36bff };
export const GEM_TIERS = [25, 10, 5, 2, 1];

export function makeGemInstances(count) {
  const g = new THREE.OctahedronGeometry(0.26, 0); g.scale(1, 1.45, 1);
  const m = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const im = new THREE.InstancedMesh(g, m, count);
  im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  im.frustumCulled = false;
  im.count = 0;
  return im;
}

export function makeCrate() {
  const g = new THREE.Group();
  g.add(mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), M(0xc98a4b), 0, 0.45, 0));
  const frame = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.92, 0.92, 0.92)), new THREE.LineBasicMaterial({ color: 0x6b3f1a }));
  frame.position.y = 0.45; g.add(frame);
  g.add(mesh(new THREE.BoxGeometry(0.96, 0.12, 0.96), M(0x8a5a2b), 0, 0.88, 0));
  g.add(mesh(new THREE.BoxGeometry(0.96, 0.12, 0.96), M(0x8a5a2b), 0, 0.12, 0));
  return g;
}

export function makeVase() {
  const g = new THREE.Group();
  const prof = [[0.0, 0], [0.32, 0.02], [0.46, 0.28], [0.4, 0.6], [0.24, 0.82], [0.3, 0.95], [0.0, 0.95]].map(([x, y]) => new THREE.Vector2(x, y));
  g.add(mesh(new THREE.LatheGeometry(prof, 10), M(0x6f9bff, { side: THREE.DoubleSide })));
  g.add(mesh(new THREE.TorusGeometry(0.33, 0.04, 5, 12), M(0xffd23e), 0, 0.5, 0).rotateX(Math.PI / 2));
  return g;
}

export function makeChest() {
  const g = new THREE.Group();
  g.add(mesh(new THREE.BoxGeometry(1.1, 0.55, 0.7), M(0x7b4a2a), 0, 0.28, 0));
  const lid = new THREE.Group(); lid.position.set(0, 0.56, -0.35); g.add(lid);
  lid.add(mesh(new THREE.CylinderGeometry(0.35, 0.35, 1.1, 8, 1, false, 0, Math.PI).rotateZ(Math.PI / 2).rotateY(0), M(0x8a5530), 0, 0, 0.35));
  g.add(mesh(new THREE.BoxGeometry(0.16, 0.2, 0.06), M(0xffd23e), 0, 0.5, 0.36));
  g.userData.lid = lid;
  return g;
}

export function makeLantern() {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(0.06, 0.09, 1.7, 6), M(0x5b4a6b), 0, 0.85, 0));
  const lamp = mesh(ico(0.24, 1), B(0x6a6f8a), 0, 1.85, 0); g.add(lamp);
  g.add(mesh(new THREE.ConeGeometry(0.3, 0.24, 6), M(0x3a3050), 0, 2.15, 0));
  g.userData.lamp = lamp;
  return g;
}

export function makeElder() {
  const g = new THREE.Group();
  const crystal = new THREE.Group(); g.add(crystal);
  const cm = new THREE.MeshLambertMaterial({ color: 0x8fe9ff, flatShading: true, transparent: true, opacity: 0.78, emissive: 0x2a6f88 });
  const body = mesh(ico(0.55, 1), cm, 0, 0.7, 0); body.scale.set(1, 0.9, 1.3); crystal.add(body);
  crystal.add(mesh(ico(0.34, 1), cm, 0, 1.3, 0.55));
  const horn = mesh(new THREE.ConeGeometry(0.1, 0.4, 5), cm, 0.18, 1.62, 0.5); crystal.add(horn);
  const horn2 = mesh(new THREE.ConeGeometry(0.1, 0.4, 5), cm, -0.18, 1.62, 0.5); crystal.add(horn2);
  const tailc = mesh(new THREE.ConeGeometry(0.28, 1.1, 6), cm, 0, 0.4, -0.95); tailc.rotation.x = -1.3; crystal.add(tailc);
  for (let i = 0; i < 4; i++) { const s = mesh(new THREE.ConeGeometry(0.18, 0.9, 5), cm, Math.cos(i * 1.57) * 0.75, 0.3, Math.sin(i * 1.57) * 0.75); s.rotation.z = Math.cos(i * 1.57) * 0.4; s.rotation.x = -Math.sin(i * 1.57) * 0.4; crystal.add(s); }
  // freed version
  const free = new THREE.Group(); free.visible = false; g.add(free);
  const fm = M(0xffb23e);
  const fb = mesh(ico(0.5, 1), fm, 0, 0.6, 0); fb.scale.set(1, 0.85, 1.25); free.add(fb);
  free.add(mesh(ico(0.32, 1), M(0xffd27a), 0, 1.1, 0.5));
  free.add(mesh(new THREE.ConeGeometry(0.12, 0.35, 5), M(0xffffff), 0.14, 1.4, 0.45), mesh(new THREE.ConeGeometry(0.12, 0.35, 5), M(0xffffff), -0.14, 1.4, 0.45));
  g.userData.crystal = crystal; g.userData.free = free;
  return g;
}

function eyes(parent, y, z, s = 1) {
  for (const x of [-1, 1]) {
    parent.add(mesh(new THREE.SphereGeometry(0.1 * s, 8, 6), B(0xffffff), 0.14 * x * s, y, z));
    parent.add(mesh(new THREE.SphereGeometry(0.055 * s, 6, 5), B(0x15101f), 0.15 * x * s, y, z + 0.07 * s));
  }
}

export function makeEnemy(kind) {
  const g = new THREE.Group();
  const body = new THREE.Group(); g.add(body);
  g.userData.body = body;
  if (kind === 'stroller') {
    const b = mesh(ico(0.42, 1), M(0xd8643a), 0, 0.5, 0); b.scale.set(1, 0.9, 1.1); body.add(b);
    eyes(body, 0.62, 0.34);
    body.add(mesh(new THREE.ConeGeometry(0.09, 0.2, 5), M(0xf1d9a0), 0.2, 0.95, 0), mesh(new THREE.ConeGeometry(0.09, 0.2, 5), M(0xf1d9a0), -0.2, 0.95, 0));
    g.userData.legs = [mesh(ico(0.1), M(0x7a3a20), 0.2, 0.1, 0.1), mesh(ico(0.1), M(0x7a3a20), -0.2, 0.1, 0.1)];
    g.userData.legs.forEach((l) => g.add(l));
  } else if (kind === 'shield') {
    const b = mesh(ico(0.42, 1), M(0x6f5fd0), 0, 0.5, 0); b.scale.set(1, 0.9, 1.1); body.add(b);
    eyes(body, 0.62, 0.34);
    const sh = mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.1, 10).rotateX(Math.PI / 2), M(0xb8c4d8), 0, 0.55, 0.52); body.add(sh);
    sh.add(mesh(ico(0.14), M(0xffd23e), 0, 0, 0.08));
    g.userData.legs = [mesh(ico(0.1), M(0x362c6a), 0.2, 0.1, 0.1), mesh(ico(0.1), M(0x362c6a), -0.2, 0.1, 0.1)];
    g.userData.legs.forEach((l) => g.add(l));
  } else if (kind === 'spiked') {
    const b = mesh(ico(0.42, 1), M(0xb44fd0), 0, 0.5, 0); b.scale.set(1, 0.9, 1.1); body.add(b);
    eyes(body, 0.62, 0.34);
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * 5 - 2.5, sp = mesh(new THREE.ConeGeometry(0.1, 0.38, 5), M(0xf7e36b), Math.sin(a) * 0.34, 0.85 + Math.cos(a) * 0.12, -0.12 - Math.abs(a) * 0.04);
      sp.rotation.z = -a * 0.5; sp.rotation.x = -0.3; body.add(sp);
    }
    g.userData.legs = [mesh(ico(0.1), M(0x5c2470), 0.2, 0.1, 0.1), mesh(ico(0.1), M(0x5c2470), -0.2, 0.1, 0.1)];
    g.userData.legs.forEach((l) => g.add(l));
  } else if (kind === 'hopper') {
    const b = mesh(ico(0.38, 1), M(0x4fcf5a), 0, 0.4, 0); b.scale.set(1.1, 0.85, 1.2); body.add(b);
    for (const x of [-1, 1]) { body.add(mesh(new THREE.SphereGeometry(0.13, 8, 6), B(0xffffff), 0.2 * x, 0.72, 0.18)); body.add(mesh(new THREE.SphereGeometry(0.07, 6, 5), B(0x15101f), 0.2 * x, 0.74, 0.28)); }
    body.add(mesh(ico(0.16), M(0xff6f8e), 0, 0.4, 0.42));
  } else if (kind === 'spitter') {
    g.add(mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.9, 6), M(0x2b8f4d), 0, 0.45, 0));
    const head = new THREE.Group(); head.position.y = 1.0; body.add(head);
    head.add(mesh(ico(0.3, 1), M(0xe0408f)));
    head.add(mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.3, 6).rotateX(Math.PI / 2), M(0x7a1f4a), 0, 0, 0.3));
    eyes(head, 0.1, 0.22, 0.9);
    g.userData.head = head;
  } else if (kind === 'thief') {
    const b = mesh(ico(0.3, 1), M(0x7d8fb5), 0, 0.42, 0); b.scale.set(1, 0.9, 1.15); body.add(b);
    body.add(mesh(new THREE.BoxGeometry(0.62, 0.14, 0.4), M(0x1b1730), 0, 0.55, 0.22));
    eyes(body, 0.56, 0.36, 0.8);
    body.add(mesh(new THREE.ConeGeometry(0.07, 0.22, 4), M(0x7d8fb5), 0.14, 0.82, 0), mesh(new THREE.ConeGeometry(0.07, 0.22, 4), M(0x7d8fb5), -0.14, 0.82, 0));
    const sack = mesh(ico(0.26, 1), M(0xc9a55c), 0, 0.55, -0.34); body.add(sack);
    body.add(mesh(ico(0.12, 0), B(0xffd23e), 0, 0.72, -0.34));
    g.userData.legs = [mesh(ico(0.09), M(0x3f4a66), 0.15, 0.09, 0.1), mesh(ico(0.09), M(0x3f4a66), -0.15, 0.09, 0.1)];
    g.userData.legs.forEach((l) => g.add(l));
  } else if (kind === 'brute') {
    const b = mesh(ico(0.8, 1), M(0x7a5a4a), 0, 0.85, 0); b.scale.set(1.05, 0.95, 1.1); body.add(b);
    eyes(body, 1.05, 0.62, 1.7);
    body.add(mesh(new THREE.ConeGeometry(0.16, 0.5, 5), M(0xe8d6a8), 0.38, 1.6, 0), mesh(new THREE.ConeGeometry(0.16, 0.5, 5), M(0xe8d6a8), -0.38, 1.6, 0));
    g.userData.legs = [mesh(ico(0.2), M(0x3f2c22), 0.4, 0.18, 0.1), mesh(ico(0.2), M(0x3f2c22), -0.4, 0.18, 0.1)];
    g.userData.legs.forEach((l) => g.add(l));
  }
  return g;
}

export function makeMoth() {
  const g = new THREE.Group();
  const m = new THREE.MeshBasicMaterial({ color: 0x8ff7ff, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0.32, 0.12, 0.1, 0.28, 0.0, -0.18], 3));
  const wl = new THREE.Group(), wr = new THREE.Group();
  const a = new THREE.Mesh(geo, m), b = new THREE.Mesh(geo, m); b.scale.x = -1;
  wl.add(a); wr.add(b); g.add(wl, wr);
  g.add(mesh(ico(0.07), B(0xffffff)));
  g.userData.wl = wl; g.userData.wr = wr;
  return g;
}

export function makeBolt() { return mesh(ico(0.16, 1), B(0xff5fb0)); }

export function makeWick() {
  const g = new THREE.Group();
  const core = mesh(ico(0.09, 1), B(0xffe27a)); g.add(core);
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d'); const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), color: 0xffd860, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  halo.scale.setScalar(0.9); g.add(halo);
  const wing = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.1), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, side: THREE.DoubleSide }));
  const wl = wing.clone(); wl.position.set(0.11, 0.05, 0); const wr = wing.clone(); wr.position.set(-0.11, 0.05, 0);
  g.add(wl, wr);
  g.userData = { core, halo, wl, wr };
  return g;
}

// A swirling portal ring with a floating label.
export function makePortal(color, label, sub = '') {
  const g = new THREE.Group();
  const ring = mesh(new THREE.TorusGeometry(1.5, 0.14, 8, 28), B(color)); ring.position.y = 1.9; g.add(ring);
  const disc = mesh(new THREE.CircleGeometry(1.45, 28), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false })); disc.position.y = 1.9; g.add(disc);
  const inner = mesh(new THREE.TorusGeometry(0.9, 0.06, 6, 20), B(0xffffff)); inner.position.y = 1.9; g.add(inner);
  g.add(mesh(new THREE.CylinderGeometry(0.3, 0.45, 0.5, 8), M(0x5b4a78), -1.5, 0.25, 0), mesh(new THREE.CylinderGeometry(0.3, 0.45, 0.5, 8), M(0x5b4a78), 1.5, 0.25, 0));
  const c = document.createElement('canvas'); c.width = 512; c.height = 160;
  const x = c.getContext('2d'); x.textAlign = 'center'; x.fillStyle = '#fff'; x.shadowColor = '#000'; x.shadowBlur = 8;
  x.font = 'bold 54px system-ui, sans-serif'; x.fillText(label, 256, 70);
  if (sub) { x.font = '600 36px system-ui, sans-serif'; x.fillStyle = '#ffe27a'; x.fillText(sub, 256, 124); }
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
  spr.scale.set(4.6, 1.44, 1); spr.position.y = 4.1; g.add(spr);
  g.userData.spin = (t) => { ring.rotation.z = t * 0.8; inner.rotation.z = -t * 1.6; disc.material.opacity = 0.3 + Math.sin(t * 3) * 0.08; };
  g.userData.label = spr;
  return g;
}

export function makeSunstone() {
  const g = new THREE.Group();
  const core = mesh(ico(0.34, 1), B(0xffd23e)); core.scale.set(0.85, 1.2, 0.85); g.add(core);
  const shell = mesh(ico(0.46, 1), new THREE.MeshBasicMaterial({ color: 0xffa23e, transparent: true, opacity: 0.35, wireframe: true })); shell.scale.set(0.85, 1.2, 0.85); g.add(shell);
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d'); const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.4)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), color: 0xffc860, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  halo.scale.setScalar(2.2); g.add(halo);
  g.userData.spin = (t) => { core.rotation.y = t * 2; shell.rotation.y = -t * 1.4; halo.scale.setScalar(2.1 + Math.sin(t * 4) * 0.25); };
  return g;
}

export function makeVent(r, h) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(r * 0.9, r, 0.25, 14), M(0x6f8aa8), 0, 0.12, 0));
  const rings = [];
  for (let i = 0; i < 5; i++) {
    const ring = mesh(new THREE.TorusGeometry(r * 0.8, 0.07, 5, 18).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xbff4ff, transparent: true, opacity: 0.6, depthWrite: false }), 0, 0, 0);
    g.add(ring); rings.push(ring);
  }
  g.userData.spin = (t) => { rings.forEach((rg, i) => { const f = ((t * 0.5 + i / 5) % 1); rg.position.y = 0.3 + f * h; const s = 1 - f * 0.4; rg.scale.set(s, 1, s); rg.material.opacity = 0.7 * (1 - f); }); };
  return g;
}

export function makeSpring() {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(0.62, 0.7, 0.18, 10), M(0x5b4a78), 0, 0.09, 0));
  const top = mesh(new THREE.CylinderGeometry(0.56, 0.56, 0.14, 10), M(0xff6a9b), 0, 0.42, 0); g.add(top);
  const coil = mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.26, 8), M(0xffd23e), 0, 0.26, 0); g.add(coil);
  g.userData.top = top; g.userData.coil = coil;
  return g;
}

export function makeBarrier(w, h, d, by) {
  const g = new THREE.Group();
  const ice = by === 'flame';
  const m = ice ? new THREE.MeshLambertMaterial({ color: 0xaee8ff, flatShading: true, transparent: true, opacity: 0.78, emissive: 0x2a7a9a }) : M(0x9a8f86);
  g.add(mesh(new THREE.BoxGeometry(w, h, d), m, 0, h / 2, 0));
  if (!ice) {
    const rows = Math.max(1, Math.round(h / 0.9));
    for (let i = 1; i < rows; i++) g.add(mesh(new THREE.BoxGeometry(w + 0.04, 0.05, d + 0.04), M(0x5a524c), 0, (h / rows) * i, 0));
    g.add(mesh(new THREE.BoxGeometry(w * 0.5, h * 0.55, d + 0.1), M(0xc9bdb2), 0, h / 2, 0));
  } else {
    g.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d)), new THREE.LineBasicMaterial({ color: 0xffffff })).translateY(h / 2));
  }
  return g;
}

export function makeBrazier() {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(0.1, 0.16, 1.0, 6), M(0x4a3f5f), 0, 0.5, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.42, 0.22, 0.34, 8), M(0x6a5a80), 0, 1.15, 0));
  const flame = mesh(new THREE.ConeGeometry(0.3, 0.7, 7), new THREE.MeshBasicMaterial({ color: 0xff9a3c, transparent: true, opacity: 0.95 }), 0, 1.6, 0); flame.visible = false; g.add(flame);
  const cold = mesh(ico(0.22, 0), M(0x3a3a48), 0, 1.35, 0); g.add(cold);
  g.userData.flame = flame; g.userData.cold = cold;
  return g;
}

export function makeGate(w, h, d) {
  const g = new THREE.Group();
  const bars = Math.max(2, Math.round(Math.max(w, d) / 0.7));
  const along = w >= d;
  for (let i = 0; i <= bars; i++) {
    const t = (i / bars - 0.5) * (along ? w : d);
    g.add(mesh(new THREE.CylinderGeometry(0.07, 0.07, h, 5), M(0x494f66), along ? t : 0, h / 2, along ? 0 : t));
  }
  g.add(mesh(new THREE.BoxGeometry(along ? w : 0.18, 0.14, along ? 0.18 : d), M(0x7f86a5), 0, h - 0.1, 0));
  g.add(mesh(new THREE.BoxGeometry(along ? w : 0.18, 0.14, along ? 0.18 : d), M(0x7f86a5), 0, 0.3, 0));
  return g;
}

export function makeSpikes(w, d) {
  const g = new THREE.Group();
  const nx = Math.max(1, Math.round(w / 0.7)), nz = Math.max(1, Math.round(d / 0.7));
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) g.add(mesh(new THREE.ConeGeometry(0.15, 0.7, 5), M(0xc7cbd9), (i / nx - 0.5 + 0.5 / nx) * w, 0.35, (j / nz - 0.5 + 0.5 / nz) * d));
  return g;
}

// ---- flight course props
export function makeFlightRing(r) {
  const g = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ color: 0x6ff5ff });
  const tor = mesh(new THREE.TorusGeometry(r, 0.22, 8, 36), mat); g.add(tor);
  const disc = mesh(new THREE.CircleGeometry(r, 28), new THREE.MeshBasicMaterial({ color: 0x6ff5ff, transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false })); g.add(disc);
  const inner = mesh(new THREE.TorusGeometry(r * 0.7, 0.07, 6, 28), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 })); g.add(inner);
  g.userData.tick = (t) => { inner.rotation.z = t * 0.9; disc.material.opacity = 0.1 + Math.sin(t * 3) * 0.04; };
  g.userData.hit = () => { mat.color.setHex(0xffd23e); disc.material.color.setHex(0xffd23e); inner.visible = false; };
  g.userData.miss = () => { mat.color.setHex(0x8a8aa0); disc.visible = false; inner.visible = false; };
  return g;
}

export function makeFlightTarget(heavy) {
  const g = new THREE.Group();
  if (!heavy) {
    const body = mesh(ico(0.8, 1), new THREE.MeshLambertMaterial({ color: 0xff7a4a, emissive: 0x662200, flatShading: true }), 0, 0, 0); body.scale.set(1, 1.2, 1); g.add(body);
    const glow = mesh(ico(0.55, 1), B(0xffd36a)); glow.scale.set(1, 1.2, 1); g.add(glow);
    g.add(mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 8), M(0x5b3a1a), 0, 1.05, 0));
    g.add(mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 8), M(0x5b3a1a), 0, -1.05, 0));
  } else {
    g.add(mesh(ico(1.3, 1), M(0x8794ad), 0, 0, 0));
    for (let i = 0; i < 8; i++) { const a = (i / 8) * 6.283; const sp = mesh(new THREE.ConeGeometry(0.2, 0.7, 5), M(0xd8dde8), Math.cos(a) * 1.35, Math.sin(a * 2) * 0.5, Math.sin(a) * 1.35); sp.lookAt(Math.cos(a) * 3, Math.sin(a * 2) * 1.2, Math.sin(a) * 3); sp.rotateX(Math.PI / 2); g.add(sp); }
    g.add(mesh(ico(0.5, 1), B(0xff8a3a), 0, 0, 0.8));
  }
  g.userData.spin = (t) => { g.rotation.y = t * 0.8; };
  return g;
}

export function makeFlightRock(r) {
  const g = new THREE.Group();
  g.add(mesh(ico(r, 1), M(0x8f95a8), 0, 0, 0));
  g.add(mesh(ico(r * 0.55, 0), M(0xb6bccd), r * 0.6, r * 0.3, 0));
  g.add(mesh(new THREE.ConeGeometry(r * 0.45, r * 1.6, 5), M(0xaab0c4), 0, r * 1.1, 0));
  return g;
}

export function makeGust(r, h, dx, dz) {
  const g = new THREE.Group();
  const lines = [];
  const mat = new THREE.MeshBasicMaterial({ color: 0xdff6ff, transparent: true, opacity: 0.5, depthWrite: false, side: THREE.DoubleSide });
  for (let i = 0; i < 14; i++) {
    const l = mesh(new THREE.PlaneGeometry(2.6, 0.08), mat.clone());
    l.rotation.y = Math.atan2(dx, dz) + Math.PI / 2;
    g.add(l); lines.push({ m: l, a: Math.random() * 6.28, rr: Math.random() * r * 0.9, y: Math.random() * h, s: 0.5 + Math.random() });
  }
  g.userData.spin = (t) => { for (const l of lines) { const f = ((t * l.s * 0.35 + l.a) % 1); l.m.position.set(Math.cos(l.a * 7) * l.rr + dx * (f - 0.5) * r * 2, l.y, Math.sin(l.a * 7) * l.rr + dz * (f - 0.5) * r * 2); l.m.material.opacity = 0.5 * Math.sin(f * Math.PI); } };
  return g;
}
