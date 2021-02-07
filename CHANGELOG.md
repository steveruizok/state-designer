# Changelog

# 1.4.5

- Restores output type for createState, adds exports for `state-designer` package.

# 1.4.3

- Adds `useSelector` and `createSelector Hook`.

# 1.2.32

- Adds `useLocalState` and `useGlobalState`, more explicit and cleaner versions of the `useStateDesigner` hook. The `useStateDesigner` hook still works, though the logic is handled by one of the two other hooks.
- Fixes types in `DesignedState`. This also fixes the types returned by the `useStateDesigner` and `useGlobalState` hooks.

# 1.2.27

- Adds `enableLog()` to restore the `log` property.
- Adds `index` to track how many times the state has changed. Previously, I was referring to `log.length` but it's not great to have an array with a potentially infinite number of items in it.

## 1.2.24

- ForceTransition now adds to the log.

## 1.2.23

- Improves error messages, prevents fatal errors while processing events / conditions.

## 1.2.22

- Stops loops, timeouts and intervals when `reset`ting a state.

## 1.2.21

- Adds `state.log`. This is a wee baby feature that will change soon to aid in debugging / visual tooling.

## 1.2.20

- Adds `forceTransition`, a method to immediately transition the state to the desired path, exactly as if an event caused a transition to occur. Be careful with this one: it's not how State Designer is meant to be used, but it needs to be there for the visual tools. I may put it behind a warning in the future.
- Adds `parentType` to state nodes. Also for visual tools.

## 1.2.19

- Adds node-related properties (`isInitial`, `depth`) to state nodes in `state.stateTree`. These are used in the visualizer.

## 1.2.18

- Small fix to `unless` / `unlessAny` conditional logic. New tests for this logic should ensure the truth tables stay truthy.

## 1.2.17

- Adds `thenSend`, a function to use in place of common `send` calls. The function only accepts an event name (not a payload) and will return a memoized call to `send`. In the example below, button's `onClick` prop would never change.

  ```jsx
  const state = createState({})
  const sendAccepted = () => state.send("ACCEPTED")

  function Example() {
    return <Button onClick={sendAccepted}>Accept</Button>
  }
  ```

  In the example above, the button's `onClick` property would never change—its value on each render would be strictly equal to its previous value, and so would not cause the button component to render.

  ```jsx
  function Example() {
    const { thenSend } = useStateDesigner(state)

    return <button onClick={thenSend("ACCEPTED")}>Accept</button>
  }
  ```

  The same is true for the example above. So long as the event name doesn't change, the function returned from `thenSend` will always be re-used from previous calls.

- Adjusts the transition algorithm so that (normally) targeting a state will activate that state and reset its children to their initial states, even if those states were previously active. Previously, those descendants of the target would not change their active status if they were already active before the transition.

  ```js
  const state = createState({
    initial: "a",
    states: {
      a: {
        initial: "a1",
        states: {
          a1: {
            on: { TO_A2: { to: "a2" } },
          },
          a2: {
            on: { TO_A: { to: "a" } },
          },
        },
      },
      b: {},
    },
  })

  state.isIn("a1") // true
  state.send("TO_A2")
  state.isIn("a1") // false
  state.send("TO_A")
  state.isIn("a1") // true
  ```

## 1.2.16

- Adds support for serial transitions. You can now provide transition targets as an array to the `to` property of an event handler object. When this handler object runs, it will produce multiple transitions. Each transition will run after the previous transition has settled. The best use for this technique is to trigger transitions in parallel states.

  ```js
  createState({
    states: {
      a: {
        initial: "a1",
        states: {
          a1: {},
          a2: {},
        },
      },
      b: {
        initial: "b1",
        states: {
          b1: {},
          b2: {},
        },
      },
    },
    on: {
      FLIP: { to: ["a2", "b2"] },
    },
  })

  state.isIn("a1", "b1") // true
  state.send("FLIP")
  state.isIn("a2", "b2") // true
  ```

  While you can use this feature to produce multiple transitions in the same branch of the state tree (e.g. `to: ["a", "b", "a"]`) you should avoid doing so. Define that behavior using the second state's `onEnter`, if needed.

## 1.2.15

- Fixes bug in previous- and restore-type transitions.
- Adds transition tests.
- Adds player tutorial.

## 1.2.14

- Fixes missing name when casting values to named functions.

