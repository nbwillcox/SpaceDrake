// Level validator: node tools/validate.js [levelId ...]
// Static checks (slopes, reachability of every placed item) + dynamic checks (the real controller,
// driven by the bot, crosses every gap/bridge link and walks the full route to the exit).
import { LEVELS } from '../js/levels/index.js';
import { buildSpec, nodeRadius, LIMITS } from '../js/levelgen.js';
import { makeWorld, flood } from '../js/levelfill.js';
import { Player } from '../js/controller.js';
import { Bot } from '../js/bot.js';

const DT = 1 / 120;
const ids = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(LEVELS);
let bad = 0;
const fail = (id, msg) => { bad++; console.log(`  FAIL ${msg}`); };

function applyVents(world, spec, p) {
  for (const e of spec.entities) {
    if (e.t !== 'vent') continue;
    const by = world.groundAt(e.x, e.z, 999, 0, {}).y;
    if (Math.hypot(p.x - e.x, p.z - e.z) < e.r && p.y > by - 0.5 && p.y < by + e.h) p.updraft = e.power * Math.min(1, (by + e.h - p.y) / 2.5);
  }
}

// bounce off a spring then glide to node B
function springHop(world, spec, from, to, link) {
  const A = spec.nodes[from], B = spec.nodes[to], sp = link.spring;
  const p = new Player(world, A.x, world.sample(A.x, A.z).h + 0.1, A.z, 0);
  for (let i = 0; i < 40; i++) p.step(DT, { mx: 0, mz: 0 });
  const bot = new Bot(world, p);
  const by = world.groundAt(sp.x, sp.z, 999, 0, {}).y;
  let t = 0, phase = 0;
  while (t < 40) {
    world.updateBoxes(DT);
    let inp;
    if (phase === 0) {
      inp = bot.think(DT, sp.x, sp.z, 'walk', 0);
      if (Math.hypot(p.x - sp.x, p.z - sp.z) < 0.7 && p.y <= by + 0.9 && p.vy <= 2) { p.bounce(sp.power || 21); phase = 1; bot.hasJumped = true; }
    } else {
      inp = bot.think(DT, B.x, B.z, 'gap', B.h);
      inp.jumpHeld = true;
    }
    p.step(DT, inp); t += DT;
    if (p.dead) return { ok: false, why: 'fell', t, x: p.x, z: p.z };
    if (phase === 1 && Math.hypot(p.x - B.x, p.z - B.z) < 1.8 && p.onGround && Math.abs(p.y - B.h) < 1.3) return { ok: true, t };
  }
  return { ok: false, why: 'timeout', t, x: p.x, z: p.z };
}

// ride a vent column from node A up to node B
function ventHop(world, spec, from, to, link) {
  const A = spec.nodes[from], B = spec.nodes[to], v = link.vent;
  const p = new Player(world, A.x, world.sample(A.x, A.z).h + 0.1, A.z, 0);
  for (let i = 0; i < 40; i++) p.step(DT, { mx: 0, mz: 0 });
  const bot = new Bot(world, p);
  let t = 0, phase = 0;
  while (t < 40) {
    world.updateBoxes(DT);
    applyVents(world, spec, p);
    let inp;
    if (phase === 0) {
      inp = bot.think(DT, v.x, v.z, 'walk', 0);
      if (Math.hypot(p.x - v.x, p.z - v.z) < 0.8) phase = 1;
    } else if (phase === 1) {
      inp = { mx: (v.x - p.x) * 0.5, mz: (v.z - p.z) * 0.5, jumpPressed: false, jumpHeld: true };
      if (p.y > B.h + 1.2) { phase = 2; bot.hasJumped = true; }
    } else {
      inp = bot.think(DT, B.x, B.z, 'gap', B.h);
    }
    p.step(DT, inp); t += DT;
    if (p.dead) return { ok: false, why: 'fell', t, x: p.x, z: p.z };
    if (phase === 2 && Math.hypot(p.x - B.x, p.z - B.z) < 1.8 && p.onGround && Math.abs(p.y - B.h) < 1.3) return { ok: true, t };
  }
  return { ok: false, why: 'timeout', t, x: p.x, z: p.z };
}

