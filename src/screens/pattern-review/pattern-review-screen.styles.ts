import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    gap: theme.gap(3),
    backgroundColor: theme.colors.background,
    padding: theme.space(4),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  messageHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    height: 400,
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    gap: theme.gap(1),
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}))
