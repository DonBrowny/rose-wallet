import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  footer: {
    flexDirection: 'row',
    gap: theme.gap(1),
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}))
