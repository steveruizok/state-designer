import * as React from "react"
import { counter } from "../state"
import { useStateDesigner } from "state-designer"

type Props = {
  event: string
  payload?: any
}

const Button: React.FC<Props> = ({ event, payload, children }) => {
  const { can, send } = useStateDesigner(counter)

  return (
    <button
      disabled={!can(event, payload)}
      onClick={() => send(event, payload)}
    >
      {children}
    </button>
  )
}

export default Button
