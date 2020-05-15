import { createConfig } from "../src"
import { config } from "./shared"

describe("createConfig", () => {
  it("Should create a config.", () => {
    expect(config).toBeTruthy()
    expect(createConfig({})).toBeTruthy()
  })

  it("Should include collections.", () => {
    expect(config.results).toBeTruthy()
    expect(config.conditions).toBeTruthy()
    expect(config.actions).toBeTruthy()
    expect(config.asyncs).toBeTruthy()
    expect(config.times).toBeTruthy()
  })
})
