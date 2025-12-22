# JSDoc Documentation Examples

This file contains JSDoc documentation examples used throughout the Supa SDK codebase.

## 📖 Documentation Standards

All SDK code follows these JSDoc standards:
- ✅ **English language** - All documentation is in English
- ✅ **Arrow functions** - Prefer arrow functions with JSDoc
- ✅ **Type annotations** - Full TypeScript + JSDoc typing
- ✅ **Examples** - Include usage examples where helpful
- ✅ **@param** - Document all parameters
- ✅ **@returns** - Document return values
- ✅ **@throws** - Document thrown errors
- ✅ **@example** - Show practical usage

## Function Documentation

### Basic Function

```typescript
/**
 * Converts hex string to base64 format
 * @param hex - Hex string (with or without 0x prefix)
 * @returns Base64 encoded string
 * @example
 * ```ts
 * const base64 = hexToBase64('0x48656c6c6f');
 * console.log(base64); // "SGVsbG8="
 * ```
 */
export const hexToBase64 = (hex: string): string => {
  // Implementation
};
```

### Function with Multiple Parameters

```typescript
/**
 * Fetches token balances for an account on a specific network
 * @param network - Blockchain network (e.g., 'ethereum', 'polygon')
 * @param account - Wallet address to query
 * @param force - Whether to force reload from blockchain (bypasses cache)
 * @returns Account balances with token information
 * @throws {Error} If network is invalid or account is malformed
 * @example
 * ```ts
 * const balances = await getAccountBalances('ethereum', '0x742d35...', true);
 * console.log('ETH balance:', balances.nativeBalance);
 * ```
 */
export const getAccountBalances = (
  network: string,
  account: string,
  force?: boolean
): Promise<AccountTokensBalancesResponse> => {
  // Implementation
};
```

### Function with Complex Return Type

```typescript
/**
 * Extracts all Stellar wallets from Privy user and wallets array
 * Combines wallets from both user.linkedAccounts and useWallets hook,
 * removing duplicates by address.
 * 
 * @param user - Privy user object
 * @param wallets - Privy wallets array from useWallets hook
 * @returns Array of unique Stellar wallets
 * 
 * @example
 * ```ts
 * const { user } = usePrivy();
 * const { wallets } = useWallets();
 * const stellarWallets = getStellarWallets(user, wallets);
 * console.log(`Found ${stellarWallets.length} Stellar wallets`);
 * ```
 */
export const getStellarWallets = (user: any, wallets: any[]): StellarWallet[] => {
  // Implementation
};
```

## React Hook Documentation

### Basic Hook

