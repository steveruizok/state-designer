export function single<T>(item: T | T[]) {
  return Array.isArray(item) ? item[0] : item
}
