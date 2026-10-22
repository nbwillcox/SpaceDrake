// Instanced scenery: vertex-coloured merged geometries, one InstancedMesh per kind.
import * as THREE from 'three';

function merge(parts) {
  let total = 0;
  const geos = parts.map(({ g, c, m }) => {
    let geo = g.index ? g.toNonIndexed() : g.clone();
    if (m) geo.applyMatrix4(m);
    geo.computeVertexNormals();
    total += geo.attributes.position.count;
    return { geo, c: new THREE.Color(c) };
  });
  const pos = new Float32Array(total * 3), nor = new Float32Array(total * 3), col = new Float32Array(total * 3);
  let o = 0;
  for (const { geo, c } of geos) {
    const n = geo.attributes.position.count;
    pos.set(geo.attributes.position.array, o * 3); nor.set(geo.attributes.normal.array, o * 3);
    for (let i = 0; i < n; i++) { col[(o + i) * 3] = c.r; col[(o + i) * 3 + 1] = c.g; col[(o + i) * 3 + 2] = c.b; }
    o += n;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return g;
}
const T = (x, y, z) => new THREE.Matrix4().makeTranslation(x, y, z);
const S = (x, y, z) => new THREE.Matrix4().makeScale(x, y, z);
const cone = (r, h, seg = 6) => new THREE.ConeGeometry(r, h, seg);
const cyl = (r0, r1, h, seg = 6) => new THREE.CylinderGeometry(r0, r1, h, seg);
const ico = (r, d = 0) => new THREE.IcosahedronGeometry(r, d);

// Each kind: function(palette) -> merged geometry (base at y=0, ~1 unit scale)
const KINDS = {
  tree(p) {
    return merge([
      { g: cyl(0.16, 0.24, 1.2), c: p.trunk || 0x8a5a33, m: T(0, 0.6, 0) },
      { g: cone(1.15, 1.5, 7), c: p.leaf || 0x2fae5a, m: T(0, 1.9, 0) },
      { g: cone(0.9, 1.3, 7), c: p.leaf2 || 0x3cc46a, m: T(0, 2.7, 0) },
      { g: cone(0.58, 1.0, 7), c: p.leaf || 0x2fae5a, m: T(0, 3.4, 0) },
    ]);
  },
  roundtree(p) {
    return merge([
      { g: cyl(0.18, 0.28, 1.4), c: p.trunk || 0x8a5a33, m: T(0, 0.7, 0) },
      { g: ico(1.15, 1), c: p.leaf || 0x44c46c, m: T(0, 2.2, 0).multiply(S(1, 0.9, 1)) },
      { g: ico(0.7, 1), c: p.leaf2 || 0x66d984, m: T(0.55, 2.6, 0.3) },
    ]);
  },
  rock(p) {
    return merge([
      { g: ico(0.7, 0), c: p.rock || 0x9aa2b5, m: T(0, 0.32, 0).multiply(S(1.2, 0.7, 1)) },
      { g: ico(0.4, 0), c: p.rock2 || 0xb5bccd, m: T(0.5, 0.2, 0.2) },
    ]);
  },
  flower(p) {
    return merge([
      { g: cyl(0.02, 0.025, 0.4, 4), c: 0x3b9b4d, m: T(0, 0.2, 0) },
      { g: ico(0.1, 0), c: p.flower || 0xff7ab8, m: T(0, 0.44, 0) },
      { g: ico(0.05, 0), c: 0xffe27a, m: T(0, 0.52, 0) },
    ]);
  },
  tuft(p) {
    return merge([
      { g: cone(0.09, 0.5, 4), c: p.tuft || 0x62d27b, m: T(0, 0.25, 0) },
      { g: cone(0.08, 0.4, 4), c: p.tuft2 || 0x7ee590, m: T(0.1, 0.2, 0.05) },
      { g: cone(0.08, 0.45, 4), c: p.tuft || 0x62d27b, m: T(-0.08, 0.22, -0.06) },
    ]);
  },
  mushroom(p) {
    return merge([
      { g: cyl(0.12, 0.16, 0.7, 6), c: 0xf3ead0, m: T(0, 0.35, 0) },
      { g: ico(0.5, 1), c: p.cap || 0xff6a9b, m: T(0, 0.8, 0).multiply(S(1, 0.55, 1)) },
      { g: ico(0.1, 0), c: 0xffffff, m: T(0.22, 0.98, 0.1) },
    ]);
  },
  crystal(p) {
    return merge([
      { g: cone(0.28, 1.6, 5), c: p.crystal || 0x7fd8ff, m: T(0, 0.8, 0) },
      { g: cone(0.2, 1.0, 5), c: p.crystal2 || 0xb7a8ff, m: T(0.4, 0.5, 0.1) },
      { g: cone(0.18, 0.8, 5), c: p.crystal || 0x7fd8ff, m: T(-0.3, 0.4, -0.2) },
    ]);
  },
  pillar(p) {
    return merge([
      { g: cyl(0.55, 0.65, 0.4, 8), c: p.stone || 0xb9b6c8, m: T(0, 0.2, 0) },
      { g: cyl(0.4, 0.45, 2.6, 8), c: p.stone2 || 0xd2cfe0, m: T(0, 1.7, 0) },
      { g: cyl(0.55, 0.45, 0.3, 8), c: p.stone || 0xb9b6c8, m: T(0, 3.15, 0) },
    ]);
  },
  lamppost(p) {
    return merge([
      { g: cyl(0.06, 0.09, 2.2, 5), c: 0x3b3355, m: T(0, 1.1, 0) },
      { g: ico(0.22, 1), c: p.lamp || 0xffd36a, m: T(0, 2.3, 0) },
    ]);
  },
};

export function buildDecor(spec, theme) {
  const group = new THREE.Group();
  const byKind = {};
  for (const d of spec.decor) (byKind[d.k] = byKind[d.k] || []).push(d);
  const mat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), pos = new THREE.Vector3(), sc = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  const tints = new THREE.Color();
  for (const [k, list] of Object.entries(byKind)) {
    if (!KINDS[k]) continue;
    const geo = KINDS[k](theme.palette || {});
    const im = new THREE.InstancedMesh(geo, mat, list.length);
    list.forEach((d, i) => {
      q.setFromAxisAngle(up, d.ry); pos.set(d.x, d.y, d.z); sc.set(d.s, d.s * (0.9 + d.v * 0.25), d.s);
      m4.compose(pos, q, sc); im.setMatrixAt(i, m4);
      tints.setScalar(0.85 + d.v * 0.3); im.setColorAt(i, tints);
    });
    im.instanceMatrix.needsUpdate = true;
    group.add(im);
  }
  return group;
}
