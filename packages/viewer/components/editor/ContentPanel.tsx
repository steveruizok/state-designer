import * as React from "react"
import { ResizePanel } from "./panel/ResizePanel"
import { StateTree } from "./StateTree"
import { EventList } from "./EventList"
import { DataEditor } from "./DataEditor"

export const ContentPanel: React.FC<{}> = () => {
  return (
    <ResizePanel title="Content" resizeDirection="left">
      <StateTree />
      <EventList />
      <DataEditor />
    </ResizePanel>
  )
}
