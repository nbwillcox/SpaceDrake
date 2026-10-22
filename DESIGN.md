# SpaceDrake: design and build plan

A neon, low-poly, real-3D collect-a-thon platformer in the spirit of the 1998 dragon classic. Gameplay is modelled as closely as mechanics allow. Everything else (names, characters, worlds, level layouts, art, music) is original so the game is safe to host publicly.

Primary player: MJ, casual, gamepad on a laptop connected to the living-room TV. Secondary: anyone on the web with a keyboard and mouse.

## Build status (2026-10-22)

All milestones M0-M9 are implemented. Differences from the plan below, worth knowing:

- **Elders:** about 91 across the game (hub 2, four levels at 3 each, one flight reward and one boss reward per realm; the Keep has 11), not exactly 80. Gate counts are tuned to that: flight 4/15/28/41/54, bosses 9/22/35/48/61, final door 68. Cozy mode scales Elder gates by 75%.
- **Levels:** Mossgate's six areas are hand-authored. Realms 2-6 use the layout generator (`js/layouts.js`) with per-realm themes and hazards (lava, wind gusts, void islands with a cloud floor). Every layout passes `node tools/validate.js`.
- **Bosses:** Moss Golem (bespoke), plus Cinder Smith, Storm Roc, Glowmaw, Lantern Queen and Warlord Gloam on the data-driven engine in `js/boss.js`.
- **Ground pound** was dropped: charge and flame cover every interaction.
- **Not done:** touch controls (desktop and gamepad only, as planned), a secret 100% area, per-level medals.


## 1. IP rules (hard constraints)

- Mechanics are free to copy: charge, glide, flame, gem collecting, rescue-the-dragons, hub plus portal levels, flight levels, thieves that run off with loot, bosses.
- Never use: the original names (game, hero, companion, villain, worlds, levels, characters), original level layouts, original music or sfx, original models or textures, the purple-body/orange-horn colour pairing.
- Every asset is generated in code (procedural geometry, procedural audio). No imported art, so there is nothing to license-check. Repo is CC BY-NC 4.0 like the rest of the series.
- Level layouts are designed fresh around our own themes. They follow the *shape* of the genre (open hub, four-ish levels per world, one flight level, one boss) but not any specific map.

## 2. Cast and names (all original, change freely)

| Role | Name | Notes |
|---|---|---|
| Hero | **Cinder** | Small teal dragon, amber belly and crest, short wings, big eyes |
| Companion | **Wick** | Glowing firefly orbiting Cinder; its colour shows health (gold, then amber, then pale, then gone) |
| Villain | **Warlord Gloam** | Has turned the elder drakes into crystal and scattered the treasure hoard |
| Mentor drakes | The crystal-bound Elders | Rescue them for tips (and for the gate count) |
| Thieves | **Pilferlings** | Little masked critters that grab loot and run |
| Fodder | **Glowmoths** | Tiny harmless critters; flame them for health/gems |

World names (six homeworlds, each with its own hub, art style and music):

1. **Mossgate Meadows** (green hills, windmills, stone bridges)
2. **Brightforge Vale** (lava, anvils, gears, ember sky)
3. **Mistral Heights** (floating isles, clouds, wind)
4. **Glimmerdeep** (crystal caves, glowing water, mushrooms)
5. **Duskmarket** (night town, lanterns, rooftops, fog)
6. **Gloam's Keep** (the finale: dark fortress, storm, neon cracks)

Each world = **Hub** + **4 levels** + **1 flight level** + **1 boss arena** (world 6 has no flight: Hub + 3 levels + finale boss + victory hoard). About 37 areas total. See section 10 for the content plan.

## 3. Platform and tech

- **Three.js**, ES modules, vendored locally (`lib/three.module.js`, MIT) so the game works offline and on GitHub Pages without a CDN. No build step, no bundler: `index.html` plus `js/*.js` modules via an import map. Dev server is a static file server (port 8143 in `.claude/launch.json`).
- **No physics engine.** A custom kinematic character controller (section 5) over a heightfield terrain plus a small set of analytic colliders (boxes, cylinders, slopes). This is what makes the Spyro feel (sticky ground, forgiving ledges, instant turn) reproducible and testable.
- **Procedural everything:** terrain meshes from heightmaps, props from primitives, the dragon from a skinned-by-hand hierarchy of meshes (no bones needed: body parts animate by transform), skyboxes from gradient shader spheres, music and sfx from WebAudio like the rest of the series.
- **Look:** low-poly flat-shaded geometry, toon-ish two/three-step lighting, saturated neon accents on gems/portals/flames, bloom-lite via additive sprites (no full-screen post chain on weak GPUs; optional bloom toggle). Target: 60 fps on an integrated-GPU laptop at 1080p. Adaptive resolution (reused from the series) drops the render scale when frame time rises.
- **Hosting:** GitHub Pages at `nbwillcox.github.io/SpaceDrake/`. Save data in `localStorage` (`spacedrake.save.v1`), three slots.

