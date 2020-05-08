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
  T extends Record<string, S.Time<D>>
>(config: S.Config<D, R, C, A, Y>): S.ConfigWithHelpers<D, R, C, A, Y, T> {
  return {
    ...config,
    getEventHandlerConfig: (
      eventHandlerConfig: S.EventHandlerConfig<D, R, C, A, T>
    ) => eventHandlerConfig,
    getEventHandlerItemConfig: (
      eventHandlerItemConfig: S.EventHandlerItemConfig<D, R, C, A, T>
    ) => eventHandlerItemConfig,
    getAsyncEventHandlerConfig: (
      asyncEventHandlerConfig: S.AsyncEventHandlerConfig<D, R, C, A, Y, T>
    ) => asyncEventHandlerConfig,
    getRepeatEventHandlerConfig: (
      repeatEventHandler: S.RepeatEventHandlerConfig<D, R, C, A, T>
    ) => repeatEventHandler,
    getStateConfig: (stateConfig: S.StateConfig<D, R, C, A, Y, T>) =>
      stateConfig,
    getActionConfig: (actionConfig: S.ActionConfig<D, A>) => actionConfig,
    getConditionConfig: (conditionConfig: S.ConditionConfig<D, C>) =>
      conditionConfig,
    getResultConfig: (resultConfig: S.ResultConfig<D, R>) => resultConfig,
    getTimeConfig: (timeConfig: S.TimeConfig<D, T>) => timeConfig,
  }
}
