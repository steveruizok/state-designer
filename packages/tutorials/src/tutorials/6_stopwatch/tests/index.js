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
      start: utils.getByLabelText("start-button"),
      stop: utils.getByLabelText("stop-button"),
      reset: utils.getByLabelText("reset-button"),
      time: utils.getByLabelText("Time"),
    }

    return { components, ...utils }
  }

  test("It should mount the component.", () => {
    const utils = setup()
    const { container } = utils.components
    expect(container).toBeInTheDocument()
  })

  test("It should start with a time of zero.", () => {
    const utils = setup()
    const { time } = utils.components
    expect(time).toHaveTextContent("0.00")
  })

  test("It should have buttons disabled depending on state.", () => {
    const utils = setup()
    const { start, stop } = utils.components
    expect(start).not.toBeDisabled()
    expect(stop).toBeDisabled()
    fireEvent.click(start)
    expect(start).toBeDisabled()
    expect(stop).not.toBeDisabled()
  })

  test("It should enter start state and begin counting up.", async (done) => {
    const utils = setup()
    const { time, start } = utils.components

    fireEvent.click(start)
    await pause(120)

    expect(time.textContent).not.toBe("0.00")
    done()
  })

  test("It should stop.", async (done) => {
    const utils = setup()
    const { time, start, stop } = utils.components
    let t1, t2

    fireEvent.click(start)
    await pause(120)
    fireEvent.click(stop)
    t1 = time.textContent
    await pause(120)
    t2 = time.textContent

    expect(t1 === t2).toBeTruthy()
    done()
  })

  test("It should stop and re-start.", async (done) => {
    const utils = setup()
    const { time, start, stop } = utils.components
    let t1, t2

    fireEvent.click(start)
    await pause(120)
    fireEvent.click(stop)
    t1 = time.textContent
    fireEvent.click(start)
    await pause(120)
    t2 = time.textContent

    expect(t1 === t2).toBeFalsy()
    done()
  })

  test("It should reset while running.", async (done) => {
    const utils = setup()
    const { time, start, reset } = utils.components

    fireEvent.click(start)
    await pause(120)
    fireEvent.click(reset)
    expect(time.textContent).toBe("0.00")
    done()
  })

  test("It should reset while stopped.", async (done) => {
    const utils = setup()
    const { time, start, stop, reset } = utils.components

    fireEvent.click(start)
    fireEvent.click(stop)
    fireEvent.click(reset)

    await pause(120)

    expect(time.textContent).toBe("0.00")
    done()
  })
}

async function pause(duration = 1000) {
  return act(async () => {
    await new Promise((resolve) => setTimeout(resolve, duration))
  })
}
