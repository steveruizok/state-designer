import React from "react"
import { Snake as S } from "components"
import { useKeyboardInputs } from "utils"

export default function () {
  useKeyboardInputs({
    onKeyDown: {},
  })

  return (
    <S.Layout>
      <S.PlayField>
        <S.Layer>
          <S.Cell x={4} y={4} color="yellow" />
          <S.Cell x={9} y={9} color="green" />
        </S.Layer>
      </S.PlayField>
      <S.Button highlight={true}>Start</S.Button>
    </S.Layout>
  )
}
