import * as React from "react"
import { useStateDesigner } from "@state-designer/react"
import globalState, { StateBranch } from "./state"
import { PanelList } from "./panel/PanelList"
import { PanelItem } from "./panel/PanelItem"

export const StateTree: React.FC = () => {
  const global = useStateDesigner(globalState)
  const branch = global.values.stateTree
  const selectedId = global.data.selection.state

  return (
    <PanelList title="States">
      <Branch branch={branch} selectedId={selectedId} />
    </PanelList>
  )
}

const Branch: React.FC<{ branch: StateBranch; selectedId: string }> = ({
  branch,
  selectedId,
}) => {
  const { state, isInitial, isFirst, isLast } = branch
  const isRoot = state.id === "root"

  return (
    <PanelItem
      value={state.name}
      depth={state.depth}
      icon={isInitial ? "disc" : "circle"}
      isActive={state.id === selectedId}
      onSelect={() => globalState.send("SELECTED_STATE", state.id)}
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
      {branch.children && (
        <ul
          style={{
            width: "100%",
            margin: 0,
            padding: 0,
            listStyleType: "none",
          }}
        >
          {branch.children.map((child) => (
            <Branch
              key={child.state.id}
              branch={child}
              selectedId={selectedId}
            />
          ))}
        </ul>
      )}
    </PanelItem>
  )
}
