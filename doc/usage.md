# Usage Guide

## Install the SDK

Using npm:

```bash
npm install @supa/sdk
```

Using yarn:

```bash
yarn add @supa/sdk
```

Using pnpm:

```bash
pnpm add @supa/sdk
```

Then import into your dApp:

```javascript
import { SupaProvider, useAuth, useCanton } from '@supa/sdk';
```

---

## 1. Initialize the SDK

Wrap your application with `SupaProvider`. This is typically done once when your application loads:

```tsx
import { SupaProvider } from '@supa/sdk';

function App() {
  return (
    <SupaProvider
      config={{
        privyAppId: 'your-privy-app-id',
        privyClientId: 'your-privy-client-id', // optional
        apiBaseUrl: 'https://stage_api.supa.fyi', // optional
        appearance: {
          theme: 'light', // 'light' or 'dark'
          accentColor: '#6366f1',
          logo: 'https://example.com/logo.png', // optional
        },
        loginMethods: ['email', 'wallet', 'google'],
      }}
    >
      <YourApp />
    </SupaProvider>
  );
}
```

### Parameters

| Field | Description |
|-------|-------------|
| `privyAppId` | Your Privy App ID (required) |
| `privyClientId` | Your Privy Client ID (optional) |
| `apiBaseUrl` | Backend API URL (default: `https://stage_api.supa.fyi`) |
| `appearance` | Appearance configuration object |
| `loginMethods` | Array of login methods (`'email'`, `'wallet'`, `'google'`, etc.) |

### Appearance Options

| Field | Description |
|-------|-------------|
| `theme` | Modal theme: `'light'` or `'dark'` |
| `accentColor` | Accent color for buttons and UI elements |
| `logo` | Logo URL (optional) |

---

## 2. Connect to the Wallet

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

To start the authentication flow:

```javascript
login();
```

This opens the Privy authentication modal where users can choose their preferred login method (email, wallet, social, etc.).

**Successful authentication:**
- `authenticated` will become `true`
- `user` object will contain:
  - `user.id` - unique user ID
  - `user.email` - email address (if email login was used)
  - `user.wallet` - connected wallet data (if wallet login was used)
  - `user.google` / `user.twitter` - social account data

**Failed authentication:**
- `authenticated` will remain `false`
- `user` will be `null`
- User can retry by calling `login()` again

---

## 3. Canton Network Operations

After authentication, use the `useCanton` hook to interact with Canton Network. The hook provides access to Canton wallet operations and ledger interactions.

```tsx
import { useCanton } from '@supa/sdk';

function CantonWallet() {
  const { 
    registerCanton, 
    isRegistered, 
    cantonUser,
    loading 
  } = useCanton();

  const handleRegister = async () => {
    try {
      await registerCanton();
      console.log('Canton wallet registered!');
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  if (!isRegistered) {
    return (
      <button onClick={handleRegister} disabled={loading}>
        Register Canton Wallet
      </button>
    );
  }

  return (
    <div>
      <p>Party ID: {cantonUser?.partyId}</p>
      <p>Email: {cantonUser?.email}</p>
    </div>
  );
}
```

The `useCanton` hook includes:

- `stellarWallet` - Primary Stellar wallet
- `isRegistered` - Canton registration status
- `cantonUser` - Canton user info (partyId, email)
- `loading` - Loading state for operations
- `error` - Error state

**Successful registration:**
- A modal dialog appears requesting signature
- After confirmation, `isRegistered` becomes `true`
- `cantonUser` contains `partyId` and `email`

**Registration rejection:**
- If user rejects signature, error `'User rejected signature'` is thrown
- `isRegistered` remains `false`

---

### Get User Information

```tsx
const { getMe } = useCanton();

const user = await getMe();
console.log('Party ID:', user.partyId);
console.log('Email:', user.email);
```

---

### Get Active Contracts

Query active contracts with optional template ID filtering:

```tsx
const { getActiveContracts } = useCanton();

// Get all contracts
const allContracts = await getActiveContracts();
console.log('All contracts:', allContracts);

// Filter by template IDs
const filteredContracts = await getActiveContracts([
  'template-id-1',
  'template-id-2'
]);
console.log('Filtered contracts:', filteredContracts);
```

Each contract includes:

- `contractId` - unique contract ID
- `templateId` - contract template ID
- `payload` - contract data
- `createdAt` - creation timestamp

---

### Submit a Transaction

To submit a Canton transaction, construct a command and pass it to `sendTransaction`:

