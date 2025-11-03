# Rose Expense Tracker - Project Structure

## Overview

This document outlines the complete file and folder structure for the Rose Expense Tracker project, organized for scalability, maintainability, and team collaboration.

## Root Directory Structure

```
rose-wallet/
├── 📁 app/                          # Expo Router app directory
├── 📁 assets/
├── 📁 components/                   # Reusable UI components
├── 📁 docs/                         # Documentation
├── 📁 hooks/                        # Custom React hooks
├── 📁 services/                     # Business logic and external services
├── 📁 db/                           # Database models and configuration
├── 📁 types/                        # TypeScript type definitions
├── 📁 utils/                        # Utility functions
├── 📁 assets/                       # Static assets
├── 📁 android/                      # Android-specific files
├── 📁 ios/                          # iOS-specific files (future)
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

### Absolute Imports

Use absolute imports with the `@/` alias:

```typescript
// Instead of
import { Button } from '../../../components/base-ui/button/button'

// Use
import { Button } from '@/components/base-ui/button/button'
```

### Type Imports

```typescript
// Database types
import { type Transaction } from '@/types/database/transaction'
import { type Category } from '@/types/database/category'
```
