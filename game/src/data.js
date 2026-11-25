// Warteg Rush — the food itself: raw ingredients, what each station does to
// them, and the finished dishes an order ticket can ask for.
// A dish is a chain of station steps, e.g. a balado egg is boiled, then fried.

// Station kinds a step can run on.
export const STATION = { FRY: 'fry', BOIL: 'boil', CHOP: 'chop', POT: 'pot' };

// Raw ingredients stocked in the glass etalase, in display order.
export const RAW = {
  chicken:  { name: 'Chicken',    short: 'Chicken' },
  egg:      { name: 'Egg',        short: 'Egg' },
  tempeh:   { name: 'Tempeh',     short: 'Tempeh' },
  tofu:     { name: 'Tofu',       short: 'Tofu' },
  fish:     { name: 'Fish',       short: 'Fish' },
  lodehveg: { name: 'Lodeh Veg',  short: 'Lodeh Veg' },
  kangkung: { name: 'Kangkung',   short: 'Kangkung' },
};

// Every plate-ready food id: staples served straight onto the plate, and
// dishes produced by a chain of steps. `chain` lists [station, seconds,
// resultId] hops starting from the raw ingredient named by `from`.
export const FOOD = {
  rice:     { name: 'Rice',          price: 3000, staple: true },
  sambal:   { name: 'Sambal',        price: 1000, staple: true },
  crackers: { name: 'Crackers',      price: 1000, staple: true },
  tea:      { name: 'Sweet Tea',     price: 4000, staple: true },

  fried_chicken: { name: 'Fried Chicken',   price: 9000, from: 'chicken',  chain: [[STATION.FRY, 8]] },
  omelette:      { name: 'Omelette',        price: 6000, from: 'egg',      chain: [[STATION.FRY, 5]] },
  fried_tempeh:  { name: 'Fried Tempeh',    price: 4000, from: 'tempeh',   chain: [[STATION.FRY, 5]] },
  fried_tofu:    { name: 'Fried Tofu',      price: 4000, from: 'tofu',     chain: [[STATION.FRY, 5]] },
  fried_fish:    { name: 'Fried Fish',      price: 9000, from: 'fish',     chain: [[STATION.FRY, 7]] },
  balado_egg:    { name: 'Balado Egg',      price: 7000, from: 'egg',      chain: [[STATION.BOIL, 6], [STATION.FRY, 5]] },
  tempeh_orek:   { name: 'Tempeh Orek',     price: 6000, from: 'tempeh',   chain: [[STATION.CHOP, 2.5], [STATION.FRY, 6]] },
  lodeh:         { name: 'Lodeh Soup',      price: 6000, from: 'lodehveg', chain: [[STATION.POT, 10]] },
  stir_kangkung: { name: 'Stir-fried Kangkung', price: 5000, from: 'kangkung', chain: [[STATION.CHOP, 2.5], [STATION.FRY, 5]] },
};

// Intermediate results that exist only between two steps of a chain.
export const MID = {
  boiled_egg:     { name: 'Boiled Egg' },
  chopped_tempeh: { name: 'Chopped Tempeh' },
  chopped_kangkung: { name: 'Chopped Kangkung' },
};

export function foodName(id) {
  if (FOOD[id]) return FOOD[id].name;
  if (MID[id]) return MID[id].name;
  if (RAW[id]) return RAW[id].name;
  return id;
}

// Result of cooking `id` one hop toward `dishId`, resolved from the chain
// position: raw ids map to the dish's first mid (or the dish itself when
// the chain has one hop); mids map onward by their naming convention.
export function midResult(dishId, id) {
  const dish = FOOD[dishId];
  if (!dish || !dish.chain) return null;
  if (id === dish.from) {
    if (dish.chain.length === 1) return dishId;
    if (dishId === 'balado_egg') return 'boiled_egg';
    if (dishId === 'tempeh_orek') return 'chopped_tempeh';
    if (dishId === 'stir_kangkung') return 'chopped_kangkung';
    return dishId;
  }
  if (id === 'boiled_egg' || id === 'chopped_tempeh' || id === 'chopped_kangkung') return dishId;
  return null;
}

// Which final dish an in-progress item is heading for, and its next hop.
// Items carry their target dish from the moment they are picked up, so the
// world never has to guess between chains that share a raw ingredient.
export function hopFor(item) {
  const dish = FOOD[item.dish];
  if (!dish || !dish.chain) return null;
  let current = dish.from;
  for (const [station, seconds] of dish.chain) {
    if (current === item.id) return { station, seconds, becomes: midResult(item.dish, current) };
    current = midResult(item.dish, current);
    if (!current) return null;
  }
  return null;
}

// Build an order ticket: always rice, one to three dishes from the day's
// unlocked menu, and a roll each for the three optional extras.
export function makeTicket(rng, unlock, day) {
  const dishCount = rng.int(1, Math.min(3, 1 + Math.floor((day + 1) / 2) + (rng.chance(0.35) ? 1 : 0)));
  const dishes = [];
  const pool = [...unlock];
  for (let i = 0; i < dishCount && pool.length; i += 1) {
    const idx = Math.floor(rng.next() * pool.length);
    dishes.push(pool.splice(idx, 1)[0]);
  }
  const items = ['rice', ...dishes];
  if (rng.chance(0.4)) items.push('sambal');
  if (rng.chance(0.3)) items.push('crackers');
  if (rng.chance(0.32)) items.push('tea');
  const patience = Math.round((46 + items.length * 9) * Math.max(0.78, 1 - (day - 1) * 0.05));
  return { items, patience };
}

export function ticketPrice(items) {
  return items.reduce((sum, id) => sum + (FOOD[id] ? FOOD[id].price : 0), 0);
}
