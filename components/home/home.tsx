import { type TransactionResult, SMSService } from '@/services/sms-parsing/sms-service'
import { Transaction } from '@/types/sms/transaction'
import { formatTransactionForDisplay } from '@/utils/formatter/format-transaction-display'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { ActivityIndicator, Alert, Clipboard, ScrollView, Text, TouchableOpacity, View } from 'react-native'

const DAYS_TO_PROCESS = 90

export default function HomeScreen() {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [processingResult, setProcessingResult] = useState<TransactionResult | null>(null)

  const handleProcessSMS = async () => {
    setIsProcessing(true)
    setTransactions([])
    setProcessingResult(null)

    try {
      const result = await SMSService.processSMSMessagesLastNDays(DAYS_TO_PROCESS)

      setProcessingResult(result)
      setTransactions(result.transactions)

      if (result.success) {
        Alert.alert(
          'SMS Processing Complete',
          `Successfully processed ${result.totalSMSRead} SMS messages.\n` +
            `Found ${result.transactions.length} transactions`
        )
      }
    } catch (error) {
      Alert.alert('Error', `Failed to process SMS: ${error}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const copySMSToClipboard = (sms: string) => {
    Clipboard.setString(sms)
  }

  const renderTransaction = (transaction: Transaction, index: number) => {
    const formatted = formatTransactionForDisplay(transaction)

    return (
      <View
        key={transaction.id}
        style={{
          backgroundColor: '#f8f9fa',
          padding: 14,
          marginVertical: 6,
          marginHorizontal: 16,
          borderRadius: 10,
          borderLeftWidth: 4,
          borderLeftColor: '#28a745',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>{formatted.amount}</Text>
          <Text style={{ fontSize: 13, color: '#666', fontWeight: '500' }}>{formatted.date}</Text>
        </View>

        <Text style={{ fontSize: 15, color: '#555', marginBottom: 8, fontWeight: '500' }}>{formatted.merchant}</Text>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, color: '#888', marginBottom: 2 }}>Bank</Text>
            <Text style={{ fontSize: 13, color: '#666', fontWeight: '500' }}>{formatted.bank}</Text>
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 12, color: '#888', marginBottom: 2 }}>Category</Text>
            <Text style={{ fontSize: 13, color: '#666', fontWeight: '500' }}>{formatted.category}</Text>
          </View>
        </View>

        <View style={{ position: 'relative', marginTop: 8 }}>
          <Text
            style={{
              fontSize: 12,
              color: '#495057',
              lineHeight: 16,
              fontFamily: 'monospace',
              backgroundColor: '#ffffff',
              padding: 8,
              borderRadius: 4,
              borderWidth: 1,
              borderColor: '#dee2e6',
            }}
          >
            {transaction.message.body}
          </Text>
          <TouchableOpacity
            onPress={() => copySMSToClipboard(transaction.message.body)}
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              backgroundColor: '#007bff',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 4,
            }}
          >
            <Text style={{ fontSize: 10, color: '#ffffff', fontWeight: '500' }}>Copy</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const renderStats = () => {
    if (!processingResult) return null

    return (
      <View style={{ margin: 16, padding: 12, backgroundColor: '#e9ecef', borderRadius: 8 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>📊 Statistics</Text>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <View style={{ width: '48%', marginBottom: 4 }}>
            <Text style={{ fontSize: 12, color: '#666' }}>SMS Read</Text>
            <Text style={{ fontSize: 14, fontWeight: 'bold' }}>{processingResult.totalSMSRead}</Text>
          </View>
          <View style={{ width: '48%', marginBottom: 4 }}>
            <Text style={{ fontSize: 12, color: '#666' }}>Transactions</Text>
            <Text style={{ fontSize: 14, fontWeight: 'bold' }}>{processingResult.transactions.length}</Text>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ padding: 20, backgroundColor: '#007bff' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>
          Rose Expense Tracker
        </Text>
        <Text style={{ fontSize: 14, color: '#e3f2fd', textAlign: 'center', marginTop: 4 }}>
          SMS-Based Expense Tracking
        </Text>
      </View>

      <View style={{ padding: 20 }}>
        <TouchableOpacity
          onPress={handleProcessSMS}
          disabled={isProcessing}
          style={{
            backgroundColor: isProcessing ? '#6c757d' : '#28a745',
            padding: 16,
            borderRadius: 8,
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          {isProcessing ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ActivityIndicator
                color='#fff'
                size='small'
                style={{ marginRight: 8 }}
              />
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Processing SMS...</Text>
            </View>
          ) : (
            <Text
              style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}
            >{`Process SMS Messages (Last ${DAYS_TO_PROCESS} Days)`}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/patterns' as any)}
          style={{
            backgroundColor: '#6f42c1',
            padding: 16,
            borderRadius: 8,
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>📊 View SMS Patterns</Text>
        </TouchableOpacity>

        {processingResult && processingResult.errors.length > 0 && (
          <ScrollView
            style={{ marginBottom: 16, padding: 12, backgroundColor: '#f8d7da', borderRadius: 8, maxHeight: 100 }}
          >
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#721c24', marginBottom: 4 }}>Errors:</Text>
            {processingResult.errors.map((error, index) => (
              <Text
                key={index}
                style={{ fontSize: 12, color: '#721c24' }}
              >
                • {error}
              </Text>
            ))}
          </ScrollView>
        )}
      </View>

      {renderStats()}

      <View style={{ flex: 1, marginTop: 8 }}>
        {transactions.length > 0 && (
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', margin: 16, marginBottom: 8 }}>Recent Transactions</Text>
            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {transactions.map((transaction, index) => renderTransaction(transaction, index))}
            </ScrollView>
          </View>
        )}

        {transactions.length === 0 && !isProcessing && (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
            <Text style={{ fontSize: 16, color: '#666', textAlign: 'center' }}>
              No transactions found. Tap &quot;Process SMS Messages&quot; to get started.
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}
