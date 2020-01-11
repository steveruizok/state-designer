import React from "react"
import { Card } from "./components/Card"
import { Visualizer } from "./components/Visualizer"
import { Input, Flex, Text, Box, Button } from "@theme-ui/components"
import { createStateDesigner, useStateDesigner } from "state-designer"

export interface Props {}

const ValidInput: React.FC<Props> = ({ children }) => {
  const designer = createStateDesigner({
    data: {
      text: ""
    },
    actions: {
      clearText: data => (data.text = ""),
      updateText: (data, text) => (data.text = text)
    },
    conditions: {
      textIsEmpty: data => data.text.length === 0,
      textIsValid: data => data.text.includes(" ")
    },
    on: {
      CHANGED_TEXT: [
        { do: "updateText" },
        { if: "textIsEmpty", to: "empty" },
        { if: "textIsValid", to: "valid" },
        { unless: "textIsValid", to: "invalid" }
      ]
    },
    initial: "empty",
    states: {
      empty: {},
      invalid: {},
      valid: {
        onEnter: { do: () => console.log("hi!") },
        on: {
          SUBMIT: { do: "clearText", to: "empty" }
        }
      }
    }
  })

  const [data, send, { can, isIn }] = useStateDesigner(designer)

  return (
    <Box mb={5}>
      <Visualizer title="Counter" designer={designer} />
      <Card p={3}>
        <Flex>
          <Input
            value={data.text}
            onChange={e => {
              send("CHANGED_TEXT", e.target.value)
            }}
          />
          <Button
            ml={2}
            onClick={() => send("SUBMIT")}
            disabled={!can("SUBMIT")}
          >
            ✉️
          </Button>
        </Flex>
        <Text variant="label">
          {isIn("empty")
            ? "Enter your message"
            : isIn("invalid")
            ? "Your message must include a space"
            : "Looks good!"}
        </Text>
      </Card>
    </Box>
  )
}

export default ValidInput
