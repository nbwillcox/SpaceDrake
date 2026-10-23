// Landmark and building kinds for the decor system (windmill, forge anvil, wind tower, obelisk, clock tower,
// mill house with waterwheel, mine entrance). They receive the decor helpers so there is no import cycle.
export function landmarkKinds(H) {
  const { merge, J, T, S, RY, RZ, RX, mul, cone, cyl, ico, box, shade, THREE } = H;
  const ring = (r, tube, seg = 12) => new THREE.TorusGeometry(r, tube, 5, seg).rotateX(Math.PI / 2);
  const pick = (p, k, d) => (p[k] !== undefined ? p[k] : d);

  return {
    // ---- Mossgate hub: round stone windmill with a thatched cone and four lattice sails
    windmill(p) {
      const wall = 0xe3d8c4, brick = 0xb39a80, roof = 0xa5503c, wood = 0x7a4f2e, glass = 0x2a3550;
      const parts = [
        { g: J(cyl(3.1, 3.4, 0.6, 10), 0.05, 1), c: shade(brick, 0.85), m: T(0, 0.3, 0) },
        { g: J(cyl(2.1, 2.9, 7.4, 10), 0.07, 2), c: wall, m: T(0, 4.2, 0), sh: 0.2 },
      ];
      for (const y of [1.6, 3.7, 5.8]) parts.push({ g: J(cyl(2.55 - (y - 1.6) * 0.1, 2.6 - (y - 1.6) * 0.1, 0.2, 10), 0.03, 4 + y), c: brick, m: T(0, y, 0) });
      parts.push({ g: J(box(1.2, 1.9, 0.35), 0.03, 20), c: wood, m: T(0, 1.55, 2.62) }, { g: box(1.4, 0.18, 0.5), c: shade(brick, 0.8), m: T(0, 2.6, 2.62) });
      for (const [a, y] of [[0.5, 4.3], [-0.5, 4.3], [2.6, 5.2], [-2.6, 5.2]]) parts.push({ g: box(0.5, 0.9, 0.2), c: glass, m: mul(RY(a), T(0, y, 2.35)), sh: 0 });
      parts.push({ g: cyl(2.45, 2.45, 0.14, 10), c: wood, m: T(0, 6.9, 0) });
      parts.push({ g: J(cone(3.0, 3.2, 10), 0.14, 21), c: roof, m: T(0, 9.2, 0), sh: 0.4 }, { g: ico(0.28, 0), c: shade(wood, 0.8), m: T(0, 10.9, 0) });
      parts.push({ g: J(cyl(0.34, 0.34, 1.6, 6), 0.03, 22).rotateX(Math.PI / 2), c: wood, m: T(0, 8.2, 2.4) }, { g: ico(0.46, 1), c: shade(wood, 0.8), m: T(0, 8.2, 3.2) });
      for (let k = 0; k < 4; k++) {
        const a = k * Math.PI / 2 + 0.4, base = mul(T(0, 8.2, 3.35), RZ(a));
        parts.push({ g: box(0.22, 7.2, 0.16), c: wood, m: mul(base, T(0, 3.9, 0)) });
        for (let r = 1.2; r < 7.2; r += 0.9) parts.push({ g: box(1.5, 0.08, 0.1), c: wood, m: mul(base, T(0.75, r, 0.02)) });
        parts.push({ g: box(0.06, 5.6, 0.1), c: wood, m: mul(base, T(1.5, 4.1, 0.02)) }, { g: box(1.34, 5.4, 0.03), c: 0xf4efe0, m: mul(base, T(0.78, 4.0, 0.04)), sh: 0.1 });
      }
      return merge(parts);
    },

    // ---- Brightforge hub: a giant anvil on a stone plinth, a smoking forge chimney and a leaning hammer
    anvil(p) {
      const iron = 0x3a3d4a, iron2 = 0x555a6c, glow = 0xff8a2a, stone = 0x5f5870, brick = 0x6e4a46;
      const parts = [
        { g: J(box(9, 1.2, 6.5), 0.1, 1), c: stone, m: T(0, 0.6, 0) },
        { g: J(box(7.6, 0.6, 5), 0.08, 2), c: shade(stone, 1.12), m: T(0, 1.5, 0) },
        { g: J(box(4.2, 0.8, 2.8), 0.06, 3), c: iron, m: T(0, 2.2, 0) },
        { g: J(cyl(1.0, 1.7, 2.2, 4), 0.06, 4), c: iron, m: mul(T(0, 3.6, 0), RY(Math.PI / 4), S(1.2, 1, 0.8)) },
        { g: J(box(6.0, 1.0, 2.5), 0.07, 5), c: iron2, m: T(0, 5.0, 0) },
        { g: J(cone(1.25, 3.6, 7), 0.08, 6), c: iron2, m: mul(T(4.6, 5.0, 0), RZ(-Math.PI / 2)) },
        { g: J(box(1.4, 0.9, 1.8), 0.06, 7), c: iron2, m: T(-3.3, 4.8, 0) },
        { g: box(2.6, 0.2, 0.55), c: glow, m: T(0.5, 5.6, 0), sh: 0 }, { g: box(1.5, 0.3, 0.7), c: 0xffc24a, m: T(0.9, 5.65, 0), sh: 0 },
        { g: box(0.5, 0.12, 0.5), c: 0x1a1a22, m: T(-1.4, 5.55, 0.4), sh: 0 },
        // chimney
        { g: J(cyl(1.1, 1.7, 11, 8), 0.12, 8), c: brick, m: T(-6.2, 5.5, -1.8), sh: 0.2 },
        { g: cyl(1.45, 1.1, 0.5, 8), c: shade(brick, 0.8), m: T(-6.2, 11.2, -1.8) },
        { g: ico(0.9, 1), c: glow, m: mul(T(-6.2, 11.7, -1.8), S(1, 0.55, 1)), sh: 0 },
        { g: cone(0.8, 2.2, 6), c: 0xffb23a, m: T(-6.2, 12.9, -1.8), sh: 0 },
        // coal bed beside the plinth
        { g: J(cyl(2.0, 2.2, 0.5, 8), 0.1, 9), c: 0x2e2a2a, m: T(5.8, 0.25, 3.6) }, { g: J(ico(1.6, 0), 0.4, 10), c: 0xff6a22, m: mul(T(5.8, 0.55, 3.6), S(1, 0.35, 1)), sh: 0 },
        // hammer leaning on the plinth
        { g: cyl(0.14, 0.14, 4.4, 6), c: 0x7a4f2e, m: mul(T(-3.6, 3.0, 3.9), RZ(-0.28)) }, { g: J(box(1.5, 1.0, 1.0), 0.05, 11), c: iron, m: mul(T(-4.3, 5.0, 3.9), RZ(-0.28)) },
      ];
      return merge(parts);
    },

    // ---- Mistral hub: slim striped tower with an observation deck, anemometer and vane
    windtower(p) {
      const white = 0xf4f6fb, blue = 0x6aa8ff, dblue = 0x3f78d8, gold = 0xffd36a;
      const parts = [
        { g: J(cyl(3.3, 3.7, 0.7, 12), 0.05, 1), c: 0xc8d0e0, m: T(0, 0.35, 0) },
        { g: J(cyl(1.9, 2.8, 9.8, 12), 0.05, 2), c: white, m: T(0, 5.5, 0), sh: 0.2 },
      ];
      for (let i = 0; i < 5; i++) { const y = 1.6 + i * 1.9; parts.push({ g: cyl(2.7 - (y - 1) * 0.088 + 0.04, 2.72 - (y - 1) * 0.088 + 0.04, 0.5, 12), c: i % 2 ? dblue : blue, m: T(0, y, 0) }); }
      parts.push({ g: box(1.3, 2.0, 0.4), c: 0x4a5a8a, m: T(0, 1.2, 2.55) }, { g: cyl(3.5, 3.0, 0.5, 12), c: blue, m: T(0, 10.6, 0) });
      for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; parts.push({ g: cyl(0.06, 0.06, 1.0, 4), c: white, m: T(Math.cos(a) * 3.25, 11.35, Math.sin(a) * 3.25) }); }
      parts.push({ g: ring(3.25, 0.07, 14), c: white, m: T(0, 11.85, 0) });
      parts.push({ g: cyl(1.7, 1.8, 1.9, 12), c: white, m: T(0, 11.7, 0), sh: 0.2 }, { g: cone(2.3, 1.7, 12), c: blue, m: T(0, 13.5, 0) });
      for (let i = 0; i < 4; i++) parts.push({ g: box(0.5, 0.7, 0.2), c: 0x2a3a6a, m: mul(RY(i * Math.PI / 2 + 0.2), T(0, 11.8, 1.72)), sh: 0 });
      parts.push({ g: cyl(0.09, 0.09, 4.4, 5), c: 0x8a96b0, m: T(0, 16.0, 0) });
      for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; parts.push({ g: box(2.2, 0.09, 0.09), c: 0xaab4c8, m: mul(RY(a), T(1.1, 17.4, 0)) }, { g: ico(0.3, 1), c: i === 0 ? gold : blue, m: mul(RY(a), T(2.25, 17.4, 0)) }); }
      parts.push({ g: box(2.0, 0.1, 0.5), c: gold, m: T(0, 15.0, 0) }, { g: cone(0.35, 0.8, 4), c: gold, m: mul(T(1.3, 15.0, 0), RZ(-Math.PI / 2)) });
      return merge(parts);
    },

    // ---- Glimmerdeep hub: stepped runic obelisk crowned with a floating crystal, shards at its feet
    obeliskhub(p) {
      const st = 0x6a6aa0, st2 = 0x8a8ac8, c1 = pick(p, 'crystal', 0x7fd8ff), c2 = pick(p, 'crystal2', 0xff9aff);
      const parts = [
        { g: J(box(9, 0.5, 9), 0.08, 1), c: shade(st, 0.8), m: T(0, 0.25, 0) }, { g: J(box(7, 0.5, 7), 0.07, 2), c: st, m: T(0, 0.75, 0) }, { g: J(box(5.2, 0.5, 5.2), 0.06, 3), c: shade(st, 1.1), m: T(0, 1.25, 0) },
        { g: J(cyl(1.3, 2.1, 9.5, 4), 0.1, 4), c: st2, m: mul(T(0, 6.3, 0), RY(Math.PI / 4)), sh: 0.2 },
        { g: J(cone(1.35, 2.4, 4), 0.1, 5), c: shade(st2, 1.15), m: mul(T(0, 12.2, 0), RY(Math.PI / 4)) },
      ];
      for (const y of [3.0, 5.4, 7.8]) parts.push({ g: cyl(1.5 - (y - 3) * 0.075 + 0.18, 1.55 - (y - 3) * 0.075 + 0.18, 0.18, 4), c: c1, m: mul(T(0, y, 0), RY(Math.PI / 4)), sh: 0 });
      parts.push({ g: J(cone(0.75, 1.9, 5), 0.06, 6), c: c2, m: T(0, 14.6, 0), sh: 0.4 }, { g: J(cone(0.75, 1.5, 5), 0.06, 7), c: c1, m: mul(T(0, 12.9, 0), RX(Math.PI)), sh: 0.4 });
      for (let i = 0; i < 6; i++) { const a = i * 1.05 + 0.3, r = 4.6 + (i % 2) * 0.8; parts.push({ g: J(cone(0.45, 2.2 + (i % 3) * 0.6, 5), 0.05, 10 + i), c: i % 2 ? c1 : c2, m: mul(T(Math.cos(a) * r, 1.1 + (i % 3) * 0.3, Math.sin(a) * r), RZ((i % 2 ? 1 : -1) * 0.25)), sh: 0.4 }); }
      return merge(parts);
    },

    // ---- Duskmarket hub: stone clock tower with a timber-framed middle, lit windows and four clock faces
    clocktower(p) {
      const stone = 0x6a5a7a, plaster = 0xd9ccb8, beam = 0x4a3a30, roof = 0xb04a3a, gold = 0xffd36a, glowc = 0xffd36a;
      const parts = [
        { g: J(box(7.2, 5, 7.2), 0.08, 1), c: stone, m: T(0, 2.5, 0), sh: 0.2 },
        { g: J(box(6.2, 5.4, 6.2), 0.05, 2), c: plaster, m: T(0, 7.7, 0), sh: 0.2 },
        { g: J(box(6.8, 0.5, 6.8), 0.05, 3), c: shade(stone, 0.9), m: T(0, 5.2, 0) },
        { g: J(box(6.6, 4.4, 6.6), 0.07, 4), c: shade(stone, 1.1), m: T(0, 12.4, 0), sh: 0.2 },
        { g: J(box(7.4, 0.5, 7.4), 0.05, 5), c: shade(stone, 0.85), m: T(0, 10.4, 0) }, { g: J(box(7.4, 0.5, 7.4), 0.05, 6), c: shade(stone, 0.85), m: T(0, 14.7, 0) },
        { g: J(cone(5.4, 5.2, 4), 0.1, 7), c: roof, m: mul(T(0, 17.5, 0), RY(Math.PI / 4)), sh: 0.4 },
        { g: cyl(0.09, 0.09, 3.0, 5), c: gold, m: T(0, 21.0, 0) }, { g: ico(0.3, 1), c: gold, m: T(0, 22.6, 0), sh: 0 },
        { g: box(1.4, 2.4, 0.4), c: beam, m: T(0, 1.4, 3.65) }, { g: box(2.4, 0.3, 0.6), c: shade(stone, 0.8), m: T(0, 2.75, 3.65) },
      ];
      for (const x of [-2.9, 0, 2.9]) parts.push({ g: box(0.22, 5.4, 0.22), c: beam, m: T(x, 7.7, 3.12) }, { g: box(0.22, 5.4, 0.22), c: beam, m: T(x, 7.7, -3.12) });
      for (const y of [5.4, 7.7, 10.0]) parts.push({ g: box(6.4, 0.22, 0.24), c: beam, m: T(0, y, 3.13) }, { g: box(6.4, 0.22, 0.24), c: beam, m: T(0, y, -3.13) });
      for (const s of [-1, 1]) parts.push({ g: box(0.26, 6.2, 0.18), c: beam, m: mul(T(s * 1.5, 7.7, 3.14), RZ(s * 0.6)) });
      for (const [x, y] of [[-1.5, 6.6], [1.5, 6.6], [-1.5, 8.8], [1.5, 8.8]]) parts.push({ g: box(0.7, 0.9, 0.18), c: glowc, m: T(x, y, 3.2), sh: 0 }, { g: box(0.7, 0.9, 0.18), c: glowc, m: T(x, y, -3.2), sh: 0 });
      const face = (m) => {
        parts.push({ g: cyl(1.8, 1.8, 0.3, 20).rotateX(Math.PI / 2), c: 0xfff2c8, m: mul(m, T(0, 0, 0.1)), sh: 0 }, { g: ring(1.85, 0.1, 20).rotateX(Math.PI / 2), c: gold, m: mul(m, T(0, 0, 0.26)) });
        for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; parts.push({ g: box(i % 3 ? 0.1 : 0.18, i % 3 ? 0.26 : 0.4, 0.06), c: 0x3a2e3a, m: mul(m, T(Math.sin(a) * 1.5, Math.cos(a) * 1.5, 0.3), RZ(-a)), sh: 0 }); }
        parts.push({ g: box(0.13, 1.25, 0.08), c: 0x2a2030, m: mul(m, T(0.18, 0.5, 0.33), RZ(-0.3)), sh: 0 }, { g: box(0.18, 0.9, 0.08), c: 0x2a2030, m: mul(m, T(-0.3, -0.1, 0.34), RZ(1.9)), sh: 0 });
      };
      face(T(0, 12.4, 3.4)); face(mul(RY(Math.PI), T(0, 12.4, 3.4))); face(mul(RY(Math.PI / 2), T(0, 12.4, 3.4))); face(mul(RY(-Math.PI / 2), T(0, 12.4, 3.4)));
      return merge(parts);
    },

    // ---- Clockwork Mill: timber-and-stone mill house (14 x 8) with a hip roof, chimney and a big waterwheel on the east side
    millhouse(p) {
      const stone = 0x9a8f86, plaster = 0xe4d6bc, beam = 0x5a3e2a, roof = 0x8a4a3a, wood = 0x8a5a33;
      const parts = [
        { g: J(box(14, 2.4, 8), 0.1, 1), c: stone, m: T(0, 1.2, 0), sh: 0.2 }, { g: J(box(13.4, 3.0, 7.4), 0.06, 2), c: plaster, m: T(0, 3.9, 0), sh: 0.2 },
        { g: J(box(14.4, 0.35, 8.4), 0.05, 3), c: beam, m: T(0, 2.5, 0) }, { g: J(box(14.4, 0.35, 8.4), 0.05, 4), c: beam, m: T(0, 5.4, 0) },
        { g: J(cone(1, 1, 4), 0.02, 5), c: roof, m: mul(T(0, 7.1, 0), RY(Math.PI / 4), S(10.6, 3.4, 6.2)), sh: 0.4 },
        { g: J(box(1.4, 4.2, 1.4), 0.05, 6), c: stone, m: T(-4.5, 7.4, 1.2) }, { g: box(1.8, 0.3, 1.8), c: shade(stone, 0.8), m: T(-4.5, 9.6, 1.2) },
        { g: box(1.5, 2.0, 0.3), c: wood, m: T(0, 1.0, 4.1) }, { g: box(2.0, 0.2, 0.5), c: beam, m: T(0, 2.1, 4.1) },
      ];
      for (let i = -3; i <= 3; i++) parts.push({ g: box(0.2, 3.0, 0.14), c: beam, m: T(i * 1.9, 3.9, 3.72) }, { g: box(0.2, 3.0, 0.14), c: beam, m: T(i * 1.9, 3.9, -3.72) });
      for (const x of [-4.2, 4.2]) parts.push({ g: box(1.1, 1.0, 0.16), c: 0xffd36a, m: T(x, 4.0, 3.82), sh: 0 }, { g: box(1.2, 0.1, 0.3), c: beam, m: T(x, 3.4, 3.85) });
      // waterwheel on the east wall: rim rings, spokes, paddles, axle
      const wm = mul(T(8.4, 2.9, 0), RY(Math.PI / 2));
      for (const z of [-0.6, 0.6]) parts.push({ g: new THREE.TorusGeometry(2.7, 0.14, 5, 18), c: wood, m: mul(wm, T(0, 0, z)) });
      for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; parts.push({ g: box(0.16, 5.3, 0.16), c: wood, m: mul(wm, RZ(a)) }, { g: box(0.2, 0.5, 1.5), c: shade(wood, 0.9), m: mul(wm, RZ(a), T(0, 2.75, 0)) }); }
      parts.push({ g: cyl(0.34, 0.34, 2.2, 6).rotateX(Math.PI / 2), c: beam, m: wm }, { g: box(0.4, 0.4, 2.6), c: beam, m: T(7.2, 2.9, 0) });
      parts.push({ g: J(box(1.2, 2.0, 1.6), 0.05, 20), c: stone, m: T(8.4, 1.0, -3.2) });
      return merge(parts);
    },

    // ---- Old Quarry: timber-framed mine mouth with rails, a lantern hook, rock surround and a loaded cart
    mineentrance(p) {
      const wood = 0x7a4f2e, wood2 = 0x5e3c22, iron = 0x3a3d4a, rock = pick(p, 'rock', 0xb8a59a), rock2 = pick(p, 'rock2', 0xd0bdb0);
      const parts = [
        { g: J(box(0.8, 5.6, 0.8), 0.05, 1), c: wood, m: T(-3, 2.8, 0) }, { g: J(box(0.8, 5.6, 0.8), 0.05, 2), c: wood, m: T(3, 2.8, 0) },
        { g: J(box(7.6, 0.8, 0.9), 0.05, 3), c: wood2, m: T(0, 5.7, 0) }, { g: J(box(8.4, 0.5, 1.1), 0.05, 4), c: wood, m: T(0, 6.35, 0) },
        { g: box(0.45, 2.6, 0.4), c: wood2, m: mul(T(-2.2, 4.7, 0), RZ(-0.7)) }, { g: box(0.45, 2.6, 0.4), c: wood2, m: mul(T(2.2, 4.7, 0), RZ(0.7)) },
        { g: box(3.2, 0.9, 0.2), c: 0x6a5238, m: T(0, 6.1, 0.55), sh: 0.2 },
        { g: cyl(0.04, 0.04, 0.7, 4), c: iron, m: T(0, 4.9, 0.2) }, { g: ico(0.28, 1), c: 0xffd36a, m: T(0, 4.35, 0.2), sh: 0 }, { g: box(0.34, 0.34, 0.34), c: iron, m: T(0, 4.35, 0.2), sh: 0 },
        // rock surround
        { g: J(ico(2.3, 0), 1.0, 5), c: rock, m: mul(T(-5.6, 2.2, -0.4), S(1.0, 1.4, 0.9)), sh: 0.5 }, { g: J(ico(2.1, 0), 0.9, 6), c: rock2, m: mul(T(5.6, 1.9, -0.3), S(1.0, 1.3, 0.9)), sh: 0.5 },
        { g: J(ico(2.6, 0), 1.0, 7), c: shade(rock, 0.92), m: mul(T(-2.2, 7.4, -1.2), S(1.5, 0.9, 1.0)), sh: 0.5 }, { g: J(ico(2.4, 0), 1.0, 8), c: rock, m: mul(T(2.8, 7.2, -1.2), S(1.4, 0.9, 1.0)), sh: 0.5 },
        { g: J(ico(1.6, 0), 0.7, 9), c: rock2, m: T(-6.8, 0.9, 1.5), sh: 0.5 },
        // rails and sleepers
        { g: box(0.16, 0.14, 14), c: iron, m: T(-0.7, 0.18, 2.5) }, { g: box(0.16, 0.14, 14), c: iron, m: T(0.7, 0.18, 2.5) },
      ];
      for (let i = 0; i < 10; i++) parts.push({ g: box(2.0, 0.12, 0.35), c: wood2, m: T(0, 0.08, -3.6 + i * 1.5) });
      // cart
      const cm = T(-4.2, 0, 3.4);
      parts.push({ g: box(1.7, 0.9, 1.2), c: 0x6a5238, m: mul(cm, T(0, 0.85, 0)), sh: 0.2 }, { g: box(1.8, 0.14, 1.3), c: iron, m: mul(cm, T(0, 1.3, 0)) });
      for (const [x, z] of [[-0.6, 0.62], [0.6, 0.62], [-0.6, -0.62], [0.6, -0.62]]) parts.push({ g: cyl(0.3, 0.3, 0.12, 8).rotateX(Math.PI / 2), c: iron, m: mul(cm, T(x, 0.32, z)) });
      parts.push({ g: J(ico(0.5, 0), 0.2, 11), c: 0xffd36a, m: mul(cm, T(-0.2, 1.45, 0.1)), sh: 0.5 }, { g: J(ico(0.42, 0), 0.2, 12), c: 0x8a8f9a, m: mul(cm, T(0.35, 1.4, -0.1)), sh: 0.5 }, { g: J(ico(0.3, 0), 0.15, 13), c: 0xff8a8a, m: mul(cm, T(0.1, 1.6, 0.3)), sh: 0.5 });
      // barrels and a pick
      parts.push({ g: cyl(0.42, 0.42, 0.9, 8), c: wood, m: T(4.3, 0.45, 3.0) }, { g: ring(0.43, 0.04, 8), c: iron, m: T(4.3, 0.28, 3.0) }, { g: ring(0.43, 0.04, 8), c: iron, m: T(4.3, 0.7, 3.0) }, { g: cyl(0.42, 0.42, 0.9, 8), c: shade(wood, 0.9), m: T(5.2, 0.45, 2.3) });
      return merge(parts);
    },
  };
}
