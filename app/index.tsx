import { SMSProcessingResult, SMSService } from '@/services/sms-parsing/sms-service'
import { ParsedTransaction } from '@/types/sms/transaction'
import React, { useState } from 'react'
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native'

export default function HomeScreen() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [transactions, setTransactions] = useState<ParsedTransaction[]>([])
  const [processingResult, setProcessingResult] = useState<SMSProcessingResult | null>(null)

  const handleProcessSMS = async () => {
    setIsProcessing(true)
    setTransactions([])
    setProcessingResult(null)

    try {
      const result = await SMSService.processSMSMessages({
        daysBack: 15,
        includeDuplicates: true,
      })

      setProcessingResult(result)
      setTransactions(result.transactions)

      if (result.success) {
        const stats = SMSService.getProcessingStats(result)
        Alert.alert(
          'SMS Processing Complete',
          `Successfully processed ${result.totalSMSRead} SMS messages.\n` +
            `Found ${result.totalTransactionsParsed} transactions.\n` +
            `Success rate: ${stats.successRate}%\n` +
            `Duplicates: ${result.duplicatesFound}`
        )
      } else {
        Alert.alert('SMS Processing Failed', result.errors.join('\n'))
      }
    } catch (error) {
      Alert.alert('Error', `Failed to process SMS: ${error}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const renderTransaction = (transaction: ParsedTransaction, index: number) => {
    const formatted = SMSService.formatTransactionForDisplay(transaction)

    return (
      <View
        key={transaction.id}
        style={{
          backgroundColor: transaction.isDuplicate ? '#fff3cd' : '#f8f9fa',
          padding: 12,
          marginVertical: 4,
          marginHorizontal: 16,
          borderRadius: 8,
          borderLeftWidth: 4,
          borderLeftColor: transaction.isDuplicate ? '#ffc107' : '#28a745',
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>{formatted.amount}</Text>
          <Text style={{ fontSize: 12, color: '#666' }}>{formatted.date}</Text>
        </View>

        <Text style={{ fontSize: 14, color: '#555', marginTop: 4 }}>{formatted.merchant}</Text>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
          <Text style={{ fontSize: 12, color: '#666' }}>{formatted.bank}</Text>
          <Text style={{ fontSize: 12, color: '#666' }}>{formatted.category}</Text>
        </View>

        {transaction.isDuplicate && (
          <Text style={{ fontSize: 12, color: '#856404', marginTop: 4, fontStyle: 'italic' }}>
            ⚠️ Duplicate transaction
          </Text>
        )}
      </View>
    )
  }

  const renderStats = () => {
    if (!processingResult) return null

    const stats = SMSService.getProcessingStats(processingResult)
    const totalSpending = SMSService.getTotalSpending(transactions)
    const spendingByCategory = SMSService.getSpendingByCategory(transactions)

    return (
      <View style={{ margin: 16, padding: 16, backgroundColor: '#e9ecef', borderRadius: 8 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Processing Statistics</Text>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text>SMS Messages Read:</Text>
          <Text style={{ fontWeight: 'bold' }}>{processingResult.totalSMSRead}</Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text>Transactions Found:</Text>
          <Text style={{ fontWeight: 'bold' }}>{processingResult.totalTransactionsParsed}</Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text>Success Rate:</Text>
          <Text style={{ fontWeight: 'bold' }}>{stats.successRate}%</Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text>Duplicates:</Text>
          <Text style={{ fontWeight: 'bold' }}>{processingResult.duplicatesFound}</Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
          <Text>Total Spending:</Text>
          <Text style={{ fontWeight: 'bold', color: '#dc3545' }}>₹{totalSpending.toFixed(2)}</Text>
        </View>

        {Object.keys(spendingByCategory).length > 0 && (
          <View>
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>Spending by Category:</Text>
            {Object.entries(spendingByCategory).map(([category, amount]) => (
              <View
                key={category}
                style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}
              >
                <Text style={{ fontSize: 12 }}>{category}:</Text>
                <Text style={{ fontSize: 12, fontWeight: 'bold' }}>₹{amount.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        )}
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
            marginBottom: 20,
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
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Process SMS Messages (Last 15 Days)</Text>
          )}
        </TouchableOpacity>

        {processingResult && processingResult.errors.length > 0 && (
          <View style={{ marginBottom: 16, padding: 12, backgroundColor: '#f8d7da', borderRadius: 8 }}>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#721c24', marginBottom: 4 }}>Errors:</Text>
            {processingResult.errors.map((error, index) => (
              <Text
                key={index}
                style={{ fontSize: 12, color: '#721c24' }}
              >
                • {error}
              </Text>
            ))}
          </View>
        )}
      </View>

      {renderStats()}

      <ScrollView style={{ flex: 1 }}>
        {transactions.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', margin: 16, marginBottom: 8 }}>Recent Transactions</Text>
            {transactions.map((transaction, index) => renderTransaction(transaction, index))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}
