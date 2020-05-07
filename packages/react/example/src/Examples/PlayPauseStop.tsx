import * as React from "react"
import { useStateDesigner } from "state-designer"

const PlayPauseStop: React.FC<{}> = () => {
  const { data, send, can } = useStateDesigner({
    initial: "stopped",
    states: {
      stopped: {
        on: {
          PLAY_PRESSED: { to: "playing" }
        },
        onExit: { to: "catcher" }
      },
      playing: {
        on: {
          STOP_PRESSED: { to: "stopped" },
          PAUSE_PRESSED: { to: "paused" }
        }
      },
      paused: {
        on: {
          PLAY_PRESSED: { to: "playing" },
          STOP_PRESSED: { to: "stopped" }
        }
      },
      catcher: {}
    }
  })

  return (
    <div className="example">
      <h2>Play Pause Stop</h2>
      <div className="button-group">
        <button
          disabled={!can("STOP_PRESSED")}
          onClick={() => {
            send("STOP_PRESSED")
          }}
        >
          Stop
        </button>
        <button
          disabled={!can("PLAY_PRESSED")}
          onClick={() => {
            send("PLAY_PRESSED")
          }}
        >
          Play
        </button>
        <button
          disabled={!can("PAUSE_PRESSED")}
          onClick={() => {
            send("PAUSE_PRESSED")
          }}
        >
          Pause
        </button>
      </div>
    </div>
  )
}

export default PlayPauseStop
