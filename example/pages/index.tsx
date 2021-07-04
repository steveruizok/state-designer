import Head from 'next/head'
import styles from '../styles/Home.module.css'
import * as React from 'react'

import {
  createState,
  useStateDesigner,
  createSelectorHook,
} from '@state-designer/react'

const state = createState({
  data: {
    tables: 0,
    chairs: 0,
  },
  on: {
    ADDED_TABLE: data => {
      data.tables++
    },
    ADDED_CHAIR: data => data.chairs++,
  },
  values: {
    user() {
      return { name: 'steve' }
    },
    chairsRemaining(data) {
      return 100 - data.chairs
    },
  },
  options: {
    onSend: (eventName, payload, didUpdate) => {
      console.log(eventName, payload, didUpdate)
    },
  },
})

const useSelector = createSelectorHook(state)

// A helper to help us count how many times a component updates

function useUpdateCount() {
  const rUpdates = React.useRef(0)
  rUpdates.current++

  return rUpdates.current
}

function Tables() {
  const tables = useSelector(state => state.data.tables)
  const updates = useUpdateCount()
  return (
    <>
      <h2>Tables: {tables}</h2>
      <button onClick={() => state.send('ADDED_TABLE')}>Add a Table</button>
      <p>Updated {updates} times.</p>
    </>
  )
}

function Chairs() {
  const chairs = useSelector(state => state.data.chairs)
  const updates = useUpdateCount()

  return (
    <>
      <h2>Chairs: {chairs}</h2>
      <button onClick={() => state.send('ADDED_CHAIR')}>Add a Chair</button>
      <p>Updated {updates} times.</p>
    </>
  )
}

function ChairsRemaining() {
  const chairsRemaining = useSelector(state => state.values.chairsRemaining)
  const updates = useUpdateCount()

  return (
    <>
      <h2>Chairs Remaining: {chairsRemaining}</h2>
      <button onClick={() => state.send('ADDED_CHAIR')}>Add a Chair</button>
      <p>Updated {updates} times.</p>
      <p>
        You can use the <code>useSelector</code> hook to get any information
        from a state: its <code>data</code>, <code>values</code>, or tests
        against the status of its state nodes, such as{' '}
        <code>isIn("active")</code>. While <code>values.chairsRemaining</code>{' '}
        will be re-computed on every update, this component will update when{' '}
        <code>values.chairRemaining</code> actually changes.
      </p>
    </>
  )
}

function User() {
  const user = useSelector(state => state.values.user)
  const updates = useUpdateCount()

  return (
    <>
      <h2>User: {user.name}</h2>
      <p>{user.name}</p>
      <button onClick={() => state.send('ADDED_TABLE')}>Add a Table</button>
      <p>Updated {updates} times.</p>
      <p>
        This example shows that when using <code>useSelector</code> with an
        object value (the <code>values.user</code> object), the selector will
        recognize a new value on each update. This is because the value is
        recomputed on each state change.
      </p>
    </>
  )
}

function UserStringEquality() {
  const user = useSelector(
    state => state.values.user,
    (o, n) => JSON.stringify(o) === JSON.stringify(n)
  )
  const updates = useUpdateCount()

  return (
    <>
      <h2>User: {user.name}</h2>
      <p>Updated {updates} times.</p>
      <button onClick={() => state.send('ADDED_TABLE')}>Add a Table</button>
      <p>
        This example shows how you might use <code>useSelector</code>'s second
        argument to make other types of equality checks, such as comparing
        stringified versions of an object, so that the selector will recognize a
        change only when the object actually changes.
      </p>
    </>
  )
}

function ExampleWithUseStateDesigner() {
  const local = useStateDesigner(state)
  const updates = useUpdateCount()

  const { tables, chairs } = local.data

  return (
    <>
      <p>
        This example shows that updating the state will cause the component
        (where <code>useStateDesigner</code> is called) to update.
      </p>
      <p>Updated {updates} times.</p>
      <h2>Tables: {tables}</h2>
      <button onClick={() => state.send('ADDED_TABLE')}>Add a Table</button>
      <h2>Chairs: {chairs}</h2>
      <button onClick={() => state.send('ADDED_CHAIR')}>Add a Chair</button>
    </>
  )
}

function ExampleWithUseSelectors() {
  return (
    <>
      <p>
        This example shows that we can use smaller components, along with the{' '}
        <code>useSelector</code> hook, to control which changes should cause a
        component to update.
      </p>
      <Tables />
      <Chairs />
      <ChairsRemaining />
      <User />
      <UserStringEquality />
    </>
  )
}

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1>Use State Designer Example</h1>
        <ExampleWithUseStateDesigner />
        <hr />
        <h1>Use Selector Example</h1>
        <ExampleWithUseSelectors />
      </main>

      <footer className={styles.footer}></footer>
    </div>
  )
}
