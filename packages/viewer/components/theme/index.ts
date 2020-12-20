import { styled, css } from "./core"

export { styled, css }

export const Box = styled.div({})

export const Grid = styled.div({
  display: "grid",
})

export const Flex = styled.div({
  display: "flex",
})

export const Button = styled.button({})

export const Input = styled.input({})

export const Text = styled.p({
  m: 0,
  p: 0,
  variants: {
    type: {
      body: {
        fontSize: "$2",
        lineHeight: "$body",
      },
    },
  },
})

export const TitleRow = styled.div({
  display: "flex",
  alignItems: "center",
  bg: "$muted",
  p: "$1",
  color: "$text",
  borderBottom: "2px solid $border",
})

export const IconButton = styled.button({
  bg: "transparent",
  borderRadius: 4,
  border: "none",
  outline: "none",
  "&:hover": {
    bg: "$muted",
    color: "red",
  },
  p: "$1",
  cursor: "pointer",
  svg: {
    height: 18,
    width: 18,
  },
})
