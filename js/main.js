import * as THREE from 'three';
import { World, buildHeights } from './collide.js';
import { Player, P } from './controller.js';
import { Input } from './input.js';
import { FollowCam } from './camera.js';
import { buildTerrainMesh, buildBoxMeshes } from './art/terrain.js';
import { createDragon } from './art/dragon.js';
import { Fx } from './art/fx.js';
import testlab from './levels/testlab.js';

const STEP = 1 / 120;
const q = new URLSearchParams(location.search);
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(62, 1, 0.1, 400);

const G = window.SD = { THREE, scene, camera, renderer, P };
Input.init(canvas);

// ---------- level
function loadLevel(spec) {
  const heights = buildHeights(spec.n, spec.cs, spec.height);
  const world = new World({ n: spec.n, cs: spec.cs, heights, boxes: spec.boxes, killY: spec.killY });
  return world;
}
const spec = testlab;
const world = loadLevel(spec);
G.world = world; G.spec = spec;

const th = spec.theme;
scene.background = new THREE.Color(th.fog);
scene.fog = new THREE.Fog(th.fog, th.fogNear, th.fogFar);
scene.add(new THREE.HemisphereLight(0xffffff, 0x7a8f6a, 0.85));
const sun = new THREE.DirectionalLight(0xfff1d0, 1.0); sun.position.set(0.6, 1, 0.4); scene.add(sun);

// sky dome gradient
{
  const g = new THREE.SphereGeometry(300, 24, 12);
  const m = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color(th.sky[0]) }, bot: { value: new THREE.Color(th.sky[1]) } },
    vertexShader: 'varying float h; void main(){ h = normalize(position).y; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: 'uniform vec3 top; uniform vec3 bot; varying float h; void main(){ gl_FragColor = vec4(mix(bot, top, smoothstep(0.0, 0.7, h)), 1.); }',
  });
  const sky = new THREE.Mesh(g, m); sky.renderOrder = -1; scene.add(sky);
  G.sky = sky;
}

const terrain = buildTerrainMesh(world, th); scene.add(terrain);
const boxGroup = new THREE.Group(); scene.add(boxGroup); buildBoxMeshes(world, boxGroup);

// ---------- player
const sp = spec.spawn;
sp[1] = world.sample(sp[0], sp[2]).h + 0.2;
const player = new Player(world, sp[0], sp[1], sp[2], sp[3]);
G.player = player;
const dragon = createDragon(); scene.add(dragon.root);
const fx = new Fx(scene); G.fx = fx;
const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.5, 20), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false }));
shadow.rotation.x = -Math.PI / 2; scene.add(shadow);

const cam = new FollowCam(camera); G.cam = cam;
cam.snapTo(sp[3]);

// ---------- loop
const pending = { jumpPressed: false, flamePressed: false, chargePressed: false };
let acc = 0, last = performance.now(), paused = false, t = 0;
const dbg = document.getElementById('dbg');
let showDbg = q.has('dbg');
G.paused = false;

function simStep(inp) {
  // camera-relative move vector
  const yaw = cam.fp ? 0 : cam.yaw;
  const fx_ = Math.sin(yaw), fz_ = Math.cos(yaw);
  const rx = -Math.cos(yaw), rz = Math.sin(yaw);
  const mv = inp.my, mr = inp.mx;
  const move = { mx: fx_ * mv + rx * mr, mz: fz_ * mv + rz * mr,
    jumpPressed: pending.jumpPressed, jumpHeld: inp.jumpHeld,
    flamePressed: pending.flamePressed, chargePressed: pending.chargePressed, frozen: inp.lookHeld };
  pending.jumpPressed = pending.flamePressed = pending.chargePressed = false;
  const prevYaw = player.yaw;
  player.step(STEP, move);
  player.yawRate = Math.atan2(Math.sin(player.yaw - prevYaw), Math.cos(player.yaw - prevYaw)) / STEP;
  for (const e of player.events) onEvent(e);
  if (player.flameT > 0) {
    const nx = Math.sin(player.yaw), nz = Math.cos(player.yaw);
    fx.flame(player.x + nx * 0.8, player.y + 0.62, player.z + nz * 0.8, nx, nz);
  }
  if (player.dead) { player.respawn(sp[0], world.sample(sp[0], sp[2]).h + 0.2, sp[2], sp[3]); cam.snapTo(sp[3]); }
  t += STEP;
}

