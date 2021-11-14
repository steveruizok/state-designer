# State Designer / Core

This package includes the core functions of [State Designer](https://statedesigner.com), a JavaScript state management library. [Click here](https://statedesigner.com) to learn more.

You can use this package in any JavaScript or TypeScript project.

For React projects, see [@state-designer/react](https://github.com/@state-designer/react).

## Installation

```bash
npm install @state-designer/core

# or

yarn add @state-designer/core
```

## Usage

Using State Designer involves three steps:

1. Create a state with a configuration object.
2. Subscribe to the state's updates.
3. Send events to the state.

### 1. Creating a State

To create a new **state**, call the `createState` function and pass it a **configuration object**.

A configuration object defines everything about the state:

- what **data** it controls;
- how it should respond to **events** ; and
- how its **child states** are organized

```js
const state = createState({
  data: { items: 0 },
  on: {
    ADDED_ITEM: {
      unless: (data) => data.items >= 10,
      do: (data) => void data.items++,
    },
    RESET: (data) => void (data.items = 0),
  },
})
```

The example below is just the start of what you can add to a state's configuration object. [Click here](https://statedesigner.com) to learn more.

### 2. Subscribing to Updates

To subscribe to a state's **updates**, call the state's `onUpdate` method and pass it a callback function to call with each new update.

An update includes:

- The state's current **data**
- An array of the state's **active** states
- The full **state tree**

```js
state.onUpdate(({ data }) => {
  document.getElementById('itemsCount').textContent = data.items.toString()
})
```

### 3. Sending Events

To send an **event** to the state, call the state's `send` method.

The send method takes two arguments:

- The name of the event as a string
- A payload of any type (optional)

```js
document.getElementById('reset_button').onclick = () => {
  state.send('RESET')
}

document.getElementById('plus_two_button').onclick = () => {
  state.send('ADDED_ITEMS', 2)
}
```

## Example

[![Edit state-designer-vanilla-example](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/adoring-nightingale-g7ch1?fontsize=14&hidenavigation=1&theme=dark)

```js
import { createState } from '@state-designer/core'

// Create state
const state = createState({
  data: { items: 0 },
  on: {
    ADDED_ITEMS: {
      unless: (data, payload) => data.items + payload > 10,
      do: (data, payload) => void (data.items += payload),
    },
    RESET: (data) => void (data.items = 0),
  },
})

// Subscribe to updates
state.onUpdate(({ data }) => {
  document.getElementById('itemsCount').textContent = data.items.toString()
})

// Send events
document.getElementById('reset_button').onclick = () => {
  state.send('RESET')
}

document.getElementById('plus_two_button').onclick = () => {
  state.send('ADDED_ITEMS', 2)
}
```

## API

### `createState`

Creates a new state from a configuration object.

```ts
const state = createState({
  data: { items: 0 },
  on: {
    CLICKED_PLUS: 'increment',
  },
  actions: {
    increment: (data) => void data.count++,
  },
})
```

### `createDesign`

> **Note:** This function only exists to provide additional type support in TypeScript projects and in testing where multiple states need to use the same configuration object.

A helper function that creates a configuration object. The configuration provides several additional helpers for creating type-checked actions, events, and other parts of the object.

```ts
const config = createDesign({
  data: { items: 0 },
  on: {
    CLICKED_PLUS: 'increment',
  },
  actions: {
    increment: (data) => void data.count++,
  },
})

const state = createState(config)
```

| Helper                         | Description                               |
| ------------------------------ | ----------------------------------------- |
| createEventHandlerConfig       | Creates an event handler config.          |
| createEventHandlerItemConfig   | Creates an event handler item config.     |
| createAsyncEventHandlerConfig  | Creates an async event handler config.    |
| createRepeatEventHandlerConfig | Creates a repeating event handler config. |
| createStateConfig              | Creates a state config.                   |
| createActionConfig             | Creates an action config.                 |
| createConditionConfig          | Creates a condition config.               |
| createResultConfig             | Creates a result config.                  |
| createTimeConfig               | Creates a time config.                    |
