import * as S from "./types"

/**
 * Test whether a handler object would pass its conditions, given the current data, payload, and result.
 * @param h Handler
 * @param d Data
 * @param p Payload
 * @param r Result
 */
export function testEventHandlerConditions<D, P, R>(
  h: S.EventHandlerObject<D> | S.InitialStateObject<D>,
  d: D,
  p: P,
  r: R
) {
  if (h.if[0] && !h.if.every((c) => c(d, p, r))) return false
  if (h.ifAny[0] && !h.ifAny.some((c) => c(d, p, r))) return false
  if (h.unless[0] && !h.unless.every((c) => !c(d, p, r))) return false
  if (h.unlessAny[0] && !h.unlessAny.some((c) => !c(d, p, r))) return false
  return true
}
