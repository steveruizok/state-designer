import * as S from "./types"

/* -------------------------------------------------- */
/*                    Create Config                   */
/* -------------------------------------------------- */

export function createConfig<
  D extends unknown,
  R extends Record<string, S.Result<D>>,
  C extends Record<string, S.Condition<D>>,
  A extends Record<string, S.Action<D>>,
  Y extends Record<string, S.Async<D>>
>(config: S.Config<D, R, C, A, Y>): S.Config<D, R, C, A, Y> {
  return config
}
