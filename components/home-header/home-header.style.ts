import { makeStyles } from '@rneui/themed'

export const useStyles = makeStyles((theme) => ({
  container: {
    backgroundColor: theme.colors.accentGreen,
    height: 120,
    paddingHorizontal: 24,
    paddingVertical: 16,
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
    marginBottom: 4,
  },
  waveEmoji: {
    fontSize: 20,
    marginLeft: 8,
  },
}))
