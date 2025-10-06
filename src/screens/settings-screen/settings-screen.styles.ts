import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    flex: 1,
    paddingTop: theme.space(3),
    paddingHorizontal: theme.space(4),
    gap: theme.gap(3),
  },
  title: {
    marginBottom: theme.space(2),
  },
}))
