import styled from "styled-components"

type ContainerProps = {
  rows: number
  columns: number
}

const Container = styled.div<ContainerProps>((props) => ({
  display: "grid",
  width: "fit-content",
  gridTemplateColumns: `repeat(${props.columns}, var(--cell-size))`,
  gridAutoRows: `var(--cell-size)`,
}))

export default Container
