import { uniqueId } from "lodash-es"
import {
  StateDesigner,
  createStateDesigner,
  createStateDesignerConfig,
  createStateDesignerData
} from "state-designer"

import * as DS from "../types"

export interface CaptiveData<T extends object> {
  id: string
  hasChanges: boolean
  editing: boolean
  dirty: T
  clean: T
  error?: string
}
