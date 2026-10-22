# SpaceDrake

A free, original 3D dragon platformer for the browser. You play **Cinder**, a small teal dragon, with **Wick** the firefly at her side. Glide across six realms, collect gems, rescue the crystal **Elders**, win back the **Sunstones**, and stop **Warlord Gloam**.

**Play it:** https://nbwillcox.github.io/SpaceDrake/

Made to be played on a couch: gamepad first, with full keyboard and mouse support.

## Controls

| Action | Gamepad | Keyboard / mouse |
|---|---|---|
| Move | Left stick | WASD |
| Camera | Right stick | Mouse (click to capture) or arrow keys |
| Jump | A | Space |
| Glide | Press jump again in the air and hold | same |
| Flame | X (or right trigger) | J or left click |
| Charge | B (or right bumper) | K or right click |
| Look around | Click right stick | Hold E |
| Re-centre camera | Left trigger | Q |
| Pause | Start | Esc |

Keyboard keys can be rebound in Settings. Settings also has a "press once to glide" option, camera speed, invert Y, rumble, and a text/HUD size slider.

### Flight levels

Stick steers, hold A to boost, X to flame lanterns, B to dash. Fly through the rings, light the lanterns, grab the gems. Nobody fails a flight level; collecting enough rescues an Elder.

## Modes

- **Cozy** (default recommendation): unlimited tries, an extra heart, and gentler gates (25% fewer Elders needed).
- **Classic**: three lives per level and the full gate counts.

Progress saves automatically in three slots in your browser.

## The game

Six realms, each with a hub, four levels, a flight level and a boss (the last realm has three levels and the finale):

1. Mossgate Meadows
2. Brightforge Vale
3. Mistral Heights
4. Glimmerdeep
5. Duskmarket
6. Gloam's Keep

## Run it locally

No build step. Serve the folder with any static file server, for example:

```
python -m http.server 8143
```

Then open http://localhost:8143/. Useful URL flags: `?level=<id>` (jump straight to a level; ids are in `js/levels/`), `?dbg=1` (input and position overlay; F3 toggles it).

## For developers

- `js/controller.js` and `js/collide.js` are pure (no three.js) and unit-tested: `node tests/controller.test.js`.
- Levels are a node/link graph over a heightfield (`js/levelgen.js`, `js/layouts.js`). `node tools/validate.js` drives the real controller with a bot across every gap, vent, spring and the whole route to the exit of every level.
- `node tools/seedsearch.js <levelId|all>` finds generator seeds whose layout passes validation.
- Everything visual and audible is generated in code: no image, model or audio files.

## Credits and licence

Original game, characters, levels and music. Uses [three.js](https://threejs.org) (MIT, `lib/THREE_LICENSE`).

Released under **CC BY-NC 4.0**: free to play and share with credit, not for commercial use. See `LICENSE`.
