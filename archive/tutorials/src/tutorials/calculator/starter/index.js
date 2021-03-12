/* eslint no-eval: 0 */
import React from "react"
import { Calculator as C } from "components"

export default function () {
  return (
    <C.Layout>
      <C.Operation>0 + 0</C.Operation>
      <C.Value>0</C.Value>
      <C.Button>CE</C.Button>
      <C.Button>AC</C.Button>
      <C.Button>+/-</C.Button>
      <C.Button>/</C.Button>
      <C.Button>1</C.Button>
      <C.Button>2</C.Button>
      <C.Button>3</C.Button>
      <C.Button>+</C.Button>
      <C.Button>4</C.Button>
      <C.Button>5</C.Button>
      <C.Button>6</C.Button>
      <C.Button>-</C.Button>
      <C.Button>7</C.Button>
      <C.Button>8</C.Button>
      <C.Button>9</C.Button>
      <C.Button>*</C.Button>
      <C.ZeroButton>0</C.ZeroButton>
      <C.Button>.</C.Button>
      <C.Button>=</C.Button>
    </C.Layout>
  )
}
