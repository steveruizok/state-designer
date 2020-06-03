import React from "react"
import {
  StartButton,
  StopButton,
  StopwatchLayout,
  Time,
  ResetButton,
} from "components"
import { useStateDesigner } from "@state-designer/react"

export default function () {
  const state = useStateDesigner({
    data: { milliseconds: 0 },
    initial: "stopped",
    states: {
      stopped: {
        on: {
          STARTED: { to: "running" },
        },
      },
      running: {
        on: {
          STOPPED: { to: "stopped" },
          RESET: { to: "stopped" },
        },
        repeat: {
          onRepeat: "addElapsedTime",
        },
      },
    },
    on: {
      RESET: "resetTime",
    },
    actions: {
      addElapsedTime(data, payload, result) {
        const { interval } = result
        data.milliseconds += interval
      },
      resetTime(data) {
        data.milliseconds = 0
      },
    },
    values: {
      seconds(data) {
        return (data.milliseconds / 1000).toFixed(2)
      },
    },
  })
  return (
    <StopwatchLayout>
      <Time>{state.values.seconds}</Time>
      <StartButton
        disabled={state.isIn("running")}
        onClick={() => state.send("STARTED")}
      />
      <StopButton
        disabled={state.isIn("stopped")}
        onClick={() => state.send("STOPPED")}
      />
      <ResetButton onClick={() => state.send("RESET")} />
    </StopwatchLayout>
  )
}
