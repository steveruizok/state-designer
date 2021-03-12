import React from "react"
import { useStateDesigner } from "@state-designer/react"
import {
  ClearButton,
  InputLayout,
  NameHeading,
  TitleHeading,
  NameInput,
  TitleInput,
} from "components"

export default function () {
  const state = useStateDesigner({
    data: {
      name: "",
      title: "",
    },
    on: {
      CHANGED_NAME: "updateName",
      CHANGED_TITLE: "updateTitle",
      CLEARED: ["clearName", "clearTitle"],
    },
    actions: {
      updateName(data, payload) {
        data.name = payload
      },
      updateTitle(data, payload) {
        data.title = payload
      },
      clearName(data) {
        data.name = ""
      },
      clearTitle(data) {
        data.title = ""
      },
    },
  })

  return (
    <InputLayout>
      <NameHeading>{state.data.name || "Name"}</NameHeading>
      <TitleHeading>{state.data.title || "Title"}</TitleHeading>
      <NameInput
        value={state.data.name}
        onChange={(e) => state.send("CHANGED_NAME", e.target.value)}
      />
      <TitleInput
        value={state.data.title}
        onChange={(e) => state.send("CHANGED_TITLE", e.target.value)}
      />
      <ClearButton onClick={() => state.send("CLEARED")} />
    </InputLayout>
  )
}
