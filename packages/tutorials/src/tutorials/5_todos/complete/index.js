import React from "react"
import { TwoColumnLayout, VStack, PrimaryButton, NavButton } from "components"
import Todo from "./Todo"
import globalState from "./globalState"
import { useStateDesigner } from "@state-designer/react"

export default function () {
  const state = useStateDesigner(globalState)

  const filteredTodos = state.whenIn({
    "filter.all": state.values.all,
    "filter.complete": state.values.complete,
    "filter.incomplete": state.values.incomplete,
  })
  return (
    <TwoColumnLayout>
      <VStack>
        <PrimaryButton onClick={() => state.send("CREATED_TODO")}>
          Add Todo
        </PrimaryButton>
        <NavButton
          active={state.isIn("all")}
          onClick={() => state.send("FILTERED_ALL")}
        >
          All ({state.values.all.length})
        </NavButton>
        <NavButton
          active={state.isIn("incomplete")}
          onClick={() => state.send("FILTERED_INCOMPLETE")}
        >
          Incomplete ({state.values.incomplete.length})
        </NavButton>
        <NavButton
          active={state.isIn("complete")}
          onClick={() => state.send("FILTERED_COMPLETE")}
        >
          Complete ({state.values.complete.length})
        </NavButton>
        <NavButton
          disabled={state.values.complete.length === 0}
          onClick={() => state.send("CLEARED_COMPLETE")}
        >
          Clear Complete
        </NavButton>
      </VStack>

      <VStack>
        {filteredTodos.map((todo, i) => (
          <Todo key={todo.id} {...todo} />
        ))}
      </VStack>
    </TwoColumnLayout>
  )
}
