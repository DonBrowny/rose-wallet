# Phase 1: SMS Pattern Discovery System

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

#### 3. **User Validation Interface**

Show users exactly what we extracted and let them confirm/correct:

- Display original SMS
- Show detected pattern
- Show extracted data with validation status
- Allow user to validate or correct
- Provide smart suggestions for invalid data (TODO)

#### 4. **Hierarchical Pattern Matching**

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
