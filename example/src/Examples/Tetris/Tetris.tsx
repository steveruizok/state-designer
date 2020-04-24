import * as React from "react"
import { useStateDesigner } from "state-designer"
import game, { tetrominos, colors } from "./game"

const Tetris: React.FC<{}> = () => {
  const { data, send, active, graph } = useStateDesigner(game)

  const { current, next } = data

  React.useEffect(() => {
    function handleKeyPress(event: KeyboardEvent) {
      switch (event.key) {
        case "ArrowLeft": {
          send("MOVED_LEFT")
          break
        }
        case "ArrowRight": {
          send("MOVED_RIGHT")
          break
        }
        case "ArrowDown": {
          send("MOVED_DOWN")
          break
        }
        default: {
        }
      }
    }

    document.body.addEventListener("keydown", handleKeyPress)
    return () => document.body.removeEventListener("keydown", handleKeyPress)
  }, [send])

  console.log(active)

  return (
    <Grid>
      {data.grid.map((row, y) =>
        row.map((cell, x) => (
          <Cell
            key={`${x}_${y}`}
            x={x}
            y={y}
            width={1}
            height={1}
            fill={cell ? colors[cell] : "#fefefe"}
          />
        ))
      )}

      <Cell fill="#efefef" x={11} y={0} width={4} height={1}>
        NEXT
      </Cell>

      {next &&
        tetrominos[next].map(({ x, y }) => (
          <Cell
            key={`n_${x}_${y}`}
            x={11 + x}
            y={3 + y}
            width={1}
            height={1}
            fill={colors[next]}
          />
        ))}
      {current &&
        tetrominos[current.teromino].map(({ x, y }) => (
          <Cell
            key={`c_${x}_${y}`}
            x={current.point.x + x}
            y={current.point.y + y}
            width={1}
            height={1}
            fill={colors[current.teromino]}
          />
        ))}

      <Cell fill="#efefef" x={11} y={10} width={4} height={1}>
        <button onClick={() => send("GAME_STARTED")}>START GAME</button>
      </Cell>
    </Grid>
  )
}

const Grid: React.FC = ({ children }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(16, 24px)",
      gridTemplateRows: "repeat(20, 24px)",
      gridGap: 2,
    }}
  >
    {children}
  </div>
)

const Cell: React.FC<{
  fill: string
  x: number
  y: number
  width: number
  height: number
}> = ({ fill, height, width, x, y, children }) => (
  <div
    style={{
      backgroundColor: fill,
      gridColumn: `${x + 1} / span ${width}`,
      gridRow: `${y + 1} / span ${height}`,
      border: "1px solid rgba(0, 0, 0, 0.5)",
      textAlign: "center",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#000",
    }}
  >
    {children}
  </div>
)

export default Tetris
