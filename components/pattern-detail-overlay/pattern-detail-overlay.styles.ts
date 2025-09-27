import { makeStyles } from '@rneui/themed'

export const useStyles = makeStyles((theme) => ({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalView: {
    margin: 12,
    backgroundColor: theme.colors.white,
    borderRadius: 24,
    width: '90%',
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.grey2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.grey2,
    padding: 0,
    margin: 0,
  },
  section: {
    paddingHorizontal: 16,
    gap: 12,
  },
  smsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  smsText: {
    fontStyle: 'italic',
  },
  highlightedText: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  confidenceChip: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editableRow: {
    flexDirection: 'column',
    gap: 8,
  },
  detailLabel: {
    color: theme.colors.grey4,
  },
  detailValue: {
    fontSize: 16,
    color: theme.colors.black,
    fontWeight: '500',
  },
  inputField: {
    fontFamily: theme.typography.family.regular,
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.grey2,
  },
  cancelButton: {
    borderRadius: 24,
  },
  buttonText: {
    fontFamily: theme.typography.family.regular,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 24,
    flex: 1,
  },
  disabledButton: {
    backgroundColor: theme.colors.grey2,
    opacity: 0.6,
  },
}))
