import React from "react"
import {
  InputLayout,
  Button,
  Heading,
  SubHeading,
  InputRow,
  TextInput,
} from "components"

export default function () {
  return (
    <InputLayout>
      <Heading>Name</Heading>
      <SubHeading>Title</SubHeading>
      <InputRow>
        Name
        <TextInput />
      </InputRow>
      <InputRow>
        Title
        <TextInput />
      </InputRow>
      <Button>Clear</Button>
    </InputLayout>
  )
}
