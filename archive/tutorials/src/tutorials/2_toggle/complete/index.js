import React from "react"
import { ToggleLayout, Label, Toggle } from "components"
import { useStateDesigner } from "@state-designer/react"

export default function () {
  const state = useStateDesigner({
    initial: "toggledOff",
    states: {
      toggledOff: {
        on: { TOGGLED: { to: "toggledOn" } },
      },
      toggledOn: {
        on: { TOGGLED: { to: "toggledOff" } },
      },
    },
  })

  return (
    <ToggleLayout>
      <Toggle
        isToggled={state.isIn("toggledOn")}
        onChange={() => state.send("TOGGLED")}
      />
      <Label>
        {state.whenIn({
          toggledOn: "ON",
          toggledOff: "OFF",
        })}
      </Label>
    </ToggleLayout>
  )
}
