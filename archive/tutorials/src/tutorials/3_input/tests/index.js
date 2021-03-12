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
      clearButton: utils.getByLabelText("Clear"),
      nameHeading: utils.getByLabelText("Name-heading"),
      titleHeading: utils.getByLabelText("Title-heading"),
      nameLabel: utils.getByLabelText("Name-label"),
      titleLabel: utils.getByLabelText("Title-label"),
      nameInput: utils.getByLabelText("Name-input"),
      titleInput: utils.getByLabelText("Title-input"),
    }

    return { components, ...utils }
  }

  test("It should mount the component.", () => {
    const utils = setup()
    const { container } = utils.components
    expect(container).toBeInTheDocument()
  })

  test("It should start with default name and title.", () => {
    const utils = setup()
    const {
      nameHeading,
      titleHeading,
      nameLabel,
      titleLabel,
      nameInput,
      titleInput,
    } = utils.components
    expect(nameLabel).toHaveTextContent("Name")
    expect(nameHeading).toHaveTextContent("Name")
    expect(nameInput).toHaveValue("")
    expect(titleLabel).toHaveTextContent("Title")
    expect(titleHeading).toHaveTextContent("Title")
    expect(titleInput).toHaveValue("")
  })

  test("It should update name when name input changes.", () => {
    const utils = setup()
    const { nameHeading, nameInput } = utils.components
    fireEvent.change(nameInput, { target: { value: "Steve" } })
    expect(nameInput).toHaveValue("Steve")
    expect(nameHeading).toHaveTextContent("Steve")
  })

  test("It should update title when title input changes.", () => {
    const utils = setup()
    const { titleHeading, titleInput } = utils.components
    fireEvent.change(titleInput, { target: { value: "Pawn" } })
    expect(titleInput).toHaveValue("Pawn")
    expect(titleHeading).toHaveTextContent("Pawn")
  })

  test("It should clear name and title.", () => {
    const utils = setup()
    const {
      clearButton,
      nameHeading,
      nameInput,
      titleHeading,
      titleInput,
    } = utils.components
    fireEvent.change(nameInput, { target: { value: "Steve" } })
    fireEvent.change(titleInput, { target: { value: "Pawn" } })
    expect(nameInput).toHaveValue("Steve")
    expect(titleInput).toHaveValue("Pawn")
    expect(nameHeading).toHaveTextContent("Steve")
    expect(titleHeading).toHaveTextContent("Pawn")
    fireEvent.click(clearButton)
    expect(nameInput).toHaveValue("")
    expect(titleInput).toHaveValue("")
    expect(nameHeading).toHaveTextContent("Name")
    expect(titleHeading).toHaveTextContent("Title")
  })
}
