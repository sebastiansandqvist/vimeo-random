(function (m$1) {
'use strict';

m$1 = m$1 && m$1.hasOwnProperty('default') ? m$1['default'] : m$1;

var SIDEBAR_WIDTH = 300;

var Player = {
  view: function view(ref) {
    var attrs = ref.attrs;

    return (
      m('.player',
        m('iframe[frameborder=0][allowfullscreen]', {
          height: ((window.innerHeight) + "px"),
          src: ("https://player.vimeo.com/video/" + (attrs.id)),
          width: ((window.innerWidth - SIDEBAR_WIDTH) + "px"),
        })
      )
    );
  }
};

var Sidebar = {
  view: function view(ref) {
    var attrs = ref.attrs;
    var children = ref.children;

    return (
      m('.sidebar',
        children,
        m('div',
          attrs.videos.map(function (video, i) { return video ? (
            m('.sidebar-video', { onclick: function onclick() { attrs.onSelection(i); }},
              m('img.sidebar-video-thumbnail', {
                alt: video.title,
                src: ("https://i.vimeocdn.com/video/" + (video.thumbnail) + "_90x60.jpg"),
              }),
              m('.sidebar-video-title', video.title)
            )
          ) : (
            m('.sidebar-video', m('.loading'))
          ); })
        )
      )
    );
  }
};

var listeners = [];
var subscribe = function (fn) { return listeners.push(fn); };

var rowCount = (function() {
  var rowHeight = 70; // includes padding of single row
  var deadHeight = 70; // button + padding = dead height
  var rows = Math.floor((window.innerHeight - deadHeight) / rowHeight);
  return rows;
})();

var state = {
  activeVideoId: '225408543',
  isLoadingVideo: true,
  videos: Array(rowCount).fill(null),
};

var notify = function () { return listeners.forEach(function (fn) { return fn(state); }); };
function pickVideo(i) {
  if (state.isLoadingVideo) { return; }
  var video = state.videos[i];
  state.activeVideoId = video.id;
  state.videos[i] = null;
  state.isLoadingVideo = true;
  notify();
  setTimeout(function () {
    state.videos[i] = { id: '225408543', title: 'foo', thumbnail: '45546404'};
    state.isLoadingVideo = false;
    notify();
  }, 1000);
}



function refetch() {
  state.videos = Array(rowCount).fill(null);
  state.isLoadingVideo = true;
  notify();
  setTimeout(function () {
    state.videos = state.videos.map(function (video, i) { return ({ id: '225408542', title: 'The dock', thumbnail: ("http://lorempizza.com/40/40/" + (i * Math.floor(Math.random() * 1000)))}); });
    state.isLoadingVideo = false;
    notify();
  }, 2000);
}

subscribe(function () { return m$1.redraw(); });
window.onresize = function () { return m$1.redraw(); };

function App() {
  refetch();
  return {
    view: function view() {
      return [
        m$1(Player, { id: state.activeVideoId }),
        m$1(Sidebar, { videos: state.videos, onSelection: pickVideo },
          m$1('.button-area',
            m$1('button', { onclick: refetch }, 'New Random Batch')
          )
        )
      ];
    }
  }
}

var mountNode = document.getElementById('app');
m$1.mount(mountNode, App);

}(m));
