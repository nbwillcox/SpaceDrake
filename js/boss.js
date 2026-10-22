// Data-driven boss engine. A boss cycles: sleep -> roar -> attacks (telegraphed) -> dizzy (hit it!) -> repeat.
// Each phase lists attacks and how many to chain before the boss gets dizzy. Shield nodes (flame them) can gate the dizzy window.
import * as THREE from 'three';
import * as Props from './art/props.js';

const TAU = Math.PI * 2;
const M = (c, o = {}) => new THREE.MeshLambertMaterial(Object.assign({ color: c, flatShading: true }, o));
const B = (c, o = {}) => new THREE.MeshBasicMaterial(Object.assign({ color: c }, o));
const ico = (r, d = 1) => new THREE.IcosahedronGeometry(r, d);
const mesh = (g, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); return o; };
const rnd = (a, b) => a + Math.random() * (b - a);
const cone = (r, h, s = 6) => new THREE.ConeGeometry(r, h, s);
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const cyl = (a, b, h, s = 8) => new THREE.CylinderGeometry(a, b, h, s);

// ---------------------------------------------------------------- bodies
function buildSmith() {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const iron = M(0x4a4e5e), iron2 = M(0x363a48), glow = B(0xff8a2a);
  const torso = mesh(ico(2.2, 1), iron, 0, 2.7, 0); torso.scale.set(1.2, 1.05, 1); body.add(torso);
  const fur = mesh(ico(0.95, 1), glow, 0, 2.7, 1.8); body.add(fur);
  const halo = mesh(ico(1.35, 1), new THREE.MeshBasicMaterial({ color: 0xff8a2a, transparent: true, opacity: 0.25, depthWrite: false }), 0, 2.7, 1.8); body.add(halo);
  const head = mesh(ico(1.0, 1), iron2, 0, 5.0, 0.4); body.add(head);
  head.add(mesh(box(1.2, 0.22, 0.3), B(0xffc24a), 0, 0.1, 0.88));
  head.add(mesh(cone(0.25, 0.9, 5), M(0xc0c4d4), 0.7, 0.9, -0.1), mesh(cone(0.25, 0.9, 5), M(0xc0c4d4), -0.7, 0.9, -0.1));
  body.add(mesh(cyl(0.35, 0.5, 2.2, 8), iron2, -1.1, 5.3, -1.0));
  const flame = mesh(cone(0.4, 1.0, 6), B(0xffa23a), -1.1, 6.8, -1.0); body.add(flame);
  const arms = [];
  for (const s of [-1, 1]) {
    const sh = new THREE.Group(); sh.position.set(2.6 * s, 3.8, 0); body.add(sh);
    sh.add(mesh(ico(0.95, 1), iron, 0, 0, 0), mesh(cyl(0.45, 0.5, 2.6, 7), iron2, 0.2 * s, -1.4, 0.4));
    if (s > 0) { // hammer
      const h = new THREE.Group(); h.position.set(0.3, -2.7, 0.7); sh.add(h);
      h.add(mesh(cyl(0.18, 0.18, 4.2, 6), M(0x6a4a2a), 0, 1.6, 0), mesh(box(2.4, 1.4, 1.4), iron, 0, 3.6, 0), mesh(box(2.5, 0.25, 1.5), glow, 0, 3.0, 0));
    } else sh.add(mesh(ico(0.8, 1), iron, 0.2, -2.9, 0.7));
    arms.push(sh);
  }
  root.add(mesh(ico(1.1, 1), iron2, -1.3, 0.7, 0), mesh(ico(1.1, 1), iron2, 1.3, 0.7, 0));
  const core = fur;
  return { root, body, head, arms, core, halo, extra: { flame }, animate(b, dt, k, st) { flame.scale.y = 1 + Math.sin(b.t_ * 14) * 0.25; if (st === 'atk') arms[1].rotation.x = -2.5 * k; else if (st !== 'dizzy') arms[1].rotation.x *= 0.9; } };
}

function buildRoc() {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const white = M(0xe8f0ff), blue = M(0x5a86e8), beakM = M(0xffa23a);
  const torso = mesh(ico(1.9, 1), white, 0, 2.2, 0); torso.scale.set(1, 0.9, 1.55); body.add(torso);
  body.add(mesh(ico(1.1, 1), blue, 0, 2.0, -0.6));
  const head = mesh(ico(0.95, 1), white, 0, 3.6, 2.2); body.add(head);
  head.add(mesh(cone(0.38, 1.5, 5), beakM, 0, -0.15, 1.1).rotateX(Math.PI / 2));
  head.add(mesh(ico(0.2, 0), B(0x111122), 0.5, 0.2, 0.6), mesh(ico(0.2, 0), B(0x111122), -0.5, 0.2, 0.6));
  for (let i = 0; i < 3; i++) head.add(mesh(cone(0.18, 0.9, 4), blue, (i - 1) * 0.3, 1.0, -0.2));
  const wings = [];
  for (const s of [-1, 1]) {
    const w = new THREE.Group(); w.position.set(1.4 * s, 2.7, 0); body.add(w);
    for (let i = 0; i < 4; i++) { const f = mesh(box(1.1, 0.12, 4.2 - i * 0.5), i % 2 ? white : blue, 1.1 * s * (i + 0.5) * 1.2, 0, -0.5 - i * 0.2); f.rotation.y = s * i * 0.1; w.add(f); }
    wings.push(w);
  }
  for (let i = 0; i < 5; i++) body.add(mesh(box(0.35, 0.12, 2.6), i % 2 ? white : blue, (i - 2) * 0.5, 2.0, -3.4));
  const core = mesh(ico(0.6, 1), B(0xffe27a), 0, 2.4, 1.9); body.add(core);
  const halo = mesh(ico(0.95, 1), new THREE.MeshBasicMaterial({ color: 0xffe27a, transparent: true, opacity: 0.25, depthWrite: false }), 0, 2.4, 1.9); body.add(halo);
  return { root, body, head, arms: wings, core, halo, animate(b, dt, k, st) { const f = st === 'dizzy' ? 0.2 : Math.sin(b.t_ * 7) * 0.6 + (st === 'atk' ? 0.4 : 0); wings.forEach((w, i) => { w.rotation.z = (i ? -1 : 1) * f; }); } };
}

