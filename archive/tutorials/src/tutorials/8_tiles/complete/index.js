import React from "react"
import { useStateDesigner } from "@state-designer/react"
import { TileLayout, PlayButton, TileGrid, Tile } from "components"
import { range, shuffle, swap } from "utils"

export default function () {
  const state = useStateDesigner({
    data: {
      tiles: range(16).map((_, i) => i),
      selected: undefined,
      hovered: undefined,
    },
    on: {
      SHUFFLED: "shuffleTiles",
    },
    initial: "start",
    states: {
      start: {
        on: {
          SHUFFLED: { to: "playing" },
        },
      },
      gameOver: {
        on: {
          SHUFFLED: { to: "playing" },
        },
      },
      playing: {
        initial: "selecting",
        states: {
          selecting: {
            on: {
              SELECTED_TILE: {
                do: "setSelected",
                to: "selected",
              },
            },
          },
          selected: {
            initial: "cannotSwapTiles",
            on: {
              CANCELED_MOVE: [
                "clearSelectedTile",
                "clearHoveredTile",
                { to: "selecting" },
              ],
              HOVERED_TILE: [
                {
                  if: "hoveredTileIsAdjacentToSelectedTile",
                  do: "setHoveredTile",
                  to: "canSwapTiles",
                  else: {
                    do: "clearHoveredTile",
                    to: "cannotSwapTiles",
                  },
                },
              ],
            },
            states: {
              canSwapTiles: {
                on: {
                  MOVED_TILE: [
                    "swapHoveredAndSelectedTiles",
                    "clearSelectedTile",
                    "clearHoveredTile",
                    {
                      if: "userWonGame",
                      to: "gameOver",
                      else: {
                        to: "selecting",
                      },
                    },
                  ],
                },
              },
              cannotSwapTiles: {
                on: {
                  MOVED_TILE: {
                    do: "clearSelectedTile",
                    to: "selecting",
                  },
                },
              },
            },
          },
        },
      },
    },
    conditions: {
      hoveredTileIsAdjacentToSelectedTile(data, hovered) {
        const { x: hx, y: hy } = hovered
        const { x: sx, y: sy } = data.selected
        return !(
          hx < sx - 1 ||
          hx > sx + 1 ||
          hy < sy - 1 ||
          hy > sy + 1 ||
          (hx === sx && hy === sy)
        )
      },
      userWonGame(data) {
        return data.tiles.every((tile, i) => tile === i)
      },
    },
    actions: {
      clearSelectedTile(data) {
        data.selected = undefined
      },
      clearHoveredTile(data) {
        data.hovered = undefined
      },
      setSelected(data, selected) {
        data.selected = selected
      },
      setHoveredTile(data, hovered) {
        data.hovered = hovered
      },
      swapHoveredAndSelectedTiles(data) {
        swap(data.tiles, data.hovered.index, data.selected.index)
      },
      shuffleTiles(data) {
        shuffle(data.tiles)
      },
    },
  })

  return (
    <TileLayout onMouseLeave={() => state.send("CANCELED_MOVE")}>
      <TileGrid image={"https://source.unsplash.com/random/400x400"}>
        {state.data.tiles.map((tile, index) => {
          const x = index % 4
          const y = Math.floor(index / 4)
          const highlight =
            index === state.data.hovered?.index ||
            index === state.data.selected?.index

          return (
            <Tile
              key={tile}
              tile={tile}
              highlight={highlight}
              onMouseDown={() => state.send("SELECTED_TILE", { index, x, y })}
              onMouseEnter={() => state.send("HOVERED_TILE", { index, x, y })}
              onMouseUp={() => state.send("MOVED_TILE")}
            />
          )
        })}
      </TileGrid>
      <PlayButton
        highlight={state.isIn("gameOver")}
        onClick={() => state.send("SHUFFLED")}
      >
        {state.whenIn({
          start: "PLAY",
          playing: "START OVER",
          gameOver: "PLAY AGAIN",
        })}
      </PlayButton>
    </TileLayout>
  )
}
