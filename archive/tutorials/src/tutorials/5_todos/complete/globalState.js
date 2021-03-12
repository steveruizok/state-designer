import { createState } from "@state-designer/react"

const defaultTodos = {
  0: {
    id: "0",
    content: "hello world!",
    complete: false,
  },
}

// Get todos from local storage (or else use defaultTodos)
const localTodos = localStorage.getItem("todo_list")
const todos = localTodos === null ? defaultTodos : JSON.parse(localTodos)

const state = createState({
  data: { todos },
  on: {
    CREATED_TODO: "createTodo",
    UPDATED_TODO: "updateTodo",
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
            CREATED_TODO: { to: "all" },
            CLEARED_COMPLETE: { to: "all" },
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
  results: {
    todo(data, payload) {
      return data.todos[payload.id]
    },
  },
  conditions: {
    todoIsComplete(data, payload, todo) {
      return todo.complete
    },
  },
  actions: {
    // Todo
    updateTodo(data, payload) {
      data.todos[payload.id] = payload
    },
    // Todos
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

// Update local storage after each update
state.onUpdate((update) =>
  localStorage.setItem("todo_list", JSON.stringify(update.data.todos))
)

export default state
