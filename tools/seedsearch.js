// Find seeds whose generated layout validates: node tools/seedsearch.js <levelId|all> [fromSeed] [toSeed] [wanted]
// Reads the factory options from js/levels/worlds.js (GROUND). Prints passing seeds; copy one into worlds.js.
import { makeLevel } from '../js/levels/factory.js';
import { GROUND } from '../js/levels/worlds.js';
import { validateDef } from './validate.js';

const which = process.argv[2];
const from = +(process.argv[3] || 1), to = +(process.argv[4] || 40), wanted = +(process.argv[5] || 1);
const ids = which === 'all' ? Object.keys(GROUND) : [which];
const origLog = console.log;
const result = {};
for (const id of ids) {
  const base = GROUND[id]; let found = 0;
  console.log = () => {};
  for (let seed = from; seed <= to && found < wanted; seed++) {
    let def;
    try { def = makeLevel({ ...base, seed }); } catch (e) { continue; }
    const L = def.layout, N = base.count || 8;
    if (L.chain.length < N - 1 || L.branches.length < Math.min(2, base.branches === undefined ? 3 : base.branches)) continue;
    let bad = 1;
    try { bad = validateDef(def.id, def, true); } catch (e) { bad = 99; }
    if (bad === 0) { found++; (result[id] = result[id] || []).push(seed); }
  }
  console.log = origLog;
  console.log(`${id}: ${result[id] ? result[id].join(', ') : 'NO PASSING SEED in ' + from + '-' + to}`);
}
