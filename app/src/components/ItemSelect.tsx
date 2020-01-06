import React from "react"
import { Select } from "@rebass/forms"
import * as DS from "../interfaces"

export const ItemSelect: React.FC<{
  value: string
  onValueChange: (value: string) => void
  source: Map<string, DS.EventHandlerCallback>
}> = ({ value, onValueChange, source }) => {
  return (
    <Select value={value} onChange={e => onValueChange(e.target.value)}>
      <option value={"custom"}>Custom</option>
      {Array.from(source.values())
        .filter(v => !v.custom)
        .map(v => (
          <option key={v.id} value={v.id}>
            {v.name}
          </option>
        ))}
    </Select>
  )
}