## 4. Input (gamepad first)

Xbox layout. Keyboard/mouse is a full alternative. The whole UI (title, pause, level select, shop-free menus) is navigable by gamepad alone with a visible focus highlight and big text readable from a couch.

| Action | Gamepad | Keyboard / mouse |
|---|---|---|
| Move | Left stick | WASD |
| Camera | Right stick | Mouse (pointer lock) or arrow keys |
| Jump / glide (hold in air) | A | Space |
| Flame | X | Left mouse / J |
| Charge | B | Right mouse / K |
| First-person look | Right stick click (R3) | Hold E |
| Re-centre camera | Left trigger | Q |
| Pause | Start | Esc |
| Menu confirm / back | A / B | Enter / Esc |

Rules: dead zones and a "Camera sensitivity" and "Invert Y" setting, "Hold vs toggle" for glide, rumble on hits/gems/charge impact where the browser supports it, full key rebinding for keyboard. The controller connecting mid-session switches the on-screen prompts to pad glyphs automatically.

## 5. Core feel (the thing that must be right)

**Character controller**, fixed 120 Hz sim step, rendered interpolated:

- Run: acceleration-based but snappy; turn rate high on ground, lower in air. Walks up slopes to about 50 degrees, slides on steeper.
- Jump: variable height (release early to cut), coyote time 0.12 s, input buffer 0.12 s.
- **Glide:** hold jump in the air. Slow fall, forward drift at a fixed speed, steer freely. Glide lasts as long as you hold (no stamina), because that is how it plays and it keeps it casual. Landing from a glide is soft.
- **Charge (B):** fast straight dash, a short-turning "bull rush", breaks armoured enemies and certain walls/crates, keeps momentum off ledges for a longer glide. Brief recovery on stop.
- **Flame (X):** short-range cone, toasts small enemies, lights lamps/fuses, melts ice blocks, opens flame-doors, burns fodder into pickups. Unlimited; short cooldown so it isn't a held beam.
- **Headbutt-style bump:** landing on top of an enemy with a charge-fall (hold B in the air then land) does a ground-pound. Hits armoured enemies and flat switches.
- **Supercharge and super-flame ramps:** floor strips that give a limited-time speed boost or a big flame on the next ramp-gated feature, used to reach far rewards and break big gates.
- Falling out of the world or into hazards costs a life and respawns at the last checkpoint (lanterns). **Casual default: unlimited lives** (lives counter still shown as a score stat). The classic setting limits lives.

**Health:** Wick the firefly. Each hit loses a colour state; at "no Wick" the next hit costs a life. Flame glowmoths to get Wick back up. Falls and lava instantly cost a life regardless.

**Camera:** third-person follow, automatic yaw-follow when moving, right stick orbit, collision with terrain and props (pulled in, never inside geometry), smooth zoom out in open areas, first-person look mode. Biggest source of "feels bad" in 3D platformers, so it gets its own milestone (M2) and a test scene.

## 6. Collectibles and progression

- **Gems** in five tiers (1, 2, 5, 10, 25 points), in piles, in chests, dropped by enemies, hidden in crates and vases, carried by Pilferlings.
- **Elders** (the crystal-bound drakes): 80 total across the game (a few per level, one per hub). Rescued by reaching them; each grants a short tip and counts toward gates.
- **Sunstones** (the "egg" equivalent): 12 stolen by the Pilferlings. Chase and flame the runner to get one back.
- **Gates:** each world's boss portal needs a number of Elders rescued; later hubs need a gem total or Elder count to enter (clearly displayed at the portal). Casual mode lowers the numbers.
- **Level completion:** shows gems, Elders, Sunstones collected vs total, in a clean summary. Revisit any level any time from the hub. Best-per-level stored.
- **100% completion:** all gems, all Elders, all Sunstones, plus a bonus "secret" area unlocked by completion. Tracked per slot.

