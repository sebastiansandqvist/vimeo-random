// import m from 'mithril';
import db from './db.js';

// const BASE_URL = 'http://modernasaserverapplication-env.fyzdduxbec.us-east-1.elasticbeanstalk.com/clips';


function shuffle(array) {
  let currentIndex = array.length;
  let temporaryValue;
  let randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

const randomizedDb = shuffle(db);

let startIndex = 0;
function getBatch(size) {
  const slice = randomizedDb.slice(startIndex, startIndex + size);
  startIndex += size;
  console.log(slice, startIndex, size);
  return slice;
}


const listeners = [];
export const subscribe = (fn) => listeners.push(fn);

const rowCount = (function() {
  const rowHeight = 70; // includes padding of single row
  const deadHeight = 70; // button + padding = dead height
  const rows = Math.floor((window.innerHeight - deadHeight) / rowHeight);
  console.log(rows);
  return rows;
})();

export const state = {
  activeVideoId: '225408543',
  // isLoadingVideo: true,
  videos: Array(rowCount).fill(null),
}

const notify = () => listeners.forEach((fn) => fn(state));
const getRandomItemIndex = (arr) => Math.floor(Math.random() * arr.length);

export function pickVideo(i) {
  // if (state.isLoadingVideo) return;
  const video = state.videos[i];
  state.activeVideoId = video.id;
  state.videos[i] = getBatch(1)[0];
  // state.isLoadingVideo = true;
  notify();
  // m.request({
  //   method: 'GET',
  //   url: `${BASE_URL}/0`,
  //   headers: {
  //     'Access-Control-Allow-Origin': '*'
  //   },
  // }).then((videos) => {
  //   console.log('single', videos);
  //   state.videos[i] = videos[0];
  //   state.isLoadingVideo = false;
  //   notify();
  // });
}

export function clickedRandomButton() {
  const i = getRandomItemIndex(state.videos);
  pickVideo(i);
}

export function refetch() {
  state.videos = getBatch(rowCount);
  // state.isLoadingVideo = true;
  notify();
  // m.request({
  //   method: 'GET',
  //   url: `${BASE_URL}/${rowCount - 1}`,
  //   headers: {
  //     'Access-Control-Allow-Origin': '*'
  //   },
  // }).then((videos) => {
  //   console.log('all', videos);
  //   state.videos = videos;
  //   state.isLoadingVideo = false;
  //   notify();
  // });
}
