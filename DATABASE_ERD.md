# Rose Wallet Database ERD

## Mermaid Entity Relationship Diagram

```mermaid
erDiagram
    SMS_MESSAGES {
        int id PK "Primary Key"
        string sender "Encrypted Sender Address"
        string body "Encrypted SMS Content"
        timestamp date_time "Encrypted Timestamp"
    }
    
    MERCHANTS {
        int id PK "Primary Key"
        string name "Merchant Name"
    }
    
    CATEGORIES {
        int id PK "Primary Key"
        string name "Category Name"
        int parent_id FK "Parent Category (nullable)"
    }
    
    MERCHANT_CATEGORY_GROUPS {
        int id PK "Primary Key"
        int merchant_id FK "Merchant Reference"
        int category_id FK "Category Reference"
    }
    
    TRANSACTIONS {
        int id PK "Primary Key"
        int sms_id FK "SMS Reference (nullable)"
        real amount "Transaction Amount"
        string currency "Currency (default: INR)"
        string type "debit/credit"
        string description "Transaction Description"
        int category_id FK "Category Reference (nullable)"
        int merchant_id FK "Merchant Reference (nullable)"
        timestamp created_at "Creation Time"
        timestamp updated_at "Last Updated"
    }
    
    PATTERNS {
        int id PK "Primary Key"
        string name "Pattern Name"
        string grouping_pattern "Pattern to identify SMS type"
        string extraction_pattern "Pattern to extract data"
        string type "debit/credit (default: debit)"
        string status "approved/needs-review (default: needs-review)"
        boolean is_active "Active Status (default: true)"
        int usage_count "Usage Count (default: 0)"
        timestamp last_used_at "Last Used Time (nullable)"
        timestamp created_at "Creation Time"
        timestamp updated_at "Last Updated"
    }
    
    PATTERN_SMS_GROUP {
        int id PK "Primary Key"
        int pattern_id FK "Pattern Reference"
        int sms_id FK "SMS Reference"
        real confidence "Match Confidence (0.0-1.0, default: 1.0)"
        timestamp created_at "Creation Time"
    }
    
    NOTE_BUDGETS {
        string note "Budgets stored in MMKV for encryption"
    }
    
    %% Relationships
    SMS_MESSAGES ||--o{ TRANSACTIONS : "contains"
    MERCHANTS ||--o{ TRANSACTIONS : "has"
    CATEGORIES ||--o{ TRANSACTIONS : "categorizes"
    MERCHANTS ||--o{ MERCHANT_CATEGORY_GROUPS : "grouped_by"
    CATEGORIES ||--o{ MERCHANT_CATEGORY_GROUPS : "groups"
    CATEGORIES ||--o{ CATEGORIES : "parent_child"
    PATTERNS ||--o{ PATTERN_SMS_GROUP : "groups"
    SMS_MESSAGES ||--o{ PATTERN_SMS_GROUP : "grouped_by"
    
    %% Note: Budgets are stored in MMKV, not in database
```

## Database Schema Overview

### Core Tables

1. **SMS_MESSAGES** - Stores encrypted SMS messages from banks (minimal)
2. **MERCHANTS** - Merchant information
3. **CATEGORIES** - Hierarchical transaction categories
4. **MERCHANT_CATEGORY_GROUPS** - Many-to-many relationship between merchants and categories
5. **TRANSACTIONS** - Financial transactions (SMS-parsed or manual)
6. **PATTERNS** - SMS parsing patterns
7. **PATTERN_SMS_GROUP** - Links SMS messages to patterns (many-to-many relationship)

### External Storage

- **BUDGETS** - Stored in MMKV for better performance and encryption

### Key Relationships

- **SMS → Transactions**: One SMS can contain multiple transactions (nullable)
- **Merchants → Transactions**: One merchant can have many transactions
- **Categories → Transactions**: One category can have many transactions
- **Merchants ↔ Categories**: Many-to-many via MERCHANT_CATEGORY_GROUPS
- **Categories → Categories**: Self-referencing for hierarchical categories
- **Patterns ↔ SMS**: Many-to-many via PATTERN_SMS_GROUP (one pattern can match multiple SMS, one SMS can match multiple patterns)
- **Budgets**: Stored in MMKV (not in database)

### Data Flow

```
SMS Message → Pattern Discovery → Pattern-SMS Grouping → Transaction Creation → Category Assignment → Budget Tracking
```

1. **SMS arrives** → Stored in `sms_messages`
2. **Pattern discovery** → Analyzes SMS content and creates patterns
3. **Pattern-SMS grouping** → Links SMS to patterns via `pattern_sms_group`
4. **Transaction created** → Stored in `transactions` with reference to SMS
5. **Category assigned** → Links transaction to categories via `merchant_category_groups`
6. **Budget tracking** → Updates `budgets` spent amounts

### Features

- **Live Queries**: All tables support real-time updates
- **Type Safety**: Full TypeScript support with inferred types
- **Relationships**: Proper foreign key constraints
- **Timestamps**: Automatic created_at/updated_at tracking
- **Soft Deletes**: is_active flags for patterns and budgets
- **Hierarchical Categories**: Parent-child relationships for category organization
