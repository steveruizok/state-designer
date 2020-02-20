import React from "react"
import styled from "@emotion/styled"

const Container = styled.div`
  display: grid;
  grid-template-columns: auto 32px auto;
  gap: 8px;
  align-items: center;
  text-align: center;
  width: fit-content;
  border: 1px solid #000;
  padding: 8px;
  border-radius: 16px;
`

const Button = styled.button`
  width: fit-content;
  border: 1px solid #000;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 16px;
`

const Counter = () => {
  const [count, setCount] = React.useState(0)
  return (
    <Container>
      <Button disabled={count === 0} onClick={() => setCount(count - 1)}>
        -
      </Button>
      {count}
      <Button disabled={count === 10} onClick={() => setCount(count + 1)}>
        +
      </Button>
    </Container>
  )
}

export default Counter
