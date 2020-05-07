import * as React from 'react'
import { useStateDesigner } from 'state-designer'

function getFakeFetch() {
  return new Promise((resolve, reject) =>
    setTimeout(() => {
      const v = Math.random()

      if (v > 0.5) {
        resolve(v)
      } else {
        reject(v)
      }
    }, 1000)
  )
}

// make to into a function?
// preserve result across all event chains?
// initiate an event chain with a result value?
// Add "await" and "onResolve"

const DeepLink: React.FC<{}> = () => {
  const { data, send, isIn, can } = useStateDesigner({
    data: {
      clean: {
        code: 'count++',
        name: 'increment',
        payload: 'string'
      },
      dirty: {
        code: 'count++',
        name: 'increment',
        payload: 'string'
      },
      error: ''
    },
    on: {
      UPDATE: {
        do: ['updateDirty', 'updateError']
      }
    },
    initial: 'saved',
    states: {
      saved: {
        on: {
          UPDATE: { to: 'editing' }
        }
      },
      editing: {
        initial: 'invalid',
        onEnter: [
          {
            if: 'hasError',
            to: 'invalid'
          },
          {
            unless: 'hasError',
            to: 'valid'
          }
        ],
        on: {
          CANCEL: { do: ['resetDirty', 'resetError'], to: 'saved' }
        },
        states: {
          valid: {
            on: {
              SAVE: { do: 'saveChanges', to: 'saved' },
              UPDATE: { if: 'hasError', to: 'invalid' }
            }
          },
          invalid: {
            on: {
              UPDATE: { unless: 'hasError', to: 'valid' }
            }
          }
        }
      }
    },
    actions: {
      resetDirty(data) {
        Object.assign(data.dirty, data.clean)
      },
      resetError(data) {
        data.error = ''
      },
      saveChanges(data) {
        Object.assign(data.clean, data.dirty)
      },
      updateDirty(data, changes) {
        Object.assign(data.dirty, changes)
      },
      updateError(data) {
        data.error = data.dirty.code.includes(' ') ? 'No spaces' : ''
      }
    },
    conditions: {
      hasError(data) {
        return data.error !== ''
      }
    }
  })

  return (
    <div className='example'>
      <h2>Deep Linking</h2>
      <div className='button-group'>
        <input
          value={data.dirty.code}
          onChange={(e) => send('UPDATE', { code: e.target.value })}
        />
        <button disabled={!can('CANCEL')} onClick={() => send('CANCEL')}>
          Cancel
        </button>
        <button disabled={!can('SAVE')} onClick={() => send('SAVE')}>
          Save
        </button>
      </div>
      <p>{data.error}</p>
    </div>
  )
}

export default DeepLink
