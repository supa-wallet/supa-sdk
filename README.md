# Supa SDK

Supa SDK allows dApps to connect to Canton Network with Privy.io authentication and Ed25519 signing via Stellar wallets.

## Quick overview

For a quick overview of the code, check out the demo application in the `/demo` folder.

## Release Notes

### 0.2.34

- Added optional `commandId` parameter to `prepareTransaction` for idempotent command submission
- Added optional `deduplicationPeriod` parameter (`{ value: string }`, e.g. `"PT60S"`) to `submitPrepared` and `submitMultiplePrepared`
- Updated `CantonSubmitPreparedOptions` with `commandId` and `deduplicationPeriod` fields — these are threaded through `sendTransaction` (provider), `useSendTransaction`, and `useSendMultipleTransactions`
- Updated `SendTransactionOptions` with `commandId` field
- Updated `TransactionToSend` with per-transaction `commandId` field
- Updated `SendMultipleTransactionsOptions` with shared `deduplicationPeriod` field

## Key Features

- **Privy.io Authentication** - Email, wallet, and social login methods  
- **Wallet Export** - Export private keys for Solana wallets (with `withExport: true`)
- **EVM Smart Wallets** - Support for Privy Smart Wallets with gas sponsorship
- **Built-in Confirmation Modals** - User-friendly signing confirmations
- **Theme Support** - Light/dark mode with customizable appearance
- **Automatic Polling** - Transaction completion tracking
- **TypeScript Support** - Full type safety and IntelliSense
- **React Hooks** - Simple and intuitive API
- **Cost Estimation** - Real-time transaction cost estimation before signing
- **Incoming Transfers** - Accept or reject incoming Canton token transfers
- **Invite Codes** - Support for invite-based registration

## Installation

### From npm (when published)

```bash
npm install @supanovaapp/sdk
# or
yarn add @supanovaapp/sdk
# or
pnpm add @supanovaapp/sdk
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
npm link @supanovaapp/sdk
```

**Option B: Using local path**

In your project's `package.json`, add:
```json
{
  "dependencies": {
    "@supanovaapp/sdk": "file:../path/to/supa-sdk"
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
import { SupaProvider, useAuth, useCanton } from '@supanovaapp/sdk';

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
import { SupaProvider } from '@supanovaapp/sdk';

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
- `autoOnboarding` - Enable automatic wallet creation and Canton registration on login (default: `true`)

### Disabling Auto-Onboarding (Paywall Implementation)

By default, the SDK automatically creates a Stellar wallet and registers Canton when a user logs in (`autoOnboarding: true`). For applications with paywalls or invite-only access, you can disable this:

```tsx
<SupaProvider
  config={{
    privyAppId: 'your-privy-app-id',
    nodeIdentifier: 'nodeId',
    autoOnboarding: false, // Disable automatic wallet creation and Canton registration
  }}
>
  <YourApp />
</SupaProvider>
```

With `autoOnboarding: false`:
- Users can authenticate via Privy, but won't automatically get a Canton wallet
- You control when to call `registerCanton()` (e.g., after payment or invite code verification)
- Enables implementation of paywalls, invite systems, or conditional access

**Example: Paywall Flow**

```tsx
function PaywallApp() {
  const { authenticated } = useAuth();
  const { isRegistered, registerCanton } = useCanton();
  const [hasPaid, setHasPaid] = useState(false);

  if (!authenticated) {
    return <LoginScreen />;
  }

  if (!hasPaid) {
    return <PaywallScreen onPaymentComplete={() => setHasPaid(true)} />;
  }

  if (!isRegistered) {
    return (
      <button onClick={() => registerCanton()}>
        Create Canton Wallet
      </button>
    );
  }

  return <MainApp />;
}
```

**Example: Invite Code Flow**

```tsx
function InviteOnlyApp() {
  const { authenticated } = useAuth();
  const { isRegistered, registerCanton } = useCanton();
  const [inviteCode, setInviteCode] = useState('');

  if (!authenticated) {
    return <LoginScreen />;
  }

  if (!isRegistered) {
    return (
      <div>
        <input
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          placeholder="Enter invite code"
        />
        <button onClick={() => registerCanton(inviteCode)}>
          Register with Invite
        </button>
      </div>
    );
  }

  return <MainApp />;
}
```

---

### 2. Connect to the wallet

Use the `useAuth` hook to manage authentication:

```tsx
import { useAuth } from '@supanovaapp/sdk';

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

#### Export Wallet Private Key

**Note:** Wallet export is only available when `withExport: true` is set in SupaProvider config (Solana wallets).

Export your wallet's private key to use it with other wallet clients like Phantom:

