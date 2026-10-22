// Test lab: a movement playground. Every feature the controller must handle has a spot here.
const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const vn = (x, z) => { const h = (a, b) => { let v = (a * 374761393 + b * 668265263) | 0; v = (v ^ (v >>> 13)) * 1274126177; return ((v ^ (v >>> 16)) >>> 0) / 4294967295; };
  const xi = Math.floor(x), zi = Math.floor(z), u = sm(0, 1, x - xi), v = sm(0, 1, z - zi);
  return (h(xi, zi) * (1 - u) + h(xi + 1, zi) * u) * (1 - v) + (h(xi, zi + 1) * (1 - u) + h(xi + 1, zi + 1) * u) * v; };

export default {
  id: 'testlab', name: 'Test Lab',
  n: 128, cs: 1,
  spawn: [64, 0, 90, Math.PI],
  killY: -20,
  theme: { grass: 0x4fc26b, grass2: 0x6ad57e, rock: 0x8a90a6, sand: 0xe3d49a, sandBelow: 0.2, sky: [0x3a8dff, 0xb6e9ff], fog: 0xb6e9ff, fogNear: 60, fogFar: 170 },
  height(x, z) {
    // gentle rolling base
    let h = 2 + (vn(x * 0.07, z * 0.07) - 0.5) * 3 + (vn(x * 0.2, z * 0.2) - 0.5) * 0.6;
    // flat plaza around the spawn
    const dp = Math.hypot(x - 64, z - 90);
    h = h * sm(14, 22, dp) + 2 * (1 - sm(14, 22, dp));
    // 30 degree ramp east
    if (x > 78 && z > 56 && z < 72) h = Math.max(h, 2 + sm(78, 100, x) * 14);
    // steep 65 degree face north of the lab + plateau
    if (z < 28) h = h + sm(24, 27, 28 - z) * 0 + (1 - sm(20, 28, z)) * 9 * 1;
    if (z < 20) h = 11;
    // pond
    const dq = Math.hypot(x - 30, z - 80);
    h -= (1 - sm(5, 12, dq)) * 4;
    // outer wall of hills to keep the player in
    const edge = Math.min(x, z, 128 - x, 128 - z);
    h += (1 - sm(0, 8, edge)) * 8;
    return h;
  },
  boxes: (() => {
    const b = [];
    const box = (x, y, z, w, h, d, color) => b.push({ min: [x, y, z], max: [x + w, y + h, z + d], color: color || 0x9aa3ff });
    // stairs of 0.4 m steps (auto step-up)
    for (let i = 0; i < 6; i++) box(50 + i * 1.6, 0, 70, 1.6, 2 + 0.4 * (i + 1), 4, 0xc5b2ff);
    // jump gauntlet along z=100..: gaps 3, 5, 8, 12, 18 m at 2.6 m high
    let x = 30;
    const gaps = [3, 5, 8, 12, 18];
    box(x, 0, 104, 6, 4.6, 6, 0x7bd9ff); x += 6;
    for (const g of gaps) { x += g; box(x, 0, 104, 6, 4.6, 6, 0x7bd9ff); x += 6; }
    // walls to bump into
    box(70, 0, 40, 10, 8, 2, 0xff9fb4);
    box(84, 0, 40, 2, 3, 12, 0xffd27a);
    // tall tower to test glide
    box(100, 0, 100, 6, 24, 6, 0xb8f08a);
    // low ceiling tunnel
    box(40, 0, 50, 10, 1, 6, 0xd0d0e0); box(40, 3.2, 50, 10, 1.5, 6, 0xd0d0e0);
    return b;
  })(),
};
