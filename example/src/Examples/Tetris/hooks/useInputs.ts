import * as React from "react"
import game from "../game"

export const useInputs = () => {
  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      switch (event.key) {
        case "ArrowLeft":
        case "a":
          game.send("MOVED_LEFT")
          break

        case "ArrowRight":
        case "d":
          game.send("MOVED_RIGHT")
          break

        case "ArrowUp":
        case "w":
          game.send("ROTATED")
          break

        case "ArrowDown":
        case "s":
          game.send("STARTED_MOVE_DOWN")
          break

        default:
          break
      }
    }

    function handleKeyUp(event: KeyboardEvent) {
      switch (event.key) {
        case "ArrowDown":
        case "s":
          game.send("ENDED_MOVE_DOWN")
          break

        default:
          break
      }
    }

    document.body.addEventListener("keydown", handleKeyDown)
    document.body.addEventListener("keyup", handleKeyUp)

    return () => {
      document.body.removeEventListener("keydown", handleKeyDown)
      document.body.removeEventListener("keyup", handleKeyUp)
    }
  }, [game.send])
}
