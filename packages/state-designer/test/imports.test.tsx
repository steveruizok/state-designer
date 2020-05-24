import { createDesign, createState } from "../src"

const config = createDesign({
  data: { count: 0 },
  on: {
    ADDED_ONE: (d) => d.count++,
  },
})

const state = createState(config)

describe("createDesign", () => {
  it("Should create a config.", () => {
    expect(config).toBeTruthy()
  })
})

describe("createState", () => {
  it("Should create a state.", () => {
    expect(state).toBeTruthy()
  })
})
