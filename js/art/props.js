// Procedural props and creatures (all primitives, flat shaded).
import * as THREE from 'three';
import { T, Bm, ico as kico, sph, cone as kcone, ink, eye as keye, bake } from './kit.js';

const M = (c, o = {}) => new THREE.MeshLambertMaterial(Object.assign({ color: c, flatShading: true }, o));
const B = (c, o = {}) => new THREE.MeshBasicMaterial(Object.assign({ color: c }, o));
const mesh = (g, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); return o; };
const ico = (r, d = 0) => new THREE.IcosahedronGeometry(r, d);

export const GEM_COLORS = { 1: 0xff4d6a, 2: 0x3ee07f, 5: 0x4da6ff, 10: 0xffd23e, 25: 0xd36bff };
export const GEM_TIERS = [25, 10, 5, 2, 1];

// A faceted gem: flat table, flared crown, girdle, pavilion to a point. Six sides so every facet reads clearly.
// Facets are shaded by baked vertex colour (bright crown, mid girdle, deep pavilion, alternating sides) and the
// instance colour tints them. No specular: it only produced stray white streaks. A little emissive keeps it glowing in shade.
function gemGeometry() {
  const pts = [[0, 0.4], [0.12, 0.4], [0.27, 0.26], [0.3, 0.17], [0.3, 0.12], [0.15, -0.1], [0, -0.38]].map(([r, y]) => new THREE.Vector2(r, y));
  let g = new THREE.LatheGeometry(pts, 6);
  g = g.toNonIndexed();
  const pos = g.attributes.position, col = new Float32Array(pos.count * 3), n = new THREE.Vector3(), a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  for (let i = 0; i < pos.count; i += 3) {
    a.fromBufferAttribute(pos, i); b.fromBufferAttribute(pos, i + 1); c.fromBufferAttribute(pos, i + 2);
    n.crossVectors(b.clone().sub(a), c.clone().sub(a)).normalize();
    const cy = (a.y + b.y + c.y) / 3, ang = Math.atan2((a.x + b.x + c.x) / 3, (a.z + b.z + c.z) / 3);
    const side = Math.floor(((ang + Math.PI) / (Math.PI * 2)) * 6 + 0.01) % 2 ? 0.9 : 1.08;
    let k = cy > 0.25 ? 1.35 : cy > 0.1 ? 1.08 : cy > -0.1 ? 0.88 : 0.7;
    k *= side;
    for (let j = 0; j < 3; j++) { col[(i + j) * 3] = k; col[(i + j) * 3 + 1] = k; col[(i + j) * 3 + 2] = k; }
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.computeVertexNormals();
  g.scale(1.15, 1.15, 1.15);
  return g;
}

export function makeGemInstances(count) {
  const g = gemGeometry();
  const m = new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true, vertexColors: true });
  m.onBeforeCompile = (sh) => {
    sh.fragmentShader = sh.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n totalEmissiveRadiance += vColor * 0.5;');
  };
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

export { makeEnemy } from './enemies.js';

// Glowmoth: fuzzy body, antennae, and two scalloped wing pairs with a cool-to-violet edge.
let mothWing = null;
function mothWingGeometry() {
  if (mothWing) return mothWing;
  const root = new THREE.Color(0xe8fdff), mid = new THREE.Color(0x7be8ff), edge = new THREE.Color(0xb48cff);
  const pos = [], col = [];
  const tri = (a, ca, b, cb, c, cc) => { for (const [v, cl] of [[a, ca], [b, cb], [c, cc]]) { pos.push(...v); col.push(cl.r, cl.g, cl.b); } };
  const O = [0, 0, 0.0];
  // forewing: leading edge swept forward, scalloped outer edge
  const fore = [[0.16, 0.01, 0.17], [0.3, 0.02, 0.14], [0.37, 0.02, 0.05], [0.34, 0.0, -0.05], [0.2, 0, -0.04]];
  for (let i = 0; i < fore.length - 1; i++) tri(O, root, fore[i], i % 2 ? edge : mid, fore[i + 1], (i + 1) % 2 ? edge : mid);
  // hindwing: shorter, rounder, tucked behind
  const hind = [[0.2, 0, -0.05], [0.3, 0, -0.14], [0.24, 0, -0.24], [0.12, 0, -0.26], [0.04, 0, -0.14]];
  for (let i = 0; i < hind.length - 1; i++) tri(O, root, hind[i], i % 2 ? mid : edge, hind[i + 1], (i + 1) % 2 ? mid : edge);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  mothWing = g;
  return g;
}

// ---- shared soft glow sprite texture
let _glowTex = null;
function glowTex() {
  if (_glowTex) return _glowTex;
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d'); const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
  _glowTex = new THREE.CanvasTexture(c); return _glowTex;
}
const glowSprite = (color, scale, opacity = 1) => {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity }));
  s.scale.setScalar(scale); return s;
};

