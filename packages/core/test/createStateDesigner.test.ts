import { createStateDesigner } from "../src"
import { config, state } from "./shared"

describe("createStateDesigner", () => {
  it("Should create a state.", () => {
    expect(state).toBeTruthy()
    expect(createStateDesigner({})).toBeTruthy()
    expect(createStateDesigner(config)).toBeTruthy()

    expect(state.stateTree).toBeTruthy()
    expect(state.active).toBeTruthy()
    expect(state.can).toBeTruthy()
    expect(state.whenIn).toBeTruthy()
    expect(state.data).toBeTruthy()
    expect(state.isIn).toBeTruthy()
  })

  it("Should handle transitions.", async (done) => {
    const { stateTree } = state
    const inactiveToInactive = stateTree.states.inactive.on.TOGGLE[0].to
    expect(inactiveToInactive).toBeTruthy()
    expect(inactiveToInactive?.(state.data, undefined, undefined)).toBe(
      "active"
    )

    expect(state.isIn("inactive")).toBeTruthy()

    await state.send("TOGGLE")

    expect(state.isIn("active")).toBeTruthy()
    expect(state.isIn("min")).toBeTruthy()
    expect(state.isIn("mid")).toBeFalsy()
    expect(state.isIn("max")).toBeFalsy()

    await state.send("TOGGLE")

    expect(state.isIn("inactive")).toBeTruthy()
    expect(state.isIn("min")).toBeFalsy()
    expect(state.isIn("mid")).toBeFalsy()
    expect(state.isIn("max")).toBeFalsy()

    done()
  })

  // Do initial active states work?

  // Do transitions work?

  // Do down-level activations work?

  // Do onEnter events work?

  // Do onEvent events work?

  // Do onExit events work?

  // Does causing a transition prevent further updates?

  // Do asynchronous actions block further updates?

  // Do data mutations work?

  // Do updates work?

  // Do auto events work?

  // Does asynchronous send queueing work?
})
