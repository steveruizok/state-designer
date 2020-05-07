import React from 'react'
import { useStateDesigner } from 'state-designer'

export default function () {
  const { data, send, isIn, whenIn } = useStateDesigner({
    data: {
      username: '',
      password: '',
      terms: false
    },
    states: {
      form: {
        initial: 'idle',
        states: {
          idle: {
            on: {
              CHANGED_USERNAME: 'setUsername',
              CHANGED_PASSWORD: 'setPassword',
              CHANGED_TERMS: 'setTerms'
            },
            initial: 'invalid',
            states: {
              valid: {
                on: {
                  SUBMIT: { to: 'loading' }
                }
              },
              invalid: {}
            }
          },
          loading: {
            async: {
              await: () =>
                new Promise((resolve, reject) => {
                  if (Math.random() > 0.5) {
                    resolve()
                  } else {
                    reject()
                  }
                }),
              onResolve: { to: 'success' },
              onReject: { to: 'error' }
            }
          },
          success: {
            on: { RESET: { to: 'idle' } }
          },
          error: {
            on: { RESET: { to: 'idle' } }
          }
        }
      },
      username: {
        onEvent: [
          {
            if: 'usernameIsEmpty',
            to: 'empty'
          },
          {
            if: 'usernameIsTooShort',
            to: 'tooShort'
          },
          {
            if: 'usernameHasSpaces',
            to: 'hasSpaces'
          },
          {
            to: 'valid'
          }
        ],
        initial: 'empty',
        states: {
          empty: {},
          hasSpaces: {},
          tooShort: {},
          valid: {}
        }
      },
      password: {
        onEvent: [
          {
            if: 'passwordIsEmpty',
            to: 'empty'
          },
          {
            if: 'passwordIsTooShort',
            to: 'tooShort'
          },
          {
            if: 'passwordHasSpaces',
            to: 'hasSpaces'
          },
          {
            to: 'valid'
          }
        ],
        initial: 'empty',
        states: {
          empty: {},
          hasSpaces: {},
          tooShort: {},
          valid: {}
        }
      },
      terms: {
        initial: 'invalid',
        onEvent: [
          {
            if: 'termsNotAccepted',
            to: 'invalid'
          },
          {
            to: 'valid'
          }
        ],
        states: {
          invalid: {},
          valid: {}
        }
      }
    },
    actions: {
      setUsername(data, username = '') {
        data.username = username
      },
      setPassword(data, password = '') {
        data.password = password
      },
      setTerms(data, terms) {
        data.terms = terms
      }
    },
    conditions: {
      usernameIsEmpty(data) {
        return data.username.length === 0
      },
      usernameIsTooShort(data) {
        return data.username.length < 3
      },
      usernameHasSpaces(data) {
        return data.username.includes(' ')
      },
      passwordIsEmpty(data) {
        return data.password.length === 0
      },
      passwordIsTooShort(data) {
        return data.password.length < 5
      },
      passwordHasSpaces(data) {
        return data.password.includes(' ')
      },
      termsNotAccepted(data) {
        return !data.terms
      }
    }
  })

  return whenIn({
    default: <div>uh oh</div>,
    idle: (
      <div
        style={{
          opacity: whenIn({ 'form.loading': 0.5, default: 1 })
        }}
      >
        <div style={{ marginTop: 16 }}>
          <label htmlFor='username'>Username</label>
          <input
            name='username'
            value={data.username}
            onChange={(e) => {
              send('CHANGED_USERNAME', e.target.value)
            }}
          />
          <div>
            {whenIn({
              'username.valid': '',
              'username.empty': 'Please enter your username.',
              'username.tooShort': 'Your username is too short.',
              'username.hasSpaces': 'Your username must not contain spaces.'
            })}
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <label htmlFor='password'>Password</label>
          <input
            name='password'
            type='password'
            value={data.password}
            onChange={(e) => send('CHANGED_PASSWORD', e.target.value)}
          />
          <div>
            {whenIn({
              'password.valid': '',
              'password.empty': 'Please enter your password.',
              'password.tooShort': 'Your password is too short.',
              'password.hasSpaces': 'Your password must not contain spaces.'
            })}
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <label>
            <input
              type='checkbox'
              checked={isIn('terms.valid')}
              onChange={(e) => send('CHANGED_TERMS', e.target.checked)}
            />
            Terms & Conditions
          </label>
          <div>
            {whenIn({
              'terms.valid': 'Thanks!',
              'terms.invalid': 'Please confirm our terms.'
            })}
          </div>
        </div>
        <button
          disabled={!isIn('form.idle.valid')}
          style={{ marginTop: 24, width: '100%' }}
          onClick={() => send('SUBMIT')}
        >
          Submit
        </button>
      </div>
    ),
    success: (
      <div>
        <h1>Success!</h1>
        <button onClick={() => send('RESET')}>Reset</button>
      </div>
    ),
    error: (
      <div>
        <h1>Error!</h1>
        <button onClick={() => send('RESET')}>Try Again?</button>
      </div>
    )
  })
}
