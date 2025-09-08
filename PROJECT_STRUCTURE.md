# Rose Expense Tracker - Project Structure

## Overview

This document outlines the complete file and folder structure for the Rose Expense Tracker project, organized for scalability, maintainability, and team collaboration.

## Root Directory Structure

```
rose-wallet/
├── 📁 app/                          # Expo Router app directory
├── 📁 components/                   # Reusable UI components
├── 📁 constants/                    # App constants and configuration
├── 📁 docs/                         # Documentation
├── 📁 hooks/                        # Custom React hooks
├── 📁 services/                     # Business logic and external services
├── 📁 database/                     # Database models and configuration
├── 📁 types/                        # TypeScript type definitions
├── 📁 utils/                        # Utility functions
├── 📁 assets/                       # Static assets
├── 📁 android/                      # Android-specific files
├── 📁 ios/                          # iOS-specific files (future)
├── 📄 app.json                      # Expo configuration
├── 📄 package.json                  # Dependencies and scripts
├── 📄 tsconfig.json                 # TypeScript configuration
├── 📄 TECHNICAL_DOCUMENTATION.md    # Technical specifications
└── 📄 PROJECT_STRUCTURE.md          # This file
```

## Naming Conventions

### Files and Folders

- **Components**: kebab-case for files (e.g., `transaction-card.tsx`)
- **Hooks**: kebab-case with `use` prefix (e.g., `use-transactions.ts`)
- **Services**: kebab-case (e.g., `sms-parser.ts`)
- **Types**: kebab-case (e.g., `transaction.ts`)
- **Utils**: kebab-case (e.g., `format-currency.ts`)
- **Constants**: kebab-case (e.g., `app-constants.ts`)
- **Tests**: Same as source file with `.spec.` (e.g., `transaction-card.spec.tsx`)

### Directories

- **All Directories**: kebab-case (e.g., `transaction-card/`, `sms-parsing/`, `database-types/`)
- **Component Directories**: Each component gets its own directory with co-located tests
- **Service Directories**: Grouped by functionality (e.g., `sms-parsing/`, `analytics/`)

### Component Structure

- **Component Files**: `component-name.tsx` (kebab-case)
- **Test Files**: `component-name.spec.tsx` (co-located with component)
- **Component Directories**: `component-name/` containing both files
- **Example**: `components/cards/transaction-card/transaction-card.tsx` and `components/cards/transaction-card/transaction-card.spec.tsx`

## Import/Export Patterns

### Barrel Exports

Each directory should have an `index.ts` file for clean imports:

```typescript
// components/base-ui/index.ts
export { Button } from './button/button'
export { Input } from './input/input'
export { Card } from './card/card'

// Usage
import { Button, Input, Card } from '@/components/base-ui'
```

### Component Imports

Import components from their specific directories:

```typescript
// Direct component import
import { TransactionCard } from '@/components/cards/transaction-card/transaction-card'

// Or using barrel exports
import { TransactionCard } from '@/components/cards'
```

### Absolute Imports

Use absolute imports with the `@/` alias:

```typescript
// Instead of
import { Button } from '../../../components/base-ui/button/button'

// Use
import { Button } from '@/components/base-ui/button/button'

// Or with barrel exports
import { Button } from '@/components/base-ui'
```

### Hook Imports

```typescript
// Data hooks
import { useTransactions } from '@/hooks/data/use-transactions'
import { useCategories } from '@/hooks/data/use-categories'

// UI hooks
import { useTheme } from '@/hooks/ui/use-theme'
import { useModal } from '@/hooks/ui/use-modal'
```

### Service Imports

```typescript
// SMS services
import { SMSParser } from '@/services/sms-parsing/sms-parser'
import { SMSReader } from '@/services/sms-parsing/sms-reader'

// Database services
import { TransactionRepository } from '@/database/repositories/transaction-repository'
```

### Type Imports

```typescript
// Database types
import { Transaction } from '@/types/database/transaction'
import { Category } from '@/types/database/category'

// UI types
import { ComponentProps } from '@/types/ui/components'
```

## Environment Configuration

### Environment Files

```
.env.example                         # Template for environment variables
.env.local                          # Local development variables
.env.development                    # Development environment
.env.staging                        # Staging environment
.env.production                     # Production environment
```

### Environment Variables

```bash
# Database
DATABASE_NAME=rose_expense_tracker
MMKV_ID=rose-expense-tracker

# Security
ENCRYPTION_KEY=your-secure-key
JWT_SECRET=your-jwt-secret

# API
API_BASE_URL=https://api.example.com
API_TIMEOUT=30000

# Features
ENABLE_ANALYTICS=true
ENABLE_CRASH_REPORTING=true
ENABLE_PERFORMANCE_MONITORING=true
```

This structure provides:

- **Clear separation of concerns**
- **Scalable architecture**
- **Easy navigation and maintenance**
- **Team collaboration support**
- **Testing organization**
- **Documentation structure**

The structure follows React Native and Expo best practices while being tailored specifically for the expense tracking app's needs.
