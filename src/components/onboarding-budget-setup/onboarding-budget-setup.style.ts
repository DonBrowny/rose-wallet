import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.gap(2),
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: theme.colors.grey3,
    borderRadius: 12,
    paddingHorizontal: theme.space(3),
    paddingVertical: theme.space(2),
  },
}))
