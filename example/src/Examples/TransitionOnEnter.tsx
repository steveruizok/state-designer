import React from "react"
import { createStateDesigner } from "state-designer"
import { Visualizer } from "./components/Visualizer"

export interface Props {}

export const TransitionOnEnter: React.FC<Props> = () => {
  const designer = createStateDesigner({
    data: {
      count: 0
    },
    initial: "inactive",
    states: {
      active: {
        on: {
          TOGGLE: { to: "inactive" }
        },
        onEnter: [
          { if: "countIsEven", to: "even" },
          { if: "countIsOdd", to: "odd" }
        ],
        initial: "never",
        states: {
          never: {},
          odd: {},
          even: {}
        }
      },
      inactive: {
        on: {
          TOGGLE: { to: "active" },
          INCREMENT: "incrementCount",
          INCREMENT_BY: {
            get: "safePayload",
            do: "incrementCountBy"
          }
        }
      }
    },
    results: {
      safePayload: (data, payload) => (payload ? payload : 0)
    },
    conditions: {
      countIsOdd: data => data.count % 2 === 1,
      countIsEven: data => data.count % 2 === 0
    },
    actions: {
      incrementCount: data => data.count++,
      incrementCountBy: (data, payload, safePayload) =>
        (data.count += safePayload)
    }
  })

  return <Visualizer title="onEnter Transitions" designer={designer} />
}
