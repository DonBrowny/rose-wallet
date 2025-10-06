import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.space(1),
    paddingHorizontal: theme.space(3),
    borderRadius: 30,
    overflow: 'hidden',
  },
}))
