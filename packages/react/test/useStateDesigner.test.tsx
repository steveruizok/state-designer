import * as React from 'react'
import * as ReactDOM from 'react-dom'

import {
  createDesign,
  createState,
  useStateDesigner,
  useLocalState,
  useGlobalState,
} from '../'

const configObject = {
  data: { count: 0 },
  on: {
    ADDED_ONE: (d: any) => d.count++,
  },
}

const config = createDesign(configObject)

const state = createState(config)

describe('createDesign', () => {
  it('Should create a config.', () => {
    expect(config).toBeTruthy()
  })
})

describe('createState', () => {
  it('Should create a state.', () => {
    expect(state).toBeTruthy()
  })
})

describe('useLocalState', () => {
  it('Should have working types', () => {
    const Example = () => {
      const local = useGlobalState(state)
      return <div>{local.values.double}</div>
    }

    const div = document.createElement('div')
    ReactDOM.render(<Example />, div)
    ReactDOM.unmountComponentAtNode(div)
  })
})

describe('useGlobalState', () => {
  it('Should have working types', () => {
    const Example = () => {
      const local = useLocalState({
        data: { count: 0 },
        values: {
          double(data) {
            return data.count * 2
          },
        },
      })
      return <div>{local.values.double}</div>
    }

    const div = document.createElement('div')
    ReactDOM.render(<Example />, div)
    ReactDOM.unmountComponentAtNode(div)
  })
})

describe('useStateDesigner', () => {
  it('Should have working types', () => {
    const Example = () => {
      const state = useStateDesigner({
        data: { count: 0 },
        values: {
          double(data) {
            return data.count * 2
          },
        },
      })

      return <div>{state.values.double}</div>
    }

    const div = document.createElement('div')
    ReactDOM.render(<Example />, div)
    ReactDOM.unmountComponentAtNode(div)
  })

  it('Should create / subscribe to a local state from an external config.', () => {
    const CounterFromConfig = () => {
      const { data, send } = useStateDesigner(config)

      return (
        <div>
          <h1>{data.count}</h1>
          <button onClick={() => send('ADDED_ONE')}>+1</button>
        </div>
      )
    }

    const div = document.createElement('div')
    ReactDOM.render(<CounterFromConfig />, div)
    ReactDOM.unmountComponentAtNode(div)
  })

  it('Should create / subscribe to a local state from local config.', () => {
    const CounterFromLocalConfig = () => {
      const { data, send } = useStateDesigner(configObject)

      return (
        <div>
          <h1>{data.count}</h1>
          <button onClick={() => send('ADDED_ONE')}>+1</button>
        </div>
      )
    }

    const div = document.createElement('div')
    ReactDOM.render(<CounterFromLocalConfig />, div)
    ReactDOM.unmountComponentAtNode(div)
  })

  it('Should subscribe to an external state (created by createState).', () => {
    const CounterFromState = () => {
      const { data, send } = useStateDesigner(state)

      return (
        <div>
          <h1>{data.count}</h1>
          <button onClick={() => send('ADDED_ONE')}>+1</button>
        </div>
      )
    }

    const div = document.createElement('div')
    ReactDOM.render(<CounterFromState />, div)
    ReactDOM.unmountComponentAtNode(div)
  })

  it('Should subscribe multiple components to the same external state.', () => {
    const SharedCounterA = () => {
      const { data, send } = useStateDesigner(state)

      return (
        <div>
          <h1>{data.count}</h1>
          <button onClick={() => send('ADDED_ONE')}>+1</button>
        </div>
      )
    }

    const SharedCounterB = () => {
      const { data, send } = useStateDesigner(state)

      return (
        <div>
          <h1>{data.count}</h1>
          <button onClick={() => send('ADDED_ONE')}>+1</button>
        </div>
      )
    }

    const App = () => {
      return (
        <div>
          <SharedCounterA />
          <SharedCounterB />
        </div>
      )
    }

    const div = document.createElement('div')
    ReactDOM.render(<App />, div)
    ReactDOM.unmountComponentAtNode(div)
  })
})
