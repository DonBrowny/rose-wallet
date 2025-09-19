# Phase 1: SMS Pattern Discovery System

## Table of Contents

1. [Overview](#overview)
2. [What We Are Doing](#what-we-are-doing)
3. [Why We Are Doing This](#why-we-are-doing-this)
4. [How We Are Doing It](#how-we-are-doing-it)
5. [Technical Implementation](#technical-implementation)
6. [User Experience Flow](#user-experience-flow)
7. [Success Metrics](#success-metrics)
8. [Next Steps](#next-steps)

## Overview

Phase 1 introduces a user-centric SMS pattern discovery system that learns from the user's actual SMS messages to create accurate, personalized transaction parsing patterns. This approach replaces hard-coded regex patterns with intelligent, user-validated pattern recognition.

## What We Are Doing

### Core Concept

We are building a **two-phase pattern discovery system**:

1. **Phase 1: Pattern Discovery** - Learn from user's existing SMS messages
2. **Phase 2: Pattern Matching** - Use learned patterns for new SMS processing

### Key Components

#### 1. **SMS Processing Pipeline**
```
User's SMS Messages → Brain 1 (Intent Classification) → Brain 2 (Data Extraction) → Pattern Generation → User Validation → Confirmed Patterns
```

#### 2. **Simple Data Extraction**
For the first pass, we extract only essential fields:
- **Amount** - Transaction value (Rs. 500, ₹1,200)
- **Merchant** - Business name (SWIGGY, UBER, AMAZON)
- **Bank** - Bank name (from SMS sender)
- **Date** - Transaction date (from SMS timestamp)

#### 3. **Span-Based Template Generation**
Convert SMS structure into reusable patterns using character spans (start/end positions):
```
Original SMS: "Rs. 500 debited from A/C **1234 on UPI to SWIGGY@paytm. Avl Bal: Rs. 15,000"

Span-Based Extraction:
  Amount: "500" (span: 4-7)
  Card: "**1234" (span: 25-31)
  Merchant: "SWIGGY@paytm" (span: 45-57)

Generated Template: "Rs [AMOUNT] debited from [CARD] on UPI to [MERCHANT]. Avl Bal: Rs. 15,000"
✓ Preserves balance amount (15,000) - only replaces transaction amount (500)

Simple Text Replacement (BAD):
Template: "Rs [AMOUNT] debited from [CARD] on UPI to [MERCHANT]. Avl Bal: Rs. [AMOUNT]"
❌ Wrongly replaces balance amount too!
```

#### 4. **Validators Before Save**
Validate extracted data before saving patterns to ensure quality:
```
Amount Validator: /^\d{1,3}(,\d{2,3})*(\.\d+)?$/
- Valid: "500", "1,200", "1,200.50"
- Invalid: "abc123", "", "Rs. 500"
- Error: "Amount should be numbers only (e.g., 500, 1,200.50)"

Merchant Validator: /^[A-Za-z0-9@._-]+$/
- Valid: "SWIGGY@paytm", "UBER", "AMAZON"
- Invalid: "", "123", "!@#$%"
- Error: "Merchant name cannot be empty or contain special characters"

Card Validator: /^\*{2,}\d{3,6}$/
- Valid: "**1234", "**123456"
- Invalid: "1234", "**abc", "**12"
- Error: "Card should start with ** followed by 3-6 digits (e.g., **1234)"

Bank Validator: /^[A-Za-z\s]+$/
- Valid: "HDFC", "ICICI BANK", "State Bank of India"
- Invalid: "", "123", "HDFC@123"
- Error: "Bank name should contain only letters and spaces"
```

#### 5. **User Validation Interface**
Show users exactly what we extracted and let them confirm/correct:
- Display original SMS
- Show detected pattern
- Show extracted data with validation status
- Allow user to validate or correct
- Provide smart suggestions for invalid data

#### 6. **Hierarchical Pattern Matching**
Smart matching system that handles SMS header changes:
- **Sender Normalization** - Handles VM-HDFC, AD-HDFC, HDFC variations
- **Issuer Key Extraction** - Groups patterns by bank (HDFC, ICICI, SBI)
- **Skeleton Generation** - Normalizes SMS structure for consistent matching
- **Hierarchical Fallback** - Tries best match first, then falls back gracefully

**IssuerKey Concept:**
- **Purpose**: Standardized bank identifier for organizing patterns
- **Examples**: HDFC, ICICI, SBI, AXIS, KOTAK
- **Normalization**: Maps bank variations to canonical names
  - HDFC, HDFCBK, HDFC BANK → "HDFC"
  - ICICI, ICICIBK, ICICI BANK → "ICICI"
  - SBI, SBINET, SBI BANK → "SBI"
- **Benefits**: Enables bank-specific pattern matching and organization

## Why We Are Doing This

### The Problem with Traditional Approaches

#### 1. **Hard-coded Regex Limitations**
```typescript
// Traditional approach - hard-coded for each bank
const HDFC_PATTERN = /Rs\.\s*(\d+)\s*debited from A\/C\s*\*\*(\d+)/i
const ICICI_PATTERN = /INR\s*(\d+\.?\d*)\s*debited from Card\s*\*\*(\d+)/i
const SBI_PATTERN = /Rs\s*(\d+)\/-\s*debited from A\/c\s*\*\*(\d+)/i
// ... 50+ more patterns
```

**Problems:**
- **Maintenance nightmare** - Banks change SMS formats frequently
- **Poor accuracy** - Generic patterns fail for new formats
- **No learning** - App can't adapt to user's specific SMS
- **Scalability issues** - Need to hard-code for every bank

#### 2. **SMS Format Variations**
Different banks use different formats for the same transaction type:

**HDFC UPI Debit:**
```
"Rs. 500 debited from A/C **1234 on UPI to SWIGGY@paytm"
```

**ICICI UPI Debit:**
```
"INR 500.00 debited from Card **5678 at SWIGGY@paytm"
```

**SBI UPI Debit:**
```
"Rs 500/- debited from A/c **1234 via UPI to SWIGGY@paytm"
```

**Axis UPI Debit:**
```
"Amount Rs. 500 debited from Card ending 1234 at SWIGGY@paytm"
```

### The Solution: Pattern Discovery

#### 1. **Learn from User's Actual SMS**
- Analyze user's real SMS messages
- Find common patterns automatically
- Create templates with variable fields
- Adapt to user's specific SMS formats

#### 2. **User-Centric Validation**
- User sees exactly what we extracted
- User can correct mistakes
- User controls the learning process
- Transparent and trustworthy

#### 3. **Self-Improving System**
- Patterns get better with user feedback
- Adapts to new bank formats automatically
- No code changes needed for new patterns
- Future-proof solution

## How We Are Doing It

### Phase 1: Pattern Discovery Flow

#### Step 1: SMS Collection and Filtering
```typescript
// Collect user's SMS messages
const smsMessages = await SMSReader.readMessages()

// Filter transaction SMS using Brain 1 (Intent Classification)
const transactionSMS = smsMessages.filter(sms => {
  const intent = await SMSIntent.classify(sms.body)
  return intent.label === 'expense'
})
```

#### Step 2: Data Extraction
```typescript
// Extract essential data using Brain 2 (Data Extraction)
const extractedData = transactionSMS.map(sms => {
  const data = SMSDataExtractorService.getInstance().extract(sms.body, 'expense')
  return {
    amount: data.amount?.value,
    merchant: data.merchant,
    bank: data.bank?.name,
    date: new Date(sms.date),
    sms: sms.body
  }
})
```

#### Step 3: Span-Based Template Generation
```typescript
// Generate templates using character spans for precision
const generateSpanBasedTemplate = (sms: string, extractedData: any) => {
  // Sort fields by start position (descending) to avoid offset issues
  const fields = [
    { field: 'amount', data: extractedData.amount },
    { field: 'merchant', data: extractedData.merchant },
    { field: 'card', data: extractedData.card }
  ].filter(f => f.data)
    .sort((a, b) => b.data.start - a.data.start)
  
  let template = sms
  
  // Replace from end to beginning to preserve spans
  for (const { field, data } of fields) {
    template = template.substring(0, data.start) + 
               `[${field.toUpperCase()}]` + 
               template.substring(data.end)
  }
  
  return template
}

// Example with complex SMS:
// Input: "Rs. 500 debited from A/C **1234 on UPI to SWIGGY@paytm. Avl Bal: Rs. 15,000"
// Amount: span=4-7 (only transaction amount)
// Card: span=25-31
// Merchant: span=45-57
// Output: "Rs [AMOUNT] debited from [CARD] on UPI to [MERCHANT]. Avl Bal: Rs. 15,000"
// ✓ Preserves balance amount (15,000) - only replaces transaction amount (500)

// Why spans are better than text replacement:
// Text replacement would replace ALL instances of "500" and "Rs."
// Spans ensure only the correct instances are replaced
```

#### Step 4: Validators Before Save
```typescript
// Validate extracted data before saving patterns
const validateExtractedData = (data: ExtractedData) => {
  const errors = []
  
  // Amount validator
  if (data.amount && !/^\d{1,3}(,\d{2,3})*(\.\d+)?$/.test(data.amount)) {
    errors.push({
      field: 'amount',
      message: 'Amount must be a valid number (e.g., 500, 1,200.50)',
      suggestion: data.amount.replace(/[^\d,.]/g, ''),
      regex: /^\d{1,3}(,\d{2,3})*(\.\d+)?$/
    })
  }
  
  // Merchant validator
  if (data.merchant && !/^[A-Za-z0-9@._-]+$/.test(data.merchant)) {
    errors.push({
      field: 'merchant',
      message: 'Merchant must contain only letters, numbers, and @._-',
      suggestion: data.merchant.replace(/[^A-Za-z0-9@._-]/g, ''),
      regex: /^[A-Za-z0-9@._-]+$/
    })
  }
  
  // Card validator
  if (data.card && !/^\*{2,}\d{3,6}$/.test(data.card)) {
    errors.push({
      field: 'card',
      message: 'Card must be masked format (e.g., **1234)',
      suggestion: '**' + data.card.replace(/\D/g, '').slice(-4),
      regex: /^\*{2,}\d{3,6}$/
    })
  }
  
  // Bank validator
  if (data.bank && !/^[A-Za-z\s]+$/.test(data.bank)) {
    errors.push({
      field: 'bank',
      message: 'Bank name should contain only letters and spaces',
      suggestion: data.bank.replace(/[^A-Za-z\s]/g, ''),
      regex: /^[A-Za-z\s]+$/
    })
  }
  
  return { 
    isValid: errors.length === 0, 
    errors,
    validationSummary: generateValidationSummary(errors)
  }
}

// Generate validation summary for user
const generateValidationSummary = (errors) => {
  if (errors.length === 0) {
    return "✅ All data looks good! Ready to save pattern."
  }
  
  const fieldCounts = errors.reduce((acc, error) => {
    acc[error.field] = (acc[error.field] || 0) + 1
    return acc
  }, {})
  
  const summary = Object.entries(fieldCounts)
    .map(([field, count]) => `${field}: ${count} issue${count > 1 ? 's' : ''}`)
    .join(', ')
  
  return `⚠️ Found issues: ${summary}. Please fix before saving.`
}
```

#### Step 5: User Validation Interface
```typescript
const PatternReview = ({ sms, extractedData, template, onConfirm, onEdit }) => {
  const validation = validateExtractedData(extractedData)
  
  return (
    <View style={styles.patternCard}>
      <Text variant="h3">Review SMS Pattern</Text>
      
      <View style={styles.originalSMS}>
        <Text variant="pSm">Original SMS:</Text>
        <Text style={styles.smsText}>{sms}</Text>
      </View>
      
      <View style={styles.detectedPattern}>
        <Text variant="pSm">Detected Pattern:</Text>
        <Text style={styles.templateText}>{template}</Text>
      </View>
      
      <View style={styles.extractedData}>
        <Text variant="pSm">Extracted Data:</Text>
        <Text>Amount: {extractedData.amount} {validation.isValid ? '✓' : '❌'}</Text>
        <Text>Merchant: {extractedData.merchant} {validation.isValid ? '✓' : '❌'}</Text>
        <Text>Bank: {extractedData.bank} ✓</Text>
        <Text>Date: {extractedData.date.toLocaleDateString()} ✓</Text>
      </View>
      
      {validation.errors.map(error => (
        <View key={error.field} style={styles.errorCard}>
          <Text style={styles.errorTitle}>❌ {error.field.toUpperCase()} Error</Text>
          <Text>Issue: {error.message}</Text>
          <Text>Suggestion: "{error.suggestion}"</Text>
          <Button title="Use Suggestion" onPress={() => applySuggestion(error.field, error.suggestion)} />
        </View>
      ))}
      
      <View style={styles.actions}>
        <Button 
          title="Confirm Pattern" 
          onPress={() => onConfirm(pattern)} 
          disabled={!validation.isValid}
        />
        <Button title="Edit Extraction" onPress={() => onEdit()} />
        <Button title="Reject Pattern" onPress={() => onReject()} />
      </View>
    </View>
  )
}
```

#### Step 6: Hierarchical Pattern Matching
```typescript
// Smart matching system with sender normalization
class HierarchicalPatternMatcher {
  static async matchPattern(sms: string, sender: string, intent: string): Promise<MatchResult> {
    const issuerKey = this.extractIssuerKey(sender)        // 'HDFC', 'ICICI', 'SBI'
    const normalizedSender = this.normalizeSender(sender)   // 'VM-HDFC' → 'HDFC'
    const skeleton = this.generateSkeleton(sms)            // Normalized SMS structure
    
    // Match order 1: Exact skeleton + same issuer + known sender
    let match = await this.matchExactSkeletonSameIssuerKnownSender(skeleton, issuerKey, normalizedSender)
    if (match) {
      await this.recordPatternHit(match.patternId)
      return match
    }
    
    // Match order 2: Exact skeleton + same issuer
    match = await this.matchExactSkeletonSameIssuer(skeleton, issuerKey)
    if (match) {
      await this.addSenderToPattern(match.patternId, normalizedSender)
      await this.recordPatternHit(match.patternId)
      return match
    }
    
    // Match order 3: Exact skeleton (any issuer)
    match = await this.matchExactSkeleton(skeleton)
    if (match) {
      await this.recordPatternHit(match.patternId)
      return match
    }
    
    // Match order 4: Similar skeleton + same issuer
    match = await this.matchSimilarSkeletonSameIssuer(skeleton, issuerKey)
    if (match) {
      await this.recordPatternHit(match.patternId)
      return match
    }
    
    // Match order 5: On pattern miss → record miss → run Brain-2 extraction → optionally queue a 'Needs update' card
    await this.recordPatternMisses(skeleton, issuerKey)
    const brain2Result = await this.fallbackToBrain2(sms, intent)
    await this.checkPatternAccuracyAndQueueUpdates()
    return brain2Result
  }
  
  private static normalizeSender(sender: string): string {
    // Remove DLT prefixes: VM-HDFC → HDFC
    let normalized = sender.replace(/^(VM-|AD-|JM-|TX-|IM-)/, '')
    
    // Remove bank suffixes: HDFCBK → HDFC
    normalized = normalized.replace(/\s+(BANK|BANKING|NET|SMS)$/i, '')
    
    return normalized.trim().toUpperCase()
  }
  
  private static extractIssuerKey(sender: string): string {
    const normalized = this.normalizeSender(sender)
    
    // Map bank variations to canonical names
    const bankAliases = {
      'HDFC': ['HDFC', 'HDFCBK', 'HDFC BANK'],
      'ICICI': ['ICICI', 'ICICIBK', 'ICICI BANK'],
      'SBI': ['SBI', 'SBINET', 'SBI BANK'],
      'AXIS': ['AXIS', 'AXISBANK', 'AXIS BANK']
    }
    
    for (const [issuer, aliases] of Object.entries(bankAliases)) {
      if (aliases.includes(normalized)) return issuer
    }
    
    return normalized
  }
}
```

#### Step 7: Pattern Storage
```typescript
interface ConfirmedPattern {
  id: string
  template: string
  skeleton: string           // Normalized SMS structure
  issuerKey: string         // Canonical bank name (HDFC, ICICI, SBI)
  allowedSenders: string[]  // Known sender variations
  confidence: number
  isUserConfirmed: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Store confirmed patterns with hierarchical keying
const storeConfirmedPattern = async (pattern: ConfirmedPattern) => {
  await database.write(async () => {
    await database.get('patterns').create(record => {
      record.template = pattern.template
      record.skeleton = pattern.skeleton
      record.issuerKey = pattern.issuerKey
      record.allowedSenders = JSON.stringify(pattern.allowedSenders)
      record.confidence = pattern.confidence
      record.isUserConfirmed = pattern.isUserConfirmed
      record.isActive = pattern.isActive
      record.createdAt = pattern.createdAt.getTime()
      record.updatedAt = pattern.updatedAt.getTime()
    })
  })
}
```

### Phase 2: Pattern Matching (Future)

#### New SMS Processing
```typescript
// When new SMS arrives
const processNewSMS = async (sms: string) => {
  // Get confirmed patterns
  const patterns = await database.get('patterns').query().fetch()
  
  // Try to match against confirmed patterns
  for (const pattern of patterns) {
    const match = matchPattern(sms, pattern.template)
    if (match) {
      // Extract data using confirmed pattern
      const extractedData = extractDataFromMatch(sms, match, pattern.template)
      return extractedData
    }
  }
  
  // If no pattern matches, suggest new pattern to user
  return suggestNewPattern(sms)
}
```

## Technical Implementation

### Database Schema

#### Patterns Table
```sql
CREATE TABLE patterns (
  id TEXT PRIMARY KEY,
  template TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  confidence REAL NOT NULL,
  is_user_confirmed BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

#### WatermelonDB Model
```typescript
@Model
class Pattern extends Model {
  @field('template') template!: string
  @field('bank_name') bankName!: string
  @field('confidence') confidence!: number
  @field('is_user_confirmed') isUserConfirmed!: boolean
  @field('is_active') isActive!: boolean
  @field('created_at') createdAt!: number
  @field('updated_at') updatedAt!: number
}
```

### Core Services

#### Pattern Discovery Service
```typescript
export class PatternDiscoveryService {
  static async discoverPatterns(smsMessages: SMSMessage[]): Promise<DiscoveredPattern[]> {
    const patterns: DiscoveredPattern[] = []
    
    for (const sms of smsMessages) {
      // Step 1: Intent classification
      const intent = await SMSIntent.classify(sms.body)
      if (intent.label !== 'expense') continue
      
      // Step 2: Data extraction
      const extractedData = SMSDataExtractorService.getInstance().extract(sms.body, intent.label)
      
      // Step 3: Generate template
      const template = this.generateTemplate(sms.body, extractedData)
      
      // Step 4: Check if similar pattern exists
      const existingPattern = this.findSimilarPattern(template, patterns)
      
      if (existingPattern) {
        existingPattern.occurrences++
        existingPattern.sampleMessages.push(sms.body)
      } else {
        patterns.push({
          id: `pattern_${patterns.length + 1}`,
          template,
          bank: extractedData.bank?.name || 'Unknown',
          confidence: intent.prob,
          occurrences: 1,
          sampleMessages: [sms.body],
          extractedData: [extractedData]
        })
      }
    }
    
    return patterns.sort((a, b) => b.occurrences - a.occurrences)
  }
  
  private static generateTemplate(sms: string, extractedData: any): string {
    let template = sms
    
    // Replace extracted fields with placeholders
    if (extractedData.amount?.value) {
      template = template.replace(extractedData.amount.value.toString(), '[AMOUNT]')
    }
    
    if (extractedData.merchant) {
      template = template.replace(extractedData.merchant, '[MERCHANT]')
    }
    
    // Replace card numbers with [CARD]
    template = template.replace(/\*\*\d+/, '[CARD]')
    
    return template
  }
}
```

## User Experience Flow

### Pattern Discovery Screen

#### Step 1: Processing
```
"Setting up your expense tracking patterns..."

[Processing your SMS messages...]
[Analyzing transaction patterns...]
[Generating templates...]
```

#### Step 2: Pattern Review
```
"We found 3 patterns from your messages. Let's review them:"

[Pattern 1: UPI Debit Pattern]
Found 8 similar messages
Original SMS: "Rs. 500 debited from A/C **1234 on UPI to SWIGGY@paytm"
Detected Pattern: "Rs [AMOUNT] debited from [CARD] on UPI to [MERCHANT]"
Extracted Data:
  Amount: 500
  Merchant: SWIGGY@paytm
  Bank: HDFC
  Date: 15-Dec-24 2:30 PM

[Confirm Pattern] [Edit Extraction] [Reject]

[Pattern 2: Card Debit Pattern]
Found 5 similar messages
Original SMS: "INR 500.00 debited from Card **5678 at AMAZON"
Detected Pattern: "INR [AMOUNT] debited from Card [CARD] at [MERCHANT]"
Extracted Data:
  Amount: 500
  Merchant: AMAZON
  Bank: ICICI
  Date: 15-Dec-24 3:45 PM

[Confirm Pattern] [Edit Extraction] [Reject]
```

#### Step 3: Confirmation
```
"Patterns confirmed! We'll now automatically track your expenses using these patterns."

[Start Tracking] [Review Patterns]
```

### Pattern Management Screen

#### View Confirmed Patterns
```
"Manage your SMS patterns"

[Pattern 1: UPI Debit Pattern]
Template: "Rs [AMOUNT] debited from [CARD] on UPI to [MERCHANT]"
Bank: HDFC
Success Rate: 95%
Last Used: 2 hours ago
[Edit] [Delete] [Test Pattern]

[Pattern 2: Card Debit Pattern]
Template: "INR [AMOUNT] debited from Card [CARD] at [MERCHANT]"
Bank: ICICI
Success Rate: 88%
Last Used: 1 day ago
[Edit] [Delete] [Test Pattern]
```

## Success Metrics

### Accuracy Metrics
- **Pattern Recognition Accuracy**: >90% of SMS messages correctly categorized
- **Data Extraction Accuracy**: >95% for amount, >85% for merchant
- **User Validation Rate**: >80% of patterns confirmed by user
- **Pattern Success Rate**: >90% of confirmed patterns work for new SMS

### User Experience Metrics
- **Setup Completion Rate**: >85% of users complete pattern setup
- **Time to Setup**: <5 minutes for pattern discovery
- **User Satisfaction**: >4.5/5 rating for pattern accuracy
- **Support Requests**: <5% of users need help with patterns

### Technical Metrics
- **Processing Time**: <2 seconds for pattern discovery
- **Memory Usage**: <50MB for pattern storage
- **Pattern Storage**: <1MB for 100 confirmed patterns
- **SMS Processing**: <500ms for new SMS matching

## Template Versioning & Drift Detection

### Overview

Patterns can degrade over time as banks change their SMS formats. To maintain high accuracy, we implement a self-healing system that monitors pattern performance and automatically adapts when patterns fail.

### Core Concepts

#### 1. **Pattern Metrics Tracking with Precision Window**
Each pattern tracks its performance over time using a sliding window:
- **Hits** - Number of successful matches
- **Misses** - Number of failed matches  
- **Precision** - hits / (hits + misses) in last 20 matches
- **Last Used** - Timestamp of last successful match
- **Recent Matches** - Last 20 matches for sliding window calculation
- **Total Matches** - hits + misses (lifetime)

#### 2. **Drift Detection Thresholds (Based on Precision Window)**
- **Precision Threshold**: 80% - Warning level (based on last 20 matches)
- **Auto-Deactivate Threshold**: 70% - Automatic deactivation (based on last 20 matches)
- **Re-Ask Threshold**: 60% - Ask user to update pattern (based on last 20 matches)
- **Minimum Matches**: 10 - Need sufficient data to evaluate
- **Window Size**: 20 - Sliding window for recent performance

#### 3. **Self-Healing Mechanisms**
- **On pattern miss → record miss → run Brain-2 extraction → optionally queue a 'Needs update' card**
- **Auto-Deactivation** - Disable patterns with low precision in sliding window
- **Fallback to Brain-2** - Use existing extraction when patterns fail
- **Re-Ask User** - Prompt user to update declining patterns
- **Precision Window** - Use last 20 matches for accuracy calculation
- **Pattern Suggestion** - Suggest new patterns for unmatched SMS

### Implementation Strategy

#### Phase 1: Metrics Tracking
```
For each SMS processing:
  1. Try to match against active patterns
  2. If match found:
     - Record hit for matched pattern
     - Update precision calculation
     - Update lastUsed timestamp
  3. If no match found:
     - Record miss for all patterns
     - Fallback to Brain-2 extraction
     - Consider suggesting new pattern
```

#### Phase 2: Drift Detection
```
Daily drift check:
  1. Get all active patterns
  2. For each pattern with sufficient matches:
     - Calculate current precision
     - Compare against thresholds
     - Determine required action:
       - Deactivate if precision < 70%
       - Re-ask if precision < 60%
       - Monitor if precision < 80%
```

#### Phase 3: Auto-Deactivation
```
When pattern precision drops below threshold:
  1. Deactivate pattern immediately
  2. Notify user of deactivation
  3. Switch to Brain-2 fallback
  4. Schedule pattern re-ask notification
  5. Monitor for pattern improvement opportunities
```

#### Phase 4: User Management
```
Pattern accuracy dashboard:
  1. Show all patterns with current metrics
  2. Highlight patterns below threshold
  3. Provide pattern testing functionality
  4. Allow manual pattern updates
  5. Show recent failed matches for context
```

### User Experience Flow

#### Pattern Accuracy Dashboard
```
"Pattern Accuracy Overview"

[Pattern 1: HDFC UPI Pattern]
Template: "Rs [AMOUNT] debited from [CARD] on UPI to [MERCHANT]"
Accuracy: 95% (19/20 matches)
Last Used: 2 hours ago
Status: ✓ Active

[Pattern 2: ICICI Card Pattern]  
Template: "INR [AMOUNT] debited from Card [CARD] at [MERCHANT]"
Accuracy: 65% (13/20 matches)
Last Used: 1 day ago
Status: ⚠️ Needs Update

[Pattern 3: SBI ATM Pattern]
Template: "Rs [AMOUNT] debited from [CARD] at ATM"
Accuracy: 45% (9/20 matches)
Last Used: 3 days ago
Status: ❌ Deactivated - Using Fallback
```

#### Pattern Re-Ask Flow
```
"Update Declining Pattern"

Current Pattern (65% accuracy):
"INR [AMOUNT] debited from Card [CARD] at [MERCHANT]"

Recent Failed Matches:
- "INR 500.00 debited from Card **5678 at AMAZON on 15-Jan"
- "INR 750.00 debited from Card **1234 at UBER via UPI"

Suggested Updated Pattern:
"INR [AMOUNT] debited from Card [CARD] at [MERCHANT] [EXTRA_INFO]"

[Test Updated Pattern] [Save Changes] [Deactivate Pattern]
```

### Benefits

#### 1. **Self-Healing System**
- Automatically detects pattern degradation
- Gracefully falls back to Brain-2 when patterns fail
- Continuously monitors pattern performance

#### 2. **Quality Assurance**
- Maintains high accuracy standards (80% threshold)
- Prevents bad patterns from affecting user experience
- Proactive pattern management

#### 3. **User-Centric Learning**
- Re-asks user when patterns need updating
- Shows performance metrics to user
- Lets user decide on pattern updates

#### 4. **Scalable Architecture**
- Pattern versioning for tracking changes
- Metrics tracking for performance analysis
- Configurable thresholds for different scenarios

### Configuration Options

```
Drift Detection Settings:
- Precision Threshold: 80% (warning level)
- Auto-Deactivate Threshold: 70% (automatic deactivation)
- Re-Ask Threshold: 60% (ask user to update)
- Minimum Matches: 10 (need sufficient data)
- Evaluation Window: 30 days
- Re-Ask Delay: 24 hours
```

## Next Steps

### Immediate (Week 1-2)
1. **Implement simple data extraction** (amount, merchant, bank, date)
2. **Create span-based template generation** with character spans
3. **Build user review interface** for pattern validation
4. **Implement data validation** before saving patterns
5. **Implement sender normalization** and issuer key extraction
6. **Implement pattern storage** in WatermelonDB

### Short Term (Week 3-4)
1. **Add hierarchical pattern matching** for new SMS processing
2. **Implement pattern refinement** based on user feedback
3. **Create pattern management** interface
4. **Add pattern testing** functionality
5. **Implement basic metrics tracking** (hits, misses, precision)
6. **Implement skeleton generation** and similarity matching

### Medium Term (Month 2)
1. **Add more extraction fields** (card, balance, transaction type)
2. **Implement pattern learning** from user corrections
3. **Add pattern sharing** between similar users
4. **Create pattern analytics** dashboard
5. **Implement drift detection** and auto-deactivation
6. **Add fallback to Brain-2** for failed patterns

### Long Term (Month 3+)
1. **Machine learning integration** for pattern improvement
2. **Cross-bank pattern recognition** for new banks
3. **Pattern export/import** functionality
4. **Advanced pattern analytics** and insights
5. **Automated pattern suggestion** for new SMS formats
6. **Pattern performance optimization** based on usage data

---

## Conclusion

Phase 1 introduces a revolutionary approach to SMS pattern recognition that puts the user in control. By learning from the user's actual SMS messages and validating patterns through user feedback, we create a system that is:

- **Accurate** - User validation ensures correctness
- **Adaptive** - Learns from user's specific SMS formats
- **Transparent** - User understands what's happening
- **Maintainable** - No hard-coded patterns to maintain
- **Future-proof** - Adapts to new bank formats automatically

This approach transforms SMS parsing from a technical challenge into a user-centric experience that builds trust and delivers high accuracy.
