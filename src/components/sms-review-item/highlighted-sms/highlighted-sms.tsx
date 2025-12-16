import { Text } from '@/components/ui/text/text'
import React, { useMemo } from 'react'

interface HighlightedSMSProps {
  text: string
  merchant: string
  amount: number
}

export function HighlightedSMS({ text, merchant, amount }: HighlightedSMSProps) {
  const content = useMemo(() => {
    const smsText = text
    const amountStr = amount.toLocaleString('en-IN')

    const parts: (string | React.ReactNode)[] = []
    const indices: { index: number; length: number; key: string }[] = []

    const merchantIndex = merchant ? smsText.toUpperCase().indexOf(merchant.toUpperCase()) : -1
    if (merchantIndex !== -1) indices.push({ index: merchantIndex, length: merchant.length, key: 'merchant' })

    const amountIndex = smsText.indexOf(amountStr)
    if (amountIndex !== -1) indices.push({ index: amountIndex, length: amountStr.length, key: 'amount' })

    indices.sort((a, b) => a.index - b.index)

    let cursor = 0
    indices.forEach((pos, i) => {
      if (pos.index > cursor) parts.push(smsText.slice(cursor, pos.index))
      parts.push(
        <Text
          testID='highlight'
          key={`${pos.key}-${i}`}
          variant='pMdBold'
          color='primary'
        >
          {smsText.slice(pos.index, pos.index + pos.length)}
        </Text>
      )
      cursor = pos.index + pos.length
    })
    if (cursor < smsText.length) parts.push(smsText.slice(cursor))

    return parts.length > 0 ? parts : smsText
  }, [text, merchant, amount])

  return (
    <Text
      testID='highlighted-sms'
      variant='pMd'
      selectable
    >
      {content}
    </Text>
  )
}