function buildGlowmaw() {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const teal = M(0x2a6a8a), dark = M(0x1a3a5a), tooth = M(0xf4f4ff), glow = B(0x7ff0ff);
  const torso = mesh(ico(2.7, 1), teal, 0, 2.8, -0.4); torso.scale.set(1.2, 1, 1.4); body.add(torso);
  const jaw = new THREE.Group(); jaw.position.set(0, 1.5, 2.3); body.add(jaw);
  jaw.add(mesh(box(3.6, 0.8, 2.4), dark, 0, -0.3, 0.6));
  for (let i = 0; i < 7; i++) jaw.add(mesh(cone(0.2, 0.9, 4), tooth, (i - 3) * 0.5, 0.35, 1.7));
  const upper = new THREE.Group(); upper.position.set(0, 2.9, 2.3); body.add(upper);
  upper.add(mesh(box(3.6, 0.8, 2.4), dark, 0, 0.3, 0.4));
  for (let i = 0; i < 7; i++) { const t = mesh(cone(0.2, 0.9, 4), tooth, (i - 3) * 0.5, -0.4, 1.5); t.rotation.x = Math.PI; upper.add(t); }
  for (const s of [-1, 1]) { body.add(mesh(ico(0.6, 1), B(0xffe27a), 1.4 * s, 4.2, 1.7), mesh(ico(0.28, 0), B(0x111122), 1.5 * s, 4.2, 2.2)); }
  body.add(mesh(cyl(0.12, 0.2, 3.2, 5), dark, 0, 5.6, 0.9).rotateX(0.7));
  const core = mesh(ico(0.75, 1), glow, 0, 7.0, 2.1); body.add(core);
  const halo = mesh(ico(1.2, 1), new THREE.MeshBasicMaterial({ color: 0x7ff0ff, transparent: true, opacity: 0.25, depthWrite: false }), 0, 7.0, 2.1); body.add(halo);
  for (const s of [-1, 1]) { const fin = mesh(cone(0.9, 3.4, 4), teal, 3.2 * s, 2.6, -0.4); fin.rotation.z = -s * 1.2; body.add(fin); }
  body.add(mesh(cone(1.2, 3.4, 5), teal, 0, 3.2, -4.4).rotateX(-Math.PI / 2));
  return { root, body, head: upper, arms: [jaw], core, halo, animate(b, dt, k, st) { jaw.rotation.x = st === 'dizzy' ? 0.6 : st === 'atk' ? 0.4 * k : 0.05 + Math.sin(b.t_ * 2) * 0.05; core.scale.setScalar(st === 'dizzy' ? 0.4 : 1 + Math.sin(b.t_ * 6) * 0.1); } };
}

function buildQueen() {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const robe = M(0x6a3aa8), robe2 = M(0x8a5ac8), gold = M(0xffd36a), pale = M(0xf0e0ff);
  body.add(mesh(cone(1.8, 4.6, 9), robe, 0, 2.3, 0));
  body.add(mesh(cyl(1.0, 1.4, 1.2, 9), robe2, 0, 4.7, 0), mesh(ico(0.8, 1), pale, 0, 5.8, 0.1));
  const head = body.children[body.children.length - 1];
  head.add(mesh(ico(0.12, 0), B(0x221133), 0.28, 0.1, 0.7), mesh(ico(0.12, 0), B(0x221133), -0.28, 0.1, 0.7));
  const crown = new THREE.Group(); crown.position.set(0, 6.5, 0); body.add(crown);
  for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU; crown.add(mesh(cyl(0.05, 0.05, 0.7, 4), gold, Math.cos(a) * 0.8, 0, Math.sin(a) * 0.8), mesh(ico(0.26, 1), B(0xffd36a), Math.cos(a) * 0.8, 0.55, Math.sin(a) * 0.8)); }
  const arms = [];
  for (const s of [-1, 1]) { const a = new THREE.Group(); a.position.set(1.5 * s, 4.7, 0.2); body.add(a); a.add(mesh(cone(0.55, 2.4, 6), robe2, 0.4 * s, -0.9, 0.5).rotateX(Math.PI)); a.add(mesh(ico(0.35, 0), pale, 0.7 * s, -2.1, 1.0)); arms.push(a); }
  const core = mesh(ico(0.55, 1), B(0xff7af0), 0, 4.2, 1.5); body.add(core);
  const halo = mesh(ico(0.9, 1), new THREE.MeshBasicMaterial({ color: 0xff7af0, transparent: true, opacity: 0.25, depthWrite: false }), 0, 4.2, 1.5); body.add(halo);
  return { root, body, head, arms, core, halo, extra: { crown }, animate(b, dt, k, st) { crown.rotation.y += dt * 1.5; arms.forEach((a, i) => { a.rotation.x = st === 'atk' ? -1.8 * k : Math.sin(b.t_ * 3 + i) * 0.1; }); } };
}