```tsx
import { useAuth, useCantonWallet } from '@supanovaapp/sdk';

function ExportWalletButton() {
  const { exportWallet, authenticated } = useAuth();
  const { cantonWallet } = useCantonWallet();

  const handleExport = async () => {
    if (!cantonWallet) return;
    
    try {
      // Export the primary Canton wallet
      await exportWallet({ address: cantonWallet.address });
      
      // Or export without specifying address (exports first wallet)
      await exportWallet();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <button onClick={handleExport} disabled={!authenticated || !cantonWallet}>
      Export Private Key
    </button>
  );
}
```

**What happens:**
- Privy modal opens showing your private key
- You can copy the key to use with MetaMask, Phantom, or other wallet clients
- The key is assembled securely on a different origin - neither you nor Privy can access it during transmission

**Security Warning:** Never share your private key! Anyone with your private key has full control over your wallet.

#### Complete Logout with State Cleanup

For a complete logout that clears all SDK state (Canton balances, registration, etc.), use the `useSupa` hook:

```tsx
import { useSupa } from '@supanovaapp/sdk';

function App() {
  const { auth, canton, logout } = useSupa();

  if (!auth.authenticated) {
    return <button onClick={auth.login}>Login</button>;
  }

  return (
    <div>
      <p>Welcome! Canton registered: {canton.isRegistered ? 'Yes' : 'No'}</p>
      <button onClick={logout}>Complete Logout</button>
    </div>
  );
}
```

**What `useSupa().logout()` does:**
1. Clears all Canton state (balances, user info, registration flags)
2. Terminates Privy session
3. Resets all internal SDK state

**Note:** Using `auth.logout()` directly only logs out from Privy but doesn't clear Canton state. For complete cleanup, always use `useSupa().logout()`.

---

### 3. Canton Network Operations

#### Register Canton Wallet

Register your Canton wallet with optional invite code support:

```tsx
import { useCanton } from '@supanovaapp/sdk';

function CantonWallet() {
  const { registerCanton, isRegistered, cantonUser, loading } = useCanton();

  const handleRegister = async () => {
    try {
      // Register without invite code
      await registerCanton();
      
      // Or with invite code
      await registerCanton('your-invite-code');
      
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
      <p>Transfer Preapproval: {cantonUser?.transferPreapprovalSet ? 'Enabled' : 'Disabled'}</p>
    </div>
  );
}
```

**Parameters:**
- `inviteCode` (optional) - Invite code for registration

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

Send Canton Coin with cost estimation support:

```tsx
const { sendCantonCoin } = useCanton();
const [costEstimation, setCostEstimation] = useState(null);

try {
  const result = await sendCantonCoin(
    'receiver-party::1220abc123...',  // Receiver Party ID
    '100.5',                           // Amount (max 10 decimal places)
    'Payment for services',            // Optional memo
    {
      timeout: 30000,      // completion timeout (ms)
      pollInterval: 1000,  // polling interval (ms)
      onCostEstimation: (cost) => {
        // Called before signing with cost estimation
        if (cost) {
          setCostEstimation(cost);
          console.log('Request cost:', cost.confirmationRequestTrafficCostEstimation);
          console.log('Response cost:', cost.confirmationResponseTrafficCostEstimation);
          console.log('Total cost:', cost.totalTrafficCostEstimation, 'μunits');
        }
      }
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

**Cost Estimation Object:**
```typescript
interface CantonCostEstimationDto {
  estimationTimestamp: string;  // ISO 8601 timestamp
  confirmationRequestTrafficCostEstimation: number;  // in micro-units
  confirmationResponseTrafficCostEstimation: number; // in micro-units
  totalTrafficCostEstimation: number;  // total in micro-units
}
```

**Note**: The amount cannot have more than 10 decimal places. Transfers are only supported to wallets with preapproved transfers enabled.

#### Submit a Transaction

Submit Canton transactions with cost estimation:

```tsx
const { sendTransaction } = useCanton();

const commands = {
  // Your Canton command(s)
};

try {
  const result = await sendTransaction(commands, disclosedContracts, {
    timeout: 30000,      // completion timeout (ms)
    pollInterval: 1000,  // polling interval (ms)
    onCostEstimation: (cost) => {
      // Cost estimation callback (called before signing)
      if (cost) {
        console.log('Transaction cost:', cost.totalTrafficCostEstimation, 'μunits');
      }
    }
  });
  console.log('Transaction successful:', result);
} catch (error) {
  console.error('Transaction failed:', error);
}
```

The SDK automatically:
1. Prepares the transaction
2. Calls `onCostEstimation` callback if provided
3. Shows confirmation modal
4. Signs with user approval
5. Submits and polls for completion

#### Incoming Transfers

Manage incoming Canton token transfers:

**Get Pending Incoming Transfers:**

```tsx
const { getPendingIncomingTransfers } = useCanton();