```typescript
/**
 * Hook for managing user authentication via Privy
 * Automatically configures API client with access token when user authenticates
 * 
 * @returns Authentication methods and user state
 * 
 * @example
 * ```tsx
 * function LoginButton() {
 *   const { login, logout, authenticated, user } = useAuth();
 * 
 *   if (!authenticated) {
 *     return <button onClick={login}>Login</button>;
 *   }
 * 
 *   return (
 *     <div>
 *       <p>Welcome, {user?.email?.address}!</p>
 *       <button onClick={logout}>Logout</button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useAuth = (): UseAuthReturn => {
  // Implementation
};
```

### Hook with Multiple Examples

```typescript
/**
 * Main hook for accessing all Supa SDK features
 * Combines authentication, Canton Network, and API functionality
 * 
 * @returns Combined SDK functionality with convenience methods
 * 
 * @example
 * Basic usage
 * ```tsx
 * function Dashboard() {
 *   const { auth, canton, api } = useSupa();
 * 
 *   if (!auth.authenticated) {
 *     return <button onClick={auth.login}>Login</button>;
 *   }
 * 
 *   return (
 *     <div>
 *       <p>User: {auth.user?.email?.address}</p>
 *       <button onClick={() => canton.registerCanton()}>
 *         Register Canton
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 * 
 * @example
 * Using automated onboarding
 * ```tsx
 * function OnboardButton() {
 *   const { onboard, canton } = useSupa();
 * 
 *   return (
 *     <button onClick={onboard}>
 *       {canton.isRegistered ? 'Already registered' : 'Get Started'}
 *     </button>
 *   );
 * }
 * ```
 */
export const useSupa = (): UseSupaReturn => {
  // Implementation
};
```

## Interface/Type Documentation

### Basic Interface

```typescript
/**
 * Stellar wallet interface representing a Privy Stellar wallet
 */
export interface StellarWallet {
  /** Stellar address (public key in Stellar format) */
  address: string;
  /** Raw public key in hex format */
  publicKey: string;
  /** Chain type, always 'stellar' for Stellar wallets */
  chainType: 'stellar';
  /** Wallet client type (e.g., 'privy') */
  walletClientType?: string;
  /** Whether the wallet was imported or created */
  imported?: boolean;
}
```

### Complex Return Type Interface

```typescript
/**
 * Return type for useAPI hook
 * Provides organized access to all backend API methods
 */
export interface UseAPIReturn {
  /** User management and profile methods */
  user: {
    /** Fetches current authenticated user profile */
    getCurrent: () => Promise<UserResponseDto>;
    /** Fetches all users (admin only) */
    getAll: () => Promise<UserResponseDto[]>;
    /** Fetches user's smart wallet token balances */
    getBalance: (force?: boolean) => Promise<UserBalanceResponseDto>;
  };

  /** AI dialog management methods */
  dialogs: {
    /** Creates a new AI dialog with initial message */
    create: (text: string) => Promise<DialogWithMessagesResponseDto>;
    /** Fetches all user dialogs with pagination */
    findAll: (params?: PaginationParams) => Promise<OffsetPaginatedDto<DialogListResponseDto>>;
    /** Deletes a dialog and all its messages */
    delete: (id: number) => Promise<void>;
  };

  // ... more groups
}
```

## Service/Class Documentation

### Service Method

```typescript
/**
 * Registers Canton wallet on backend
 * Handles the complete registration flow:
 * 1. Prepares registration transaction
 * 2. Signs hash with Stellar wallet
 * 3. Submits signed transaction
 * 
 * @param params - Registration parameters containing publicKey and sign function
 * @returns Promise that resolves when registration is complete
 * @throws {Error} If registration fails at any step
 * 
 * @example
 * ```ts
 * await cantonService.registerCanton({
 *   publicKey: 'base64_public_key',
 *   signFunction: async (hash) => await signRawHash(hash)
 * });
 * ```
 */
async registerCanton(params: CantonRegisterParams): Promise<void> {
  // Implementation
}
```

## Type Guards

```typescript
/**
 * Type guard to check if a wallet is a Stellar wallet
 * @param wallet - Wallet object to check
 * @returns True if wallet is a valid Stellar wallet
 * 
 * @example
 * ```ts
 * if (isStellarWallet(wallet)) {
 *   console.log('Stellar wallet address:', wallet.address);
 * }
 * ```
 */
export const isStellarWallet = (wallet: any): wallet is StellarWallet => {
  return wallet && wallet.chainType === 'stellar';
};
```

## Error-Throwing Functions

```typescript
/**
 * Gets the first Stellar wallet from user and wallets array
 * Convenience function that throws if no Stellar wallet is found
 * 
 * @param user - Privy user object
 * @param wallets - Privy wallets array from useWallets hook
 * @returns First Stellar wallet found
 * @throws {Error} If no Stellar wallet found
 * 
 * @example
 * ```ts
 * try {
 *   const wallet = getFirstStellarWallet(user, wallets);
 *   console.log('Using wallet:', wallet.address);
 * } catch (err) {
 *   console.error('No Stellar wallet available');
 * }
 * ```
 */
export const getFirstStellarWallet = (user: any, wallets: any[]): StellarWallet => {
  // Implementation that may throw
};
```

## Component/Provider Documentation

```typescript
/**
 * Main Supa SDK provider component
 * Must wrap your entire application to enable SDK functionality
 * Initializes Privy authentication and Supa services
 * 
 * @param props - Provider configuration
 * @param props.config - SDK configuration object
 * @param props.children - React children to wrap
 * 
 * @example
 * ```tsx
 * import { SupaProvider } from '@supa/sdk';
 * 
 * function App() {
 *   return (
 *     <SupaProvider
 *       config={{
 *         privyAppId: process.env.VITE_PRIVY_APP_ID,
 *         privyClientId: process.env.VITE_PRIVY_CLIENT_ID,
 *         apiBaseUrl: 'https://stage_api.supa.fyi',
 *         appearance: {
 *           theme: 'light',
 *           accentColor: '6366f1',
 *         },
 *         loginMethods: ['email', 'wallet', 'google'],
 *       }}
 *     >
 *       <YourApp />
 *     </SupaProvider>
 *   );
 * }
 * ```
 */
export const SupaProvider = ({ config, children }: SupaProviderProps) => {
  // Implementation
};
```

## File-Level Documentation

```typescript
/**
 * Stellar wallet utilities for Privy integration
 * Stellar chain type is used for Ed25519 signing required by Canton Network
 * 
 * This module provides:
 * - Wallet extraction from Privy user object
 * - Public key conversion for Canton Network
 * - Type guards for Stellar wallets
 * 
 * @module utils/stellar
 */
```

## Best Practices

### ✅ DO:

```typescript
/**
 * Converts Privy public key to Canton Network base64 format
 * Handles removal of leading 00 byte and conversion from hex to base64
 * 
 * @param wallet - Stellar wallet object containing publicKey
 * @returns Public key in base64 format ready for Canton Network API
 * @throws {Error} If wallet is invalid or publicKey is missing/malformed
 * 
 * @example
 * ```ts
 * const publicKeyBase64 = getPublicKeyBase64(stellarWallet);
 * // Use with Canton Network API
 * await fetch('/canton/register/prepare', {
 *   body: JSON.stringify({ publicKey: publicKeyBase64 })
 * });
 * ```
 */
export const getPublicKeyBase64 = (wallet: StellarWallet | any): string => {
  // Implementation
};
```

### ❌ DON'T:

```typescript
// Bad: No documentation
export const getPublicKeyBase64 = (wallet: StellarWallet | any): string => {
  // Implementation
};

// Bad: Minimal documentation, no examples
/**
 * Get public key
 */
export const getPublicKeyBase64 = (wallet: StellarWallet | any): string => {
  // Implementation
};

// Bad: Russian language
/**
 * Получает публичный ключ в base64
 * @param wallet - Кошелёк
 */
export const getPublicKeyBase64 = (wallet: StellarWallet | any): string => {
  // Implementation
};
```

## Additional Tags

### @deprecated

```typescript
/**
 * Legacy function for converting public keys
 * @deprecated Use {@link privyPublicKeyToCantonBase64} instead
 * @param publicKey - Public key in hex format
 * @returns Base64 encoded public key
 */
export const legacyConvert = (publicKey: string): string => {
  // Implementation
};
```

### @see (Cross-references)

```typescript
/**
 * Main Canton registration function
 * @see {@link useCanton} for React hook usage
 * @see {@link CantonService.registerCanton} for service-level implementation
 */
```

### @internal

```typescript
/**
 * Internal helper for token validation
 * @internal
 * @param token - JWT token to validate
 */
const validateToken = (token: string): boolean => {
  // Implementation
};
```

---

**Last Updated**: December 2025  
**SDK Version**: 0.1.0  
**Documentation Standard**: JSDoc 3 + TypeScript

