import React from "react"
import compact from "lodash/compact"
import { Box, Button, Flex } from "rebass"
import { CodeEditor, Fences } from "./CodeEditor"
import { Item } from "./Item"
import { Title } from "./Title"
import { Collections } from "../machines/Collections"
import { createStateDesignerConfig, useStateDesigner } from "state-designer"
import * as safeEval from "safe-eval"

export interface Props {}

let localInitialState = localStorage.getItem("DS_InitialState")
let localSafeData = localStorage.getItem("DS_SafeData")
let localUnsafeData = localStorage.getItem("DS_UnsafeData")
let localCodeErr = localStorage.getItem("DS_CodeErr")

export const Preview: React.FC<Props> = ({ children }) => {
  const states = useStateDesigner(Collections.states)
  const events = useStateDesigner(Collections.events)
  const handlers = useStateDesigner(Collections.handlers)
  const actions = useStateDesigner(Collections.actions)
  const conditions = useStateDesigner(Collections.conditions)
  const results = useStateDesigner(Collections.results)

  const [initialState, setInitialState] = React.useState<string | undefined>(
    localInitialState || ""
  )
  const [codeFocused, setCodeFocused] = React.useState(false)
  const [unsafeData, setUnsafeData] = React.useState<any>(
    localUnsafeData || "count: 0"
  )
  const [safeData, setSafeData] = React.useState<any>(
    localSafeData || "count: 0"
  )
  const [codeErr, setCodeErr] = React.useState<any>(localCodeErr || "")

  React.useEffect(() => {
    localStorage.setItem("DS_InitialState", initialState || "")
  }, [initialState])

  React.useEffect(() => {
    localStorage.setItem("DS_UnsafeData", unsafeData)
  }, [unsafeData])

  React.useEffect(() => {
    localStorage.setItem("DS_SafeData", safeData)
  }, [safeData])

  React.useEffect(() => {
    localStorage.setItem("DS_CodeErr", codeErr)
  }, [codeErr])

  const config = createStateDesignerConfig({
    data: eval(`() => ({${safeData}})`)(),
    initial: initialState === "" ? undefined : initialState,
    states: Array.from(states.data.values()).reduce((acc, state) => {
      acc[state.name] = {
        on: compact(state.events.map(id => events.data.get(id))).reduce<any>(
          (acc, event) => {
            acc[event.name] = event.handlers.map(id => {
              const handler = handlers.data.get(id)
              if (!handler) {
                console.log("no handler!")
                return {}
              }
              return {
                get: handler.get.reduce<any>((acc, { id }) => {
                  const result = results.data.get(id)
                  if (!result || result.error) {
                    console.log("Bad result!")
                    return acc
                  }

                  if (id === "custom") {
                    acc.push(
                      Function(
                        "data",
                        "payload",
                        "result",
                        "return " + result.code
                      )
                    )
                  } else {
                    acc.push(result.name)
                  }

                  return acc
                }, []),
                if: handler.if.map(({ id }) => {
                  const condition = conditions.data.get(id)
                  if (!condition) return []

                  if (id === "custom") {
                    return Function(
                      "data",
                      "payload",
                      "result",
                      "return " + condition.code
                    )
                  }

                  return condition.name
                }),
                do: handler.do.map(({ id }) => {
                  const action = actions.data.get(id)
                  if (!action) return []

                  if (id === "custom") {
                    return Function("data", "payload", "result", action.code)
                  }

                  return action.name
                }),
                to: handler.to && handler.to,
              }
            })
            return acc
          },
          {}
        ),
      }
      return acc
    }, {} as any),
    actions: Array.from(actions.data.values()).reduce<any>((acc, action) => {
      acc[action.name] = action.error
        ? () => {}
        : Function("data", "payload", "result", action.code)
      return acc
    }, {}),
    conditions: Array.from(conditions.data.values()).reduce<any>(
      (acc, condition) => {
        acc[condition.name] = condition.error
          ? () => true
          : Function("data", "payload", "result", "return " + condition.code)
        return acc
      },
      {}
    ),
    results: Array.from(results.data.values()).reduce<any>((acc, result) => {
      acc[result.name] = result.error
        ? () => {}
        : Function("data", "payload", "result", "return " + result.code)
      return acc
    }, {}),
  })

  const { data, send, can, active } = useStateDesigner(
    config,
    undefined,
    undefined,
    [
      states.data,
      events.data,
      conditions.data,
      actions.data,
      results.data,
      handlers.data,
      safeData,
      initialState,
    ]
  )

  return (
    <Box sx={{ position: "relative" }}>
      <Item title="Initial State">
        <CodeEditor
          value={initialState}
          onChange={code => setInitialState(code)}
        />
      </Item>
      <Item
        title="data"
        error={codeErr}
        canSave={codeFocused}
        canCancel={codeFocused}
        onCancel={() => {
          setUnsafeData(safeData)
          setCodeErr("")
          setCodeFocused(false)
        }}
        onSave={() => {
          setSafeData(unsafeData)
          setCodeFocused(false)
        }}
      >
        <CodeEditor
          value={codeFocused ? unsafeData : JSON.stringify(data, null, 2)}
          startWith={codeFocused ? Fences.Start : ""}
          endWith={codeFocused ? Fences.End : ""}
          error={codeFocused ? codeErr : ""}
          onFocus={() => setCodeFocused(true)}
          onChange={code => {
            setUnsafeData(code)
            let err = ""
            try {
              safeEval(`{${code}}`)
            } catch (e) {
              err = e.message
            }

            setCodeErr(err)

            // if (err === "") setSafeData(code)
          }}
        />
      </Item>
      <Item title="Active States">
        <ul>
          {active.map((state, index) => (
            <li key={index}>{state.name}</li>
          ))}
        </ul>
      </Item>
      <Flex>
        {Array.from(events.data.values()).map((event, index) => {
          const disabled = !can(event.name)
          return (
            <Button
              key={index}
              mr={2}
              opacity={disabled ? 0.5 : 1}
              disabled={disabled}
              onClick={() => send(event.name)}
            >
              {event.name}
            </Button>
          )
        })}
      </Flex>
    </Box>
  )
}
