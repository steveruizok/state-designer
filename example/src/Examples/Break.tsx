import * as React from "react"
import { useStateDesigner, createStateDesigner } from "state-designer"

type Item = { id: string; x: number; y: number }
type Id = "a" | "b" | "c"

const ids = new Set<Id>(["a", "b", "c"])
const items = new Map<Id, Item>(
  Array.from(ids.values()).map((id) => [id, { id, x: 0, y: 0 }])
)

const state = createStateDesigner({
  data: {
    ids,
    items,
    selected: undefined as Item | undefined,
  },
  on: {
    CLICKED_ITEM: [
      {
        if: "isSelected",
        do: "clearSelected",
        break: true,
      },
      {
        do: "setSelected",
      },
    ],
  },
  conditions: {
    isSelected(data, item: Item) {
      return item === data.selected
    },
  },
  actions: {
    setSelected(data, item: Item) {
      data.selected = item
    },
    clearSelected(data) {
      data.selected = undefined
    },
  },
})

const Break: React.FC<{}> = () => {
  const { data, send, graph, isIn, can } = useStateDesigner(state)

  return (
    <div className="example">
      <h2>Break</h2>
      <div>
        <div className="button-group">
          {Array.from(data.items.entries()).map(([id, item]) => (
            <button
              key={id}
              onClick={() => send("CLICKED_ITEM", item)}
              style={{
                backgroundColor: item === data.selected ? "#ccc" : "#fff",
              }}
            >
              {id}
            </button>
          ))}
        </div>
      </div>
      {/* <pre>{JSON.stringify(graph, null, 2)}</pre> */}
    </div>
  )
}

export default Break
