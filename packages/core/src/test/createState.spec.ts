/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createDesign, createState } from '../'
import { design, counterDesign } from './shared'

jest.useFakeTimers()

describe('action replacers', () => {
  it('Should update data when returning void', () => {
    const state = createState({
      data: { count: 0, name: 'state-designer' },
      on: { TICK: (d) => void d.count++ },
    })

    state.send('TICK')
    expect(state.data.count).toBe(1)
    expect(state.data.name).toBe('state-designer')
  })

  it('Should update data when returning partial data', () => {
    const state = createState({
      data: { count: 0, name: 'state-designer' },
      on: {
        TICK: (d) => {
          return { count: d.count + 1 }
        },
      },
    })

    state.send('TICK')
    expect(state.data.count).toBe(1)
    expect(state.data.name).toBe('state-designer')
  })

  it('Should update data when returning full data', () => {
    const state = createState({
      data: { count: 0, name: 'state-designer' },
      on: {
        TICK: (d) => {
          return { count: d.count + 1, name: 'steve' }
        },
      },
    })

    state.send('TICK')
    expect(state.data.count).toBe(1)
    expect(state.data.name).toBe('steve')
  })

  it('Should allow chaining when returning data', () => {
    const state = createState({
      data: { count: 0, name: 'state-designer' },
      on: {
        TICK: [
          (d) => {
            return { count: d.count + 1 }
          },
          (d) => {
            return { count: d.count + 1, name: 'steve' }
          },
          (d) => {
            return { name: d.name + '!' }
          },
        ],
      },
    })

    state.send('TICK')
    expect(state.data.count).toBe(2)
    expect(state.data.name).toBe('steve!')
  })

  it('Should have a typescript error when returning bad data', () => {
    const state = createState({
      data: { count: 0, name: 'state-designer' },
      on: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        TICK: () => {
          return { horses: 1000 }
        },
      },
    })

    state.send('TICK')
    expect(state.data.count).toBe(0)
    expect(state.data.name).toBe('state-designer')
  })
})

