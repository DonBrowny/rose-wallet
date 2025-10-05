import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: theme.space(4),
    ...theme.elevation[2],
  },
}))
