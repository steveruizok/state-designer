import React from "react"
import { TwoColumnLayout, VStack, PrimaryButton, NavButton } from "components"
import Todo from "./Todo"

export default function () {
  return (
    <TwoColumnLayout>
      <VStack>
        <PrimaryButton>Add Todo</PrimaryButton>
        <NavButton>All (0)</NavButton>
        <NavButton>Incomplete (0)</NavButton>
        <NavButton>Complete (0)</NavButton>
        <NavButton>Clear Complete</NavButton>
      </VStack>

      <VStack>
        <Todo content="Hello world!" />
        <Todo content="Hey world!" complete={true} />
        <Todo />
      </VStack>
    </TwoColumnLayout>
  )
}
