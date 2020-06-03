import React from "react"
import { StopwatchLayout, Time, ResetButton, Button } from "components"

export default function () {
  return (
    <StopwatchLayout>
      <Time>{state.values.seconds}</Time>
      <Button disabled={false}>START</Button>
      <Button disabled={false}>STOP</Button>
      <ResetButton />
    </StopwatchLayout>
  )
}
