import * as React from 'react'
import { useStateDesigner } from '@state-designer/react'
import { state } from './state'

export default function App(): JSX.Element {
  const local = useStateDesigner(state)
  return <div>...</div>
}
