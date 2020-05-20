export const intro = `<button onClick={() => alert("Hey!")}>
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
      OPENED_ALERT: () => alert("Hi!")
    },
  })

  return (
    <button onClick={() => state.send("OPENED_ALERT")}>
      Click here!
    </button>
  )
}`

export const eventHandlers = `function Example() {
  const state = useStateDesigner({
    on: {
      CLICKED: [
        () => alert("I'll run first!"),
        {
          do: () => alert("I'll run second!"),
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
      CLICKED: () => alert("I'm an action!"),
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
        do: () => alert("Heads!"),
        elseDo: () => alert("Tails!")
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
  const state = useStateDesigner({
    initial: "unchecked",
    states: {
      checked: {},
      unchecked: {}
    }
  })

  return (
    <input type="checkbox" checked={state.isIn("checked")}/>
  )
}`

export const statesToggleSend = `function Toggle() {
  const state = useStateDesigner({
    initial: "unchecked",
    states: {
      checked: {},
      unchecked: {}
    },
    on: {
      CHECKED: { to: "checked" },
      UNCHECKED: { to: "unchecked" },
    }
  })

  return (
    <div>
     <input type="checkbox" checked={state.isIn("checked")}/>
     <button onClick={() => state.send("CHECKED")}>Check</button>
     <button onClick={() => state.send("UNCHECKED")}>Uncheck</button>
    </div>
  )
}`

export const statesToggleEvents = `function Toggle() {
  const state = useStateDesigner({
    initial: "unchecked",
    states: {
      checked: {
        on: { 
          TOGGLED: { to: "unchecked" } 
        }
      },
      unchecked: {
        on: { 
          TOGGLED: { to: "checked" } 
        }
      }
    },
  })

  return (
    <input 
      type="checkbox" 
      checked={state.isIn("checked")} 
      onClick={() => state.send("TOGGLED")}
    />
  )
}`

export const statesToggleWhenIn = `function Toggle() {
  const state = useStateDesigner({ ...toggle })

  const label = state.whenIn({
    checked: "Turn off",
    unchecked: "Turn on",
  })

  return (
    <button onClick={() => state.send("TOGGLED")}>{label}</button>
  )
}`

export const statesNestedToggle = `function HoverToggle() {
  const state = useStateDesigner({
    initial: "unchecked",
    states: {
      unchecked: { 
        on: { TOGGLED: { to: "checked" } },
        initial: "normal",
        states: {
          normal: { 
            on: { TOGGLE_STYLE: { to: "bold" } } 
          },
          bold: { 
            on: { TOGGLE_STYLE: { to: "normal" } } 
          },
        },
      },
      checked: {
        on: { TOGGLED: { to: "unchecked" } },
        initial: "hovered",
        states: {
          hovered: { 
            on: { HOVERED_OUT: { to: "unhovered" } } 
          },
          unhovered: { 
            on: { HOVERED_IN: { to: "hovered" } } 
          },
        },
      },
    },
  })

  return (
    <button 
      onMouseEnter={() => state.send("HOVERED_IN")}
      onMouseLeave={() => state.send("HOVERED_OUT")}
      onClick={() => state.send("TOGGLED")}
    >
      {state.whenIn({
        checked: "Turn off",
        unchecked: "Turn on",
        hovered: "—hovered!",
        unhovered: "—not hovered!"
      })}
    </button>
  )
}`

export const statesParallel = `function Toggle() {
  const state = useStateDesigner({
    states: {
      weight: {
        initial: "normal",
        states: {
          normal: { 
            on: { TOGGLE_STYLE: { to: "bold" } } 
          },
          bold: { 
            on: { TOGGLE_STYLE: { to: "normal" } } 
          },
        },
      },
      decoration: {
        initial: "none",
        states: {
          none: { 
            on: { TOGGLE_DECORATION: { to: "underline" } } 
          },
          underline: { 
            on: { TOGGLE_DECORATION: { to: "none" } } 
          },
        },
      }
    }
  })

  const fontWeight = state.whenIn({normal: "normal", bold: "bold"})
  const textDecoration = state.whenIn({none: "none", underline: "underline"})

  return (
    <div>
      <h2 style={{ fontWeight, textDecoration }}>Hello World!</h2>
      <button onClick={() => state.send("TOGGLE_STYLE")}>B</button>
      <button onClick={() => state.send("TOGGLE_DECORATION")}>U</button>
    </div>
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