function onEvent(e) {
  switch (e.type) {
    case 'jump': dragon.pulse('jump'); fx.dust(player.x, player.y, player.z, 4, 0.8); Input.rumble(0.1, 0.2, 50); break;
    case 'land': dragon.pulse('land'); fx.dust(player.x, player.y, player.z, Math.min(10, 4 + (e.impact | 0)), 1 + e.impact * 0.05); Input.rumble(Math.min(0.6, e.impact * 0.03), 0.3, 80); break;
    case 'charge': fx.dust(player.x, player.y, player.z, 8, 1.3); Input.rumble(0.3, 0.6, 120); break;
    case 'bump': fx.sparkle(player.x + Math.sin(player.yaw) * 0.6, player.y + 0.5, player.z + Math.cos(player.yaw) * 0.6, 12, 1, 0.9, 0.4); Input.rumble(0.8, 0.8, 160); break;
    case 'flame': Input.rumble(0.0, 0.4, 150); break;
  }
}

function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.1, (now - last) / 1000); last = now;
  if (!G.paused) advance(dt);
  render(dt, acc / STEP);
}

function advance(dt) {
  const inp = Input.poll();
  if (inp.pausePressed) { /* pause menu arrives in M6 */ }
  if (inp.flamePressed) pending.flamePressed = true;
  if (inp.jumpPressed) pending.jumpPressed = true;
  if (inp.chargePressed) pending.chargePressed = true;
  acc += dt;
  let n = 0;
  while (acc >= STEP && n++ < 12) { simStep(inp); acc -= STEP; }
  if (n >= 12) acc = 0;
  G.inp = inp;
}

function render(dt, alpha) {
  const lerp = (a, b) => a + (b - a) * alpha;
  const rx = lerp(player.px, player.x), ry = lerp(player.py, player.y), rz = lerp(player.pz, player.z);
  let dy = player.yaw - player.pyaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
  const ryaw = player.pyaw + dy * alpha;
  dragon.root.position.set(rx, ry, rz);
  dragon.root.rotation.y = ryaw;
  dragon.update(dt, {
    vx: player.vx, vy: player.vy, vz: player.vz, onGround: player.onGround, sliding: player.sliding,
    gliding: player.gliding, charging: player.charging, flaming: player.flameT > 0, yawRate: player.yawRate || 0,
  });
  const gnd = world.groundAt(rx, rz, ry + 0.5, 0.6, G._gg || (G._gg = {}));
  shadow.position.set(rx, gnd.y + 0.04, rz);
  const hh = Math.max(0, ry - gnd.y);
  shadow.scale.setScalar(Math.max(0.35, 1 - hh * 0.06));
  shadow.material.opacity = Math.max(0.1, 0.38 - hh * 0.02);

  const inp = G.inp || Input.state;
  cam.update(dt, { x: rx, y: ry, z: rz, yaw: ryaw, vx: player.vx, vz: player.vz, onGround: player.onGround }, inp, world);
  fx.update(dt);

  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (canvas.width !== Math.floor(w * renderer.getPixelRatio()) || canvas.height !== Math.floor(h * renderer.getPixelRatio())) {
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  G.sky.position.copy(camera.position);
  renderer.render(scene, camera);
  if (showDbg) updateDbg();
}

function updateDbg() {
  const s = Input.state;
  dbg.textContent =
    `pad: ${s.padName || 'none'}${s.usingPad ? ' (active)' : ''}\n` +
    `move ${s.mx.toFixed(2)},${s.my.toFixed(2)}  cam ${s.csx.toFixed(2)},${s.csy.toFixed(2)}\n` +
    `btn ${s.buttons.join('')}\naxes ${s.axes.map((a) => a.toFixed(2)).join(' ')}\n` +
    `pos ${player.x.toFixed(1)},${player.y.toFixed(1)},${player.z.toFixed(1)} spd ${player.speedH.toFixed(1)} vy ${player.vy.toFixed(1)}\n` +
    `${player.onGround ? 'GROUND ' : ''}${player.gliding ? 'GLIDE ' : ''}${player.charging ? 'CHARGE ' : ''}${player.sliding ? 'SLIDE ' : ''}`;
}

addEventListener('keydown', (e) => {
  if (e.code === 'F3') { showDbg = !showDbg; dbg.style.display = showDbg ? 'block' : 'none'; }
});
dbg.style.display = showDbg ? 'block' : 'none';

G.step = (n = 1, inp = {}) => { // headless stepping for tests: SD.step(120, {my:1})
  const base = { mx: 0, my: 0, jumpHeld: false, lookHeld: false };
  for (let i = 0; i < n; i++) { Object.assign(pending, { jumpPressed: !!(inp.jumpPressed && i === 0), flamePressed: !!(inp.flamePressed && i === 0), chargePressed: !!(inp.chargePressed && i === 0) }); simStep(Object.assign(base, inp)); }
  acc = 0; render(STEP, 1);
};
requestAnimationFrame((n) => { last = n; frame(n); });
document.getElementById('hint').addEventListener('click', () => canvas.requestPointerLock && canvas.requestPointerLock());
