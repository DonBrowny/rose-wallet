# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Rose Wallet is a privacy-first personal finance app for Android that parses transaction SMS messages locally, discovers spending patterns, and helps users budget and analyze their spending. All data is stored offline using SQLite.

## Development Commands

### Package Manager

This project uses `pnpm` (version 9) as the package manager.

```bash
# Install dependencies
pnpm install

# Start Metro bundler
pnpm start

# Run on Android (development build)
pnpm android

# Database migrations (Drizzle)
pnpm db:generate
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run type checking
pnpm type-check
```

### Code Quality

```bash
# Lint code
pnpm lint

# Lint and auto-fix issues
pnpm lint:fix

# Format code with Prettier
pnpm format

# Check formatting
pnpm format:check
```

### Release Process

```bash
# Bump version and create git tag (uses np)
pnpm run app-release
```

After creating a release:

1. Publish GitHub Release (triggers QA build to Play Beta automatically)
2. Monitor build at EAS dashboard or via `eas build:list`
3. Test on device from Play Beta
4. Promote to Production via GitHub Actions workflow

## Architecture

### Database Layer (Drizzle + SQLite)

The app uses Drizzle ORM with expo-sqlite for local-first data storage. Database schema is defined in `src/db/schema.ts` with the following core entities:

- **smsMessages**: Raw SMS data (sender, body, timestamp)
- **transactions**: Parsed financial transactions with amount, type, merchant, category
- **patterns**: SMS parsing patterns (grouping + extraction templates) with status tracking
- **patternSmsGroup**: Links patterns to SMS messages with confidence scores
- **merchants**: Merchant names extracted from transactions
- **categories**: User-defined spending categories (hierarchical with parentId)
- **merchantCategoryGroups**: Associates merchants with categories

**Database access**: Use `getDrizzleDb()` from `src/services/database/db.ts` to get the Drizzle instance. Each entity has a repository in `src/services/database/*-repository.ts` for CRUD operations.

### SMS Parsing Pipeline

The SMS parsing system is the core of the app, consisting of several services:

1. **SMSReaderService** (`src/services/sms-parsing/sms-reader-service.ts`):
   - Reads SMS via native module `rose-sms-reader`
   - Handles timestamp filtering and message retrieval

2. **SMSIntentService** (`src/services/sms-parsing/sms-intent-service.ts`):
   - Uses on-device ML (executorch) to classify SMS intent
   - Determines if SMS is a transaction ("txn") or not ("not_txn")

3. **SMSDataExtractor** (`src/services/sms-parsing/sms-data-extractor-service.ts`):
   - Extracts transaction details (amount, merchant, bank) from SMS body
   - Uses the `transaction-sms-parser` library

4. **SMSService** (`src/services/sms-parsing/sms-service.ts`):
   - Orchestrates the full pipeline: permission → read → classify → extract
   - Main entry point: `getTransactionsFromSMS()` and `getDistinctSMSMessagesLastNDays()`

### Pattern Discovery System

The pattern discovery system groups similar transaction SMS messages and creates reusable extraction templates:

- **Pattern finding** (`src/utils/pattern/find-distinct-pattern.ts`):
  - Uses string similarity (80% threshold) to group SMS with similar structure
  - Generates two templates per pattern:
    - **Grouping template**: Aggressive normalization for fast comparison
    - **Extraction template**: Alignment-based template for data extraction

- **Template generation** (`src/utils/pattern/extraction-template-generator.ts` & `extraction-template-builder.ts`):
  - Creates templates by aligning multiple SMS samples
  - Templates use placeholders like `<amount>`, `<merchant>`, etc.

- **Template normalization** (`src/utils/pattern/normalize-sms-template.ts`):
  - Normalizes SMS by removing numbers, special chars, and standardizing whitespace

- **Pattern storage**:
  - Patterns stored in `patterns` table with status: "needs-review", "approved", etc.
  - Sample transactions stored in MMKV for quick access (`src/utils/mmkv/pattern-samples.ts`)

### State Management

The app uses Zustand for global state management:

- **Main store** (`src/hooks/use-store.ts`):
  - `patternReview`: Manages pattern review workflow (transactions, current index)
  - Actions: `setPatternReview`, `reviewNext`, `reviewPrev`, `finalizeReview`
  - Uses Immer middleware for immutable updates
  - Auto-generates selectors via `createSelectors` helper

