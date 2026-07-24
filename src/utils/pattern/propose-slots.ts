import { amountToPattern } from './amount-to-pattern'
import { AMT_PLACEHOLDER, MERCHANT_PLACEHOLDER } from './compile-template-to-regex'

export interface SlotProposal {
  template: string
  amountPlaced: boolean
  merchantPlaced: boolean
}

const RX_TXN_VERB = /\b(debited|credited|paid|received|spent|withdrawn|transferred|sent|charged|purchased?)\b/i

/**
 * Place <AMT>/<MERCHANT> placeholders into an SMS body given its known values.
 * The amount is located format-tolerantly (commas, decimals) and, when it occurs
 * more than once, the occurrence nearest a transaction verb wins over balances.
 */
export function proposeSlots(smsBody: string, amount?: number, merchant?: string): SlotProposal {
  let template = smsBody
  let amountPlaced = false
  let merchantPlaced = false

  const pattern = amount !== undefined ? amountToPattern(amount) : null
  if (pattern) {
    let best: { index: number; length: number } | null = null
    let bestScore = -1
    for (const match of template.matchAll(new RegExp(pattern.source, 'g'))) {
      const windowStart = Math.max(0, match.index - 40)
      const window = template.slice(windowStart, match.index + match[0].length + 40)
      const score = RX_TXN_VERB.test(window) ? 1 : 0
      if (score > bestScore) {
        bestScore = score
        best = { index: match.index, length: match[0].length }
      }
    }
    if (best) {
      template = template.slice(0, best.index) + AMT_PLACEHOLDER + template.slice(best.index + best.length)
      amountPlaced = true
    }
  }

  if (merchant && merchant !== 'Unknown') {
    const index = template.toLowerCase().indexOf(merchant.toLowerCase())
    if (index !== -1) {
      template = template.slice(0, index) + MERCHANT_PLACEHOLDER + template.slice(index + merchant.length)
      merchantPlaced = true
    }
  }

  return { template, amountPlaced, merchantPlaced }
}
