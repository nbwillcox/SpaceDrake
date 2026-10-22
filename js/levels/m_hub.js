// Mossgate Meadows hub: Windmill Green. A calm meadow ringed by portals.
import { elder, lantern } from './helpers.js';

const THEME = {
  grass: 0x5fcf72, grass2: 0x86e096, rock: 0x9aa2b5, sand: 0xe6d79b, sandBelow: -0.3,
  sky: [0x3b8fff, 0xc9f0ff], fog: 0xcdf0ff, fogNear: 80, fogFar: 210,
  water: 0x3fb8ff, palette: { leaf: 0x2fae5a, leaf2: 0x46c870, trunk: 0x8a5a33 },
};

const toward = (x, z) => Math.atan2(100 - x, 100 - z);

export default {
  id: 'm_hub', name: 'Windmill Green', world: 'mossgate', kind: 'hub', seed: 21,
  size: 200, theme: THEME, music: 'hub',
  low: { h: 0.4, amp: 0.35, scale: 0.05 },
  liquid: { kind: 'water', y: -0.5 },
  rim: 16, rimH: 16,
  shape(x, z, h) {
    const d = Math.hypot(x - 38, z - 40);
    const t = 1 - Math.min(1, Math.max(0, (d - 9) / 4));
    return h + (-3 - h) * (t * t * (3 - 2 * t));
  },
  nodes: {
    plaza: { x: 100, z: 100, r: 20, h: 0.4 },
    padBrook: { x: 46, z: 100, r: 8, h: 0.5, keepClear: 1 },
    padStones: { x: 66, z: 50, r: 8, h: 0.5, keepClear: 1 },
    padMill: { x: 134, z: 50, r: 8, h: 0.5, keepClear: 1 },
    padQuarry: { x: 154, z: 100, r: 8, h: 0.5, keepClear: 1 },
    padFlight: { x: 134, z: 150, r: 8, h: 0.5, keepClear: 1 },
    padBoss: { x: 66, z: 150, r: 8, h: 0.5, keepClear: 1 },
    padNext: { x: 100, z: 176, r: 8, h: 0.5, keepClear: 1 },
    windHill: { x: 100, z: 38, r: 11, h: 6.5 },
  },
  links: [
    ...['padBrook', 'padStones', 'padMill', 'padQuarry', 'padFlight', 'padBoss', 'padNext'].map((b) => ({ a: 'plaza', b, type: 'ramp', w: 6 })),
    { a: 'plaza', b: 'windHill', type: 'ramp', w: 7 },
  ],
  spawn: 'plaza', spawnOff: [0, 8], spawnYaw: Math.PI,
  entities: (c) => {
    const P = (id, target, label, need, color) => { const [x, z] = c.at(id); return { t: 'portal', x, z, target, label, need, color, yaw: toward(x, z) }; };
    return [
      P('padBrook', 'm1_brookside', 'Brookside', null, 0x6ff58a),
      P('padStones', 'm2_stones', 'Standing Stones', null, 0xb39bff),
      P('padMill', 'm3_mill', 'Clockwork Mill', null, 0xffb35c),
      P('padQuarry', 'm4_quarry', 'Old Quarry', null, 0xff8f8f),
      P('padFlight', 'm5_skylark', 'Skylark Run', { elders: 4 }, 0x6fd8ff),
      P('padBoss', 'm6_golem', 'Moss Golem', { elders: 9 }, 0xff6fb0),
      P('padNext', 'b_hub', 'Brightforge Vale', { done: 'm6_golem' }, 0xffd23e),
      lantern(...c.at('plaza', 90, 14), Math.PI),
      elder(...c.at('windHill', 270, 3), 'This is a hub. Every portal is a new adventure!'),
      elder(38, 52, 'Gems you find stay yours. Come back anytime to get the rest.'),
      { t: 'sunstone', id: 0, ...(() => { const [x, z] = c.at('windHill', 90, 4); return { x, z }; })(), h: 1.4 },
    ];
  },
  decor: (c) => {
    // a little windmill: tower, cap and four blades as static decor-boxes
    return [];
  },
  boxes: (c) => {
    const n = c.node('windHill'), y = n.h;
    const col = 0xe8dcc4;
    return [
      { min: [n.x - 2.6, y - 0.5, n.z - 2.6], max: [n.x + 2.6, y + 7, n.z + 2.6], color: col, edge: 0xb89f78 },
      { min: [n.x - 3.4, y + 7, n.z - 3.4], max: [n.x + 3.4, y + 8.4, n.z + 3.4], color: 0xd1564a, edge: 0x7a2a22 },
      { min: [n.x - 0.3, y + 4, n.z + 2.6], max: [n.x + 0.3, y + 5, n.z + 2.9], color: 0x6a4a2a },
      { min: [n.x - 8, y + 4.6, n.z + 2.9], max: [n.x + 8, y + 5.2, n.z + 3.2], color: 0xf4efe0, edge: 0xb8ad90, hidden: false },
      { min: [n.x - 0.3, y - 3, n.z + 2.9], max: [n.x + 0.3, y + 13, n.z + 3.2], color: 0xf4efe0, edge: 0xb8ad90, hidden: false },
    ];
  },
  fill: [
    { t: 'pile', n: 14, v: 1, where: 'low', count: 6 }, { t: 'pile', n: 5, v: 2, where: 'low', count: 5 }, { t: 'ring', n: 3, v: 1, count: 10, r: 2.4 },
    { t: 'crate', n: 5, gems: [1, 1, 2], where: 'low' }, { t: 'vase', n: 5, gems: [1, 2], where: 'low' },
    { t: 'moth', n: 5 },
  ],
  trails: 1,
  scatter: [
    { k: 'tree', n: 40, where: 'low', solid: 0.7, spacing: 8, maxSlope: 0.22 },
    { k: 'roundtree', n: 30, where: 'low', solid: 0.7, spacing: 8, maxSlope: 0.22 },
    { k: 'tree', n: 70, where: 'any', minH: 14, s0: 1.4, s1: 2.2 },
    { k: 'rock', n: 30, where: 'any', solid: 0.9, spacing: 7 },
    { k: 'flower', n: 320, where: 'low', s0: 0.8, s1: 1.4 },
    { k: 'tuft', n: 300, where: 'any', s0: 0.8, s1: 1.5 },
  ],
};
