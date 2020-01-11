import React from "react"
import { Radio, Label } from "@rebass/forms"
import { useStateDesigner } from "state-designer"
import { Box } from "rebass"

export interface Props {
  value: string
  options: string[]
}

const RadioButtons: React.FC<Props> = ({ value, options, children }) => {
  const [data, send] = useStateDesigner(
    {
      data: {
        value
      },
      actions: {
        selectValue: (data, value) => (data.value = value)
      },
      on: {
        CLICK_OPTION: "selectValue"
      }
    },
    undefined,
    undefined,
    [value, options]
  )

  return (
    <Box as="form" p={3}>
      {options.map((option, index) => (
        <Box key={index}>
          <Label htmlFor={option}>
            <Radio
              name={option}
              id={option}
              value={option}
              checked={data.value === option}
              onChange={() => send("CLICK_OPTION", option)}
            />
            {option}
          </Label>
        </Box>
      ))}
    </Box>
  )
}

export default RadioButtons
