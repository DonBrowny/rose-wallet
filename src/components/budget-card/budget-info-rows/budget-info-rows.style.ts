import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  rightSection: {
    flex: 1,
    gap: theme.gap(1),
  },
  infoRow: {
    paddingVertical: theme.space(1),
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
}))
