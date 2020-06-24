import * as React from "react"
import LoadingScreen from "./loading-screen"
import Viewer from "./viewer"
import { ui } from "./viewer/states/ui"
import { editor } from "./viewer/states/editor"
import { useStateDesigner, createState } from "@state-designer/react"
import firebase from "firebase"

const db = firebase.firestore()

type Data = {
  id: string
  auth: boolean
  project: boolean
  owner: boolean
  message: string
  error?: Error
}

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
    loadSourceCode(_, { code }) {
      ui.send("LOADED_PROJECT", { code })
    },
    loadEditorCode(_, { code, pid }) {
      editor.send("LOADED_CODE", { code, pid })
    },
    updateSourceCode(_, { code }) {
      ui.send("CHANGED_CODE", { code })
    },
    updateEditorCode(_, { code }) {
      editor.send("CHANGED_CODE", { code })
    },
  },
})

const App: React.FC<{ data: Data }> = ({ data, children }) => {
  const [isLoading, setLoading] = React.useState(true)
  const state = useStateDesigner(main)

  React.useEffect(() => {
    if (data?.id !== undefined) {
      db.collection("projects")
        .doc(data.id)
        .onSnapshot((doc) => {
          const code = JSON.parse(doc.data().code)
          state.send("REFRESHED_CODE", { code, pid: data.id })
          setLoading(false)
        })
    }
  }, [data?.id])

  let message = ""

  if (!data) {
    message = "Getting Data"
  } else if (!data.id) {
    message = "Getting User"
  } else if (!data.project) {
    message = "Getting Project"
  }

  // Using the `isLoading` React state for hot reload — I should be able to use `state.isIn("loading"`)
  return isLoading ? <LoadingScreen>{message}</LoadingScreen> : <Viewer />
}

export default App
