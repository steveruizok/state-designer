import * as React from "react"
import globalState from "../state"
import * as T from "../types"
import { PanelItem } from "../panel/PanelItem"

export const EventItem: React.FC<{
  event: T.SendEvent
  isFirst: boolean
  isLast: boolean
  onSend: () => void
}> = ({ event, isFirst, isLast, onSend }) => {
  return (
    <PanelItem
      key={event.id}
      value={event.name}
      isActive={false}
      icon="square"
      onFormat={(name) => name.replace(" ", "_").toUpperCase()}
      onChange={(name) =>
        globalState.send("CHANGED_EVENT_NAME", {
          eventId: event.id,
          name,
        })
      }
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
            onSend()
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
}
