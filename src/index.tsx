import * as React from "react"
import StateDesigner, {
  createStateDesignerConfig,
  createStateDesignerData,
  createStateDesigner,
  StateDesignerConfig,
  IAction,
  ICondition,
  IResult,
  IComputedValuesConfig
} from "./StateDesigner"

export type Exports<C extends StateDesignerConfig> = Pick<
  StateDesigner<C>,
  "data" | "send" | "can" | "values" | "active" | "isIn" | "state"
>

type OnChange<T> = (state: T) => void
type Effect<T> = (state: T) => void | (() => void)

const defaultDependencies: any[] = []

// Call useStateDesigner with a pre-existing StateDesigner instance
export function useStateDesigner<C extends StateDesignerConfig>(
  options: StateDesigner<C>,
  onChange?: OnChange<Exports<C>>,
  effect?: Effect<Exports<C>>,
  dependencies?: any[]
): Exports<C>
// Call useStateDesigner with configuration for a new StateDesigner instance
export function useStateDesigner<
  D extends { [key: string]: any },
  C extends StateDesignerConfig<
    D,
    Record<string, IAction<D>>,
    Record<string, ICondition<D>>,
    Record<string, IResult<D>>,
    IComputedValuesConfig<D>
  >
>(
  options: C,
  onChange?: OnChange<Exports<C>>,
  effect?: Effect<Exports<C>>,
  dependencies?: any[]
): Exports<C>
/**
 *
 * @param options The configuration object for a new machine, or else an existing machine
 * @param onChange An function to run each time the machine's state changes
 * @param dependencies An array of unrelated values that, when the hook updates, may cause the hook to re-subscribe to its machine, clean up its effect and run the effect again.
 */
export function useStateDesigner<C extends StateDesignerConfig>(
  options: StateDesigner<C> | C,
  onChange?: OnChange<Exports<C>>,
  effect?: Effect<Exports<C>>,
  dependencies: any[] = defaultDependencies
): Exports<C> {
  // Quick alias
  type State = Exports<C>

  // The hook can accept either a pre-existing machine (so that
  // multiple hooks can share the same data) or the configuration
  // for a new machine (unique to the component calling this hook).
  const machine = React.useRef(
    options instanceof StateDesigner ? options : new StateDesigner<C>(options)
  )

  // Either way, we now have a machine. We'll keep a few of its
  // methods in state and share them as the hook's return value.
  const [state, setState] = React.useState<State>({
    data: machine.current.data,
    send: machine.current.send,
    can: machine.current.can,
    isIn: machine.current.isIn,
    active: machine.current.active,
    values: machine.current.values,
    state: machine.current.root
  })

  React.useEffect(() => {
    // Rebuild this machine when dependencies change.
    if (!(options instanceof StateDesigner)) {
      machine.current = new StateDesigner(options)
      setState({
        data: machine.current.data,
        send: machine.current.send,
        can: machine.current.can,
        isIn: machine.current.isIn,
        active: machine.current.active,
        values: machine.current.values,
        state: machine.current.root
      })
    }

    // Subscribe (or re-subscribe) to the current machine.
    // When the machine's data changes, update this hook's
    // state with the new data.
    return machine.current.subscribe(
      (
        active: State["active"],
        data: State["data"],
        values: State["values"]
      ) => {
        setState(state => {
          return {
            ...state,
            data,
            values,
            active
          }
        })
      }
    )
  }, dependencies)

  // Run effect when dependencies change
  React.useEffect(() => {
    if (effect !== undefined) {
      return effect(state)
    }
  }, dependencies)

  // Run onChange callback when data changes
  React.useEffect(() => {
    onChange && onChange(state)
  }, [state.data])

  return state
}

export {
  StateDesigner,
  createStateDesigner,
  StateDesignerConfig,
  createStateDesignerConfig,
  createStateDesignerData
}