function hop(world, spec, from, to, link, mode) {
  const A = spec.nodes[from], B = spec.nodes[to];
  const p = new Player(world, A.x, world.sample(A.x, A.z).h + 0.1, A.z, 0);
  return runBot(world, p, [[B.x, B.z, B.h]], mode, link ? 35 : 40, from, A, B);
}

function runBot(world, p, targets, mode, maxT, from, A, B) {
  const bot = new Bot(world, p);
  let t = 0, ti = 0, lastD = 1e9, stall = 0;
  const dx0 = B.x - A.x, dz0 = B.z - A.z, l0 = Math.hypot(dx0, dz0);
  // for gaps start at the edge of A so the test is about the gap, not the run-up
  if (mode !== 'walk') {
    const e = nodeRadius(A) * 0.85;
    p.x = A.x + dx0 / l0 * e; p.z = A.z + dz0 / l0 * e; p.y = world.sample(p.x, p.z).h + 0.05;
    p.yaw = Math.atan2(dx0, dz0);
    for (let i = 0; i < 60; i++) p.step(DT, { mx: 0, mz: 0 });
    // run up from 3 m back so the jump has speed
    p.x = A.x + dx0 / l0 * (e - 3); p.z = A.z + dz0 / l0 * (e - 3);
    for (let i = 0; i < 30; i++) p.step(DT, { mx: 0, mz: 0 });
  }
  while (t < maxT) {
    world.updateBoxes(DT);
    const [tx, tz, th] = targets[ti];
    const inp = bot.think(DT, tx, tz, mode, th);
    p.step(DT, inp);
    t += DT;
    const d = Math.hypot(p.x - tx, p.z - tz);
    if (d < 1.6 && p.onGround && Math.abs(p.y - th) < 1.2) { if (++ti >= targets.length) return { ok: true, t }; }
    if (p.dead) return { ok: false, why: 'fell', t, x: p.x, z: p.z };
    if (Math.floor(t * 2) !== Math.floor((t - DT) * 2)) { if (d > lastD - 0.2 && p.onGround) stall++; else stall = 0; lastD = d; if (stall > 14) return { ok: false, why: 'stuck', t, x: p.x, z: p.z }; }
  }
  return { ok: false, why: 'timeout', t, x: p.x, z: p.z };
}

