import type * as S from './types'

/* -------------------------------------------------- */
/*                    Create Design                   */
/* -------------------------------------------------- */

export function createDesign<
  D extends unknown,
  R extends Record<string, S.Result<D>>,
  C extends Record<string, S.Condition<D>>,
  A extends Record<string, S.Action<D>>,
  Y extends Record<string, S.Async<D>>,
  T extends Record<string, S.Time<D>>,
  V extends Record<string, S.Value<D>>
>(design: S.Design<D, R, C, A, Y, T, V>): S.DesignWithHelpers<D, R, C, A, Y, T, V> {
  return {
    ...design,
    createEventHandlerDesign: (eventHandlerDesign: S.EventHandlerDesign<D, R, C, A, T>) =>
      eventHandlerDesign,
    createEventHandlerObjectDesign: (
      eventHandlerItemDesign: S.EventHandlerObjectDesign<D, R, C, A, T>
    ) => eventHandlerItemDesign,
    createAsyncEventDesign: (asyncEventDesign: S.AsyncEventDesign<D, R, C, A, Y, T>) =>
      asyncEventDesign,
    createRepeatEventDesign: (repeatEventDesign: S.RepeatEventDesign<D, R, C, A, T>) =>
      repeatEventDesign,
    createState: (stateDesign: S.StateDesign<D, R, C, A, Y, T, V>) => stateDesign,
    createActionDesign: (actionDesign: S.ActionDesign<D, A>) => actionDesign,
    createConditionDesign: (conditionDesign: S.ConditionDesign<D, C>) => conditionDesign,
    createResultDesign: (resultDesign: S.ResultDesign<D, R>) => resultDesign,
    createTimeDesign: (timeDesign: S.TimeDesign<D, T>) => timeDesign,
    createValueDesign: (valueDesign: S.Value<D>) => valueDesign,
  }
}
