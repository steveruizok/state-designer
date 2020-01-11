import React from "react"
import { createStateDesigner } from "state-designer"
import { Visualizer } from "./components/Visualizer"

export interface Props {}

export const TransitionLoop: React.FC<Props> = () => {
  const designer = createStateDesigner({
    data: {
      count: 0
    },
    initial: "inactive",
    on: {
      TOGGLE: { to: "inactive" }
    },
    states: {
      active: {
        onEnter: { to: "inactive" }
      },
      inactive: {
        onEnter: { to: "active" }
      }
    }
  })

  return <Visualizer title="onEnter Transitions" designer={designer} />
}
