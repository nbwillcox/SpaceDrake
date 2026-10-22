// Level registry: id -> def. Hubs, levels, flight levels and bosses are added here as they are built.
import m_hub from './m_hub.js';
import m1_brookside from './m1_brookside.js';
import m2_stones from './m2_stones.js';
import m3_mill from './m3_mill.js';
import m4_quarry from './m4_quarry.js';

export const LEVELS = { m_hub, m1_brookside, m2_stones, m3_mill, m4_quarry };
export const START_LEVEL = 'm_hub';
// world id -> hub level id
export const HUBS = { mossgate: 'm_hub' };
