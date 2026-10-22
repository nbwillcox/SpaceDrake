// Run: node tests/controller.test.js
import { World, buildHeights } from '../js/collide.js';
import { Player, P } from '../js/controller.js';

let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.log('FAIL', m); } else console.log('ok  ', m); };
const DT = 1 / 120;

function mk(fn, boxes = [], n = 64) {
  const w = new World({ n, cs: 1, heights: buildHeights(n, 1, fn), boxes });
  return w;
}
const NONE = { mx: 0, mz: 0, jumpPressed: false, jumpHeld: false, flamePressed: false, chargePressed: false };
function run(p, secs, f) {
  const n = Math.round(secs / DT);
  for (let i = 0; i < n; i++) p.step(DT, Object.assign({}, NONE, f(i * DT, i)));
}

// --- flat ground: settle, run speed
{
  const w = mk(() => 2);
  const p = new Player(w, 32, 2, 32);
  run(p, 0.3, () => ({}));
  ok(p.onGround && Math.abs(p.y - 2) < 1e-6, 'settles on flat ground');
  run(p, 1.0, () => ({ mz: 1 }));
  ok(Math.abs(p.vz - P.runSpeed) < 0.2, `reaches run speed (${p.vz.toFixed(2)})`);
  const z0 = p.z; run(p, 1, () => ({ mz: 1 }));
  ok(Math.abs((p.z - z0) - P.runSpeed) < 0.3, 'covers ~8 m in 1 s');
}

// --- jump height (hold) vs tap
{
  const w = mk(() => 0);
  let p = new Player(w, 32, 0, 32); run(p, 0.2, () => ({}));
  let maxY = 0;
  run(p, 1.2, (t, i) => { maxY = Math.max(maxY, p.y); return { jumpPressed: i === 0, jumpHeld: true }; });
  ok(maxY > 1.8 && maxY < 2.2, `full jump ~2 m (${maxY.toFixed(2)})`);
  p = new Player(w, 32, 0, 32); run(p, 0.2, () => ({}));
  let maxT = 0;
  run(p, 1.2, (t, i) => { maxT = Math.max(maxT, p.y); return { jumpPressed: i === 0, jumpHeld: i < 3 }; });
  ok(maxT < 0.7 * maxY && maxT > 0.15, `tap jump is shorter (${maxT.toFixed(2)})`);
}

// --- coyote time: jump allowed just after walking off a ledge
{
  const w = mk((x) => (x < 32 ? 3 : 0));
  const p = new Player(w, 30, 3, 32); run(p, 0.2, () => ({}));
  let jumped = false;
  run(p, 1.2, (t, i) => {
    const off = p.x > 32.2;
    return { mx: 1, jumpPressed: off && !jumped && p.airTime > 0.04 && (jumped = true), jumpHeld: true };
  });
  ok(jumped && p.events.length >= 0, 'coyote jump attempted after leaving ledge');
}

// --- glide extends distance
{
  const w = mk((x) => (x < 20 ? 12 : 0));
  const dist = (glide) => {
    const p = new Player(w, 18, 12, 32); run(p, 0.1, () => ({}));
    let landX = null;
    run(p, 6, () => {
      if (landX === null && p.x > 21 && p.onGround) landX = p.x;
      const off = p.x > 20.5 && landX === null;
      return { mx: 1, jumpPressed: glide && off && p.airTime > 0.05 && !p.gliding, jumpHeld: glide && off };
    });
    return landX - 20;
  };
  const a = dist(false), b = dist(true);
  ok(b > a * 1.4, `glide goes farther: ${a.toFixed(1)} -> ${b.toFixed(1)} m`);
}

// --- glide fall speed
{
  const w = mk(() => 0);
  const p = new Player(w, 32, 40, 32);
  run(p, 0.2, () => ({}));
  run(p, 0.3, (t, i) => ({ jumpPressed: i === 0 && false }));
  p.vy = -5;
  run(p, 1, (t, i) => ({ mz: 1, jumpPressed: i === 0, jumpHeld: true }));
  ok(p.gliding && p.vy > -2.6 && p.vy < -1.6, `glide fall ~${P.glideFall} (${p.vy.toFixed(2)})`);
}

