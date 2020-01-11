import * as React from "react"
import StateDesigner, {
  createStateDesignerConfig,
  createStateDesigner,
  StateDesignerConfig,
  StateDesignerWithConfig,
  IActionConfig,
  IConditionConfig,
  IResultConfig,
  GraphNode
} from "./StateDesigner"

export type Condition<D = any> = IConditionConfig<D>
export type Action<D = any> = IActionConfig<D>
export type Result<D = any> = IResultConfig<D>
export type Graph = GraphNode

export type Exports<
  D extends { [key: string]: any },
  A extends Record<string, IActionConfig<D>>,
  C extends Record<string, IConditionConfig<D>>,
  R extends Record<string, IResultConfig<D>>
> = Pick<
  StateDesigner<D, A, C, R>,
  "data" | "send" | "active" | "can" | "isIn" | "state" | "graph" | "reset"
>

type OnChange<T> = (state: T) => void
type Effect<T> = (state: T) => void | (() => void)

const defaultDependencies: any[] = []

type StateDesignerInfo<D extends { [key: string]: any }> = [
  D,
  (eventName: string, payload?: any) => void,
  {
    getGraph(): GraphNode
    isIn(state: string): boolean
    can(event: string, payload?: any): boolean
    reset(): void
  }
]

// Call useStateDesigner with a pre-existing StateDesigner instance
export function useStateDesigner<
  D extends { [key: string]: any },
  A extends Record<string, IActionConfig<D>>,
  C extends Record<string, IConditionConfig<D>>,
  R extends Record<string, IResultConfig<D>>
>(
  options: StateDesigner<D, A, C, R>,
  onChange?: OnChange<Exports<D, A, C, R>>,
  effect?: Effect<Exports<D, A, C, R>>,
  dependencies?: any[]
): StateDesignerInfo<D>
// Call useStateDesigner with configuration for a new StateDesigner instance
export function useStateDesigner<
  D extends { [key: string]: any },
  A extends Record<string, IActionConfig<D>>,
  C extends Record<string, IConditionConfig<D>>,
  R extends Record<string, IResultConfig<D>>
>(
  options: StateDesignerConfig<D, A, C, R>,
  onChange?: OnChange<Exports<D, A, C, R>>,
  effect?: Effect<Exports<D, A, C, R>>,
  dependencies?: any[]
): StateDesignerInfo<D>
/**
 *
 * @param options The configuration object for a new machine, or else an existing machine
 * @param onChange An function to run each time the machine's state changes
 * @param dependencies An array of unrelated values that, when the hook updates, may cause the hook to re-subscribe to its machine, clean up its effect and run the effect again.
 */
export function useStateDesigner<
  D extends { [key: string]: any },
  A extends Record<string, IActionConfig<D>>,
  C extends Record<string, IConditionConfig<D>>,
  R extends Record<string, IResultConfig<D>>
>(
  options: StateDesigner<D, A, C, R> | StateDesignerConfig<D, A, C, R>,
  onChange?: OnChange<any>,
  effect?: Effect<any>,
  dependencies: any[] = defaultDependencies
): StateDesignerInfo<D> {
  // The hook can accept either a pre-existing machine (so that
  // multiple hooks can share the same data) or the configuration
  // for a new machine (unique to the component calling this hook).
  const machine = React.useRef(
    options instanceof StateDesigner
      ? options
      : new StateDesigner<D, A, C, R>(options)
  )

  const [state, setState] = React.useState({
    data: machine.current.data,
    graph: machine.current.graph
  })

  const send = React.useCallback(function send(event: string, payload?: any) {
    return machine.current.send(event, payload)
  }, [])

  const helpers = React.useMemo(
    () => ({
      getGraph() {
        return machine.current.graph
      },
      isIn(state: string) {
        return machine.current.isIn(state)
      },
      can(event: string, payload?: any) {
        return machine.current.can(event, payload)
      },
      reset() {
        return machine.current.reset()
      }
    }),
    []
  )

  React.useEffect(() => {
    if (!(options instanceof StateDesigner)) {
      machine.current = new StateDesigner(options)

      setState({
        graph: machine.current.graph,
        data: machine.current.data
      })
    }

    return machine.current.subscribe((active, data, graph, root) => {
      setState({
        data,
        graph
      })
    })
  }, dependencies)

  // Run effect when dependencies change
  React.useEffect(() => {
    if (effect !== undefined) {
      return effect([state.data, helpers])
    }
  }, dependencies)

  // Run onChange callback when data changes
  React.useEffect(() => {
    onChange && onChange([state.data, helpers])
  }, [state])

  return [state.data, send, helpers]
}

export {
  StateDesigner,
  StateDesignerConfig,
  createStateDesigner,
  createStateDesignerConfig,
  StateDesignerWithConfig
}