try {
  const incomingTransfers = await getPendingIncomingTransfers();
  
  incomingTransfers.forEach(transfer => {
    console.log('From:', transfer.sender);
    console.log('Amount:', transfer.amount);
    console.log('Token:', transfer.instrument.id); // 'Amulet', 'CBTC', etc.
    console.log('Expires:', transfer.executeBefore);
    console.log('Contract ID:', transfer.contractId); // Use this to respond
  });
} catch (error) {
  console.error('Failed to fetch incoming transfers:', error);
}
```

**Respond to Incoming Transfer:**

```tsx
const { respondToIncomingTransfer } = useCanton();

// Accept a transfer
try {
  const result = await respondToIncomingTransfer(
    contractId,  // From getPendingIncomingTransfers()
    true,        // true = accept, false = reject
    {
      onCostEstimation: (cost) => {
        console.log('Response cost:', cost?.totalTrafficCostEstimation);
      }
    }
  );
  console.log('Transfer accepted:', result);
} catch (error) {
  console.error('Failed to respond:', error);
}

// Reject a transfer
await respondToIncomingTransfer(contractId, false);
```

**Complete Example with UI:**

```tsx
function IncomingTransfers() {
  const { getPendingIncomingTransfers, respondToIncomingTransfer } = useCanton();
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadTransfers = async () => {
    setLoading(true);
    try {
      const incoming = await getPendingIncomingTransfers();
      setTransfers(incoming);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (contractId) => {
    try {
      await respondToIncomingTransfer(contractId, true);
      await loadTransfers(); // Refresh list
    } catch (error) {
      console.error('Failed to accept:', error);
    }
  };

  const handleReject = async (contractId) => {
    try {
      await respondToIncomingTransfer(contractId, false);
      await loadTransfers(); // Refresh list
    } catch (error) {
      console.error('Failed to reject:', error);
    }
  };

  return (
    <div>
      <button onClick={loadTransfers} disabled={loading}>
        {loading ? 'Loading...' : 'Refresh Transfers'}
      </button>
      
      {transfers.map(transfer => (
        <div key={transfer.contractId}>
          <p>From: {transfer.sender}</p>
          <p>Amount: {transfer.amount} {transfer.instrument.id}</p>
          <p>Expires: {new Date(transfer.executeBefore).toLocaleString()}</p>
          <button onClick={() => handleAccept(transfer.contractId)}>Accept</button>
          <button onClick={() => handleReject(transfer.contractId)}>Reject</button>
        </div>
      ))}
    </div>
  );
}
```

**Incoming Transfer Object:**
```typescript
interface CantonIncomingTransferDto {
  instrument: {
    admin: string;  // Token administrator party ID
    id: string;     // Token ID ('Amulet', 'CBTC', etc.)
  };
  contractId: string;    // Use this to accept/reject
  sender: string;        // Sender party ID
  receiver: string;      // Your party ID
  amount: string;        // Transfer amount
  requestedAt: string;   // ISO 8601 timestamp
  executeBefore: string; // ISO 8601 expiration timestamp
}
```

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

Request test tokens from the devnet faucet with cost estimation:

```tsx
const { tapDevnet } = useCanton();

try {
  const result = await tapDevnet('1000', {
    timeout: 30000,
    pollInterval: 1000,
    onCostEstimation: (cost) => {
      if (cost) {
        console.log('Faucet request cost:', cost.totalTrafficCostEstimation, 'μunits');
      }
    }
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
import { useSignMessage } from '@supanovaapp/sdk';

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
import { useSendTransaction } from '@supanovaapp/sdk';

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
| `useSupa` | Main SDK hook | `auth`, `canton`, `api`, `onboard`, `logout` (recommended for complete cleanup) |
| `useAuth` | Authentication | `login`, `logout`, `authenticated`, `user` |
| `useCanton` | Canton Network | `registerCanton`, `getBalances`, `sendCantonCoin`, `signMessage`, `sendTransaction`, `getActiveContracts`, `tapDevnet`, `getPendingIncomingTransfers`, `respondToIncomingTransfer`, `resetState` |
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
  CantonCostEstimationDto,
  CantonIncomingTransferDto,
  CantonPrepareResponseIncomingTransferRequestDto,
  
  // Option Types
  SignMessageOptions,
  SendTransactionOptions,
  ConfirmModalOptions,
  CantonSubmitPreparedOptions,
} from '@supanovaapp/sdk';
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

The demo application in `/demo` folder is already configured to use the local SDK version via `"@supanovaapp/sdk": "file:.."` dependency.

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

Supa SDK supports Privy Smart Wallets for EVM chains based on privy provider

```tsx
<SupaProvider
  config={{
    privyAppId: 'your-app-id',
    nodeIdentifier: 'node',
    smartWallets: {
      enabled: true,
      paymasterContext: {
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
