import React from "react"
import {
  TimerLayout,
  Time,
  ResetButton,
  MinuteButton,
  SecondButton,
  StartStopButton,
} from "components"
import { useStateDesigner } from "@state-designer/react"

export default function () {
  const state = useStateDesigner({
    initial: "stopped",
    states: {
      stopped: {
        on: {
          ENTERED_MINUTE: "addOneMinute",
          ENTERED_SECOND: "addOneSecond",
          RESET: "resetTime",
          START_STOPPED: {
            unless: "secondsIsZero",
            to: "running",
          },
        },
      },
      running: {
        on: {
          START_STOPPED: { to: "stopped" },
          RESET: { do: "resetTime", to: "stopped" },
        },
        repeat: {
          onRepeat: [
            "subtractOneSecond",
            {
              if: "secondsIsZero",
              to: "complete",
            },
          ],
          delay: 1,
        },
      },
      complete: {
        onEvent: { to: "stopped" },
      },
    },
    data: { seconds: 0 },
    conditions: {
      secondsIsZero(data) {
        return data.seconds === 0
      },
    },
    actions: {
      addOneMinute(data) {
        data.seconds += 60
      },
      addOneSecond(data) {
        data.seconds++
      },
      subtractOneSecond(data) {
        data.seconds--
      },
      resetTime(data) {
        data.seconds = 0
      },
    },
    values: {
      minutes(data) {
        const m = Math.floor(data.seconds / 60)
        return m.toString().padStart(2, "0")
      },
      seconds(data) {
        const s = data.seconds % 60
        return s.toString().padStart(2, "0")
      },
    },
  })
  return (
    <TimerLayout>
      <Time blinking={state.isIn("complete")}>
        {state.values.minutes}:{state.values.seconds}
      </Time>
      <MinuteButton
        disabled={!state.can("ENTERED_MINUTE")}
        onClick={() => state.send("ENTERED_MINUTE")}
      />
      <SecondButton
        disabled={!state.can("ENTERED_SECOND")}
        onClick={() => state.send("ENTERED_SECOND")}
      />
      <StartStopButton
        disabled={state.isIn("stopped") && !state.can("START_STOPPED")}
        onClick={() => state.send("START_STOPPED")}
      >
        {state.isIn("stopped") ? "Start" : "Stop"}
      </StartStopButton>
      <ResetButton onClick={() => state.send("RESET")} />
    </TimerLayout>
  )
}
