# Changelog

All notable changes to Walletino SDK will be documented in this file.

## [0.1.0] - December 2025

### 🎉 Initial Release

First stable release of Walletino SDK with full Canton Network integration.

### ✨ Features

- **Privy.io Authentication Integration**
  - Email, wallet, and social login support
  - Automatic JWT token management
  - User profile and linked accounts access

- **Canton Network Support**
  - Full Ed25519 signing via Stellar wallets
  - Automatic public key conversion (hex → base64)
  - Canton wallet registration flow
  - Devnet faucet integration
  - Transaction signing and submission

- **Backend API Integration**
  - Type-safe API methods from Swagger specs
  - User management
  - AI dialogs and messages
  - Token prices and balances
  - Transaction history
  - SupaPoints reward system

- **React Hooks**
  - `useAuth` - Authentication management
  - `useCanton` - Canton Network operations
  - `useAPI` - Backend API access
  - `useWalletino` - Unified SDK access

- **Utility Functions**
  - Format conversion (hex ↔ base64)
  - Stellar wallet utilities
  - Type guards and validators

### 🔧 Technical

- **Buffer Polyfill** - Automatic browser polyfill built into SDK
- **TypeScript Support** - Full type safety with generated DTOs
- **React 18/19 Compatible** - Works with both React versions
- **Tree-shakeable** - Optimized bundle size
- **Zero External Dependencies** - Only Privy and Axios required

### 📚 Documentation

- Comprehensive README with examples
- API Reference documentation
- Canton Network integration guide
- JSDoc documentation throughout codebase
- Real-world usage examples
- Troubleshooting guide

### 🐛 Bug Fixes

- Fixed leading `00` byte handling in Stellar public keys
- Fixed JWT token refresh in API client
- Fixed React state synchronization in Canton registration
- Fixed type definitions for Privy user object

### ⚡ Performance

- Optimized API client with request caching
- Lazy-loaded services initialization
- Minimal re-renders in React hooks

### 🔒 Security

- Secure JWT token storage
- Automatic token refresh
- CORS-safe API configuration
- Input validation for all public methods

---

## Development Changes (Pre-release)

### Code Quality Improvements

- **Refactored to Arrow Functions**
  - All hooks converted to arrow functions
  - All utility functions converted to arrow functions
  - Improved consistency across codebase

- **English Documentation**
  - All JSDoc comments in English
  - Comprehensive @param, @returns, @throws tags
  - Real-world @example blocks
  - Type annotations for all parameters

- **Removed Debug Logging**
  - Cleaned up console.log statements
  - Kept only essential SDK lifecycle logs
  - Improved production bundle size

- **Documentation Structure**
  - Created `/doc` folder with structured guides
  - Added API Reference
  - Added Canton Integration guide
  - Added usage examples
  - Added JSDoc standards guide

---

## Migration Guide

### From Direct Privy Integration

If you're currently using Privy directly:

**Before:**
```tsx
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';

function App() {
  return (
    <PrivyProvider appId="..." clientId="...">
      <YourApp />
    </PrivyProvider>
  );
}

function Component() {
  const { login, user } = usePrivy();
  // Manual Canton integration
}
```

**After:**
```tsx
import { WalletinoProvider, useAuth, useCanton } from '@walletino/sdk';

function App() {
  return (
    <WalletinoProvider config={{ privyAppId: '...' }}>
      <YourApp />
    </WalletinoProvider>
  );
}

function Component() {
  const { login, user } = useAuth();
  const { registerCanton } = useCanton();
  // Canton integration built-in!
}
```

---

## Known Issues

None at this time.

---

## Roadmap

### v0.2.0 (Q1 2026)
- [ ] Production Canton Network support
- [ ] Batch transaction signing
- [ ] Custom Canton transaction types
- [ ] Enhanced error handling

### v0.3.0 (Q2 2026)
- [ ] Multi-wallet support
- [ ] Hardware wallet integration
- [ ] Transaction history caching
- [ ] Offline mode support

### Future
- [ ] Canton smart contract interactions
- [ ] WebSocket support for real-time updates
- [ ] Mobile SDK (React Native)
- [ ] Vue.js SDK variant

---

**Version:** 0.1.0  
**Release Date:** December 19, 2025  
**Status:** Production Ready ✅

