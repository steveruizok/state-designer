import * as React from "react"
import { Box, BoxProps, IconButton } from "theme-ui"

const IconSelect: React.FC<
  {
    title: string
    icon: React.ReactNode
    options: Record<string, null | (() => void)>
  } & BoxProps
> = ({ icon, title, options, ...props }) => {
  return (
    <Box {...props} sx={{ position: "relative", ...props.sx }}>
      <IconButton sx={{ pointerEvents: "none" }}>{icon}</IconButton>
      <select
        style={{
          opacity: 0,
          position: "absolute",
          top: 0,
          left: 0,
          height: "100%",
          width: "100%",
          cursor: "context-menu",
        }}
        value={""}
        onChange={(e) => {
          const handler = options[e.currentTarget.value]
          if (handler === null) return
          handler()
        }}
      >
        <option value="" disabled>
          {title}
        </option>
        <option disabled>---</option>
        {Object.entries(options).map(([name, handler], i) => (
          <option key={i} value={handler === null ? null : name}>
            {name}
          </option>
        ))}
      </select>
    </Box>
  )
}

export default IconSelect
