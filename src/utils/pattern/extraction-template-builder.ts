import { Transaction } from '@/types/sms/transaction'
import { DiffMatchPatch } from 'diff-match-patch-ts'

export function buildExtractionFromUser(samples: Transaction[]): {
  template: string
  regex: string
} {
  const newTemplates = samples.map(generateTemplate)
  const uniqueTemplates = [...new Set(newTemplates)]

  if (uniqueTemplates.length === 1) {
    return {
      template: uniqueTemplates[0],
      regex: '',
    }
  }
  const templateRankings = uniqueTemplates.map((template) => templateRanking(template, samples))
  const bestTemplate = uniqueTemplates[templateRankings.indexOf(Math.max(...templateRankings))]
  return {
    template: bestTemplate,
    regex: '',
  }
}

// Create a template from a transaction based on the amount and merchant
export function generateTemplate(transaction: Transaction): string {
  const modifiedSms = replaceText(transaction.message.body, '<AMT>', transaction.amount.toString())
  const template = replaceText(modifiedSms, '<MERCHANT>', transaction.merchant)
  return template
}

export function replaceText(sms: string, text: string, matcher: string): string {
  let matcherIdx = sms.indexOf(matcher)
  if (matcherIdx === -1) {
    return sms
  }
  let matcherLen = matcher.length
  return sms.slice(0, matcherIdx) + text + sms.slice(matcherIdx + matcherLen)
}

export function templateRanking(template: string, samples: Transaction[]): number {
  const correctSamples = samples.filter((sample) => {
    const { amount, merchant } = extractAmountAndMerchant(template, sample.message.body)
    return amount === sample.amount.toString() && merchant === sample.merchant
  })
  return correctSamples.length / samples.length
}

// extract the amount and merchant from the template by diffing against sms
export function extractAmountAndMerchant(template: string, sms: string): { amount: string; merchant: string } {
  const dmp = new DiffMatchPatch()
  const diffs = dmp.diff_main(template, sms)
  dmp.diff_cleanupEfficiency(diffs)

  const extractedData = {
    amount: '',
    merchant: '',
  }

  diffs.forEach((diff, index) => {
    const [op, text] = diff
    if (op === -1) {
      if (text === '<AMT>') {
        extractedData.amount = diffs[index + 1][1]
      }
      if (text === '<MERCHANT>') {
        extractedData.merchant = diffs[index + 1][1]
      }
    }
  })

  return extractedData
}
