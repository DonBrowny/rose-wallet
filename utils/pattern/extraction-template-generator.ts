import type { Transaction } from '@/types/sms/transaction'

/**
 * Generate extraction template using alignment-based approach
 * Analyzes grouped SMS messages and their extracted data to create a template
 * that preserves fixed parts and identifies variable parts
 */
export function generateExtractionTemplate(transactions: Transaction[]): string {
  if (transactions.length === 0) return ''

  if (transactions.length === 1) {
    return generateTemplateForSingleSMS(transactions[0])
  }

  return generateAlignmentTemplate(transactions)
}

/**
 * Generate template for a single SMS by replacing its extracted data with placeholders
 */
function generateTemplateForSingleSMS(transaction: Transaction): string {
  let template = transaction.message.body
  const amount = transaction.amount
  const merchant = transaction.merchant

  // Replace first occurrence of amount with <AMT>
  template = replaceFirstAmountOccurrence(template, amount)

  // Replace first occurrence of merchant with <MERCHANT>
  template = replaceFirstMerchantOccurrence(template, merchant)

  return template
}

/**
 * Generate template using alignment approach for multiple SMS messages
 * This creates a template by aligning all SMS in the group and replacing first occurrences
 */
function generateAlignmentTemplate(transactions: Transaction[]): string {
  if (transactions.length === 0) return ''
  if (transactions.length === 1) return generateTemplateForSingleSMS(transactions[0])

  // Get all SMS messages from the group
  const smsMessages = transactions.map((t) => t.message.body)

  // Create aligned templates for each SMS
  const alignedTemplates = smsMessages.map((sms, index) => {
    const transaction = transactions[index]
    return createAlignedTemplate(sms, transaction)
  })

  // Find the most common template structure
  const template = findCommonTemplateStructure(alignedTemplates)

  return template
}

/**
 * Create an aligned template for a single SMS by replacing first occurrences
 */
function createAlignedTemplate(sms: string, transaction: Transaction): string {
  let template = sms
  const amount = transaction.amount
  const merchant = transaction.merchant

  // Replace first occurrence of amount with <AMT>
  template = replaceFirstAmountOccurrence(template, amount)

  // Replace first occurrence of merchant with <MERCHANT>
  template = replaceFirstMerchantOccurrence(template, merchant)

  return template
}

/**
 * Find the most common template structure from aligned templates
 */
function findCommonTemplateStructure(alignedTemplates: string[]): string {
  if (alignedTemplates.length === 0) return ''
  if (alignedTemplates.length === 1) return alignedTemplates[0]

  // Use the first template as the base and find common structure
  let commonTemplate = alignedTemplates[0]

  // For now, return the first aligned template
  // In a more sophisticated implementation, we could analyze all templates
  // to find the most common structure, but this works for our use case
  return commonTemplate
}

/**
 * First occurrence replacement functions
 * These replace only the first occurrence of amount and merchant
 */

/**
 * Replace first occurrence of amount with <AMT>
 */
function replaceFirstAmountOccurrence(sms: string, amount: number): string {
  const amountStr = amount.toString()
  const amountWithDecimal = amount.toFixed(2)

  // Find the first occurrence of the amount
  let amountIndex = sms.indexOf(amountWithDecimal)
  if (amountIndex === -1) {
    amountIndex = sms.indexOf(amountStr)
  }

  if (amountIndex !== -1) {
    // Check if this is likely the transaction amount (not balance)
    const before = sms.substring(Math.max(0, amountIndex - 30), amountIndex)
    const after = sms.substring(
      amountIndex + amountStr.length,
      Math.min(sms.length, amountIndex + amountStr.length + 30)
    )

    // Look for transaction indicators
    const context = (before + after).toLowerCase()
    const isTransactionAmount =
      context.includes('debited') ||
      context.includes('credited') ||
      context.includes('paid') ||
      context.includes('received') ||
      context.includes('transferred') ||
      context.includes('spent') ||
      context.includes('withdrawn') ||
      context.includes('deposited')

    if (isTransactionAmount) {
      const replacement = amountStr.includes('.') ? '<AMT>.0' : '<AMT>'
      sms = sms.substring(0, amountIndex) + replacement + sms.substring(amountIndex + amountStr.length)
    }
  }

  return sms
}

/**
 * Replace first occurrence of merchant with <MERCHANT>
 */
function replaceFirstMerchantOccurrence(sms: string, merchant: string): string {
  if (!merchant || merchant === 'Unknown') return sms

  const merchantIndex = sms.indexOf(merchant)
  if (merchantIndex !== -1) {
    // Check if this is likely the transaction merchant (not just any occurrence)
    const before = sms.substring(Math.max(0, merchantIndex - 30), merchantIndex)

    // Look for merchant indicators
    const context = before.toLowerCase()
    const isTransactionMerchant =
      context.includes('trf to') ||
      context.includes('paid to') ||
      context.includes('at ') ||
      context.includes('to ') ||
      context.includes('from ')

    if (isTransactionMerchant) {
      sms = sms.substring(0, merchantIndex) + '<MERCHANT>' + sms.substring(merchantIndex + merchant.length)
    }
  }

  return sms
}
