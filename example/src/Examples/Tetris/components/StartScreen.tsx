import * as React from "react"

type Props = {} & React.HTMLProps<HTMLDivElement>

const StartScreen: React.FC<Props> = ({ ...rest }) => {
  return (
    <div
      style={{
        ...rest.style,
      }}
      {...rest}
    ></div>
  )
}

export default StartScreen
