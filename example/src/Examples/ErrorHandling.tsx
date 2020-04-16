import * as React from "react"
import { useStateDesigner, createStateDesigner } from "state-designer"

type Item = { id: string; x: number; y: number }
type Id = "a" | "b" | "c"

const ids = new Set<Id>(["a", "b", "c"])
const items = new Map<Id, Item>(
  Array.from(ids.values()).map((id) => [id, { id, x: 0, y: 0 }])
)

const getItemFromId = (id: Id) => items.get(id)

const state = createStateDesigner({
  data: {
    ids,
    items,
    selected: undefined as Item | undefined,
  },
  on: {
    CLICKED_ITEM: [
      {
        get: "item",
        if: "isSelected",
        do: "throwError",
      },
      {
        get: "item",
        unless: "isSelected",
        do: "setSelected",
      },
    ],
  },
  results: {
    item(data, id: Id) {
      return getItemFromId(id)
    },
  },
  conditions: {
    isSelected(data, _, item: Item) {
      console.log(item, data.selected)
      return data.selected ? data.selected === item : false
    },
  },
  actions: {
    throwError(data) {
      throw new Error("Oops!")
    },
    setSelected(data, _, item: Item) {
      console.log("setting selected", item)
      data.selected = item
    },
    clearSelected(data) {
      data.selected = undefined
    },
  },
})

const ErrorHandling: React.FC<{}> = () => {
  const { data, send, graph, isIn, can } = useStateDesigner(state)

  console.log("selected", data.selected)
  return (
    <div className="example">
      <h2>Error Handling</h2>
      <div>
        <div className="button-group">
          {Array.from(data.items.entries()).map(([id, item]) => (
            <button
              key={id}
              onClick={() => send("CLICKED_ITEM", id)}
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

export default ErrorHandling
