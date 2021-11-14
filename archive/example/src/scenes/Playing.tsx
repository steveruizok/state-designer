import * as React from "react"
import game from "../game"

import Next from "../components/Next"
import Playfield from "../components/Playfield"
import Stats from "../components/Stats"

const Playing: React.FC<{}> = () => {
  React.useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      switch (event.key) {
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

    function handleKeyup(event: KeyboardEvent) {
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

  return (
    <div className="App">
      <div className="Screen">
        <div className="Bricks" />
        <Playfield />
        <div className="Bricks" />
        <Next />
      </div>
      <Stats />
    </div>
  )
}

export default Playing
