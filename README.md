# State Designer

State Designer is a JavaScript and TypeScript library for managing the state of a user interface. It prioritizes the design experience, making it easy to experiment with ideas, iterate on solutions, and communicate the final result.

Learn more at [statedesigner.com](https://statedesigner.com).

## Features

- Create your state using a flexible, declaratively syntax.
- Use collections to re-use code and make your state human-readable.
- Create both global and local component states.

## Packages

- [`@state-designer/core`](https://github.com/@state-designer/core) - Core library.
- [`@state-designer/react`](https://github.com/@state-designer/react) - React hook.

## Starters

- [JavaScript](https://codesandbox.io/s/state-designer-vanilla-javascript-gmxhy)
- [React](https://codesandbox.io/s/state-designer-react-r0z0v)
- [React + TypeScript](https://codesandbox.io/s/state-designer-react-typescript)

## Usage

Using State Designer involves three steps:

1. Create a state with a configuration object.
2. Subscribe to the state's updates.
3. Send events to the state.

Your exact usage will depend on your framework:

- [Usage in JavaScript](https://github.com/@state-designer/core#usage)
- [Usage in React](https://github.com/@state-designer/react#usage)

## Example

**Note:** this example uses the [React](https://github.com/@state-designer/react) package.

[![Edit little-snowflake-rmu8q](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/little-snowflake-rmu8q?fontsize=14&hidenavigation=1&theme=dark)

```jsx
import React from "react"
import { useStateDesigner } from "@state-designer/react"

function App() {
  const { data, send, can, whenIn } = useStateDesigner({
    data: { count: 1 },
    initial: "inactive",
    states: {
      inactive: {
        on: { TOGGLED: { to: "active" } },
      },
      active: {
        on: {
          TOGGLED: { to: "inactive" },
          CLICKED_PLUS: { if: "belowMax", do: "increment" },
          CLICKED_MINUS: "decrement",
        },
      },
    },
    actions: {
      increment(d) {
        d.count++
      },
      decrement(d) {
        d.count--
      },
    },
    conditions: {
      belowMax(d) {
        return d.count < 10
      },
    },
  })

  return (
    <div className="App">
      <h2>{data.count}</h2>
      <button
        disabled={!can("CLICKED_MINUS")}
        onClick={() => send("CLICKED_MINUS")}
      >
        -1
      </button>
      <button
        disabled={!can("CLICKED_PLUS")}
        onClick={() => send("CLICKED_PLUS")}
      >
        +1
      </button>
      <button onClick={() => send("TOGGLED")}>
        {whenIn({
          active: "Turn Off",
          inactive: "Turn On",
        })}
      </button>
    </div>
  )
}

export default App
```

## Inspiration

State Designer is heavily inspired by [xstate](https://github.com/davidkpiano/xstate). Note that, unlike xstate, State Designer does not adhere to the [scxml spec](https://en.wikipedia.org/wiki/SCXML).

## Author

- [Steve Ruiz](https://twitter.com/@steveruizok)

## License

[MIT](https://oss.ninja/mit/steveruizok)