```tsx
const { sendTransaction } = useCanton();

const command = {
  // Your Canton command
};

const disclosedContracts = {
  // Disclosed contracts (optional)
};

try {
  const result = await sendTransaction(command, disclosedContracts, {
    timeout: 30000,      // completion timeout (default: 30000 ms)
    pollInterval: 1000,  // polling interval (default: 1000 ms)
  });
  
  console.log('Transaction successful:', result);
} catch (error) {
  console.error('Transaction failed:', error);
}
```

**Transaction submission process:**

1. **Prepare** - SDK calls `/canton/api/prepare_transaction` and receives hash for signing
2. **Confirm** - Modal dialog appears with transaction details
3. **Sign** - After confirmation, hash is signed with Stellar wallet
4. **Submit** - Signed transaction is submitted via `/canton/api/submit_prepared`
5. **Poll** - SDK automatically polls `/canton/api/query_completion` until completion

**Successful transaction:**
- User confirms signature in modal dialog
- `result.status` will be `'completed'`
- `result` contains completed transaction data

**Transaction rejection:**
- If user rejects signature, error `'User rejected transaction'` is thrown
- Transaction is not submitted

**Timeout:**
- If transaction doesn't complete within `timeout` milliseconds, an error is thrown

---

### Sign a Message

Request signature of an arbitrary message:

```tsx
const { signMessage } = useCanton();

try {
  const signature = await signMessage('Hello, Canton!');
  console.log('Signature:', signature);
} catch (error) {
  console.error('Signing error:', error);
}
```

**Successful signing:**
- Modal dialog appears with message text
- After confirmation, signature is returned
- Message is hashed using SHA-256 before signing

**Signing rejection:**
- If user rejects signature, error `'User rejected signature'` is thrown

---


## 4. Devnet Operations

On the test network, request tokens from the devnet faucet:

```tsx
import { useCanton } from '@supa/sdk';

function DevnetFaucet() {
  const { tapDevnet, loading } = useCanton();

  const handleTap = async () => {
    try {
      const result = await tapDevnet('1000', {
        timeout: 30000,      // completion timeout (default: 30000 ms)
        pollInterval: 1000,  // polling interval (default: 1000 ms)
      });
      
      console.log('Tokens received:', result);
    } catch (error) {
      console.error('Token request error:', error);
    }
  };

  return (
    <button onClick={handleTap} disabled={loading}>
      Get Test Tokens
    </button>
  );
}
```

**Token request process:**

1. **Prepare** - SDK calls `/canton/devnet/tap` with specified amount
2. **Confirm** - Modal dialog appears with request details
3. **Sign** - After confirmation, hash is signed
4. **Submit** - Signed transaction is submitted
5. **Poll** - SDK automatically polls status until completion

**Successful request:**
- `result.status` will be `'completed'`
- Tokens are credited to your Canton account

**Rejection:**
- If user rejects signature, error `'User rejected signature'` is thrown

---

## 5. Advanced Hooks

### Message Signing with Custom Modals

Use `useSignMessage` for enhanced control over modal dialogs:

```tsx
import { useSignMessage } from '@supa/sdk';

function SignMessageExample() {
  const { signMessage, loading, error } = useSignMessage();

  const handleSign = async () => {
    const signature = await signMessage('Hello, Canton!', {
      // Callbacks
      onSuccess: (sig) => console.log('Signed:', sig),
      onRejection: () => console.log('User rejected'),
      onError: (err) => console.error('Error:', err),
      
      // Modal customization
      title: 'Sign Message',
      description: 'Please review and sign this message.',
      confirmText: 'Sign',
      rejectText: 'Cancel',
      infoText: 'This proves wallet ownership without spending tokens.',
      
      // Display options
      displayContent: 'Custom content to display',
      showTechnicalDetails: false, // Show address, chainType, hash as JSON
      
      // Skip modal (use with caution)
      skipModal: false,
    });

    if (signature) {
      console.log('Signature:', signature);
    }
  };

  return (
    <button onClick={handleSign} disabled={loading}>
      {loading ? 'Signing...' : 'Sign Message'}
    </button>
  );
}
```

---

### Transaction Sending with Custom Modals

Use `useSendTransaction` for enhanced transaction handling:

