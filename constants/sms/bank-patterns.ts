import { BankPattern } from '@/types/sms/transaction'

export const BANK_PATTERNS: BankPattern[] = [
  {
    bankName: 'HDFC Bank',
    senderNumbers: ['HDFCBK', 'HDFC', 'HDFCBANK'],
    patterns: [
      {
        name: 'ATM Withdrawal',
        regex:
          /Rs\.?(\d+(?:\.\d{2})?)\s+debited\s+from\s+A\/c\s+\*{2}(\d+)\s+on\s+(\d{1,2}-[A-Za-z]{3}-\d{2})\s+at\s+(\d{1,2}:\d{2})\.?\s*Avl\s+Bal\s+Rs\.?(\d+(?:\.\d{2})?)/i,
        fields: {
          amount: '$1',
          merchant: 'ATM Withdrawal',
          date: '$3 $4',
          account: '$2',
          balance: '$5',
        },
      },
      {
        name: 'UPI Payment',
        regex:
          /Rs\.?(\d+(?:\.\d{2})?)\s+paid\s+to\s+([^\.]+)\s+via\s+UPI\.?\s*UPI\s+Ref:\s+(\d+)\.?\s*Avl\s+Bal\s+Rs\.?(\d+(?:\.\d{2})?)/i,
        fields: {
          amount: '$1',
          merchant: '$2',
          date: 'current',
          account: 'UPI',
          balance: '$4',
        },
      },
      {
        name: 'NEFT Transfer',
        regex:
          /Rs\.?(\d+(?:\.\d{2})?)\s+transferred\s+to\s+([^\.]+)\s+via\s+NEFT\.?\s*Ref:\s+(\w+)\.?\s*Avl\s+Bal\s+Rs\.?(\d+(?:\.\d{2})?)/i,
        fields: {
          amount: '$1',
          merchant: '$2',
          date: 'current',
          account: 'NEFT',
          balance: '$4',
        },
      },
    ],
  },
  {
    bankName: 'ICICI Bank',
    senderNumbers: ['ICICIB', 'ICICI'],
    patterns: [
      {
        name: 'Card Transaction',
        regex:
          /Rs\.?(\d+(?:\.\d{2})?)\s+spent\s+on\s+([^\.]+)\s+on\s+(\d{1,2}\/\d{1,2}\/\d{2})\s+at\s+(\d{1,2}:\d{2})\.?\s*Avl\s+Bal\s+Rs\.?(\d+(?:\.\d{2})?)/i,
        fields: {
          amount: '$1',
          merchant: '$2',
          date: '$3 $4',
          account: 'Card',
          balance: '$5',
        },
      },
      {
        name: 'UPI Payment',
        regex:
          /Rs\.?(\d+(?:\.\d{2})?)\s+paid\s+to\s+([^\.]+)\s+via\s+UPI\.?\s*Ref:\s+(\d+)\.?\s*Avl\s+Bal\s+Rs\.?(\d+(?:\.\d{2})?)/i,
        fields: {
          amount: '$1',
          merchant: '$2',
          date: 'current',
          account: 'UPI',
          balance: '$4',
        },
      },
    ],
  },
  {
    bankName: 'SBI Bank',
    senderNumbers: ['SBI', 'SBINET'],
    patterns: [
      {
        name: 'Account Debit',
        regex:
          /Rs\.?(\d+(?:\.\d{2})?)\s+debited\s+from\s+A\/c\s+(\d+)\s+on\s+(\d{1,2}-[A-Za-z]{3}-\d{2})\s+at\s+(\d{1,2}:\d{2})\.?\s*Avl\s+Bal\s+Rs\.?(\d+(?:\.\d{2})?)/i,
        fields: {
          amount: '$1',
          merchant: 'Account Debit',
          date: '$3 $4',
          account: '$2',
          balance: '$5',
        },
      },
    ],
  },
  {
    bankName: 'Axis Bank',
    senderNumbers: ['AXISB', 'AXIS'],
    patterns: [
      {
        name: 'Card Transaction',
        regex:
          /Rs\.?(\d+(?:\.\d{2})?)\s+spent\s+on\s+([^\.]+)\s+on\s+(\d{1,2}\/\d{1,2}\/\d{2})\s+at\s+(\d{1,2}:\d{2})\.?\s*Avl\s+Bal\s+Rs\.?(\d+(?:\.\d{2})?)/i,
        fields: {
          amount: '$1',
          merchant: '$2',
          date: '$3 $4',
          account: 'Card',
          balance: '$5',
        },
      },
    ],
  },
  {
    bankName: 'Kotak Bank',
    senderNumbers: ['KOTAK', 'KOTAKB'],
    patterns: [
      {
        name: 'Account Transaction',
        regex:
          /Rs\.?(\d+(?:\.\d{2})?)\s+debited\s+from\s+A\/c\s+(\d+)\s+on\s+(\d{1,2}-[A-Za-z]{3}-\d{2})\s+at\s+(\d{1,2}:\d{2})\.?\s*Avl\s+Bal\s+Rs\.?(\d+(?:\.\d{2})?)/i,
        fields: {
          amount: '$1',
          merchant: 'Account Transaction',
          date: '$3 $4',
          account: '$2',
          balance: '$5',
        },
      },
    ],
  },
]

// UPI App patterns (GPay, PhonePe, etc.)
export const UPI_PATTERNS: BankPattern[] = [
  {
    bankName: 'Google Pay',
    senderNumbers: ['GPAY', 'GOOGLEPAY'],
    patterns: [
      {
        name: 'UPI Payment',
        regex:
          /Rs\.?(\d+(?:\.\d{2})?)\s+paid\s+to\s+([^\.]+)\s+via\s+UPI\.?\s*UPI\s+Ref:\s+(\d+)\.?\s*Avl\s+Bal\s+Rs\.?(\d+(?:\.\d{2})?)/i,
        fields: {
          amount: '$1',
          merchant: '$2',
          date: 'current',
          account: 'UPI',
          balance: '$4',
        },
      },
    ],
  },
  {
    bankName: 'PhonePe',
    senderNumbers: ['PHONEPE'],
    patterns: [
      {
        name: 'UPI Payment',
        regex:
          /Rs\.?(\d+(?:\.\d{2})?)\s+paid\s+to\s+([^\.]+)\s+via\s+UPI\.?\s*UPI\s+Ref:\s+(\d+)\.?\s*Avl\s+Bal\s+Rs\.?(\d+(?:\.\d{2})?)/i,
        fields: {
          amount: '$1',
          merchant: '$2',
          date: 'current',
          account: 'UPI',
          balance: '$4',
        },
      },
    ],
  },
]

export const ALL_PATTERNS = [...BANK_PATTERNS, ...UPI_PATTERNS]