export function makeMoth() {
  const g = new THREE.Group();
  const wingMat = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide, transparent: true, opacity: 0.92 });
  const geo = mothWingGeometry();
  const wl = new THREE.Group(), wr = new THREE.Group();
  wl.add(new THREE.Mesh(geo, wingMat));
  const mirror = new THREE.Mesh(geo, wingMat); mirror.scale.x = -1; wr.add(mirror);
  g.add(wl, wr);
  // body, head and antennae merged into one mesh
  const fur = Bm(0xffffff), dark = Bm(0x3a3a66);
  const thorax = mesh(ico(0.07, 1), fur, 0, 0, 0.02); thorax.scale.set(0.9, 0.9, 1.3);
  const head = mesh(ico(0.045, 1), fur, 0, 0.01, 0.13);
  const body = new THREE.Group(); body.add(thorax, head, mesh(ico(0.012, 0), dark, 0.03, 0.03, 0.17), mesh(ico(0.012, 0), dark, -0.03, 0.03, 0.17));
  for (const s of [-1, 1]) { const a = mesh(kcone(0.006, 0.16, 3), dark, 0.05 * s, 0.1, 0.2); a.rotation.set(-0.9, 0, -0.5 * s); body.add(a); }
  g.add(bake(body)); 
  g.userData.wl = wl; g.userData.wr = wr;
  return g;
}

export function makeBolt() { return mesh(ico(0.16, 1), B(0xff5fb0)); }

// Wick: a firefly. The glowing abdomen ("core") and halo are recoloured by the game to show health.
export function makeWick() {
  const g = new THREE.Group();
  const core = mesh(ico(0.1, 2), B(0xffe27a), 0, -0.025, -0.08); core.scale.set(0.95, 0.9, 1.3); g.add(core);
  // dark thorax, head, antennae and legs (merged)
  const shell = T(0x6a5ea0), horn = T(0x4a4078);
  const parts = new THREE.Group();
  const thorax = mesh(kico(0.055, 1), shell, 0, 0.0, 0.05); thorax.scale.set(1, 0.9, 1.1);
  const head = mesh(kico(0.04, 1), shell, 0, 0.005, 0.12);
  parts.add(ink(thorax, 0.12), ink(head, 0.14));
  for (const s of [-1, 1]) {
    parts.add(mesh(sph(0.016, 6, 5), Bm(0xffffff), 0.026 * s, 0.025, 0.15), mesh(sph(0.008, 5, 4), Bm(0x111122), 0.026 * s, 0.025, 0.162));
    const an = mesh(kcone(0.005, 0.12, 3), horn, 0.03 * s, 0.07, 0.17); an.rotation.set(-1.0, 0, -0.45 * s); parts.add(an);
    for (const z of [0.0, 0.05]) { const lg = mesh(kcone(0.005, 0.07, 3), horn, 0.04 * s, -0.045, z); lg.rotation.z = 0.7 * s; parts.add(lg); }
  }
  g.add(bake(parts));
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d'); const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), color: 0xffd860, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  halo.position.z = -0.05; halo.scale.setScalar(0.9); g.add(halo);
  // veined wings that flap about their root (the game rotates wl/wr around z)
  const wingGeo = new THREE.BufferGeometry();
  wingGeo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0.16, 0.1, 0.02, 0.26, 0.06, -0.02, 0.22, 0.0, -0.06, 0.08, -0.01, -0.04], 3));
  wingGeo.setIndex([0, 1, 2, 0, 2, 3, 0, 3, 4]);
  const wm = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, side: THREE.DoubleSide });
  const wl = new THREE.Group(), wr = new THREE.Group();
  wl.position.set(0.03, 0.045, 0.02); wr.position.set(-0.03, 0.045, 0.02);
  wl.add(new THREE.Mesh(wingGeo, wm));
  const mw = new THREE.Mesh(wingGeo, wm); mw.scale.x = -1; wr.add(mw);
  g.add(wl, wr);
  g.userData = { core, halo, wl, wr };
  return g;
}

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

