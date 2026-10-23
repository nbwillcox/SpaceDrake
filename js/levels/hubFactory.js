// Hub factory: a plaza ringed by up to 8 portal pads, a landmark hill, a pond. Same shape for every world.
import { elder, lantern } from './helpers.js';
import { SCATTER } from './themes.js';

const PADS = ['padA', 'padB', 'padC', 'padD', 'padE', 'padF', 'padG', 'padH'];
const CX = 100, CZ = 100, PR = 56;

function landmark(kind, n, theme) {
  const y = n.h, x = n.x, z = n.z, B = [];
  const box = (x0, y0, z0, x1, y1, z1, color, edge) => B.push({ min: [x + x0, y + y0, z + z0], max: [x + x1, y + y1, z + z1], color, edge: edge || 0x222233 });
  if (kind === 'anvil') {
    box(-4, -0.5, -2.5, 4, 1.4, 2.5, 0x4a4a58, 0xff8a3c); box(-1.8, 1.4, -1.6, 1.8, 3.0, 1.6, 0x56566a, 0xff8a3c); box(-5.5, 3.0, -2.2, 5.5, 4.4, 2.2, 0x3a3a48, 0xffb04a);
    box(-0.6, 4.4, -0.6, 0.6, 12, 0.6, 0x2e2e3a, 0xff6a2a); box(-1.6, 12, -1.6, 1.6, 13, 1.6, 0xff7a2a, 0xffd24a);
  } else if (kind === 'wind') {
    box(-2.6, -0.5, -2.6, 2.6, 6, 2.6, 0xf2f4fa, 0x9aa8c8); box(-3.2, 6, -3.2, 3.2, 7.2, 3.2, 0x6aa8ff, 0x2a5acf);
    box(-0.3, 7.2, -0.3, 0.3, 14, 0.3, 0xe8ecf8, 0x9aa8c8); box(-7, 11.4, -0.2, 7, 12, 0.2, 0xffffff, 0x9aa8c8); box(-0.2, 8, -7, 0.2, 13.6, 7, 0xffffff, 0x9aa8c8);
  } else if (kind === 'obelisk') {
    box(-3.5, -0.5, -3.5, 3.5, 1.5, 3.5, 0x6a6aa0, 0x7fe8ff); box(-2.4, 1.5, -2.4, 2.4, 6, 2.4, 0x7a7ab8, 0x7fe8ff); box(-1.4, 6, -1.4, 1.4, 11, 1.4, 0x8a8ac8, 0xff9aff); box(-0.6, 11, -0.6, 0.6, 14, 0.6, 0xb8f0ff, 0xffffff);
  } else if (kind === 'clock') {
    box(-3, -0.5, -3, 3, 11, 3, 0x6a5a7a, 0xffd36a); box(-4, 11, -4, 4, 12.2, 4, 0x4a3a5a, 0xffd36a); box(-2.4, 12.2, -2.4, 2.4, 14, 2.4, 0x7a6a8a, 0xffd36a); box(-1.4, 14, -1.4, 1.4, 17, 1.4, 0xc4533f, 0x6a2a20);
    box(-1.6, 7, 3, 1.6, 10, 3.3, 0xfff2c0, 0xffd36a);
  } else if (kind === 'gate') {
    // collision for the two stone legs only; the arch itself (decor 'archgate') can be walked through
    for (const sx of [-1, 1]) B.push({ min: [x + sx * 7.2 - 1.3, y - 0.5, z - 1.6], max: [x + sx * 7.2 + 1.3, y + 12, z + 1.6], hidden: true });
  }
  return B;
}

export function makeHub(o) {
  const nodes = { plaza: { x: CX, z: CZ, r: 20, h: 0.4 }, landHill: { x: 100, z: 38, r: 11, h: 6.5 } };
  const links = [{ a: 'plaza', b: 'landHill', type: 'ramp', w: 7 }];
  const pads = [];
  o.portals.forEach((p, i) => {
    const a = Math.PI + (i / 8) * Math.PI * 2 + Math.PI / 8, id = PADS[i];
    nodes[id] = { x: CX + Math.cos(a) * PR, z: CZ + Math.sin(a) * PR, r: 8, h: 0.5, keepClear: 1 };
    links.push({ a: 'plaza', b: id, type: 'ramp', w: 6 });
    pads.push(id);
  });
  // landmark hill sits at the north edge: keep pads away from it (pad angles skip the north)
  return {
    id: o.id, name: o.name, world: o.world, kind: 'hub', seed: o.seed, size: 200, theme: o.theme, music: o.music || 'hub',
    low: { h: 0.4, amp: 0.35, scale: 0.05 }, liquid: o.liquid || { kind: 'water', y: -0.5 }, rim: 16, rimH: 16,
    shape(x, z, h) { const d = Math.hypot(x - 38, z - 40); const t = 1 - Math.min(1, Math.max(0, (d - 9) / 4)); return h + (-3 - h) * (t * t * (3 - 2 * t)); },
    nodes, links, spawn: 'plaza', spawnOff: [0, 8], spawnYaw: Math.PI,
    entities: (c) => {
      const out = [];
      o.portals.forEach((p, i) => { const id = pads[i], n = nodes[id]; out.push({ t: 'portal', x: n.x, z: n.z, target: p.target, label: p.label, need: p.need || null, color: p.color || 0xffc86b, yaw: Math.atan2(CX - n.x, CZ - n.z) }); });
      out.push(lantern(...c.at('plaza', 90, 14), Math.PI));
      out.push(elder(...c.at('landHill', 270, 3), o.tips ? o.tips[0] : 'This is a hub. Every portal is a new adventure!'));
      out.push(elder(38, 52, o.tips ? o.tips[1] : 'Gems you find stay yours. Come back anytime to get the rest.'));
      out.push({ t: 'sunstone', id: 0, x: nodes.landHill.x, z: nodes.landHill.z + 4, h: 1.4 });
      return out;
    },
    boxes: () => landmark(o.landmark, nodes.landHill, o.theme).map((b) => ({ ...b })),
    fill: [
      { t: 'pile', n: 14, v: 1, where: 'any', count: 6 }, { t: 'pile', n: 5, v: 2, where: 'any', count: 5 }, { t: 'ring', n: 3, v: 1, count: 10, r: 2.4 },
      { t: 'crate', n: 5, gems: [1, 1, 2], where: 'any' }, { t: 'vase', n: 5, gems: [1, 2], where: 'any' }, { t: 'moth', n: 5 },
    ],
    decor: o.landmark === 'gate' ? () => [{ k: 'archgate', x: nodes.landHill.x, y: nodes.landHill.h, z: nodes.landHill.z, s: 1.6, ry: 0, v: 0.5 }] : undefined,
    trails: 1, scatter: o.scatter || SCATTER[o.themeKey] || [],
  };
}
