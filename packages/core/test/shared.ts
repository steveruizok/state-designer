import { createConfig, createStateDesigner } from "../src"

export const config = createConfig({
  data: { count: 0 },
  on: {},
  initial: "inactive",
  states: {
    inactive: {
      on: {
        TOGGLE: {
          to: "active",
          do: () => console.log("toggled from inactive"),
        },
      },
    },
    active: {
      on: {
        TOGGLE: { to: "inactive" },
        CLICKED_PLUS: { do: "increment" },
        CLICKED_MINUS: { do: "increment" },
        ADDED_BY: { do: "incrementBy" },
      },
      onEnter: [
        {
          if: "atMin",
          to: "min",
        },
        {
          if: "atMax",
          to: "max",
        },
        {
          to: "between",
        },
      ],
      initial: "min",
      states: {
        min: {},
        mid: {},
        max: {},
      },
    },
  },
  results: {
    doubleCount(d) {
      return d.count * 2
    },
  },
  actions: {
    increment(d) {
      d.count++
    },
    incrementBy(d, p) {
      d.count += p
    },
  },
  conditions: {
    atMax(d) {
      return d.count >= 10
    },
    atMin(d) {
      return d.count <= 0
    },
  },
  asyncs: {
    fetchDogImage() {
      return fetch("https://dog.ceo/api/breeds/image/random")
    },
  },
  times: {
    fast() {
      return 0.15
    },
    slow() {
      return 1
    },
  },
})

export const state = createStateDesigner(config)

export const counterConfig = createConfig({
  data: { count: 1 },
  initial: "inactive",
  states: {
    inactive: {
      on: { TOGGLED: { to: "active" } },
    },
    active: {
      on: {
        TOGGLED: { to: "inactive" },
        CLICKED_PLUS: { if: "belowMax", do: "increment" },
        CLICKED_MINUS: "decrement",
      },
    },
  },
  actions: {
    increment(d) {
      d.count++
    },
    decrement(d) {
      d.count--
    },
  },
  conditions: {
    belowMax(d) {
      return d.count < 10
    },
  },
})

export const counter = createStateDesigner(counterConfig)
