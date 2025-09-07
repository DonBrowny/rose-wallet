# Rose Expense Tracker - Technical Specifications

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [System Architecture](#system-architecture)
4. [Database Schema](#database-schema)
5. [SMS Parsing Engine](#sms-parsing-engine)
6. [UI Design System](#ui-design-system)
7. [State Management](#state-management)
8. [Security & Privacy](#security--privacy)
9. [Performance Requirements](#performance-requirements)
10. [Development Setup](#development-setup)
11. [Testing Strategy](#testing-strategy)
12. [Deployment](#deployment)

> **Note**: This document focuses on technical specifications and architecture decisions. For implementation details and code examples, see the `/docs/implementation/` directory.

## Project Overview

**Rose Expense Tracker** is a React Native Android application built with Expo that automatically tracks user spending by reading SMS messages from banks and financial services. The app provides detailed spending analysis, budget tracking, and financial insights.

### Key Features

- Automatic SMS reading and parsing
- Real-time expense tracking
- Budget management and alerts
- Spending analytics and insights
- Local data storage with encryption
- Offline-first architecture

## Technology Stack

### Core Framework

- **React Native**: 0.79.6
- **Expo**: ~53.0.22
- **TypeScript**: ~5.8.3
- **Platform**: Android (primary), iOS (future consideration)

### Data Management

- **React Native MMKV**: Fast key-value storage for app settings and cache
- **WatermelonDB**: Reactive database for expense data with offline-first approach
- **React Query**: Server state management and data synchronization

### SMS & Permissions

- **expo-sms**: SMS reading capabilities
- **react-native-permissions**: Android permissions management
- **expo-notifications**: Push notifications for budget alerts

### UI & Visualization

- **Tamagui**: Universal UI system with design tokens and components
- **React Navigation**: Navigation and routing
- **React Native Reanimated**: Smooth animations
- **Victory Native**: Charts and data visualization
- **React Native SVG**: Vector graphics support

### Development Tools

- **ESLint**: Code linting and formatting
- **TypeScript**: Type safety and development experience
- **Expo Dev Tools**: Development and debugging

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Rose Expense Tracker                     │
├─────────────────────────────────────────────────────────────┤
│  Presentation Layer (React Native Components)              │
│  ├── Dashboard Screen                                      │
│  ├── Transactions Screen                                   │
│  ├── Budget Screen                                         │
│  └── Settings Screen                                       │
├─────────────────────────────────────────────────────────────┤
│  Business Logic Layer                                      │
│  ├── SMS Parser Engine                                     │
│  ├── Expense Categorizer                                   │
│  ├── Budget Calculator                                     │
│  └── Analytics Engine                                      │
├─────────────────────────────────────────────────────────────┤
│  Data Layer                                                │
│  ├── React Query (Server State)                           │
│  ├── WatermelonDB (Local Database)                        │
│  └── MMKV (Key-Value Storage)                             │
├─────────────────────────────────────────────────────────────┤
│  Platform Layer                                            │
│  ├── SMS Reader (Android)                                 │
│  ├── Permissions Manager                                   │
│  └── Notification Service                                  │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow Architecture

```
SMS Message → SMS Parser → Transaction Object → WatermelonDB → React Query → UI Components
     ↓              ↓              ↓              ↓              ↓
  Android      Regex/ML      Validation      Local Storage   State Sync
```

## Database Schema

### WatermelonDB Models

#### Transaction Model

- **amount**: number - Transaction amount
- **merchant**: string - Merchant name
- **category**: string - Expense category
- **description**: string - Transaction description
- **account_number**: string - Bank account number (masked)
- **transaction_type**: 'debit' | 'credit' - Transaction type
- **bank_name**: string - Bank name
- **raw_sms**: string - Original SMS text
- **is_processed**: boolean - Processing status
- **transaction_date**: Date - Transaction date
- **created_at**: Date - Record creation date
- **updated_at**: Date - Record update date

#### Category Model

- **name**: string - Category name
- **icon**: string - Category icon identifier
- **color**: string - Category color
- **budget_limit**: number (optional) - Monthly budget limit
- **is_active**: boolean - Category status
- **created_at**: Date - Record creation date
- **updated_at**: Date - Record update date

#### Budget Model

- **category_id**: string - Reference to category
- **amount**: number - Budget amount
- **period**: 'monthly' | 'weekly' | 'yearly' - Budget period
- **is_active**: boolean - Budget status
- **start_date**: Date - Budget start date
- **end_date**: Date - Budget end date
- **created_at**: Date - Record creation date
- **updated_at**: Date - Record update date

#### Bank Model

- **name**: string - Bank name
- **sms_pattern**: string - SMS pattern regex
- **is_supported**: boolean - Support status
- **parsing_rules**: string - JSON parsing rules
- **created_at**: Date - Record creation date
- **updated_at**: Date - Record update date

## SMS Parsing Engine

### Supported Banks

- **HDFC Bank**: Primary support with multiple SMS formats
- **ICICI Bank**: Card and account transaction parsing
- **SBI Bank**: Account transaction parsing
- **Axis Bank**: Card transaction parsing
- **Kotak Bank**: Basic transaction parsing
- **PNB Bank**: Account transaction parsing

### Parsing Strategy

1. **Bank Identification**: Identify bank from SMS sender and content
2. **Pattern Matching**: Use regex patterns to extract transaction data
3. **Data Validation**: Validate extracted data for completeness
4. **Category Assignment**: Auto-assign categories based on merchant names
5. **Error Handling**: Handle parsing failures gracefully

### Transaction Data Extraction

- **Amount**: Extract numerical amount from SMS
- **Merchant**: Identify merchant name from SMS content
- **Date**: Parse transaction date and time
- **Type**: Determine if debit or credit transaction
- **Account**: Extract masked account/card number
- **Balance**: Extract available balance (if present)

## UI Design System

### Tamagui Configuration

- **Theme System**: Light and dark mode support
- **Design Tokens**: Consistent spacing, colors, and typography
- **Component Library**: Pre-built components for common UI patterns
- **Responsive Design**: Adaptive layouts for different screen sizes
- **Animation System**: Smooth transitions and micro-interactions

### Theme Structure

- **expense_light**: Light theme with clean, modern design
- **expense_dark**: Dark theme with proper contrast ratios
- **Category Colors**: Dedicated colors for expense categories
- **Semantic Colors**: Success, warning, danger, info colors
- **Typography**: Inter font family with consistent sizing

### Key Components

- **TransactionCard**: Display individual transactions
- **BudgetProgress**: Budget tracking with progress indicators
- **ExpenseForm**: Modal form for manual expense entry
- **CategoryChart**: Visual spending breakdown
- **SpendingInsights**: AI-powered spending analysis

## State Management

### React Query Configuration

- **Query Client**: Centralized query management
- **Cache Strategy**: 5-minute stale time, 10-minute cache time
- **Retry Logic**: 3 retry attempts for failed requests
- **Background Refetch**: Disabled to preserve battery
- **Query Keys**: Structured key system for cache management

### MMKV Storage

- **User Preferences**: Theme, settings, and app configuration
- **SMS Permissions**: Permission status tracking
- **Cache Data**: Temporary data and session information
- **Encryption**: Sensitive data encryption

### WatermelonDB Integration

- **Reactive Queries**: Real-time data updates
- **Offline Support**: Full offline functionality
- **Batch Operations**: Efficient bulk data operations
- **Memory Management**: Optimized for large datasets

## Security & Privacy

### Data Protection

- **Local Storage Only**: All data stays on device
- **No Cloud Sync**: No data sent to external servers
- **Encrypted Storage**: Sensitive data encrypted locally
- **User Control**: User can delete all data anytime

### Permissions

- **SMS Read**: Only for transaction parsing
- **Notifications**: For budget alerts
- **Storage**: For local data storage

### Security Measures

- **Input Validation**: Strict validation for all user inputs
- **Error Handling**: No sensitive information in error messages
- **Code Obfuscation**: Protect against reverse engineering
- **Regular Audits**: Security assessments and updates

## Performance Requirements

### Database Performance

- **Query Response**: < 100ms for common queries
- **Bulk Operations**: < 500ms for batch inserts
- **Memory Usage**: < 50MB for typical usage
- **Storage Efficiency**: Optimized data compression

### SMS Processing

- **Parsing Speed**: < 50ms per SMS
- **Background Processing**: Non-blocking SMS processing
- **Batch Processing**: Process multiple SMS together
- **Error Recovery**: Graceful handling of parsing failures

### UI Performance

- **Render Time**: < 16ms for 60fps
- **List Performance**: Smooth scrolling for 1000+ items
- **Animation**: 60fps animations
- **Memory**: Efficient component lifecycle management

## Development Setup

### Prerequisites

- Node.js 18+
- Android Studio
- Expo CLI
- Android device or emulator

### Environment Configuration

- **Development**: Local development with hot reload
- **Staging**: Testing environment with real data
- **Production**: Optimized build for app stores

### Build Configuration

- **Android**: APK and AAB builds
- **Code Signing**: Production signing setup
- **Bundle Analysis**: Size optimization
- **Performance**: Build-time optimizations

## Testing Strategy

### Unit Tests

- **SMS Parsing**: Test parsing logic for all banks
- **Database Operations**: Test CRUD operations
- **Utility Functions**: Test helper functions
- **Business Logic**: Test expense categorization

### Integration Tests

- **Database Integration**: Test WatermelonDB operations
- **SMS Integration**: Test SMS reading and parsing
- **React Query**: Test data fetching and caching
- **Navigation**: Test app navigation flow

### E2E Tests

- **User Workflows**: Complete user journeys
- **SMS Processing**: End-to-end SMS processing
- **Budget Tracking**: Budget management scenarios
- **Data Persistence**: Data storage and retrieval

### Performance Tests

- **Load Testing**: Test with large datasets
- **Memory Testing**: Memory usage optimization
- **Battery Testing**: Battery consumption analysis
- **Network Testing**: Offline/online scenarios

## Deployment

### Build Process

- **Development Build**: Local development builds
- **Staging Build**: Testing builds with real data
- **Production Build**: Optimized production builds
- **CI/CD**: Automated build and deployment

### App Store Requirements

- **Google Play Store**: Android app store compliance
- **Privacy Policy**: User data protection disclosure
- **Permissions**: Clear permission explanations
- **App Store Assets**: Icons, screenshots, descriptions

### Distribution

- **Internal Testing**: Alpha and beta testing
- **Public Release**: Production app store release
- **Updates**: Over-the-air updates
- **Analytics**: Usage tracking and crash reporting

---
