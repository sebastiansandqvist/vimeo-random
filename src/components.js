const SIDEBAR_WIDTH = 300;

export const Player = {
  view({ attrs }) {
    return (
      m('.player',
        m('iframe[frameborder=0][allowfullscreen]', {
          height: `${window.innerHeight}px`,
          src: `https://player.vimeo.com/video/${attrs.id}`,
          width: `${window.innerWidth - SIDEBAR_WIDTH}px`,
        })
      )
    );
  }
}

const Thumbnail = {
  view({ attrs }) {
    return (
      m('img.sidebar-video-thumbnail', {
        alt: 'video thumbnail',
        src: `https://i.vimeocdn.com/video/${attrs.thumbnail}_90x60.jpg`,
        oncreate({ dom }) { dom.style.display = 'none'; },
        onload(event) { event.target.style.display = 'inline-block'; }
      })
    );
  }
}

export const Sidebar = {
  view({ attrs, children }) {
    return (
      m('.sidebar',
        children,
        m('div',
          attrs.videos.map((video, i) => video ? (
            m('.sidebar-video', { onclick() { attrs.onSelection(i); }},
              m(Thumbnail, { thumbnail: video.thumbnail }),
              m('.sidebar-video-title', video.title)
            )
          ) : (
            m('.sidebar-video', m('.loading'))
          ))
        )
      )
    );
  }
}
