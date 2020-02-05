import * as React from "react"
import { useStateDesigner, Graph } from "state-designer"

export type Props = {
  state: Graph.Node
  transitionTarget?: string
  onToMouseEnter: (name: string, ref: HTMLDivElement) => void
  onToMouseLeave: () => void
  reportStateRef: (name: string, ref: any) => void
  reportTransitionRef: (name: string, ref: any) => void
  onMouseEnter: (name: string) => void
  onMouseLeave?: () => void
  onItemMouseEnter: (name: string, type: string) => void
  onItemMouseLeave: () => void
}

const EditorState: React.FC<Props> = ({
  state,
  onMouseEnter,
  onMouseLeave,
  transitionTarget,
  onToMouseEnter,
  onToMouseLeave,
  onItemMouseEnter,
  onItemMouseLeave,
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
    <div
      ref={ref}
      className={`state ${highlight ? "highlight" : ""}`}
      onMouseOver={e => {
        e.stopPropagation()
        onMouseEnter(state.path)
      }}
      onMouseLeave={() => onMouseLeave && onMouseLeave()}
    >
      <div className={`header`}>
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
              <EventsList
                auto
                events={state.autoEvents}
                onToMouseEnter={onToMouseEnter}
                onToMouseLeave={onToMouseLeave}
                onItemMouseEnter={onItemMouseEnter}
                onItemMouseLeave={onItemMouseLeave}
                reportTransitionRef={reportTransitionRef}
              />
            </>
          )}
          {state.events.length > 0 && (
            <>
              <div className="list-header">Events</div>
              <EventsList
                events={state.events}
                onToMouseEnter={onToMouseEnter}
                onToMouseLeave={onToMouseLeave}
                onItemMouseEnter={onItemMouseEnter}
                onItemMouseLeave={onItemMouseLeave}
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
                  onItemMouseEnter={onItemMouseEnter}
                  onItemMouseLeave={onItemMouseLeave}
                  reportStateRef={reportStateRef}
                  reportTransitionRef={reportTransitionRef}
                  onMouseEnter={onMouseEnter}
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
  auto?: boolean
  events: Graph.Event[]
  reportTransitionRef: (name: string, ref: any) => void
  onToMouseEnter: (name: string, ref: HTMLDivElement) => void
  onToMouseLeave: () => void
  onItemMouseEnter: (name: string, type: string) => void
  onItemMouseLeave: () => void
}> = ({
  events,
  onToMouseEnter,
  onToMouseLeave,
  onItemMouseEnter,
  onItemMouseLeave,
  reportTransitionRef,
  auto = false
}) => {
  return (
    <div className="list">
      {events.map((event, index) => (
        <Event
          auto={auto}
          key={index}
          event={event}
          onToMouseEnter={onToMouseEnter}
          onToMouseLeave={onToMouseLeave}
          onItemMouseEnter={onItemMouseEnter}
          onItemMouseLeave={onItemMouseLeave}
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
  onItemMouseEnter: (name: string, type: string) => void
  onItemMouseLeave: () => void
  auto?: boolean
}> = ({
  event,
  onToMouseEnter,
  onToMouseLeave,
  reportTransitionRef,
  onItemMouseEnter,
  onItemMouseLeave,
  auto
}) => {
  return (
    <div className="event">
      <div className="event-name">
        {event.name} {auto && <div className="chip">auto</div>}
      </div>
      <EventHandlersList
        eventHandlers={event.eventHandlers}
        onToMouseEnter={onToMouseEnter}
        onToMouseLeave={onToMouseLeave}
        onItemMouseEnter={onItemMouseEnter}
        onItemMouseLeave={onItemMouseLeave}
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
  onItemMouseEnter: (name: string, type: string) => void
  onItemMouseLeave: () => void
}> = ({
  eventHandlers,
  onToMouseEnter,
  onToMouseLeave,
  onItemMouseEnter,
  onItemMouseLeave,
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
          onItemMouseEnter={onItemMouseEnter}
          onItemMouseLeave={onItemMouseLeave}
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
  onItemMouseEnter: (name: string, type: string) => void
  onItemMouseLeave: () => void
}> = ({
  eventHandler,
  onToMouseEnter,
  onToMouseLeave,
  onItemMouseEnter,
  onItemMouseLeave,
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
            onItemMouseEnter={onItemMouseEnter}
            onItemMouseLeave={onItemMouseLeave}
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
  onItemMouseEnter: (name: string, type: string) => void
  onItemMouseLeave: () => void
}> = ({
  name,
  item,
  onToMouseEnter,
  onToMouseLeave,
  onItemMouseEnter,
  onItemMouseLeave,
  reportTransitionRef
}) => {
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
      {v.map((handlerItem, index) => {
        const isItem = ["do", "get", "if", "ifAny", "unless"].includes(name)
        return (
          <div
            key={index}
            className={`event-handler-value ${isItem ? "context" : ""}`}
            {...(isItem && {
              onMouseEnter: () => onItemMouseEnter(handlerItem as string, name),
              onMouseLeave: () => onItemMouseLeave()
            })}
          >
            {handlerItem}
          </div>
        )
      })}
    </div>
  )
}
