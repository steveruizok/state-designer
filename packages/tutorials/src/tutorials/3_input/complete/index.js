import React from "react"
import { useStateDesigner } from "@state-designer/react"
import {
  InputLayout,
  Button,
  Heading,
  SubHeading,
  InputRow,
  TextInput,
} from "components"

export default function () {
  const state = useStateDesigner({
    data: {
      name: "Luako",
      title: "Leaf Blower",
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
      <Heading>{state.data.name || "Name"}</Heading>
      <SubHeading>{state.data.title || "Title"}</SubHeading>
      <InputRow>
        Name
        <TextInput
          value={state.data.name}
          onChange={(e) => state.send("CHANGED_NAME", e.target.value)}
        />
      </InputRow>
      <InputRow>
        Title
        <TextInput
          value={state.data.title}
          onChange={(e) => state.send("CHANGED_TITLE", e.target.value)}
        />
      </InputRow>
      <Button onClick={() => state.send("CLEARED")}>Clear</Button>
    </InputLayout>
  )
}
