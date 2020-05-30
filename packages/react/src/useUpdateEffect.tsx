import * as React from "react"
import { S } from "@state-designer/core"

const emptyArray: unknown[] = []

export function useUpdateEffect<D extends unknown, V extends unknown>(
  state: S.DesignedState<D, V>,
  callback: S.SubscriberFn<S.DesignedState<D, V>>,
  dependencies: unknown[] = emptyArray
) {
  React.useEffect(() => {
    return state.onUpdate((update) => callback(update))
  }, [state.onUpdate, ...dependencies])
}
