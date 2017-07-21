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

export const Sidebar = {
  view({ attrs, children }) {
    return (
      m('.sidebar',
        children,
        m('div',
          attrs.videos.map((video, i) => video ? (
            m('.sidebar-video', { onclick() { attrs.onSelection(i); }},
              m('img.sidebar-video-thumbnail', {
                alt: video.title,
                src: `https://i.vimeocdn.com/video/${video.thumbset}_90x60.jpg`,
              }),
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
