import * as React from "react"

const useRefs = <T = HTMLElement>() => {
  const refs = React.useRef<Map<string, T>>(new Map())

  function register(key: string) {
    if (!key) return

    return function (ref: T) {
      refs.current.set(key, ref)
    }
  }

  function getRef(key: string) {
    return refs.current.get(key) || null
  }

  return { register, refs: refs.current, getRef }
}

export default useRefs
