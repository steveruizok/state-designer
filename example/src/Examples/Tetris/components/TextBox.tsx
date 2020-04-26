import * as React from "react"

type Props = {
  x: number
  y: number
  width: number
  height: number
  fontSize?: number
} & React.HTMLProps<HTMLDivElement>

const TextBox: React.FC<Props> = ({
  x,
  y,
  width,
  height,
  fontSize = 13,
  children,
  ...rest
}) => {
  return (
    <div
      style={{
        backgroundColor: "var(--tetris-light)",
        gridColumn: `${x} / span ${width}`,
        gridRow: `${y} / span ${height}`,
        padding: 3,
      }}
      {...rest}
    >
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: `3px solid var(--tetris-mdark)`,
          fontFamily: "Gameboy",
          fontSize,
          color: "var(--tetris-dark)",
          textAlign: "center",
          ...rest.style,
        }}
      >
        {children}
      </div>
    </div>
  )
}

export default TextBox
