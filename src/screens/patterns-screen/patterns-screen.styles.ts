import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.space(4),
    paddingVertical: theme.space(4),
  },
  patternsListContent: {
    rowGap: theme.gap(1),
    paddingBottom: theme.space(15),
  },
}))
