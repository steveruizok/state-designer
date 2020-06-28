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
  Text,
  Button,
} from "theme-ui"
import { useStateDesigner } from "@state-designer/react"
import { ui } from "../states/ui"
import { editor } from "../states/editor"
import { Highlights } from "../states/highlights"
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
  AlertOctagon,
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

  const [inputIsValid, setInputIsValid] = React.useState(true)
  const [inputError, setInputError] = React.useState("")

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
                  onMouseEnter={(e) =>
                    Highlights.send("HIGHLIT_STATE", {
                      stateName: node.name,
                      shiftKey: e.shiftKey,
                    })
                  }
                  onMouseLeave={() => Highlights.send("CLEARED_HIGHLIGHT")}
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
              <ContentRowItem
                key={i}
                onMouseOver={(e) =>
                  Highlights.send("HIGHLIT_EVENT", {
                    eventName,
                    shiftKey: e.shiftKey,
                  })
                }
                onMouseLeave={() => Highlights.send("CLEARED_HIGHLIGHT")}
              >
                <Button
                  variant="contentEvent"
                  onClick={() => {
                    try {
                      const value = Function(`return ${payloads[eventName]}`)()
                      captive.send(eventName, value)
                    } catch (e) {
                      console.warn("Error in event payload:", eventName)
                    }
                  }}
                  disabled={disabled}
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
                    }}
                  >
                    {eventName}
                  </Box>
                  <PlayCircle
                    data-hidey="true"
                    size={12}
                    strokeWidth={2}
                    sx={{ color: disabled ? "inactive" : "accent" }}
                  />
                </Button>
              </ContentRowItem>
            )
          })}
        </Styled.ul>
      </ContentSection>
      <Box onMouseEnter={() => Highlights.send("CLEARED_HIGHLIGHT")} />
      <ContentSection isBottomUp={true} title="Event Payloads">
        <Grid
          sx={{
            gridTemplateColumns: "1fr",
            gridTemplateRows: "40px 80px 40px 16px",
            p: 2,
            pb: 0,
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
            sx={{
              height: "100%",
              width: "100%",
              fontFamily: "monospace",
              bg: "none",
            }}
            style={{ margin: 0 }}
            autoCapitalize="false"
            autoComplete="false"
            placeholder="Payload"
            value={payloads[selectedEvent] || ""}
            onChange={(e) => {
              setPayloads({
                ...payloads,
                [selectedEvent]: e.target.value,
              })

              try {
                const value = Function(`return ${e.target.value}`)()
                setInputIsValid(captive.can(selectedEvent, value))
                setInputError("")
              } catch (e) {
                setInputError(e.message)
                setInputIsValid(false)
              }
            }}
          ></Textarea>
          <Button
            variant="secondary"
            disabled={!inputIsValid}
            onClick={() => {
              const value = Function(`return ${payloads[selectedEvent]}`)()
              captive.send(selectedEvent, value)
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
          <Flex
            sx={{
              alignItems: "center",
              width: "100%",
              fontSize: 1,
              textAlign: "left",
              zIndex: 1,
            }}
          >
            {inputError && (
              <AlertOctagon
                size={14}
                sx={{
                  color: "accent",
                  mr: 2,
                }}
              />
            )}
            {inputError || ""}
          </Flex>
        </Grid>
      </ContentSection>
    </Grid>
  )
}

export default Content
