import { styled } from "components/theme"

interface ContentProps {
  children: React.ReactNode
}

export default function Content({ children }: ContentProps) {
  return (
    <ContentContainer>
      <ContentTitle align="top">States</ContentTitle>
      <ContentSection>
        <ul>{}</ul>
      </ContentSection>
      <ContentTitle align="top">Events</ContentTitle>
      <ContentSection>
        <ul>{}</ul>
      </ContentSection>
      <Spacer />
      <ContentTitle align="bottom">Event Payloads</ContentTitle>
      {children}
    </ContentContainer>
  )
}

const Spacer = styled.div({
  flexGrow: 2,
})

const ContentContainer = styled.div({
  gridArea: "content",
  position: "relative",
  display: "flex",
  flexDirection: "column",
  gridTemplateRows: 40,
  borderRight: "2px solid $border",
})

const ContentTitle = styled.div({
  display: "flex",
  alignItems: "center",
  bg: "$muted",
  p: "$1",
  color: "$text",
  variants: {
    align: {
      top: { borderBottom: "2px solid $border" },
      bottom: { borderTop: "2px solid $border" },
    },
  },
})

const ContentSection = styled.div({
  "& ul": {
    display: "flex",
    m: 0,
    pl: 0,
  },
  "& li": {
    p: "$1",
    m: 0,
    ml: 0,
  },
})
