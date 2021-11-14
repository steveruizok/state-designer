import * as React from "react"
import { useStateDesigner } from "@state-designer/react"

type Switch = { id: string; switched: boolean }

type SwitchCollection = Record<string, Switch>

const switches: SwitchCollection = {
  0: { id: "0", switched: false },
  1: { id: "1", switched: false },
  2: { id: "2", switched: true },
}

export const Switches: React.FC = () => {
  const state = useStateDesigner({
    data: { switches },
    on: {
      FLIPPED_SWITCH: {
        get: "switch",
        do: "flipSwitch",
      },
    },
    results: {
      switch(data, payload: Switch) {
        return data.switches[payload.id]
      },
    },
    actions: {
      flipSwitch(data, payload, result: Switch) {
        result.switched = !result.switched
      },
    },
  })

  return (
    <div>
      {Object.values(state.data.switches).map((s, i) => (
        <div key={i}>
          <input
            type="checkbox"
            checked={s.switched}
            onChange={() => state.send("FLIPPED_SWITCH", s)}
          />
        </div>
      ))}
    </div>
  )
}

export default Switches
