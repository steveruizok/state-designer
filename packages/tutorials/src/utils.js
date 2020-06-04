import cloneDeep from "lodash-es/cloneDeep"
import sample from "lodash-es/sample"

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
