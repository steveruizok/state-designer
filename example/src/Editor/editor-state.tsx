import * as React from "react"
import { useStateDesigner, Graph } from "state-designer"

export type Props = {
  state: Graph.Node
  transitionTarget?: string
  onToMouseEnter: (name: string, ref: HTMLDivElement) => void
  onToMouseLeave: () => void
  reportStateRef: (name: string, ref: any) => void
  reportTransitionRef: (name: string, ref: any) => void
}

const EditorState: React.FC<Props> = ({
  state,
  transitionTarget,
  onToMouseEnter,
  onToMouseLeave,
  reportStateRef,
  reportTransitionRef,
  ...rest
}) => {
  const highlight = state.path.endsWith("." + transitionTarget)

  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    reportStateRef(state.path, ref.current)
  }, [])

  return (
    <div ref={ref} className={`state ${highlight ? "highlight" : ""}`}>
      <div className={`header`}>
        <span className="state-name">
          {state.initial && "✽ "}
          {state.name}
        </span>
        <span className="state-type">{state.type}</span>
      </div>
      <div className="body">
        <div className="events">
          {state.events.length > 0 && (
            <>
              <div className="list-header">Events</div>
              <EventsList
                events={state.events}
                onToMouseEnter={onToMouseEnter}
                onToMouseLeave={onToMouseLeave}
                reportTransitionRef={reportTransitionRef}
              />
            </>
          )}
          {state.autoEvents.length > 0 && (
            <>
              <div className="list-header">Auto Events</div>
              <EventsList
                events={state.autoEvents}
                onToMouseEnter={onToMouseEnter}
                onToMouseLeave={onToMouseLeave}
                reportTransitionRef={reportTransitionRef}
              />
            </>
          )}
        </div>
        {state.states.length > 0 && (
          <div className="states">
            <div className="list-header">States</div>
            <div className="list padded">
              {state.states.map((state, index) => (
                <EditorState
                  key={index}
                  state={state}
                  transitionTarget={transitionTarget}
                  onToMouseEnter={onToMouseEnter}
                  onToMouseLeave={onToMouseLeave}
                  reportStateRef={reportStateRef}
                  reportTransitionRef={reportTransitionRef}
                />
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
  events: Graph.Event[]
  reportTransitionRef: (name: string, ref: any) => void
  onToMouseEnter: (name: string, ref: HTMLDivElement) => void
  onToMouseLeave: () => void
}> = ({ events, onToMouseEnter, onToMouseLeave, reportTransitionRef }) => {
  return (
    <div className="list">
      {events.map((event, index) => (
        <Event
          key={index}
          event={event}
          onToMouseEnter={onToMouseEnter}
          onToMouseLeave={onToMouseLeave}
          reportTransitionRef={reportTransitionRef}
        />
      ))}
    </div>
  )
}

const Event: React.FC<{
  event: Graph.Event
  reportTransitionRef: (name: string, ref: any) => void
  onToMouseEnter: (name: string, ref: HTMLDivElement) => void
  onToMouseLeave: () => void
}> = ({ event, onToMouseEnter, onToMouseLeave, reportTransitionRef }) => {
  return (
    <div className="event">
      <button>{event.name}</button>
      <EventHandlersList
        eventHandlers={event.eventHandlers}
        onToMouseEnter={onToMouseEnter}
        onToMouseLeave={onToMouseLeave}
        reportTransitionRef={reportTransitionRef}
      />
    </div>
  )
}

const EventHandlersList: React.FC<{
  eventHandlers: Graph.EventHandler[]
  reportTransitionRef: (name: string, ref: any) => void
  onToMouseEnter: (name: string, ref: HTMLDivElement) => void
  onToMouseLeave: () => void
}> = ({
  eventHandlers,
  onToMouseEnter,
  onToMouseLeave,
  reportTransitionRef
}) => {
  return (
    <div>
      {eventHandlers.map((eventHandler, index) => (
        <EventHandler
          key={index}
          eventHandler={eventHandler}
          onToMouseEnter={onToMouseEnter}
          onToMouseLeave={onToMouseLeave}
          reportTransitionRef={reportTransitionRef}
        />
      ))}
    </div>
  )
}

const EventHandler: React.FC<{
  eventHandler: Graph.EventHandler
  reportTransitionRef: (name: string, ref: any) => void
  onToMouseEnter: (name: string, ref: HTMLDivElement) => void
  onToMouseLeave: () => void
}> = ({
  eventHandler,
  onToMouseEnter,
  onToMouseLeave,
  reportTransitionRef
}) => {
  return (
    <div className={"event-handler"}>
      {Object.entries(eventHandler)
        .filter(([_, value]) =>
          Array.isArray(value) ? value.length > 0 : value !== ""
        )
        .map(([key, value], index) => (
          <EventHandlerItem
            key={index}
            name={key}
            item={value}
            onToMouseEnter={onToMouseEnter}
            onToMouseLeave={onToMouseLeave}
            reportTransitionRef={reportTransitionRef}
          />
        ))}
    </div>
  )
}

const EventHandlerItem: React.FC<{
  name: string
  item: { name: string; payload: string } | string | string[]
  reportTransitionRef: (name: string, ref: any) => void
  onToMouseEnter: (name: string, ref: HTMLDivElement) => void
  onToMouseLeave: () => void
}> = ({ name, item, onToMouseEnter, onToMouseLeave, reportTransitionRef }) => {
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
    if (name === "to") {
      reportTransitionRef(v[0] as string, ref.current)
    }
  }, [])

  return (
    <div
      ref={ref}
      className="event-handler-item"
      {...(name === "to" && {
        onMouseEnter: () =>
          onToMouseEnter(v[0] as string, ref.current as HTMLDivElement),
        onMouseLeave: () => onToMouseLeave()
      })}
    >
      <div className="event-handler-key">{name}</div>
      {v.map((handlerItem, index) => (
        <div key={index} className="event-handler-value">
          {handlerItem}
        </div>
      ))}
    </div>
  )
}