## 7. Enemies, hazards, props

Enemy types appear gradually with world-themed reskins: Strollers (basic walkers), Shielded (flame-proof, charge only), Spiked (charge-proof, flame only), Hoppers, Archers/spitters, Armoured rams, Floating wisps, Pilferlings (run away with loot), Heavy brutes (mini-boss, take several charge/flame combos). Hazards: lava, pits, spikes, swinging blades, falling rocks, wind gusts, ice, moving platforms, rotating bridges, crumbling tiles, conveyor ramps. Props: crates (charge), vases (anything), flame-lamps and fuses (flame), switches (ground-pound), springs/updraft vents (high jumps), locked chests that need a key dropped by a specific enemy, glass crystals that block paths until charged.

## 8. Flight levels

Each world has one timed-ish flight level: Cinder flies along a ribbon path through rings, gem trails, targets to flame (some need charge-through), and thieves to catch. Controls: stick to steer, A to boost, X to flame, B to brake-roll. Casual-friendly: no fail by collision (you bump and lose time), just a score/target count. Completion thresholds award bonus Elders/Sunstone, with a "perfect" medal. Implemented as a separate controller (`flight.js`) over a path spline (Catmull-Rom) with a lateral offset envelope.

## 9. Bosses

One per world, each with 3 phases and one clear mechanic that teaches a skill, always with visible telegraphs and no instant kills in casual mode:

1. Mossgate: **Moss Golem** (charge into weak spot after it slams)
2. Brightforge: **Cinder Smith** (flame the furnace, dodge hammer shockwaves)
3. Mistral: **Storm Roc** (glide onto platforms to reach it, flame wing bursts)
4. Glimmerdeep: **Glowmaw** (ground-pound crystals to expose it)
5. Duskmarket: **Lantern Queen** (extinguish lantern clones, then charge the real one)
6. Gloam's Keep: **Warlord Gloam**, 4 phases using every skill, then a final chase/flight sequence to the hoard

Boss HP bars, a checkpoint at each phase boundary, retry instantly.

## 10. Content plan

Per world (A = adventure level, F = flight, B = boss):

| World | Hub | Levels | Theme hook |
|---|---|---|---|
| 1 Mossgate Meadows | Windmill Green | Brookside, Standing Stones, Clockwork Mill, Old Quarry; F: Skylark Run; B: Moss Golem | Teaches everything gently |
| 2 Brightforge Vale | The Great Anvil | Slag Row, Gear Works, Ember Terraces, Cooling Pools; F: Smoke Run; B: Cinder Smith | Lava, conveyors, flame doors |
| 3 Mistral Heights | Cloud Landing | Skybridge, Windward Isles, Sunken Library, Storm Spires; F: Gale Run; B: Storm Roc | Gliding and wind |
| 4 Glimmerdeep | Crystal Lake | Mushroom Hollow, Prism Caves, Tide Chambers, Echo Tunnels; F: Glow Dive; B: Glowmaw | Light, water, mirrors |
| 5 Duskmarket | Lantern Square | Rooftop Run, Back Alleys, Clock Tower, Bazaar Maze; F: Moonlit Run; B: Lantern Queen | Night, verticality, stealth thieves |
| 6 Gloam's Keep | Black Gate | Outer Wall, Dungeon Stairs, Throne Spire; B: Gloam; finale: The Hoard | Every mechanic remixed |

37 areas in total. Level sizes: hubs about 2x the area of a level; levels are open, with a main path and many optional branches, each 8-15 minutes of casual play. Full playthrough about 8-12 hours for a casual player, which is the target.

## 11. Level authoring pipeline (the real workload)

Hand-placing 37 3D levels is the scope risk, so levels are **data + generators**, and every level is auto-validated:

