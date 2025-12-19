import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  scrollView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    gap: theme.gap(2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: { width: 200, height: 200 },
  list: {
    alignSelf: 'stretch',
    marginTop: theme.space(2),
    paddingHorizontal: theme.space(2),
    gap: theme.gap(1),
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.gap(1),
  },
  bulletText: {
    flex: 1,
    textAlign: 'left',
  },
  linkText: {
    textDecorationLine: 'underline',
  },
}))
