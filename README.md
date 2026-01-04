# Supa SDK

Supa SDK allows dApps to connect to Canton Network with Privy.io authentication and Ed25519 signing via Stellar wallets.

## Quick overview

For a quick overview of the code, check out the demo application in the `/demo` folder.

## Key Features

- **Privy.io Authentication** - Email, wallet, and social login methods  
- **EVM Smart Wallets** - Support for Privy Smart Wallets with gas sponsorship
- **Built-in Confirmation Modals** - User-friendly signing confirmations
- **Theme Support** - Light/dark mode with customizable appearance
- **Automatic Polling** - Transaction completion tracking
- **TypeScript Support** - Full type safety and IntelliSense
- **React Hooks** - Simple and intuitive API

## Installation

### From npm (when published)

```bash
npm install @supa/sdk
# or
yarn add @supa/sdk
# or
pnpm add @supa/sdk
```

#### Optional: For Smart Wallets support

```bash
npm install permissionless viem
```

### From local repository

If the package is not yet published to npm, you can install it locally:

#### 1. Clone the repository

```bash
git clone <repository-url>
cd supa-sdk
```

#### 2. Install dependencies and build

```bash
npm install
npm run build
```

#### 3. Link to your project

**Option A: Using npm link (recommended)**

In the SDK directory:
```bash
npm link
```

In your project directory:
```bash
npm link @supa/sdk
```

**Option B: Using local path**

In your project's `package.json`, add:
```json
{
  "dependencies": {
    "@supa/sdk": "file:../path/to/supa-sdk"
  }
}
```

Then run:
```bash
npm install
```

**Option C: Using tarball**

In the SDK directory:
```bash
npm pack
```

This creates a `.tgz` file. In your project:
```bash
npm install ../path/to/supa-sdk/supa-sdk-0.1.0.tgz
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
        nodeIdentifier: 'nodeId',
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
- `nodeIdentifier` - Canton node identifier
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

#### Get Canton Balances

```tsx
const { getBalances, cantonBalances } = useCanton();

// Fetch balances
try {
  const balances = await getBalances();
  
  // Find Canton Coin token
  const cantonCoin = balances.tokens.find(
    token => token.instrumentId.id === 'Amulet'
  );
  
  if (cantonCoin) {
    console.log('Unlocked balance:', cantonCoin.totalUnlockedBalance);
    console.log('Locked balance:', cantonCoin.totalLockedBalance);
    console.log('Total balance:', cantonCoin.totalBalance);
    
    // Access locked UTXOs for details
    cantonCoin.lockedUtxos.forEach(utxo => {
      console.log('Locked amount:', utxo.amount);
      console.log('Expires at:', utxo.lock.expiresAt);
      console.log('Context:', utxo.lock.context);
    });
  }
} catch (error) {
  console.error('Failed to load balances:', error);
}

// Or use the cached state
if (cantonBalances) {
  console.log('Cached balances:', cantonBalances);
}
```

#### Send Canton Coin

```tsx
const { sendCantonCoin } = useCanton();

try {
  const result = await sendCantonCoin(
    'receiver-party::1220abc123...',  // Receiver Party ID
    '100.5',                           // Amount (max 10 decimal places)
    'Payment for services',            // Optional memo
    {
      timeout: 30000,      // completion timeout (ms)
      pollInterval: 1000,  // polling interval (ms)
    }
  );
  console.log('Canton Coin sent successfully:', result);
} catch (error) {
  // Special handling for preapproval errors
  if (error.message.includes('preapproval')) {
    console.error('Receiver must have transfer preapproval enabled');
  } else {
    console.error('Transfer failed:', error);
  }
}
```

**Note**: The amount cannot have more than 10 decimal places. Transfers are only supported to wallets with preapproved transfers enabled.

#### Submit a Transaction

```tsx
const { sendTransaction } = useCanton();

const commands = {
  // Your Canton command(s)
};

try {
  const result = await sendTransaction(commands, disclosedContracts, {
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
| `useCanton` | Canton Network | `registerCanton`, `getBalances`, `sendCantonCoin`, `signMessage`, `sendTransaction`, `getActiveContracts`, `tapDevnet` |
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
  CantonWalletBalancesResponseDto,
  CantonTokenBalanceDto,
  CantonInstrumentIdDto,
  CantonLockedUtxoDto,
  CantonUnlockedUtxoDto,
  CantonPrepareAmuletTransferRequestDto,
  
  // Option Types
  SignMessageOptions,
  SendTransactionOptions,
  ConfirmModalOptions,
  CantonSubmitPreparedOptions,
} from '@supa/sdk';
```

## How to run demo

### Prerequisites

The demo uses the local version of the SDK (`file:..` dependency), so you need to build the SDK first.

```bash
# 1. Install SDK dependencies
npm install

# 2. Create .env file in demo folder with your Privy credentials
# demo/.env:
# VITE_PRIVY_APP_ID=your_privy_app_id
# VITE_PRIVY_CLIENT_ID=your_privy_client_id
# VITE_API_BASE_URL=https://stage_api.supa.fyi
# VITE_CANTON_NODE_ID=nodeId

# 3. Build SDK, pack and run demo (one command)
npm run build && npm pack && cd demo && rm -rf node_modules/@supa node_modules/.vite package-lock.json && npm i && npm run dev
```

This command builds the SDK, creates a tarball, cleans old dependencies/cache, reinstalls and starts the dev server.

Visit http://localhost:6969 to see the demo.

> **Note**: If you make changes to the SDK source code, run the full command again to rebuild and restart.

The demo application includes:
- Complete authentication flow
- Canton wallet registration with automatic transfer preapproval
- Canton balance display with locked/unlocked UTXO details
- Canton Coin sending with validation
- Message signing with modals
- Transaction sending with modals
- Contract querying
- Devnet faucet integration
- Theme switching
- Error handling

## Development Guide

This section is for active SDK development and contribution.

### Setup for Development

```bash
# 1. Clone the repository
git clone <repository-url>
cd supa-sdk

# 2. Install dependencies
npm install

# 3. Build the SDK
npm run build
```

### Development Workflow

The demo application in `/demo` folder is already configured to use the local SDK version via `"@supa/sdk": "file:.."` dependency.

#### Recommended Workflow

```bash
# Build SDK, pack and run demo (from root directory)
npm run build && npm pack && cd demo && rm -rf node_modules/@supa node_modules/.vite package-lock.json && npm i && npm run dev
```

After making changes to SDK source, run the same command again. This ensures:
- Clean build of SDK
- Fresh tarball package
- Cleared cache and dependencies
- Proper dev server restart

### Build Output

The `npm run build` command creates distribution files in `dist/`:
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
- **Documentation**: 
  - [Smart Wallets Guide](./doc/smart-wallets.md)
  - [Usage Guide](./doc/usage.md)
- **Issues**: Report bugs on GitHub
- **Examples**: Check out the demo application for complete implementation examples

## Advanced Features

### EVM Smart Wallets

Supa SDK supports Privy Smart Wallets for EVM chains with gas sponsorship capabilities.

```tsx
<SupaProvider
  config={{
    privyAppId: 'your-app-id',
    nodeIdentifier: 'node',
    smartWallets: {
      enabled: true,
      paymasterContext: {
        mode: 'SPONSORED',
        // ... paymaster configuration
      }
    }
  }}
>
  <YourApp />
</SupaProvider>
```

See [Smart Wallets documentation](./doc/smart-wallets.md) for detailed setup and usage.

---

**Version:** 0.1.0  
**License:** MIT  
**React:** 18+ / 19  
**TypeScript:** 5+  
**Privy SDK:** 3.3.0+
