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
    const { start } = utils.components

    await act(async () => {
      fireEvent.click(start)
      await new Promise((resolve) => setTimeout(resolve, 120))
    })

    const time = utils.getByLabelText("Time")
    expect(time.textContent).not.toBe("0.00")
    done()
  })

  test("It should stop.", async (done) => {
    const utils = setup()
    const { start, stop } = utils.components
    let t1, t2

    await act(async () => {
      fireEvent.click(start)
      await new Promise((resolve) => setTimeout(resolve, 120))
      fireEvent.click(stop)
      t1 = utils.getByLabelText("Time").textContent
      await new Promise((resolve) => setTimeout(resolve, 120))
      t2 = utils.getByLabelText("Time").textContent
    })

    expect(t1 === t2).toBeTruthy()
    done()
  })

  test("It should stop and re-start.", async (done) => {
    const utils = setup()
    const { start, stop } = utils.components
    let t1, t2

    await act(async () => {
      fireEvent.click(start)
      await new Promise((resolve) => setTimeout(resolve, 120))
      fireEvent.click(stop)
      t1 = utils.getByLabelText("Time").textContent
      fireEvent.click(start)
      await new Promise((resolve) => setTimeout(resolve, 120))
      t2 = utils.getByLabelText("Time").textContent
    })

    expect(t1 === t2).toBeFalsy()
    done()
  })

  test("It should reset while running.", async (done) => {
    const utils = setup()
    const { start, reset } = utils.components

    await act(async () => {
      fireEvent.click(start)
      await new Promise((resolve) => setTimeout(resolve, 120))
      fireEvent.click(reset)
    })
    let time = utils.getByLabelText("Time").textContent
    expect(time).toBe("0.00")
    done()
  })

  test("It should reset while stopped.", async (done) => {
    const utils = setup()
    const { start, stop, reset } = utils.components

    fireEvent.click(start)
    fireEvent.click(stop)
    fireEvent.click(reset)

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 120))
    })

    let time = utils.getByLabelText("Time").textContent
    expect(time).toBe("0.00")
    done()
  })
}

async function pause(duration = 1000) {
  await new Promise((resolve) => setTimeout(resolve, duration))
}