- **Pattern selector**: `use-store.ts` exports functions like `reviewNext()`, `finalizeReview()` that can be called from anywhere

### Navigation (Expo Router)

File-based routing using Expo Router with the following structure:

- `src/app/_layout.tsx`: Root layout with SQLite provider, migrations, and tour guide
- `src/app/(tabs)/`: Bottom tab navigation (home, analytics, settings)
- `src/app/(shared)/`: Shared modal screens (pattern-review, add-expense, patterns)
- `src/app/onboarding.tsx`: First-run onboarding flow

### UI & Styling

- **Styling**: React Native Unistyles (`src/unistyles.ts` and `src/theme/theme.ts`)
  - Each component has a `.style.ts` or `.styles.ts` file with Unistyles
  - Theme colors, spacing, and fonts defined centrally

- **Components**: Located in `src/components/` with co-located test files
  - Follow pattern: `component-name/component-name.tsx` and `component-name/component-name.spec.tsx`

### Native Module (rose-sms-reader)

Custom Expo module in `modules/rose-sms-reader/`:

- Written in Kotlin for Android (`android/src/main/java/expo/modules/rosesmsreader/RoseSmsReaderModule.kt`)
- Exports: `readSMS()`, `requestSMSPermission()`, `checkSMSPermission()`, `isAvailable()`
- Web stub exists but returns empty data

## Code Style

### From Cursor Rules (.cursor/rules/general.mdc)

Key conventions to follow:

- **TypeScript**: Use interfaces over types; avoid enums (use literal types)
- **Functions**: Use `function` keyword for pure functions
- **Naming**:
  - camelCase for variables/functions (e.g., `isFetchingData`, `handleUserInput`)
  - PascalCase for components (e.g., `UserProfile`, `ChatScreen`)
  - lowercase-with-dashes for directories (e.g., `user-profile`, `chat-screen`)
- **Component structure**: Functional components with clear prop interfaces
- **Error handling**: Use early returns, guard clauses, prioritize edge cases at start of functions
- **State**: Minimize `useEffect` and `setState`; prefer Zustand and derived state
- **Test files**: Co-locate tests with components in same folder (`*.spec.tsx` or `*.spec.ts`)

### Prettier Config

- Single quotes (except JSX: `jsxSingleQuote: true`)
- No semicolons (`semi: false`)
- Print width: 120
- Arrow parens: always
- Trailing commas: ES5

## Path Aliases

TypeScript path alias configured in `tsconfig.json`:

- `@/*` maps to `./src/*`

Use absolute imports: `import { getDrizzleDb } from '@/services/database/db'`

## Testing

- Framework: Jest with jest-expo preset
- Setup files: `jest-setup.js`, `src/unistyles.ts`, `react-native-unistyles/mocks`
- Test pattern: `**/?(*.)+(spec|test).ts?(x)`
- Run single test file:
  ```bash
  pnpm test -- path/to/file.spec.ts
  ```

## Key Implementation Notes

1. **Database migrations**: Run `pnpm db:generate` after schema changes in `src/db/schema.ts`. Migrations are in `src/drizzle/migrations/`.

2. **Pattern review workflow**:
   - User reviews transaction samples for a pattern
   - Can edit merchant names, amounts, dates
   - On finalize: builds final extraction template and updates pattern in DB
   - Uses `finalizeReview()` from `use-store.ts`

3. **MMKV storage**: Used for fast key-value storage (pattern samples, user preferences)
   - Access via `src/utils/mmkv/storage.ts`
   - Pattern samples: `src/utils/mmkv/pattern-samples.ts`

4. **Transaction hashing**: Uses MurmurHash3 (`src/utils/hash/murmur32.ts`) for deduplication

5. **Native module development**: If modifying `rose-sms-reader`, rebuild with:
   ```bash
   cd modules/rose-sms-reader/android && ./gradlew build
   ```

## Release Configuration (EAS)

Profiles in `eas.json`:

- `development`: Dev client (APK, local testing)
- `preview`: Internal preview (APK)
- `beta`: Play Store Beta track (AAB, auto-submit)
- `production`: Play Store Production (AAB, auto-increment versionCode)

Version management:

- `versionName` synced with `package.json` version via `app.config.ts`
- Android `versionCode` auto-increments in production builds
