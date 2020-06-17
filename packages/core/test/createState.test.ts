import { createDesign, createState } from "../src"
import { design, counterDesign } from "./shared"

jest.useFakeTimers()

describe("createState", () => {
  it("Should create a state.", () => {
    expect(createState({})).toBeTruthy()
    expect(createState(design)).toBeTruthy()
  })

  it("Should support send.", () => {
    let i = 0

    const state = createState({
      on: { TICK: () => i++ },
    })

    state.send("TICK")
    expect(i).toBe(1)
  })

  it("Should support actions.", () => {
    const counter = createState({
      data: { count: 0 },
      on: {
        INCREASED_BY_ONE: "increment",
        INCREASED_BY_TWO: ["increment", "increment"],
      },
      actions: {
        increment(d) {
          d.count++
        },
      },
    })

    expect(counter.data.count).toBe(0)
    counter.send("INCREASED_BY_ONE")
    expect(counter.data.count).toBe(1)
    counter.send("INCREASED_BY_TWO")
    expect(counter.data.count).toBe(3)
  })

  it("Should support conditions.", () => {
    const counter = createState({
      data: { count: 0 },
      on: {
        A: { if: "alwaysFail", do: "increment" },
        B: { if: "neverFail", do: "increment" },
        C: { if: "upToThree", do: "increment" },
      },
      actions: {
        increment(data) {
          data.count++
        },
      },
      conditions: {
        alwaysFail() {
          return false
        },
        neverFail() {
          return true
        },
        upToThree(data) {
          return data.count < 3
        },
      },
    })

    expect(counter.data.count).toBe(0)
    counter.send("A")
    expect(counter.data.count).toBe(0)
    counter.send("B")
    expect(counter.data.count).toBe(1)
    counter.send("C")
    counter.send("C")
    counter.send("C")
    counter.send("C")
    counter.send("C")
    expect(counter.data.count).toBe(3)
  })

  // Can I chain events?

  it("Should support chaining.", async () => {
    const counter = createState({
      data: { count: 0 },
      actions: {
        increment(d) {
          d.count++
        },
      },
      on: { INCREASED: "increment" },
    })

    expect(counter.data.count).toBe(0)
    await counter.send("INCREASED").then((c) => c.send("INCREASED"))
    expect(counter.data.count).toBe(2)
  })

  // Does the `isIn` helper work?

  it("Should support the isIn helper.", async (done) => {
    const counter = createState(counterDesign)
    expect(counter.isIn("active")).toBeFalsy()
    expect(counter.isIn("inactive")).toBeTruthy()
    expect(counter.isIn("active", "inactive")).toBeFalsy()
    expect(counter.isIn("missing")).toBeFalsy()
    done()
  })

  it("Should support the isInAny helper.", async (done) => {
    const counter = createState(counterDesign)
    expect(counter.isIn("active")).toBeFalsy()
    expect(counter.isIn("inactive")).toBeTruthy()
    expect(counter.isInAny("active", "inactive")).toBeTruthy()
    expect(counter.isInAny("missing")).toBeFalsy()
    done()
  })

  it("Should support the isIn helper with transitions.", async (done) => {
    const counter = createState(counterDesign)
    expect(counter.isIn("active")).toBeFalsy()
    expect(counter.isIn("inactive")).toBeTruthy()
    counter.send("TOGGLED")
    expect(counter.isIn("active")).toBeTruthy()
    expect(counter.isIn("inactive")).toBeFalsy()
    done()
  })

  // Does the `can` helper work?

  it("Should support can helper.", async (done) => {
    const counter = createState(counterDesign)
    expect(counter.can("CLICKED_PLUS")).toBeFalsy()
    expect(counter.can("TOGGLED")).toBeTruthy()
    done()
  })

  it("Should support can helper with transitions.", async (done) => {
    const counter = createState(counterDesign)
    expect(counter.can("CLICKED_PLUS")).toBeFalsy()
    expect(counter.can("TOGGLED")).toBeTruthy()
    counter.send("TOGGLED")
    expect(counter.can("CLICKED_PLUS")).toBeTruthy()
    expect(counter.can("TOGGLED")).toBeTruthy()
    done()
  })

  // Do initial active states work?
  it("Should support initial active states.", () => {
    const counter = createState(counterDesign)
    expect(counter.isIn("inactive")).toBeTruthy()
    expect(counter.isIn("active")).toBeFalsy()
  })

  // Do transitions work?
  // Do down-level activations work?
  // Do onEvent events work?

  it("Should support transitions.", () => {
    const state = createState({
      states: {
        a: {
          initial: "a1",
          states: {
            a1: {},
            a2: {},
          },
        },
        b: {
          initial: "b1",
          states: {
            b1: {},
            b2: {
              initial: "bb1",
              states: {
                bb1: {},
                bb2: {},
              },
            },
          },
        },
      },
      on: {
        TARGET: {
          to: "a2",
        },
        TARGET_TOP: {
          to: "a",
        },
        TARGET_DEEP: {
          to: "b.b2",
        },
      },
    })

    state.send("TARGET")
    expect(state.isIn("a2")).toBeTruthy()
    state.send("TARGET_TOP")
    expect(state.isIn("a1")).toBeTruthy()
    state.send("TARGET_DEEP")
    expect(state.isIn("b2")).toBeTruthy()
    expect(state.isIn("bb1")).toBeTruthy()
    expect(state.isIn("bb2")).toBeFalsy()
  })

  it("Should support resetting targeted branches.", () => {
    const state = createState({
      initial: "a",
      states: {
        a: {
          initial: "a1",
          states: {
            a1: {
              on: { TO_A2: { to: "a2" } },
            },
            a2: {
              on: { TO_A: { to: "a" } },
            },
          },
        },
        b: {},
      },
    })

    state.send("TO_A2")
    expect(state.isIn("a2")).toBeTruthy() // true
    state.send("TO_A")
    expect(state.isIn("a1")).toBeTruthy() // true
  })

  it("Should correctly bail on transitions.", () => {
    const toggler = createState({
      data: { count: 0 },
      initial: "inactive",
      states: {
        inactive: {
          on: {
            TOGGLED: [{ do: "increment" }, { to: "active" }],
          },
        },
        active: {
          on: {
            TOGGLED: [{ to: "inactive" }, { do: "increment" }],
          },
        },
      },
      actions: {
        increment(d) {
          d.count++
        },
      },
    })

    expect(toggler.data.count).toBe(0)
    toggler.send("TOGGLED") // Should run first increment
    toggler.send("TOGGLED") // Should not run second increment
    expect(toggler.data.count).toBe(1)
  })

  it("Should support multiple transitions.", () => {
    const state = createState({
      states: {
        a: {
          initial: "a1",
          states: {
            a1: {},
            a2: {},
          },
        },
        b: {
          initial: "b1",
          states: {
            b1: {},
            b2: {},
          },
        },
        c: {
          initial: "c1",
          states: {
            c1: {},
            c2: {},
          },
        },
      },
      on: {
        TRIGGER: {
          to: ["a2", "b2", "c2"],
        },
      },
    })

    state.send("TRIGGER")
    expect(state.isIn("a2")).toBeTruthy()
    expect(state.isIn("b2")).toBeTruthy()
    expect(state.isIn("c2")).toBeTruthy()
    expect(state.isIn("a2", "b2", "c2")).toBeTruthy()
  })

  // Do onExit events work?

  it("Should support onEnter and onExit events.", async (done) => {
    const counter = createState(counterDesign)
    expect(counter.data.activations).toBe(0)
    let update = await counter.send("TOGGLED")
    expect(update.data.activations).toBe(1)
    expect(update.data.deactivations).toBe(0)
    expect(counter.isIn("active")).toBeTruthy()
    update = await counter.send("TOGGLED")
    expect(update.data.activations).toBe(1)
    expect(update.data.deactivations).toBe(1)
    done()
  })

  it("Should preserve payloads and results between transitions.", () => {
    const state = createState({
      data: { count: 0, final: { result: 0, payload: 0 } },
      initial: "ready",
      states: {
        ready: {
          on: {
            FETCHED: {
              get: () => 20,
              to: "loading",
            },
          },
        },
        loading: {
          on: {
            CANCELLED: { to: "ready" },
          },
          async: {
            await: (_, __, r) => new Promise((resolve) => resolve(r)),
            onResolve: {
              to: "success",
            },
          },
        },
        success: {
          onEnter: (data, payload, result) => {
            data.final = { payload, result }
          },
        },
        fail: {},
      },
    })

    state.send("FETCHED", 10)

    setTimeout(() => {
      expect(state.data.final.payload).toBe(10)
      expect(state.data.final.result).toBe(20)
    }, 1000)
  })

  it("Should support onEnter and onExit events.", async (done) => {
    const toggler = createState({
      initial: "inactive",
      data: {
        count: 0,
      },
      states: {
        inactive: {
          on: { TOGGLED: { do: "increment", to: "active" } },
        },
        active: {
          on: { TOGGLED: [{ to: "inactive" }, { do: "increment" }] },
        },
      },
      actions: {
        increment(d) {
          d.count++
        },
      },
    })

    expect(toggler.isIn("inactive")).toBeTruthy()
    toggler.send("TOGGLED")
    expect(toggler.isIn("active")).toBeTruthy()
    expect(toggler.data.count).toBe(1)
    toggler.send("TOGGLED")
    expect(toggler.isIn("inactive")).toBeTruthy()
    toggler.send("TOGGLED")
    expect(toggler.isIn("active")).toBeTruthy()
    expect(toggler.data.count).toBe(2)
    expect(toggler.data.count).toBe(2)
    done()
  })

  // Do results work?

  it("Should support results.", () => {
    type Switch = { id: string; switched: boolean }

    type SwitchCollection = Record<string, Switch>

    const switches: SwitchCollection = {
      0: { id: "0", switched: false },
      1: { id: "1", switched: false },
      2: { id: "2", switched: true },
    }

    const state = createState({
      data: { switches },
      on: {
        FLIPPED_SWITCH: {
          get: "switch",
          if: "switchIsFlipped",
          do: "flipSwitch",
          else: {
            do: "flipSwitch",
          },
        },
      },
      results: {
        switch(data, payload: Switch) {
          return data.switches[payload.id]
        },
      },
      conditions: {
        switchIsFlipped(_, __, result: Switch) {
          return result.switched
        },
      },
      actions: {
        flipSwitch(_, __, result: Switch) {
          result.switched = !result.switched
        },
      },
    })

    expect(state.data.switches[0].switched).toBeFalsy()
    expect(state.data.switches[1].switched).toBeFalsy()
    state.send("FLIPPED_SWITCH", { id: "0" })
    expect(state.data.switches[0].switched).toBeTruthy()
    expect(state.data.switches[1].switched).toBeFalsy()
    state.send("FLIPPED_SWITCH", { id: "0" })
    state.send("FLIPPED_SWITCH", { id: "1" })
    expect(state.data.switches[0].switched).toBeFalsy()
    expect(state.data.switches[1].switched).toBeTruthy()
  })

  // Does asynchronous send queueing work?

  const previousDesign = createDesign({
    id: "previous_test",
    states: {
      x: {},
      y: {},
      z: {
        initial: "a",
        states: {
          a: {
            on: {
              TO_B: { to: "b" },
              BACK_TO_B: { to: "b.previous" },
              RESTORE_B: { to: "b.restore" },
            },
            initial: "aa",
            states: {
              aa: { on: { TO_AB: { to: "ab" } } },
              ab: { on: { TO_AA: { to: "aa" } } },
            },
          },
          b: {
            on: { TO_A: { to: "a" } },
            initial: "ba",
            states: {
              ba: {
                on: { TO_BB: { to: "bb" } },
              },
              bb: {
                on: {
                  TO_BA: { to: "ba" },
                },
                initial: "ca",
                states: {
                  ca: { on: { TO_CB: { to: "cb" } } },
                  cb: { on: { TO_CA: { to: "ca" } } },
                },
              },
            },
          },
        },
      },
    },
  })

  // Are initial active states correctly activated on a transition?
  it("Should restore initial when returning to a state.", async () => {
    const state = createState(previousDesign)
    state.send("TO_AB")
    state.send("TO_B")
    state.send("TO_BB")
    state.send("TO_A")
    // Should set initial state (aa)
    expect(state.isIn("aa")).toBeTruthy()
  })

  // Are previously active states correctly activated on a previous transition?
  it("Should restore previous.", async () => {
    const state = createState(previousDesign)
    state.send("TO_B")
    state.send("TO_BB")
    state.send("TO_A")
    state.send("BACK_TO_B")
    // Should set previous state (bb)
    expect(state.isIn("b")).toBeTruthy()
    expect(state.isIn("ba")).toBeFalsy()
    expect(state.isIn("bb")).toBeTruthy()
  })

  // Are previously active states correctly re-activated on multiple previous transitions?
  it("Should restore previous.", async () => {
    const state = createState(previousDesign)
    state.send("TO_B")
    state.send("TO_BB")
    state.send("TO_A")
    state.send("BACK_TO_B")
    state.send("TO_A")
    state.send("BACK_TO_B")
    // Should set previous state (bb)
    expect(state.isIn("b")).toBeTruthy()
    expect(state.isIn("ba")).toBeFalsy()
    expect(state.isIn("bb")).toBeTruthy()
  })

  // Are deep initial states correctly activated on a previous transition?
  it("Should restore previous.", async () => {
    const state = createState(previousDesign)
    state.send("TO_B")
    state.send("TO_BB")
    state.send("TO_CB")
    expect(state.isIn("ca")).toBeFalsy()
    expect(state.isIn("cb")).toBeTruthy()
    state.send("TO_A")
    state.send("BACK_TO_B")
    // Should set initial deep state (ca)
    expect(state.isIn("b")).toBeTruthy()
    expect(state.isIn("ba")).toBeFalsy()
    expect(state.isIn("bb")).toBeTruthy()
    expect(state.isIn("ca")).toBeTruthy()
    expect(state.isIn("cb")).toBeFalsy()
  })

  // Are deep states correctly activated on a restore transition?
  it("Should restore previous.", async () => {
    const state = createState(previousDesign)
    state.send("TO_B")
    state.send("TO_BB")
    state.send("TO_CB")
    expect(state.isIn("ca")).toBeFalsy()
    expect(state.isIn("cb")).toBeTruthy()
    state.send("TO_A")
    state.send("RESTORE_B")
    // Should restore previously activated deep state (cb)
    expect(state.isIn("b")).toBeTruthy()
    expect(state.isIn("ba")).toBeFalsy()
    expect(state.isIn("bb")).toBeTruthy()
    expect(state.isIn("ca")).toBeFalsy()
    expect(state.isIn("cb")).toBeTruthy()
  })

  // Does WhenIn work?
  it("Should support whenIn.", () => {
    const state = createState({
      initial: "a",
      states: {
        a: { on: { TO_C: { to: "c" } } },
        b: {},
        c: {
          states: {
            d: {},
            e: {},
            f: {},
          },
        },
      },
    })

    const keys = {
      a: "a",
      b: "b",
      c: "c",
      d: "d",
      e: "e",
      f: "f",
    }

    expect(state.whenIn(keys)).toBe("a")
    state.send("TO_C")
    expect(state.whenIn(keys)).toBe("f")
    expect(state.whenIn(keys, "array")).toMatchObject(["c", "d", "e", "f"])
    expect(state.whenIn(keys, (a, [_, v]) => a + v, "")).toBe("cdef")
  })

  it("Should support wait.", async (done) => {
    const state = createState({
      data: { count: 0 },
      on: {
        TRIGGERED: [
          "increment",
          {
            do: "increment",
            wait: 0.25,
          },
          {
            do: "increment",
            wait: 0.25,
          },
          {
            do: "increment",
            wait: 0.25,
          },
        ],
      },
      actions: {
        increment(data) {
          data.count++
        },
      },
    })

    state.send("TRIGGERED")
    expect(state.data.count).toBe(1)
    jest.runAllTimers()
    expect(state.data.count).toBe(4)
    done()
  })

  // Do initial active states work?
  it("Should support else event handlers.", async (done) => {
    const state = createState({
      data: { count: 0 },
      on: {
        SOME_EVENT: {
          if: "atMin",
          do: ["incrementByOne", "incrementByOne"],
          else: {
            unless: "atMax",
            do: "incrementByOne",
            else: "reset",
          },
        },
      },
      conditions: {
        atMin: (data) => data.count === 0,
        atMax: (data) => data.count === 5,
      },
      actions: {
        incrementByOne: (data) => data.count++,
        reset: (data) => (data.count = 0),
      },
    })

    expect(state.data.count).toBe(0) // Start at zero
    state.send("SOME_EVENT")
    expect(state.data.count).toBe(2) // When zero, adds two
    state.send("SOME_EVENT")
    expect(state.data.count).toBe(3)
    state.send("SOME_EVENT") // 4
    expect(state.data.count).toBe(4)
    state.send("SOME_EVENT") // 5
    expect(state.data.count).toBe(5) // When less than max, adds one
    state.send("SOME_EVENT") // When at max, resets to zero
    expect(state.data.count).toBe(0)

    const ugly = createState({
      data: { count: 0 },
      on: {
        SOME_UGLY_EVENT: {
          if: () => false,
          else: {
            if: () => false,
            else: {
              if: () => false,
              else: {
                if: () => false,
                else: {
                  if: () => false,
                  else: (data) => {
                    data.count = 5
                  },
                },
              },
            },
          },
        },
      },
    })

    expect(ugly.data.count).toBe(0)
    ugly.send("SOME_UGLY_EVENT")
    expect(ugly.data.count).toBe(5)
    done()
  })

  it("Should throw errors when a state has an initial property but no states.", () => {
    expect(() =>
      createState({
        initial: "inactive",
        data: { count: 0 },
        on: { INCREASED: { do: "increment" } },
        actions: {
          increment(d) {
            d.count++
          },
        },
      })
    ).toThrowError()
  })

  // Todo: Does it need to PREVENT payload mutation?

  it("Should mutate payloads.", (done) => {
    const state = createState({
      data: { count: 0 },
      on: { INCREASED: { do: ["increment", "testPayload"] } },
      actions: {
        increment(d, p) {
          p.count++
          d.count++
        },
        testPayload(d, p) {
          expect(d.count).toBe(1)
          expect(p.count).toBe(1)
          done()
        },
      },
    })

    state.send("INCREASED", { count: 0 })
  })

  // Do value types work?
  const stateB = createState({
    data: { count: 0 },
    values: {
      doubleCount(d) {
        return d.count * 2
      },
      shoutedCount(d) {
        return "Hey, the count is " + d.count
      },
    },
  })

  type IsNumber<T extends number> = T
  type IsString<T extends string> = T

  type A = IsString<typeof stateB.values.shoutedCount>
  type B = IsNumber<typeof stateB.values.doubleCount>

  // @ts-ignore
  type C = A | B
})
