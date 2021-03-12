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

    const components = {
      container: utils.getByLabelText("container"),
      toggle: utils.getByLabelText("toggle"),
      label: utils.getByLabelText("label"),
    }

    return { components, ...utils }
  }

  test("It should mount the component.", () => {
    const utils = setup()
    const { container } = utils.components
    expect(container).toBeInTheDocument()
  })

  test("It should start from toggled off.", () => {
    const utils = setup()
    const { toggle, label } = utils.components
    expect(toggle).not.toBeChecked()
    expect(label).toHaveTextContent("OFF")
  })

  test("It should toggle from off to on.", () => {
    const utils = setup()
    const { toggle, label } = utils.components
    fireEvent.click(toggle)
    expect(toggle).toBeChecked()
    expect(label).toHaveTextContent("ON")
  })

  test("It should toggle from on to off.", () => {
    const utils = setup()
    const { toggle, label } = utils.components
    fireEvent.click(toggle)
    fireEvent.click(toggle)
    expect(toggle).not.toBeChecked()
    expect(label).toHaveTextContent("OFF")
  })
}
