import { S } from "@state-designer/core"
import useGlobalState from "./useGlobalState"
import useLocalState from "./useLocalState"

const emptyArray: unknown[] = []

/* -------------------------------------------------- */
/*                     React Hook                     */
/* -------------------------------------------------- */

/**
 * Subscribe a component to an existing state, or to a new one created from the provided designuration.
 * @param design A designuration object for a new state — or a state returned from createState.
 * @param dependencies (optional) An array of dependencies that, when changed, will rebuild a new state from the provided design.
 */

export function useStateDesigner<D, V extends Record<string, S.Value<D>>>(
  design: S.DesignedState<D, V>
): ReturnType<typeof useGlobalState>

export function useStateDesigner<
  D,
  R extends Record<string, S.Result<D>>,
  C extends Record<string, S.Condition<D>>,
  A extends Record<string, S.Action<D>>,
  Y extends Record<string, S.Async<D>>,
  T extends Record<string, S.Time<D>>,
  V extends Record<string, S.Value<D>>
>(design: S.Design<D, R, C, A, Y, T, V>): ReturnType<typeof useLocalState>

export default function useStateDesigner<
  D,
  R extends Record<string, S.Result<D>>,
  C extends Record<string, S.Condition<D>>,
  A extends Record<string, S.Action<D>>,
  Y extends Record<string, S.Async<D>>,
  T extends Record<string, S.Time<D>>,
  V extends Record<string, S.Value<D>>
>(
  design: S.Design<D, R, C, A, Y, T, V> | S.DesignedState<D, V>,
  dependencies: any[] = emptyArray
) {
  if ((design as S.DesignedState<D, V>).active !== undefined) {
    return useGlobalState(design as S.DesignedState<D, V>)
  } else {
    return useLocalState(design as S.Design<D, R, C, A, Y, T, V>, dependencies)
  }
}
