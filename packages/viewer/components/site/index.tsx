// @refresh reset
import * as React from "react"
import NotFound from "./not-found"
import LoadingScreen from "./loading-screen"
import Viewer from "./viewer"
import { Project } from "./viewer/states"
import { useStateDesigner } from "@state-designer/react"
import { ProjectResponse } from "../../utils/firebase"

const App: React.FC<{ data: ProjectResponse }> = ({ data, children }) => {
  const project = useStateDesigner(Project)

  React.useEffect(() => {
    if (data) {
      project.send("OPENED_PROJECT", { data })
    }
  }, [data?.pid])

  if (data && !data?.isProject) {
    return <NotFound uid={data.uid} pid={data.pid} />
  }

  return project.isIn("loading") ? (
    <LoadingScreen key="loading"></LoadingScreen>
  ) : (
    <Viewer />
  )
}

export default App
