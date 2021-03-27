import * as React from 'react'
import { createState, createSelectorHook } from '@state-designer/react'

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

const useSelector = createSelectorHook(state)

// This component will only update when the count changes.
function Counter() {
  const count = useSelector(state => state.data.count)
  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => state.send('DECREMENTED')}>-</button>
      <button onClick={() => state.send('INCREMENTED')}>+</button>
    </div>
  )
}

// This component will only update when the count changes to above 5 or below 5.
function AboveMax() {
  const aboveMax = useSelector(state => state.data.count > 5)

  return (
    <div>
      <h1>Above Max?</h1>
      {aboveMax ? 'Too many' : 'Ok'}
    </div>
  )
}

// This component will only update when users changes. Note that even though
// `data.users` is an object, immer will flag this as a "new" object whenever
// we mutate it; and so it will be caught by the comparison function.
function Users() {
  const users = useSelector(state => state.data.users)

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

// This component will only update when `values.users` changes. In this case,
// because `values.users` is a value, its value will be "new" on each update.
// In order to make the selector work, we need to use a custom comparison
// function that will compare the two "new" objects to see if they're identical.
function UserNames() {
  const userNames = useSelector(state => state.values.userNames, deepCompare)

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

function deepCompare(a: any, b: any) {
  return JSON.stringify(a) === JSON.stringify(b)
}

export default function Example() {
  return (
    <div>
      <Counter />
      <AboveMax />
      <Users />
      <UserNames />
    </div>
  )
}
