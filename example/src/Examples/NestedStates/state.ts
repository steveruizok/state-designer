import { createStateDesigner } from "state-designer"

export const state = createStateDesigner({
  data: {
    count: 0,
    min: 0,
    max: 10
  },
  initial: "inactive",
  states: {
    inactive: {
      on: {
        TURN_ON: { to: "active.restore" }
      }
    },
    active: {
      initial: "even",
      states: {
        odd: {},
        even: {}
      },
      onEvent: [
        {
          if: "countIsOdd",
          to: "odd"
        },
        {
          unless: "countIsOdd",
          to: "even"
        }
      ],
      on: {
        TURN_OFF: { to: "inactive" },
        CLICKED_MINUS: {
          unless: "atMin",
          do: "decrementCount"
        },
        CLICKED_PLUS: {
          unless: "atMax",
          do: "incrementCount"
        }
      }
    }
  },
  actions: {
    incrementCount: data => data.count++,
    decrementCount: data => data.count--
  },
  conditions: {
    countIsOdd: data => data.count % 2 === 1,
    atMin: data => data.count === data.min,
    atMax: data => data.count === data.max
  }
})
