import * as React from "react"

export function useScrollPosition(id = "0") {
  const rScroll = React.useRef(null)

  function handleScroll(e) {
    if (window && window.localStorage) {
      window.localStorage.setItem(
        "sd_docs_scroll_position_" + id,
        e.target.scrollTop.toFixed()
      )
    }
  }

  React.useLayoutEffect(() => {
    if (window && window.localStorage) {
      const scroll = rScroll.current
      const scrollY = parseInt(
        window.localStorage.getItem("sd_docs_scroll_position_" + id)
      )

      if (scroll) {
        scroll.scrollTop = scrollY
      }
    }
  }, [])

  return { ref: rScroll, onScroll: handleScroll }
}
