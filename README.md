# State Designer

State Designer is a JavaScript and TypeScript library for managing the state of a user interface. It prioritizes the design experience, making it easy to experiment with ideas, iterate on solutions, and communicate the final result.

- **See examples in [React](https://codesandbox.io/s/state-designer-react-typescript-op1qk) and [TypeScript](https://codesandbox.io/s/state-designer-react-r0z0v).**
- **Learn more at [state-designer.com](https://state-designer.com).**

## Features

- Write [state-charts](https://statecharts.github.io/) in a simple declarative syntax.
- Create both global and local component states.
- Use selectors to subscribe to just the data you need.

## Packages

- [`@state-designer/core`](https://github.com/steveruizok/state-designer/tree/master/packages/core) - Core library.
- [`@state-designer/react`](https://github.com/steveruizok/state-designer/tree/master/packages/react) - React hook.

## Usage

Using State Designer involves three steps:

1. Create a state with a configuration object.
2. Subscribe to the state's updates.
3. Send events to the state.

Your exact usage will depend on your framework:

- [Usage in JavaScript](https://github.com/@state-designer/core#usage)
- [Usage in React](https://github.com/@state-designer/react#usage)

## Inspiration

State Designer is heavily inspired by [xstate](https://github.com/davidkpiano/xstate). Note that, unlike xstate, State Designer does not adhere to the [scxml spec](https://en.wikipedia.org/wiki/SCXML).

## Author

- [Steve Ruiz](https://twitter.com/@steveruizok)

## License

[MIT](https://oss.ninja/mit/steveruizok)
