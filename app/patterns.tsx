import { SMSAlternativeService } from '@/services/sms-parsing/sms-alternative-service'
import { DistinctPattern, PatternRecognitionResult } from '@/types/sms/transaction'
import React, { useState } from 'react'
import { ActivityIndicator, Alert, Clipboard, ScrollView, Text, TouchableOpacity, View } from 'react-native'

const DAYS_TO_PROCESS = 30

export default function PatternsScreen() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [patterns, setPatterns] = useState<DistinctPattern[]>([])
  const [processingResult, setProcessingResult] = useState<PatternRecognitionResult | null>(null)
  const [expandedPatterns, setExpandedPatterns] = useState<Set<string>>(new Set())

  const handleProcessPatterns = async () => {
    setIsProcessing(true)
    setPatterns([])
    setProcessingResult(null)
    setExpandedPatterns(new Set())

    try {
      const result = await SMSAlternativeService.getInstance().getDistinctSMSMessagesLastNDays(DAYS_TO_PROCESS)

      setProcessingResult(result)
      setPatterns(result.distinctPatterns)

      if (result.success) {
        Alert.alert(
          'Pattern Recognition Complete',
          `Successfully processed ${result.totalSMSRead} SMS messages.\n` +
            `Found ${result.totalPatterns} distinct patterns.\n` +
            `Average ${Math.round(result.totalSMSRead / result.totalPatterns)} SMS per pattern`
        )
      }
    } catch (error) {
      Alert.alert('Error', `Failed to process patterns: ${error}`)
    } finally {
      setIsProcessing(false)
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

  const copySMSToClipboard = async (sms: string) => {
    try {
      await Clipboard.setString(sms)
      Alert.alert('Copied', 'SMS copied to clipboard')
    } catch {
      Alert.alert('Error', 'Failed to copy SMS to clipboard')
    }
  }

  const getPatternTypeColor = (patternType: string): string => {
    switch (patternType) {
      case 'UPI_DEBIT':
        return '#dc3545'
      case 'UPI_CREDIT':
        return '#28a745'
      case 'CARD_DEBIT':
        return '#fd7e14'
      case 'CARD_CREDIT':
        return '#20c997'
      case 'BALANCE_ALERT_LOW':
        return '#ffc107'
      case 'BALANCE_ALERT_HIGH':
        return '#17a2b8'
      case 'BANK_TRANSFER':
        return '#6f42c1'
      case 'LOAN_TRANSACTION':
        return '#e83e8c'
      case 'WALLET_TRANSACTION':
        return '#fd7e14'
      default:
        return '#6c757d'
    }
  }

  const getPatternTypeIcon = (patternType: string): string => {
    switch (patternType) {
      case 'UPI_DEBIT':
        return '💸'
      case 'UPI_CREDIT':
        return '💰'
      case 'CARD_DEBIT':
        return '💳'
      case 'CARD_CREDIT':
        return '💳'
      case 'BALANCE_ALERT_LOW':
        return '⚠️'
      case 'BALANCE_ALERT_HIGH':
        return '✅'
      case 'BANK_TRANSFER':
        return '🏦'
      case 'LOAN_TRANSACTION':
        return '🏠'
      case 'WALLET_TRANSACTION':
        return '📱'
      default:
        return '📄'
    }
  }

  const renderPattern = (pattern: DistinctPattern, index: number) => {
    const typeColor = getPatternTypeColor(pattern.patternType)
    const typeIcon = getPatternTypeIcon(pattern.patternType)
    const isExpanded = expandedPatterns.has(pattern.id)

    return (
      <View
        key={pattern.id}
        style={{
          backgroundColor: '#f8f9fa',
          padding: 16,
          marginVertical: 8,
          marginHorizontal: 16,
          borderRadius: 12,
          borderLeftWidth: 4,
          borderLeftColor: typeColor,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        {/* Pattern Header */}
        <TouchableOpacity
          onPress={() => togglePatternExpansion(pattern.id)}
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 20, marginRight: 8 }}>{typeIcon}</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: typeColor }}>
              {pattern.patternType.replace('_', ' ')}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                backgroundColor: typeColor,
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
                marginRight: 8,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>{pattern.occurrences} SMS</Text>
            </View>
            <Text style={{ fontSize: 16, color: typeColor }}>{isExpanded ? '▼' : '▶'}</Text>
          </View>
        </TouchableOpacity>

        {/* Pattern Template */}
        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 4 }}>Template:</Text>
          <Text
            style={{
              fontSize: 12,
              color: '#666',
              backgroundColor: '#e9ecef',
              padding: 8,
              borderRadius: 6,
              fontFamily: 'monospace',
            }}
          >
            {pattern.template}
          </Text>
        </View>

        {/* Variable Fields */}
        {pattern.variableFields.length > 0 && (
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 4 }}>Variable Fields:</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {pattern.variableFields.map((field, fieldIndex) => (
                <View
                  key={fieldIndex}
                  style={{
                    backgroundColor: '#007bff',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12,
                    marginRight: 6,
                    marginBottom: 4,
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{field}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Sample SMS */}
        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 4 }}>Sample SMS:</Text>
          <Text
            style={{
              fontSize: 12,
              color: '#555',
              backgroundColor: '#f8f9fa',
              padding: 8,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: '#dee2e6',
            }}
          >
            {pattern.sampleSMS}
          </Text>
        </View>

        {/* Pattern Stats */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 12, color: '#666' }}>Confidence: {Math.round(pattern.confidence * 100)}%</Text>
          <Text style={{ fontSize: 12, color: '#666' }}>
            Total Amount: ₹{pattern.transactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
          </Text>
        </View>

        {/* Expandable Messages Section */}
        {isExpanded && (
          <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#dee2e6' }}>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}
            >
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>
                All Messages ({pattern.transactions.length})
              </Text>
              <TouchableOpacity
                onPress={() => copySMSToClipboard(pattern.transactions.map((t) => t.rawSms).join('\n\n'))}
                style={{
                  backgroundColor: '#28a745',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 6,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>Copy All</Text>
              </TouchableOpacity>
            </View>

            {pattern.transactions.map((transaction, transactionIndex) => (
              <View
                key={transaction.id}
                style={{
                  backgroundColor: '#fff',
                  padding: 12,
                  marginBottom: 8,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#dee2e6',
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 8,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                      {transaction.transactionDate.toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333' }}>
                      ₹{transaction.amount.toFixed(2)} - {transaction.merchant}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => copySMSToClipboard(transaction.rawSms)}
                    style={{
                      backgroundColor: '#007bff',
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 4,
                      marginLeft: 8,
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>Copy</Text>
                  </TouchableOpacity>
                </View>

                <Text
                  style={{
                    fontSize: 12,
                    color: '#555',
                    backgroundColor: '#f8f9fa',
                    padding: 8,
                    borderRadius: 4,
                    fontFamily: 'monospace',
                  }}
                >
                  {transaction.rawSms}
                </Text>
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
      <View style={{ margin: 16, padding: 16, backgroundColor: '#e9ecef', borderRadius: 8 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Pattern Recognition Statistics</Text>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text>SMS Messages Read:</Text>
          <Text style={{ fontWeight: 'bold' }}>{processingResult.totalSMSRead}</Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text>Distinct Patterns:</Text>
          <Text style={{ fontWeight: 'bold' }}>{processingResult.totalPatterns}</Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text>Avg SMS per Pattern:</Text>
          <Text style={{ fontWeight: 'bold' }}>
            {processingResult.totalPatterns > 0
              ? Math.round(processingResult.totalSMSRead / processingResult.totalPatterns)
              : 0}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text>Pattern Efficiency:</Text>
          <Text style={{ fontWeight: 'bold' }}>
            {processingResult.totalSMSRead > 0
              ? Math.round((processingResult.totalPatterns / processingResult.totalSMSRead) * 100)
              : 0}
            %
          </Text>
        </View>
      </View>
    )
  }

  const renderPatternTypeBreakdown = () => {
    if (patterns.length === 0) return null

    const typeCounts = patterns.reduce(
      (acc, pattern) => {
        acc[pattern.patternType] = (acc[pattern.patternType] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return (
      <View style={{ margin: 16, padding: 16, backgroundColor: '#f8f9fa', borderRadius: 8 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>Pattern Type Breakdown</Text>
        {Object.entries(typeCounts).map(([type, count]) => (
          <View
            key={type}
            style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}
          >
            <Text style={{ fontSize: 14, color: '#333' }}>
              {getPatternTypeIcon(type)} {type.replace('_', ' ')}
            </Text>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: getPatternTypeColor(type) }}>{count}</Text>
          </View>
        ))}
      </View>
    )
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ padding: 20, backgroundColor: '#6f42c1' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>
          SMS Pattern Recognition
        </Text>
        <Text style={{ fontSize: 14, color: '#e3f2fd', textAlign: 'center', marginTop: 4 }}>
          Identify Distinct Message Patterns
        </Text>
      </View>

      <View style={{ padding: 20 }}>
        <TouchableOpacity
          onPress={handleProcessPatterns}
          disabled={isProcessing}
          style={{
            backgroundColor: isProcessing ? '#6c757d' : '#6f42c1',
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
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Analyzing Patterns...</Text>
            </View>
          ) : (
            <Text
              style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}
            >{`Analyze SMS Patterns (Last ${DAYS_TO_PROCESS} Days)`}</Text>
          )}
        </TouchableOpacity>

        {/* {processingResult && processingResult.errors.length > 0 && (
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
        )} */}
      </View>

      {renderStats()}
      {renderPatternTypeBreakdown()}

      <View style={{ flex: 1 }}>
        {patterns.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', margin: 16, marginBottom: 8 }}>
              Distinct Patterns ({patterns.length})
            </Text>
            {patterns.map((pattern, index) => renderPattern(pattern, index))}
          </View>
        )}
      </View>
    </ScrollView>
  )
}
