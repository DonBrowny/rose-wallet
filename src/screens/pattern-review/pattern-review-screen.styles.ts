import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.space(4),
    gap: theme.gap(3),
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.space(2),
    gap: theme.gap(3),
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
