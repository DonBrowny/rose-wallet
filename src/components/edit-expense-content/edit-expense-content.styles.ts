import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  scrollContent: {
    gap: theme.gap(2),
  },
  title: {
    textAlign: 'center',
  },
  smsSection: {
    backgroundColor: theme.colors.grey0,
    borderRadius: 12,
    padding: theme.space(3),
  },
  smsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space(2),
    marginBottom: theme.space(2),
  },
  smsIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: theme.colors.accentBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smsMeta: {
    flex: 1,
  },
  smsBodyScroll: {
    maxHeight: 120,
  },
  smsBody: {
    lineHeight: 20,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.gap(2),
  },
  button: {
    flex: 1,
  },
}))
