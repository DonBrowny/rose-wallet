import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.accentGreen,
    height: 120,
    paddingHorizontal: theme.space(6),
    paddingVertical: theme.space(4),
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    ...theme.elevation[2],
  },
  content: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
    height: '100%',
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.space(1),
  },
  waveEmoji: {
    fontSize: theme.typography.size.h5,
    marginLeft: theme.space(2),
  },
}))
