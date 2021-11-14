import React from "react"
import {
  TimerLayout,
  Time,
  StartStopButton,
  ResetButton,
  MinuteButton,
  SecondButton,
} from "components"

export default function () {
  return (
    <TimerLayout>
      <Time blinking={false}>00:00</Time>
      <MinuteButton disabled={false} />
      <SecondButton disabled={false} />
      <StartStopButton disabled={false}>Start</StartStopButton>
      <ResetButton />
    </TimerLayout>
  )
}
