import * as React from 'react'
import { useStateDesigner } from 'state-designer'

const DeepLink: React.FC<{}> = () => {
  const { data, send, isIn, can } = useStateDesigner({
    data: {
      transitions: 0
    },
    onEvent: (data) => data.transitions++,
    initial: 'inactive',
    states: {
      inactive: {
        on: {
          TOGGLE: { to: 'active' }
        }
      },
      active: {
        on: {
          TOGGLE: { to: 'inactive' }
        }
      }
    }
  })

  return (
    <div className='example'>
      <h2>OnEvent</h2>
      <p>
        You've transitioned {data.transitions} time(s). The machine is{' '}
        {isIn('active') ? 'on' : 'off'}.
      </p>
      <div>
        <div className='button-group'>
          <button onClick={() => send('TOGGLE')}>Toggle</button>
        </div>
      </div>
      {/* <pre>{JSON.stringify(graph, null, 2)}</pre> */}
    </div>
  )
}

export default DeepLink
