import * as React from "react"
import {
  useStateDesigner,
  createState,
  useUpdateEffect,
} from "@state-designer/react"

type ITodo = { id: number; content: string; complete: boolean }

type IData = { todos: { [key: number]: ITodo } }

const data: IData = {
  todos: {
    0: {
      id: 0,
      content: "hello world!",
      complete: false,
    },
  },
}

const globalState = createState({
  data,
  on: {
    CREATED_TODO: "createTodo",
    CHANGED_TODO: "updateTodo",
    REMOVED_TODO: "deleteTodo",
    CLEARED_COMPLETE: "clearCompleteTodos",
  },
  states: {
    filter: {
      initial: "all",
      states: {
        all: {
          on: {
            FILTERED_COMPLETE: { to: "complete" },
            FILTERED_INCOMPLETE: { to: "incomplete" },
          },
        },
        complete: {
          on: {
            FILTERED_ALL: { to: "all" },
            FILTERED_INCOMPLETE: { to: "incomplete" },
          },
        },
        incomplete: {
          on: {
            FILTERED_ALL: { to: "all" },
            FILTERED_COMPLETE: { to: "complete" },
          },
        },
      },
    },
  },
  actions: {
    updateTodo(data, payload) {
      console.log(payload)
      data.todos[payload.id] = payload
    },
    createTodo(data) {
      const nextKey = Date.now()
      data.todos[nextKey] = {
        id: nextKey,
        content: "",
        complete: false,
      }
    },
    deleteTodo(data, payload) {
      delete data.todos[payload.id]
    },
    clearCompleteTodos(data) {
      for (let key in data.todos) {
        if (data.todos[key].complete) {
          delete data.todos[key]
        }
      }
    },
  },
  values: {
    complete(data) {
      return Object.values(data.todos).filter((todo) => todo.complete)
    },
    incomplete(data) {
      return Object.values(data.todos).filter((todo) => !todo.complete)
    },
    all(data) {
      return Object.values(data.todos)
    },
  },
})

const Todo: React.FC<ITodo> = ({ id, content, complete }) => {
  const state = useStateDesigner({
    data: {
      id,
      content,
      complete,
    },
    initial: complete ? "complete" : "incomplete",
    states: {
      incomplete: {
        on: {
          CHANGED_CONTENT: { do: "setContent" },
        },
        initial: {
          if: "contentIsEmpty",
          to: "empty",
          else: { to: "full" },
        },
        states: {
          empty: {
            on: {
              CHANGED_CONTENT: {
                unless: "contentIsEmpty",
                to: "full",
              },
            },
          },
          full: {
            on: {
              TOGGLED_COMPLETE: {
                do: "setComplete",
                to: "complete",
              },

              CHANGED_CONTENT: {
                if: "contentIsEmpty",
                to: "empty",
              },
            },
          },
        },
      },
      complete: {
        on: {
          TOGGLED_COMPLETE: {
            do: "clearComplete",
            to: "incomplete",
          },
        },
      },
    },
    conditions: {
      contentIsEmpty(data) {
        return data.content === ""
      },
    },
    actions: {
      setContent(data, payload) {
        data.content = payload
      },
      setComplete(data) {
        data.complete = true
      },
      clearComplete(data) {
        data.complete = false
      },
      updateGlobalState(data) {
        globalState.send("CHANGED_TODO", data)
      },
    },
  })

  useUpdateEffect(
    state,
    (update) => globalState.send("CHANGED_TODO", update.data),
    [state.data.content]
  )

  return (
    <div>
      <input
        type="checkbox"
        checked={state.isIn("complete")}
        disabled={state.isIn("empty")}
        onChange={() => state.send("TOGGLED_COMPLETE")}
      />
      <input
        value={state.data.content}
        disabled={state.isIn("complete")}
        onChange={(e) => state.send("CHANGED_CONTENT", e.target.value)}
      />
    </div>
  )
}

export const TodoList: React.FC<{}> = () => {
  const state = useStateDesigner(globalState)

  const filteredTodos = state.whenIn<ITodo[]>({
    "filter.all": state.values.all,
    "filter.complete": state.values.complete,
    "filter.incomplete": state.values.incomplete,
  })

  return (
    <div>
      <button onClick={() => state.send("CREATED_TODO")}>Add Todo</button>
      <button onClick={() => state.send("CLEARED_COMPLETE")}>
        Clear Complete
      </button>
      <button onClick={() => state.send("FILTERED_ALL")}>All</button>
      <button onClick={() => state.send("FILTERED_COMPLETE")}>Complete</button>
      <button onClick={() => state.send("FILTERED_INCOMPLETE")}>
        Incomplete
      </button>
      {filteredTodos.map((todo) => (
        <Todo key={todo.id} {...todo} />
      ))}
    </div>
  )
}
