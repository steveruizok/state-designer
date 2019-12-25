import * as React from "react"
import StateDesigner, {
  createStateDesignerConfig,
  createStateDesignerData,
  createStateDesigner,
  StateDesignerConfig,
  IAction,
  ICondition,
  IResult,
  IComputedValuesConfig,
  IComputedReturnValues
} from "./StateDesigner"

type State<D, V> = {
  data: D
  values: V
  can: (event: string, payload?: any) => boolean
  send: (event: string, payload?: any) => void
}

export function useStateDesigner<
  D extends { [key: string]: any },
  A extends Record<string, IAction<D>>,
  C extends Record<string, ICondition<D>>,
  R extends Record<string, IResult<D>>,
  V extends IComputedValuesConfig<D>,
  Config extends StateDesignerConfig<D, A, C, R, V>
>(
  instance: StateDesigner<Config>,
  dependencies?: any[]
): State<
  D,
  undefined extends Config["values"] ? undefined : IComputedReturnValues<Config>
>
export function useStateDesigner<
  D extends { [key: string]: any },
  A extends Record<string, IAction<D>>,
  C extends Record<string, ICondition<D>>,
  R extends Record<string, IResult<D>>,
  V extends IComputedValuesConfig<D>,
  Config extends StateDesignerConfig<D, A, C, R, V>
>(
  options: StateDesignerConfig<D, A, C, R, V>,
  dependencies?: any[]
): State<
  D,
  undefined extends Config["values"] ? undefined : IComputedReturnValues<Config>
>
export function useStateDesigner<
  D extends { [key: string]: any },
  A extends Record<string, IAction<D>>,
  C extends Record<string, ICondition<D>>,
  R extends Record<string, IResult<D>>,
  V extends IComputedValuesConfig<D>,
  Config extends StateDesignerConfig<D, A, C, R, V>
>(
  options: StateDesigner<Config> | Config,
  dependencies: any[] = []
): State<
  D,
  undefined extends Config["values"] ? undefined : IComputedReturnValues<Config>
> {
  // The hook can accept either a pre-existing machine (so that
  // multiple hooks can share the same data) or the configuration
  // for a new machine (unique to the component calling this hook).
  const machine = React.useRef(
    options instanceof StateDesigner
      ? options
      : new StateDesigner<Config>(options)
  )

  // Either way, we now have a machine. We'll keep a few of its
  // methods in state and share them as the hook's return value.
  const [state, setState] = React.useState<
    State<
      D,
      undefined extends Config["values"]
        ? undefined
        : IComputedReturnValues<Config>
    >
  >({
    data: machine.current.data,
    send: machine.current.send,
    can: machine.current.can,
    values: machine.current.values
  })

  // When the (optional) dependencies change, and if the designer
  // didn't provide a pre-existing machine, we'll create a new
  // machine and update the values of the configuration.
  React.useEffect(() => {
    if (!(options instanceof StateDesigner)) {
      machine.current = new StateDesigner<Config>(options)

      setState({
        data: machine.current.data,
        send: machine.current.send,
        can: machine.current.can,
        values: machine.current.values
      })
    }

    // Subscribe (or re-subscribe) to the current machine.
    // When the machine's data changes, update this hook's
    // state with the new data.
    return machine.current.subscribe(
      (
        data: D,
        values: undefined extends Config["values"]
          ? undefined
          : IComputedReturnValues<Config>
      ) => setState(state => ({ ...state, data, values }))
    )
  }, dependencies)

  return state
}

export {
  StateDesigner,
  createStateDesigner,
  StateDesignerConfig,
  createStateDesignerConfig,
  createStateDesignerData
}
