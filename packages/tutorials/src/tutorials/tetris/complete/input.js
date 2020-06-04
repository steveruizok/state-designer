import * as React from "react"
import game from "./game"

export default function () {
  React.useEffect(() => {
    function handleKeydown(event) {
      switch (event.key) {
        case "Escape":
          event.preventDefault()
          game.send("STARTED")
          break
        case "ArrowLeft":
          event.preventDefault()
          game.send("MOVED_LEFT")
          break
        case "ArrowRight":
          event.preventDefault()
          game.send("MOVED_RIGHT")
          break
        case "ArrowUp":
          event.preventDefault()
          game.send("ROTATED_CLOCKWISE")
          break
        case "ArrowDown":
          event.preventDefault()
          game.send("STARTED_DROP")
          break
        case " ":
          event.preventDefault()
          game.send("HARD_DROPPED")
          break
        default:
          break
      }
    }

    function handleKeyup(event) {
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault()
          game.send("STOPPED_DROP")
          break
        default:
          break
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
