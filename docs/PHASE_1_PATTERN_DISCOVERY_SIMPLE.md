# Phase 1: SMS Pattern Discovery System

## What We're Building

A smart system that learns how to read your bank SMS messages by looking at your actual messages and asking you to confirm what it finds.

## The Problem

Different banks send SMS messages in different formats:

**SBI Bank:**
```
"Dear UPI user A/C X1234 debited by 500.0 on date 20Aug25 trf to MINVANI QUALITY Refno 12345678. If not u? call 1800111109. -SBI"
```

**HDFC Bank:**
```
"Thanks for paying Rs.10,000.00 from A/c XXXX5678 to RAZPBSEINDIACOM via HDFC Bank NetBanking. Call 18002586161 if txn not done by you."
```

Instead of hard-coding rules for each bank, we let the app learn from YOUR actual SMS messages.

## How It Works

### Step 1: Learn from Your SMS
1. App reads your SMS messages
2. Identifies transaction messages (expenses)
3. Extracts key information (amount, merchant, bank)
4. Creates patterns from your SMS structure

### Step 2: Ask You to Confirm
1. Shows you the original SMS
2. Shows what it detected (amount, merchant, etc.)
3. Creates pattern using span-based generation (character positions)
4. **Validates the data format** (amount, merchant, etc.) before saving
5. Asks you to confirm or correct

**What is Span-Based Generation?**
- Uses exact character positions instead of text replacement
- Prevents wrong replacements in complex SMS
- Example: "Rs. 500 debited... Avl Bal: Rs. 15,000" - only replaces the transaction amount (500), not the balance (15,000)

**What are Validators Before Save?**
- Checks if extracted data looks correct before saving patterns
- Prevents bad patterns from being created
- Suggests fixes if something looks wrong
- Example: Amount "abc123" → "Invalid amount format, should be numbers only"

### Step 3: Use Confirmed Patterns
1. When new SMS arrives, tries to match in this order:
   - Exact pattern + same issuerKey + known sender (best match)
   - Exact pattern + same issuerKey
   - Exact pattern (any issuerKey)
   - Similar pattern + same issuerKey
   - Fallback to backup method

2. If pattern matches:
   - Extracts data using the pattern
   - Records a "hit" for that pattern
   - Shows transaction in your app

3. **On pattern miss → record miss → run Brain-2 extraction → optionally queue a 'Needs update' card**
   - Records a "miss" for all patterns that were tried
   - Runs Brain-2 to extract data as fallback
   - Shows transaction in your app
   - If pattern accuracy drops below 80%, shows "Needs Update" card

**What is issuerKey?**
- A standardized bank identifier (HDFC, ICICI, SBI)
- Groups all bank variations together (HDFC, HDFCBK, HDFC BANK → HDFC)
- Makes matching more accurate and organized

## User Experience

### Pattern Discovery Screen
```
"We found 3 patterns from your messages. Let's review them:"

[Pattern 1: UPI Debit Pattern]
Original SMS: "Rs. 500 debited from A/C **1234 on UPI to SWIGGY@paytm"
What we detected:
  Amount: 500 ✓
  Merchant: SWIGGY@paytm ✓
  Bank: HDFC ✓
  Date: 15-Dec-24 2:30 PM ✓

Pattern: "Rs [AMOUNT] debited from [CARD] on UPI to [MERCHANT]"

[Confirm Pattern] [Edit] [Reject]
```

### Data Validation Screen
```
"Review Pattern Data"

[Amount Validation]
Value: "500" ✓ Valid format
Format: Numbers only (e.g., 500, 1,200.50)

[Merchant Validation]
Value: "SWIGGY@paytm" ✓ Valid format
Format: Letters, numbers, and @._- only

[Card Validation]
Value: "**1234" ✓ Valid format
Format: Masked format (e.g., **1234)

[Save Pattern] [Edit Data]
```

