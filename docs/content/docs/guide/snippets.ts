export const snippets = {
  events: `function Example() {
  const { send } = useStateDesigner({
    on: {
      CLICKED: () => window.alert("Hello world!")
    },
  })

  return (
    <button onClick={() => send("CLICKED")}>
      Click here!
    </button>
  )
}`,
  data: `function Example() {
  const { data } = useStateDesigner({
    data: {
      value: 0,
    },
  })

  return (
    <h2>{data.value}</h2>
  )
}`,
  actions: `function Example() {
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
}`,
  values: `
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
}`,
}