describe('createState', () => {
  it('Should create a state.', () => {
    expect(createState({})).toBeTruthy()
    expect(createState(design)).toBeTruthy()
  })

  it('Should support send.', () => {
    let i = 0

    const state = createState({
      on: { TICK: () => void i++ },
    })

    state.send('TICK')
    expect(i).toBe(1)
  })

  it('Should support actions.', () => {
    const counter = createState({
      data: { count: 0 },
      on: {
        INCREASED_BY_ONE: 'increment',
        INCREASED_BY_TWO: ['increment', 'increment'],
      },
      actions: {
        increment(d) {
          d.count++
        },
      },
    })

    expect(counter.data.count).toBe(0)
    counter.send('INCREASED_BY_ONE')
    expect(counter.data.count).toBe(1)
    counter.send('INCREASED_BY_TWO')
    expect(counter.data.count).toBe(3)
  })

  it('Should support conditions.', () => {
    const counter = createState({
      data: { count: 0 },
      on: {
        A: { if: 'alwaysFail', do: 'increment' },
        B: { if: 'neverFail', do: 'increment' },
        C: { if: 'upToThree', do: 'increment' },
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
    counter.send('A')
    expect(counter.data.count).toBe(0)
    counter.send('B')
    expect(counter.data.count).toBe(1)
    counter.send('C')
    counter.send('C')
    counter.send('C')
    counter.send('C')
    counter.send('C')
    expect(counter.data.count).toBe(3)
  })

  it('Should support all conditions.', () => {
    const state = createState({
      data: {
        ifT: false,
        ifF: false,
        ifTT: false,
        ifTF: false,
        ifFF: false,
        ifAnyT: false,
        ifAnyF: false,
        ifAnyTT: false,
        ifAnyTF: false,
        ifAnyFF: false,
        unlessT: false,
        unlessF: false,
        unlessTT: false,
        unlessTF: false,
        unlessFF: false,
        unlessAnyT: false,
        unlessAnyF: false,
        unlessAnyTT: false,
        unlessAnyTF: false,
        unlessAnyFF: false,
      },
      on: {
        RUN: [
          { if: 'true', do: (d) => void (d.ifT = true) },
          { if: 'false', do: (d) => void (d.ifF = true) },
          { if: ['true', 'true'], do: (d) => void (d.ifTT = true) },
          { if: ['true', 'false'], do: (d) => void (d.ifTF = true) },
          { if: ['false', 'false'], do: (d) => void (d.ifFF = true) },
          { ifAny: 'true', do: (d) => void (d.ifAnyT = true) },
          { ifAny: 'false', do: (d) => void (d.ifAnyF = true) },
          { ifAny: ['true', 'true'], do: (d) => void (d.ifAnyTT = true) },
          { ifAny: ['true', 'false'], do: (d) => void (d.ifAnyTF = true) },
          { ifAny: ['false', 'false'], do: (d) => void (d.ifAnyFF = true) },
          { unless: 'true', do: (d) => void (d.unlessT = true) },
          { unless: 'false', do: (d) => void (d.unlessF = true) },
          { unless: ['true', 'true'], do: (d) => void (d.unlessT = true) },
          { unless: ['true', 'false'], do: (d) => void (d.unlessTF = true) },
          { unless: ['false', 'false'], do: (d) => void (d.unlessFF = true) },
          { unlessAny: 'true', do: (d) => void (d.unlessAnyT = true) },
          { unlessAny: 'false', do: (d) => void (d.unlessAnyF = true) },
          {
            unlessAny: ['true', 'true'],
            do: (d) => void (d.unlessAnyT = true),
          },
          {
            unlessAny: ['true', 'false'],
            do: (d) => void (d.unlessAnyTF = true),
          },
          {
            unlessAny: ['false', 'false'],
            do: (d) => void (d.unlessAnyFF = true),
          },
        ],
      },
      conditions: {
        false() {
          return false
        },
        true() {
          return true
        },
      },
    })

    state.send('RUN')
    const { data } = state
    expect(data.ifT).toBe(true)
    expect(data.ifF).toBe(false)
    expect(data.ifTT).toBe(true)
    expect(data.ifTF).toBe(false)
    expect(data.ifFF).toBe(false)
    expect(data.ifAnyT).toBe(true)
    expect(data.ifAnyF).toBe(false)
    expect(data.ifAnyTT).toBe(true)
    expect(data.ifAnyTF).toBe(true)
    expect(data.ifAnyFF).toBe(false)
    expect(data.unlessT).toBe(false)
    expect(data.unlessF).toBe(true)
    expect(data.unlessTT).toBe(false)
    expect(data.unlessTF).toBe(false)
    expect(data.unlessFF).toBe(true)
    expect(data.unlessAnyT).toBe(false)
    expect(data.unlessAnyF).toBe(true)
    expect(data.unlessAnyTT).toBe(false)
    expect(data.unlessAnyTF).toBe(true)
    expect(data.unlessAnyFF).toBe(true)
  })

  // Can I chain events?

  it('Should support chaining.', async () => {
    const counter = createState({
      data: { count: 0 },
      actions: {
        increment(d) {
          d.count++
        },
      },
      on: { INCREASED: 'increment' },
    })

    expect(counter.data.count).toBe(0)
    counter.send('INCREASED').send('INCREASED')
    // ((c) => c.send("INCREASED"))
    expect(counter.data.count).toBe(2)
  })

  // Does the `isIn` helper work?

  it('Should support the isIn helper.', () => {
    const counter = createState(counterDesign)
    expect(counter.isIn('active')).toBeFalsy()
    expect(counter.isIn('inactive')).toBeTruthy()
    expect(counter.isIn('active', 'inactive')).toBeFalsy()
    expect(counter.isIn('missing')).toBeFalsy()
  })

  it('Should support the isInAny helper.', () => {
    const counter = createState(counterDesign)
    expect(counter.isIn('active')).toBeFalsy()
    expect(counter.isIn('inactive')).toBeTruthy()
    expect(counter.isInAny('active', 'inactive')).toBeTruthy()
    expect(counter.isInAny('missing')).toBeFalsy()
  })

  it('Should support the isIn helper with transitions.', () => {
    const counter = createState(counterDesign)
    expect(counter.isIn('active')).toBeFalsy()
    expect(counter.isIn('inactive')).toBeTruthy()
    counter.send('TOGGLED')
    expect(counter.isIn('active')).toBeTruthy()
    expect(counter.isIn('inactive')).toBeFalsy()
  })

  // Does the `can` helper work?

  it('Should support can helper.', () => {
    const counter = createState(counterDesign)
    expect(counter.can('CLICKED_PLUS')).toBeFalsy()
    expect(counter.can('TOGGLED')).toBeTruthy()
  })

  it('Should support can helper with transitions.', () => {
    const counter = createState(counterDesign)
    expect(counter.can('CLICKED_PLUS')).toBeFalsy()
    expect(counter.can('TOGGLED')).toBeTruthy()
    counter.send('TOGGLED')
    expect(counter.can('CLICKED_PLUS')).toBeTruthy()
    expect(counter.can('TOGGLED')).toBeTruthy()
  })

  // Do initial active states work?
  it('Should support initial active states.', () => {
    const counter = createState(counterDesign)
    expect(counter.isIn('inactive')).toBeTruthy()
    expect(counter.isIn('active')).toBeFalsy()
  })

  // Do transitions work?
  // Do down-level activations work?
  // Do onEvent events work?

  it('Should support transitions.', () => {
    const state = createState({
      states: {
        a: {
          initial: 'a1',
          states: {
            a1: {},
            a2: {},
          },
        },
        b: {
          initial: 'b1',
          states: {
            b1: {},
            b2: {
              initial: 'bb1',
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
          to: 'a2',
        },
        TARGET_TOP: {
          to: 'a',
        },
        TARGET_DEEP: {
          to: 'b.b2',
        },
      },
    })

    state.send('TARGET')
    expect(state.isIn('a2')).toBeTruthy()
    state.send('TARGET_TOP')
    expect(state.isIn('a1')).toBeTruthy()
    state.send('TARGET_DEEP')
    expect(state.isIn('b2')).toBeTruthy()
    expect(state.isIn('bb1')).toBeTruthy()
    expect(state.isIn('bb2')).toBeFalsy()
  })

  it('Should support resetting targeted branches.', () => {
    const state = createState({
      initial: 'a',
      states: {
        a: {
          initial: 'a1',
          states: {
            a1: {
              on: { TO_A2: { to: 'a2' } },
            },
            a2: {
              on: { TO_A: { to: 'a' } },
            },
          },
        },
        b: {},
      },
    })

    state.send('TO_A2')
    expect(state.isIn('a2')).toBeTruthy() // true
    state.send('TO_A')
    expect(state.isIn('a1')).toBeTruthy() // true
  })

  it('Should correctly bail on transitions.', () => {
    const toggler = createState({
      data: { count: 0 },
      initial: 'inactive',
      states: {
        inactive: {
          on: {
            TOGGLED: [{ do: 'increment' }, { to: 'active' }],
          },
        },
        active: {
          on: {
            TOGGLED: [{ to: 'inactive' }, { do: 'increment' }],
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
    toggler.send('TOGGLED') // Should run first increment
    toggler.send('TOGGLED') // Should not run second increment
    expect(toggler.data.count).toBe(1)
  })

  it('Should support multiple transitions.', () => {
    const state = createState({
      states: {
        a: {
          initial: 'a1',
          states: {
            a1: {},
            a2: {},
          },
        },
        b: {
          initial: 'b1',
          states: {
            b1: {},
            b2: {},
          },
        },
        c: {
          initial: 'c1',
          states: {
            c1: {},
            c2: {},
          },
        },
      },
      on: {
        TRIGGER: {
          to: ['a2', 'b2', 'c2'],
        },
      },
    })

    state.send('TRIGGER')
    expect(state.isIn('a2')).toBeTruthy()
    expect(state.isIn('b2')).toBeTruthy()
    expect(state.isIn('c2')).toBeTruthy()
    expect(state.isIn('a2', 'b2', 'c2')).toBeTruthy()
  })

  it('Should allow initial logic without bailing.', () => {
    const state = createState({
      data: {
        count: 0,
      },
      initial: 'a',
      states: {
        a: {
          on: {
            TRIGGER1: { to: 'b' },
          },
          initial: {
            if: () => true,
            to: 'a1',
          },
          states: {
            a1: {
              initial: {
                if: () => true,
                to: 'a11',
              },
              states: {
                a11: {
                  onEnter: (d) => {
                    d.count++
                  },
                  on: {
                    TRIGGER2: { to: 'b11' },
                  },
                },
                b11: {},
              },
            },
            a2: {},
          },
        },
        b: {
          on: {
            TRIGGER1: { to: 'a' },
          },
        },
      },
    })

    expect(state.isIn('a')).toBeTruthy()
    expect(state.isIn('a1')).toBeTruthy()
    expect(state.isIn('a11')).toBeTruthy()
    state.send('TRIGGER2')
    expect(state.isIn('b11')).toBeTruthy()
    state.send('TRIGGER1')
    expect(state.isIn('b')).toBeTruthy()
    state.send('TRIGGER1')
    expect(state.isIn('a11')).toBeTruthy()
    expect(state.data.count).toEqual(2)
  })

  // Do onExit events work?

  it('Should support onEnter and onExit events.', () => {
    const counter = createState(counterDesign)
    expect(counter.data.activations).toBe(0)
    let update = counter.send('TOGGLED')
    expect(update.data.activations).toBe(1)
    expect(update.data.deactivations).toBe(0)
    expect(counter.isIn('active')).toBeTruthy()
    update = counter.send('TOGGLED')
    expect(update.data.activations).toBe(1)
    expect(update.data.deactivations).toBe(1)
  })

  it('Should preserve payloads and results between transitions.', () => {
    const state = createState({
      data: { count: 0, final: { result: 0, payload: 0 } },
      initial: 'ready',
      states: {
        ready: {
          on: {
            FETCHED: {
              get: () => 20,
              to: 'loading',
            },
          },
        },
        loading: {
          on: {
            CANCELLED: { to: 'ready' },
          },
          async: {
            await: (_, __, r) => new Promise((resolve) => resolve(r)),
            onResolve: {
              to: 'success',
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

    state.send('FETCHED', 10)

    setTimeout(() => {
      expect(state.data.final.payload).toBe(10)
      expect(state.data.final.result).toBe(20)
    }, 1000)
  })

  it('Should support onEnter and onExit events.', () => {
    const toggler = createState({
      initial: 'inactive',
      data: {
        count: 0,
      },
      states: {
        inactive: {
          on: { TOGGLED: { do: 'increment', to: 'active' } },
        },
        active: {
          on: { TOGGLED: [{ to: 'inactive' }, { do: 'increment' }] },
        },
      },
      actions: {
        increment(d) {
          d.count++
        },
      },
    })

    expect(toggler.isIn('inactive')).toBeTruthy()
    toggler.send('TOGGLED')
    expect(toggler.isIn('active')).toBeTruthy()
    expect(toggler.data.count).toBe(1)
    toggler.send('TOGGLED')
    expect(toggler.isIn('inactive')).toBeTruthy()
    toggler.send('TOGGLED')
    expect(toggler.isIn('active')).toBeTruthy()
    expect(toggler.data.count).toBe(2)
    expect(toggler.data.count).toBe(2)
  })

  // Do results work?

  it('Should support results.', () => {
    type Switch = { id: string; switched: boolean }

    type SwitchCollection = Record<string, Switch>

    const switches: SwitchCollection = {
      0: { id: '0', switched: false },
      1: { id: '1', switched: false },
      2: { id: '2', switched: true },
    }

    const state = createState({
      data: { switches },
      on: {
        FLIPPED_SWITCH: {
          get: 'switch',
          if: 'switchIsFlipped',
          do: 'flipSwitch',
          else: {
            do: 'flipSwitch',
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
    state.send('FLIPPED_SWITCH', { id: '0' })
    expect(state.data.switches[0].switched).toBeTruthy()
    expect(state.data.switches[1].switched).toBeFalsy()
    state.send('FLIPPED_SWITCH', { id: '0' })
    state.send('FLIPPED_SWITCH', { id: '1' })
    expect(state.data.switches[0].switched).toBeFalsy()
    expect(state.data.switches[1].switched).toBeTruthy()
  })

  // Does asynchronous send queueing work?

  const previousDesign = createDesign({
    id: 'previous_test',
    states: {
      x: {},
      y: {},
      z: {
        initial: 'a',
        states: {
          a: {
            on: {
              TO_B: { to: 'b' },
              BACK_TO_B: { to: 'b.previous' },
              RESTORE_B: { to: 'b.restore' },
            },
            initial: 'aa',
            states: {
              aa: { on: { TO_AB: { to: 'ab' } } },
              ab: { on: { TO_AA: { to: 'aa' } } },
            },
          },
          b: {
            on: { TO_A: { to: 'a' } },
            initial: 'ba',
            states: {
              ba: {
                on: { TO_BB: { to: 'bb' } },
              },
              bb: {
                on: {
                  TO_BA: { to: 'ba' },
                },
                initial: 'ca',
                states: {
                  ca: { on: { TO_CB: { to: 'cb' } } },
                  cb: { on: { TO_CA: { to: 'ca' } } },
                },
              },
            },
          },
        },
      },
    },
  })

  // Are initial active states correctly activated on a transition?
  it('Should restore initial when returning to a state.', async () => {
    const state = createState(previousDesign)
    state.send('TO_AB')
    state.send('TO_B')
    state.send('TO_BB')
    state.send('TO_A')
    // Should set initial state (aa)
    expect(state.isIn('aa')).toBeTruthy()
  })

  // Are previously active states correctly activated on a previous transition?
  it('Should restore previous.', async () => {
    const state = createState(previousDesign)
    state.send('TO_B')
    state.send('TO_BB')
    state.send('TO_A')
    state.send('BACK_TO_B')
    // Should set previous state (bb)
    expect(state.isIn('b')).toBeTruthy()
    expect(state.isIn('ba')).toBeFalsy()
    expect(state.isIn('bb')).toBeTruthy()
  })

  // Are previously active states correctly re-activated on multiple previous transitions?
  it('Should restore previous.', async () => {
    const state = createState(previousDesign)
    state.send('TO_B')
    state.send('TO_BB')
    state.send('TO_A')
    state.send('BACK_TO_B')
    state.send('TO_A')
    state.send('BACK_TO_B')
    // Should set previous state (bb)
    expect(state.isIn('b')).toBeTruthy()
    expect(state.isIn('ba')).toBeFalsy()
    expect(state.isIn('bb')).toBeTruthy()
  })

  // Are deep initial states correctly activated on a previous transition?
  it('Should restore previous.', async () => {
    const state = createState(previousDesign)
    state.send('TO_B')
    state.send('TO_BB')
    state.send('TO_CB')
    expect(state.isIn('ca')).toBeFalsy()
    expect(state.isIn('cb')).toBeTruthy()
    state.send('TO_A')
    state.send('BACK_TO_B')
    // Should set initial deep state (ca)
    expect(state.isIn('b')).toBeTruthy()
    expect(state.isIn('ba')).toBeFalsy()
    expect(state.isIn('bb')).toBeTruthy()
    expect(state.isIn('ca')).toBeTruthy()
    expect(state.isIn('cb')).toBeFalsy()
  })

  // Are deep states correctly activated on a restore transition?
  it('Should restore previous.', async () => {
    const state = createState(previousDesign)
    state.send('TO_B')
    state.send('TO_BB')
    state.send('TO_CB')
    expect(state.isIn('ca')).toBeFalsy()
    expect(state.isIn('cb')).toBeTruthy()
    state.send('TO_A')
    state.send('RESTORE_B')
    // Should restore previously activated deep state (cb)
    expect(state.isIn('b')).toBeTruthy()
    expect(state.isIn('ba')).toBeFalsy()
    expect(state.isIn('bb')).toBeTruthy()
    expect(state.isIn('ca')).toBeFalsy()
    expect(state.isIn('cb')).toBeTruthy()
  })

  // Does WhenIn work?
  it('Should support whenIn.', () => {
    const state = createState({
      initial: 'a',
      states: {
        a: { on: { TO_C: { to: 'c' } } },
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
      a: 'a',
      b: 'b',
      c: 'c',
      d: 'd',
      e: 'e',
      f: 'f',
    }

    expect(state.whenIn(keys)).toBe('a')
    state.send('TO_C')
    expect(state.whenIn(keys)).toBe('f')
    expect(state.whenIn(keys, 'array')).toMatchObject(['c', 'd', 'e', 'f'])
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    expect(state.whenIn(keys, (a, [_, v]) => a + v, '')).toBe('cdef')
  })

  it('Should support wait.', () => {
    const state = createState({
      data: { count: 0 },
      on: {
        TRIGGERED: [
          'increment',
          {
            do: 'increment',
            wait: 0.25,
          },
          {
            do: 'increment',
            wait: 0.25,
          },
          {
            do: 'increment',
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

    state.send('TRIGGERED')
    expect(state.data.count).toBe(1)
    jest.runAllTimers()
    expect(state.data.count).toBe(4)
  })

  // Do initial active states work?
  it('Should support else event handlers.', () => {
    const state = createState({
      data: { count: 0 },
      on: {
        SOME_EVENT: {
          if: 'atMin',
          do: ['incrementByOne', 'incrementByOne'],
          else: {
            unless: 'atMax',
            do: 'incrementByOne',
            else: 'reset',
          },
        },
      },
      conditions: {
        atMin: (data) => data.count === 0,
        atMax: (data) => data.count === 5,
      },
      actions: {
        incrementByOne: (data) => void data.count++,
        reset: (data) => void (data.count = 0),
      },
    })

    expect(state.data.count).toBe(0) // Start at zero
    state.send('SOME_EVENT')
    expect(state.data.count).toBe(2) // When zero, adds two
    state.send('SOME_EVENT')
    expect(state.data.count).toBe(3)
    state.send('SOME_EVENT') // 4
    expect(state.data.count).toBe(4)
    state.send('SOME_EVENT') // 5
    expect(state.data.count).toBe(5) // When less than max, adds one
    state.send('SOME_EVENT') // When at max, resets to zero
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
                  else: (data) => void (data.count = 5),
                },
              },
            },
          },
        },
      },
    })

    expect(ugly.data.count).toBe(0)
    ugly.send('SOME_UGLY_EVENT')
    expect(ugly.data.count).toBe(5)
  })

  it('Should throw errors when a state has an initial property but no states.', () => {
    expect(() =>
      createState({
        initial: 'inactive',
        data: { count: 0 },
        on: { INCREASED: { do: 'increment' } },
        actions: {
          increment(d) {
            d.count++
          },
        },
      })
    ).toThrowError()
  })

  // Todo: Does it need to PREVENT payload mutation?

  it('Should mutate payloads.', () => {
    const state = createState({
      data: { count: 0 },
      on: { INCREASED: { do: ['increment', 'testPayload'] } },
      actions: {
        increment(d, p) {
          p.count++
          d.count++
        },
        testPayload(d, p) {
          expect(d.count).toBe(1)
          expect(p.count).toBe(1)
        },
      },
    })

    state.send('INCREASED', { count: 0 })
  })

  /* ------------------ Forced Stuff ------------------ */

  it('Should force transitions.', () => {
    const state = createState({
      initial: 'a',
      states: {
        a: {
          initial: 'a1',
          states: {
            a1: {},
            a2: {},
          },
        },
        b: {
          initial: 'b1',
          states: {
            b1: {},
            b2: {
              initial: 'bb1',
              states: {
                bb1: {},
                bb2: {},
              },
            },
          },
        },
      },
    })

    state.forceTransition('b.b2.bb2')
    expect(state.isIn('b.b2.bb2')).toBeTruthy()
  })

  it('Should force data.', () => {
    const state = createState({
      data: { count: 0 },
      on: { INCREASED: { do: 'increment' } },
      actions: {
        increment(d) {
          d.count++
        },
      },
    })

    state.forceData({ count: 2 })
    expect(state.data.count).toEqual(2)
  })

  /* --------------------- Errors --------------------- */

  it('Should throw errors for conditions.', () => {
    const state = createState({
      on: { EVENT: { if: 'conditionError' } },
      conditions: {
        conditionError() {
          // @ts-expect-error
          return helloWorld
        },
      },
    })

    expect(() => state.send('EVENT')).toThrowError(
      'EVENT: Error while testing conditions! helloWorld is not defined'
    )
  })

  it('Should throw errors for actions.', () => {
    const state = createState({
      on: { EVENT: { do: 'actionError' } },
      actions: {
        actionError() {
          // @ts-expect-error
          return helloWorld
        },
      },
    })

    expect(() => state.send('EVENT')).toThrowError(
      'EVENT: Error in action (actionError)! helloWorld is not defined'
    )
  })

  it('Should throw errors for results.', () => {
    const state = createState({
      on: { EVENT: { get: 'resultError' } },
      results: {
        resultError() {
          // @ts-expect-error
          return helloWorld
        },
      },
    })

    expect(() => state.send('EVENT')).toThrowError(
      'EVENT: Error in result (resultError)! helloWorld is not defined'
    )
  })

  it('Should throw errors for transitions.', () => {
    const state = createState({
      on: { EVENT: { to: 'someState' } },
      initial: 'a',
      states: {
        a: {},
        b: {},
      },
    })

    expect(() => state.send('EVENT')).toThrowError(
      'EVENT: Error in transition (someState)! Could not find that state'
    )
  })

  it('Should throw errors for secret actions.', () => {
    const state = createState({
      on: { EVENT: { secretlyDo: 'actionError' } },
      actions: {
        actionError() {
          // @ts-expect-error
          return helloWorld
        },
      },
    })

    expect(() => state.send('EVENT')).toThrowError(
      'EVENT: Error in secret action (actionError)! helloWorld is not defined'
    )
  })

  it('Should throw errors for secret transitions.', () => {
    const state = createState({
      on: { EVENT: { secretlyTo: 'someState' } },
      initial: 'a',
      states: {
        a: {},
        b: {},
      },
    })

    expect(() => state.send('EVENT')).toThrowError(
      'EVENT: Error in transition (someState)! Could not find that state'
    )
  })

  it('Should throw errors for computed transitions.', () => {
    const state = createState({
      // @ts-expect-error
      on: { EVENT: { to: () => helloWorld } },
      initial: 'a',
      states: {
        a: {},
        b: {},
      },
    })

    expect(() => state.send('EVENT')).toThrowError(
      'EVENT: Error computing transition (to)! helloWorld is not defined'
    )
  })

  it('Should throw errors for computed secret transitions.', () => {
    const state = createState({
      // @ts-expect-error
      on: { EVENT: { secretlyTo: () => helloWorld } },
      initial: 'a',
      states: {
        a: {},
        b: {},
      },
    })

    expect(() => state.send('EVENT')).toThrowError(
      'EVENT: Error computing secret transition (secretlyTo)! helloWorld is not defined'
    )
  })

  it('Should throw errors for state.can.', () => {
    const state = createState({
      on: { EVENT: { get: 'resultError' } },
      results: {
        resultError() {
          // @ts-expect-error
          return helloWorld
        },
      },
    })

    expect(() => state.can('EVENT')).toThrowError(
      'Error testing can(EVENT)! helloWorld is not defined'
    )
  })

  it('Should accept events even after encountering an error.', () => {
    const state = createState({
      data: { count: 0 },
      on: {
        EVENT: { get: 'resultError' },
        INCREMENT: (d) => {
          d.count++
        },
      },
      results: {
        resultError() {
          // @ts-expect-error
          return helloWorld
        },
      },
    })

    expect(() => state.can('EVENT')).toThrowError(
      'Error testing can(EVENT)! helloWorld is not defined'
    )

    expect(() => state.send('EVENT')).toThrowError(
      'EVENT: Error in result (resultError)! helloWorld is not defined'
    )

    state.send('INCREMENT')

    expect(state.data.count).toEqual(1)
  })

  /* --------------- Suppressing Errors --------------- */

  // it('Should console error when suppressing errors.', () => {
  //   const state = createState({
  //     on: { EVENT: { get: 'resultError' } },
  //     results: {
  //       resultError() {
  //         // @ts-expect-error
  //         return helloWorld
  //       },
  //     },
  //     options: {
  //       suppressErrors: false,
  //     },
  //   })

  //   // Suppress console errors.
  //   const t0 = console.error
  //   console.error = jest.fn()
  //   state.send('EVENT')
  //   expect(console.error).toHaveBeenCalledWith(
  //     'EVENT: Error in result (resultError)! helloWorld is not defined'
  //   )
  //   console.error = t0
  // })

  it('Should allow onError to receive errors.', () => {
    const onError = jest.fn()

    const state = createState({
      on: { EVENT: { get: 'resultError' } },
      results: {
        resultError() {
          // @ts-expect-error
          return helloWorld
        },
      },
      options: {
        suppressErrors: false,
        onError,
      },
    })

    // Throw an error as usual.
    expect(() => state.send('EVENT')).toThrow(
      'EVENT: Error in result (resultError)! helloWorld is not defined'
    )

    // Also call `onError` with the error.
    expect(onError).toHaveBeenCalledWith(
      Error('EVENT: Error in result (resultError)! helloWorld is not defined')
    )
  })

  // it('Should allow onError to receive errors even when suppressing errors.', () => {
  //   const onError = jest.fn()

  //   const state = createState({
  //     on: { EVENT: { get: 'resultError' } },
  //     results: {
  //       resultError() {
  //         // @ts-expect-error
  //         return helloWorld
  //       },
  //     },
  //     options: {
  //       onError,
  //       suppressErrors: true,
  //     },
  //   })

  //   // Throw an error as usual.
  //   expect(() => state.send('EVENT')).not.toThrow(
  //     'EVENT: Error in result (resultError)! helloWorld is not defined'
  //   )

  //   // Also call `onError` with the error.
  //   expect(onError).toHaveBeenCalledWith(
  //     Error('EVENT: Error in result (resultError)! helloWorld is not defined')
  //   )
  // })

  it('Should not suppress errors when options are not provided.', () => {
    const state = createState({
      on: {
        RESULT: { get: 'resultError' },
        CONDITION: { if: 'conditionError' },
        ACTION: { if: 'conditionError' },
        SECRET_ACTION: { if: 'conditionError' },
        TRANSITION: { to: 'missingState' },
        SECRET_TRANSITION: { to: 'missingState' },
        // @ts-expect-error
        SECRET_COMPUTED_TRANSITION: { secretlyTo: () => helloWorld },
        // @ts-expect-error
        SECRET_COMPUTED_ACTION: { secretlyDo: () => helloWorld },
      },
      results: {
        resultError() {
          // @ts-expect-error
          return helloWorld
        },
      },
      conditions: {
        conditionError() {
          // @ts-expect-error
          return helloWorld
        },
      },
      actions: {
        actionError() {
          // @ts-expect-error
          return helloWorld
        },
      },
    })

    expect(() => state.send('RESULT')).toThrowError()
    expect(() => state.send('ACTION')).toThrowError()
    expect(() => state.send('CONDITION')).toThrowError()
    expect(() => state.send('SECRET_ACTION')).toThrowError()
    expect(() => state.send('SECRET_COMPUTED_ACTION')).toThrowError()
    expect(() => state.send('SECRET_TRANSITION')).toThrowError()
    expect(() => state.send('SECRET_COMPUTED_TRANSITION')).toThrowError()
    expect(() => state.can('CONDITION')).toThrowError()
  })

  // it('Should suppress errors when options are provided.', () => {
  //   const state = createState({
  //     on: {
  //       RESULT: { get: 'resultError' },
  //       CONDITION: { if: 'conditionError' },
  //       ACTION: { do: 'actionError' },
  //       SECRET_ACTION: { secretlyDo: 'actionError' },
  //       TRANSITION: { to: 'missingState' },
  //       SECRET_TRANSITION: { to: 'missingState' },
  //       // @ts-expect-error
  //       SECRET_COMPUTED_TRANSITION: { secretlyTo: () => helloWorld },
  //       // @ts-expect-error
  //       SECRET_COMPUTED_ACTION: { secretlyDo: () => helloWorld },
  //     },
  //     results: {
  //       resultError() {
  //         // @ts-expect-error
  //         return helloWorld
  //       },
  //     },
  //     conditions: {
  //       conditionError() {
  //         // @ts-expect-error
  //         return helloWorld
  //       },
  //     },
  //     actions: {
  //       actionError() {
  //         // @ts-expect-error
  //         return helloWorld
  //       },
  //     },
  //     options: {
  //       suppressErrors: true,
  //     },
  //   })

  //   expect(() => state.send('RESULT')).not.toThrowError()
  //   expect(() => state.send('ACTION')).not.toThrowError()
  //   expect(() => state.send('CONDITION')).not.toThrowError()
  //   expect(() => state.send('SECRET_ACTION')).not.toThrowError()
  //   expect(() => state.send('SECRET_COMPUTEDACTION')).not.toThrowError()
  //   expect(() => state.send('SECRET_TRANSITION')).not.toThrowError()
  //   expect(() => state.send('SECRET_COMPUTED_TRANSITION')).not.toThrowError()
  //   expect(() => state.can('CONDITION')).not.toThrowError()
  // })

  /* ------------------- Value Types ------------------ */

  // Do value types work?
  const stateB = createState({
    data: { count: 0 },
    values: {
      doubleCount(d) {
        return d.count * 2
      },
      shoutedCount(d) {
        return 'Hey, the count is ' + d.count
      },
    },
  })

  type IsNumber<T extends number> = T
  type IsString<T extends string> = T

  type A = IsString<typeof stateB.values.shoutedCount>
  type B = IsNumber<typeof stateB.values.doubleCount>

  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type C = A | B
})
