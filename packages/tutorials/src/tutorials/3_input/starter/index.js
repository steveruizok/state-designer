import React from "react"
import {
  ClearButton,
  InputLayout,
  NameHeading,
  TitleHeading,
  NameInput,
  TitleInput,
} from "components"

export default function () {
  return (
    <InputLayout>
      <NameHeading>Name</NameHeading>
      <TitleHeading>Title</TitleHeading>
      <NameInput />
      <TitleInput />
      <ClearButton />
    </InputLayout>
  )
}
