/* global jest */
require('react-native-reanimated').setUpTests()

// Global mock for lottie-react-native to avoid native/animation internals in unit tests
jest.mock('lottie-react-native', () => {
  const React = require('react')
  const { View } = require('react-native')
  function LottieMock(props) {
    return React.createElement(View, { testID: 'lottie-view', ...props })
  }
  LottieMock.displayName = 'LottieMock'
  return LottieMock
})

// Mock zustand immer middleware to behave as a no-proxy mutate helper in tests
// It converts set(fn) where fn mutates a draft into a full state replacement
jest.mock('zustand/middleware/immer', () => ({
  __esModule: true,
  immer: (initializer) => (set, get, api) => {
    const deepClone = (value) => {
      if (Array.isArray(value)) return value.map(deepClone)
      if (value && typeof value === 'object') {
        const out = {}
        for (const key of Object.keys(value)) out[key] = deepClone(value[key])
        return out
      }
      return value
    }
    return initializer(
      (fnOrPartial, replace) => {
        if (typeof fnOrPartial === 'function') {
          const draft = deepClone(get())
          fnOrPartial(draft)
          set(draft, true)
          return
        }
        set(fnOrPartial, replace)
      },
      get,
      api
    )
  },
}))