function buildGloam() {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const black = M(0x2a2232), steel = M(0x4a4458), red = B(0xff3a4a);
  const torso = mesh(ico(2.3, 1), black, 0, 3.0, 0); torso.scale.set(1.15, 1.2, 0.95); body.add(torso);
  const chest = mesh(ico(1.3, 1), steel, 0, 3.4, 1.2); chest.scale.set(1.1, 0.9, 0.5); body.add(chest);
  const head = mesh(ico(1.1, 1), steel, 0, 5.8, 0.4); body.add(head);
  head.add(mesh(box(1.3, 0.2, 0.3), red, 0, 0.15, 0.95));
  head.add(mesh(cone(0.3, 1.9, 5), M(0xc4c0d4), 0.9, 0.9, 0).rotateZ(-0.6), mesh(cone(0.3, 1.9, 5), M(0xc4c0d4), -0.9, 0.9, 0).rotateZ(0.6));
  const core = mesh(ico(0.7, 1), red, 0, 3.4, 1.7); body.add(core);
  const halo = mesh(ico(1.1, 1), new THREE.MeshBasicMaterial({ color: 0xff3a4a, transparent: true, opacity: 0.25, depthWrite: false }), 0, 3.4, 1.7); body.add(halo);
  const cape = mesh(new THREE.PlaneGeometry(4.4, 6.0), M(0x5a1a3a, { side: THREE.DoubleSide }), 0, 3.0, -1.5); cape.rotation.x = 0.12; body.add(cape);
  const arms = [];
  for (const s of [-1, 1]) {
    const sh = new THREE.Group(); sh.position.set(2.9 * s, 4.2, 0); body.add(sh);
    sh.add(mesh(ico(1.1, 1), steel, 0, 0, 0), mesh(cone(0.4, 1.4, 5), steel, 0.2 * s, 0.9, 0), mesh(cyl(0.5, 0.55, 2.8, 7), black, 0.2 * s, -1.6, 0.4));
    if (s > 0) { const sw = new THREE.Group(); sw.position.set(0.3, -3.0, 0.9); sh.add(sw); sw.add(mesh(box(0.5, 8, 0.2), M(0xc4c8e0), 0, 3.8, 0), mesh(box(1.6, 0.3, 0.4), M(0x8a5a2a), 0, -0.2, 0), mesh(box(0.14, 7.4, 0.3), red, 0, 3.8, 0)); }
    arms.push(sh);
  }
  root.add(mesh(ico(1.2, 1), black, -1.4, 0.8, 0), mesh(ico(1.2, 1), black, 1.4, 0.8, 0));
  root.scale.setScalar(1.05);
  return { root, body, head, arms, core, halo, animate(b, dt, k, st) { cape.rotation.x = 0.12 + Math.sin(b.t_ * 3) * 0.06; if (st === 'atk') arms[1].rotation.x = -2.3 * k; else if (st !== 'dizzy') arms[1].rotation.x *= 0.9; } };
}

// ---------------------------------------------------------------- configs
export const BOSSES = {
  smith: { name: 'Cinder Smith', hp: 9, r: 3.2, build: buildSmith, hover: 0, minions: 'stroller', gem: 0xff8a2a,
    phases: [{ attacks: ['slam'], chain: 1, dizzy: 4.6 }, { attacks: ['orbs', 'slam', 'puddles'], chain: 2, dizzy: 4.0 }, { attacks: ['puddles', 'slam', 'orbs', 'spin'], chain: 3, dizzy: 3.6 }] },
  roc: { name: 'Storm Roc', hp: 9, r: 2.4, build: buildRoc, hover: 6.5, minions: 'hopper', gem: 0xbfe8ff,
    phases: [{ attacks: ['dash'], chain: 1, dizzy: 4.6 }, { attacks: ['fan', 'dash'], chain: 2, dizzy: 4.0 }, { attacks: ['rocks', 'dash', 'fan'], chain: 3, dizzy: 3.6 }] },
  glowmaw: { name: 'Glowmaw', hp: 9, r: 3.6, build: buildGlowmaw, hover: 0, minions: 'hopper', gem: 0x7ff0ff,
    phases: [{ attacks: ['beam'], chain: 1, dizzy: 4.6 }, { attacks: ['orbs', 'beam'], chain: 2, dizzy: 4.0 }, { attacks: ['summon', 'beam', 'orbs'], chain: 3, dizzy: 3.6 }] },
  queen: { name: 'Lantern Queen', hp: 9, r: 1.9, build: buildQueen, hover: 2.4, minions: 'spiked', gem: 0xff7af0, shield: [3, 4, 5],
    phases: [{ attacks: ['orbs', 'fan'], chain: 99, dizzy: 5.0 }, { attacks: ['fan', 'summon', 'orbs'], chain: 99, dizzy: 4.5 }, { attacks: ['rocks', 'fan', 'orbs', 'summon'], chain: 99, dizzy: 4.2 }] },
  gloam: { name: 'Warlord Gloam', hp: 12, r: 3.3, build: buildGloam, hover: 0, minions: 'shield', gem: 0xff3a4a, final: true,
    phases: [{ attacks: ['slam', 'dash'], chain: 2, dizzy: 4.6 }, { attacks: ['beam', 'rocks', 'slam'], chain: 2, dizzy: 4.2 }, { attacks: ['spin', 'orbs', 'dash', 'summon'], chain: 3, dizzy: 3.8 }, { attacks: ['beam', 'spin', 'rocks', 'dash', 'fan'], chain: 4, dizzy: 3.6 }] },
};

