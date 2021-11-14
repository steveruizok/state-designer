import React from "react"
import { Player as P } from "components"

export default function () {
  return (
    <P.Layout>
      <P.CurrentTime>00:37</P.CurrentTime>
      <P.Wheels>
        <P.Wheel value={0.62} />
        <P.Wheel value={0.38} />
      </P.Wheels>
      <P.Slider value={62} />
      <P.Buttons>
        <P.Button icon="play" disabled={false} />
        <P.Button icon="rewind" disabled={false} />
        <P.Button icon="fastforward" disabled={false} />
        <P.Button icon="stop" disabled={false} />
        <P.Button icon="pause" disabled={false} />
      </P.Buttons>
    </P.Layout>
  )
}
