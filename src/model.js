import db from './db.js';
import { shuffle } from './util.js';

const randomizedDb = shuffle(db);

let startIndex = 0;
function getBatch(size) {
  const slice = randomizedDb.slice(startIndex, startIndex + size);
  startIndex += size;
  // this wraps to start if you've reached the end
  if (slice.length === 0) {
    startIndex = 0;
    return getBatch(size);
  }
  return slice;
}

const getOne = () => getBatch(0)[0];

const rowCount = (function() {
  const rowHeight = 70; // includes padding of single row
  const deadHeight = 70; // button + padding = dead height
  const rows = Math.floor((window.innerHeight - deadHeight) / rowHeight);
  return rows;
})();

const state = {
  activeVideoId: getOne().id,
  videos: getBatch(rowCount)
}

const listeners = [];
const subscribe = (fn) => listeners.push(fn);
const notify = () => listeners.forEach((fn) => fn(state));

const getRandomItemIndex = (arr) => Math.floor(Math.random() * arr.length);

function pickVideo(i) {
  const video = state.videos[i];
  state.activeVideoId = video.id;
  state.videos[i] = getOne();
  notify();
}

function clickedRandomButton() {
  pickVideo(getRandomItemIndex(state.videos));
}

function refetch() {
  state.videos = getBatch(rowCount);
  notify();
}

export subscribe;
export refetch;
export clickedRandomButton;
export pickVideo;
export state;
