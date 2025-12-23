# Supa SDK

Supa SDK allows dApps to connect to Canton Network with Privy.io authentication and Ed25519 signing via Stellar wallets.

## Quick overview

For a quick overview of the code, check out the demo application in the `/demo` folder.

## Key Features

- **Privy.io Authentication** - Email, wallet, and social login methods  
- **Canton Network Integration** - Full Canton ledger access with Ed25519 signing
- **Built-in Confirmation Modals** - User-friendly signing confirmations
- **Theme Support** - Light/dark mode with customizable appearance
- **Automatic Polling** - Transaction completion tracking
- **TypeScript Support** - Full type safety and IntelliSense
- **React Hooks** - Simple and intuitive API

## Installation

```bash
npm install @supa/sdk
# or
yarn add @supa/sdk
# or
pnpm add @supa/sdk
```

## Quick Start

```tsx
import { SupaProvider, useAuth, useCanton } from '@supa/sdk';

function App() {
  return (
    <SupaProvider config={{ privyAppId: 'your-app-id' }}>
      <MyApp />
    </SupaProvider>
  );
}

function MyApp() {
  const { login, authenticated } = useAuth();
  const { registerCanton, isRegistered, sendTransaction } = useCanton();

  if (!authenticated) {
    return <button onClick={login}>Login</button>;
  }

  if (!isRegistered) {
    return <button onClick={registerCanton}>Register Canton</button>;
  }

  return (
    <button onClick={() => sendTransaction(command, contracts)}>
      Send Transaction
    </button>
  );
}
```

## Usage guide

### 1. Initialize the SDK

Wrap your application with `SupaProvider`:

```tsx
import { SupaProvider } from '@supa/sdk';

function App() {
  return (
    <SupaProvider
      config={{
        privyAppId: 'your-privy-app-id',
        apiBaseUrl: 'https://stage_api.supa.fyi', // optional
        appearance: {
          theme: 'light', // 'light' or 'dark'
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

**Configuration options:**
- `privyAppId` - Your Privy App ID (required)
- `apiBaseUrl` - Backend API URL (default: `https://stage_api.supa.fyi`)
- `appearance` - Theme and styling options
- `loginMethods` - Array of enabled authentication methods

---

### 2. Connect to the wallet

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

After successful authentication, `authenticated` becomes `true` and `user` object contains user data.

---

### 3. Canton Network Operations

#### Register Canton Wallet

```tsx
import { useCanton } from '@supa/sdk';

function CantonWallet() {
  const { registerCanton, isRegistered, cantonUser, loading } = useCanton();

  const handleRegister = async () => {
    try {
      await registerCanton();
      console.log('Canton wallet registered!');
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  if (!isRegistered) {
    return <button onClick={handleRegister} disabled={loading}>
      Register Canton Wallet
    </button>;
  }

  return (
    <div>
      <p>Party ID: {cantonUser?.partyId}</p>
      <p>Email: {cantonUser?.email}</p>
    </div>
  );
}
```

#### Get Active Contracts

```tsx
const { getActiveContracts } = useCanton();

// Get all contracts
const allContracts = await getActiveContracts();

// Filter by template IDs
const filteredContracts = await getActiveContracts([
  'template-id-1',
  'template-id-2'
]);
```

#### Submit a Transaction

```tsx
const { sendTransaction } = useCanton();

const command = {
  // Your Canton command
};

try {
  const result = await sendTransaction(command, disclosedContracts, {
    timeout: 30000,      // completion timeout (ms)
    pollInterval: 1000,  // polling interval (ms)
  });
  console.log('Transaction successful:', result);
} catch (error) {
  console.error('Transaction failed:', error);
}
```

The SDK automatically:
1. Prepares the transaction
2. Shows confirmation modal
3. Signs with user approval
4. Submits and polls for completion

#### Sign a Message

```tsx
const { signMessage } = useCanton();

try {
  const signature = await signMessage('Hello, Canton!');
  console.log('Signature:', signature);
} catch (error) {
  console.error('Signing failed:', error);
}
```

---

### 4. Devnet Operations

Request test tokens from the devnet faucet:

```tsx
const { tapDevnet } = useCanton();

try {
  const result = await tapDevnet('1000', {
    timeout: 30000,
    pollInterval: 1000,
  });
  console.log('Tokens received:', result);
} catch (error) {
  console.error('Faucet request failed:', error);
}
```

---

### 5. Advanced Features

#### Custom Modal Options

```tsx
import { useSignMessage } from '@supa/sdk';

const { signMessage } = useSignMessage();

await signMessage('Hello', {
  title: 'Sign Message',
  description: 'Please review and sign.',
  confirmText: 'Sign',
  rejectText: 'Cancel',
  onSuccess: (sig) => console.log('Signed:', sig),
  onRejection: () => console.log('Rejected'),
});
```

#### Custom Transaction Modals

```tsx
import { useSendTransaction } from '@supa/sdk';

const { sendTransaction } = useSendTransaction();

await sendTransaction(command, contracts, {
  modalTitle: 'Confirm Payment',
  modalDescription: 'Send 100 tokens to Alice',
  modalConfirmText: 'Pay Now',
  submitOptions: { timeout: 30000 },
});
```

---

## Available Hooks

| Hook | Purpose | Key Methods |
|------|---------|-------------|
| `useAuth` | Authentication | `login`, `logout`, `authenticated`, `user` |
| `useCanton` | Canton Network | `registerCanton`, `signMessage`, `sendTransaction`, `getActiveContracts`, `tapDevnet` |
| `useSignMessage` | Enhanced message signing | `signMessage` with custom modals |
| `useSendTransaction` | Enhanced transactions | `sendTransaction` with custom modals |
| `useConfirmModal` | Generic modals | `confirm`, `signMessageConfirm`, `signTransactionConfirm` |

## TypeScript Support

Full TypeScript support with generated types:

```tsx
import type {
  // Hook Return Types
  UseAuthReturn,
  UseCantonReturn,
  UseSignMessageReturn,
  UseSendTransactionReturn,
  UseConfirmModalReturn,
  
  // Canton Types
  CantonMeResponseDto,
  CantonActiveContractsResponseDto,
  CantonQueryCompletionResponseDto,
  
  // Option Types
  SignMessageOptions,
  SendTransactionOptions,
  ConfirmModalOptions,
} from '@supa/sdk';
```

## How to run demo

```bash
# Install dependencies in the root
npm install

# Navigate to demo folder
cd demo

# Install demo dependencies
npm install

# Run dev server
npm run dev
```

The demo application includes:
- Complete authentication flow
- Canton wallet registration
- Message signing with modals
- Transaction sending with modals
- Contract querying
- Devnet faucet integration
- Theme switching
- Error handling

## Development Guide

This section is only for active SDK development.

### Install dependencies

```bash
npm install
```

### Run dev server

Start the dev server with automatic SDK recompilation:

```bash
npm run dev
```

Visit http://localhost:5173 to see the demo application. The SDK will automatically recompile on changes.

### Build the SDK

```bash
npm run build
```

This creates the distribution files in `dist/`:
- `dist/index.js` - CommonJS bundle
- `dist/index.esm.js` - ES modules bundle
- `dist/index.d.ts` - TypeScript definitions

## Publish to NPM

```bash
npm run build
npm publish
```

## Support

- **Demo**: Full working example in `/demo` folder
- **Issues**: Report bugs on GitHub
- **Examples**: Check out the demo application for complete implementation examples

---

**Version:** 0.1.0  
**License:** MIT  
**React:** 18+ / 19  
**TypeScript:** 5+  
**Privy SDK:** 3.3.0+
