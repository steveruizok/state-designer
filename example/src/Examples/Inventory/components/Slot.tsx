import * as React from "react"
import * as Shared from "./Shared"
import * as DS from "../game/types"
import things from "../game/things"

export type Props = {
  slot: DS.Slot
  item: DS.Item | undefined
}

const Slot = React.forwardRef<HTMLDivElement, Props>(({ slot, item }, ref) => {
  return (
    <Shared.Box
      ref={ref}
      {...slot.point}
      {...slot.size}
      style={{
        backgroundColor: "var(--zh-don-juan)",
      }}
    >
      {item && (
        <div
          style={{
            width: "100%",
            height: "100%",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundImage: `url(${things[item.thing].image})`,
            backgroundSize: `80% 80%`,
            pointerEvents: "none",
          }}
        />
      )}
    </Shared.Box>
  )
})

export default Slot