// A stone-and-bronze brazier. Cold: dull coals that pulse faintly. Lit: layered flame, halo and rising embers.
export function makeBrazier() {
  const g = new THREE.Group();
  const stone = M(0x6c6480), stone2 = M(0x857c9c), bronze = M(0xb8793a), gold = M(0xffd36a);
  g.add(mesh(new THREE.CylinderGeometry(0.62, 0.72, 0.22, 8), stone, 0, 0.11, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.44, 0.58, 0.2, 8), stone2, 0, 0.32, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.2, 0.3, 0.75, 8), stone, 0, 0.8, 0));
  g.add(mesh(new THREE.TorusGeometry(0.27, 0.06, 5, 12).rotateX(Math.PI / 2), gold, 0, 0.62, 0));
  g.add(mesh(new THREE.TorusGeometry(0.24, 0.05, 5, 12).rotateX(Math.PI / 2), gold, 0, 1.0, 0));
  // bowl: lathe profile
  const prof = [[0, 0], [0.22, 0.04], [0.42, 0.18], [0.56, 0.38], [0.58, 0.46], [0.5, 0.44], [0.4, 0.3], [0.0, 0.2]].map(([x, y]) => new THREE.Vector2(x, y));
  const bowl = mesh(new THREE.LatheGeometry(prof, 12), M(0x8a5a2c, { side: THREE.DoubleSide }), 0, 1.06, 0); g.add(bowl);
  g.add(mesh(new THREE.TorusGeometry(0.56, 0.055, 6, 18).rotateX(Math.PI / 2), bronze, 0, 1.52, 0));
  for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2; g.add(mesh(new THREE.ConeGeometry(0.07, 0.3, 4), gold, Math.cos(a) * 0.5, 1.64, Math.sin(a) * 0.5)); }
  // coals
  const coalMat = new THREE.MeshBasicMaterial({ color: 0x4a2a22 });
  const coals = new THREE.Group(); coals.position.y = 1.3;
  for (let i = 0; i < 5; i++) { const a = i * 1.3, r = i ? 0.22 : 0; const c = mesh(ico(0.13, 0), coalMat, Math.cos(a) * r, i * 0.01, Math.sin(a) * r); c.scale.y = 0.7; coals.add(c); }
  g.add(coals);
  // "light me" hint ring (cold only)
  const hint = glowSprite(0xff9a4a, 1.5, 0.35); hint.position.y = 1.5; g.add(hint);
  // flame (lit only)
  const fl = new THREE.Group(); fl.position.y = 1.5; fl.visible = false; g.add(fl);
  const fm = (c, o) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false });
  const outer = mesh(new THREE.ConeGeometry(0.42, 1.3, 8), fm(0xff6a1a, 0.7), 0, 0.65, 0), mid = mesh(new THREE.ConeGeometry(0.3, 1.0, 8), fm(0xffa82e, 0.85), 0, 0.5, 0), core = mesh(new THREE.ConeGeometry(0.16, 0.65, 7), fm(0xfff4b0, 0.95), 0, 0.33, 0);
  const tongue = [0, 1, 2].map((i) => { const t = mesh(new THREE.ConeGeometry(0.14, 0.7, 6), fm(0xff8a2a, 0.7), Math.cos(i * 2.1) * 0.22, 0.4, Math.sin(i * 2.1) * 0.22); fl.add(t); return t; });
  fl.add(outer, mid, core);
  const glow = glowSprite(0xffa040, 4.2, 0.65); glow.position.y = 0.6; fl.add(glow);
  const embers = [];
  for (let i = 0; i < 7; i++) { const e = glowSprite(0xffc060, 0.22, 0.9); fl.add(e); embers.push({ s: e, p: Math.random(), x: (Math.random() - 0.5) * 0.7, z: (Math.random() - 0.5) * 0.7, sp: 0.4 + Math.random() * 0.5 }); }
  g.userData.flame = fl; g.userData.cold = coals;
  g.userData.setLit = (on) => { fl.visible = on; hint.visible = !on; coalMat.color.setHex(on ? 0xff5a1a : 0x4a2a22); };
  g.userData.tick = (t, lit) => {
    if (!lit) { const p = 0.5 + Math.sin(t * 2.2) * 0.5; coalMat.color.setRGB(0.3 + p * 0.25, 0.14 + p * 0.06, 0.12); hint.material.opacity = 0.18 + p * 0.3; hint.scale.setScalar(1.3 + p * 0.4); return; }
    const w = (k, sp) => 1 + Math.sin(t * sp + k) * 0.12;
    outer.scale.set(w(0, 11), w(1, 13) * 1.05, w(0, 11)); mid.scale.set(w(2, 14), w(3, 17), w(2, 14)); core.scale.set(w(4, 19), w(5, 21), w(4, 19));
    tongue.forEach((tg, i) => { tg.scale.y = 0.7 + Math.abs(Math.sin(t * 9 + i * 2)) * 0.7; tg.position.y = 0.3 + tg.scale.y * 0.25; });
    fl.rotation.y = t * 0.8; glow.material.opacity = 0.55 + Math.sin(t * 17) * 0.1;
    for (const e of embers) { const f = ((t * e.sp + e.p) % 1); e.s.position.set(e.x * (1 + f), 0.4 + f * 2.2, e.z * (1 + f)); e.s.material.opacity = 0.9 * (1 - f); e.s.scale.setScalar(0.24 * (1 - f * 0.6)); }
  };
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
