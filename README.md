# State Designer

State Designer is a JavaScript library for managing the state of a user interface. It prioritizes the design experience, making it easy to experiment with ideas, iterate on solutions, and communicate the final result.

Learn more at [statedesigner.com](https://statedesigner.com).

## Installation

The library has separate packages for different development frameworks.

#### Vanilla JavaScript

`npm install @state-designer/core`

#### React

`npm install @state-designer/react`

## Usage

Using State Designer involves three steps:

1. Create a state.
2. Subscribe to the state's updates.
3. Send events to the state.

### 1. Creating a State

To create a new **state**, call the `createStateDesigner` function and pass it a **configuration object**.

A configuration object defines everything about the state:

- what **data** it controls;
- how it should respond to **events** ; and
- how its **child states** are organized

```js
const state = createStateDesigner({
  data: { items: 0 },
  on: {
    ADDED_ITEM: {
      unless: (data) => data.items >= 10,
      do: (data) => data.items++,
    },
    RESET: (data) => (data.items = 0),
  },
})
```

The example above is just the start of what you can add to a state's configuration object. [Learn more](https://statedesigner.com).

### 2. Subscribing to Updates

To subscribe to a state's **updates**, call the state's `onUpdate` method and pass it a callback function to call with each new update.

An update includes:

- The state's current **data**
- An array of the state's **active** states
- The full **state tree**

```js
state.onUpdate(({ data }) => {
  document.getElementById("itemsCount").textContent = data.items.toString()
})
```

**Tip:** In React, the `useStateDesigner` hook will subscribe a component to a state's updates. [Learn more](https://statedesigner.com).

### 3. Sending Events

To send an **event** to the state, call the state's `send` method.

The send method takes two arguments:

- The name of the event as a string
- A payload of any type (optional)

```js
document.getElementById("reset_button").onclick = () => {
  state.send("RESET")
}

document.getElementById("plus_two_button").onclick = () => {
  state.send("ADDED_ITEMS", 2)
}
```

Events can belong to child states, too. If an event belongs to a child state that is not active, the event will not be handled. If an event belongs to multiple active states, it will be handled on each state in the state tree, starting from the root.

## Example

#### HTML + JavaScript

[![Edit state-designer-vanilla-example](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/adoring-nightingale-g7ch1?fontsize=14&hidenavigation=1&theme=dark)

```js
import { createStateDesigner } from "@state-designer/core"

// Create state
const state = createStateDesigner({
  data: { items: 0 },
  on: {
    ADDED_ITEMS: {
      unless: (data, payload) => data.items + payload > 10,
      do: (data, payload) => (data.items += payload),
    },
    RESET: (data) => (data.items = 0),
  },
})

// Subscribe to updates
state.onUpdate(({ data }) => {
  document.getElementById("itemsCount").textContent = data.items.toString()
})

// Send events
document.getElementById("reset_button").onclick = () => {
  state.send("RESET")
}

document.getElementById("plus_two_button").onclick = () => {
  state.send("ADDED_ITEMS", 2)
}
```

#### React

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