// ---------------------------------------------------------------- engine
export class Boss {
  constructor(game, e, cfg) {
    this.game = game; this.world = game.world; this.cfg = cfg;
    this.kind = 'boss'; this.alive = true; this.drops = [];
    this.arena = e.arena || { x: e.x, z: e.z, r: 24 };
    this.homeX = e.x; this.homeZ = e.z; this.x = e.x; this.z = e.z; this.gy0 = game.gy(e.x, e.z); this.y = this.gy0;
    this.r = cfg.r; this.hpMax = cfg.hp; this.hp = cfg.hp; this.phase = 0;
    this.state = 'sleep'; this.t = 0; this.faceYaw = Math.PI; this.flames = 0; this.flameId = -1; this.hitCool = 0; this.t_ = 0;
    this.chainLeft = 0; this.last = ''; this.atk = null; this.nodes = []; this.zones = []; this.rocks = []; this.wave = null; this.beam = null; this.shield = false;
    this.gemDrops = []; for (const v of e.gems || []) this.gemDrops.push(game._newGem(e.x, this.y + 1, e.z, v, 0));
    this.parts = cfg.build();
    this.root = this.parts.root; this.mesh = this.root;
    game.group.add(this.root);
    this.root.position.set(this.x, this.y + cfg.hover, this.z);
    // effects
    this.shock = mesh(new THREE.TorusGeometry(1, 0.28, 6, 40).rotateX(Math.PI / 2), B(0xffe27a), 0, 0.2, 0); this.shock.visible = false; game.group.add(this.shock);
    this.tel = mesh(new THREE.RingGeometry(0.2, 1, 36).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xff5a3c, transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false }), 0, 0.12, 0); this.tel.visible = false; game.group.add(this.tel);
    this.strip = mesh(box(1, 0.05, 1), new THREE.MeshBasicMaterial({ color: 0xff5a3c, transparent: true, opacity: 0.4, depthWrite: false }), 0, 0.14, 0); this.strip.visible = false; game.group.add(this.strip);
    this.beamMesh = mesh(box(1, 0.5, 0.7), B(0xfff2a0), 0, 0.6, 0); this.beamMesh.visible = false; game.group.add(this.beamMesh);
  }

  get ph() { return this.cfg.phases[this.phase]; }
  setState(s, t) { this.state = s; this.t = t; }

  hitBoss(game) {
    if (this.hitCool > 0 || this.state !== 'dizzy') return;
    this.hitCool = 0.7; this.hp--; this.t = Math.max(this.t, 2.2);
    game.events.push({ type: 'hit', x: this.x, y: this.y + 3, z: this.z }, { type: 'bosshit' });
    if (this.hp <= 0) { this.defeat(game); return; }
    const per = this.hpMax / this.cfg.phases.length, np = Math.min(this.cfg.phases.length - 1, Math.floor((this.hpMax - this.hp) / per));
    if (np !== this.phase) {
      this.phase = np; this.rocks.forEach((r) => { game.group.remove(r.mesh); game.group.remove(r.mark); }); this.rocks.length = 0; this._clearZones();
      game.toast(np === this.cfg.phases.length - 1 ? 'Final phase!' : 'It is getting angry!', 2.5);
      this.setState('roar', 1.6); this.chainLeft = 0; this._minions(game, 2 + np);
    } else game.toast(`${this.hp} hit${this.hp > 1 ? 's' : ''} left!`, 1.3);
  }

  _minions(game, n) {
    for (let i = 0; i < n; i++) { const a = (i / n) * TAU + Math.random(), r = this.arena.r * 0.6; game._spawn({ t: 'enemy', kind: this.cfg.minions, x: this.arena.x + Math.cos(a) * r, z: this.arena.z + Math.sin(a) * r, patrol: 20, drop: [1, 1] }); }
  }

  _clearZones() { for (const z of this.zones) this.game.group.remove(z.mesh); this.zones.length = 0; }

  defeat(game) {
    this.setState('dead', 0); this.t2 = 0;
    game.events.push({ type: 'bossdead', x: this.x, y: this.y + 3, z: this.z });
    game.toast(`${this.cfg.name} is defeated!`, 4);
    for (const g of this.gemDrops) { g.state = 2; g.x = this.x; g.y = this.y + 2; g.z = this.z; g.delay = 0.6; const a = Math.random() * TAU, s = rnd(2, 6); g.vx = Math.cos(a) * s; g.vz = Math.sin(a) * s; g.vy = rnd(6, 11); }
    game.bossDefeated = true; game.boss = null;
    this.shock.visible = this.tel.visible = this.strip.visible = this.beamMesh.visible = false; this._clearZones();
    for (const n of this.nodes) n.mesh.visible = false; this.nodes.length = 0;
    game.pending.push({ at: game.time + 3.5, e: this.cfg.final ? { t: 'ending' } : { t: 'exit', x: this.arena.x, z: this.arena.z + 9 } });
  }

  // ---- attack selection / start
  _next(game, player) {
    const ph = this.ph;
    if (this.chainLeft <= 0) this.chainLeft = ph.chain;
    let pool = ph.attacks.filter((a) => a !== this.last); if (!pool.length) pool = ph.attacks;
    const name = pool[Math.floor(Math.random() * pool.length)];
    this.last = name; this.chainLeft--;
    this.atk = { name, t: 0, data: {} };
    const A = ATK[name]; this.setState('atk', A.tel); this.atk.tel = A.tel;
    if (A.start) A.start(this, game, player);
  }

  _afterAttack(game) {
    this.atk = null;
    if (this.cfg.shield) return this.setState('idle', 0.7); // queen: dizzy only after shield nodes fall
    if (this.chainLeft <= 0) { this.setState('dizzy', this.ph.dizzy); game.toast('Dizzy! Charge it!', 1.8); }
    else this.setState('idle', 0.5);
  }

  _spawnNodes(game) {
    const n = this.cfg.shield[Math.min(this.phase, this.cfg.shield.length - 1)];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU + rnd(0, 1), r = this.arena.r * 0.62, x = this.arena.x + Math.cos(a) * r, z = this.arena.z + Math.sin(a) * r;
      const y = game.gy(x, z) + 1.4, m = Props.makeFlightTarget(false); m.position.set(x, y, z); m.scale.setScalar(0.9); game.group.add(m);
      this.nodes.push({ x, y, z, mesh: m, alive: true });
    }
    this.shield = true; game.toast('Flame the lanterns to break its shield!', 3);
  }

  tick(dt, player, inCone, inCharge, alive) {
    const game = this.game, cfg = this.cfg, parts = this.parts;
    this.t -= dt; this.t_ += dt; this.hitCool = Math.max(0, this.hitCool - dt);
    const dx = player.x - this.x, dz = player.z - this.z, dist = Math.hypot(dx, dz), time = game.time;
    if (this.state !== 'dead') game.boss = { name: cfg.name, hp: this.hp, max: this.hpMax };
    const grounded = this.state === 'dizzy' || this.state === 'sleep' || this.state === 'dead';
    const targetY = this.gy0 + (grounded ? 0 : cfg.hover) + (this.atk && this.atk.lift ? this.atk.lift : 0);
    this.y += (targetY - this.y) * Math.min(1, dt * 4);

    // face the player
    if (['idle', 'roar'].includes(this.state) || (this.state === 'atk' && this.atk && this.atk.face)) {
      const want = Math.atan2(dx, dz); let d = want - this.faceYaw; d = Math.atan2(Math.sin(d), Math.cos(d)); this.faceYaw += d * Math.min(1, dt * 3);
    }
    this.root.rotation.y = this.faceYaw; this.root.position.set(this.x, this.y, this.z);

    // body block + hits
    const fwx = Math.sin(player.yaw), fwz = Math.cos(player.yaw);
    const onSameLevel = Math.abs(player.y - (this.y + (cfg.hover && !grounded ? 1 : 0))) < (cfg.hover && !grounded ? 4.5 : 5);
    if (this.state !== 'dead' && this.state !== 'sleep' && dist < this.r + 0.35 && onSameLevel && !(cfg.hover && !grounded && player.y < this.y - 1.5)) {
      const k = (this.r + 0.35) / (dist || 1); player.x = this.x + dx * k; player.z = this.z + dz * k;
    }
    const facing = (-dx * fwx - dz * fwz) / (dist || 1);
    inCone = player.flameT > 0.04 && facing > 0.55 && dist - this.r < 3.8 && onSameLevel;
    const inBody = dist < this.r + 0.9 && onSameLevel;
    if (this.alive && this.state !== 'dead') {
      if (this.state === 'dizzy') {
        if ((inCharge || player.bumpFlag) && inBody) this.hitBoss(game);
        if (inCone && this.flameId !== player.flameId) { this.flameId = player.flameId; this.flames++; game.events.push({ type: 'hit', x: this.x, y: this.y + 3, z: this.z }); if (this.flames >= 3) { this.flames = 0; this.hitBoss(game); } }
      } else if (inBody && (inCharge || player.bumpFlag) && this.hitCool <= 0) {
        this.hitCool = 0.6; game.events.push({ type: 'clink', x: this.x, y: this.y + 3, z: this.z });
        player.knock(-Math.sin(player.yaw) * 7, -Math.cos(player.yaw) * 7, 5, 0.25);
      } else if (alive && dist < this.r + 0.6 && Math.abs(player.y - this.y) < 2.8 && this.state !== 'roar' && !(cfg.hover && !grounded && player.y < this.y - 2)) game.hurt(player, this.x, this.z, 8);
    }

    // shield nodes (queen): flame to destroy
    if (this.nodes.length) {
      for (const n of this.nodes) {
        if (!n.alive) continue;
        n.mesh.userData.spin && n.mesh.userData.spin(time); n.mesh.position.y = n.y + Math.sin(time * 2 + n.x) * 0.25;
        const ndx = n.x - player.x, ndz = n.z - player.z, nd = Math.hypot(ndx, ndz), nf = (ndx * fwx + ndz * fwz) / (nd || 1);
        if (alive && player.flameT > 0.04 && nf > 0.5 && nd < 4.2 && Math.abs(n.y - player.y) < 3) { n.alive = false; n.mesh.visible = false; game.events.push({ type: 'moth', x: n.x, y: n.y, z: n.z }); }
      }
      if (this.nodes.every((n) => !n.alive) && this.shield) { this.shield = false; this.nodes.length = 0; this.atk = null; this._clearZones(); this.setState('dizzy', this.ph.dizzy); game.toast('Shield down! Charge it!', 2); }
    }

    // state machine
    let k = 0;
    switch (this.state) {
      case 'sleep':
        if (alive && dist < 20) { this.setState('roar', 2.2); game.toast(`${cfg.name} awakens!`, 3); game.events.push({ type: 'roar' }); }
        break;
      case 'roar':
        parts.body.position.y = Math.sin(time * 30) * 0.06; parts.head.rotation.x = -0.4; k = 0.6;
        if (this.t <= 0) { parts.head.rotation.x = 0; if (cfg.shield && !this.nodes.length) this._spawnNodes(game); this.setState('idle', 0.9); }
        break;
      case 'idle':
        parts.body.position.y = Math.sin(time * 2) * 0.08;
        if (this.t <= 0) { if (cfg.shield && !this.shield) this._spawnNodes(game); this._next(game, player); }
        break;
      case 'atk': {
        const A = ATK[this.atk.name]; this.atk.t += dt;
        k = Math.min(1, this.atk.t / Math.max(0.01, this.atk.tel));
        const fin = A.run(this, game, player, dt, alive, k);
        if (fin) { this.tel.visible = false; this.strip.visible = false; this._afterAttack(game); }
        break;
      }
      case 'dizzy':
        parts.body.position.y = -0.5; parts.head.rotation.x = 0.45 + Math.sin(time * 4) * 0.1;
        parts.core.scale.setScalar(1.25 + Math.sin(time * 12) * 0.2); parts.halo.scale.setScalar(1.7 + Math.sin(time * 12) * 0.3);
        if (this.t <= 0) { parts.head.rotation.x = 0; parts.core.scale.setScalar(1); parts.halo.scale.setScalar(1); parts.body.position.y = 0; this.setState('idle', 0.8); this.chainLeft = 0; }
        break;
      case 'dead':
        this.t2 += dt; parts.body.position.y = -this.t2 * 0.5; this.root.scale.setScalar(Math.max(0.01, 1 - this.t2 * 0.18));
        if (Math.random() < dt * 20) game.events.push({ type: 'break', x: this.x + rnd(-2, 2), y: this.y + rnd(1, 4), z: this.z + rnd(-2, 2), kind: 'rock' });
        if (this.t2 > 4.5) { this.root.visible = false; this.alive = false; }
        break;
    }
    parts.animate && parts.animate(this, dt, k, this.state);
    if (this.state !== 'dizzy' && this.state !== 'dead') { parts.core.scale.setScalar(1 + Math.sin(time * 4) * 0.05); parts.halo.scale.setScalar(1); }

    this._updateEffects(dt, player, alive);
  }

  _updateEffects(dt, player, alive) {
    const game = this.game;
    // shockwave ring
    if (this.wave) {
      const w = this.wave; w.r += w.v * dt; this.shock.visible = true;
      this.shock.position.set(w.x, this.gy0 + 0.2, w.z); this.shock.scale.set(w.r, 1, w.r);
      const d = Math.hypot(player.x - w.x, player.z - w.z), gy = game.gy(player.x, player.z, player.y + 0.6);
      if (alive && Math.abs(d - w.r) < 1.1 && player.y < gy + 0.65 && !w.hit) { w.hit = true; game.hurt(player, w.x, w.z, 9); }
      if (w.r > this.arena.r + 4) { this.wave = null; this.shock.visible = false; }
    }
    // boulders
    for (let i = this.rocks.length - 1; i >= 0; i--) {
      const rk = this.rocks[i]; rk.t += dt;
      const kk = Math.min(1, rk.t / rk.fall);
      rk.mark.material.opacity = 0.25 + 0.4 * kk; rk.mark.scale.setScalar(2.6 * (0.5 + 0.5 * kk));
      rk.mesh.position.set(rk.x, rk.gy + 16 * (1 - kk * kk), rk.z); rk.mesh.rotation.x += dt * 4;
      if (kk >= 1) {
        game.events.push({ type: 'break', x: rk.x, y: rk.gy + 0.5, z: rk.z, kind: 'rock' });
        if (alive && Math.hypot(player.x - rk.x, player.z - rk.z) < 2.6 && player.y < rk.gy + 1.6) game.hurt(player, rk.x, rk.z, 8);
        game.group.remove(rk.mesh); game.group.remove(rk.mark); this.rocks.splice(i, 1);
      }
    }
    // hazard puddles
    for (let i = this.zones.length - 1; i >= 0; i--) {
      const z = this.zones[i]; z.t += dt;
      z.mesh.material.opacity = z.t < 1 ? 0.2 + z.t * 0.4 : 0.55 + Math.sin(z.t * 8) * 0.08;
      if (alive && z.t > 1 && Math.hypot(player.x - z.x, player.z - z.z) < z.r && player.y < z.gy + 1.0) game.hurt(player, z.x, z.z, 6);
      if (z.t > z.life) { game.group.remove(z.mesh); this.zones.splice(i, 1); }
    }
    // beam
    if (this.beam) {
      const b = this.beam; b.t += dt;
      const bm = this.beamMesh; bm.visible = b.t > b.tel; this.strip.visible = b.t <= b.tel;
      const len = this.arena.r + 4;
      if (b.t <= b.tel) { b.a = b.a0; this.strip.position.set(this.x + Math.sin(b.a) * len / 2, this.gy0 + 0.14, this.z + Math.cos(b.a) * len / 2); this.strip.scale.set(0.5, 1, len); this.strip.rotation.y = b.a; }
      else {
        b.a = b.a0 + (b.t - b.tel) * b.speed * b.dir;
        bm.position.set(this.x + Math.sin(b.a) * len / 2, this.gy0 + 0.6, this.z + Math.cos(b.a) * len / 2); bm.scale.set(0.7, 1, len); bm.rotation.y = b.a;
        const pdx = player.x - this.x, pdz = player.z - this.z, pd = Math.hypot(pdx, pdz);
        let d = Math.atan2(pdx, pdz) - b.a; d = Math.atan2(Math.sin(d), Math.cos(d));
        const gy = game.gy(player.x, player.z, player.y + 0.6);
        if (alive && Math.abs(d) < 0.1 + 0.8 / Math.max(4, pd) && pd > this.r && pd < len && player.y < gy + 1.05) game.hurt(player, this.x, this.z, 8);
        if (b.t > b.tel + b.dur) { this.beam = null; bm.visible = false; }
      }
    }
  }
}

