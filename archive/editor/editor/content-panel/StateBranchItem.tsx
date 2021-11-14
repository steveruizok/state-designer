import * as React from "react"
import globalState from "../state"
import * as T from "../types"
import { PanelItem } from "../panel/PanelItem"
import { DragDropList } from "../DragDropList"
import { Draggable, DraggableProvided } from "react-beautiful-dnd"

export const StateBranchItem: React.FC<{
  state: T.StateNode
  depth: number
  isInitial: boolean
  isFirst: boolean
  isLast: boolean
  descendants?: T.StateBranch[]
  provided?: DraggableProvided
  selectedId: string
}> = ({
  state,
  depth,
  isInitial,
  isFirst,
  isLast,
  descendants,
  selectedId,
  provided,
}) => {
  const isRoot = state.id === "root"

  return (
    <PanelItem
      value={state.name}
      depth={depth}
      icon={isInitial ? "disc" : "circle"}
      isActive={state.id === selectedId}
      provided={provided}
      onSelect={() => globalState.send("SELECTED_STATE", state.id)}
      onChange={(name) =>
        globalState.send("CHANGED_STATE_NAME", {
          stateId: state.id,
          name,
        })
      }
      options={{
        title: state.name,
        functions: {
          "Move Up":
            isFirst || isRoot
              ? null
              : () =>
                  globalState.send("MOVED_STATE", {
                    stateId: state.id,
                    delta: -1,
                  }),
          "Move Down":
            isLast || isRoot
              ? null
              : () =>
                  globalState.send("MOVED_STATE", {
                    stateId: state.id,
                    delta: 1,
                  }),
          ...(!isRoot &&
            (isInitial
              ? {
                  "Clear Initial": () =>
                    globalState.send("SET_INITIAL_STATE_ON_STATE", {
                      stateId: state.parent,
                      initialId: undefined,
                    }),
                }
              : {
                  "Make Initial": () =>
                    globalState.send("SET_INITIAL_STATE_ON_STATE", {
                      stateId: state.parent,
                      initialId: state.id,
                    }),
                })),
          Rename: isRoot
            ? null
            : (input) => {
                setTimeout(() => {
                  input.setSelectionRange(0, -1)
                  input.focus()
                }, 16)
              },
          "–": null,
          Delete: isRoot
            ? null
            : () =>
                globalState.send("DELETED_STATE", {
                  stateId: state.id,
                }),
        },
      }}
    >
      {descendants && (
        <DragDropList type={`${state.name}-children`} id={`children`}>
          {descendants.map((desc, i) => (
            <Draggable
              key={desc.state.id}
              draggableId={desc.state.id}
              index={i}
            >
              {(provided) => (
                <StateBranchItem
                  {...desc}
                  provided={provided}
                  depth={desc.state.depth}
                  selectedId={selectedId}
                />
              )}
            </Draggable>
          ))}
        </DragDropList>
      )}
    </PanelItem>
  )
}
