export const counter = `{
  data: { count: 0 },
  on: {
    DECREASED: { 
      unless: "countIsAtMin", 
      do: "decrementCount" 
    },
    INCREASED: { 
      unless: "countIsAtMax", 
      do: "incrementCount" 
    },
  },
  actions: {
    decrementCount(data) {
      data.count--
    },
    incrementCount(data) {
      data.count++
    },
  },
  conditions: {
    countIsAtMin(data) {
      return data.count === 0
    },
    countIsAtMax(data) {
      return data.count === 5
    },
  },
}`

export const todo = `{
  data: {
    content: "",
    complete: false,
  },
  initial: complete ? "complete" : "incomplete",
  states: {
    incomplete: {
      initial: {
        if: "contentIsEmpty",
        to: "empty",
        else: { to: "full" },
      },
      states: {
        empty: {
          on: {
            CHANGED_CONTENT: {
              unless: "contentIsEmpty",
              to: "full",
            },
          },
        },
        full: {
          on: {
            TOGGLED_COMPLETE: {
              to: "complete",
              do: "setComplete",
            },
            CHANGED_CONTENT: {
              if: "contentIsEmpty",
              to: "empty",
            },
          },
        },
      },
      on: {
        CHANGED_CONTENT: "updateContent",
      },
    },
    complete: {
      on: {
        TOGGLED_COMPLETE: {
          do: "clearComplete",
          to: "incomplete",
        },
      },
    },
  },
  conditions: {
    contentIsEmpty(data) {
      return data.content === ""
    },
  },
  actions: {
    setComplete(data) {
      data.complete = true
    },
    clearComplete(data) {
      data.complete = false
    },
    updateContent(data, payload) {
      data.content = payload
    },
  },
}`

export const player = `{
  data: {
    ms: 0,
    duration: 60000,
  },
  states: {
    volume: {
      initial: "low",
      states: {
        high: {},
        low: {},
      },
    },
    music: {
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
          },
        },
      },
    },
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
}`

export const toggle = `{
  initial: "toggledOff",
  states: {
    toggledOff: {
      on: { TOGGLED: { to: "toggledOn" } },
    },
    toggledOn: {
      on: { TOGGLED: { to: "toggledOff" } },
    },
  },
}`
