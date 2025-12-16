import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: theme.space(3),
    alignSelf: 'center',
    justifyContent: 'space-between',
    ...theme.elevation[2],
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.space(2),
  },
  footerRow: { gap: 12, marginTop: 8 },
}))
