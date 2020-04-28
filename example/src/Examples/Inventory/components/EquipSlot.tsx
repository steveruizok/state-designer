import * as React from "react"
import * as Shared from "./Shared"
import * as DS from "../game/types"

export type Props = {
  slot: DS.Slot
}

const EquipSlot: React.FC<Props> = ({ slot }) => {
  return (
    <Shared.Box
      {...slot.point}
      {...slot.size}
      style={{
        backgroundColor: "var(--zh-don-juan)",
      }}
    />
  )
}

export default EquipSlot
