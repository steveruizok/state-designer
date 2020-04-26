import * as React from "react"

type Props = {} & React.HTMLProps<HTMLDivElement>

const Background: React.FC<Props> = ({ ...rest }) => {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        backgroundColor: "#c5c0bd",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        ...rest.style,
      }}
      {...rest}
    />
  )
}

export default Background
