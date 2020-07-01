// @refresh reset
import * as React from "react"
import NotFound from "./not-found"
import FirebaseAuth from "./firebase-auth"
import LoadingScreen from "./loading-screen"
import Viewer from "./app"
import { Project } from "./app/states"
import { useStateDesigner } from "@state-designer/react"
import { ProjectResponse } from "../utils/firebase"

const App: React.FC<{ data: ProjectResponse }> = ({ data, children }) => {
  const project = useStateDesigner(Project)

  React.useEffect(() => {
    if (data) {
      project.send("OPENED_PROJECT", { data })
    }
  }, [data?.pid])

  if (!data || project.isIn("loading")) {
    return <LoadingScreen key="loading"></LoadingScreen>
  }

  const { oid, pid, uid } = data

  return project.whenIn({
    loading: <LoadingScreen key="loading"></LoadingScreen>,
    ready: <Viewer />,
    notFound: <NotFound uid={uid} pid={pid} />,
    authenticating: <FirebaseAuth redirect={`/${oid}/${pid}`} />,
    default: <div>hmm, there seems to be a problem</div>,
  })
}

export default App
