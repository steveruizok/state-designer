import React, { Component } from "react"
import { transform as _transform } from "buble"
import assign from "lodash/assign"

export const _poly = { assign }

const opts = {
  objectAssign: "_poly.assign",
  transforms: {
    dangerousForOf: true,
    dangerousTaggedTemplateString: true,
  },
}

const transform = (code) => _transform(code, opts).code

const evalCode = (code, scope) => {
  const scopeKeys = Object.keys(scope)
  const scopeValues = scopeKeys.map((key) => scope[key])
  // eslint-disable-next-line no-new-func
  const res = new Function("_poly", "React", ...scopeKeys, code)

  try {
    return res(_poly, React, ...scopeValues)
  } catch (e) {
    console.log("oops", e)
    return
  }
}

const errorBoundary = (Element) => {
  return class ErrorBoundary extends Component {
    componentDidCatch(error) {
      console.log(error.message)
    }

    render() {
      return typeof Element === "function" ? <Element /> : Element
    }
  }
}

export const generateElement = ({ code = "", scope = {} }) => {
  // NOTE: Remove trailing semicolon to get an actual expression.
  const codeTrimmed = code.trim().replace(/;$/, "")

  // NOTE: Workaround for classes and arrow functions.

  const transformed = transform(`return (${codeTrimmed})`).trim()

  const element = evalCode(transformed, scope)

  return errorBoundary(element)
}

export function transpile(code: string, scope: { [key: string]: any }) {
  const codeTrimmed = code.trim().replace(/;$/, "")
  const transformed = transform(`return (${codeTrimmed})`).trim()
  const element = evalCode(transformed, scope)
  const component = errorBoundary(element)
  return component
}
