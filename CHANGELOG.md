# Changelog

## 1.0.36

- Fixed bug when re-creating machine.

## 1.0.35

- Rewrites async events, repeat events.

## 1.0.34

- Wraps all static helpers in `useCallback`.

## 1.0.33

- Adds `thenSend`.

## 1.0.32

- Changes subscriber output to object, rather than list of separate arguments, in order to match hook exports.

## 1.0.30

- Changes hook returns:
- `getGraph` is now `graph`
- `getActive` is now `active`
- Active includes paths (like `"root.active.bold"`) as well as names (like `bold`). These are unique values, so in a machine with two states, both with the name "bold", the active array will only include "bold" once.
- Adds `whenIn`, a helper to reduce a value depending on the state. All values matching an active state name (or path) are merged into the returned object. When the values are primitives, rather than objects, these multiple active values will replace each other, rather than merge.

```ts
whenIn({
  root: { border: "1px solid #000" },
  active: { backgroundColor: "#fff" },
  inactive: { backgroundColor: "#ccc" },
  bold: { fontWeight: "bold" },
  normal: { fontWeight: "normal" }
})
```

In a graph where `root`, `active`, and `bold` were true, this function would return:

```ts
{
  border: "1px solid #000",
  backgroundColor: "#fff",
  fontWeight: "bold"
}
```

In a graph where `root` and `inactive` were true, this function would return:

```ts
{
  border: "1px solid #000",
  backgroundColor: "#ccc",
}
```

## 1.0.29

- Fixes bug with autofreeze.

## 1.0.28

- Fixes missing onEvent autoevent.

## 1.0.27

- Fixes a bug that caused autoevents to receive old data.

## 1.0.26

- Fixes a bug that prevented a system from activating "up" a tree

## 1.0.24

- Adds onRepeat, wait, repeatDelay
- Refactors transition code

## 1.0.21

- Removes effect
- Arranges order of hook parameters
- Improves Graph information

## 1.0.9

- Allows for deep transitioning.

## 1.0.7

- Start state event analysis at the top-level state, rather than the bottom
- Cleans up event handling code
- Fixes bug in `can` for results

## 1.0.2

- Simplifies typing in `useStateDesigner` and `StateDesigner`.
- Allows for a generic type (for data) in the `useStateDesigner` hook, e.g. `useStateDesigner<MyData>({...})`.
- Cleans up functions for turning the event handler shorthand syntax in configuration files into full event handlers in the StateDesigner class.
