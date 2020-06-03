import * as React from "react"
import {
  waitForElementToBeRemoved,
  act,
  render,
  fireEvent,
} from "@testing-library/react"
import { ThemeProvider } from "@chakra-ui/core"

export default function (Component) {
  const setup = () => {
    const utils = render(
      <ThemeProvider>
        <Component />
      </ThemeProvider>
    )

    const components = {
      minute: utils.getByLabelText("minute-button"),
      second: utils.getByLabelText("second-button"),
      reset: utils.getByLabelText("reset-button"),
      time: utils.getByLabelText("Time"),
      testTime: utils.getByLabelText("test-time"),
      startStop: utils.getByLabelText("start-stop-button"),
      container: utils.getByLabelText("container"),
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
    expect(time).toHaveTextContent("00:00")
  })

  test("It should increase time by minute button.", () => {
    const utils = setup()
    const { time, minute } = utils.components
    act(() => void fireEvent.click(minute))
    expect(time).toHaveTextContent("01:00")
  })

  test("It should increase time by second button.", () => {
    const utils = setup()
    const { time, second } = utils.components
    act(() => void fireEvent.click(second))
    expect(time).toHaveTextContent("00:01")
  })

  test("It should have start button disabled when time is zero.", () => {
    const utils = setup()
    const { time, startStop } = utils.components
    expect(time).toHaveTextContent("00:00")
    expect(startStop).toBeDisabled()
  })

  test("It should have start button enabled when time is not zero.", () => {
    const utils = setup()
    const { second, startStop } = utils.components
    act(() => void fireEvent.click(second))
    expect(startStop).not.toBeDisabled()
  })

  test("It should start counting down.", async () => {
    const utils = setup()
    const { minute, second, startStop, time } = utils.components

    fireEvent.click(minute)
    fireEvent.click(second)
    fireEvent.click(startStop)

    await act(async () => {
      await pause(1050)
      expect(time).toHaveTextContent("01:00")
      fireEvent.click(startStop)
    })
  })

  test("It should have minute and second buttons disabled while counting down.", async () => {
    const utils = setup()
    const { minute, second, startStop, time } = utils.components

    fireEvent.click(minute)
    fireEvent.click(second)
    fireEvent.click(startStop)
    expect(minute).toBeDisabled()
    expect(second).toBeDisabled()
  })

  test("It should resume counting down.", async () => {
    const utils = setup()
    const { minute, second, startStop, time } = utils.components

    fireEvent.click(minute)
    fireEvent.click(second)
    fireEvent.click(startStop)

    await act(async () => {
      await pause(1050)
      expect(time).toHaveTextContent("01:00")
      fireEvent.click(startStop)
      await pause(1050)
      fireEvent.click(startStop)
      await pause(1050)
      expect(time).toHaveTextContent("00:59")
      fireEvent.click(startStop)
    })
  })

  test("It should allow time adjustments before resuming.", async () => {
    const utils = setup()
    const { minute, second, startStop, time } = utils.components

    fireEvent.click(minute)
    fireEvent.click(second)
    fireEvent.click(startStop)

    await act(async () => {
      await pause(1050)
      expect(time).toHaveTextContent("01:00")
      fireEvent.click(startStop)
      fireEvent.click(minute)
      fireEvent.click(second)
      await pause(1050)
      fireEvent.click(startStop)
      await pause(1050)
      expect(time).toHaveTextContent("02:00")
      fireEvent.click(startStop)
    })
  })

  test("It should reset while stopped.", async () => {
    const utils = setup()
    const { reset, minute, second, time } = utils.components

    fireEvent.click(minute)
    fireEvent.click(second)
    expect(time).toHaveTextContent("01:01")
    fireEvent.click(reset)
    expect(time).toHaveTextContent("00:00")
  })

  test("It should reset while counting down.", async () => {
    const utils = setup()
    const { reset, minute, second, startStop, time } = utils.components

    fireEvent.click(minute)
    fireEvent.click(second)
    fireEvent.click(startStop)

    await act(async () => {
      await pause(1050)
      expect(time).toHaveTextContent("01:00")
      fireEvent.click(reset)
      await pause(1050)
      expect(time).toHaveTextContent("00:00")
    })
  })
}

async function pause(duration = 1000) {
  await new Promise((resolve) => setTimeout(resolve, duration))
}
