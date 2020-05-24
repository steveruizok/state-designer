# Changelog

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
