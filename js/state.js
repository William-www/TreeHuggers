const state = { geoid: null };
const listeners = [];

function setState(patch) {
  Object.assign(state, patch);
  listeners.forEach((fn) => fn(state));
}

function onState(fn) {
  listeners.push(fn);
}
