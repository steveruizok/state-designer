import React from "react"
import { Input } from "@rebass/forms"
import { useStateDesigner } from "state-designer"
import { Flex, Box, Text, Button } from "rebass"

export interface Props {}

const ValidInput: React.FC<Props> = ({ children }) => {
  const { data, send, isIn, can, active } = useStateDesigner({
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
        on: {
          SUBMIT: { do: "clearText", to: "empty" }
        }
      }
    }
  })

  return (
    <Box>
      <Flex>
        <Input
          value={data.text}
          onChange={e => {
            send("CHANGED_TEXT", e.target.value)
          }}
          mr={2}
        />
        <Button
          backgroundColor="blue"
          onClick={() => send("SUBMIT")}
          opacity={can("SUBMIT") ? 1 : 0.5}
        >
          Submit
        </Button>
      </Flex>
      <Text>
        {isIn("empty")
          ? "Enter your message"
          : isIn("invalid")
          ? "Your message must include a space"
          : ""}
      </Text>
    </Box>
  )
}

export default ValidInput
