import React from "react"
import { TimerLayout, Time, ResetButton, Button } from "components"

export default function () {
  return (
    <TimerLayout>
      <Time>00:00</Time>
      <Button>Min</Button>
      <Button>Sec</Button>
      <Button>Start</Button>
      <ResetButton />
    </TimerLayout>
  )
}
