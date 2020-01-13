# state-designer

State Designer is a state and event management tool designed to make state make sense.

**Work in progress! Don't use this guy yet.**

## Install

```bash
npm install --save state-designer
```

```bash
yarn add state-designer
```

# Examples

The `StateDesigner` configuration syntax is optimized for flexibility.

As a state's configuration becomes more complex, you may use different strategies to keep the configuration easy to read and understand. The examples below show some of that evolution.

**Handling events with action functions:**

```tsx
import * as React from "react"
import { useStateDesigner } from "state-designer"

const Counter = () => {
  const { data, send } = useStateDesigner({
    data: {
      value: 0
    },
    on: {
      DECREMENT: data => data.value--,
      INCREMENT: data => data.value++
    }
  })
  return (
    <div>
      Value: {data.value}
      <div>
        <button onClick={() => send("DECREMENT")}>-</button>
        <button onClick={() => send("INCREMENT")}>+</button>
      </div>
    </div>
  )
}
```

**Handling events with event handler objects:**

```tsx
import * as React from "react"
import { useStateDesigner } from "state-designer"

const Counter = () => {
  const { data, can, values, send } = useStateDesigner({
    data: {
      value: 0,
      max: 10,
      min: 0
    },
    on: {
      ADJUST: {
        get: (data, delta) => {
          return data.count + delta
        },
        if: (data, delta, adjustedValue) => {
          return !(adjustedValue < data.min || adjustedValue > data.max)
        },
        do: (data, delta) => {
          data.count += delta
        }
      }
    }
  })
  return (
    <div>
      Value: {data.value}
      <div>
        <button
          disabled={!can("ADJUST", -1)}
          onClick={() => send("ADJUST", -1)}
        >
          -
        </button>
        <button disabled={!can("ADJUST", 1)} onClick={() => send("ADJUST", 1)}>
          +
        </button>
      </div>
    </div>
  )
}
```

**Using named functions to simplify event handlers:**

```tsx
import * as React from "react"
import { useStateDesigner } from "state-designer"

const Counter = () => {
  const { data, can, values, send } = useStateDesigner({
    data: {
      value: 0,
      max: 10,
      min: 0
    },
    on: {
      ADJUST: {
        get: "adjustedValue",
        if: "adjustedValueIsValid",
        do: "adjustTotal"
      }
    },
    results: {
      adjustedValue: (data, delta) => {
        return data.count + delta
      }
    },
    conditions: {
      adjustedValueIsValid: (data, delta, adjustedValue) => {
        return !(adjustedValue < data.min || adjustedValue > data.max)
      }
    },
    actions: {
      adjustValue: (data, delta) => {
        data.count += delta
      }
    }
  })
  return (
    <div>
      Value: {data.value}
      <div>
        <button
          disabled={!can("ADJUST", -1)}
          onClick={() => send("ADJUST", -1)}
        >
          -
        </button>
        <button disabled={!can("ADJUST", 1)} onClick={() => send("ADJUST", 1)}>
          +
        </button>
      </div>
    </div>
  )
}
```

**Re-using named functions between event handlers, and using functions (and event handlers) in series:**

```tsx
import * as React from "react"
import { useStateDesigner } from "state-designer"

const Counter = () => {
  const { data, send } = useStateDesigner({
    data: {
      value: 0
    },
    on: {
      INCREMENT: {
        get: ["value", "incrementedValue"],
        do: ["setValue", () => console.log("Doubled the value!")]
      },
      DOUBLE: {
        get: ["value", "doubledValue"],
        do: ["setValue", () => console.log("Doubled the value!")]
      },
      SQUARE: {
        get: ["value", "doubledValue", "doubledValue"],
        do: "setValue"
      },
      SPLIT_SQUARE: [
        {
          get: ["value", "doubledValue"],
          do: "setValue"
        },
        {
          get: ["value", "doubledValue"],
          do: "setValue"
        }
      ]
    },
    get: {
      value: data => data.value,
      incrementedValue: (data, payload, value) => value + 1,
      doubledValue: (data, payload, value) => value * 2
    },
    actions: {
      setValue: (data, payload, value) => (data.value = value)
    }
  })
  return (
    <div>
      Value: {data.value}
      <div>
        <button onClick={() => send("INCREMENT")}>+</button>
        <button onClick={() => send("DOUBLE")}>*2</button>
        <button onClick={() => send("SQUARE")}>**2</button>
        <button onClick={() => send("SPLIT_SQUARE")}>**2</button>
      </div>
    </div>
  )
}
```

### Usage without React

The `useStateDesigner` hook is a slim interface for the `StateDesigner` class. You can use this class on its own, too. Once you've created a `StateDesigner` class instance, you can `subscribe` to changes to its state and `send` events to the state. (You may also `unsubscribe` before unmounting elements.)

```tsx
import * as React from "react"

import { StateDesigner } from "state-designer"

const counter = new StateDesigner({
  data: {
    value: 0
  },
  on: {
    INCREMENT: data => data.value++
  }
})

const current = document.getElementById("current"),
  button = document.getElementById("button")

counter.subscribe(data => {
  current.textContent = `Value: ${data.value}`
})

button.onclick = () => {
  counter.send("INCREMENT")
}
```

### Sharing States

The `useStateDesigner` hook can accept either the configuration for a `StateDesigner` class instance (as hown above) or a `StateDesigner` class instance. When using a `StateDesigner` instance, the instance can serve as a shared store between multiple hooks, as well as a means of communication between machines.

```tsx
import * as React from "react"

import { StateDesigner, useStateDesigner } from "state-designer"

const counter = new StateDesigner({
  data: {
    value: 0
  },
  on: {
    INCREMENT: data => data.value++
  }
})

const Counter = () => {
  const { data, send } = useStateDesigner(counter)

  return (
    <div>
      Value: {data.value}
      <div>
        <button onClick={() => send("INCREMENT")}>+</button>
      </div>
    </div>
  )
}
```

## License

MIT © [steveruizok](https://github.com/steveruizok)
