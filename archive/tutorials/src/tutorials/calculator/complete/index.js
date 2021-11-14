/* eslint no-eval: 0 */
import React from "react"
import { Calculator as C } from "components"
import { useStateDesigner } from "@state-designer/react"

export default function () {
  const { data, whenIn, send } = useStateDesigner({
    data: {
      total: "0",
      entry: "0",
      operator: "+",
    },
    initial: "cleared",
    on: {
      CLEARED_ALL: {
        do: ["resetEntry", "resetTotal", "resetOperator"],
        to: "cleared",
      },
    },
    states: {
      cleared: {
        on: {
          ENTERED_NUMBER: {
            do: "setEnteredToEntry",
            to: "entered",
          },
          ENTERED_DECIMAL: {
            do: "pushEnteredToEntry",
            to: "entered",
          },
          CHANGED_OPERATOR: {
            do: "setOperator",
          },
        },
      },
      entered: {
        on: {
          ENTERED_ZERO: "pushEnteredToEntry",
          ENTERED_NUMBER: "pushEnteredToEntry",
          ENTERED_DECIMAL: {
            unless: "entryContainsDecimal",
            do: "pushEnteredToEntry",
          },
          CLEARED_ENTRY: [
            "removeLastFromEntry",
            {
              if: "entryIsEmpty",
              do: "resetEntry",
              to: "cleared",
            },
          ],
          INVERTED_ENTRY: "invertEntry",
          CHANGED_OPERATOR: {
            do: ["calculateTotal", "setOperator"],
            to: "calculated",
          },
          CALCULATED_TOTAL: {
            do: "calculateTotal",
            to: "calculated",
          },
        },
      },
      calculated: {
        on: {
          CHANGED_OPERATOR: {
            do: "setOperator",
          },
          CALCULATED_TOTAL: {
            do: "calculateTotal",
          },
          CLEARED_ENTRY: {
            do: "resetEntry",
            to: "cleared",
          },
          ENTERED_NUMBER: {
            do: "setEnteredToEntry",
            to: "entered",
          },
          ENTERED_DECIMAL: {
            do: ["resetEntry", "pushEnteredToEntry"],
            to: "entered",
          },
          ENTERED_ZERO: {
            do: "setEnteredToEntry",
            to: "entered",
          },
        },
      },
    },
    conditions: {
      entryContainsDecimal(data) {
        return data.entry.includes(".")
      },
      entryIsEmpty(data) {
        return data.entry.length === 0
      },
    },
    actions: {
      setEnteredToEntry(data, payload) {
        data.entry = payload
      },
      pushEnteredToEntry(data, payload) {
        data.entry += payload
      },
      removeLastFromEntry(data) {
        data.entry = data.entry.slice(0, -1)
      },
      resetEntry(data) {
        data.entry = "0"
      },
      resetTotal(data) {
        data.total = "0"
      },
      resetOperator(data) {
        data.operator = "+"
      },
      invertEntry(data) {
        if (data.entry.startsWith("-")) {
          data.entry = data.entry.slice(1)
        } else {
          data.entry = "-" + data.entry
        }
      },
      setOperator(data, payload) {
        data.operator = payload
      },
      calculateTotal(data) {
        const string = `${data.total}${data.operator}${data.entry}`
        data.total = eval(string).toString()
      },
    },
  })

  const value = whenIn({
    calculated: data.total,
    default: data.entry,
  })

  return (
    <C.Layout>
      <C.Operation>
        {data.total} {data.operator} {data.entry}
      </C.Operation>
      <C.Value>{value.slice(0, 10)}</C.Value>
      <C.Button onClick={() => send("CLEARED_ENTRY")}>CE</C.Button>
      <C.Button onClick={() => send("CLEARED_ALL")}>AC</C.Button>
      <C.Button onClick={() => send("INVERTED_ENTRY")}>+/-</C.Button>
      <C.Button onClick={() => send("CHANGED_OPERATOR", "/")}>/</C.Button>
      <C.Button onClick={() => send("ENTERED_NUMBER", "1")}>1</C.Button>
      <C.Button onClick={() => send("ENTERED_NUMBER", "2")}>2</C.Button>
      <C.Button onClick={() => send("ENTERED_NUMBER", "3")}>3</C.Button>
      <C.Button onClick={() => send("CHANGED_OPERATOR", "+")}>+</C.Button>
      <C.Button onClick={() => send("ENTERED_NUMBER", "4")}>4</C.Button>
      <C.Button onClick={() => send("ENTERED_NUMBER", "5")}>5</C.Button>
      <C.Button onClick={() => send("ENTERED_NUMBER", "6")}>6</C.Button>
      <C.Button onClick={() => send("CHANGED_OPERATOR", "-")}>-</C.Button>
      <C.Button onClick={() => send("ENTERED_NUMBER", "7")}>7</C.Button>
      <C.Button onClick={() => send("ENTERED_NUMBER", "8")}>8</C.Button>
      <C.Button onClick={() => send("ENTERED_NUMBER", "9")}>9</C.Button>
      <C.Button onClick={() => send("CHANGED_OPERATOR", "*")}>*</C.Button>
      <C.ZeroButton onClick={() => send("ENTERED_ZERO", "0")}>0</C.ZeroButton>
      <C.Button onClick={() => send("ENTERED_DECIMAL", ".")}>.</C.Button>
      <C.Button onClick={() => send("CALCULATED_TOTAL")}>=</C.Button>
    </C.Layout>
  )
}
