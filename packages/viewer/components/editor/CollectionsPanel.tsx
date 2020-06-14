// @refresh reset
import * as React from "react"
import { useStateDesigner } from "@state-designer/react"
import globalState, { State } from "./state"
import { CodeEditor } from "./CodeEditor"
import { DataEditor } from "./DataEditor"
import { Column, CreateRow } from "./shared"
import { Divider, Heading } from "theme-ui"
import { ConditionOptionsButton } from "./ConditionOptionsButton"
import { ActionOptionsButton } from "./ActionOptionsButton"

export const CollectionsPanel: React.FC<{}> = () => {
  const global = useStateDesigner(globalState)

  return (
    <Column bg={"panel"}>
      <Heading>Actions</Heading>
      <CreateRow
        defaultValue=""
        placeholder="Create Action"
        format={(name) => name.replace(" ", "")}
        onSubmit={(name) => global.send("CREATED_ACTION", name)}
      />
      {global.values.actions.map((action) => (
        <CodeEditor
          optionsButton={<ActionOptionsButton action={action} />}
          key={action.id}
          name={action.name}
          code={action.code}
          onChangeName={(name) =>
            global.send("CHANGED_ACTION_NAME", { id: action.id, name })
          }
          onChangeCode={(code) =>
            global.send("CHANGED_ACTION_CODE", { id: action.id, code })
          }
        />
      ))}
      <Divider />
      <Heading>Conditions</Heading>
      <CreateRow
        defaultValue=""
        placeholder="Create Condition"
        format={(name) => name.replace(" ", "")}
        onSubmit={(name) => global.send("CREATED_CONDITION", name)}
      />
      {global.values.conditions.map((condition) => (
        <CodeEditor
          optionsButton={<ConditionOptionsButton condition={condition} />}
          key={condition.id}
          name={condition.name}
          code={condition.code}
          validate={(code) => code.includes("return ")}
          onChangeName={(name) =>
            global.send("CHANGED_CONDITION_NAME", { id: condition.id, name })
          }
          onChangeCode={(code) =>
            global.send("CHANGED_CONDITION_CODE", { id: condition.id, code })
          }
        />
      ))}
    </Column>
  )
}