// ---------------------------------------------------------------- attacks
const rockMark = (boss, game, x, z) => {
  const gy = game.gy(x, z);
  const m = mesh(ico(1.0, 1), M(0x8b919e), x, gy + 16, z); game.group.add(m);
  const mark = mesh(new THREE.RingGeometry(0.4, 1, 24).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xff5a3c, transparent: true, opacity: 0.3, side: THREE.DoubleSide, depthWrite: false }), x, gy + 0.15, z);
  game.group.add(mark); boss.rocks.push({ x, z, gy, t: 0, fall: 1.15, mesh: m, mark });
};
const shoot = (boss, game, player, ang, speed = 8.5, y = 1.6) => {
  const sy = boss.y + (boss.cfg.hover ? 2.4 : 3.4);
  const b = { x: boss.x + Math.sin(ang) * (boss.r + 0.8), y: sy, z: boss.z + Math.cos(ang) * (boss.r + 0.8), life: 4, mesh: Props.makeBolt() };
  const ty = player.y + 0.6, dy = ty - b.y, dh = Math.hypot(player.x - b.x, player.z - b.z) || 1;
  b.vx = Math.sin(ang) * speed; b.vz = Math.cos(ang) * speed; b.vy = (dy / dh) * speed * 0.7;
  b.mesh.position.set(b.x, b.y, b.z); b.mesh.scale.setScalar(1.6); game.group.add(b.mesh); game.bolts.push(b); game.events.push({ type: 'spit', x: b.x, y: b.y, z: b.z });
};

