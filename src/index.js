import m from 'mithril';
import { Player, Sidebar } from './components.js';
import {
  clickedRandomButton,
  pickVideo,
  refetch,
  state,
  subscribe,
} from './model.js';

subscribe(() => m.redraw());
window.onresize = () => m.redraw();

const App = {
  view() {
    return [
      m(Player, { id: state.activeVideoId }),
      m(Sidebar, { videos: state.videos, onSelection: pickVideo },
        m('.button-area',
          m('button', { onclick: refetch }, 'New Random Batch')
        )
      )
    ];
  }
}

const mountNode = document.getElementById('app');
m.mount(mountNode, App)
