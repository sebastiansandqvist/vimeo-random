import m from 'mithril';

const SIDEBAR_WIDTH = 300;

// let shouldAutoplay = false;
// function autoplay() {
//   if (shouldAutoplay) return '?autoplay=1';
//   shouldAutoplay = true;
//   return '';
// }

export const Player = {
  view({ attrs }) {
    return (
      m('.player',
        m('iframe[frameborder=0][allowfullscreen]', {
          height: `${window.innerHeight}px`,
          src: `https://player.vimeo.com/video/${attrs.id}?autoplay=1`,
          width: `${window.innerWidth - SIDEBAR_WIDTH}px`,
        })
      )
    );
  },
};

const VideoLink = {
  oncreate({ dom }) {
    dom.getElementsByTagName('img')[0].onload = function() {
      dom.className += ' entering';
    };
  },
  view({ attrs }) {
    return (
      m('a.sidebar-video', {
        href: `#${attrs.video.id}`,
        onclick(event) {
          if (event.ctrlKey || event.metaKey) return;
          attrs.onSelection(attrs.index);
          event.preventDefault();
        },
      },
      m('img.sidebar-video-thumbnail', {
        alt: 'Video thumbnail',
        src: `https://i.vimeocdn.com/video/${attrs.video.thumbnail}_90x60.jpg`,
      }),
      m('.sidebar-video-title', attrs.video.title)
      )
    );
  },
};

export const Sidebar = {
  view({ attrs, children }) {
    return (
      m('.sidebar',
        children,
        m('div',
          attrs.videos.map((video, index) => (
            m(VideoLink, { video, index, onSelection: attrs.onSelection, key: video.id })
          ))
        )
      )
    );
  },
};
