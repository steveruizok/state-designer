import * as React from "react"

export default function ({ onKeyDown = {}, onKeyUp = {} }) {
  React.useEffect(() => {
    function handleKeydown(event) {
      if (onKeyDown[event.key] !== undefined) {
        event.preventDefault()
        onKeyDown[event.key]()
      }
    }

    function handleKeyup(event) {
      if (onKeyUp[event.key] !== undefined) {
        event.preventDefault()
        onKeyUp[event.key]()
      }
    }

    document.body.addEventListener("keydown", handleKeydown)
    document.body.addEventListener("keyup", handleKeyup)
    return () => {
      document.body.removeEventListener("keydown", handleKeydown)
      document.body.removeEventListener("keyup", handleKeyup)
    }
  }, [])
}