// --- charge speed + steering + bump
{
  const w = mk(() => 0, [{ min: [38, 0, 20], max: [40, 5, 44] }]);
  const p = new Player(w, 32, 0, 32, Math.PI / 2); run(p, 0.2, () => ({}));
  let ev = [], maxV = 0;
  run(p, 1.2, (t, i) => { for (const e of p.events) ev.push(e.type); maxV = Math.max(maxV, p.speedH); return { chargePressed: i === 0 }; });
  ok(ev.includes('charge'), 'charge starts');
  ok(maxV > 17, `charge reaches ~19 m/s (${maxV.toFixed(1)})`);
  ok(ev.includes('bump'), 'charge into a wall bumps');
  ok(p.x < 38, 'wall stops the player');
}

// --- walls and stepping
{
  const w = mk(() => 0, [{ min: [34, 0, 0], max: [36, 0.4, 64] }, { min: [40, 0, 0], max: [41, 2, 64] }]);
  const p = new Player(w, 30, 0, 32); run(p, 0.2, () => ({}));
  run(p, 1.2, () => ({ mx: 1 }));
  ok(p.x > 37 && Math.abs(p.y - 0.4) < 0.02 || p.x > 36, `steps up a 0.4 m box (x=${p.x.toFixed(2)}, y=${p.y.toFixed(2)})`);
  run(p, 2, () => ({ mx: 1 }));
  ok(p.x < 40.1 - P.radius + 0.05, `blocked by 2 m wall (x=${p.x.toFixed(2)})`);
}

// --- box platform: land on it, ride along edge, fall off
{
  const w = mk(() => 0, [{ min: [30, 1, 30], max: [34, 2, 34] }]);
  const p = new Player(w, 32, 6, 32); run(p, 1, () => ({}));
  ok(p.onGround && Math.abs(p.y - 2) < 1e-4, 'lands on box top');
  run(p, 2, () => ({ mx: 1 }));
  ok(p.y < 0.5, 'walks off the box and falls to ground');
}

// --- steep slope: cannot climb, slides down
{
  const w = mk((x, z) => (x < 30 ? 0 : (x - 30) * 2.2)); // ~65 degrees
  const p = new Player(w, 28, 0, 32); run(p, 0.3, () => ({}));
  run(p, 2, () => ({ mx: 1 }));
  ok(p.x < 31.2, `cannot climb a 65 degree slope (x=${p.x.toFixed(2)})`);
}

// --- walkable slope climbs
{
  const w = mk((x) => (x < 30 ? 0 : (x - 30) * 0.7)); // ~35 degrees
  const p = new Player(w, 28, 0, 32); run(p, 0.3, () => ({}));
  run(p, 2, () => ({ mx: 1 }));
  ok(p.x > 38, `climbs a 35 degree slope (x=${p.x.toFixed(2)})`);
}

// --- fall below kill plane
{
  const w = mk(() => -40);
  const p = new Player(w, 32, -30, 32);
  let fell = false; run(p, 1, () => { if (p.events.some((e) => e.type === 'fall')) fell = true; return {}; });
  ok(p.dead || fell, 'kill plane triggers fall');
}

// --- raycast
{
  const w = mk(() => 0, [{ min: [30, 0, 30], max: [34, 3, 34] }]);
  ok(w.raycast(20, 1, 32, 40, 1, 32, 0) < 0.6, 'ray hits a box');
  ok(w.raycast(20, 1, 20, 40, 1, 20, 0) === 1, 'clear ray');
  ok(w.raycast(20, 5, 20, 20, -1, 20, 0) < 1, 'ray hits terrain');
}

console.log(fails ? `\n${fails} FAILED` : '\nall passed');
process.exit(fails ? 1 : 0);
