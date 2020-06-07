import * as React from "react"
import { cloneDeep, sample } from "lodash"

export { cloneDeep, sample }

// Shared helper functions for tutorials.

/**
 * Create an array containing n numbers.
 * @param {number} n The desired array length.
 * @example
 * range(4) // [0, 1, 2, 3]
 * range(5) // [0, 1, 2, 3, 4]
 */
export function range(n) {
  return [...Array(n)].map((_, i) => i)
}

/**
 * Create an array containing y number of rows with x number of entries per row.
 * @param {number} y The desired length of the outer array.
 * @param {number} x The desired array of each inner array.
 * @example
 * range2d(2, 2) // [[0, 1], [0, 1]]
 * range2d(2, 3) // [[0, 1], [0, 1], [0, 1]]
 */
export function range2d(y, x) {
  return range(y).map(() => range(x).map((i) => i))
}

/**
 * Swap the values of an array at index a and b.
 * @param {any[]} arr The array to mutate.
 * @param {number} a The first index to swap.
 * @param {number} b The second index to swap.
 * @example
 * swap([0, 1, 2], 0, 2) // [2, 1, 0]
 * swap([0, 1, 2], 1, 2) // [0, 2, 1]
 */
export function swap(arr, a, b) {
  ;[arr[a], arr[b]] = [arr[b], arr[a]]
  return arr
}

/**
 * Randomly re-arrange the values of an array.
 * @param {any[]} arr The array to mutate.
 * @example
 * shuffle([0, 1, 2, 3]) // [2, 3, 1, 0]
 * shuffle([0, 1, 2, 3]) // [1, 0, 3, 2]
 */
export function shuffle(arr) {
  let a = arr.length

  while (a) {
    const b = Math.floor(Math.random() * a--)
    swap(arr, a, b)
  }

  return arr
}

/**
 * Clamps a number (num) between the minimum and maximum values.
 * @param {*} num
 * @param {*} min
 * @param {*} max
 */
export function clamp(num, min, max) {
  return Math.max(Math.min(num, Math.max(min, max)), Math.min(min, max))
}

/**
 * Add a delay into an asynchronous function.
 * @param {number} ms
 */
export async function delay(ms = 1000) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * A hook for responding to key down and key up events.
 * @param {options} handlers An object containing callbacks for onKeyDown and onKeyUp.
 */
export function useKeyboardInputs(handlers = { onKeyDown: {}, onKeyUp: {} }) {
  const { onKeyDown = {}, onKeyUp = {} } = handlers
  React.useEffect(() => {
    function handleKeydown(event) {
      if (onKeyDown[event.key] !== undefined) {
        event.preventDefault()
        onKeyDown[event.key](event)
      }
    }

    function handleKeyup(event) {
      if (onKeyUp[event.key] !== undefined) {
        event.preventDefault()
        onKeyUp[event.key](event)
      }
    }

    document.body.addEventListener("keydown", handleKeydown)
    document.body.addEventListener("keyup", handleKeyup)
    return () => {
      document.body.removeEventListener("keydown", handleKeydown)
      document.body.removeEventListener("keyup", handleKeyup)
    }
  }, [])
}
