import m from 'mithril';
import T from 's-types';

const SIDEBAR_WIDTH = 300;

const px = (x) => `${x}px`;
const playerUrl = (id) => `https://player.vimeo.com/video/${id}?autoplay=1`;
const thumbUrl = (id) => `https://i.vimeocdn.com/video/${id}_90x60.jpg`;

const PlayerType = T({
  id: T.string,
});

export const Player = {
  view({ attrs }) {
    PlayerType(attrs, 'Player');
    return (
      m('.player',
        m('iframe[frameborder=0][allowfullscreen]', {
          src: playerUrl(attrs.id),
          height: px(window.innerHeight),
          width: px(window.innerWidth - SIDEBAR_WIDTH),
        })
      )
    );
  },
};

const VideoType = T.schema({
  id: T.string,
  title: T.string,
  thumbnail: T.string,
});

const VideoLinkType = T({
  index: T.int,
  key: T.string,
  onSelection: T.fn,
  video: VideoType,
});

const VideoLink = {
  oncreate({ dom }) {
    dom.getElementsByTagName('img')[0].onload = () => dom.classList.add('entering');
  },
  view({ attrs }) {
    VideoLinkType(attrs, 'VideoLink');
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
        src: thumbUrl(attrs.video.thumbnail),
      }),
      m('.sidebar-video-title', attrs.video.title)
      )
    );
  },
};

const SidebarType = T({
  onSelection: T.fn,
  videos: T.arrayOf(VideoType),
});

export const Sidebar = {
  view({ attrs, children }) {
    SidebarType(attrs, 'Sidebar');
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
