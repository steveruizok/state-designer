import * as React from "react"
import { Box } from "theme-ui"
import { useStateDesigner } from "@state-designer/react"
import globalState from "./state"
import { PanelList } from "./panel/PanelList"
import { PanelItem } from "./panel/PanelItem"
import { CreateRow } from "./shared"

export const EventList: React.FC = () => {
  const global = useStateDesigner(globalState)

  return (
    <PanelList title="Events">
      {global.values.events.map((event) => {
        const isFirst = event.index === 0
        const isLast = event.index === global.values.events.length - 1

        return (
          <PanelItem
            key={event.id}
            value={event.name}
            isActive={false}
            onFormat={(name) => name.replace(" ", "_").toUpperCase()}
            onChange={(name) => {
              console.log(name)
              globalState.send("CHANGED_EVENT_NAME", {
                eventId: event.id,
                name,
              })
            }}
            options={{
              title: event.name,
              functions: {
                "Move Up": isFirst
                  ? null
                  : () =>
                      globalState.send("MOVED_EVENT", {
                        eventId: event.id,
                        delta: -1,
                      }),
                "Move Down": isLast
                  ? null
                  : () =>
                      globalState.send("MOVED_EVENT", {
                        eventId: event.id,
                        delta: 1,
                      }),
                Rename: (input) => {
                  setTimeout(() => {
                    input.setSelectionRange(0, -1)
                    input.focus()
                  }, 16)
                },
                Send: () => {
                  global.values.simulation.send(event.name)
                },
                "–": null,
                Delete: () =>
                  globalState.send("DELETED_EVENT", {
                    eventId: event.id,
                  }),
              },
            }}
          />
        )
      })}
      <Box my={2} px={2}>
        <CreateRow
          defaultValue=""
          placeholder="Create Event"
          format={(name) => name.replace(" ", "_").toUpperCase()}
          onSubmit={(name) => global.send("ADDED_EVENT", name)}
        />
      </Box>
    </PanelList>
  )
}
