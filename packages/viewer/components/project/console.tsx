import * as React from "react"
import { styled, TitleRow } from "components/theme"

export const CONSOLE_HEIGHT = 40

interface ConsoleProps {
  children: React.ReactNode
}

export default function Console({ children }: ConsoleProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  function toggleOpen() {
    setIsOpen(!isOpen)
  }

  return (
    <ConsoleContainer>
      <TitleRow>Console</TitleRow>
      {children}
    </ConsoleContainer>
  )
}

const ConsoleContainer = styled.div({
  position: "absolute",
  bottom: 0,
  left: 0,
  width: "100%",
  height: `calc(${CONSOLE_HEIGHT}px - var(--console-offset))`,
  borderTop: "2px solid $border",
})