```tsx
import { useSendTransaction } from '@supa/sdk';

function SendTransactionExample() {
  const { sendTransaction, loading, error } = useSendTransaction();

  const handleSend = async () => {
    const result = await sendTransaction(commandId, disclosedContracts, {
      // Callbacks
      onSuccess: (result) => console.log('Success:', result),
      onRejection: () => console.log('User rejected'),
      onError: (err) => console.error('Error:', err),
      
      // Modal customization
      modalTitle: 'Confirm Payment',
      modalDescription: 'Review transaction details.',
      modalConfirmText: 'Pay Now',
      modalRejectText: 'Cancel',
      modalInfoText: 'Transaction will be submitted to Canton Network.',
      
      // Display options
      modalDisplayContent: 'Send 100 tokens to Alice',
      showTechnicalDetails: false, // Show command, contracts, hash as JSON
      
      // Canton submit options
      submitOptions: {
        timeout: 30000,
        pollInterval: 1000,
      },
    });

    if (result) {
      console.log('Transaction result:', result);
    }
  };

  return (
    <button onClick={handleSend} disabled={loading}>
      {loading ? 'Sending...' : 'Send Transaction'}
    </button>
  );
}
```

---

### Generic Confirmation Modal

Use `useConfirmModal` for custom confirmation dialogs:

```tsx
import { useConfirmModal } from '@supa/sdk';

function DeleteButton() {
  const { confirm } = useConfirmModal();

  const handleDelete = async () => {
    const result = await confirm({
      title: 'Delete Item',
      message: 'Are you sure you want to delete this item?',
      confirmText: 'Delete',
      rejectText: 'Cancel',
      infoText: 'This action cannot be undone.',
    });

    if (result.confirmed) {
      await deleteItem();
    }
  };

  return <button onClick={handleDelete}>Delete</button>;
}
```

---

## 6. Theming

The SDK automatically inherits the theme from your `SupaProvider` config:

```tsx
<SupaProvider
  config={{
    appearance: {
      theme: 'dark', // 'light' or 'dark'
      accentColor: '#6366f1',
      logo: 'https://example.com/logo.png',
    },
  }}
>
  <App />
</SupaProvider>
```

### Dynamic Theme Switching

The SDK reacts to theme changes. Update the `theme` prop and all modals will automatically adapt:

```tsx
import { SupaProvider } from '@supa/sdk';

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  return (
    <SupaProvider
      config={{
        privyAppId: 'your-app-id',
        appearance: { theme },
      }}
    >
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
      <YourApp />
    </SupaProvider>
  );
}
```

---

## 7. TypeScript Support

The SDK is fully typed and includes all types for convenient development:

```tsx
import type {
  // User and Backend Types
  UserResponseDto,
  UserBalanceResponseDto,
  DialogWithMessagesResponseDto,
  
  // Canton Types
  CantonQueryCompletionResponseDto,
  CantonMeResponseDto,
  CantonActiveContractsResponseDto,
  
  // Wallet Types
  StellarWallet,
  
  // Hook Return Types
  UseAuthReturn,
  UseCantonReturn,
  UseSignMessageReturn,
  UseSendTransactionReturn,
  
  // Modal Option Types
  SignMessageOptions,
  SendTransactionOptions,
  ConfirmModalOptions,
} from '@supa/sdk';
```

### Hook Types

All hooks have strongly typed return values:

```tsx
const auth: UseAuthReturn = useAuth();
const canton: UseCantonReturn = useCanton();
const signMsg: UseSignMessageReturn = useSignMessage();
const sendTx: UseSendTransactionReturn = useSendTransaction();
const modal: UseConfirmModalReturn = useConfirmModal();
```

---

## 8. Available Hooks

| Hook | Purpose | Key Methods |
|------|---------|-------------|
| `useAuth` | Authentication | `login`, `logout`, `authenticated`, `user` |
| `useCanton` | Canton Network | `registerCanton`, `signMessage`, `sendTransaction`, `tapDevnet`, `getActiveContracts` |
| `useSignMessage` | Message signing with modal | `signMessage`, `loading`, `error` |
| `useSendTransaction` | Transactions with modal | `sendTransaction`, `loading`, `error` |
| `useConfirmModal` | Generic modals | `confirm`, `signMessageConfirm`, `signTransactionConfirm` |
| `useStellarWallet` | Stellar operations | `stellarWallet`, `stellarWallets`, `createWallet` |

---

## 9. Utilities

The SDK exports utilities for advanced usage:

```tsx
import {
  privyPublicKeyToCantonBase64,
  getStellarWallets,
} from '@supa/sdk';
```

### Wallet Utilities

```tsx
// Get all Stellar wallets from Privy user
const stellarWallets = getStellarWallets(privyUser, wallets);

// Get public key from Stellar wallet
const publicKey = getPublicKeyBase64(stellarWallet);
```

