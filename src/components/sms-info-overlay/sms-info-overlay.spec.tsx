import { fireEvent, render } from '@testing-library/react-native'
import React from 'react'
import { Linking } from 'react-native'
import { SmsInfoOverlay } from './sms-info-overlay'

jest.spyOn(Linking, 'openURL').mockImplementation(jest.fn())

describe('SmsInfoOverlay', () => {
  const mockOnClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders title and content when visible', () => {
    const { getByText } = render(
      <SmsInfoOverlay
        isVisible={true}
        onClose={mockOnClose}
      />
    )

    expect(getByText('Why we need SMS access')).toBeTruthy()
    expect(getByText(/We only process SMS from verified financial senders/)).toBeTruthy()
    expect(getByText('Got it')).toBeTruthy()
  })

  it('does not render content when not visible', () => {
    const { queryByText } = render(
      <SmsInfoOverlay
        isVisible={false}
        onClose={mockOnClose}
      />
    )

    expect(queryByText('Why we need SMS access')).toBeNull()
  })

  it('calls onClose when Got it button is pressed', () => {
    const { getByText } = render(
      <SmsInfoOverlay
        isVisible={true}
        onClose={mockOnClose}
      />
    )

    fireEvent.press(getByText('Got it'))
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('renders all informational text sections', () => {
    const { getByText } = render(
      <SmsInfoOverlay
        isVisible={true}
        onClose={mockOnClose}
      />
    )

    expect(getByText(/ignore OTPs, promotions, and personal chats/)).toBeTruthy()
    expect(getByText(/extract the data from the sms and generate patterns/)).toBeTruthy()
    expect(getByText(/bank name, amount, date and merchant name/)).toBeTruthy()
    expect(getByText(/Nothing leaves your device/)).toBeTruthy()
    expect(getByText(/revoke SMS permission anytime/)).toBeTruthy()
  })

  it('opens email client when email link is pressed', () => {
    const { getByText } = render(
      <SmsInfoOverlay
        isVisible={true}
        onClose={mockOnClose}
      />
    )

    fireEvent.press(getByText('kishore13ask@gmail.com'))
    expect(Linking.openURL).toHaveBeenCalledWith('mailto:kishore13ask@gmail.com')
  })
})
