import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.space(3),
  },
  underConstructionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: theme.space(10),
    marginTop: theme.space(3),
    marginBottom: 100,
  },
  constructionImage: {
    width: 250,
    height: 250,
  },
  constructionTitle: {
    marginBottom: theme.space(2),
    textAlign: 'center',
  },
  constructionDescription: {
    textAlign: 'center',
    marginBottom: theme.space(4),
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space(2),
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.space(5),
    paddingVertical: theme.space(3),
    borderRadius: 25,
  },
  comingSoonButton: {
    backgroundColor: theme.colors.grey4,
    paddingHorizontal: theme.space(6),
    paddingVertical: theme.space(3),
    borderRadius: 25,
    shadowColor: theme.colors.grey3,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    marginRight: theme.space(2),
  },
}))