## 1.2.13

- Fixes bug: per-frame `onRepeat` events would receive a wrong `interval` on first call.
- The `active` property now includes only the path names of states, rather than full state objects.
- The `send` method now returns a promise that resolves when that event is processed.
- While events are handled synchronously, if the state receives additional events while processing an event, those events will be added to a queue of events to handle, in order, once the current event has finished processing. A handler will finish processing once it completes its synchronous handlers, including those that have occurred as the result of transitions. If the handler produces an asynchronous handler, such as a handler chain that include `wait`s, it will "settle" immediately — those asynchronous handlers may complete later, possible after other events in the queue have been handled.
- Renames types (`core` to `snapshot`).

## 1.2.12

- Batches `onRepeat` events that occur on each frame.

## 1.2.11

- Fixes issue where `wait` event handlers would still run after a state became inactive due to a transition.
- Fixes issue where async event handlers would still run after a state became inactive due to a transition.
- Fixes issue where event handlers with multiple `wait`ed handler objects would not stop after the first `wait`ed handler object.
- Fixes issue where payloads and results were not preserved after transitions (and asyncs).

## 1.2.10

- Adds `then`. Works like `else`, but for handlers that have passed their conditions.

## 1.2.9

- Adds `unlessAny`, the opposite of `ifAny`. An `unlessAny` check will stop a handler if any of the provided conditions return `true`.
- The difference between `unless` and `unlessAny` may be confusing—it certainly was for me! Remember that the `unless` check will only pass if `all` of its conditions return `false`. So `unless: [false, false, false]` would continue but `unless: [false, false, true]` would stop. An `unlessAny: [false, false, false]` would also continue, but `unless: [false, false, true]` would _also_ continue.

```js
  if: [true, true] // Pass
  if: [false, false] // Fail
  if: [true, false] // Fail

  ifAny: [true, true] // Pass
  ifAny: [false, false] // Fail
  ifAny: [true, false] // Pass

  unless: [true, true] // Fail
  unless: [true, false] // Pass
  unless: [false, true] // Fail

  unlessAny: [true, true] // Fail
  unlessAny: [true, false] // Pass
  unlessAny: [false, true] // Pass
```

## 1.2.8

- Improves event chain handling of results.

## 1.2.7

- Fixed information result sent from interval. In an `onRepeat` handler, `result.elapsed` will be initialized with the total time since the repeating event began, while `result.interval` will contain the precise interval since the previous time `onRepeat` was called.

## 1.2.6

- Major refactor on event handling following the move to synchronous state. No API change. Events are now handled in "chains" of event handlers. Handlers with `wait` properties may pause chain; they will resume after a timeout with the current data. Handlers with `else` properties are handled as nested separate chains.
- Results now work again and have equality with data in actions. You can `get` information from `data` and `do` something to it.
- This has meant that all event handler functions (conditions, actions, `secretlyDo` actions, etc) take a draft of data. This may make it more difficult to fire effects (such as `globalState.send("UPDATED", data.count)`) because the data will later be a revoked proxy when the draft completes.
- This also means that event handlers with `wait` properties will have a separate draft after the timeout; so they will not receive the same `get` result as event handlers before it.
- There are lots of tradeoff here, mostly present to enable mutations via immer! This remains an important piece of the API, however, so I believe these changes are worth it. That said, the choices may change in the future.

## 1.2.5

- Greatly simplifies types on DesignedState.
- DesignedState now only includes types for `data` and the returned `values`.
- Adds `useUpdateEffect`, useful for `send`ing data up to a parent state.

## 1.2.4

- Removes all async/await from core library. There are likely some remaining bugs with the move, especially with the sendqueue, but tests are clear for now. Syncronous state was necessary for form control in React.

## 1.2.3

- Fixes bug on parallel states, introduced by changes to initial.

## 1.2.2

- Changes names of types. Config to Design.
- Adds multiples for events in StateGraph.
- Adds computed initial property. This should prevent confusing `onEnter` patterns.
- When defined, an `initial` property can either be a string, a function that returns a string, an object with a `to` property (either a string or a function that returns a string), or an object with a `to` (either a string or a function that returns a string), conditionals (`if`, `ifAny`, or `unless`) and an `else`, which takes the same value as `initial`.

