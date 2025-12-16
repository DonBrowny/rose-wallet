import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    ...theme.elevation[2],
  },
  amountSection: {
    alignItems: 'center',
    paddingVertical: theme.space(5),
    paddingHorizontal: theme.space(4),
    backgroundColor: theme.colors.primary,
  },
  amountLabel: {
    marginBottom: theme.space(1),
  },
  amount: {
    color: theme.colors.surface,
  },
  merchantDetected: {
    marginTop: theme.space(2),
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space(1),
  },
  merchantText: { color: theme.colors.surface, opacity: 0.8 },
  smsSection: {
    padding: theme.space(4),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.grey1,
  },
  smsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space(2),
    marginBottom: theme.space(3),
  },
  smsIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: theme.colors.accentBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smsMeta: {
    flex: 1,
  },
  smsBody: {
    backgroundColor: theme.colors.grey0,
    borderRadius: 12,
    padding: theme.space(3),
    lineHeight: 22,
  },
  inputsSection: {
    padding: theme.space(4),
    gap: theme.space(3),
  },
  inputRow: {
    flexDirection: 'row',
    gap: theme.space(3),
  },
  inputHalf: {
    flex: 1,
  },
}))
