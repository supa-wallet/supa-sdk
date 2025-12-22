# Supa SDK

Supa SDK allows dApps to integrate with Supa backend and Canton Network. The SDK handles Privy.io authentication, Stellar wallet management, and Canton Network transactions.

## Limitation

Currently, we only support Ed25519 signing via Stellar wallets for Canton Network integration.

## Quick overview

For a quick overview, check out the demo application in `/demo` folder.

## Usage guide

To use the Supa SDK, install it from NPM:

```bash
npm install @supa/sdk
# or
yarn add @supa/sdk
# or
pnpm add @supa/sdk
```

Then import it in your dApp:

```tsx
import { SupaProvider, useAuth, useCanton, useAPI } from '@supa/sdk';
```

### 1. Initialize the SDK

Wrap your application with `SupaProvider`:

```tsx
import { SupaProvider } from '@supa/sdk';

function App() {
  return (
    <SupaProvider
      config={{
        privyAppId: import.meta.env.VITE_PRIVY_APP_ID,
        privyClientId: import.meta.env.VITE_PRIVY_CLIENT_ID,
        apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
        appearance: {
          theme: 'light',
          accentColor: '#6366f1',
        },
        loginMethods: ['email', 'wallet', 'google'],
      }}
    >
      <YourApp />
    </SupaProvider>
  );
}
```

The `config` object accepts:
- `privyAppId`: Your Privy App ID (required)
- `privyClientId`: Your Privy Client ID (optional)
- `apiBaseUrl`: Backend API URL (default: `https://stage_api.supa.fyi`)
- `appearance`: Privy modal appearance (`theme`, `accentColor`, `logo`)
- `loginMethods`: Array of login methods (`email`, `wallet`, `google`, `twitter`, etc.)

### 2. Authentication

Use the `useAuth` hook to manage authentication:

```tsx
import { useAuth } from '@supa/sdk';

function LoginButton() {
  const { login, logout, authenticated, user } = useAuth();

  if (!authenticated) {
    return <button onClick={login}>Login with Privy</button>;
  }

  return (
    <div>
      <p>Welcome, {user?.email?.address}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### 3. Canton Network Operations

Use the `useCanton` hook for Canton Network integration:

```tsx
import { useCanton } from '@supa/sdk';

function CantonWallet() {
  const { 
    registerCanton, 
    isRegistered, 
    tapDevnet, 
    signHash,
    loading 
  } = useCanton();

  const handleRegister = async () => {
    await registerCanton();
    console.log('Canton wallet registered!');
  };

  const handleTap = async () => {
    const result = await tapDevnet('1000');
    console.log('Received tokens:', result);
  };

  return (
    <div>
      {!isRegistered ? (
        <button onClick={handleRegister} disabled={loading}>
          Register Canton Wallet
        </button>
      ) : (
        <button onClick={handleTap} disabled={loading}>
          Get Test Tokens
        </button>
      )}
    </div>
  );
}
```

#### Sign a Hash

```tsx
const { signHash } = useCanton();

// Hash in base64 format
const hashBase64 = 'EiDjNqHetYYin8ypx87LAmJwzxhBX4rFMi4Z/sSsvdQ7bg==';
const signature = await signHash(hashBase64);
console.log('Signature (base64):', signature);
```

#### Sign a Message

```tsx
const { signMessage } = useCanton();

const signature = await signMessage('Hello, Canton!');
console.log('Signature:', signature);
```

#### Send Transaction

```tsx
const { sendTransaction } = useCanton();

const result = await sendTransaction(commandId, disclosedContracts);
console.log('Transaction result:', result);
```

### 4. Backend API

Use the `useAPI` hook for backend operations:

```tsx
import { useAPI } from '@supa/sdk';

function UserBalance() {
  const api = useAPI();
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    api.user.getBalance().then(setBalance);
  }, []);

  return <div>Balance: ${balance?.totalUsdBalance.toFixed(2)}</div>;
}
```

Available API methods:

```tsx
// User
await api.user.getCurrent();
await api.user.getBalance();

// Dialogs
await api.dialogs.create('Hello AI!');
await api.dialogs.findAll({ page: 1, limit: 10 });
await api.dialogs.findOne(dialogId);
await api.dialogs.delete(dialogId);

// Messages
await api.messages.create(dialogId, 'Message text');
await api.messages.findAll(dialogId, { page: 1 });

// SupaPoints
await api.supaPoints.getBalance();
await api.supaPoints.dailyLogin();
await api.supaPoints.getHistory();

// Transactions
await api.transactions.get({ page: 1, limit: 20 });
```

## Utilities

SDK exports utility functions for advanced usage:

```tsx
import {
  hexToBase64,
  base64ToHex,
  privyPublicKeyToCantonBase64,
  getStellarWallets,
} from '@supa/sdk';
```

## TypeScript

Full TypeScript support with generated types:

```tsx
import type {
  UserResponseDto,
  UserBalanceResponseDto,
  DialogWithMessagesResponseDto,
  StellarWallet,
} from '@supa/sdk';
```

# API

See [doc/en/api-reference.md](./doc/en/api-reference.md) for complete API documentation.

# Development Guide

This section is for SDK development. To use the SDK, follow the Usage Guide above.

### Install dependencies

```bash
npm install
```

### Run demo application

```bash
cd demo
npm install
npm run dev
```

### Build SDK

```bash
npm run build
```

Output in `/dist`:
- `index.cjs.js` - CommonJS
- `index.esm.js` - ES Modules

### Type checking

```bash
npm run type-check
```

# Publish

```bash
npm run build
npm publish
```

---

**Version:** 0.1.0  
**React:** 18+ / 19  
**TypeScript:** 5+  
**Privy SDK:** 3.3.0+
