// @jsx jsx
import * as React from "react"
import { Sun, Moon } from "react-feather"
import { jsx, IconButton, useColorMode, BoxProps } from "theme-ui"

const ColorModeToggle: React.FC<BoxProps> = (props) => {
  const [colorMode, setColorMode] = useColorMode()

  return (
    <IconButton
      title="Change Color Mode"
      onClick={() => setColorMode(colorMode === "default" ? "dark" : "default")}
      sx={{ ml: 2, ...props.sx }}
    >
      {colorMode === "dark" ? <Moon /> : <Sun />}
    </IconButton>
  )
}

export default ColorModeToggle
