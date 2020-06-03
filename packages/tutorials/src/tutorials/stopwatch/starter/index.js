import React from "react"
import {
  StartButton,
  StopButton,
  StopwatchLayout,
  Time,
  ResetButton,
} from "components"

export default function () {
  return (
    <StopwatchLayout>
      <Time>0.00</Time>
      <StartButton disabled={false} />
      <StopButton disabled={false} />
      <ResetButton />
    </StopwatchLayout>
  )
}
