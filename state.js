import { CARD_COUNT } from './cards.js';

export const STORAGE_KEY = 'mom-home-v3';
const integer = (value, max = 100000) => Number.isFinite(Number(value))
  ? Math.min(max, Math.max(0, Math.floor(Number(value)))) : 0;
const validCard = id => Number.isInteger(id) && id >= 0 && id < CARD_COUNT;

export function cleanState(value = {}) {
  const v = value && typeof value === 'object' ? value : {};
  // The earlier four-card version had no deckSize. Preserve its collection,
  // but start a fresh bag so all twenty notes can appear immediately.
  const bag = v.deckSize === CARD_COUNT ? v.bag : [];
  return {
    visits: integer(v.visits),
    flowers: integer(v.flowers, 9999),
    waterings: integer(v.waterings),
    teas: integer(v.teas),
    collected: [...new Set((Array.isArray(v.collected) ? v.collected : []).filter(validCard))],
    bag: [...new Set((Array.isArray(bag) ? bag : []).filter(validCard))],
    deckSize: CARD_COUNT,
    photos: (Array.isArray(v.photos) ? v.photos : [])
      .filter(photo => typeof photo === 'string'
        && /^data:image\/(jpeg|png|webp);base64,/.test(photo)
        && photo.length < 700000).slice(0, 4),
    lastCard: validCard(v.lastCard) ? v.lastCard : -1,
  };
}

export function createStore(storage) {
  let persistent = true, state;
  try {
    state = cleanState(JSON.parse(storage?.getItem(STORAGE_KEY) || '{}'));
    if (!storage) persistent = false;
  } catch {
    state = cleanState(); persistent = false;
  }
  function save() {
    try {
      if (!storage) throw Error();
      storage.setItem(STORAGE_KEY, JSON.stringify(state)); persistent = true;
    } catch { persistent = false; }
    return persistent;
  }
  function draw(random = Math.random) {
    if (!state.bag.length) {
      state.bag = Array.from({ length: CARD_COUNT }, (_, id) => id);
      for (let i = CARD_COUNT - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [state.bag[i], state.bag[j]] = [state.bag[j], state.bag[i]];
      }
      if (CARD_COUNT > 1 && state.bag[0] === state.lastCard) {
        [state.bag[0], state.bag[1]] = [state.bag[1], state.bag[0]];
      }
    }
    const id = state.bag.shift();
    state.lastCard = id;
    if (!state.collected.includes(id)) state.collected.push(id);
    save();
    return id;
  }
  return {
    get data() { return state; },
    get persistent() { return persistent; },
    save,
    visit() { state.visits++; state.flowers = Math.min(9999, state.flowers + 1); save(); },
    water() { state.waterings++; save(); },
    tea() { state.teas++; save(); },
    plant() { state.flowers = Math.min(9999, state.flowers + 1); save(); },
    photos(photos) { state.photos = cleanState({ photos }).photos; return save(); },
    draw,
  };
}
