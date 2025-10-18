import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    paddingHorizontal: theme.space(6),
    backgroundColor: theme.colors.background,
  },
  stepper: {
    marginBottom: theme.space(6),
  },
  content: {
    flex: 1,
    gap: theme.gap(2),
    paddingHorizontal: theme.space(6),
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.space(4),
  },
  footerButton: {
    width: 120,
    marginBottom: theme.space(6),
    paddingHorizontal: theme.space(6),
  },
  buttonContainer: {
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: theme.space(6),
    paddingHorizontal: theme.space(6),
  },

  startButton: {
    width: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaButton: {
    width: 200,
  },
}))
