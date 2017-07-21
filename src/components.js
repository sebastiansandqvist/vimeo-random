export const Player = {
  view({ attrs }) {
    return (
      m('.player',
        m('iframe[height=400][width=760][frameborder=0][allowfullscreen]', {
          src: `https://player.vimeo.com/video/${attrs.id}`
        })
      )
    );
  }
}

export const Sidebar = {
  view({ attrs }) {
    return (
      m('.sidebar',
        attrs.videos.map((video, i) => video ? (
          m('.sidebar-video', { onclick() { attrs.onSelection(i); }},
            m('img.sidebar-video-thumbnail', { src: video.thumbnail, alt: video.title }),
            m('.sidebar-video-title', video.title)
          )
        ) : (
          m('.sidebar-video', m('.loading'))
        ))
      )
    );
  }
}