const ATK = {
  slam: { tel: 1.0,
    start(b) { b.atk.face = true; },
    run(b, g, p, dt, alive, k) {
      b.parts.arms.forEach((a) => { a.rotation.x = -2.4 * k * (b.atk.slammed ? 0 : 1); });
      if (!b.atk.slammed) {
        b.tel.visible = true; b.tel.position.set(b.x, b.gy0 + 0.12, b.z); b.tel.scale.setScalar(3.5 + k * 3); b.tel.material.opacity = 0.2 + k * 0.4;
        if (b.atk.t >= b.atk.tel) { b.atk.slammed = true; b.tel.visible = false; b.wave = { x: b.x, z: b.z, r: b.r, v: 9.5 + b.phase * 1.2, hit: false }; g.events.push({ type: 'slam', x: b.x, y: b.gy0, z: b.z }); }
        return false;
      }
      b.parts.arms.forEach((a) => { a.rotation.x += (0.2 - a.rotation.x) * Math.min(1, dt * 8); });
      return !b.wave && b.atk.t > b.atk.tel + 0.6;
    } },
  rocks: { tel: 0.6,
    start(b) { b.atk.count = 3 + b.phase; b.atk.cool = 0; b.atk.face = true; },
    run(b, g, p, dt) {
      b.parts.arms.forEach((a, i) => { a.rotation.x = -2.0 + Math.sin(b.t_ * 10 + i * 3) * 0.3; });
      if (b.atk.t < b.atk.tel) return false;
      b.atk.cool -= dt;
      if (b.atk.count > 0 && b.atk.cool <= 0) { b.atk.cool = 0.6; b.atk.count--; rockMark(b, g, p.x + rnd(-2.5, 2.5), p.z + rnd(-2.5, 2.5)); }
      if (b.atk.count <= 0 && !b.rocks.length) { b.parts.arms.forEach((a) => { a.rotation.x = 0; }); return true; }
      return false;
    } },
  orbs: { tel: 0.9,
    start(b) { b.atk.face = true; b.atk.shots = 3 + (b.phase > 1 ? 2 : 0); b.atk.cool = 0; },
    run(b, g, p, dt, alive, k) {
      if (b.atk.t < b.atk.tel) { b.parts.core.scale.setScalar(1 + k * 0.8); return false; }
      b.atk.cool -= dt;
      if (b.atk.shots > 0 && b.atk.cool <= 0) { b.atk.cool = 0.55; b.atk.shots--; shoot(b, g, p, Math.atan2(p.x - b.x, p.z - b.z)); }
      return b.atk.shots <= 0 && b.atk.t > b.atk.tel + 1.9;
    } },
  fan: { tel: 0.8,
    start(b) { b.atk.face = true; b.atk.volleys = 2; b.atk.cool = 0; },
    run(b, g, p, dt, alive, k) {
      if (b.atk.t < b.atk.tel) { b.parts.core.scale.setScalar(1 + k * 0.6); return false; }
      b.atk.cool -= dt;
      if (b.atk.volleys > 0 && b.atk.cool <= 0) { b.atk.cool = 0.9; b.atk.volleys--; const a0 = Math.atan2(p.x - b.x, p.z - b.z); for (let i = -2; i <= 2; i++) shoot(b, g, p, a0 + i * 0.28, 8); }
      return b.atk.volleys <= 0 && b.atk.t > b.atk.tel + 2.2;
    } },
  dash: { tel: 1.1,
    start(b, g, p) { b.atk.dir = Math.atan2(p.x - b.x, p.z - b.z); b.atk.face = false; b.faceYaw = b.atk.dir; b.atk.lift = -b.cfg.hover * 0.55; b.atk.sx = b.x; b.atk.sz = b.z; b.atk.go = false; },
    run(b, g, p, dt, alive, k) {
      const a = b.atk, len = b.arena.r * 1.9;
      if (!a.go) {
        b.strip.visible = true; b.strip.position.set(b.x + Math.sin(a.dir) * len / 2, b.gy0 + 0.14, b.z + Math.cos(a.dir) * len / 2); b.strip.scale.set(b.r * 1.6, 1, len); b.strip.rotation.y = a.dir; b.strip.material.opacity = 0.15 + k * 0.4;
        b.parts.body.rotation.x = 0.35 * k;
        if (a.t >= a.tel) { a.go = true; b.strip.visible = false; g.events.push({ type: 'roar' }); }
        return false;
      }
      const sp = 17;
      b.x += Math.sin(a.dir) * sp * dt; b.z += Math.cos(a.dir) * sp * dt;
      const ad = Math.hypot(b.x - b.arena.x, b.z - b.arena.z);
      let hitWall = false;
      if (ad > b.arena.r - b.r * 0.6) { const kx = (b.arena.r - b.r * 0.6) / ad; b.x = b.arena.x + (b.x - b.arena.x) * kx; b.z = b.arena.z + (b.z - b.arena.z) * kx; hitWall = true; }
      if (hitWall || Math.hypot(b.x - a.sx, b.z - a.sz) > len) {
        b.parts.body.rotation.x = 0; b.atk.lift = 0;
        if (hitWall) { g.events.push({ type: 'slam', x: b.x, y: b.gy0, z: b.z }); b.chainLeft = 0; b.hitCool = 0.4; }
        return true;
      }
      return false;
    } },
  beam: { tel: 1.3,
    start(b, g, p) { b.atk.face = false; const a0 = Math.atan2(p.x - b.x, p.z - b.z); b.beam = { t: 0, tel: 1.3, dur: 3.2, a0: a0 - 0.9 * (Math.random() < 0.5 ? 1 : -1) * 0, speed: 0.85 + b.phase * 0.1, dir: Math.random() < 0.5 ? 1 : -1 }; b.beam.a0 = a0 - b.beam.dir * 0.6; },
    run(b, g, p, dt, alive, k) { return !b.beam; } },
  summon: { tel: 1.0,
    start(b) { b.atk.face = true; },
    run(b, g, p, dt, alive, k) {
      b.parts.arms.forEach((a, i) => { a.rotation.x = -1.4 * k; });
      if (b.atk.t >= b.atk.tel && !b.atk.done) { b.atk.done = true; b._minions(g, 2 + Math.min(2, b.phase)); g.events.push({ type: 'roar' }); }
      return b.atk.t > b.atk.tel + 1.0;
    } },
  puddles: { tel: 0.9,
    start(b) { b.atk.face = true; },
    run(b, g, p, dt, alive, k) {
      b.parts.arms.forEach((a) => { a.rotation.x = -1.5 * k; });
      if (b.atk.t >= b.atk.tel && !b.atk.done) {
        b.atk.done = true;
        for (let i = 0; i < 4 + b.phase; i++) {
          const x = p.x + rnd(-7, 7), z = p.z + rnd(-7, 7), gy = g.gy(x, z), r = 2.4;
          const dm = mesh(new THREE.CircleGeometry(r, 20).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xff6a2a, transparent: true, opacity: 0.2, depthWrite: false }), x, gy + 0.14, z); g.group.add(dm);
          b.zones.push({ x, z, r, gy, t: 0, life: 5, mesh: dm });
        }
      }
      return b.atk.t > b.atk.tel + 0.8;
    } },
  spin: { tel: 0.8,
    start(b) { b.atk.face = false; b.atk.a = b.faceYaw; },
    run(b, g, p, dt, alive, k) {
      const a = b.atk;
      if (a.t < a.tel) { b.tel.visible = true; b.tel.position.set(b.x, b.gy0 + 0.1, b.z); b.tel.scale.setScalar(7.6); b.tel.material.opacity = 0.15 + k * 0.25; return false; }
      a.a += dt * 3.4; b.faceYaw = a.a; b.parts.arms.forEach((ar, i) => { ar.rotation.z = (i ? -1 : 1) * 1.45; });
      const dx = p.x - b.x, dz = p.z - b.z, d = Math.hypot(dx, dz), pa = Math.atan2(dx, dz);
      if (alive && Math.abs(p.y - b.gy0) < 1.6) for (const off of [Math.PI / 2, -Math.PI / 2]) { let da = pa - (a.a + off); da = Math.atan2(Math.sin(da), Math.cos(da)); if (Math.abs(da) < 0.34 && d > 2 && d < 7.6) g.hurt(p, b.x, b.z, 9); }
      if (a.t > a.tel + 2.8) { b.parts.arms.forEach((ar) => { ar.rotation.z = 0; }); b.tel.visible = false; b.chainLeft = 0; return true; }
      return false;
    } },
};
