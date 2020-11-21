import * as React from "react"
import { S } from "@state-designer/core"

export default function useUpdateEffect<
  D,
  V extends Record<string, S.Value<D>>
>(
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
