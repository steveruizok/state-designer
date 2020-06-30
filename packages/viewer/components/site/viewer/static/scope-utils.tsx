import * as React from "react"
import { cloneDeep, sample } from "lodash"

// Shared helper functions for tutorials.

/**
 * Create an array containing n numbers, starting at zero.
 * @param {number} n The desired array length.
 * @example
 * range(4) // [0, 1, 2, 3]
 * range(5) // [0, 1, 2, 3, 4]
 */
export function range(n: number) {
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
export function range2d(y: number, x: number) {
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
export function swap<T>(arr: T[], a: number, b: number) {
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
export function shuffle<T>(arr: T[]) {
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
export function clamp(num: number, min: number, max: number) {
  return Math.max(Math.min(num, Math.max(min, max)), Math.min(min, max))
}

/**
 * Add a delay into an asynchronous function.
 * @param {number} ms
 */
export async function delay(ms: number = 1000) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * A hook for responding to key down and key up events.
 * @param {options} handlers An object containing callbacks for onKeyDown and onKeyUp.
 */
type KeyboardHandler = (event: KeyboardEvent) => void
type KeyHandlers = Record<string, KeyboardHandler>
type KeyboardEventHandlers = Record<string, KeyHandlers>

export function useKeyboardInputs(
  handlers: KeyboardEventHandlers = { onKeyDown: {}, onKeyUp: {} }
) {
  const ref = React.useRef<HTMLElement>()
  const element = ref.current

  React.useEffect(() => {
    if (!element) return
    const { onKeyDown, onKeyUp } = handlers
    function handleKeydown(event: KeyboardEvent) {
      if (onKeyDown?.[event.key] !== undefined) {
        event.preventDefault()
        onKeyDown[event.key](event)
      }
    }

    function handleKeyup(event: KeyboardEvent) {
      if (onKeyUp?.[event.key] !== undefined) {
        event.preventDefault()
        onKeyUp[event.key](event)
      }
    }

    element.addEventListener("keydown", handleKeydown)
    element.addEventListener("keyup", handleKeyup)

    return () => {
      element.removeEventListener("keydown", handleKeydown)
      element.removeEventListener("keyup", handleKeyup)
    }
  }, [element])

  return ref
}

type MouseEventHandler = (event: MouseEvent) => void
type MouseEventHandlers = Record<string, MouseEventHandler>

export function useMouseInput(handlers: MouseEventHandlers) {
  const ref = React.useRef<HTMLElement>()
  const { onMouseUp, onMouseDown, onMouseMove } = handlers
  const element = ref.current

  React.useEffect(() => {
    if (!element) return

    function handleMouseUp(event) {
      onMouseUp && onMouseUp(event)
    }

    function handleMouseDown(event) {
      onMouseDown && onMouseDown(event)
    }

    function handleMouseMove(event) {
      onMouseMove && onMouseMove(event)
    }

    element.addEventListener("mousedown", handleMouseDown)
    element.addEventListener("mouseup", handleMouseUp)
    element.addEventListener("mousemove", handleMouseMove)

    return () => {
      element.removeEventListener("mousedown", handleMouseDown)
      element.removeEventListener("mouseup", handleMouseUp)
      element.removeEventListener("mousemove", handleMouseMove)
    }
  }, [element])

  return ref
}

/**
 * Interpolate a new between two other numbers.
 * @param {number} a The low end of the range, shown when t is 0.
 * @param {number} b The high end of the range, shown when t is 1.
 * @param {number} t How far to interpolate between the numbers.
 */
export function lerp(a: number, b: number, t: number) {
  return a * (1 - t) + b * t
}

export { cloneDeep, sample }
