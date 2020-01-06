import React from "react"
import { uniqueId } from "lodash-es"
import { ThemeProvider } from "emotion-theming"
import { useStateDesigner, createStateDesignerConfig } from "state-designer"
import theme from "./theme"
import { Box, Flex, Button, Heading, Text } from "rebass"
import { Input } from "@rebass/forms"
import { AnimatePresence, motion } from "framer-motion"
import { Designer } from "./machines"
import DesignerComponent from "./components/Designer"

const App = () => {
  const { data, can, send } = useStateDesigner(Designer)

  // const example = useStateDesigner({
  //   data: {
  //     count: 0
  //   },
  //   on: {
  //     GREET: data => console.log(data.count)
  //   },
  //   initial: "active",
  //   states: {
  //     inactive: {
  //       on: {
  //         TOGGLE: {
  //           to: "active"
  //         },
  //         TOGGLE_PREVIOUS: {
  //           to: "active.previous"
  //         },
  //         TOGGLE_RESTORE: {
  //           to: "active.restore"
  //         }
  //       }
  //     },
  //     active: {
  //       on: {
  //         TOGGLE: {
  //           to: "inactive"
  //         },
  //         INCREMENT: data => data.count++
  //       },
  //       states: {
  //         weight: {
  //           initial: "normal",
  //           states: {
  //             bold: {
  //               on: { TOGGLE_WEIGHT: { to: "normal" } }
  //             },
  //             normal: {
  //               on: { TOGGLE_WEIGHT: { to: "bold" } }
  //             }
  //           }
  //         },
  //         style: {
  //           initial: "normal",
  //           states: {
  //             italic: {
  //               on: { TOGGLE_STYLE: { to: "normal" } }
  //             },
  //             normal: {
  //               on: { TOGGLE_STYLE: { to: "italic" } }
  //             }
  //           }
  //         }
  //       }
  //     }
  //   }
  // })

  return (
    <ThemeProvider theme={theme}>
      {/* <h2>Active:</h2>
      <ul>
        {example.active.map(state => (
          <li>
            {state.path} ({state.type})
          </li>
        ))}
      </ul>
      <pre>{JSON.stringify(example.data, null, 2)}</pre>
      <button onClick={() => example.send("TOGGLE")}>Toggle</button>
      <button onClick={() => example.send("TOGGLE_PREVIOUS")}>
        Toggle (Previous)
      </button>
      <button onClick={() => example.send("TOGGLE_RESTORE")}>
        Toggle (Restore)
      </button>
      <button
        disabled={!example.can("INCREMENT")}
        onClick={() => example.send("INCREMENT")}
      >
        Increment
      </button>
      <button
        disabled={!example.can("TOGGLE_WEIGHT")}
        onClick={() => example.send("TOGGLE_WEIGHT")}
        style={{ fontWeight: example.isIn("weight.bold") ? 600 : 400 }}
      >
        Bold
      </button>
      <button
        disabled={!example.can("TOGGLE_STYLE")}
        onClick={() => example.send("TOGGLE_STYLE")}
        style={{ fontWeight: example.isIn("style.italic") ? 600 : 400 }}
      >
        Italic
      </button> */}
      {/* <DesignerComponent /> */}
    </ThemeProvider>
  )
}

export default App
