import * as S from "./types"

/* -------------------------------------------------- */
/*                    Create Config                   */
/* -------------------------------------------------- */

export function createConfig<
  D extends unknown,
  R extends Record<string, S.Result<D>>,
  C extends Record<string, S.Condition<D>>,
  A extends Record<string, S.Action<D>>,
  Y extends Record<string, S.Async<D>>,
  T extends Record<string, S.Time<D>>,
  V extends Record<string, S.Value<D>>
>(
  config: S.Config<D, R, C, A, Y, T, V>
): S.ConfigWithHelpers<D, R, C, A, Y, T, V> {
  return {
    ...config,
    createEventHandlerConfig: (
      eventHandlerConfig: S.EventHandlerConfig<D, R, C, A, T>
    ) => eventHandlerConfig,
    createEventHandlerObjectConfig: (
      eventHandlerItemConfig: S.EventHandlerObjectConfig<D, R, C, A, T>
    ) => eventHandlerItemConfig,
    createAsyncEventHandlerConfig: (
      asyncEventHandlerConfig: S.AsyncEventHandlerConfig<D, R, C, A, Y, T>
    ) => asyncEventHandlerConfig,
    createRepeatEventHandlerConfig: (
      repeatEventHandler: S.RepeatEventHandlerConfig<D, R, C, A, T>
    ) => repeatEventHandler,
    createStateConfig: (stateConfig: S.StateConfig<D, R, C, A, Y, T, V>) =>
      stateConfig,
    createActionConfig: (actionConfig: S.ActionConfig<D, A>) => actionConfig,
    createConditionConfig: (conditionConfig: S.ConditionConfig<D, C>) =>
      conditionConfig,
    createResultConfig: (resultConfig: S.ResultConfig<D, R>) => resultConfig,
    createTimeConfig: (timeConfig: S.TimeConfig<D, T>) => timeConfig,
    createValueConfig: (valueConfig: S.Value<D>) => valueConfig,
  }
}
