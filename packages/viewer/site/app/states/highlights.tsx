// @refresh reset
import { createState } from "@state-designer/react"

type HighlightData = {
  event: string | null
  state: string | null
  scrollToLine: boolean
}

const initialData: HighlightData = {
  event: null,
  state: null,
  scrollToLine: false,
}

export const Highlights = createState({
  data: initialData,
  initial: "highlit",
  states: {
    idle: {
      on: {
        HIGHLIT_EVENT: { do: "setEventHighlight", to: "highlit" },
        HIGHLIT_STATE: { do: "setStateHighlight", to: "highlit" },
      },
    },
    highlit: {
      on: {
        CLEARED_HIGHLIGHT: { do: "clearHighlights", to: "idle" },
        HIGHLIT_EVENT: { do: ["clearHighlights", "setEventHighlight"] },
        HIGHLIT_STATE: { do: ["clearHighlights", "setStateHighlight"] },
      },
    },
  },
  actions: {
    setEventHighlight(data, { eventName, shiftKey }) {
      data.event = eventName
      data.scrollToLine = shiftKey
    },
    setStateHighlight(data, { stateName, shiftKey }) {
      data.state = stateName
      data.scrollToLine = shiftKey
    },
    clearHighlights(data) {
      data.state = null
      data.event = null
      data.scrollToLine = false
    },
  },
})
