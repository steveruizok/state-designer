import React from "react"
import Todo from "./Todo"
import { Layout, VStack } from "components"

export default function () {
  return (
    <Layout>
      <VStack>
        <Todo content="Stretch my wrists" />
        <Todo content="Rest my eyes" complete={true} />
        <Todo />
      </VStack>
    </Layout>
  )
}
