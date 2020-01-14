import { createStateDesigner } from "state-designer"

export const counter = createStateDesigner({
  data: {
    count: 0,
    min: 0,
    max: 10,
    inputValue: 0
  },
  initial: "odd",
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
    CHANGED_INPUT_VALUE: "setInputValue",
    CLICKED_MINUS: {
      unless: "atMin",
      do: "decrementCount"
    },
    CLICKED_PLUS: {
      unless: "atMax",
      do: "incrementCount"
    },
    CLICKED_SET_VALUE: {
      get: ["inputValue", "nextValue"],
      if: "nextValueIsValid",
      do: ["setValue", "resetInputValue"]
    }
  },
  results: {
    inputValue: data => data.inputValue,
    nextValue: (data, payload, result) => data.count + result
  },
  actions: {
    incrementCount: data => data.count++,
    decrementCount: data => data.count--,
    setInputValue: (data, payload) => (data.inputValue = payload),
    setValue: (data, payload, result) => (data.count = result),
    resetInputValue: data => (data.inputValue = 0)
  },
  conditions: {
    countIsOdd: data => data.count % 2 === 0,
    atMin: data => data.count === data.min,
    atMax: data => data.count === data.max,
    nextValueIsValid: (data, payload, result) => {
      return !(result < data.min || result > data.max)
    }
  }
})