### Pattern Management
```
"Manage your SMS patterns"

[Pattern 1: HDFC UPI Pattern]
Pattern: "Rs [AMOUNT] debited from [CARD] on UPI to [MERCHANT]"
Bank: HDFC
Known Senders: VM-HDFC, AD-HDFC, HDFC, HDFCBK
Accuracy: 95% (19/20 matches)
Status: ✓ Active

[Pattern 2: ICICI Card Pattern]
Pattern: "INR [AMOUNT] debited from Card [CARD] at [MERCHANT]"
Bank: ICICI
Known Senders: ICICI, ICICIBK, ICICI BANK
Accuracy: 65% (13/20 matches)
Status: ⚠️ Needs Update
```

### Span-Based Generation Examples
```
Complex SMS with Multiple Amounts:
Original: "Rs. 500 debited from A/C **1234 on UPI to SWIGGY@paytm. Avl Bal: Rs. 15,000"

Span-Based Generation:
- Amount: "500" (position 4-7) → [AMOUNT]
- Card: "**1234" (position 25-31) → [CARD]
- Merchant: "SWIGGY@paytm" (position 45-57) → [MERCHANT]

Result: "Rs. [AMOUNT] debited from A/C [CARD] on UPI to [MERCHANT]. Avl Bal: Rs. 15,000"
✓ Correctly preserves balance amount (15,000)

Simple Text Replacement (BAD):
Result: "Rs. [AMOUNT] debited from A/C [CARD] on UPI to [MERCHANT]. Avl Bal: Rs. [AMOUNT]"
❌ Wrongly replaces balance amount too!
```

### Validators Before Save Examples
```
Good Data (PASSES VALIDATION):
- Amount: "500" → ✓ Valid (numbers only)
- Merchant: "SWIGGY@paytm" → ✓ Valid (letters, numbers, @ symbol)
- Card: "**1234" → ✓ Valid (starts with **, ends with numbers)

Bad Data (FAILS VALIDATION):
- Amount: "abc123" → ❌ Invalid (contains letters)
- Merchant: "" → ❌ Invalid (empty)
- Card: "1234" → ❌ Invalid (missing ** prefix)

Validation Messages:
- "Amount should be numbers only (e.g., 500, 1,200.50)"
- "Merchant name cannot be empty"
- "Card should start with ** (e.g., **1234)"
```

### Smart Matching Examples
```
SMS Headers That All Match the Same Pattern:

SMS from different HDFC senders:
- "VM-HDFC: Rs. 500 debited from A/C **1234 on UPI to SWIGGY@paytm"
- "AD-HDFC: Rs. 500 debited from A/C **1234 on UPI to SWIGGY@paytm"
- "HDFC: Rs. 500 debited from A/C **1234 on UPI to SWIGGY@paytm"
- "HDFCBK: Rs. 500 debited from A/C **1234 on UPI to SWIGGY@paytm"

All have issuerKey: "HDFC"
All generate the same pattern and match successfully!

SMS from different SBI senders:
- "SBI: Dear UPI user A/C X1234 debited by 500.0 on date 20Aug25 trf to MINVANI QUALITY"
- "SBINET: Dear UPI user A/C X1234 debited by 500.0 on date 20Aug25 trf to MINVANI QUALITY"
- "SBI BANK: Dear UPI user A/C X1234 debited by 500.0 on date 20Aug25 trf to MINVANI QUALITY"

All have issuerKey: "SBI"
All generate the same pattern and match successfully!
```

## Smart Pattern Monitoring

### Why We Need This
- Banks sometimes change their SMS formats
- Patterns can become less accurate over time
- We want to maintain high accuracy automatically

### How It Works
1. **Track Performance** - Count successful vs failed matches
2. **Precision Window** - Uses sliding window (last 20 matches) instead of lifetime averages
3. **Monitor Accuracy** - Calculate success percentage in the window
4. **Auto-Fix Issues** - Deactivate bad patterns, ask you to update others
5. **Fallback System** - Use backup method when patterns fail

