<p align="center">
  <img src="./src/assets/images/icon.png" alt="Rose Wallet Icon" width="120" height="120" />
</p>

# Rose Wallet

[![Platform](https://img.shields.io/badge/platform-Android-green)](https://developer.android.com)
[![Expo](https://img.shields.io/badge/Expo-Managed%20Workflow-000?logo=expo&logoColor=white)](https://expo.dev)
[![Package Manager](https://img.shields.io/badge/pnpm-8%2B-ffca28?logo=pnpm&logoColor=white)](https://pnpm.io)
[![License](https://img.shields.io/badge/license-See%20LICENSE-informational)](./LICENSE.MD)

Privacy-first personal finance app that parses transaction SMS, discovers patterns, and helps you budget and analyze your spending. Built with Expo and SQLite for reliable offline-first use on Android.

> Note: Google Play link will be added here when available.

## Table of Contents

- [Features](#features)
- [Screenshots](#screenshots)
- [Installation and Quick Start](#installation-and-quick-start)
- [Platform Notes](#platform-notes)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Development Scripts](#development-scripts)
- [Troubleshooting / FAQ](#troubleshooting--faq)
- [Roadmap](#roadmap)
- [License](#license)
- [Acknowledgements](#acknowledgements)

## Features

- **SMS parsing**: Extract transaction details from bank and card SMS locally on-device.
- **Pattern discovery**: Identify merchant and spending patterns for categorization.
- **Budgeting**: Create budgets and track progress by category.
- **Analytics**: Understand spending with summaries and trend insights.
- **Offline-first**: All data stored locally using SQLite; works without internet.
- **Categories**: Flexible, user-manageable categories for expenses and income.
- (Planned) **Budget alerts**: Notify when approaching or exceeding budget thresholds.

## Screenshots

Screenshots and demo GIFs will be added here.

## Installation and Quick Start

Ensure you have [pnpm](https://pnpm.io) and the Expo tooling installed.

```bash
pnpm install
pnpm start
```

Common Android flows:

```bash
# Start Metro and choose Android from the menu
pnpm start

# Or build and run a development build on Android directly
pnpm android
```

## Platform Notes

### Android

- This app targets Android. SMS read permissions are required for parsing transaction messages.
- Tested with modern Android SDKs via Expo. Device-specific OEM restrictions may affect background behavior.

## Project Structure

- `src/app`: Screens and routing (Expo Router).
- `src/components`: Reusable UI components.
- `src/services`: Local services (e.g., database, SMS parsing).
- `src/db`: Schema and migrations (SQLite via Drizzle ORM).
- `src/hooks`: Reusable hooks and state utilities (Zustand).
- `src/theme`: Theming and styles.
- `modules/rose-sms-reader`: Native Android SMS reading module used by the app.

## Tech Stack

- **Runtime**: React Native (Expo)
- **Database**: SQLite (`expo-sqlite`) with Drizzle ORM
- **Navigation**: Expo Router, React Navigation
- **State**: Zustand
- **UI**: React Native + custom components

## Development Scripts

```bash
# Start the dev server (Metro)
pnpm start

# Run on Android (development build)
pnpm android

# Lint and format
pnpm lint
pnpm lint:fix
pnpm format
pnpm format:check

# Tests
pnpm test
pnpm test:coverage

# DB codegen (Drizzle)
pnpm db:generate
```

## Troubleshooting / FAQ

- If Android build fails to install, ensure an emulator or device is connected and authorized.
- If SMS parsing does not work, verify SMS read permissions are granted in system settings.
- Clear Metro cache when encountering bundling issues:

```bash
rm -rf node_modules .expo .cache
pnpm install
pnpm start -- --clear
```

## Roadmap

- Budget alerts for threshold notifications
- Release on Google Play (stable channel)
- Extended analytics (cashflow, merchant insights)
- Data backup/restore and CSV export/import
- Evaluate iOS support feasibility (permissions and platform constraints)

## License

Licensed under the same terms as the upstream reference project. See [LICENSE](./LICENSE.MD) for details.

## Acknowledgements

- Built with Expo, React Native, and SQLite.
- Inspired by the structure and clarity of the `namida` README. See: https://github.com/namidaco/namida/blob/main/README.md
