// @jsx jsx
import * as React from "react"
import { getFlatStates, getEventsByState, getAllEvents } from "../utils"
import Column from "./column"
import { range } from "lodash"
import { jsx, Box, IconButton, Styled, Button } from "theme-ui"
import { useStateDesigner } from "@state-designer/react"
import { ui } from "../states/ui"
import { editor } from "../states/editor"
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

  return (
    <Column
      sx={{
        gridArea: "content",
        overflowX: "hidden",
        overflowY: "scroll",
        p: 0,
        borderRight: "outline",
        borderColor: "border",
        position: "relative",
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
          {events.map(([eventName, states], i) => {
            const disabled = !captive.can(eventName)
            return (
              <ContentRowItem key={i}>
                <Button
                  variant="contentEvent"
                  onClick={(e) => captive.send(eventName)}
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
    </Column>
  )
}

export default Content

const ContentRowItem: React.FC = ({ children }) => {
  return (
    <Styled.li
      sx={{
        bg: "background",
        display: "flex",
        alignItems: "center",
        pr: 1,
        "& button[data-hidey='true']": {
          visibility: "hidden",
        },
        "&:hover": {
          bg: "muted",
          "& button[data-hidey='true']": {
            bg: "none",
            visibility: "visible",
            "&:hover": {
              bg: "muted",
              color: "accent",
            },
            "&:disabled": {
              visibility: "hidden",
            },
          },
        },
        "&:focus": {
          outline: "none",
        },
      }}
    >
      {children}
    </Styled.li>
  )
}
