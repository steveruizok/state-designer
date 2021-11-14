import React from "react"
import { CounterLayout, Count, PlusButton, MinusButton } from "components"

export default function () {
  return (
    <CounterLayout>
      <MinusButton>Decrease</MinusButton>
      <Count>0</Count>
      <PlusButton>Increase</PlusButton>
    </CounterLayout>
  )
}
