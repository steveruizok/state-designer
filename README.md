# State Designer

State Designer is a JavaScript library for managing the state of a user interface. It prioritizes the design experience, making it easy to experiment with ideas, iterate on solutions, and communicate the final result.

## Installation

The library has separate packages for different development frameworks.

#### Vanilla JavaScript

For standard JavaScript projects, install `@state-designer/core`.

`npm install @state-designer/core`

#### React

For React projects, install `@state-designer/react`.

`npm install @state-designer/react`

## Usage

Using State Designer involves three steps:

1. Create a state.
2. Subscribe to the state's updates.
3. Send events to the state.

### Creating a State

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

### Subscribing to Updates

To subscribe to a state's **updates**, call the state's `onUpdate` method and pass it a callback function to call with each new update.

An update includes:

- The state's current **data**
- An array of the state's **active** states
- The full **state tree**

```js
state.onUpdate((update) => {
  const itemsCount = document.getElementById("items")
  itemsCount.textContent = update.data.items
})
```

> Tip: In React, the `useStateDesigner` hook will subscribe a component to a state's updates.

### Sending Events

To send an **event** to the state, call the state's `send` method.

The send method takes two arguments:

- The name of the event as a string
- A payload of any type

```js
const resetButton = document.getElementById("reset_button")
resetButton.onclick = () => state.send("RESET")

const plusTwoButton = document.getElementById("plus_two_button")
plusTwoButton.onclick = () => state.send("ADDED_ITEMS", 2)
```

## Example

#### HTML + JavaScript

```html
<body>
  <h2 id="itemsCount">0</h2>
  <button onClick="addTwoItems">Add two items</button>
  <button onClick="reset">Reset</button>

  <script>
    // Create state
    const state = createStateDesigner({
      data: { items: 0 },
      on: {
        ADDED_ITEMS: {
          unless: (data, payload) => data.items + payload >= 10,
          do: (data, payload) => (data.items += payload),
        },
        RESET: (data) => (data.items = 0),
      },
    })

    // Subscribe to updates
    function handleUpdate(update) {
      const itemsCount = document.getElementById("items")
      itemsCount.textContent = update.data.items
    }

    state.onUpdate(handleUpdate)

    // Send events
    function reset() {
      state.send("RESET")
    }

    function addTwoItems() {
      state.send("ADDED_ITEMS", 2)
    }
  </script>
</body>
```

#### React

```jsx
const itemCounter = () => {
  // Create state and subscribe to updates
  const { data, send } = useStateDesigner({
    data: { items: 0 },
    on: {
      ADDED_ITEMS: {
        unless: (data, payload) => data.items + payload >= 10,
        do: (data, payload) => (data.items += payload),
      },
      RESET: (data) => (data.items = 0),
    },
  })

  return (
    <div>
      <h2>{data.count}</h2>
      {/* Send events */}
      <button onClick={() => send("ADDED_ITEMS", 2)}>Add two items</button>
      <button onClick={() => send("Reset")}>Reset</button>
    </div>
  )
}
```
