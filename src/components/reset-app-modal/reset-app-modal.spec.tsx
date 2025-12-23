import { fireEvent, render } from '@testing-library/react-native'
import React from 'react'
import { ResetAppModal } from './reset-app-modal'

const mockResetApp = jest.fn()
const mockReloadAppAsync = jest.fn()

jest.mock('@/services/reset-app-service', () => ({
  resetApp: () => mockResetApp(),
}))

jest.mock('expo', () => ({
  reloadAppAsync: (reason: string) => mockReloadAppAsync(reason),
}))

describe('ResetAppModal', () => {
  const mockOnCancel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the modal when visible', () => {
    const { getByText } = render(
      <ResetAppModal
        isVisible={true}
        onCancel={mockOnCancel}
      />
    )

    expect(getByText('Reset App?')).toBeTruthy()
    expect(getByText(/This will delete all your data/)).toBeTruthy()
  })

  it('renders Cancel and Reset buttons', () => {
    const { getByText } = render(
      <ResetAppModal
        isVisible={true}
        onCancel={mockOnCancel}
      />
    )

    expect(getByText('Cancel')).toBeTruthy()
    expect(getByText('Reset')).toBeTruthy()
  })

  it('calls onCancel when Cancel button is pressed', () => {
    const { getByText } = render(
      <ResetAppModal
        isVisible={true}
        onCancel={mockOnCancel}
      />
    )

    fireEvent.press(getByText('Cancel'))

    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })

  it('calls resetApp and reloadAppAsync when Reset button is pressed', () => {
    const { getByText } = render(
      <ResetAppModal
        isVisible={true}
        onCancel={mockOnCancel}
      />
    )

    fireEvent.press(getByText('Reset'))

    expect(mockResetApp).toHaveBeenCalledTimes(1)
    expect(mockReloadAppAsync).toHaveBeenCalledWith('Reset app data')
  })

  it('disables Cancel button while resetting', () => {
    const { getByText } = render(
      <ResetAppModal
        isVisible={true}
        onCancel={mockOnCancel}
      />
    )

    fireEvent.press(getByText('Reset'))

    // After pressing reset, cancel should be disabled
    const cancelButton = getByText('Cancel')
    fireEvent.press(cancelButton)

    // onCancel should only have been called 0 times since button is disabled
    expect(mockOnCancel).not.toHaveBeenCalled()
  })

  it('shows warning text about data deletion', () => {
    const { getByText } = render(
      <ResetAppModal
        isVisible={true}
        onCancel={mockOnCancel}
      />
    )

    expect(getByText(/transactions, patterns, categories, and settings/)).toBeTruthy()
    expect(getByText(/This action cannot be undone/)).toBeTruthy()
  })
})
