// @jsx jsx
import * as React from "react"
import { getFlatStates, getEventsByState, getAllEvents } from "../../utils"
import EventItem from "./event-item"
import StateItem from "./state-item"
import Payload from "./payload"
import { jsx, Grid, Box, Styled } from "theme-ui"
import { useStateDesigner } from "@state-designer/react"
import { Project } from "../../states"
import { Highlights } from "../../states/highlights"
import ContentSection from "./content-section"

const Content: React.FC = () => {
  const local = useStateDesigner(Project)
  const captive = useStateDesigner(local.data.captive, [local.data.captive])

  const allEvents = getAllEvents(captive.stateTree)
  const events = getEventsByState(allEvents)
  const states = getFlatStates(captive.stateTree)

  const [zapStates, setZapStates] = React.useState(false)
  const [zapEvents, setZapEvents] = React.useState(false)
  const [payloads, setPayloads] = React.useState<Record<string, string>>({})
  const [selectedEvent, setSelectedEvent] = React.useState<string>(
    events[0] ? events[0][0] : ""
  )

  React.useEffect(() => {
    if (!events.find(([eventName]) => eventName === selectedEvent)) {
      setSelectedEvent(events[0] ? events[0][0] : "")
    }
  }, [events])

  return (
    <Grid
      sx={{
        p: 0,
        gap: 0,
        position: "relative",
        display: "grid",
        gridTemplateColumns: "1fr",
        gridTemplateRows: "min-content min-content 1fr min-content",
        gridArea: "content",
        overflowX: "hidden",
        overflowY: "scroll",
        borderRight: "outline",
        borderColor: "border",
      }}
    >
      <ContentSection
        title="States"
        zap={zapStates}
        onZapChange={(zap) => setZapStates(zap)}
      >
        <Styled.ul>
          {states.map((node, i) => {
            return (
              <StateItem
                key={i}
                node={node}
                highlight={zapStates && node.active}
              />
            )
          })}
        </Styled.ul>
      </ContentSection>
      <ContentSection
        title="Events"
        zap={zapEvents}
        onZapChange={(zap) => setZapEvents(zap)}
      >
        <Styled.ul>
          {events.map(([eventName], i) => {
            let isDisabled = false

            try {
              isDisabled = !captive.can(eventName)
            } catch (e) {
              // Chances are the event needs a payload.
              // At the moment, there's no way to tell whether
              // an event needs a payload or not, so we'll suppress
              // any error here.
            }

            return (
              <EventItem
                key={i}
                highlightCount={captive.log.length}
                highlight={zapEvents && eventName === captive.log[0]}
                eventName={eventName}
                disabled={isDisabled}
                payload={payloads[eventName]}
              />
            )
          })}
        </Styled.ul>
      </ContentSection>
      <Box onMouseEnter={() => Highlights.send("CLEARED_HIGHLIGHT")} />
      <ContentSection isBottomUp={true} zap={undefined} title="Event Payloads">
        <Payload
          payloads={payloads}
          setPayloads={setPayloads}
          can={captive.can}
          eventNames={events.map((e) => e[0])}
        />
      </ContentSection>
    </Grid>
  )
}

export default Content
