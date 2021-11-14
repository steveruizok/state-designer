# State Designer / React

This package includes the core functions of [State Designer](https://statedesigner.com), a JavaScript state management library, together with a React hook for use in React. [Click here](https://statedesigner.com) to learn more.

You can use this package in any React project. For other JavaScript projects, see [@state-designer/core](https://github.com/@state-designer/core).

This package includes TypeScript typings.

# Installation

```bash
npm install @state-designer/react
```

```
yarn add @state-designer/react
```

## Usage

You can use the `useStateDesigner` hook to subscribe to either a global state (created with the `createState` function) or a local component state, by passing a configuration object to the hook. You can use the `useSelector` hook to subscribe to only part of a state.

For the basics of State Designer (including the configuration object API) see the documentation for [@state-designer/core](https://github.com/@state-designer/core) or visit [state-designer.com](https://state-designer.com).

# API

- [`useStateDesigner`](#useStateDesigner)
- [`useSelector`](#useSelector)
- [`createSelector`](#createSelector)
- [`useUpdateEffect`](#useUpdateEffect)

---

## `useStateDesigner`

```js
const update = useStateDesigner(myState)
```

Subscribes a component to an state created with `createState`.

```js
import { createState, useStateDesigner } from '@state-designer/react'

export const state = createState({
  data: { count: 0 },
  states: {
    enabled: {
      on: {
        INCREMENTED: { do: (data) => data.count++ },
        TOGGLED: { to: 'disabled' },
      },
    },
    disabled: {
      on: {
        TOGGLED: { to: 'enabled' },
      },
    },
  },
})

function Counter() {
  const local = useStateDesigner(state)
  return (
    <div>
      <button disabled={!state.can('INCREMENTED')} onClick={() => state.send('INCREMENTED')}>
        {local.data.count}
      </button>
      <button onClick={() => state.send('TOGGLED')}>Toggle</button>
    </div>
  )
}
```

### Usage with a Configuration Object

```js
const update = useStateDesigner(myState)
```

If given a configuration object, the hook will creates a new state and subscribe to it.

```js
import { useStateDesigner } from '@state-designer/react'

function Counter() {
  const local = useStateDesigner({
    data: { count: 0 },
    states: {
      enabled: {
        on: {
          INCREMENTED: { do: (data) => data.count++ },
          TOGGLED: { to: 'disabled' },
        },
      },
      disabled: {
        on: {
          TOGGLED: { to: 'enabled' },
        },
      },
    },
  })

  return (
    <div>
      <button disabled={!state.can('INCREMENTED')} onClick={() => state.send('INCREMENTED')}>
        {local.data.count}
      </button>
      <button onClick={() => state.send('TOGGLED')}>Toggle</button>
    </div>
  )
}
```

### Dependencies

When given a configration object, you may also provide an array of dependencies that will, if changed between renders, cause the component to create and subscribe to a new state based on the current configuration object.

```js
import { useStateDesigner } from '@state-designer/react'

function Counter({ initial = 0 }) {
  const local = useStateDesigner(
    {
      data: { count: initial },
      on: { INCREMENTED: { do: (data) => data.count++ } },
    },
    [initial]
  )

  return (
    <div>
      <button onClick={() => state.send('INCREMENTED')}>{local.data.count}</button>
    </div>
  )
}
```

---

### `useSelector`

```js
const selected = useSelector(state, selectFn)
```

Subscribe to only certain changes from a state. Pass it a created state, together with a callback function that receives the update and returns some value. Whenever the state updates, the hook will update only if the value returned by your callback function has changed.

```js
import { createState, useSelector } from '@state-designer/react'

const state = createState({
  data: {
    tables: 0,
    chairs: 0,
  },
  on: {
    ADDED_TABLE: (data) => data.tables++,
    ADDED_CHAIRS: (data) => data.chairs++,
  },
})

// This component will only update when state.data.tables changes.
function TablesCounter() {
  const tables = useSelector(state, (state) => state.data.tables)
  return <button onClick={() => state.send('ADDED_TABLE')}>{tables}</button>
}

// This component will only update when state.data.chairs changes.
function ChairsCounter() {
  const chairs = useSelector(state, (state) => state.data.chairs)
  return <button onClick={() => state.send('ADDED_CHAIR')}>{chairs}</button>
}
```

### Comparisons

The hook will only update if the selector function returns new data. By default, the hook uses strict equality (`a === b`) to compare the previous data with the new data. However, the hook also accepts an optional third argument: a callback function that it will use for comparisons instead.

Each time the state updates, the hook will use the selection function to make a new selection, then call the comparison function with two arguments: the selection currently in state (the "previous" selection) and the new selection just obtained. If the comparison function returns `false`, then the hook will put the new selection into state.

```js
const tooMany = useSelector(
  state,
  (state) => state.data.chairs,
  (prev, next) => prev > 10 !== next > 10
)
```

In the example above, the hook will only change if the state's `data.chairs` property is below 10 and changes to above 10, or if it is above 10 and changes to below 10. A change from 4 to 11 would cause the state to update; a change from 11 to 12 would not.

---

## `createSelectorHook`

```js
createSelectorHook(state)
```

This is a helper that will generate a selector hook from a state. The hook returned by `createSelectorHook` is unlike the `useSelector` shown above in that you will not have to enter the state as a first argument.

```js
import { createState, createSelectorHook } from '@state-designer/react'

const state = createState({
  data: {
    tables: 0,
    chairs: 0,
  },
  on: {
    ADDED_TABLE: (data) => data.tables++,
    ADDED_CHAIRS: (data) => data.chairs++,
  },
})

const useSelector = createSelectorHook(state)

function TablesCounter() {
  const tables = useSelector((state) => state.data.tables)
  return <button onClick={() => state.send('ADDED_TABLE')}>{tables}</button>
}
```
