import * as React from "react"
import NotFound from "./not-found"
import LoadingScreen from "./loading-screen"
import Viewer from "./viewer"
import { project } from "./viewer/states"
import { ui } from "./viewer/states/ui"
import { editor } from "./viewer/states/editor"
import { presentation } from "./viewer/states/presentation"
import { useStateDesigner, createState } from "@state-designer/react"
import { ProjectResponse, subscribeToDocSnapshot } from "../../utils/firebase"

const main = createState({
  initial: "loading",
  states: {
    loading: {
      on: {
        REFRESHED: {
          do: ["loadUI", "loadEditor", "loadPresentation"],
          to: "ready",
        },
      },
    },
    ready: {
      on: {
        REFRESHED: { do: ["updateUI", "updateEditor", "updatePresentation"] },
      },
    },
  },
  on: {},
  actions: {
    loadUI(_, { source, data }) {
      ui.send("LOADED_PROJECT", { source, data })
    },
    loadEditor(_, { source, data }) {
      editor.send("LOADED_CODE", { source, data })
    },
    loadPresentation(_, { source, data }) {
      presentation.send("LOADED_CODE", { source, data })
    },
    updateUI(_, { source, data }) {
      ui.send("REFRESHED_CODE", { source, data })
    },
    updateEditor(_, { source, data }) {
      editor.send("REFRESHED_CODE", { source, data })
    },
    updatePresentation(_, { source, data }) {
      presentation.send("REFRESHED_CODE", { source, data })
    },
  },
})

const App: React.FC<{ data: ProjectResponse }> = ({ data, children }) => {
  const [isLoading, setLoading] = React.useState(true)
  const state = useStateDesigner(main)

  React.useEffect(() => {
    if (data === undefined) return

    return subscribeToDocSnapshot(data.pid, data.oid, (doc) => {
      const source = doc.data()

      state.send("REFRESHED", { source, data })

      if (isLoading) {
        setLoading(false)
      }
    })
  }, [data?.pid])

  if (!data) {
    return <LoadingScreen key="loading">Getting Data</LoadingScreen>
  } else if (!data.pid) {
    return <LoadingScreen key="loading">Getting User</LoadingScreen>
  } else if (!data.isProject) {
    return <NotFound uid={data.uid} pid={data.pid} />
  }

  return isLoading ? <LoadingScreen key="loading"></LoadingScreen> : <Viewer />
}

export default App
