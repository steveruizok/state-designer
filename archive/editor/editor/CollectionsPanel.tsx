// @refresh reset
import * as React from "react"
import { useStateDesigner } from "@state-designer/react"
import globalState from "./state"
import * as T from "./types"
import { CodeEditor } from "./CodeEditor"
import { ResizePanel } from "./panel/ResizePanel"
import { CreateRow } from "./shared"
import { Styled, Grid, Divider, Heading } from "theme-ui"
import { PanelHeading } from "./panel/PanelHeading"
import { ValueOptionsButton } from "./ValueOptionsButton"
import { ConditionOptionsButton } from "./ConditionOptionsButton"
import { ActionOptionsButton } from "./ActionOptionsButton"

export const CollectionsPanel: React.FC<{}> = () => {
  const global = useStateDesigner(globalState)

  return (
    <ResizePanel title="Collections" width={420}>
      <Grid
        gap={2}
        sx={{
          "& > ul": {
            pl: 3,
            pr: 3,
            mt: 1,
            mb: 2,
            listStyle: "none",
            "& > li": {
              mb: 3,
              "&:nth-last-of-type": {
                mb: 0,
              },
            },
          },
        }}
      >
        <PanelHeading title="Actions">
          <CreateRow
            defaultValue=""
            placeholder="Create Action"
            format={(name) => name.replace(" ", "")}
            onSubmit={(name) => global.send("CREATED_ACTION", name)}
          />
        </PanelHeading>
        <ul>
          {global.values.actions.map((action) => (
            <li key={action.id}>
              <CodeEditor
                optionsButton={<ActionOptionsButton action={action} />}
                name={action.name}
                code={action.code}
                onChangeName={(name) =>
                  global.send("CHANGED_ACTION_NAME", { id: action.id, name })
                }
                onChangeCode={(code) =>
                  global.send("CHANGED_ACTION_CODE", { id: action.id, code })
                }
              />
            </li>
          ))}
        </ul>
        <PanelHeading title="Conditions">
          <CreateRow
            defaultValue=""
            placeholder="Create Condition"
            format={(name) => name.replace(" ", "")}
            onSubmit={(name) => global.send("CREATED_CONDITION", name)}
          />
        </PanelHeading>
        <ul>
          {global.values.conditions.map((condition) => (
            <li key={condition.id}>
              <CodeEditor
                optionsButton={<ConditionOptionsButton condition={condition} />}
                name={condition.name}
                code={condition.code}
                validate={(code) => code.includes("return ")}
                onChangeName={(name) =>
                  global.send("CHANGED_CONDITION_NAME", {
                    id: condition.id,
                    name,
                  })
                }
                onChangeCode={(code) =>
                  global.send("CHANGED_CONDITION_CODE", {
                    id: condition.id,
                    code,
                  })
                }
              />
            </li>
          ))}
        </ul>
        <PanelHeading title="Values">
          <CreateRow
            defaultValue=""
            placeholder="Create Value"
            format={(name) => name.replace(" ", "")}
            onSubmit={(name) => global.send("CREATED_VALUE", name)}
          />
        </PanelHeading>
        <ul>
          {global.values.values.map((value) => (
            <li key={value.id}>
              <CodeEditor
                optionsButton={<ValueOptionsButton value={value} />}
                key={value.id}
                name={value.name}
                code={value.code}
                validate={(code) => code.includes("return ")}
                onChangeName={(name) =>
                  global.send("CHANGED_VALUE_NAME", { id: value.id, name })
                }
                onChangeCode={(code) =>
                  global.send("CHANGED_VALUE_CODE", { id: value.id, code })
                }
              />
            </li>
          ))}
        </ul>
      </Grid>
    </ResizePanel>
  )
}
