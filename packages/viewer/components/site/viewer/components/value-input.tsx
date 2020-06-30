import * as React from "react"
import { Flex, Label, Input, Spinner } from "theme-ui"
import { Home } from "react-feather"
import { createState, useStateDesigner } from "@state-designer/react"
import { useRouter } from "next/router"
import { NameEditor } from "../states"

const ValueInput: React.FC<{
  value: string
  validate: (value: string) => Promise<boolean>
  transform: (value: string) => string
  onChange: (value: string) => void
}> = ({ value, transform, validate, onChange }) => {
  const { send, isIn, values } = useStateDesigner(NameEditor)

  const rInput = React.useRef<HTMLInputElement>()

  const isFocused = isIn("focused") // cache these calls per update?

  React.useEffect(() => {
    const input = rInput.current
    if (isFocused) {
      input.setSelectionRange(999, 999)
      input.focus()
    } else {
      input.setSelectionRange(0, 0)
      input.blur()
    }
  }, [isFocused])

  return (
    <Flex sx={{ alignItems: "center" }}>
      <Label
        sx={{
          display: "inline-block",
          userSelect: "none",
          flexGrow: 2,
          mr: 2,
        }}
        onDoubleClick={() => send("FOCUSED")}
      >
        <Input
          ref={rInput}
          sx={{
            ml: 0,
            bg: "transparent",
            cursor: isFocused ? "select" : "pointer",
          }}
          value={values.value}
          disabled={!isIn("focused")}
          onBlur={(e) => {
            send("BLURRED")
          }}
          onKeyUp={(e) => {
            switch (e.key) {
              case "Enter": {
                send("SUBMITTED")
                break
              }
              case "Escape": {
                send("CANCELLED")
                break
              }
              default: {
              }
            }
          }}
          onChange={(e) => send("CHANGED_VALUE", e.target.value)}
        />
      </Label>
      {isIn("validating") && <Spinner size={16} color="inactive" />}
    </Flex>
  )
}

export default ValueInput
