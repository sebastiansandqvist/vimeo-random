import m from 'mithril';
import { Player, Sidebar } from './components.js';
import { clickedRandomButton, clickedRefetchButton, refetch, pickVideo, subscribe, state } from './model.js';

subscribe(() => m.redraw());

function App() {
  refetch();
  return {
    view() {
      return [
        m('.contain',
          m(Player, { id: state.activeVideoId }),
          m(Sidebar, { videos: state.videos, onSelection: pickVideo }),
          m('.buttons',
            m('button', { onclick: clickedRandomButton }, 'Pick Random Video'),
            m('button', { onclick: refetch }, 'Fetch New Batch')
          )
        )
      ];
    }
  }
}

const mountNode = document.getElementById('app');
m.mount(mountNode, App)
