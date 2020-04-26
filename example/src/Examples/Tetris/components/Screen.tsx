import * as React from "react"

type Props = {} & React.HTMLProps<HTMLDivElement>

const Screen: React.FC<Props> = ({ ...rest }) => {
  return (
    <div
      style={{
        width: 432,
        height: 480,
        backgroundColor: "var(--tetris-light)",
        display: "grid",
        gridTemplateColumns: "repeat(18, 1fr)",
        gridTemplateRows: "repeat(20, 1fr)",
        borderRadius: 4,
        overflow: "hidden",
        ...rest.style,
      }}
      {...rest}
    />
  )
}

export default Screen
