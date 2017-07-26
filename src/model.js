import db from './db.js';
import { shuffle } from './util.js';

const storage = (function determineAllowedStorage() {
  try {
    window.localStorage.setItem('foo', 'bar');
    if (window.localStorage.getItem('foo') !== 'bar') return 'sessionStorage';
  }
  catch (err) { return 'sessionStorage'; }
  return 'localStorage';
})();

function shuffleAndSave() {
  const shuffled = shuffle(db);
  window[storage].setItem('random-db', JSON.stringify(shuffled));
  return shuffled;
}

const localDb = window[storage].getItem('random-db');
const randomizedDb = localDb ? JSON.parse(localDb) : shuffleAndSave();

const localStartIndex = parseInt(window[storage].getItem('start-index'), 10);

let startIndex = localStartIndex || 0;
function getBatch(size) {
  window[storage].setItem('start-index', startIndex);
  const slice = randomizedDb.slice(startIndex, startIndex + size);
  startIndex += size;
  // this wraps to start if you've reached the end
  if (slice.length === 0) {
    startIndex = 0;
    return getBatch(size);
  }
  return slice;
}

const getOne = () => getBatch(1)[0];

function getRowCount() {
  const rowHeight = 70; // includes padding of single row
  const deadHeight = 70; // button + padding = dead height
  const rows = Math.floor((window.innerHeight - deadHeight) / rowHeight);
  return rows;
}

export const state = {
  activeVideoId: window.location.hash.slice(1) || getOne().id,
  videos: getBatch(getRowCount()),
};

const listeners = [];
export const subscribe = (fn) => listeners.push(fn);
const notify = () => listeners.forEach((fn) => fn(state));

const getRandomItemIndex = (arr) => Math.floor(Math.random() * arr.length);

export function pickVideo(i) {
  const video = state.videos[i];
  state.activeVideoId = video.id;
  state.videos[i] = getOne();
  window.location.hash = video.id;
  notify();
}

export function pickRandomVideo() {
  pickVideo(getRandomItemIndex(state.videos));
}

export function refetch() {
  state.videos = getBatch(getRowCount());
  notify();
}
