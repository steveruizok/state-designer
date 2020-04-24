import * as React from "react"
import { useStateDesigner } from "state-designer"

const ResultMutation: React.FC<{}> = () => {
  const { data, send, can } = useStateDesigner({
    data: {
      items: [
        { id: 0, count: 0 },
        { id: 1, count: 0 },
        { id: 1, count: 0 },
      ],
    },
    on: {
      UPDATE_ITEM: {
        get: "item",
        do: "incrementItemCount",
      },
    },
    results: {
      item(data, id) {
        return data.items.find((item) => item.id === id)
      },
    },
    actions: {
      incrementItemCount(data, _, item) {
        item.count++
      },
    },
  })

  return (
    <div className="example">
      <h2>Result Mutations</h2>
      <div className="button-group">
        {data.items.map((item) => (
          <button
            onClick={() => {
              send("UPDATE_ITEM", item.id)
            }}
          >
            {item.count}
          </button>
        ))}
      </div>
    </div>
  )
}

export default ResultMutation
