import { SMSService } from '@/services/sms-parsing/sms-service'
import type { DistinctPattern, Transaction } from '@/types/sms/transaction'
import React, { useState } from 'react'
import { ActivityIndicator, Alert, Clipboard, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const DAYS_TO_PROCESS = 30

export default function PatternsScreen() {
  const [patterns, setPatterns] = useState<DistinctPattern[]>([])
  const [processingResult, setProcessingResult] = useState<any>(null)
  const [expandedPatterns, setExpandedPatterns] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)

  const handleProcessPatterns = async () => {
    setIsLoading(true)
    try {
      const result = await SMSService.getDistinctSMSMessagesLastNDays(DAYS_TO_PROCESS)
      setProcessingResult(result)
      setPatterns(result.distinctPatterns)
    } catch (error) {
      Alert.alert('Error', 'Failed to process SMS patterns')
      console.error('Error processing patterns:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const togglePatternExpansion = (patternId: string) => {
    const newExpanded = new Set(expandedPatterns)
    if (newExpanded.has(patternId)) {
      newExpanded.delete(patternId)
    } else {
      newExpanded.add(patternId)
    }
    setExpandedPatterns(newExpanded)
  }

  const copySMSToClipboard = (sms: string) => {
    Clipboard.setString(sms)
    Alert.alert('Copied', 'SMS copied to clipboard')
  }

  const copyAllSMSToClipboard = (transactions: Transaction[]) => {
    const allSMS = transactions.map((t) => t.message.body).join('\n\n---\n\n')
    Clipboard.setString(allSMS)
    Alert.alert('Copied', 'All SMS messages copied to clipboard')
  }

  const renderPattern = (pattern: DistinctPattern, index: number) => {
    const isExpanded = expandedPatterns.has(pattern.id)

    return (
      <View
        key={pattern.id}
        style={styles.patternCard}
      >
        <TouchableOpacity
          style={styles.patternHeader}
          onPress={() => togglePatternExpansion(pattern.id)}
        >
          <View style={styles.patternHeaderContent}>
            <Text style={styles.patternType}>{pattern.patternType}</Text>
            <Text style={styles.patternOccurrences}>
              {pattern.occurrences} occurrence{pattern.occurrences !== 1 ? 's' : ''}
            </Text>
            <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
          </View>
          <Text style={styles.patternTemplate}>{pattern.template}</Text>
          <Text style={styles.patternConfidence}>Confidence: {(pattern.confidence * 100).toFixed(1)}%</Text>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.patternDetails}>
            <View style={styles.patternActions}>
              <TouchableOpacity
                style={styles.copyAllButton}
                onPress={() => copyAllSMSToClipboard(pattern.transactions)}
              >
                <Text style={styles.copyAllButtonText}>Copy All Messages</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.allMessagesTitle}>All Messages ({pattern.transactions.length})</Text>
            {pattern.transactions.map((transaction, txnIndex) => (
              <View
                key={`${transaction.id}_${txnIndex}`}
                style={styles.messageItem}
              >
                <View style={styles.messageHeader}>
                  <Text style={styles.messageDate}>{transaction.transactionDate.toLocaleDateString()}</Text>
                  <Text style={styles.messageAmount}>
                    {transaction.transactionType === 'debit' ? '-' : '+'}₹{transaction.amount}
                  </Text>
                </View>
                <Text style={styles.messageMerchant}>{transaction.merchant}</Text>
                <Text style={styles.messageBank}>{transaction.bankName}</Text>
                <Text
                  style={styles.messageBody}
                  numberOfLines={3}
                >
                  {transaction.message.body}
                </Text>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={() => copySMSToClipboard(transaction.message.body)}
                >
                  <Text style={styles.copyButtonText}>Copy</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
    )
  }

  const renderStats = () => {
    if (!processingResult) return null

    return (
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>📊 SMS Service Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{processingResult.totalSMSRead}</Text>
            <Text style={styles.statLabel}>Total SMS Read</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{processingResult.totalPatterns}</Text>
            <Text style={styles.statLabel}>Distinct Patterns</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{patterns.reduce((sum, p) => sum + p.occurrences, 0)}</Text>
            <Text style={styles.statLabel}>Total Transactions</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{processingResult.errors.length}</Text>
            <Text style={styles.statLabel}>Errors</Text>
          </View>
        </View>
      </View>
    )
  }

  const renderPatternTypeBreakdown = () => {
    const typeCounts = patterns.reduce(
      (acc, pattern) => {
        acc[pattern.patternType] = (acc[pattern.patternType] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const typeColors = {
      UPI_TRANSACTION: '#4CAF50',
      CARD_TRANSACTION: '#2196F3',
      ATM_TRANSACTION: '#FF9800',
      IMPS_TRANSACTION: '#9C27B0',
      NEFT_TRANSACTION: '#F44336',
      RTGS_TRANSACTION: '#795548',
      EMI_TRANSACTION: '#607D8B',
      SIP_TRANSACTION: '#E91E63',
      GENERAL_TRANSACTION: '#9E9E9E',
    }

    return (
      <View style={styles.breakdownContainer}>
        <Text style={styles.breakdownTitle}>🔍 Pattern Type Breakdown</Text>
        {Object.entries(typeCounts).map(([type, count]) => (
          <View
            key={type}
            style={styles.breakdownItem}
          >
            <View
              style={[
                styles.breakdownColor,
                { backgroundColor: typeColors[type as keyof typeof typeColors] || '#9E9E9E' },
              ]}
            />
            <Text style={styles.breakdownType}>{type.replace('_', ' ')}</Text>
            <Text style={styles.breakdownCount}>{count}</Text>
          </View>
        ))}
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔬SMS Patterns</Text>
        <Text style={styles.subtitle}>Using SMS Data Extractor Service</Text>
      </View>

      <TouchableOpacity
        style={[styles.processButton, isLoading && styles.processButtonDisabled]}
        onPress={handleProcessPatterns}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color='#fff' />
        ) : (
          <Text style={styles.processButtonText}>{`🔍 Analyze Last ${DAYS_TO_PROCESS} Days`}</Text>
        )}
      </TouchableOpacity>

      {renderStats()}
      {renderPatternTypeBreakdown()}

      <View style={styles.patternsContainer}>
        <Text style={styles.patternsTitle}>📋 Distinct Patterns ({patterns.length})</Text>
        {patterns.map((pattern, index) => renderPattern(pattern, index))}
      </View>

      {patterns.length === 0 && !isLoading && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            {`No patterns found. Tap Analyze Last ${DAYS_TO_PROCESS} Days to start processing SMS messages.`}
          </Text>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  processButton: {
    backgroundColor: '#007AFF',
    margin: 20,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  processButtonDisabled: {
    backgroundColor: '#ccc',
  },
  processButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  breakdownContainer: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  breakdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  breakdownColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  breakdownType: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  breakdownCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  patternsContainer: {
    padding: 20,
  },
  patternsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  patternCard: {
    backgroundColor: '#fff',
    marginBottom: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  patternHeader: {
    padding: 16,
  },
  patternHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  patternType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  patternOccurrences: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  expandIcon: {
    fontSize: 12,
    color: '#666',
  },
  patternTemplate: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  patternConfidence: {
    fontSize: 12,
    color: '#999',
  },
  patternDetails: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    padding: 16,
  },
  patternActions: {
    marginBottom: 16,
  },
  copyAllButton: {
    backgroundColor: '#28a745',
    padding: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  copyAllButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  allMessagesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  messageItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  messageDate: {
    fontSize: 12,
    color: '#666',
  },
  messageAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  messageMerchant: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  messageBank: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  messageBody: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  copyButton: {
    backgroundColor: '#007AFF',
    padding: 6,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  copyButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
})
