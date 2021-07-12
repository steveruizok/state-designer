export function last<T>(array: T[]): T {
  const length = array == null ? 0 : array.length
  return length ? array[length - 1] : undefined
}

export function fromEntries<T extends string, K>(arr: [T, K][]) {
  return arr.reduce<Record<T, K>>(
    (a, [k, v]) => ((a[k] = v), a),
    {} as Record<T, K>
  )
}
