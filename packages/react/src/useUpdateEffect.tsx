import * as React from "react"
import { S } from "@state-designer/core"

export function useUpdateEffect<D extends unknown, V extends unknown>(
  state: S.DesignedState<D, V>,
  callback: S.SubscriberFn<S.DesignedState<D, V>>,
  dependencies?: unknown[]
) {
  React.useEffect(() => {
    state.getUpdate(callback)
  }, [
    state.getUpdate,
    ...(dependencies ? dependencies : [state.data, state.active]),
  ])
}
