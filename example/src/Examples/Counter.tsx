import React from "react"
import { Input } from "@rebass/forms"
import { useStateDesigner } from "state-designer"
import { Flex, Heading, Box, Button } from "rebass"

export interface Props {}

const Counter: React.FC<Props> = ({ children }) => {
  const { data, send, isIn, can, active } = useStateDesigner({
    data: {
      inputValue: 0,
      count: 0,
      min: 0,
      max: 10
    },
    actions: {
      incrementCount: data => data.count++,
      decrementCount: data => data.count--,
      setCount: (data, value) => (data.count = value),
      updateInputValue: (data, value) => (data.inputValue = value)
    },
    conditions: {
      countIsMin: data => data.count === data.min,
      countIsMax: data => data.count === data.max,
      valueIsValid: (data, value) => !(value < data.min || value > data.max)
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

  return (
    <Box p={3}>
      <Heading>Count: {data.count}</Heading>
      <Flex>
        <Button
          backgroundColor="blue"
          opacity={can("CLICK_INCREMENT") ? 1 : 0.5}
          onClick={() => send("CLICK_INCREMENT")}
        >
          Increment
        </Button>
        <Button
          ml={2}
          backgroundColor="blue"
          opacity={can("CLICK_DECREMENT") ? 1 : 0.5}
          onClick={() => send("CLICK_DECREMENT")}
        >
          Decrement
        </Button>
      </Flex>
      <Flex>
        <Input
          mr={2}
          type="number"
          onChange={e => send("CHANGE_INPUT_VALUE", e.target.value)}
        />
        <Button
          type="submit"
          backgroundColor="blue"
          opacity={can("SUBMIT_INPUT_VALUE") ? 1 : 0.5}
          onClick={() => send("SUBMIT_INPUT_VALUE")}
        >
          Submit
        </Button>
      </Flex>
    </Box>
  )
}

export default Counter
