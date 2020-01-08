import { StateDesigner } from "state-designer"

export const Main = new StateDesigner({
  data: {
    initial: "",
  },
  states: {
    editing: {
      states: {
        active: {},
        inactive: {},
      },
    },
    tab: {
      states: {
        editor: {},
        namedFunctions: {},
      },
    },
  },
})
