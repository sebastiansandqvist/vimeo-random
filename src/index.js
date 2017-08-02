import m from 'mithril';
import { Player, Sidebar } from './components.js';
import {
  pickRandomVideo,
  pickVideo,
  refetch,
  state,
  subscribe,
} from './model.js';

subscribe(() => m.redraw());
window.onresize = () => m.redraw();

window.addEventListener('keyup', (event) => {
  if (event.key === 'n') return pickRandomVideo();
  if (event.key === 'v') return refetch();
});

const App = {
  view() {
    return [
      m(Player, { id: state.activeVideoId }),
      m(Sidebar, { videos: state.videos, onSelection: pickVideo },
        m('.button-area',
          m('button', { onclick: refetch }, m('img', { src: '/images/icon-random.svg' })),
          m('button.alt', { onclick: pickRandomVideo }, m('u', 'N'), 'ext')
        )
      ),
    ];
  },
};

const mountNode = document.getElementById('app');
m.mount(mountNode, App);
