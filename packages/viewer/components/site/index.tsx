import * as React from "react"
import NotFound from "./not-found"
import LoadingScreen from "./loading-screen"
import Viewer from "./viewer"
import { ui } from "./viewer/states/ui"
import { editor } from "./viewer/states/editor"
import { useStateDesigner, createState } from "@state-designer/react"
import { ProjectResponse, subscribeToDocSnapshot } from "../../utils/firebase"

const main = createState({
  initial: "loading",
  states: {
    loading: {
      on: {
        REFRESHED_CODE: {
          do: ["loadSourceCode", "loadEditorCode"],
          to: "ready",
        },
      },
    },
    ready: {
      on: {
        REFRESHED_CODE: { do: ["updateSourceCode", "updateEditorCode"] },
      },
    },
  },
  on: {},
  actions: {
    loadSourceCode(_, { code, data }) {
      ui.send("LOADED_PROJECT", { code, data })
    },
    loadEditorCode(_, { code, data }) {
      editor.send("LOADED_CODE", { code, data })
    },
    updateSourceCode(_, { code }) {
      ui.send("CHANGED_CODE", { code })
    },
    updateEditorCode(_, { code }) {
      editor.send("CHANGED_CODE", { code })
    },
  },
})

const App: React.FC<{ data: ProjectResponse }> = ({ data, children }) => {
  const [isLoading, setLoading] = React.useState(true)
  const state = useStateDesigner(main)

  React.useEffect(() => {
    if (data?.pid === undefined) return

    console.log(data)

    return subscribeToDocSnapshot(data.pid, data.oid, (doc) => {
      const code = JSON.parse(doc.data().code)
      state.send("REFRESHED_CODE", { code, data })

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
