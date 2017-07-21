const listeners = [];
export const subscribe = (fn) => listeners.push(fn);

const rowCount = (function() {
  const rowHeight = 70; // includes padding of single row
  const deadHeight = 70; // button + padding = dead height
  const rows = Math.floor((window.innerHeight - deadHeight) / rowHeight);
  return rows;
})();

export const state = {
  activeVideoId: '225408543',
  isLoadingVideo: true,
  videos: Array(rowCount).fill(null),
}

const notify = () => listeners.forEach((fn) => fn(state));
const getRandomItemIndex = (arr) => Math.floor(Math.random() * arr.length);

export function pickVideo(i) {
  if (state.isLoadingVideo) return;
  const video = state.videos[i];
  state.activeVideoId = video.id;
  state.videos[i] = null;
  state.isLoadingVideo = true;
  notify();
  setTimeout(() => {
    state.videos[i] = { id: '225408543', title: 'foo', thumbnail: '45546404'}
    state.isLoadingVideo = false;
    notify();
  }, 1000);
}

export function clickedRandomButton() {
  const i = getRandomItemIndex(state.videos);
  pickVideo(i);
}

export function refetch() {
  state.videos = Array(rowCount).fill(null);
  state.isLoadingVideo = true;
  notify();
  setTimeout(() => {
    state.videos = state.videos.map((video, i) => ({ id: '225408542', title: 'The dock', thumbnail: `http://lorempizza.com/40/40/${i * Math.floor(Math.random() * 1000)}`}))
    state.isLoadingVideo = false;
    notify();
  }, 2000);
}
