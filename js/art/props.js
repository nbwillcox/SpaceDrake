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
