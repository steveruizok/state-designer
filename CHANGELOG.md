# Changelog

## 1.0.16

- Fixes a bug where `elseTo` transitions would throw an infinite loop error at the wrong time.

## 1.0.13

- Rewrote entire library, created monorepo to split core from react.
- @state-designer/core includes only the `createStateDesigner` and `createConfig` functions, and all types as `S`.
- @state-designer/react includes only the `useStateDesigner` hook.
- The same APIs all work, but the underlying code is entirely rewritten and new.
- Moved from classes to functions.
- Logic is improved, bugs fixed.
- Reduced the amount of code significantly.
- Types are much improved.
- Removed the graph object — now returns `stateTree`.
- The `state-designer` library now exports all
