import { TRANSACTION_TYPE, type TransactionType } from '@/db/schema'
import { isTransactionCandidate } from '@/utils/pattern/is-transaction-candidate'
import { SMSDataExtractor } from './sms-data-extractor-service'

/**
 * Real-world corpus: one entry per SMS format family observed in an actual inbox
 * export (ICICIT / HDFCBK / SBIUPI senders). Bodies are verbatim except that
 * account tails, reference numbers, phone numbers, person names, employers and
 * localities are cooked-up. Amount/merchant expectations describe the bootstrap
 * extractor's contract for the pattern-review pre-fill.
 */

interface TxnEntry {
  label: string
  body: string
  type: TransactionType
  amount: number
  merchant: string | undefined
}

const TRANSACTIONS: TxnEntry[] = [
  {
    label: 'hdfc upi sent to person',
    body: 'Amt Sent Rs.1065.00 From HDFC Bank A/C *5432 To SENTHIL K On 14-02 Ref 543210987654 Not You? Call 54321098765/SMS BLOCK UPI to 5432109876',
    type: TRANSACTION_TYPE.Debit,
    amount: 1065,
    merchant: 'SENTHIL K',
  },
  {
    label: 'sbi upi transfer, amount without currency marker',
    body: 'Dear UPI user A/C X5432 debited by 50.0 on date 05May24 trf to Mr Arun Prakash Refno 543210987654. If not u? call 5432109876. -SBI',
    type: TRANSACTION_TYPE.Debit,
    amount: 50,
    merchant: 'Mr Arun Prakash',
  },
  {
    label: 'icici credit card spend with Avl Lmt tail',
    body: 'INR 920.00 spent on ICICI Bank Card XX5432 on 13-Oct-23 at IND*Amazon.in -. Avl Lmt: INR 2,63,617.00. To dispute,call 18002662/SMS BLOCK 4321 to 5432109876',
    type: TRANSACTION_TYPE.Debit,
    amount: 920,
    merchant: 'IND*Amazon.in',
  },
  {
    label: 'hdfc atm withdrawal with comma-fused location',
    body: "ALERT:You've withdrawn Rs.10000.00 via Debit Card xx5432 at ANNA NGR,PORUR on 2018-11-26:08:57:30.Avl Bal Rs.38984.96.Not you?Call 54321098765.",
    type: TRANSACTION_TYPE.Debit,
    amount: 10000,
    merchant: 'ANNA NGR,PORUR',
  },
  {
    label: 'hdfc money transfer to lowercase upi handle',
    body: 'Money Transfer:Rs 500.00 from HDFC Bank A/c **5432 on 03-09-23 to kmstores UPI: 543210987654 Not you? Call 54321098765',
    type: TRANSACTION_TYPE.Debit,
    amount: 500,
    merchant: 'kmstores',
  },
  {
    label: 'hdfc upi debit to biller vpa, cta tail "to report"',
    body: 'Rs 589.00 debited from a/c **5432 on 29-05-19 to VPA billdesk.airtel-postpaid@icici(UPI Ref No 543210987654). Not you? Call on 54321098765 to report',
    type: TRANSACTION_TYPE.Debit,
    amount: 589,
    merchant: 'billdesk.airtel-postpaid@icici',
  },
  {
    label: 'hdfc card spend with five-word merchant',
    body: 'Rs.500 spent on HDFC Bank Card x5432 at BPCL ASM FUEL POINT A on 2024-01-31:17:24:52 Avl bal: 1269999.05.Not You? Call 54321098765 / SMS BLOCK DC 4321 to 5432109876',
    type: TRANSACTION_TYPE.Debit,
    amount: 500,
    merchant: 'BPCL ASM FUEL POINT A',
  },
  {
    label: 'hdfc netbanking payment ("Thanks for paying")',
    body: 'Thanks for paying Rs.949.76 from A/c XXXX5432 to CCAGodaddyIndiaDomai via NetBanking. Call 54321098765 if txn not done by you',
    type: TRANSACTION_TYPE.Debit,
    amount: 949.76,
    merchant: 'CCAGodaddyIndiaDomai',
  },
  {
    label: 'hdfc debit card store spend ("Thank you for using")',
    body: 'Thank you for using Debit Card ending 4321 for Rs.141.00 in CHENNAI at SARAVANA STORES TEX on 2018-06-02:14:32:56 Avl bal: Rs.134284.11',
    type: TRANSACTION_TYPE.Debit,
    amount: 141,
    merchant: 'SARAVANA STORES TEX',
  },
  {
    label: 'hdfc emi debit with Info blob, no merchant',
    body: 'UPDATE: INR 6,627.00 debited from A/c XX5432 on 05-NOV-18. Info: EMI 30754321 Chq S54321098765 543210987654. Avl bal:INR 7,072.46',
    type: TRANSACTION_TYPE.Debit,
    amount: 6627,
    merchant: undefined,
  },
  {
    label: 'hdfc upi debit with vpa inside Info blob',
    body: 'UPDATE: INR 10,000.00 debited from HDFC Bank XX5432 on 03-FEB-23. Info: UPI-ICCL ZERODHA COIN-zerodhamf@hdfcbank-HDFC0000060-543210987654-oRUjhAaDEfuHdyvAHO. Avl bal:INR 9,87,950.72',
    type: TRANSACTION_TYPE.Debit,
    amount: 10000,
    merchant: 'zerodhamf@hdfcbank',
  },
  {
    label: 'hdfc netbanking payment successful',
    body: 'Payment Successful! Rs. 50000.00 from A/c **********5432 to RAZPBSEINDIACOM via HDFC Bank NetBanking. Not you?Call 54321098765',
    type: TRANSACTION_TYPE.Debit,
    amount: 50000,
    merchant: 'RAZPBSEINDIACOM',
  },
  {
    label: 'hdfc account-to-account transfer, no merchant',
    body: 'Rs. 49345.00 debited from a/c **5432 on 18-05-19 to a/c **5432 (UPI Ref No. 543210987654). Not you? Call on 54321098765 to report',
    type: TRANSACTION_TYPE.Debit,
    amount: 49345,
    merchant: undefined,
  },
  {
    label: 'hdfc upi credit from vpa',
    body: 'Rs. 200.00 credited to a/c XXXXXX5432 on 12-06-19 by a/c linked to VPA arunstores@okhdfcbank (UPI Ref No 543210987654).',
    type: TRANSACTION_TYPE.Credit,
    amount: 200,
    merchant: 'arunstores@okhdfcbank',
  },
  {
    label: 'sbi upi credit from person',
    body: 'Dear SBI User, your A/c X5432-credited by Rs.99 on 14Aug24 transfer from PRAVEEN R Ref No 543210987654 -SBI',
    type: TRANSACTION_TYPE.Credit,
    amount: 99,
    merchant: 'PRAVEEN R',
  },
  {
    label: 'hdfc salary deposit with NEFT blob',
    body: 'Update! INR 1,72,393.00 deposited in HDFC Bank A/c XX5432 on 29-SEP-23 for NEFT Cr-SCBL0036001-ACME ANALYTICS PRIVATE LIMITED-Ramesh Kumar-IN1ON2309290B8F6.Avl bal INR 11,41,678.60. Cheque deposits in A/C are subject to clearing',
    type: TRANSACTION_TYPE.Credit,
    amount: 172393,
    merchant: undefined,
  },
  {
    label: 'hdfc imps credit from mobile-linked account',
    body: 'UPDATE: Your A/c XX5432 credited with INR 25,300.00 on 14-11-18 by A/c linked to mobile no XX5432 (IMPS Ref No. 543210987654) Available bal: INR 31,757.46',
    type: TRANSACTION_TYPE.Credit,
    amount: 25300,
    merchant: undefined,
  },
  {
    label: 'hdfc credit alert from phone-number vpa',
    body: 'Credit Alert! Rs.250.00 credited to HDFC Bank A/c xx5432 on 13-02-25 from VPA 5432109876@axl (UPI 543210987654)',
    type: TRANSACTION_TYPE.Credit,
    amount: 250,
    merchant: '5432109876@axl',
  },
  {
    label: 'hdfc rtgs deposit, tilde-delimited fields',
    body: 'RTGS Money Deposited~INR 4,12,000.00~To Ravi~Txn No: HDFCR54321098765432109~On 01-09-2025 at 21:56:01~-HDFC Bank',
    type: TRANSACTION_TYPE.Credit,
    amount: 412000,
    merchant: 'Ravi',
  },
  {
    label: 'icici credit card payment received',
    body: 'Payment of Rs 32,948.16 has been received on your ICICI Bank Credit Card XX5432 through Bharat Bill Payment System on 13-MAR-25.',
    type: TRANSACTION_TYPE.Credit,
    amount: 32948.16,
    merchant: undefined,
  },
]

