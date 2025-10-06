import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  gauge: {
    width: 124,
    height: 62,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.space(1),
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  valueDisplay: {
    zIndex: 10,
    top: 26,
  },
}))
