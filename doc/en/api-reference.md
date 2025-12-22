# API Reference

Complete reference for all API methods, hooks, and types in Supa SDK.

## Table of Contents

- [SupaProvider](#supaprovider)
- [useAuth](#useauth)
- [useCanton](#usecanton)
- [useAPI](#useapi)
- [useSupa](#usesupa)
- [Utilities](#utilities)
- [TypeScript Types](#typescript-types)

---

## SupaProvider

Main SDK provider. Must wrap your entire application.

### Props

```typescript
interface SupaProviderProps {
  config: SupaConfig;
  children: ReactNode;
}

interface SupaConfig {
  /** Privy App ID (required) */
  privyAppId: string;
  
  /** Privy Client ID (optional) */
  privyClientId?: string;
  
  /** Backend API base URL (default: https://stage_api.supa.fyi) */
  apiBaseUrl?: string;
  
  /** Privy appearance configuration */
  appearance?: {
    theme?: 'light' | 'dark';
    accentColor?: string;
    logo?: string;
  };
  
  /** Login methods for Privy */
  loginMethods?: Array<
    'email' | 'wallet' | 'google' | 'twitter' | 
    'discord' | 'github' | 'linkedin'
  >;
}
```

### Example

```tsx
import { SupaProvider } from '@supa/sdk';

function App() {
  return (
    <SupaProvider
      config={{
        privyAppId: 'your_app_id',
        privyClientId: 'your_client_id',
        apiBaseUrl: 'https://stage_api.supa.fyi',
        appearance: {
          theme: 'light',
          accentColor: '6366f1',
          logo: 'https://your-domain.com/logo.png',
        },
        loginMethods: ['email', 'wallet', 'google'],
      }}
    >
      <YourApp />
    </SupaProvider>
  );
}
```

---

## useAuth

Hook for managing authentication through Privy.

### Returns

```typescript
interface UseAuthReturn {
  /** Opens Privy login modal */
  login: () => void;
  
  /** Logs out current user */
  logout: () => Promise<void>;
  
  /** Authentication status */
  authenticated: boolean;
  
  /** Loading state */
  loading: boolean;
  
  /** Privy user object */
  user: PrivyUser | null;
  
  /** Get JWT token for API requests */
  getAccessToken: () => Promise<string | null>;
  
  /** SDK ready state */
  ready: boolean;
}
```

### Examples

#### Basic Authentication

```tsx
import { useAuth } from '@supa/sdk';

function LoginButton() {
  const { login, logout, authenticated, user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!authenticated) {
    return <button onClick={login}>Login</button>;
  }

  return (
    <div>
      <p>Welcome, {user?.email?.address}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

#### Getting Token for API

```tsx
import { useAuth } from '@supa/sdk';

function SecureComponent() {
  const { getAccessToken, authenticated } = useAuth();

  const makeSecureRequest = async () => {
    if (!authenticated) {
      alert('Please login first');
      return;
    }

    const token = await getAccessToken();
    
    // Use token in your requests
    const response = await fetch('https://api.example.com/data', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  };

  return <button onClick={makeSecureRequest}>Secure Action</button>;
}
```

#### Protected Route

```tsx
import { useAuth } from '@supa/sdk';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const { authenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
```

---

## useCanton

Hook for Canton Network operations.

### Returns

```typescript
interface UseCantonReturn {
  // Wallets
  /** Primary Stellar wallet */
  stellarWallet: StellarWallet | null;
  
  /** All user's Stellar wallets */
  stellarWallets: StellarWallet[];
  
  /** Create new Stellar wallet */
  createStellarWallet: () => Promise<StellarWallet | null>;
  
  // Canton operations
  /** Register Canton wallet on backend */
  registerCanton: () => Promise<void>;
  
  /** Canton registration status */
  isRegistered: boolean;
  
  /** Get tokens from devnet faucet */
  tapDevnet: (amount: string) => Promise<CantonSubmitTransactionResponseDto>;
  
  /** Sign hash (base64) */
  signHash: (hashBase64: string) => Promise<string>;
  
  // State
  /** Operation loading state */
  loading: boolean;
  
  /** Execution error */
  error: Error | null;
  
  /** Clear error */
  clearError: () => void;
}

interface StellarWallet {
  address: string;
  publicKey: string;
  chainType: 'stellar';
  walletClientType?: string;
  imported?: boolean;
}
```

### Examples

#### Register Canton Wallet

```tsx
import { useCanton } from '@supa/sdk';

function RegisterCanton() {
  const { registerCanton, isRegistered, loading, error } = useCanton();

  const handleRegister = async () => {
    try {
      await registerCanton();
      alert('Canton wallet registered successfully!');
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  if (isRegistered) {
    return <p>Canton wallet is registered</p>;
  }

  return (
    <>
      <button onClick={handleRegister} disabled={loading}>
        {loading ? 'Registering...' : 'Register Canton Wallet'}
      </button>
      {error && <p style={{ color: 'red' }}>{error.message}</p>}
    </>
  );
}
```

#### Get Test Tokens

```tsx
import { useCanton } from '@supa/sdk';

function TapDevnet() {
  const { tapDevnet, loading, error, clearError } = useCanton();

  const handleTap = async () => {
    clearError();
    try {
      const result = await tapDevnet('1000');
      console.log('Transaction result:', result);
      alert('Tokens received!');
    } catch (err) {
      console.error('Tap failed:', err);
    }
  };

  return (
    <>
      <button onClick={handleTap} disabled={loading}>
        {loading ? 'Processing...' : 'Get 1000 Test Tokens'}
      </button>
      {error && <p style={{ color: 'red' }}>{error.message}</p>}
    </>
  );
}
```

#### Sign Custom Hash

```tsx
import { useCanton } from '@supa/sdk';
import { useState } from 'react';

function SignHash() {
  const { signHash, stellarWallet, loading } = useCanton();
  const [hash, setHash] = useState('');
  const [signature, setSignature] = useState('');

  const handleSign = async () => {
    if (!stellarWallet) {
      alert('No Stellar wallet found');
      return;
    }

    try {
      // hash must be in base64
      const sig = await signHash(hash);
      setSignature(sig);
      console.log('Signature (base64):', sig);
    } catch (err) {
      console.error('Signing failed:', err);
    }
  };

  return (
    <div>
      <input
        value={hash}
        onChange={(e) => setHash(e.target.value)}
        placeholder="Hash (base64)"
      />
      <button onClick={handleSign} disabled={loading || !hash}>
        Sign Hash
      </button>
      {signature && <p>Signature: {signature}</p>}
    </div>
  );
}
```

---

## useAPI

Hook for working with Supa Backend API.

### Returns

```typescript
interface UseAPIReturn {
  user: UserAPI;
  dialogs: DialogsAPI;
  messages: MessagesAPI;
  supaPoints: SupaPointsAPI;
  transactions: TransactionsAPI;
}
```

### User API

```typescript
interface UserAPI {
  /** Get current user */
  getCurrent: () => Promise<UserResponseDto>;
  
  /** Get all users */
  getAll: () => Promise<UserResponseDto[]>;
  
  /** Get user balance */
  getBalance: (forceLoad?: boolean) => Promise<UserBalanceResponseDto>;
}
```

**Example:**

```tsx
import { useAPI } from '@supa/sdk';
import { useEffect, useState } from 'react';

function UserBalance() {
  const api = useAPI();
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    api.user.getBalance().then(setBalance);
  }, []);

  if (!balance) return <p>Loading...</p>;

  return (
    <div>
      <h2>Total: ${balance.totalUsdBalance.toFixed(2)}</h2>
      {balance.balances.map((token) => (
        <p key={token.contractAddress}>
          {token.symbol}: {token.tokenBalanceDecimal}
        </p>
      ))}
    </div>
  );
}
```

### Dialogs API

```typescript
interface DialogsAPI {
  /** Create new dialog */
  create: (text: string) => Promise<DialogWithMessagesResponseDto>;
  
  /** Get all dialogs */
  findAll: (params?: PaginationParams) => Promise<PaginatedDialogs>;
  
  /** Get one dialog */
  findOne: (id: number) => Promise<DialogListResponseDto>;
  
  /** Delete dialog */
  delete: (id: number) => Promise<void>;
}
```

**Example:**

```tsx
import { useAPI } from '@supa/sdk';
import { useState } from 'react';

function CreateDialog() {
  const api = useAPI();
  const [message, setMessage] = useState('');

  const handleCreate = async () => {
    const dialog = await api.dialogs.create(message);
    console.log('Dialog created:', dialog.id);
    console.log('AI response:', dialog.messages[1].message);
  };

  return (
    <>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Your message"
      />
      <button onClick={handleCreate}>Create Dialog</button>
    </>
  );
}
```

### Messages API

```typescript
interface MessagesAPI {
  /** Create message in dialog */
  create: (dialogId: number, text: string) => Promise<MessageResponseDto>;
  
  /** Get all dialog messages */
  findAll: (dialogId: number, params?: PaginationParams) => Promise<PaginatedMessages>;
  
  /** Get one message */
  findOne: (id: number) => Promise<MessageResponseDto>;
}
```

### SupaPoints API

```typescript
interface SupaPointsAPI {
  /** Get SupaPoints balance */
  getBalance: () => Promise<{ balance: number }>;
  
  /** Get SupaPoints history */
  getHistory: (params?: PaginationParams) => Promise<any>;
  
  /** Daily login bonus */
  dailyLogin: () => Promise<{ balance: number; add: number }>;
}
```

### Transactions API

```typescript
interface TransactionsAPI {
  /** Get transactions */
  get: (params?: PaginationParams) => Promise<any>;
  
  /** Force load transactions */
  forceLoad: (params?: PaginationParams) => Promise<any>;
}
```

---

## useSupa

Main hook combining all other hooks.

### Returns

```typescript
interface UseSupaReturn {
  /** Authentication methods and user state */
  auth: UseAuthReturn;
  
  /** Canton Network operations and wallet management */
  canton: UseCantonReturn;
  
  /** Backend API methods for data access */
  api: UseAPIReturn;
  
  /** Automated onboarding flow (login → create wallet → register Canton) */
  onboard: () => Promise<void>;
}
```

### Example

```tsx
import { useSupa } from '@supa/sdk';

function Dashboard() {
  const { auth, canton, api } = useSupa();

  return (
    <div>
      <h1>Dashboard</h1>
      
      {!auth.authenticated ? (
        <button onClick={auth.login}>Login</button>
      ) : (
        <>
          <p>Welcome, {auth.user?.email?.address}!</p>
          
          {!canton.isRegistered ? (
            <button onClick={canton.registerCanton}>
              Register Canton
            </button>
          ) : (
            <button onClick={() => canton.tapDevnet('1000')}>
              Get Tokens
            </button>
          )}
        </>
      )}
    </div>
  );
}
```

---

## Utilities

SDK exports utilities for advanced usage.

### Format Conversion

```typescript
/** Convert hex to base64 */
function hexToBase64(hex: string): string;

/** Convert base64 to hex */
function base64ToHex(base64: string): string;

/** Convert bytes to base64 */
function bytesToBase64(bytes: Uint8Array): string;

/** Convert base64 to bytes */
function base64ToBytes(base64: string): Uint8Array;

/** Remove leading 00 from hex string */
function stripLeadingZero(hex: string): string;
```

### Stellar/Canton Utilities

```typescript
/** Convert Privy publicKey to Canton base64 format */
function privyPublicKeyToCantonBase64(publicKeyHex: string): string;

/** Get all Stellar wallets */
function getStellarWallets(user: any, wallets: any[]): StellarWallet[];

/** Get publicKey in base64 from wallet */
function getPublicKeyBase64(wallet: StellarWallet): string;

/** Check if wallet is Stellar */
function isStellarWallet(wallet: any): wallet is StellarWallet;

/** Get first Stellar wallet or throw error */
function getFirstStellarWallet(user: any, wallets: any[]): StellarWallet;
```

### Example Using Utilities

```tsx
import { 
  hexToBase64, 
  base64ToHex,
  privyPublicKeyToCantonBase64 
} from '@supa/sdk';

// Convert public key
const wallet = { publicKey: '00e95cb2553361ed...' };
const publicKeyBase64 = privyPublicKeyToCantonBase64(wallet.publicKey);
console.log(publicKeyBase64); // "6Vyy..."

// Convert hash
const hashBase64 = 'EiDjNqHetYYin8ypx87L...';
const hashHex = base64ToHex(hashBase64);
console.log(hashHex); // "0x1220e33..."
```

---

## TypeScript Types

All types are exported from SDK and available for import.

### Main Types

```typescript
import type {
  // Config
  SupaConfig,
  SupaProviderProps,
  
  // Hook returns
  UseAuthReturn,
  UseCantonReturn,
  UseAPIReturn,
  UseSupaReturn,
  
  // Wallet types
  StellarWallet,
  
  // API DTOs (generated from Swagger)
  UserResponseDto,
  UserBalanceResponseDto,
  DialogWithMessagesResponseDto,
  MessageResponseDto,
  CantonPrepareTransactionResponseDto,
  CantonSubmitTransactionResponseDto,
  // ... and many more
} from '@supa/sdk';
```

### Using Types

```typescript
import { useCanton } from '@supa/sdk';
import type { StellarWallet, CantonSubmitTransactionResponseDto } from '@supa/sdk';

function Component() {
  const { stellarWallet, tapDevnet } = useCanton();
  
  // TypeScript knows the types
  const wallet: StellarWallet | null = stellarWallet;
  
  const handleTap = async (): Promise<CantonSubmitTransactionResponseDto> => {
    return await tapDevnet('1000');
  };
}
```

---

**Last Updated**: December 2025  
**SDK Version**: 0.1.0