```js
{ ...states, initial: undefined }

{ ...states, initial: "a" }

{ ...states, initial: (data) => data.someProp ? "a" : "b" }

{ ...states, initial: { if: "someCondition", to: "a", else: "b" } }

{ ...states,
  initial: {
    if: "someCondition",
    to: "a",
    else: (data) => data.someProp ? "a" : "b"
  }
}

{ ...states,
  initial: {
    if: "someCondition",
    to: "a",
    else: {
      if: "someOtherCondition",
      to: "b",
      else: "c"
    }
  }
}
```

## 1.2.1

- The state will now immediately update before executing a `wait` delay.
- If a state becomes inactive while waiting, the event will not continue.
- Changes the `repeat` API from `event` to `onRepeat`.

## 1.2.0

- Changes core API
  - `createStateDesigner` changed to `createState`
  - `createConfig` changed to `createDesign`
  - Changed `state.getConfig` to `state.getDesign`.
  - Keeps `useStateDesigner`.
- Changes types.
- Expands docs. Terminology here is complex, so let's follow it in the types and API too.

## 1.1.22

- Restores `default` option in `whenIn`. If none of the other provided state paths are active, the `default` option will be used instead.
- Adds StateGraph component to `@state-designer/react` package. Pass this a state and it will display the state's tree and available events. Comes unstyled, but includes classNames for styling—including `data-active` for state items.

## 1.1.21

- Fixes bug where payloads were not preserved following transitions.

## 1.1.20

- Removes `elseTo`, `elseDo`, and `elseSend`. Introduces `else`, which takes an event handler. This allows event handlers to nest infinitely, if you're intro that kind of thing.
- Adds debugging callback as second argument of `createState`. The callback will receive a LOT of messages, but you can switch on the callback's second argument (a string like "async events" or "actions") to only log out the messages that matter to you.
- Adds the `secretlyDo` option. Run an action without causing the state to update. (Normally, running a `do` action or transition will trigger an update.) Useful when working with animation libraries in React, such as Framer Motion, that use alternative data flow.

```jsx
const mouseX = React.useRef(0)
const { send } = useStateDesigner({
  on: {
    MOUSE_MOVED: {
      secretlyDo: (data, payload) => (mouseX.current = payload),
    },
  },
})
```

## 1.1.18

- Adds `isInAny` helper.
- Removes `every` argument from `isIn`.
- The `isIn` helper now takes one or more state paths (strings) and returns true only if it finds matching active states for **every** path. You can think of it as asking the state "Are all of these paths active?".
- The new `isInAny` helper also takes one or more state paths (strings), but will returns true if it finds a matching active state for **any** path. You can think of it as asking the state "Are any of these paths active?".

## 1.1.17

- Adds `values`. You can use this property in a machine's config to create computed values. Each update will include the returned value of the functions provided in `values`.

## 1.1.11

- Adds `elseSend`.
- Begins preliminary work on viewer.
- Fixes problems with immutable data. (I'll avoid unfreezing as long as I can.)

## 1.1.10

- Fixes `can` bug where conditions were failing.

## 1.1.9

- Further fixes.

## 1.1.8

- Fixes ambiguous targeting. Previously, a target like `active` would hit on either `inactive` or `active` in transitions, because both states ended in "active". The bug was found in transitions, whenIn, and isIn. This is now fixed — calling `isIn("active")` behaves exactly like calling `isIn(".active")`. There is still some ambiguity here: calling `isIn("active")` which will correctly hit on either state with a path `root.buzzing.active` or `root.clicking.active`. You can add more specificity by including the parent as well, such as `isIn("buzzing.active")`.

## 1.1.5

- Adds helpers to the config returned from `createDesign`. This is useful (in theory) when composing a configuration from separate parts, rather than in one giant object, and where type safety is required.

## 1.1.4

- Adds `send` event item.

## 1.1.3

- Adds `send` event item.

## 1.1.2

- Fixes a bug where `elseTo` transitions would throw an infinite loop error at the wrong time.

## 1.1.0

- Rewrote entire library, created monorepo to split core from react.
- @state-designer/core includes only the `createState` and `createDesign` functions, and all types as `S`.
- @state-designer/react includes only the `useStateDesigner` hook.
- The same APIs all work, but the underlying code is entirely rewritten and new.
- Moved from classes to functions.
- Logic is improved, bugs fixed.
- Reduced the amount of code significantly.
- Types are much improved.
- Removed the graph object — now returns `stateTree`