---

## Best Practices

### 1. Error Handling

Always handle errors in signing operations:

```tsx
const { signMessage } = useSignMessage();

const handleSign = async () => {
  try {
    const signature = await signMessage('Hello', {
      onError: (error) => {
        console.error('Signing failed:', error);
        showToast('Failed to sign message');
      },
      onRejection: () => {
        showToast('Signing cancelled');
      },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
  }
};
```

### 2. Loading States

Use loading states to provide feedback:

```tsx
const { signMessage, loading } = useSignMessage();

return (
  <button onClick={handleSign} disabled={loading}>
    {loading ? 'Signing...' : 'Sign Message'}
  </button>
);
```

### 3. Modal Customization

Provide clear context to users:

```tsx
await sendTransaction(command, contracts, {
  modalTitle: 'Confirm Payment',
  modalDescription: 'You are sending 100 USDC to Alice.',
  modalDisplayContent: 'Payment: 100 USDC → Alice',
  modalInfoText: 'This transaction cannot be reversed.',
});
```

### 4. Theme Integration

Ensure theme changes propagate to SDK:

```tsx
function App() {
  const [theme, setTheme] = useState('light');

  return (
    <SupaProvider
      config={{
        privyAppId: 'your-app-id',
        appearance: { theme }, // Theme updates SDK modals
      }}
    >
      <ThemeToggle onToggle={setTheme} />
      <YourApp />
    </SupaProvider>
  );
}
```

---

## FAQ

### How do I disable confirmation modals?

You can skip modals by passing `skipModal: true` option, but this is **not recommended** for user-facing operations:

```tsx
await signMessage('Hello', { skipModal: true });
```

### How do I show technical details in modals?

Enable `showTechnicalDetails` to display address, chainType, and hash as JSON:

```tsx
await signMessage('Hello', { showTechnicalDetails: true });
```

### How do I customize modal text?

All signing hooks accept customization options:

```tsx
await signMessage('Hello', {
  title: 'Custom Title',
  description: 'Custom description',
  confirmText: 'Approve',
  rejectText: 'Decline',
  infoText: 'Additional info',
});
```

### Does the SDK support theme switching?

Yes! Update the `theme` prop in `SupaProvider` config and all modals will automatically adapt:

```tsx
<SupaProvider
  config={{
    appearance: { theme: 'dark' }, // Changes to 'light' or 'dark'
  }}
>
  <App />
</SupaProvider>
```

### How do I handle signing errors?

Use the error callback and loading state:

```tsx
const { signMessage, loading, error } = useSignMessage();

await signMessage('Hello', {
  onError: (err) => console.error(err),
  onRejection: () => console.log('User cancelled'),
});
```

---

## How the Supa SDK Flow Works

This section explains the code path from your dApp to Canton Network and back.

### 1. Your dApp initializes the SDK

You wrap your app with `SupaProvider` once on load:

```tsx
<SupaProvider
  config={{
    privyAppId: 'your-app-id',
    apiBaseUrl: 'https://stage_api.supa.fyi',
  }}
>
  <App />
</SupaProvider>
```

This step only configures the SDK and Privy. **No authentication or connection is made yet.**

---

### 2. User clicks "Login" in your dApp

```tsx
const { login } = useAuth();
login();
```

When called, the SDK:

1. Opens Privy authentication modal
2. User chooses login method (email, wallet, social)
3. After successful authentication, `authenticated` becomes `true`
4. `user` object contains user data

---

### 3. User registers Canton wallet

```tsx
const { registerCanton } = useCanton();
await registerCanton();
```

When called, the SDK:

1. Creates or retrieves Stellar wallet via Privy
2. Calls backend `/canton/register/prepare` to get hash
3. Opens modal dialog requesting signature
4. User confirms and signs hash with Stellar wallet
5. Submits signature to `/canton/register/submit`
6. `isRegistered` becomes `true`

At this point, **your user is ready to use Canton Network**.

---

### 4. Your dApp uses Canton operations

After registration, you can call:

```tsx
const { getActiveContracts, sendTransaction, signMessage } = useCanton();

await getActiveContracts(['template-id']);
await sendTransaction(command, contracts);
await signMessage("Hello Canton");
```

Each signing operation follows a similar flow:
1. Prepare transaction/hash
2. Show confirmation modal
3. User confirms and signs
4. Submit signed data
5. Poll for completion (for transactions)

---

