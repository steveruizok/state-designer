import React from 'react'
import { useStateDesigner } from 'state-designer'

export default function () {
  const { data, isIn, send, can, whenIn } = useStateDesigner({
    data: {
      currentTime: 0,
      duration: 30
    },
    initial: 'stopped',
    states: {
      stopped: {
        on: {
          PRESSED_PLAY: { to: 'playing' },
          PRESSED_REWIND: { to: 'rewinding' },
          PRESSED_FASTFORWARD: { to: 'fastForwarding' }
        }
      },
      playing: {
        initial: 'normal',
        states: {
          normal: {
            repeat: {
              event: [
                {
                  if: 'atEnd',
                  to: 'stopped'
                },
                'forwardOneSecond'
              ],
              delay: 1
            },
            on: {
              PRESSED_STOP: { to: 'stopped' },
              PRESSED_PAUSE: { to: 'paused' },
              HELD_REWIND: { to: 'scrubbingBack' },
              HELD_FASTFORWARD: { to: 'scrubbingForward' }
            }
          },
          paused: {
            on: {
              PRESSED_PLAY: { to: 'normal' },
              PRESSED_STOP: { to: 'stopped' },
              HELD_REWIND: { to: 'scrubbingBack' },
              HELD_FASTFORWARD: { to: 'scrubbingForward' }
            }
          }
        }
      },
      scrubbingForward: {
        repeat: {
          event: [
            {
              if: 'atEnd',
              to: 'stopped'
            },
            'forwardOneSecond'
          ],
          delay: 0.1
        },
        on: {
          RELEASED_FASTFORWARD: { to: 'playing.restore' }
        }
      },
      scrubbingBack: {
        repeat: {
          event: [
            {
              if: 'atStart',
              to: 'stopped'
            },
            'rewindOneSecond'
          ],
          delay: 0.1
        },
        on: {
          RELEASED_REWIND: { to: 'playing.restore' }
        }
      },
      fastForwarding: {
        repeat: {
          event: [
            {
              if: 'atEnd',
              to: 'stopped'
            },
            'forwardOneSecond'
          ],
          delay: 0.05
        },
        on: {
          PRESSED_PLAY: { to: 'playing' },
          PRESSED_STOP: { to: 'stopped' }
        }
      },
      rewinding: {
        repeat: {
          event: [
            {
              if: 'atStart',
              to: 'stopped'
            },
            'rewindOneSecond'
          ],
          delay: 0.05
        },
        on: {
          PRESSED_PLAY: { to: 'playing' },
          PRESSED_STOP: { to: 'stopped' }
        }
      }
    },
    conditions: {
      atStart(data) {
        return data.currentTime <= 0
      },
      atEnd(data) {
        return data.currentTime >= data.duration
      }
    },
    actions: {
      forwardOneSecond(data) {
        data.currentTime++
      },
      rewindOneSecond(data) {
        data.currentTime--
      }
    }
  })

  return (
    <div>
      <h2>{data.currentTime}</h2>
      <div className='button-group'>
        <button
          disabled={!can('PRESSED_PLAY')}
          onClick={() => send('PRESSED_PLAY')}
        >
          play
        </button>
        <div
          onMouseDown={() => send('HELD_REWIND')}
          onMouseUp={() => send('RELEASED_REWIND')}
        >
          <button
            disabled={
              !(
                can('PRESSED_REWIND') ||
                can('HELD_REWIND') ||
                can('RELEASED_REWIND')
              )
            }
            onClick={() => send('PRESSED_REWIND')}
          >
            rewind
          </button>
        </div>
        <div
          onMouseDown={() => send('HELD_FASTFORWARD')}
          onMouseUp={() => {
            send('RELEASED_FASTFORWARD')
          }}
        >
          <button
            disabled={
              !(
                can('PRESSED_FASTFORWARD') ||
                can('HELD_FASTFORWARD') ||
                can('RELEASED_FASTFORWARD')
              )
            }
            onClick={() => send('PRESSED_FASTFORWARD')}
          >
            fast forward
          </button>
        </div>
        <button
          disabled={!can('PRESSED_STOP')}
          onClick={() => send('PRESSED_STOP')}
        >
          stop
        </button>
        <button
          disabled={!can('PRESSED_PAUSE')}
          onClick={() => send('PRESSED_PAUSE')}
        >
          pause
        </button>
      </div>
    </div>
  )
}
