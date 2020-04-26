import * as React from "react"
import TextBox from "../components/TextBox"
import game from "../game"

type Props = {} & React.HTMLProps<HTMLDivElement>

const Start: React.FC<Props> = () => {
  return (
    <>
      <TextBox
        x={3}
        y={6}
        width={14}
        height={6}
        fontSize={20}
        onClick={() => game.send("GAME_STARTED")}
      >
        Click to Start!
      </TextBox>
      <TextBox x={5} y={13} width={10} height={6} fontSize={20}>
        A &#160;&#160;&#160;&#160;&#160; Left
        <br />D &#160;&#160;&#160; Right
        <br />S &#160;&#160;&#160;&#160;&#160; Down
        <br />W &#160; Rotate
      </TextBox>
      <div
        style={{ gridColumn: `1 / -1`, gridRow: `1 / -1` }}
        onClick={() => game.send("GAME_STARTED")}
      />
    </>
  )
}

export default Start
