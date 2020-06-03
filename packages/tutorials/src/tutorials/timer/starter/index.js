import React from "react"
import { TimerLayout, Time, ResetButton, Button } from "components"

export default function () {
  return (
    <TimerLayout>
      <Time blinking={false}>00:00</Time>
      <Button disabled={false}>Min</Button>
      <Button disabled={false}>Sec</Button>
      <Button disabled={false}>START</Button>
      <ResetButton />
    </TimerLayout>
  )
}
