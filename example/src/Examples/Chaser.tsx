import * as React from "react"
import { createStateDesigner, useStateDesigner } from "state-designer"

// make to into a function?
// preserve result across all event chains?
// initiate an event chain with a result value?
// Add "await" and "onResolve"

const Chaser: React.FC<{}> = () => {
  const rMouse = React.useRef({ x: 0, y: 0 })

  const { data, send, getGraph } = useStateDesigner({
    data: {
      x: 0,
      y: 0,
      fallDistance: 0
    },
    initial: "chasing",
    states: {
      chasing: {
        on: {
          CLICKED: { to: "sinking" }
        },
        onRepeat: {
          do: data => {
            const deltaX = rMouse.current.x - data.x
            const deltaY = rMouse.current.y - data.y
            data.x += deltaX / 20
            data.y += deltaY / 20
          },
          repeatDelay: 0.016
        }
      },
      sinking: {
        onEnter: data => (data.fallDistance = 100),
        on: {
          CLICKED: { to: "chasing" }
        },
        onRepeat: {
          do: data => {
            data.fallDistance--
            if (data.fallDistance > 0) {
              data.y += 1
            }
          },
          repeatDelay: 0.016
        }
      }
    }
  })

  React.useEffect(() => {
    const updateMouse = (e: any) => {
      rMouse.current = { x: e.pageX, y: e.pageY }
    }

    const sendClick = (e: any) => {
      send("CLICKED")
    }

    document.body.addEventListener("click", sendClick)
    document.body.addEventListener("mousemove", updateMouse)
    return () => {
      document.body.removeEventListener("click", sendClick)
      document.body.removeEventListener("mousemove", updateMouse)
    }
  }, [])

  return (
    <div className="example">
      <h2>Chaser</h2>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          height: 24,
          width: 24,
          backgroundColor: "#ccc",
          border: "1px solid #777",
          borderRadius: "100%",
          transform: `translate(${data.x}px, ${data.y}px)`
        }}
      />

      {/* <pre>
        <code>{JSON.stringify(getGraph(), null, 2)}</code>
      </pre> */}
    </div>
  )
}

export default Chaser
