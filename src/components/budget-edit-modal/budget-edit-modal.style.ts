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
    gap: 16,
  },
  overlayTitle: {
    textAlign: 'center',
  },
  overlayButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
}))
