// @jsx jsx
import * as React from "react"
import { getFlatStates, getEventsByState, getAllEvents } from "../utils"
import Column from "./column"
import { range } from "lodash"
import {
  jsx,
  Flex,
  Grid,
  Select,
  Textarea,
  Box,
  IconButton,
  Styled,
  Button,
} from "theme-ui"
import { useStateDesigner } from "@state-designer/react"
import { ui } from "../states/ui"
import { editor } from "../states/editor"
import Payload from "./content/payload"
import ContentRowItem from "./content/content-row-item"
import ContentSection from "./content/content-section"
import {
  PlayCircle,
  Circle,
  Square,
  Disc,
  Maximize,
  Crosshair,
  MinusCircle,
} from "react-feather"

const Content: React.FC = () => {
  const local = useStateDesigner(ui)
  const captive = useStateDesigner(local.data.captive, [local.data.captive])

  const allEvents = getAllEvents(captive.stateTree)
  const events = getEventsByState(allEvents)
  const states = getFlatStates(captive.stateTree)

  const [selectedEvent, setSelectedEvent] = React.useState<string>(
    events[0] ? events[0][0] : ""
  )
  const [payloads, setPayloads] = React.useState<Record<string, string>>({})

  React.useEffect(() => {
    if (!events.find(([eventName]) => eventName === selectedEvent)) {
      setSelectedEvent(events[0] ? events[0][0] : "")
    }
  }, [events])

  return (
    <Grid
      sx={{
        position: "relative",
        display: "grid",
        gap: 0,
        gridTemplateColumns: "1fr",
        gridTemplateRows: "min-content min-content 1fr min-content",
        gridArea: "content",
        overflowX: "hidden",
        overflowY: "scroll",
        p: 0,
        borderRight: "outline",
        borderColor: "border",
      }}
    >
      <ContentSection title="States">
        <Styled.ul>
          {states.map((node, i) => {
            return (
              <ContentRowItem key={i}>
                <Button
                  variant="contentRow"
                  title={`Zoom to ${node.name}`}
                  onClick={() => ui.send("SELECTED_NODE", { id: node.path })}
                  onMouseEnter={() =>
                    editor.send("HOVERED_STATE", { stateName: node.name })
                  }
                  onMouseLeave={() => editor.send("UNHOVERED_STATE")}
                >
                  {range(node.depth).map((i) => (
                    <Circle
                      key={i}
                      size="4"
                      fill="text"
                      sx={{ ml: 1, mr: 2, opacity: node.active ? 1 : 0.5 }}
                    />
                  ))}
                  {node.isInitial ? (
                    <Disc
                      size="12"
                      strokeWidth={3}
                      sx={{ mr: 2, opacity: node.active ? 1 : 0.5 }}
                    />
                  ) : node.parentType === "branch" ? (
                    <Circle
                      size="12"
                      strokeWidth={3}
                      sx={{ mr: 2, opacity: node.active ? 1 : 0.5 }}
                    />
                  ) : (
                    <MinusCircle
                      size="12"
                      strokeWidth={3}
                      opacity={node.active ? 1 : 0.5}
                      sx={{
                        mr: 2,
                        transform: "rotate(90deg)",
                        opacity: node.active ? 1 : 0.5,
                      }}
                    />
                  )}
                  <Box
                    sx={{ flexGrow: 1, textAlign: "left", overflow: "hidden" }}
                  >
                    {node.name}
                  </Box>
                </Button>
                <IconButton
                  data-hidey="true"
                  title={`Zoom to State`}
                  onClick={() =>
                    ui.send("ZOOMED_ON_STATE", { path: node.path })
                  }
                >
                  <Maximize />
                </IconButton>
                <IconButton
                  data-hidey="true"
                  title={`Force Transition to State`}
                  onClick={(e) => {
                    let target = node.name

                    if (e.shiftKey) {
                      target += ".previous"
                    } else if (e.altKey) {
                      target += ".restore"
                    }

                    captive.forceTransition(target)
                  }}
                >
                  <Crosshair size={12} />
                </IconButton>
              </ContentRowItem>
            )
          })}
        </Styled.ul>
      </ContentSection>
      <ContentSection title="Events">
        <Styled.ul>
          {events.map(([eventName], i) => {
            const disabled = !captive.can(eventName)
            return (
              <ContentRowItem key={i}>
                <Button
                  variant="contentEvent"
                  onClick={() => {
                    try {
                      const value = Function(`return ${payloads[eventName]}`)()
                      captive.send(eventName, value)
                    } catch (e) {
                      console.log("Error in event payload:", eventName)
                    }
                  }}
                  onMouseEnter={() =>
                    editor.send("HOVERED_EVENT", { eventName })
                  }
                  onMouseLeave={() => editor.send("UNHOVERED_EVENT")}
                >
                  <Square
                    strokeWidth={3}
                    size={8}
                    sx={{ ml: 1, mr: 2, mb: "1px" }}
                  />
                  <Box
                    sx={{
                      flexGrow: 1,
                      textAlign: "left",
                      overflow: "hidden",
                      opacity: disabled ? 0.5 : 1,
                    }}
                  >
                    {eventName}
                  </Box>
                  <PlayCircle
                    data-hidey="true"
                    size={12}
                    strokeWidth={2}
                    sx={{ color: "accent" }}
                  />
                </Button>
              </ContentRowItem>
            )
          })}
        </Styled.ul>
      </ContentSection>
      <Box sx={{ borderBottom: "outline", borderColor: "border" }} />
      <ContentSection isBottomUp={true} title="Event Payloads">
        <Grid
          sx={{
            gridTemplateColumns: "1fr",
            gridTemplateRows: "40px 1fr 40px",
            p: 2,
            width: "100%",
          }}
        >
          <Select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.currentTarget.value)}
          >
            {events.map(([eventName], i) => (
              <option key={i}>{eventName}</option>
            ))}
          </Select>
          <Textarea
            placeholder="Payload"
            value={payloads[selectedEvent] || ""}
            onChange={(e) => {
              setPayloads({
                ...payloads,
                [selectedEvent]: e.target.value,
              })
            }}
            sx={{ height: "100%", fontFamily: "monospace" }}
          ></Textarea>
          <Button
            variant="secondary"
            onClick={() => {
              try {
                const value = Function(`return ${payloads[selectedEvent]}`)()
                captive.send(selectedEvent, value)
              } catch (e) {
                console.log("Error in event payload:", selectedEvent)
              }
            }}
          >
            Send Event
            <PlayCircle
              data-hidey="true"
              size={14}
              strokeWidth={3}
              sx={{ ml: 2 }}
            />
          </Button>
        </Grid>
      </ContentSection>
    </Grid>
  )
}

export default Content
