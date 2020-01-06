import { StateDesigner } from "state-designer"
import { ListConfig } from "./config/list"
import { CounterConfig } from "./config/counter"
import { DesignerConfig } from "./config/designer"

export const Counter = new StateDesigner(CounterConfig)
export const List = new StateDesigner(ListConfig)
export const Designer = new StateDesigner(DesignerConfig)
