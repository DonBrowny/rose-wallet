import { makeStyles } from '@rneui/themed'

export const useStyles = makeStyles((theme) => ({
  container: {
    position: 'absolute',
    alignItems: 'flex-end',
    backgroundColor: theme.colors.accentGreen,
    height: 136,
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    ...theme.elevation[2],
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: '100%',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  greetingText: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.black,
    fontFamily: 'Manrope_700Bold',
    marginBottom: 2,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '400',
    color: theme.colors.black,
    fontFamily: 'Manrope_400Regular',
  },
}))
