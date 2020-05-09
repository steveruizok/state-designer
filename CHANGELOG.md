# Changelog

## 1.1.8

- Fixes ambiguous targeting. Previously, a target like `active` would hit on either `inactive` or `active` in transitions, because both states ended in "active". The bug was found in transitions, whenIn, and isIn. This is now fixed — calling `isIn("active")` behaves exactly like calling `isIn(".active")`. There is still some ambiguity here: calling `isIn("active")` which will correctly hit on either state with a path `root.buzzing.active` or `root.clicking.active`. You can add more specificity by including the parent as well, such as `isIn("buzzing.active")`.

## 1.1.5

- Adds helpers to the config returned from `createConfig`. This is useful (in theory) when composing a configuration from separate parts, rather than in one giant object, and where type safety is required.

## 1.1.4

- Adds `send` event item.

## 1.1.3

- Adds `send` event item.

## 1.1.2

- Fixes a bug where `elseTo` transitions would throw an infinite loop error at the wrong time.

## 1.1.0

- Rewrote entire library, created monorepo to split core from react.
- @state-designer/core includes only the `createStateDesigner` and `createConfig` functions, and all types as `S`.
- @state-designer/react includes only the `useStateDesigner` hook.
- The same APIs all work, but the underlying code is entirely rewritten and new.
- Moved from classes to functions.
- Logic is improved, bugs fixed.
- Reduced the amount of code significantly.
- Types are much improved.
- Removed the graph object — now returns `stateTree`