- `js/levels/<id>.js` exports a spec: heightmap recipe (noise layers + authored "stamps": plateaus, ramps, bridges, pits), a *path graph* of waypoints that defines the intended route, entity lists (gems, enemies, props, checkpoints, Elders, Sunstones), world theme, music, sky, fog.
- `tools/levelgen/*.js` helpers build terrain from stamps so a level is mostly a script of "place plateau here, ramp there, bridge between".
- **Validator** (`tests/_validate.js`, Node, headless, reuses the real controller code): a bot walks the path graph using the real character controller (jump, glide, charge) and checks every required item and the exit are reachable. Same pattern that caught real bugs in SpaceTroid. Any jump that needs more than the controller allows fails the build.
- **Level viewer** page (`viewer.html`) with free camera, gem/enemy counts and a top-down map, for quickly eyeballing layout.
- Debug URL flags: `?level=<id>`, `?god=1`, `?unlock=1`, `?pos=x,y,z`, `?bot=1` (auto-play a level end to end), `?fps=1`.

## 12. Architecture

```
index.html            importmap, canvas, UI root
css/style.css         menus, HUD, couch-readable sizes
lib/three.module.js   vendored Three.js (MIT)
js/
  main.js             boot, loop (fixed step + interpolation), scene manager
  input.js            keyboard/mouse/gamepad -> actions, rebinding, prompts
  controller.js       character controller (run/jump/glide/charge/flame/pound)
  collide.js          heightfield + analytic colliders, queries, raycast
  camera.js           follow cam, collision, first-person
  world.js            level loader, entity manager, checkpoints
  entities/*.js       gem, chest, crate, enemy types, pilferling, elder, switches
  flight.js           spline flight controller
  boss/*.js           per-boss logic
  art/dragon.js       procedural Cinder + animations
  art/props.js        procedural prop/enemy meshes
  art/sky.js          gradient skies, clouds, stars
  art/fx.js           particles (flame, gem sparkle, dust, shockwaves)
  audio.js            WebAudio sfx + music sequencer
  ui.js               DOM menus, HUD, level summary, hub gate displays
  save.js             slots, per-level bests
  levels/*.js         level specs (section 11)
tools/                level helpers, thumbnail renderer
tests/                _validate.js, controller unit tests
```

Rendering budget: per level about 150k triangles, instanced meshes for gems/foliage, frustum + distance culling by chunk, one directional light + hemisphere, baked vertex colours (no textures) to keep memory and draw calls low.

## 13. Milestones

| M | Deliverable | Verified by |
|---|---|---|
| M0 | Repo scaffold, Three.js vendored, dev server, empty scene, gamepad + keyboard input test page | Pad detected, buttons shown live |
| M1 | Character controller on a test heightfield: run, jump, glide, charge, flame; Cinder placeholder mesh; follow camera | Controller unit tests + hands-on feel pass |
| M2 | Camera polish, collision queries, ledge forgiveness, test scene with slopes/ledges/moving platforms | Camera test scene, no clipping |
| M3 | Gems, crates, chests, Wick health, checkpoints, HUD, basic enemies, death/respawn | Bot clears a test level |
| M4 | Procedural Cinder with animations (idle/run/jump/glide/charge/flame/hurt), flame FX | Visual review |
| M5 | **Mossgate Meadows** complete: hub, 4 levels, flight level, boss. Level pipeline + validator working | Validator green, full bot run |
| M6 | Save/load, hub gates, level summary, portals, menus, settings, rebinding, audio v1 | Manual pass |
| M7 | Worlds 2-6, one at a time, each with its new mechanic set, enemies, flight level, boss | Validator + bot per world |
| M8 | Gloam finale, ending, credits, 100% secret | Full playthrough bot |
| M9 | Polish: performance pass (adaptive resolution), difficulty modes, accessibility options, README, Pages release | Perf numbers + MJ playtest |

Each milestone is committed and pushed (Pages stays live from M1 on, so MJ can try early builds).

## 14. Difficulty and accessibility

- **Cozy (default for MJ):** unlimited lives, more Wick refills, softer enemy damage, generous checkpoints, lower gate counts, optional aim-assist on flame.
- **Classic:** limited lives, original gate counts, normal enemy damage.
- Large readable HUD scale slider, high-contrast gem outline option, reduced screen shake, colour-blind-safe Wick states (shape/brightness as well as colour), pause anywhere, subtitle-style tips text for Elder dialogue.

## 15. Open questions (current defaults in brackets)

1. Dragon colour scheme [teal body, amber belly and crest].
2. Unlimited lives in the default difficulty [yes, "Cozy"].
3. Total scope of 6 worlds and about 37 areas [yes, built one world at a time].
4. Music [original procedural chiptune-adjacent score per world, no samples].
5. Mobile / touch support [no: desktop only, gamepad and keyboard].
