import { makeStyles } from '@rneui/themed'

export const useStyles = makeStyles((theme) => ({
  overlay: {
    borderRadius: 16,
    padding: 0,
    width: '90%',
    maxWidth: 360,
  },
  overlayContent: {
    padding: 20,
  },
  overlayTitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  overlayButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
}))
