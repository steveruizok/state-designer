import * as React from "react"
import { useStateDesigner } from "state-designer"

function getFakeWait() {
  return new Promise((resolve, reject) =>
    setTimeout(() => {
      const v = Math.random()

      if (v > 0.5) {
        resolve(v)
      } else {
        reject(v)
      }
    }, 1000)
  )
}

// make to into a function?
// preserve result across all event chains?
// initiate an event chain with a result value?
// Add "await" and "onResolve"

const Async: React.FC<{}> = () => {
  const { data, send, getGraph } = useStateDesigner({
    data: {
      status: "Click submit to get your result",
      result: undefined as string | undefined
    },
    initial: "empty",
    actions: {
      getData: function() {
        getFakeWait()
          .then(resolved => {
            send("RESOLVED_DATA", resolved)
          })
          .catch(rejected => {
            send("REJECTED_DATA", rejected)
          })
      }
    },
    on: {
      SUBMIT_CLICKED: {
        to: "waiting"
      }
    },
    states: {
      empty: {
        onEnter: data => (data.status = "Click submit to get your result")
      },
      waiting: {
        onEnter: [data => (data.status = "Loading..."), "getData"],
        on: {
          RESOLVED_DATA: {
            do: (data, payload) => (data.result = payload),
            to: "success"
          },
          REJECTED_DATA: {
            do: (data, payload) => (data.result = payload),
            to: "error"
          },
          CANCEL_CLICKED: {
            to: "empty"
          }
        }
      },
      success: {
        onEnter: data => (data.status = "Success!")
      },
      error: {
        onEnter: data => (data.status = "Error!")
      }
    }
  })

  return (
    <div className="example">
      <h2>Async</h2>
      <p>Status: {data.status}</p>
      <p>Result: {data.result || "none"}</p>
      <div className="button-group">
        <button
          onClick={async () => {
            send("SUBMIT_CLICKED")
          }}
        >
          Submit
        </button>
        <button onClick={() => send("CANCEL_CLICKED")}>Cancel</button>
      </div>
      {/* <pre>
        <code>{JSON.stringify(getGraph(), null, 2)}</code>
      </pre> */}
    </div>
  )
}

export default Async
