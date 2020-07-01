import * as React from "react"
import globalState from "../state"
import * as T from "../types"
import { CreateRow } from "../shared"
import { Styled, Box } from "theme-ui"
import { useStateDesigner } from "@state-designer/react"
import { PanelHeading } from "../panel/PanelHeading"
import { Panel } from "../panel/Panel"
import { PanelItem } from "../panel/PanelItem"
import { ResizePanel } from "../panel/ResizePanel"
import { StateBranchItem } from "./StateBranchItem"
import { DataEditor } from "./DataEditor"
import { DragDropList } from "../DragDropList"
import { Draggable } from "react-beautiful-dnd"

export const ContentPanel: React.FC<{}> = () => {
  const global = useStateDesigner(globalState)

  return (
    <ResizePanel
      title="Content"
      width={320}
      maxWidth={600}
      minWidth={260}
      resizeDirection="left"
    >
      <Panel>
        <PanelHeading title="States"></PanelHeading>
        <Styled.ul>
          <StateBranchItem
            depth={0}
            selectedId={global.data.selection.state}
            {...global.values.stateTree}
          />
        </Styled.ul>
        <PanelHeading title="Events">
          <CreateRow
            defaultValue=""
            placeholder="Create Event"
            validate={(name) =>
              !global.values.events.find((event) => event.name === name)
            }
            format={(name) => name.replace(" ", "_").toUpperCase()}
            onSubmit={(name) => global.send("ADDED_EVENT", name)}
          />
        </PanelHeading>
        <DragDropList id="event-list" type="event">
          {global.values.events.map((event, i) => (
            <Draggable key={event.id} draggableId={event.id} index={i}>
              {(provided) => (
                <PanelItem
                  key={event.id}
                  icon="square"
                  value={event.name}
                  isActive={false}
                  provided={provided}
                  options={getEventOptions(
                    event,
                    event.index === 0,
                    event.index === global.values.events.length - 1,
                    () => global.values.simulation.send(event.name)
                  )}
                  onChange={(name) =>
                    global.send("CHANGED_EVENT_NAME", {
                      id: event.id,
                      name,
                    })
                  }
                />
              )}
            </Draggable>
          ))}
        </DragDropList>
        <DataEditor
          code={global.data.data}
          onChange={(code) => global.send("CHANGED_DATA", code)}
        />
        <PanelHeading title="Actions">
          <CreateRow
            defaultValue=""
            placeholder="Create Action"
            format={(name) => name.replace(" ", "")}
            onSubmit={(name) => global.send("CREATED_ACTION", name)}
          />
        </PanelHeading>
        <DragDropList id="actions-list" type="action">
          {global.values.actions.map((fn, i) => (
            <Draggable key={fn.id} draggableId={fn.id} index={i}>
              {(provided) => (
                <PanelItem
                  key={fn.id}
                  icon="square"
                  value={fn.name}
                  provided={provided}
                  isActive={false}
                  options={getActionOptions(
                    fn,
                    i === 0,
                    i === global.values.actions.length - 1
                  )}
                  onChange={(name) =>
                    global.send("CHANGED_ACTION_NAME", { id: fn.id, name })
                  }
                />
              )}
            </Draggable>
          ))}
        </DragDropList>
        <PanelHeading title="Conditions">
          <CreateRow
            defaultValue=""
            placeholder="Create Condition"
            format={(name) => name.replace(" ", "")}
            onSubmit={(name) => global.send("CREATED_CONDITION", name)}
          />
        </PanelHeading>
        <DragDropList id="conditions-list" type="condition">
          {global.values.conditions.map((fn, i) => (
            <Draggable key={fn.id} draggableId={fn.id} index={i}>
              {(provided) => (
                <PanelItem
                  key={fn.id}
                  icon="square"
                  value={fn.name}
                  isActive={false}
                  provided={provided}
                  options={getConditionOptions(
                    fn,
                    i === 0,
                    i === global.values.conditions.length - 1
                  )}
                  onChange={(name) =>
                    global.send("CHANGED_CONDITION_NAME", { id: fn.id, name })
                  }
                />
              )}
            </Draggable>
          ))}
        </DragDropList>
        <PanelHeading title="Values">
          <CreateRow
            defaultValue=""
            placeholder="Create Value"
            format={(name) => name.replace(" ", "")}
            onSubmit={(name) => global.send("CREATED_VALUE", name)}
          />
        </PanelHeading>
        <DragDropList id="values-list" type="value">
          {global.values.values.map((fn, i) => (
            <Draggable key={fn.id} draggableId={fn.id} index={i}>
              {(provided) => (
                <PanelItem
                  key={fn.id}
                  icon="square"
                  value={fn.name}
                  isActive={false}
                  provided={provided}
                  options={getValueOptions(
                    fn,
                    i === 0,
                    i === global.values.values.length - 1
                  )}
                  onChange={(name) =>
                    global.send("CHANGED_VALUE_NAME", { id: fn.id, name })
                  }
                />
              )}
            </Draggable>
          ))}
        </DragDropList>
      </Panel>
    </ResizePanel>
  )
}

function getEventOptions(
  event: T.SendEvent,
  isFirst: boolean,
  isLast: boolean,
  onSend: () => void
) {
  return {
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
  }
}

function getActionOptions(fn: T.Action, isFirst: boolean, isLast: boolean) {
  return {
    title: fn.name,
    functions: {
      "Move Up": isFirst
        ? null
        : () =>
            globalState.send("MOVED_ACTION", {
              id: fn.id,
              delta: -1,
            }),
      "Move Down": isLast
        ? null
        : () =>
            globalState.send("MOVED_ACTION", {
              id: fn.id,
              delta: 1,
            }),
      "–": null,
      Delete: () =>
        globalState.send("DELETED_ACTION", {
          id: fn.id,
        }),
    },
  }
}

function getConditionOptions(
  fn: T.Condition,
  isFirst: boolean,
  isLast: boolean
) {
  return {
    title: fn.name,
    functions: {
      "Move Up": isFirst
        ? null
        : () =>
            globalState.send("MOVED_CONDITION", {
              id: fn.id,
              delta: -1,
            }),
      "Move Down": isLast
        ? null
        : () =>
            globalState.send("MOVED_CONDITION", {
              id: fn.id,
              delta: 1,
            }),
      "–": null,
      Delete: () =>
        globalState.send("DELETED_CONDITION", {
          id: fn.id,
        }),
    },
  }
}

function getValueOptions(fn: T.Value, isFirst: boolean, isLast: boolean) {
  return {
    title: fn.name,
    functions: {
      "Move Up": isFirst
        ? null
        : () =>
            globalState.send("MOVED_VALUE", {
              id: fn.id,
              delta: -1,
            }),
      "Move Down": isLast
        ? null
        : () =>
            globalState.send("MOVED_VALUE", {
              id: fn.id,
              delta: 1,
            }),
      "–": null,
      Delete: () =>
        globalState.send("DELETED_VALUE", {
          id: fn.id,
        }),
    },
  }
}
