import React from "react"
import { CounterLayout, Count, PlusButton, MinusButton } from "components"
import { useStateDesigner } from "@state-designer/react"

export default function () {
  const state = useStateDesigner({
    data: { count: 0 },
    on: {
      DECREASED: { unless: "countIsAtMin", do: "decrementCount" },
      INCREASED: "incrementCount",
    },
    actions: {
      decrementCount(data) {
        data.count--
      },
      incrementCount(data) {
        data.count++
      },
    },
    conditions: {
      countIsAtMin(data) {
        return data.count === 0
      },
    },
  })

  return (
    <CounterLayout>
      <MinusButton
        disabled={!state.can("DECREASED")}
        onClick={() => state.send("DECREASED")}
      >
        Decrease
      </MinusButton>
      <Count>{state.data.count}</Count>
      <PlusButton onClick={() => state.send("INCREASED")}>Increase</PlusButton>
    </CounterLayout>
  )
}