const NON_TRANSACTIONS: { label: string; body: string }[] = [
  {
    label: 'upi collect request',
    body: 'Indiaideas has requested Rs. 399.00 from you through UPI. To authorize debit from your account please login to your UPI App. To pay instantly click here http://bit.ly/2Qh8kh4',
  },
  {
    label: 'google pay collect request',
    body: 'Amazon India has requested Rs548.27 frm u on Google Pay app. Once approved, money will be debited frm ur a/c -SBI',
  },
  {
    label: 'credit card due reminder',
    body: 'Pay Total Amount Due of Rs 27,491.45 or Minimum Amount Due of Rs 1,380.00 by 30-May-26 towards ICICI Bank Credit Card XX5432. Delay/Non-payment is reported to Credit Bureaus. Ignore if paid.',
  },
  {
    label: 'emi due reminder',
    body: 'Alert: EMI of Rs. 44835 is due on 07-Apr-2026, for HDFC Bank Loan A/c 543210987. Please ensure sufficient balance to avoid bounce and delayed interest charges.',
  },
  {
    label: 'reversal of unsuccessful atm withdrawal',
    body: 'Your unsuccessful ATM WDL txn on HDFC Bank DEBIT/ATM Card ending 4321 of Rs. 50000.00 at location +MADIPAKKAM OATM on 2019-05-18:13:45:20 is reversed to A/c. Regret inconvenience.',
  },
  {
    label: 'otp with amount in body',
    body: '892 is your OTP to increase HDFC Bank Fund Transfer Limit to Rs.4,000,000.00 Ref No.XXXX5432 NEVER share OTP',
  },
  {
    label: 'declined card transaction',
    body: 'TXN DECLINED: Rs.150.00 on 23-06-26 at 22:57 on HDFC Bank Debit Card xx5432. Reason: Online Usage disabled. Enable it:https://1.hdfc.bank.in/HDFCBK/a/14AjOHa',
  },
]

describe('SMS extraction corpus (anonymized real formats)', () => {
  it.each(TRANSACTIONS)('$label', (entry) => {
    expect(isTransactionCandidate(entry.body)).toBe(entry.type)

    const intent = entry.type === TRANSACTION_TYPE.Credit ? 'income' : 'expense'
    const fields = SMSDataExtractor.extract(entry.body, intent)
    expect(fields.amount?.value).toBe(entry.amount)
    expect(fields.merchant).toBe(entry.merchant)
  })

  it.each(NON_TRANSACTIONS)('$label is not a transaction candidate', (entry) => {
    expect(isTransactionCandidate(entry.body)).toBeNull()
  })
})
