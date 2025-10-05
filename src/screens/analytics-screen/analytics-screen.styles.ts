import { makeStyles } from '@rneui/themed'

export const useStyles = makeStyles((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 12,
  },
  underConstructionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 40,
    marginTop: 12,
    marginBottom: 100,
  },
  constructionImage: {
    width: 250,
    height: 250,
  },
  constructionTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  constructionDescription: {
    textAlign: 'center',
    marginBottom: 16,
  },
  comingSoonButton: {
    backgroundColor: theme.colors.grey4,
    paddingHorizontal: 24,
    paddingVertical: 12,
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
  comingSoonButtonText: {
    color: theme.colors.grey2,
    fontWeight: '600',
    fontSize: 14,
  },
  iconContainer: {
    marginRight: 8,
  },
}))
