// @refresh reset
import * as React from "react"
import NotFound from "./not-found"
import LoadingScreen from "./loading-screen"
import Viewer from "./app"
import { Project } from "./app/states"
import { useStateDesigner } from "@state-designer/react"
import * as Types from "types"

interface ViewerProps {
  user: Types.User
  response: Types.ProjectResponse
}

const App: React.FC<ViewerProps> = ({ user, response }) => {
  const project = useStateDesigner(Project)

  React.useEffect(() => {
    if (response) project.send("OPENED_PROJECT", { user, response })
  }, [response?.pid])

  if (project.isIn("loading")) {
    return <LoadingScreen key="loading"></LoadingScreen>
  }

  const { pid, isOwner } = response
  const { uid, authenticated } = user

  return project.whenIn({
    loading: <LoadingScreen key="loading"></LoadingScreen>,
    ready: <Viewer authenticated={authenticated} owner={isOwner} />,
    notFound: <NotFound uid={uid} pid={pid} />,
    authenticating: <LoadingScreen key="authenticating" />,
    default: <div>hmm, there seems to be a problem</div>,
  })
}

export default App
