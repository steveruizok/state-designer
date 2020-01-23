import * as React from "react"
import { useStateDesigner } from "state-designer"

function getFakeFetch() {
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

const Chain: React.FC<{}> = () => {
  const { data, send, getGraph } = useStateDesigner({
    data: {
      status: "",
      result: undefined as string | undefined
    },
    initial: "empty",
    on: {
      SUBMIT_CLICKED: {
        to: "loading"
      }
    },
    states: {
      empty: {
        onEnter: data => (data.status = "Click submit to get your result")
      },
      loading: {
        onEnter: {
          do: data => (data.status = "Loading..."),
          await: getFakeFetch
        },
        onResolve: {
          do: (data, payload, result) => (data.result = result),
          send: "RESOLVED_DATA"
        },
        onReject: {
          do: (data, payload, result) => (data.result = result),
          send: "REJECTED_DATA"
        },
        on: {
          RESOLVED_DATA: {
            to: "success"
          },
          REJECTED_DATA: {
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
      <h2>Chain</h2>
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

export default Chain
