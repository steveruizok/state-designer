import * as React from 'react'
import { createState, useStateDesigner } from '@state-designer/react'

const state = createState({
  data: {
    count: 0,
    users: {
      '0': { id: 0, name: 'Li' },
      '1': { id: 1, name: 'Reya' },
      '2': { id: 2, name: 'Shawn' },
    },
  },
  on: {
    INCREMENTED: data => data.count++,
    DECREMENTED: data => data.count--,
    REMOVED_USER: (data, payload: { id: keyof typeof data['users'] }) =>
      delete data.users[payload.id],
  },
  values: {
    userNames(data) {
      return Object.values(data.users).map(user => user.name)
    },
  },
})

function Counter() {
  const {
    data: { count },
  } = useStateDesigner(state)
  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => state.send('DECREMENTED')}>-</button>
      <button onClick={() => state.send('INCREMENTED')}>+</button>
    </div>
  )
}

function Users() {
  const {
    data: { users },
  } = useStateDesigner(state)

  return (
    <div>
      <h1>Users</h1>
      <ol>
        {Object.values(users).map(user => (
          <li key={user.id}>
            {user.name}
            <button onClick={() => state.send('REMOVED_USER', { id: user.id })}>
              Remove
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}

function UserNames() {
  const {
    values: { userNames },
  } = useStateDesigner(state)

  return (
    <div>
      <h1>User Names</h1>
      <ol>
        {userNames.map((name, i) => (
          <li key={i}>{name}</li>
        ))}
      </ol>
    </div>
  )
}

export default function Example() {
  return (
    <div>
      <Counter />
      <Users />
      <UserNames />
    </div>
  )
}
