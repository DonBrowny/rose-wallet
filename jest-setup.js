require('react-native-reanimated').setUpTests()

// Global mock for lottie-react-native to avoid native/animation internals in unit tests
jest.mock('lottie-react-native', () => {
  const React = require('react')
  const { View } = require('react-native')
  return (props) => React.createElement(View, { testID: 'lottie-view', ...props })
})
