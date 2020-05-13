# State Designer / React

This package includes the core functions of [State Designer](https://statedesigner.com), a JavaScript state management library, together with a React hook for use in React. [Click here](https://statedesigner.com) to learn more.

You can use this package in any React project. It supports TypeScript, too.

For other JavaScript projects, see [@state-designer/core](https://github.com/@state-designer/core).

## Installation

```bash
npm install @state-designer/react

# or

yarn add @state-designer/react
```

## Usage

For the basics of State Designer, see the documentation for [@state-designer/core](https://github.com/@state-designer/core).

You can use the `useStateDesigner` hook to subscribe to either a global state or a local component state.

### Global State

To subscribe to a global state:

1.  Create the state using `createStateDesigner`.

```js
// state.js

import { createStateDesigner } from "@state-designer/react"

export const state = createStateDesigner({
  data: { items: 0 },
  on: {
    ADDED_ITEMS: {
      unless: (data, payload) => data.items + payload > 10,
      do: (data, payload) => (data.items += payload),
    },
    RESET: (data) => (data.items = 0),
  },
})
```

2.  Pass the state to the `useStateDesigner` hook.

```jsx
// Counter.jsx

import React from "react"
import { useStateDesigner } from "@state-designer/react"
import { state } from "./state"

export default function Counter() {
  const { data, send } = useStateDesigner(state)

  return (
    <div className="Counter">
      <h2>{data.items}</h2>
      <button onClick={() => send("ADDED_ITEMS", 2)}>Add two items</button>
      <button onClick={() => send("RESET")}>Reset</button>
    </div>
  )
}
```

You can subscribe any number of components to the same state.

```jsx
import React from "react"
import Counter from "./Counter"

export default function App() {
  return (
    <div className="App">
      <Counter />
      <Counter />
      <Counter />
    </div>
  )
}
```

In the example above, all three Counters would share the same state.

#### Sending events

A component does not have to be subscribed to a state in order to send it events. You can call `state.send` from any place in your project. If the event causes an update, then any components that are subscribed to the update will render in response.

```jsx
import React from "react"
import Counter from "./Counter"
import { state } from "./state"

export default function App() {
  return (
    <div className="App">
      <Counter />
      <Counter />
      <Counter />
      <button onClick={() => state.send("RESET")}>Reset</button>
    </div>
  )
}
```

In the example above, clicking the reset button would reset all three counters.

### Local State

To create and subscribe a local state, pass a configuration object to `useStateDesigner`.

```jsx
// Counter.jsx

import React from "react"
import { useStateDesigner } from "@state-designer/react"

export default function Counter() {
  const { data, send } = useStateDesigner({
    data: { items: 0 },
    on: {
      ADDED_ITEMS: {
        unless: (data, payload) => data.items + payload > 10,
        do: (data, payload) => (data.items += payload),
      },
      RESET: (data) => (data.items = 0),
    },
  })

  return (
    <div className="Counter">
      <h2>{data.items}</h2>
      <button onClick={() => send("ADDED_ITEMS", 2)}>Add two items</button>
      <button onClick={() => send("RESET")}>Reset</button>
    </div>
  )
}
```

With local states, you can use State Designer to manage the state of individual components.

```jsx
// App.jsx

import React from "react"
import Counter from "./Counter"

export default function App() {
  return (
    <div className="App">
      <Counter />
      <Counter />
      <Counter />
    </div>
  )
}
```

In the example above, the three `Counter`s in the example below will each maintain their own separate states.

#### Sending events

When using a local state, other components will not be able to directly subscribe to the state's updates and may only `send` it events through the `send` method returned by `useStateDesigner`. This method is stable and can be passed down to children in the same manner as the `dispatch` method described [here](https://reactjs.org/docs/hooks-faq.html#how-to-avoid-passing-callbacks-down).

#### Dependencies

When using a local state, you may also provide an array of dependencies. If the hook finds changes in these dependencies between renders, it will rebuild a new state based on the current configuration. You can use this feature to create dynamic state machines based on a component's props.

```jsx
function Checkbox({ checked = false }) {
  const { isIn, send } = useStateDesigner(
    {
      initial: checked ? "checked" : "unchecked",
      states: {
        checked: {
          on: { TOGGLE: { to: "unchecked" } },
        },
        unchecked: {
          on: { TOGGLE: { to: "checked" } },
        },
      },
    },
    [checked]
  )

  return (
    <input
      type="checkbox"
      checked={isIn("checked")}
      onChange={() => send("TOGGLE")}
    />
  )
}
```

In the example above, another component could control the Checkbox through its `checked` prop. When that prop changed, the hook would rebuild a new state with the correct `initial` state.

Note that this is a rather heavy-handed solution and may not be appropriate for complex states. You could achieve the same result with effects that send events in response to changed props.

```jsx
function Checkbox({ checked = false }) {
  const { isIn, send } = useStateDesigner({
    initial: checked ? "checked" : "unchecked",
    states: {
      checked: {
        on: { TOGGLE: { to: "unchecked" } },
      },
      unchecked: {
        on: { TOGGLE: { to: "checked" } },
      },
    },
  })

  React.useEffect(() => {
    if ((checked && isIn("unchecked")) || (!checked && isIn("checked"))) {
      send("TOGGLE")
    }
  }, [checked])

  return (
    <input
      type="checkbox"
      checked={isIn("checked")}
      onChange={() => send("TOGGLE")}
    />
  )
}
```

In the example above, another component could still control the Checkbox through its `checked` prop, however the hook would not rebuild its state.

## Example

[![Edit state-designer-example-react](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/objective-drake-20bkh?fontsize=14&hidenavigation=1&theme=dark)

```jsx
import React from "react"
import { useStateDesigner } from "@state-designer/react"

export default function App() {
  const { data, send } = useStateDesigner({
    data: { items: 0 },
    on: {
      ADDED_ITEMS: {
        unless: (data, payload) => data.items + payload > 10,
        do: (data, payload) => (data.items += payload),
      },
      RESET: (data) => (data.items = 0),
    },
  })

  return (
    <div className="App">
      <h2>{data.items}</h2>
      <button onClick={() => send("ADDED_ITEMS", 2)}>Add two items</button>
      <button onClick={() => send("RESET")}>Reset</button>
    </div>
  )
}
```

## API

### `useStateDesigner`

Subscribes to an existing state—or, if given a configuration object, creates a new state and subscribes to it. May also accept an array of dependencies that will, if changed between renders, cause the component to create and subscrive to a new state based on the provided configuration object.
