import { createDesign } from '../'
import { design } from './shared'

describe('createDesign', () => {
  it('Should create a design.', () => {
    expect(design).toBeTruthy()
    expect(createDesign({})).toBeTruthy()
  })

  it('Should include collections.', () => {
    expect(design.results).toBeTruthy()
    expect(design.conditions).toBeTruthy()
    expect(design.actions).toBeTruthy()
    expect(design.asyncs).toBeTruthy()
    expect(design.times).toBeTruthy()
  })
})
