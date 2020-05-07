import React from 'react'
import './App.css'
import { createStateDesigner, useStateDesigner } from 'state-designer'

const state = createStateDesigner({
  data: { count: 0 },
  on: {
    BACK: { to: 'root.restore' },
    DELAYED_HELLO: {
      do: () => console.log('hello'),
      wait: 1
    },
    INCREMENT: (d) => d.count++,
    INCREMENT_TWICE: ['increment', 'increment']
  },
  initial: 'idle',
  states: {
    idle: {
      on: {
        LOAD: { to: 'loading' }
      }
    },
    loading: {
      async: {
        await: 'oneSecondDelay',
        onResolve: { to: 'playing' },
        onReject: { to: 'paused' }
      }
    },
    paused: {
      on: {
        PLAY: { to: 'playing' }
      },
      initial: 'normal',
      states: {
        normal: {
          on: { TOGGLED_BOLD: { to: 'bold' } }
        },
        bold: {
          on: { TOGGLED_BOLD: { to: 'normal' } }
        }
      }
    },
    playing: {
      repeat: {
        event: 'increment'
      },
      on: {
        PAUSE: { to: 'paused.restore' }
      }
    }
  },
  actions: {
    increment(d) {
      d.count++
    }
  },
  asyncs: {
    oneSecondDelay: async () => {
      await new Promise((resolve, reject) =>
        setTimeout(() => reject(new Error('Failed!')), 1000)
      )
    }
  }
})

function App() {
  const { data, send, whenIn, isIn, stateTree } = useStateDesigner(state)

  React.useEffect(() => {
    // send('PAUSE')
  }, [send])

  return (
    <div className='App'>
      <button onClick={() => send('LOAD')}>load</button>
      <button onClick={() => send('DELAYED_HELLO')}>Delayed Hello</button>
      <button onClick={() => send('PAUSE')}>Pause</button>
      <button onClick={() => send('PLAY')}>Play</button>
      <button onClick={() => send('TOGGLED_BOLD')}>B</button>
      <button onClick={() => send('BACK')}>Back</button>
      {/* <button onClick={() => send('INCREMENT')}>+1</button>
      <button onClick={() => send('INCREMENT_TWICE')}>+2</button> */}
      <h3>{data.count}</h3>
      <h3>
        {whenIn({
          playing: 'Playing',
          loading: 'Loading',
          paused: 'Paused',
          idle: 'Idle'
        })}
      </h3>
      <h3>
        {whenIn({
          bold: 'Bold',
          normal: 'Normal'
        })}
      </h3>
      <hr />
      {/* <div>{isIn('paused') && <h2>Paused</h2>}</div>
      <div>{isIn('playing') && <h2>Playing</h2>}</div>
    <pre>{JSON.stringify(data, null, 2)}</pre>*/}
      <pre>
        {JSON.stringify(
          stateTree,
          function (key, val) {
            return typeof val === 'function' ? '' + val.name : val
          },
          2
        )}
      </pre>
    </div>
  )
}

export default App