for (const id of ids) {
  console.log(`\n== ${id}`);
  if (LEVELS[id].kind === 'flight' || LEVELS[id].kind === 'boss') { console.log(`  ${LEVELS[id].kind} level: no node graph, checked in the browser`); continue; }
  const spec = buildSpec(LEVELS[id]);
  const world = makeWorld(spec);
  // slopes
  for (const s of spec.segs) if (s.type !== 'gap' && s.type !== 'bridge' && s.slope > LIMITS.rampSlope) fail(id, `ramp ${s.L.a}->${s.L.b} slope ${s.slope.toFixed(2)} > ${LIMITS.rampSlope}`);
  // reachability of nodes and entities
  const seen = flood(spec, world, [[spec.spawn[0], spec.spawn[2]]]);
  const cell = (x, z) => seen[Math.floor(z / spec.cs) * spec.n + Math.floor(x / spec.cs)];
  for (const nd of Object.values(spec.nodes)) if (!cell(nd.x, nd.z)) fail(id, `node ${nd.id} not reachable`);
  let unreachable = 0;
  for (const e of spec.entities) if (e.x !== undefined && e.y === undefined && !cell(e.x, e.z)) { unreachable++; if (['elder', 'chest', 'lantern', 'exit', 'portal', 'sunstone'].includes(e.t)) fail(id, `${e.t} at ${e.x.toFixed(0)},${e.z.toFixed(0)} unreachable`); }
  if (unreachable) console.log(`  note: ${unreachable} placed entities on unreachable cells`);
  // dynamic: every virtual link, both directions unless one-way
  for (const l of spec.links) {
    if (l.type !== 'gap' && l.type !== 'bridge' && l.type !== 'ferry') continue;
    const dirs = l.oneWay ? [[l.a, l.b]] : [[l.a, l.b], [l.b, l.a]];
    for (const [a, b] of dirs) {
      if (l.type === 'ferry') { console.log(`  ferry ${a}->${b}: assumed ok (moving platform; check by hand)`); continue; }
      if (l.spring && a === l.a) {
        const r = springHop(world, spec, a, b, l);
        console.log(`  spring ${a}->${b}: ${r.ok ? 'ok (' + r.t.toFixed(1) + 's)' : 'FAILED ' + r.why + ' at ' + (r.x || 0).toFixed(1) + ',' + (r.z || 0).toFixed(1)}`);
        if (!r.ok) bad++;
        continue;
      }
      if (l.vent && a === l.a) {
        const r = ventHop(world, spec, a, b, l);
        console.log(`  vent ${a}->${b}: ${r.ok ? 'ok (' + r.t.toFixed(1) + 's)' : 'FAILED ' + r.why + ' at ' + (r.x || 0).toFixed(1) + ',' + (r.z || 0).toFixed(1)}`);
        if (!r.ok) bad++;
        continue;
      }
      let r = hop(world, spec, a, b, l, l.type === 'bridge' ? 'walk' : 'gap');
      let how = l.type === 'bridge' ? 'walk' : 'jump+glide';
      if (!r.ok && l.type === 'gap') { r = hop(world, spec, a, b, l, 'charge'); how = 'jump+charge+glide'; }
      console.log(`  ${l.type} ${a}->${b}: ${r.ok ? 'ok (' + how + ', ' + r.t.toFixed(1) + 's)' : 'FAILED ' + r.why + ' at ' + (r.x || 0).toFixed(1) + ',' + (r.z || 0).toFixed(1)}`);
      if (!r.ok) bad++;
    }
  }
  // full route: spawn -> every node via BFS over the link graph (respecting one-way)
  const adj = {};
  for (const nd of Object.keys(spec.nodes)) adj[nd] = [];
  for (const l of spec.links) { adj[l.a].push({ to: l.b, l }); if (!l.oneWay) adj[l.b].push({ to: l.a, l }); }
  const start = Object.keys(spec.nodes).find((k) => Math.hypot(spec.nodes[k].x - spec.spawn[0], spec.nodes[k].z - spec.spawn[2]) < nodeRadius(spec.nodes[k]) + 1);
  const prev = { [start]: null }, order = [start];
  for (let i = 0; i < order.length; i++) for (const e of adj[order[i]]) if (!(e.to in prev)) { prev[e.to] = { from: order[i], l: e.l }; order.push(e.to); }
  for (const k of Object.keys(spec.nodes)) if (!(k in prev)) fail(id, `node ${k} not in route graph`);
  const ex = spec.entities.find((e) => e.t === 'exit');
  const target = ex ? Object.keys(spec.nodes).find((k) => Math.hypot(spec.nodes[k].x - ex.x, spec.nodes[k].z - ex.z) <= nodeRadius(spec.nodes[k]) + 0.5) : null;
  if (target) {
    const path = []; for (let k = target; prev[k]; k = prev[k].from) path.unshift(prev[k]); 
    const p = new Player(world, spec.spawn[0], spec.spawn[1], spec.spawn[2], spec.spawnYaw);
    let total = 0, ok = true;
    for (let i = 0; i < 40; i++) p.step(DT, { mx: 0, mz: 0 });
    for (const hopE of path) {
      const A = spec.nodes[hopE.from], B = spec.nodes[hopE.l.a === hopE.from ? hopE.l.b : hopE.l.a];
      const mode = hopE.l.type === 'gap' ? 'gap' : 'walk';
      if (hopE.l.type === 'ferry' || ((hopE.l.vent || hopE.l.spring) && hopE.from === hopE.l.a)) { p.x = B.x; p.z = B.z; p.y = world.sample(B.x, B.z).h + 0.1; p.vx = p.vz = 0; continue; }
      const r = runBot(world, p, [[B.x, B.z, B.h]], mode, 60, hopE.from, A, B);
      total += r.t || 0;
      if (!r.ok) { fail(id, `route hop ${A.id}->${B.id} ${r.why} at ${(r.x || 0).toFixed(1)},${(r.z || 0).toFixed(1)}`); ok = false; break; }
    }
    if (ok) console.log(`  route spawn -> exit: ok in ${total.toFixed(0)}s of play (${path.length} hops)`);
  }
  console.log(`  entities: ${spec.entities.length}, decor: ${spec.decor.length}, boxes: ${spec.boxes.length}`);
}
console.log(bad ? `\n${bad} problem(s)` : '\nall levels valid');
process.exit(bad ? 1 : 0);
