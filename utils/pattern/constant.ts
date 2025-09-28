import { Intent } from '@/types/sms/transaction'

export const TEMPLATES: Record<Intent, string[]> = {
  not_txn: [
    // OTP and verification
    'otp code',
    'verification code',
    'otp for transaction',
    'otp to complete',
    'one time password',
    'verification otp',
    'login otp',
    'transaction otp',

    // Marketing and promotional
    'promo offer',
    'special offer',
    'newsletter',
    'marketing message',
    'advertisement',
    'promotional message',
    'limited time offer',
    'exclusive offer',
    'discount offer',
    'sale notification',

    // Balance and account info
    'available balance information',
    'account balance update',
    'balance inquiry',
    'account statement',
    'monthly statement',
    'quarterly statement',
    'annual statement',
    'account summary',
    'transaction summary',

    // System notifications
    'welcome to bank',
    'account activated',
    'card activated',
    'pin generated',
    'password reset',
    'profile updated',
    'settings changed',
    'security alert',
    'fraud alert',
    'suspicious activity',

    // General non-transaction
    'terms and conditions',
    'privacy policy',
    'unsubscribe',
    'opt out',
    'service update',
    'maintenance notice',
    'system upgrade',
    'scheduled maintenance',
  ],
  expense: [
    // UPI payments
    'inr <num> debited from account <last4>',
    'upi payment of inr <num>',
    'upi to person',
    'upi sent to merchant',
    'upi transaction of inr <num>',
    'upi payment made',
    'upi transfer of inr <num>',
    'upi debit of inr <num>',
    'upi payment to',
    'upi money sent',

    // Card transactions
    'payment made at merchant',
    'pos purchase from account',
    'card swiped',
    'card payment of inr <num>',
    'card transaction of inr <num>',
    'credit card payment',
    'debit card payment',
    'card purchase',
    'card withdrawal',
    'card used at',

    // ATM and cash
    'atm cash withdrawal',
    'atm withdrawal of inr <num>',
    'cash withdrawn',
    'atm transaction',
    'cash dispensed',
    'atm fee charged',
    'cash withdrawal fee',

    // Online payments
    'netbanking payment',
    'online payment of inr <num>',
    'internet banking payment',
    'online purchase',
    'ecommerce payment',
    'online transaction',
    'digital payment',
    'mobile payment',

    // Transfers
    'imps transfer sent',
    'neft transfer sent',
    'rtgs transfer sent',
    'transfer of inr <num>',
    'money transferred',
    'funds transferred',
    'amount sent',
    'outward transfer',
    'domestic transfer',

    // Bill payments
    'bill payment of inr <num>',
    'utility bill paid',
    'electricity bill paid',
    'water bill paid',
    'gas bill paid',
    'internet bill paid',
    'mobile bill paid',
    'insurance premium paid',
    'loan emi paid',
    'credit card bill paid',

    // Recharges and subscriptions
    'mobile recharge of inr <num>',
    'dth recharge of inr <num>',
    'data pack purchased',
    'subscription renewed',
    'monthly subscription',
    'annual subscription',
    'premium subscription',

    // Shopping and purchases
    'purchase of inr <num>',
    'shopping payment',
    'retail payment',
    'merchant payment',
    'store payment',
    'restaurant payment',
    'fuel payment',
    'grocery payment',
    'pharmacy payment',
    'medical payment',

    // Fees and charges
    'service charge',
    'processing fee',
    'transaction fee',
    'maintenance fee',
    'annual fee',
    'late payment fee',
    'penalty charged',
    'overdraft fee',
    'cheque bounce fee',
    'returned item fee',
  ],
  income: [
    // Salary and wages
    'inr <num> credited to account',
    'salary credited',
    'wages credited',
    'payroll credited',
    'monthly salary',
    'bonus credited',
    'incentive credited',
    'commission credited',
    'overtime credited',
    'allowance credited',

    // UPI receipts
    'money received via upi',
    'upi credit of inr <num>',
    'upi money received',
    'upi payment received',
    'upi transfer received',
    'upi credit received',
    'upi amount received',
    'upi funds received',

    // Interest and returns
    'interest credited',
    'interest earned',
    'savings interest',
    'fixed deposit interest',
    'recurring deposit interest',
    'dividend credited',
    'investment return',
    'mutual fund dividend',
    'bond interest',
    'government bond interest',

    // Refunds and reversals
    'refund credited',
    'refund processed',
    'reversal processed',
    'chargeback credited',
    'payment reversed',
    'transaction reversed',
    'refund of inr <num>',
    'reversal of inr <num>',
    'cancellation refund',
    'return refund',

    // Cashback and rewards
    'cashback received',
    'cashback credited',
    'reward credited',
    'points credited',
    'loyalty points',
    'reward points',
    'cashback earned',
    'discount credited',
    'bonus credited',
    'referral bonus',

    // Transfers received
    'imps transfer received',
    'neft transfer received',
    'rtgs transfer received',
    'transfer received',
    'funds received',
    'amount received',
    'money received',
    'inward transfer',
    'domestic transfer received',
    'international transfer received',

    // Government benefits
    'pension credited',
    'social security',
    'unemployment benefit',
    'child benefit',
    'disability benefit',
    'medical benefit',
    'education grant',
    'scholarship credited',
    'government subsidy',
    'tax refund',

    // Investment returns
    'sip credited',
    'mutual fund credited',
    'equity dividend',
    'bond maturity',
    'maturity amount',
    'redemption credited',
    'systematic investment',
    'investment return',
    'capital gains',
    'profit credited',
  ],
  // future_payments: [
  //   // Bill reminders
  //   'bill payment due soon',
  //   'bill due on date',
  //   'payment due soon',
  //   'upcoming bill reminder',
  //   'bill reminder',
  //   'payment reminder',
  //   'due date approaching',
  //   'last date to pay',
  //   'pay before date',
  //   'urgent payment required',

  //   // Credit card bills
  //   'credit card bill due',
  //   'credit card payment due',
  //   'card bill due on date',
  //   'minimum amount due',
  //   'min amount due',
  //   'total amount due',
  //   'outstanding amount',
  //   'credit card statement',
  //   'card statement generated',
  //   'pay credit card bill',

  //   // EMI and loans
  //   'emi due on date',
  //   'loan emi due',
  //   'home loan emi',
  //   'car loan emi',
  //   'personal loan emi',
  //   'education loan emi',
  //   'emi payment due',
  //   'loan repayment due',
  //   'installment due',
  //   'monthly emi',

  //   // Insurance and policies
  //   'insurance premium due',
  //   'policy renewal due',
  //   'premium payment due',
  //   'life insurance premium',
  //   'health insurance premium',
  //   'motor insurance premium',
  //   'policy due date',
  //   'renewal reminder',
  //   'premium reminder',
  //   'policy expiry soon',

  //   // Scheduled payments
  //   'autopay scheduled on date',
  //   'standing instruction',
  //   'si on date',
  //   'auto debit scheduled',
  //   'scheduled payment',
  //   'recurring payment',
  //   'automatic payment',
  //   'mandate payment',
  //   'future payment',
  //   'upcoming debit',

  //   // Service renewals
  //   'subscription renewal due',
  //   'service renewal',
  //   'membership renewal',
  //   'plan renewal due',
  //   'package renewal',
  //   'service expiry',
  //   'subscription expiry',
  //   'renewal required',
  //   'upgrade available',
  //   'plan change due',

  //   // Utility bills
  //   'electricity bill due',
  //   'water bill due',
  //   'gas bill due',
  //   'internet bill due',
  //   'mobile bill due',
  //   'utility payment due',
  //   'service bill due',
  //   'monthly bill due',
  //   'quarterly bill due',
  //   'annual bill due',

  //   // General reminders
  //   'statement generated please pay',
  //   'payment notification',
  //   'transaction pending',
  //   'payment required',
  //   'action required',
  //   'immediate attention',
  //   'urgent payment',
  //   'overdue payment',
  //   'late payment warning',
  //   'final notice',
  // ],
}

// ───────────────────────────────────────────────────────────────────────────────
// Pre-rules (separate function) — completed txns > reminders; failures → not_txn
// ───────────────────────────────────────────────────────────────────────────────
export const RX_FAILURE = /\b(failed|declined|rejected|unsuccessful)\b/i

export const RX_COMPLETED_EXPENSE = /\b(debited|paid|spent|purchased?|withdrawn|transferred|sent)\b/i
export const RX_COMPLETED_INCOME = /\b(credited|received|refund(?:ed)?|cashback|interest|reversal\s+processed)\b/i

export const RX_FUTURE_TENSE = /\b(will|scheduled|autopay|auto[-\s]?pay|standing\s+instruction|si\s+on)\b/i
export const RX_SCHEDULED =
  /\b(will\s+be\s+debited|autopay|auto[-\s]?pay|standing\s+instruction|si\s+on|scheduled\s+on)\b/i
export const RX_REMINDER =
  /\b(due\s+(on|by)|bill[-\s]?due|min(?:imum)?\s+amount\s+due|min\.?\s+due|statement\s+generated|pay\s+by|last\s+date|overdue|emi\s+due|premium\s+due|renewal\s+due|payment\s+reminder|upcoming\s+bill)\b/i
