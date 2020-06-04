import * as React from "react"
import { act, render, fireEvent } from "@testing-library/react"
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
    }

    return { components, ...utils }
  }

  test("It should mount the component.", () => {
    const utils = setup()
    const { container } = utils.components
    expect(container).toBeInTheDocument()
  })
}

async function pause(duration = 1000) {
  return act(async () => {
    await new Promise((resolve) => setTimeout(resolve, duration))
  })
}
