import * as React from 'react'
import { createStateDesigner, useStateDesigner } from 'state-designer'

const state = createStateDesigner({
  data: {
    count: 0
  },
  initial: 'inactive',
  states: {
    active: {
      on: {
        STOP_CLICKED: { to: 'inactive' }
      },
      repeat: {
        event: (data) => data.count++,
        delay: 0.25
      }
    },
    inactive: {
      on: {
        START_CLICKED: { to: 'active' }
      }
    }
  }
})

const Delay: React.FC<{}> = () => {
  const { data, send } = useStateDesigner(state)

  return (
    <div className='example'>
      <h2>Delay</h2>
      <p>Count: {data.count}</p>
      <button
        onClick={() => {
          console.log(send)
          send('START_CLICKED')
        }}
      >
        Start
      </button>
      <button
        onClick={() => {
          send('STOP_CLICKED')
        }}
      >
        Stop
      </button>
    </div>
  )
}

export default Delay
