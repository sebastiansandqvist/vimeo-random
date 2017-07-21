(function (m$1) {
'use strict';

m$1 = m$1 && m$1.hasOwnProperty('default') ? m$1['default'] : m$1;

var Player = {
  view: function view(ref) {
    var attrs = ref.attrs;

    return (
      m('.player',
        m('iframe[height=400][width=760][frameborder=0][allowfullscreen]', {
          src: ("https://player.vimeo.com/video/" + (attrs.id))
        })
      )
    );
  }
};

var Sidebar = {
  view: function view(ref) {
    var attrs = ref.attrs;

    return (
      m('.sidebar',
        attrs.videos.map(function (video, i) { return video ? (
          m('.sidebar-video', { onclick: function onclick() { attrs.onSelection(i); }},
            m('img.sidebar-video-thumbnail', { src: video.thumbnail, alt: video.title }),
            m('.sidebar-video-title', video.title)
          )
        ) : (
          m('.sidebar-video', m('.loading'))
        ); })
      )
    );
  }
};

var listeners = [];
var subscribe = function (fn) { return listeners.push(fn); };

var state = {
  activeVideoId: '225408543',
  isLoadingVideo: true,
  videos: Array(10).fill(null),
};

var notify = function () { return listeners.forEach(function (fn) { return fn(state); }); };
var getRandomItemIndex = function (arr) { return Math.floor(Math.random() * arr.length); };

function pickVideo(i) {
  if (state.isLoadingVideo) { return; }
  var video = state.videos[i];
  state.activeVideoId = video.id;
  state.videos[i] = null;
  state.isLoadingVideo = true;
  notify();
  setTimeout(function () {
    state.videos[i] = { id: '225408543', title: 'foo', thumbnail: ("http://lorempizza.com/40/40/" + i)};
    state.isLoadingVideo = false;
    notify();
  }, 1000);
}

function clickedRandomButton() {
  var i = getRandomItemIndex(state.videos);
  pickVideo(i);
}

function refetch() {
  state.videos = Array(10).fill(null);
  state.isLoadingVideo = true;
  notify();
  setTimeout(function () {
    state.videos = state.videos.map(function (video, i) { return ({ id: '225408542', title: 'The dock', thumbnail: ("http://lorempizza.com/40/40/" + (i * Math.floor(Math.random() * 1000)))}); });
    state.isLoadingVideo = false;
    notify();
  }, 2000);
}

subscribe(function () { return m$1.redraw(); });

function App() {
  refetch();
  return {
    view: function view() {
      return [
        m$1('.contain',
          m$1(Player, { id: state.activeVideoId }),
          m$1(Sidebar, { videos: state.videos, onSelection: pickVideo }),
          m$1('.buttons',
            m$1('button', { onclick: clickedRandomButton }, 'Pick Random Video'),
            m$1('button', { onclick: refetch }, 'Fetch New Batch')
          )
        )
      ];
    }
  }
}

var mountNode = document.getElementById('app');
m$1.mount(mountNode, App);

}(m));
