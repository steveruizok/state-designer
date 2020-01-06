import { createStateDesignerConfig } from "state-designer"

export const CounterConfig = createStateDesignerConfig({
  data: {
    count: 1
  },
  on: {
    INCREMENT: {
      do: "increment",
      unless: "atMax"
    },
    DECREMENT: {
      do: "decrement",
      unless: "atMin"
    }
  },
  actions: {
    increment: data => data.count++,
    decrement: data => data.count--
  },
  conditions: {
    aboveMin: data => data.count > 0,
    belowMax: data => data.count < 10,
    atMax: data => data.count === 10,
    atMin: data => data.count === 0
  },
  results: {
    double: data => data.count * 2
  }
})
