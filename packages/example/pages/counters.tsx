import * as React from 'react'
import { useStateDesigner } from '@state-designer/react'

// Each of these counters will have their own state machine private to
// the component.
function Counter() {
  const {
    send,
    data: { count },
  } = useStateDesigner({
    data: {
      count: 0,
    },
    on: {
      INCREMENTED: data => void data.count++,
      DECREMENTED: data => void data.count--,
    },
  })

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => send('DECREMENTED')}>-</button>
      <button onClick={() => send('INCREMENTED')}>+</button>
    </div>
  )
}

export default function Example() {
  return (
    <div>
      <Counter />
      <Counter />
      <Counter />
      <Counter />
      <Counter />
    </div>
  )
}
