// @refresh-reset
import * as React from 'react'
import type { S } from '@state-designer/core'

/**
 * Subscribe a component to a state created with createState.
 * @param design A state returned from createState.
 */

export default function useGlobalState<D, V extends Record<string, S.Value<D>>>(
  design: S.DesignedState<D, V>
) {
  const [current, setCurrent] = React.useState(() => design)

  React.useEffect(() => {
    setCurrent(design)

    return design.onUpdate((update) =>
      setCurrent((current) => ({
        ...current,
        index: update.index,
        data: update.data,
        active: update.active,
        stateTree: update.stateTree,
        values: update.values,
        log: update.log,
      }))
    )
  }, [design])

  return current
}
