import * as React from "react"
import { useStateDesigner, Graph } from "state-designer"
import { EditorMachine } from "./machine"

export type Props = {
  state: Graph.Node
}

const EditorState: React.FC<Props> = ({ state, ...rest }) => {
  const { data, send } = useStateDesigner(EditorMachine)
  const highlight = false

  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function reportPosition() {
      send("REPORT_STATE_REF", { name: state.path, ref: ref.current })
    }

    reportPosition()
    window.addEventListener("resize", reportPosition)
    return () => window.removeEventListener("resize", reportPosition)
  }, [])

  return (
    <div
      ref={ref}
      className={`state`}
      onMouseOver={e => {
        e.stopPropagation()
        send("STATE_MOUSE_ENTER", state.path)
      }}
      onMouseLeave={() => send("STATE_MOUSE_LEAVE")}
    >
      <div className={`header ${state.active ? "highlight" : ""}`}>
        <span className="state-name">
          {state.initial && "✽ "}
          {state.name}
        </span>
        <span className="chip">{state.type}</span>
      </div>
      <div className="body">
        <div className="events">
          {state.autoEvents.length > 0 && (
            <>
              <div className="list-header">Auto Events</div>
              <EventsList auto events={state.autoEvents} />
            </>
          )}
          {state.events.length > 0 && (
            <>
              <div className="list-header">Events</div>
              <EventsList events={state.events} />
            </>
          )}
        </div>
        {state.states.length > 0 && (
          <div className="states">
            <div className="list-header">States</div>
            <div className="list padded">
              {state.states.map((state, index) => (
                <EditorState key={index} state={state} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EditorState

const EventsList: React.FC<{
  auto?: boolean
  events: Graph.Event[]
}> = ({ events, auto = false }) => {
  return (
    <div className="list">
      {events.map((event, index) => (
        <Event auto={auto} key={index} event={event} />
      ))}
    </div>
  )
}

const Event: React.FC<{
  event: Graph.Event
  auto?: boolean
}> = ({ event, auto }) => {
  return (
    <div className="event">
      <div className="event-name">
        {event.name} {auto && <div className="chip">auto</div>}
      </div>
      <EventHandlersList eventHandlers={event.eventHandlers} />
    </div>
  )
}

const EventHandlersList: React.FC<{
  eventHandlers: Graph.EventHandler[]
}> = ({ eventHandlers }) => {
  return (
    <div>
      {eventHandlers.map((eventHandler, index) => (
        <EventHandler key={index} eventHandler={eventHandler} />
      ))}
    </div>
  )
}

const EventHandler: React.FC<{
  eventHandler: Graph.EventHandler
}> = ({ eventHandler }) => {
  return (
    <div className={"event-handler"}>
      {Object.entries(eventHandler)
        .filter(([_, value]) =>
          Array.isArray(value) ? value.length > 0 : value !== ""
        )
        .map(([key, value], index) => (
          <EventHandlerItem key={index} name={key} item={value} />
        ))}
    </div>
  )
}

const EventHandlerItem: React.FC<{
  name: string
  item: { name: string; payload: string } | string | string[]
}> = ({ name, item }) => {
  const { data, send } = useStateDesigner(EditorMachine)

  let v: (string | number)[] = []

  switch (typeof item) {
    case "object": {
      if (Array.isArray(item)) {
        for (let val of item) {
          v.push(val)
        }
      }
      break
    }
    case "number":
    case "string": {
      v = [item]
    }
    default: {
    }
  }

  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function reportPosition() {
      if (name === "to") {
        send("REPORT_TRANSITION_REF", {
          name: v[0] as string,
          ref: ref.current
        })
      }
    }
    reportPosition()
    window.addEventListener("resize", reportPosition)
    return () => window.removeEventListener("resize", reportPosition)
  }, [])

  return (
    <div
      ref={ref}
      className="event-handler-item"
      {...(name === "to" && {
        onMouseEnter: () =>
          send("TO_ITEM_MOUSE_ENTER", {
            name: v[0] as string,
            ref: ref.current
          }),
        onMouseLeave: () => send("TO_ITEM_MOUSE_LEAVE")
      })}
    >
      <div className="event-handler-key">{name}</div>
      {v.map((handlerItem, index) => {
        const isItem = ["do", "get", "if", "ifAny", "unless"].includes(name)
        return (
          <div
            key={index}
            className={`event-handler-value ${isItem ? "context" : ""}`}
            {...(isItem && {
              onMouseEnter: () =>
                send("ITEM_MOUSE_ENTER", {
                  type: name,
                  name: handlerItem as string
                }),
              onMouseLeave: () => send("ITEM_MOUSE_LEAVE")
            })}
          >
            {handlerItem}
          </div>
        )
      })}
    </div>
  )
}
