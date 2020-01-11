# Changelog

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
