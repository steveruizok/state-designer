export const intro = `<button onClick={() => window.alert("Hey!")}>
  Click here!
</button>`

// State

export const state = `function Example() {
  const state = useStateDesigner({ 
    data: { count: 0 },
  })

  return <h1>{state.data.count}</h1>
}`

export const stateCounter = `function Example() {
  const state = useStateDesigner(counter)

  return (
    <div>
     <h1>{state.data.count}</h1>
     <button onClick={() => state.send("INCREASED")}>+1</button>
    </div>
  )
}`

// Hook
export const hook = `function Example() {
  const update = useStateDesigner({
    data: { count: 1 }
  })

  return (
    <h1>{update.data.count}</h1>
  )
}`

// Config

// Updates

export const events = `function Example() {
  const state = useStateDesigner({
    on: {
      CLICKED: () => window.alert("Hi!")
    },
  })

  return (
    <button onClick={() => state.send("CLICKED")}>
      Click here!
    </button>
  )
}`

export const eventHandlers = `function Example() {
  const state = useStateDesigner({
    on: {
      CLICKED: [
        () => window.alert("I'll run first!"),
        {
          do: () => window.alert("I'll run second!"),
        }
      ]
    },
  })

  return (
    <button onClick={() => state.send("CLICKED")}>
      Click here!
    </button>
  )
}`

export const eventHandlersActions = `function Example() {
  const state = useStateDesigner({
    on: {
      CLICKED: () => window.alert("I'm an action!"),
    },
  })

  return (
    <button onClick={() => state.send("CLICKED")}>
      Click here!
    </button>
  )
}`

export const eventHandlersObjects = `function Example() {
  const state = useStateDesigner({
    on: {
      CLICKED: {
        if: () => Math.random() > .5,
        do: () => window.alert("Heads!"),
        elseDo: () => window.alert("Tails!")
      },
    },
  })

  return (
    <button onClick={() => state.send("CLICKED")}>
      Flip a Coin!
    </button>
  )
}`

// States

export const statesToggle = `function Toggle() {
  const { isIn } = useStateDesigner({
    initial: "inactive",
    states: {
      active: {},
      inactive: {}
    }
  })

  return (
    <input type="checkbox" checked={isIn("active")}/>
  )
}`
// Data

export const data = `function Example() {
  const { data } = useStateDesigner({
    data: {
      value: 0,
    },
  })

  return (
    <h2>{data.value}</h2>
  )
}`

export const actions = `function Example() {
  const { data, send } = useStateDesigner({
    data: {
      value: 0,
    },
    on: {
      INCREASED: (data) => {
        data.value++
      },
    },
  })

  return (
    <div>
      <h2>{data.value}</h2>
      <button onClick={() => {
        send("INCREASED")
      }}>Increase</button>
    </div>
  )
}`

export const values = `function Example() {
  const { data, send, values } = useStateDesigner({
    data: {
      value: 0,
    },
    on: {
      INCREASED: (data) => {
        data.value++
      },
    },
    values: {
      doubled: (data) => {
        return data.value * 2
      },
    },
  })

  return (
    <div>
      <h2>{data.value}</h2>
      <p>Doubled: {values.doubled}</p>
      <button onClick={() => send("INCREASED")}>Increase</button>
    </div>
  )
}`

export const conditions = `function Example() {
  const { data, send, values } = useStateDesigner({
    data: {
      value: 0,
    },
    on: {
      INCREASED: (data) => {
        data.value++
      },
    },
    values: {
      doubled: (data) => {
        return data.value * 2
      },
    },
  })

  return (
    <div>
      <h2>{data.value}</h2>
      <p>Doubled: {values.doubled}</p>
      <button onClick={() => send("INCREASED")}>Increase</button>
    </div>
  )
}`