### Precision Window Benefits
- **Recent Performance** - Focuses on recent accuracy, not old data
- **Quick Detection** - Catches pattern degradation faster
- **Fair Assessment** - Ignores old mistakes, focuses on current performance
- **Sliding Window** - Always uses last 20 matches for accuracy calculation

### Accuracy Levels (Based on Last 20 Matches)
- **Above 80%** - Pattern working well ✓
- **60-80%** - Pattern needs updating ⚠️
- **Below 60%** - Pattern deactivated, using backup ❌

### What Happens When Patterns Fail
1. **Immediate Action** - Switch to backup extraction method
2. **Notify You** - Tell you the pattern needs updating
3. **Suggest Fix** - Show you what went wrong and how to fix it
4. **Keep Learning** - Continue to improve from your feedback

## Benefits

### For You
- **No Manual Entry** - App learns from your actual SMS
- **High Accuracy** - You confirm what the app detects
- **Always Works** - Backup system when patterns fail
- **Self-Improving** - Gets better with your feedback

### For the App
- **Works with Any Bank** - Learns from your specific SMS formats
- **Future-Proof** - Adapts to new SMS formats automatically
- **Maintainable** - No hard-coded rules to update
- **Scalable** - Easy to add new banks and patterns

## Implementation Plan

### Week 1-2: Basic Pattern Discovery
- Extract amount, merchant, bank, date from SMS
- Create patterns from SMS structure
- Build user confirmation interface
- Store confirmed patterns

### Week 3-4: Pattern Usage
- Use patterns for new SMS processing
- Add pattern management interface
- Implement basic performance tracking
- Add pattern testing

### Month 2: Smart Monitoring
- Add accuracy monitoring
- Implement auto-deactivation
- Add fallback to backup method
- Create pattern update flows

### Month 3+: Advanced Features
- Add more data fields (card, balance, etc.)
- Implement pattern learning from corrections
- Add pattern sharing between users
- Create advanced analytics

## Success Metrics

- **Pattern Accuracy**: 90%+ of SMS messages correctly processed
- **User Satisfaction**: 85%+ of users complete pattern setup
- **Setup Time**: Less than 5 minutes
- **Processing Speed**: Less than 2 seconds for pattern discovery

## Key Features

### 1. **User-Controlled Learning**
- You see exactly what the app detects
- You can correct mistakes
- You control what patterns are used

### 2. **Transparent Process**
- Clear explanation of what's happening
- Easy to understand interface
- No hidden processing

### 3. **Self-Healing System**
- Automatically detects when patterns fail
- Gracefully switches to backup method
- Asks you to update declining patterns

### 4. **Future-Proof Design**
- Adapts to new bank formats automatically
- No code updates needed for new patterns
- Scales with your usage

### 5. **Span-Based Template Generation**
- Uses character positions (spans) to avoid wrong replacements
- Handles complex SMS with multiple similar values
- Ensures only the correct data is extracted
- Prevents replacing wrong instances of repeated text

### 6. **Validators Before Save**
- Checks data format before saving patterns
- Suggests fixes for common issues
- Prevents invalid patterns from being created
- Ensures only high-quality patterns are stored

### 7. **Smart Pattern Matching**
- Handles SMS header changes (VM-HDFC, AD-HDFC, HDFC)
- Learns new sender variations automatically
- Uses hierarchical matching for best accuracy
- Falls back gracefully when patterns don't match
- Groups patterns by bank using issuerKey (HDFC, ICICI, SBI)

## Conclusion

This approach makes SMS expense tracking:
- **Accurate** - You validate what the app detects
- **Adaptive** - Learns from your specific SMS formats
- **Transparent** - You understand what's happening
- **Reliable** - Backup system when patterns fail
- **User-Friendly** - Simple, clear interface

The app becomes smarter over time by learning from your actual SMS messages and your feedback, creating a personalized expense tracking experience that works with any bank.
