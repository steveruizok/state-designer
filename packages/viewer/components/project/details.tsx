import * as React from "react"
import { styled, TitleRow } from "components/theme"

interface DetailsProps {
  children: React.ReactNode
}

export default function Details({ children }: DetailsProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  function toggleOpen() {
    setIsOpen(!isOpen)
  }

  return (
    <DetailsContainer>
      <TitleRow>Details</TitleRow>
      {children}
    </DetailsContainer>
  )
}

const DetailsContainer = styled.div({
  gridArea: "details",
  position: "relative",
  borderTop: "2px solid $border",
  borderRight: "2px solid $border",
})
