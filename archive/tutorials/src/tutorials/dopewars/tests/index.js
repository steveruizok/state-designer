import * as React from "react"
import { render, fireEvent } from "@testing-library/react"
import { ThemeProvider } from "@chakra-ui/core"

export default function (Component) {
  const setup = () => {
    const utils = render(
      <ThemeProvider>
        <Component />
      </ThemeProvider>
    )

    const container = utils.getByLabelText("container")

    return {
      components: { container },
      ...utils,
    }
  }

  test("It should mount the component.", () => {
    const utils = setup()
    const { container } = utils.components
    expect(container).toBeInTheDocument()
  })

  // test("It should start from 0.", () => {
  //   const utils = setup()
  //   const { count } = utils.components
  //   expect(count).toHaveTextContent("0")
  // })

  // test("It should increment when increased button is clicked.", () => {
  //   const utils = setup()
  //   const { count, increaseButton } = utils.components
  //   fireEvent.click(increaseButton)
  //   expect(count).toHaveTextContent("1")
  // })

  // test("It should decrement when decreased button is clicked.", () => {
  //   const utils = setup()
  //   const { count, decreaseButton, increaseButton } = utils.components
  //   fireEvent.click(increaseButton)
  //   fireEvent.click(increaseButton)
  //   expect(count).toHaveTextContent("2")
  //   fireEvent.click(decreaseButton)
  //   expect(count).toHaveTextContent("1")
  // })

  // test("It should not decrement when count is zero.", () => {
  //   const utils = setup()
  //   const { count, decreaseButton } = utils.components
  //   fireEvent.click(decreaseButton)
  //   expect(count).toHaveTextContent("0")
  // })
}
