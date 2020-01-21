import * as React from "react"
import { counter } from "../state"
import { useStateDesigner } from "state-designer"

type Props = {
  value: any
  onChange: string
  type?: string
}

const Input: React.FC<Props> = ({ value, onChange, type = "text" }) => {
  const { data, send, can } = useStateDesigner(counter)

  return (
    <input
      type={type}
      value={data.inputValue}
      disabled={!can(onChange, value)}
      onChange={e => {
        const payload =
          type === "number" ? parseFloat(e.target.value) : e.target.value
        send(onChange, payload)
      }}
    />
  )
}

export default Input
