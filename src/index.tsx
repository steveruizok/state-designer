import * as React from "react"
import isPlainObject from "lodash-es/isPlainObject"
import pick from "lodash-es/pick"
import StateDesigner, {
  createStateDesignerConfig,
  createStateDesigner,
  StateDesignerConfig,
  StateDesignerWithConfig,
  IEventHandler,
  IEventsConfig,
  IEventConfig,
  IStateConfig,
  IStatesConfig,
  IActionConfig,
  IConditionConfig,
  IResultConfig,
  ActionsCollection,
  ResultsCollection,
  ConditionsCollection,
  Graph
} from "./StateDesigner"

export { Graph }

export type OnChange<T> = (state: T) => void

export type StateDesignerInfo<D> = {
  data: D
  thenSend: (eventName: string, payload?: any) => () => void
  send: (eventName: string, payload?: any) => void
  graph: Graph.Export<D>
  active: string[]
  isIn(states: string): boolean
  whenIn(state: { [key: string]: any }): any
  can(event: string, payload?: any): boolean
  reset(): void
}

const defaultDependencies: any[] = []

// Call useStateDesigner with a pre-existing StateDesigner instance
export function useStateDesigner<
  D,
  A extends ActionsCollection<D> | undefined,
  C extends ConditionsCollection<D> | undefined,
  R extends ResultsCollection<D> | undefined
>(
  options: StateDesigner<D, A, C, R>,
  onChange?: OnChange<StateDesignerInfo<D>>
): StateDesignerInfo<D>
// Call useStateDesigner with configuration for a new StateDesigner instance
export function useStateDesigner<
  D,
  A extends ActionsCollection<D> | undefined,
  C extends ConditionsCollection<D> | undefined,
  R extends ResultsCollection<D> | undefined
>(
  options: StateDesignerConfig<D, A, C, R>,
  onChange?: OnChange<StateDesignerInfo<D>>,
  dependencies?: any[]
): StateDesignerInfo<D>
/**
 *
 * @param options The configuration object for a new machine, or else an existing machine
 * @param onChange An function to run each time the machine's state changes
 * @param dependencies An array of unrelated values that, when the hook updates, may cause the hook to re-subscribe to its machine, clean up its effect and run the effect again.
 */
export function useStateDesigner<
  D,
  A extends ActionsCollection<D> | undefined,
  C extends ConditionsCollection<D> | undefined,
  R extends ResultsCollection<D> | undefined
>(
  options: StateDesigner<D, A, C, R> | StateDesignerConfig<D, A, C, R>,
  onChange?: OnChange<StateDesignerInfo<D>>,
  dependencies: any[] = defaultDependencies
): StateDesignerInfo<D> {
  // The hook can accept either a pre-existing machine (so that
  // multiple hooks can share the same data) or the configuration
  // for a new machine (unique to the component calling this hook).
  const machine = React.useRef<StateDesigner<D, A, C, R>>(null as any)

  if (machine.current === null) {
    machine.current =
      options instanceof StateDesigner ? options : new StateDesigner(options)
  }

  const [state, setState] = React.useState<
    Pick<StateDesigner<D, A, C, R>, "data" | "active" | "graph">
  >(pick(machine.current, ["graph", "data", "active"]))

  // Helpers

  const send = React.useCallback((event: string, payload?: any) => {
    machine.current.send(event, payload)
  }, [])

  const thenSend = React.useCallback((event: string, payload?: any) => {
    return function() {
      machine.current.send(event, payload)
    }
  }, [])

  const isIn = React.useCallback((state: string) => {
    return machine.current.isIn(state)
  }, [])

  const whenIn = React.useCallback((states: { [key: string]: any }) => {
    const { active } = machine.current

    let returnValue = states["default"]

    function setValue(value: any) {
      if (isPlainObject(returnValue)) {
        Object.assign(returnValue, value)
      } else {
        returnValue = value
      }
    }

    Object.entries(states).forEach(([key, value]) => {
      if (key === "root") {
        setValue(value)
      } else {
        if (active.find(v => v.endsWith("." + key))) {
          setValue(value)
        }
      }
    })

    return returnValue
  }, [])

  const can = React.useCallback((event: string, payload?: any) => {
    return machine.current.can(event, payload)
  }, [])

  const reset = React.useCallback(() => {
    return machine.current.reset()
  }, [])

  // Effect

  React.useLayoutEffect(() => {
    machine.current.destroy()

    if (!(options instanceof StateDesigner)) {
      machine.current = new StateDesigner(options)
      setState(pick(machine.current, ["graph", "data", "active"]))
    }

    return machine.current.subscribe(({ data, active, graph }) => {
      setState({ data, active, graph })
    })
  }, dependencies)

  // Run onChange callback when data changes

  React.useEffect(() => {
    onChange && onChange({ ...state, send, thenSend, isIn, whenIn, can, reset })
  }, [state])

  return { ...(state as any), send, thenSend, isIn, whenIn, can, reset }
}

export {
  StateDesigner,
  StateDesignerConfig,
  createStateDesigner,
  createStateDesignerConfig,
  StateDesignerWithConfig
}

// Simplified types for export (Are these needed? Maybe for custom machine configuration types?)

export type State<
  D,
  A extends Actions<D>,
  C extends Conditions<D>,
  R extends Results<D>
> = IStateConfig<D, A, C, R>

export type States<
  D,
  A extends Actions<D>,
  C extends Conditions<D>,
  R extends Results<D>
> = IStatesConfig<D, A, C, R>

export type Event<
  D,
  A extends Actions<D>,
  C extends Conditions<D>,
  R extends Results<D>
> = IEventConfig<D, A, C, R>

export type Events<
  D,
  A extends Actions<D>,
  C extends Conditions<D>,
  R extends Results<D>
> = IEventsConfig<D, A, C, R>

export type EventHandler<D> = IEventHandler<D>

export type Condition<D> = IConditionConfig<D>
export type Conditions<D> = Record<string, Condition<D>>

export type Action<D> = IActionConfig<D>
export type Actions<D> = Record<string, Action<D>>

export type Result<D> = IResultConfig<D>
export type Results<D> = Record<string, Result<D>>

export type Config<
  D,
  A extends Actions<D>,
  C extends Conditions<D>,
  R extends Results<D>
> = {
  data: D
  on?: Events<D, A, C, R>
  onEvent?: Event<D, A, C, R>
  initial?: string
  states?: States<D, A, C, R>
  actions?: A
  conditions?: C
  results?: R
}
