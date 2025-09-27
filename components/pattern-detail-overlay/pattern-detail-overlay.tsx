import { Text } from '@/components/ui/text'
import type { DistinctPattern } from '@/types/sms/transaction'
import { Button, Input, useTheme } from '@rneui/themed'
import { Edit3, X } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { Modal, Pressable, View } from 'react-native'
import { useStyles } from './pattern-detail-overlay.styles'

interface PatternDetailOverlayProps {
  pattern: DistinctPattern | null
  isVisible: boolean
  onClose: () => void
}

export const PatternDetailOverlay = ({ pattern, isVisible, onClose }: PatternDetailOverlayProps) => {
  const styles = useStyles()
  const { theme } = useTheme()
  const [editableAmount, setEditableAmount] = useState<string>('')
  const [editableMerchant, setEditableMerchant] = useState<string>('')

  // Initialize editable values when pattern changes
  useEffect(() => {
    if (pattern) {
      const firstTransaction = pattern.transactions[0]
      setEditableAmount(firstTransaction.amount.toString())
      setEditableMerchant(firstTransaction.merchant)
    }
  }, [pattern])

  if (!pattern) return null

  const firstTransaction = pattern.transactions[0]

  // Function to highlight merchant and amount in SMS text by comparing with extracted data
  const highlightSMSContent = (smsText: string, merchant: string, amount: number) => {
    const amountStr = amount.toLocaleString('en-IN')

    // Find merchant and amount in the SMS text
    const merchantIndex = smsText.toUpperCase().indexOf(merchant.toUpperCase())
    const amountIndex = smsText.indexOf(amountStr)

    // Create array of text parts with highlighting
    const parts = []
    let lastIndex = 0

    // Sort positions to process them in order
    const positions = [
      { index: merchantIndex, text: merchant, type: 'merchant' },
      { index: amountIndex, text: amountStr, type: 'amount' },
    ]
      .filter((pos) => pos.index !== -1)
      .sort((a, b) => a.index - b.index)

    positions.forEach((pos, i) => {
      // Add text before the highlighted part
      if (pos.index > lastIndex) {
        parts.push(smsText.slice(lastIndex, pos.index))
      }

      // Add the highlighted part
      parts.push(
        <Text
          key={`${pos.type}-${i}`}
          style={styles.highlightedText}
        >
          {pos.text}
        </Text>
      )

      lastIndex = pos.index + pos.text.length
    })

    // Add remaining text
    if (lastIndex < smsText.length) {
      parts.push(smsText.slice(lastIndex))
    }

    return parts.length > 0 ? parts : smsText
  }

  return (
    <Modal
      animationType='slide'
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
        />
        <View style={styles.modalView}>
          {/* Header */}
          <View style={styles.header}>
            <Text variant='pLgBold'>Pattern Details</Text>
            <Button
              onPress={onClose}
              buttonStyle={styles.closeButton}
              icon={
                <X
                  size={24}
                  color={theme.colors.white}
                />
              }
            />
          </View>

          {/* SMS Section */}
          <View style={styles.section}>
            <View style={styles.smsHeader}>
              <Text variant='pMdBold'>SMS</Text>
              <Text variant='pSm'>
                {firstTransaction.transactionDate.toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
            <Text style={styles.smsText}>
              {highlightSMSContent(firstTransaction.message.body, firstTransaction.merchant, firstTransaction.amount)}
            </Text>
          </View>

          {/* Extracted Data Section */}
          <View style={styles.sectionHeader}>
            <Text variant='pMdBold'>Extracted Data</Text>
            <View style={styles.confidenceChip}>
              <Text variant='pSm'>{(pattern.confidence * 100).toFixed(1)}% confidence</Text>
            </View>
          </View>

          {/* Scrollable Content */}
          <View style={styles.section}>
            {/* Bank Info */}
            <View style={styles.detailRow}>
              <Text
                variant='pMd'
                style={styles.detailLabel}
              >
                Bank
              </Text>
              <Text style={styles.detailValue}>{firstTransaction.bankName}</Text>
            </View>

            {/* Amount Input */}
            <View style={styles.editableRow}>
              <Text style={styles.detailLabel}>Amount</Text>
              <Input
                value={editableAmount}
                onChangeText={setEditableAmount}
                inputStyle={styles.inputField}
                keyboardType='numeric'
                rightIcon={
                  <Edit3
                    size={16}
                    color={theme.colors.grey3}
                  />
                }
              />
            </View>

            {/* Merchant Input */}
            <View style={styles.editableRow}>
              <Text style={styles.detailLabel}>Merchant</Text>
              <Input
                value={editableMerchant}
                onChangeText={setEditableMerchant}
                inputStyle={styles.inputField}
                placeholder='Enter merchant name'
                rightIcon={
                  <Edit3
                    size={16}
                    color={theme.colors.grey3}
                  />
                }
              />
            </View>
          </View>

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <Button
              title='Save Changes'
              radius='xl'
              // buttonStyle={styles.saveButton}
              titleStyle={styles.buttonText}
              onPress={() => {
                console.log('Save changes:', { amount: editableAmount, merchant: editableMerchant })
                onClose()
              }}
            />
            <Button
              title='Cancel'
              type='outline'
              buttonStyle={styles.cancelButton}
              titleStyle={styles.buttonText}
              onPress={onClose}
            />
          </View>
        </View>
      </View>
    </Modal>
  )
}
