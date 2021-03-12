import React from "react"
import { TileLayout, PlayButton, TileGrid, Tile } from "components"
import { range, shuffle, swap } from "utils"

export default function () {
  return (
    <TileLayout>
      <TileGrid image={"https://source.unsplash.com/random/400x400"}>
        {range(16).map((index) => {
          return <Tile key={index} tile={index} highlight={false} />
        })}
      </TileGrid>
      <PlayButton highlight={false}>PLAY</PlayButton>
    </TileLayout>
  )
}
