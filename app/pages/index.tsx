import * as React from "react"
import Layout from "../components/Layout"
import { NextPage } from "next"
import { Action } from "../components/named/Action"
import { DragList } from "../components/DragList"
import { Title } from "../components/Title"
import { Item } from "../components/Item"
import { States } from "../components/States"
import { useStateDesigner } from "state-designer"
import { Collections } from "../machines/Collections"

const IndexPage: NextPage = () => {
  const states = useStateDesigner(Collections.states)
  const events = useStateDesigner(Collections.events)
  const handlers = useStateDesigner(Collections.handlers)
  const actions = useStateDesigner(Collections.actions)
  const conditions = useStateDesigner(Collections.conditions)
  const results = useStateDesigner(Collections.results)

  return (
    <Layout title="Home | Next.js + TypeScript Example">
      <h2>States</h2>
      <Title onCreate={() => states.send("CREATE")}></Title>
      <States />
      <h2>Events</h2>
      <Title onCreate={() => events.send("CREATE")} />
      {Array.from(events.data.values()).map((event, index) => (
        <Item key={index} title={`${event.id}-${event.name}`} />
      ))}
      <h2>Event Handlers</h2>
      <Title onCreate={() => handlers.send("CREATE")} />
      {Array.from(handlers.data.values()).map((handler, index) => (
        <Item key={index} title={handler.id} />
      ))}
      <h2>Actions</h2>
      <Title onCreate={() => actions.send("CREATE")} />
      <DragList
        id="actions"
        onDragEnd={result =>
          result.destination &&
          actions.send("MOVE", {
            actionId: result.draggableId,
            target: result.destination.index
          })
        }
      >
        {Array.from(actions.data.values()).map((action, index) => (
          <Action key={action.id} index={index} action={action} />
        ))}
      </DragList>
      <h2>Conditions</h2>
      <Title onCreate={() => conditions.send("CREATE")} />
      {Array.from(conditions.data.values()).map((condition, index) => (
        <Item key={index} title={condition.id} />
      ))}
      <h2>Results</h2>
      <Title onCreate={() => results.send("CREATE")} />
      {Array.from(results.data.values()).map((result, index) => (
        <Item key={index} title={result.id} />
      ))}
    </Layout>
  )
}

export default IndexPage
