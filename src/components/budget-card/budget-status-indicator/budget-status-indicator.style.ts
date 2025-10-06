import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.space(2),
    paddingVertical: theme.space(1),
    borderRadius: 16,
    gap: theme.gap(1),
  },
}))
