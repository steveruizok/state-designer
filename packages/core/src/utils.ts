export function last<T>(array: T[]): T {
  const length = array == null ? 0 : array.length
  return array[length - 1] as T
}

export function castArray(a: any | any[]) {
  return Array.isArray(a) ? a : [a]
}
