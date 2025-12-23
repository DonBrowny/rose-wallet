import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    paddingHorizontal: theme.space(4),
    paddingTop: theme.space(4),
  },
  header: {
    gap: theme.gap(1),
    marginBottom: theme.space(4),
  },
  checklistContainer: {
    gap: theme.gap(2),
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: theme.space(4),
  },
}))
