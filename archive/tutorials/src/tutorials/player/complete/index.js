import React from "react"
import { Player as P } from "components"
import { useStateDesigner } from "@state-designer/react"
import { useMouseInput } from "utils"

export default function () {
  const state = useStateDesigner({
    data: {
      ms: 0,
      duration: 60000,
    },
    initial: "stopped",
    states: {
      stopped: {
        on: {
          PRESSED_PLAY: {
            unless: "atEnd",
            to: "playing",
          },
          PRESSED_RW: {
            unless: "atStart",
            to: "rewinding",
          },
          PRESSED_FF: {
            unless: "atEnd",
            to: "fastForwarding",
          },
        },
      },
      playing: {
        initial: "normal",
        on: {
          PRESSED_STOP: { to: "stopped" },
          HELD_RW: { to: "scrubbing.back" },
          HELD_FF: { to: "scrubbing.forward" },
        },
        states: {
          normal: {
            repeat: {
              onRepeat: [
                {
                  if: "atEnd",
                  to: "stopped",
                },
                {
                  get: "interval",
                  do: "addIntervalToCurrentTime",
                },
              ],
            },
            on: {
              PRESSED_PAUSE: { to: "paused" },
              STARTED_SCRUBBING: { to: "scrubbing" },
            },
          },
          paused: {
            on: {
              PRESSED_PLAY: { to: "normal" },
            },
          },
        },
      },
      scrubbing: {
        on: {
          STOPPED_SCRUBBING: { to: "playing.restore" },
          RELEASED: { to: "playing.restore" },
          PRESSED_RW: { to: "playing.restore" },
          PRESSED_FF: { to: "playing.restore" },
        },
        initial: "manual",
        states: {
          manual: {},
          forward: {
            repeat: {
              onRepeat: [
                {
                  if: "atEnd",
                  to: "stopped",
                },
                {
                  get: "fastInterval",
                  do: "addIntervalToCurrentTime",
                },
              ],
            },
          },
          back: {
            repeat: {
              onRepeat: [
                {
                  if: "atStart",
                  to: "stopped",
                },
                {
                  get: "fastInterval",
                  do: "subtractIntervalFromCurrentTime",
                },
              ],
            },
          },
        },
      },
      fastForwarding: {
        repeat: {
          onRepeat: [
            {
              if: "atEnd",
              to: "stopped",
            },
            {
              get: "veryFastInterval",
              do: "addIntervalToCurrentTime",
            },
          ],
        },
        on: {
          PRESSED_PLAY: { to: "playing" },
          PRESSED_STOP: { to: "stopped" },
          PRESSED_RW: { to: "rewinding" },
          STARTED_SCRUBBING: { to: "paused" },
        },
      },
      rewinding: {
        repeat: {
          onRepeat: [
            {
              if: "atStart",
              to: "stopped",
            },
            {
              get: "veryFastInterval",
              do: "subtractIntervalFromCurrentTime",
            },
          ],
        },
        on: {
          PRESSED_PLAY: { to: "playing" },
          PRESSED_STOP: { to: "stopped" },
          PRESSED_FF: { to: "fastForwarding" },
          STARTED_SCRUBBING: { to: "paused" },
        },
      },
    },
    on: {
      STARTED_SCRUBBING: "setProgress",
    },
    results: {
      interval(data, payload, result) {
        return result.interval
      },
      fastInterval(data, payload, result) {
        return result.interval * 10
      },
      veryFastInterval(data, payload, result) {
        return result.interval * 32
      },
    },
    conditions: {
      atStart(data) {
        return data.ms <= 0
      },
      atEnd(data) {
        return data.ms >= data.duration
      },
    },
    actions: {
      setProgress(data, payload) {
        data.ms = data.duration * (payload / 100)
      },
      addIntervalToCurrentTime(data, payload, result) {
        const delta = Math.min(data.duration - data.ms, result)
        data.ms += delta
      },
      subtractIntervalFromCurrentTime(data, payload, result) {
        const delta = Math.min(data.ms, result)
        data.ms -= delta
      },
    },
    values: {
      progress(data) {
        return data.ms / data.duration
      },
      minutes(data) {
        const m = Math.floor(data.ms / 60000)
        return m.toString().padStart(2, "0")
      },
      seconds(data) {
        const s = Math.floor(data.ms / 1000) % 60
        return s.toString().padStart(2, "0")
      },
    },
  })

  useMouseInput({
    onMouseUp: () => {
      state.send("RELEASED")
    },
  })

  return (
    <P.Layout>
      <P.CurrentTime>
        {state.values.minutes}:{state.values.seconds}
      </P.CurrentTime>
      <P.Wheels>
        <P.Wheel value={state.values.progress} />
        <P.Wheel value={1 - state.values.progress} />
      </P.Wheels>
      <P.Slider
        value={state.values.progress * 100}
        onChange={(value) => state.send("STARTED_SCRUBBING", value)}
        onMouseUp={() => state.send("STOPPED_SCRUBBING")}
      />
      <P.Buttons>
        <P.Button
          icon="play"
          highlight={state.isIn("playing")}
          disabled={!state.can("PRESSED_PLAY")}
          onClick={() => state.send("PRESSED_PLAY")}
        />
        <P.Button
          icon="rewind"
          disabled={!(state.can("PRESSED_RW") || state.can("HELD_RW"))}
          onClick={() => state.send("PRESSED_RW")}
          onMouseDown={() => state.send("HELD_RW")}
        />
        <P.Button
          icon="fastforward"
          disabled={!(state.can("PRESSED_FF") || state.can("HELD_FF"))}
          onClick={() => state.send("PRESSED_FF")}
          onMouseDown={() => state.send("HELD_FF")}
        />
        <P.Button
          icon="stop"
          disabled={!state.can("PRESSED_STOP")}
          onClick={() => state.send("PRESSED_STOP")}
        />
        <P.Button
          icon="pause"
          disabled={!state.can("PRESSED_PAUSE")}
          onClick={() => state.send("PRESSED_PAUSE")}
        />
      </P.Buttons>
    </P.Layout>
  )
}
