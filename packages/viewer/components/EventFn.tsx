import * as React from "react"
import { S } from "@state-designer/core"

import { Styled } from "theme-ui"
import { Card } from "@theme-ui/components"

export const EventFn: React.FC<{
  eventFn: S.EventFn<any, any>
  showName?: boolean
}> = ({ eventFn, showName = true }) => {
  let string = eventFn.toString()
  const name = eventFn.name
  const indent = string.match(/ +}/)

  if (indent) {
    const test = new RegExp(`(\n)( {${indent[0].length - 1}})`, "g")
    string = string.replace(test, "$1")
  }

  if (name) {
    string = string.replace(name, "")
  }

  return (
    <>
      {showName && eventFn.name ? (
        <Styled.pre>{eventFn.name}</Styled.pre>
      ) : (
        <Styled.pre>{string}</Styled.pre>
      )}
    </>
  )
}
