import React from "react"
import { TodoContainer, Checkbox, TextInput } from "components"

export default function ({ content = "", complete = false }) {
  return (
    <TodoContainer>
      <Checkbox
        disabled={content === ""}
        isChecked={complete}
        onChange={() => {}}
      />
      <TextInput value={content} onChange={() => {}} />
    </TodoContainer>
  )
}
