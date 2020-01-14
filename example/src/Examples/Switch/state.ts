import { createStateDesigner } from "state-designer"

export const state = createStateDesigner({
  initial: "inactive",
  states: {
    inactive: {
      on: {
        TOGGLE: { to: "active" }
      }
    },
    active: {
      on: {
        TOGGLE: { to: "inactive" }
      }
    }
  }
})
