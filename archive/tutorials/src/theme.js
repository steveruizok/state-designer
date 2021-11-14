import * as React from "react"
import { theme } from "@chakra-ui/core"
import { Play, Square, FastForward, Rewind, Pause } from "react-feather"

export default {
  ...theme,
  fonts: {
    body: "Fira Sans, system-ui, sans-serif",
    heading: "Fira Sans, system-ui, sans-serif",
    mono: "Fira Code, Menlo, monospace",
  },
  icons: {
    ...theme.icons,
    play: {
      path: <Play />,
      viewBox: "0 0 24 24",
    },
    pause: {
      path: <Pause />,
      viewBox: "0 0 24 24",
    },
    rewind: {
      path: <Rewind />,
      viewBox: "0 0 24 24",
    },
    fastforward: {
      path: <FastForward />,
      viewBox: "0 0 24 24",
    },
    stop: {
      path: <Square />,
      viewBox: "0 0 24 24",
    },
  },
}
