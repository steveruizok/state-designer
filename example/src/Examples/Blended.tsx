import * as React from "react"
import { useStateDesigner } from "state-designer"
import { motion } from "framer-motion"

const Blended: React.FC<{}> = () => {
  const { send, active, whenIn } = useStateDesigner({
    initial: "inactive",
    states: {
      inactive: {
        on: {
          TOGGLE: { to: "active.restore" }
        }
      },
      active: {
        on: {
          TOGGLE: { to: "inactive" }
        },
        initial: "normal",
        states: {
          normal: {
            on: {
              TOGGLE_BOLD: { to: "bold" }
            }
          },
          bold: {
            on: {
              TOGGLE_BOLD: { to: "normal" }
            }
          }
        }
      }
    }
  })

  return (
    <motion.div className="example" variants={{}} animate={active}>
      <h2>Blended</h2>
      <motion.p
        variants={{
          "root.active.normal": {
            fontWeight: 400
          },
          "root.active.bold": {
            fontWeight: 800
          }
        }}
        initial={false}
      >
        The state is{" "}
        {whenIn({
          inactive: "off",
          active: "on"
        })}
        .
      </motion.p>
      <div>
        <motion.div className="button-group">
          <motion.button
            onClick={() => send("TOGGLE")}
            variants={{
              inactive: {
                backgroundColor: "#fff"
              },
              active: {
                backgroundColor: "#ccc"
              }
            }}
            initial={false}
          >
            Toggle
          </motion.button>
          <motion.button
            variants={{
              inactive: { opacity: 0.5 },
              active: { opacity: 1 },
              "root.active.normal": {
                backgroundColor: "#fff"
              },
              "root.active.bold": {
                backgroundColor: "#ccc"
              }
            }}
            initial={false}
            onClick={() => send("TOGGLE_BOLD")}
          >
            Bold
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Blended
