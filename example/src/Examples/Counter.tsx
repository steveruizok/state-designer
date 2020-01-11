import React from "react"
import { Card } from "./components/Card"
import { Visualizer } from "./components/Visualizer"
import { Input, Flex, Text, Box, Button } from "@theme-ui/components"
import { createStateDesigner, useStateDesigner } from "state-designer"

export interface Props {}

const Counter: React.FC<Props> = ({ children }) => {
  const designer = createStateDesigner({
    data: {
      inputValue: 0,
      count: 0,
      min: 0,
      max: 10
    },
    actions: {
      incrementCount: data => data.count++,
      decrementCount: data => data.count--,
      setCount: (data, value) => (data.count = data.inputValue),
      updateInputValue: (data, value) => (data.inputValue = value)
    },
    conditions: {
      countIsMin: data => data.count === data.min,
      countIsMax: data => data.count === data.max,
      valueIsValid: data =>
        !(data.inputValue < data.min || data.inputValue > data.max)
    },
    on: {
      CLICK_INCREMENT: {
        unless: "countIsMax",
        do: "incrementCount"
      },
      CLICK_DECREMENT: {
        unless: "countIsMin",
        do: "decrementCount"
      },
      SUBMIT_INPUT_VALUE: {
        if: "valueIsValid",
        do: "setCount"
      },
      CHANGE_INPUT_VALUE: {
        do: "updateInputValue"
      }
    }
  })

  const [data, send, { can }] = useStateDesigner(designer)

  return (
    <Box mb={5}>
      <Visualizer title="Counter" designer={designer} />
      <Card p={3}>
        <Card active={false} p={2} sx={{ width: "fit-content" }}>
          <Flex sx={{ alignItems: "center" }}>
            <Button onClick={() => send("CLICK_DECREMENT")}>-</Button>
            <Text px={3} mr={2} sx={{ textAlign: "center" }}>
              {data.count}
            </Text>
            <Button mr={0} onClick={() => send("CLICK_INCREMENT")}>
              +
            </Button>
          </Flex>
        </Card>
        <Card active={false} p={2} sx={{}}>
          <Flex sx={{ alignItems: "center" }}>
            <Input
              type="number"
              value={data.inputValue}
              mr={2}
              onChange={e => {
                console.log(e.target.value)
                send("CHANGE_INPUT_VALUE", e.target.value)
              }}
            />
            <Button
              mr={0}
              disabled={!can("SUBMIT_INPUT_VALUE")}
              onClick={() => send("SUBMIT_INPUT_VALUE")}
            >
              ✉️
            </Button>
          </Flex>
        </Card>
      </Card>
    </Box>
  )
}

export default Counter
