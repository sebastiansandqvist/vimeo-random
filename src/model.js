import db from './db.js';
import { shuffle } from './util.js';

function shuffleAndSave(db) {
  console.log('Had no local db');
  const shuffled = shuffle(db);
  window.localStorage.setItem('random-db', JSON.stringify(shuffled));
  return shuffled;
}

const localDb = window.localStorage.getItem('random-db');
const randomizedDb = localDb ? JSON.parse(localDb) : shuffleAndSave(db);

const localStartIndex = parseInt(window.localStorage.getItem('start-index'), 10);
console.log({ localStartIndex });

let startIndex = localStartIndex || 0;
function getBatch(size) {
  window.localStorage.setItem('start-index', startIndex);
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
};

export const state = {
  activeVideoId: window.location.hash.slice(1) || getOne().id,
  videos: getBatch(getRowCount())
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

export function clickedRandomButton() {
  pickVideo(getRandomItemIndex(state.videos));
}

export function refetch() {
  state.videos = getBatch(getRowCount());
  notify();
}
