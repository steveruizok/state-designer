import React from "react"
import { Dogs as D } from "components"
import { delay } from "utils"

export default function () {
  return (
    <D.Layout>
      <D.Image image={""} />
      <D.Button isLoading={false}>Fetch</D.Button>
      <D.Button disabled={true}>Cancel</D.Button>
    </D.Layout>
  )
}
