# Supa SDK

Supa SDK allows dApps to integrate with Supa backend and Canton Network. The SDK handles Privy.io authentication, Stellar wallet management, and Canton Network transactions.

## Limitation

Currently, we only support Ed25519 signing via Stellar wallets for Canton Network integration.

## Quick overview

For a quick overview, check out the demo application in `/demo` folder.

## Key Features

✅ **Privy.io Authentication** - Email, wallet, and social login methods  
✅ **Stellar Wallet Management** - Ed25519 signing for Canton Network  
✅ **Canton Network Integration** - Full Canton transaction support  
✅ **Built-in Confirmation Modals** - User-friendly signing confirmations  
✅ **Theme Support** - Light/dark mode with Privy design system  
✅ **Customizable UI** - Modal text, buttons, and display options  
✅ **TypeScript Support** - Full type definitions included  
✅ **Backend API Client** - Ready-to-use API methods  

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
  const { registerCanton, signMessage } = useCanton();

  if (!authenticated) {
    return <button onClick={login}>Login</button>;
  }

  return (
    <>
      <button onClick={registerCanton}>Register Canton</button>
      <button onClick={() => signMessage('Hello!')}>Sign Message</button>
    </>
  );
}
```

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
import { 
  SupaProvider, 
  useAuth, 
  useCanton, 
  useAPI,
  useSignMessage,
  useSendTransaction,
  useConfirmModal,
} from '@supa/sdk';
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

**Note:** All Canton signing operations (`registerCanton`, `tapDevnet`, `signHash`, `signMessage`, `sendTransaction`) automatically show confirmation modals before signing. Users can review and approve/reject each operation.

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

### 3.1. Message Signing with Custom Modals

Use `useSignMessage` hook for enhanced message signing with customizable confirmation modals:

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
      displayContent: 'Custom message to display',
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

### 3.2. Transaction Sending with Custom Modals

Use `useSendTransaction` hook for enhanced transaction handling:

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

## Confirmation Modals

All signing operations in the SDK use built-in confirmation modals that follow Privy's design system and support light/dark themes.

### Modal Features

- **Automatic Display**: Modals appear before every signing operation
- **Theme Support**: Automatically adapts to `appearance.theme` in config ('light' or 'dark')
- **Customizable**: Text, buttons, and display content can be customized
- **User-Friendly**: Shows readable content by default, technical details optional
- **Callbacks**: `onSuccess`, `onRejection`, `onError` for handling outcomes

### Modal Customization

All signing hooks accept modal customization options:

```tsx
const { signMessage } = useSignMessage();

await signMessage('Hello', {
  // Modal text customization
  title: 'Custom Title',
  description: 'Custom description',
  confirmText: 'Approve',
  rejectText: 'Decline',
  infoText: 'Additional information',
  
  // Display control
  displayContent: 'Custom content to show',
  showTechnicalDetails: true, // Show JSON with technical details
  
  // Skip modal (dangerous, use carefully)
  skipModal: false,
});
```

### Low-Level Modal Hook

For advanced use cases, use `useSignRawHashWithModal`:

```tsx
import { useSignRawHashWithModal } from '@supa/sdk';

function AdvancedSigning() {
  const { signRawHashWithModal } = useSignRawHashWithModal();

  const handleSign = async () => {
    const result = await signRawHashWithModal(
      {
        address: walletAddress,
        chainType: 'stellar',
        hash: '0x...',
      },
      {
        title: 'Sign Operation',
        description: 'Custom description',
        displayHash: 'Readable content',
        showTechnicalDetails: false,
      }
    );

    if (result) {
      console.log('Signature:', result.signature);
    }
  };

  return <button onClick={handleSign}>Sign</button>;
}
```

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
      // User confirmed
      await deleteItem();
    }
  };

  return <button onClick={handleDelete}>Delete</button>;
}
```

## Theming

The SDK automatically inherits the theme from your `SupaProvider` config:

```tsx
<SupaProvider
  config={{
    // ... other config
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

**Dynamic Theme Switching**: The SDK reacts to theme changes. Update the `theme` prop and all modals will automatically adapt:

```tsx
import { SupaProvider } from '@supa/sdk';

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  return (
    <SupaProvider
      config={{
        // ... other config
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
  // User & Backend Types
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
  UseConfirmModalReturn,
  
  // Modal Option Types
  SignMessageOptions,
  SendTransactionOptions,
  SignRawHashModalOptions,
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

## Available Hooks

| Hook | Purpose | Key Methods |
|------|---------|-------------|
| `useAuth` | Authentication | `login`, `logout`, `authenticated`, `user` |
| `useCanton` | Canton Network | `registerCanton`, `signHash`, `signMessage`, `sendTransaction`, `tapDevnet` |
| `useSignMessage` | Message signing with modal | `signMessage`, `loading`, `error` |
| `useSendTransaction` | Transaction with modal | `sendTransaction`, `loading`, `error` |
| `useConfirmModal` | Generic modals | `confirm`, `signMessageConfirm`, `signTransactionConfirm` |
| `useSignRawHashWithModal` | Low-level signing | `signRawHashWithModal` |
| `useAPI` | Backend API | `user`, `dialogs`, `messages`, `supaPoints`, `transactions` |
| `useWalletino` | Walletino operations | `createWallet`, `getWallet`, `getWallets` |

# API

See [doc/en/api-reference.md](./doc/en/api-reference.md) for complete API documentation.

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

### 5. Security

- Never use `skipModal: true` for user-facing transactions
- Always validate user input before signing
- Use `showTechnicalDetails: true` only for debugging/advanced users
- Implement proper error boundaries

# Development Guide

This section is for SDK development. To use the SDK, follow the Usage Guide above.

## Project Structure

```
supa-sdk/
├── src/
│   ├── components/       # UI components (modals)
│   │   └── ConfirmationModal.tsx
│   ├── core/            # Core functionality
│   │   ├── client.ts    # API client
│   │   └── types.ts     # Type definitions
│   ├── hooks/           # React hooks
│   │   ├── useAuth.ts
│   │   ├── useCanton.ts
│   │   ├── useSignMessage.ts
│   │   ├── useSendTransaction.ts
│   │   ├── useConfirmModal.ts
│   │   └── useSignRawHashWithModal.ts
│   ├── providers/       # Context providers
│   │   └── SupaProvider.tsx
│   ├── services/        # Service classes
│   │   ├── apiService.ts
│   │   └── cantonService.ts
│   ├── utils/           # Utility functions
│   │   ├── converters.ts
│   │   └── stellar.ts
│   └── index.ts         # Main export
├── demo/                # Demo application
└── doc/                 # Documentation
```

## Install dependencies

```bash
npm install
```

## Run demo application

```bash
cd demo
npm install
npm run dev
```

## Build SDK

```bash
npm run build
```

Output in `/dist`:
- `index.cjs.js` - CommonJS
- `index.esm.js` - ES Modules

## Type checking

```bash
npm run type-check
```

# Publish

```bash
npm run build
npm publish
```

## Examples

Check out the `/demo` folder for a complete working example with:
- Authentication flow
- Canton wallet registration
- Message signing with modals
- Transaction sending with modals
- Theme switching
- Error handling

To run the demo:

```bash
cd demo
npm install
npm run dev
```

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

### What chains are supported?

Currently, only **Stellar (Ed25519)** is supported for Canton Network integration.

### How do I handle signing errors?

Use the error callback and loading state:

```tsx
const { signMessage, loading, error } = useSignMessage();

await signMessage('Hello', {
  onError: (err) => console.error(err),
  onRejection: () => console.log('User cancelled'),
});
```

## Support

- **Documentation**: See `/doc` folder for detailed guides
- **Issues**: Report bugs on GitHub
- **Demo**: Full example in `/demo` folder

---

**Version:** 0.2.0  
**React:** 18+ / 19  
**TypeScript:** 5+  
**Privy SDK:** 3.3.0+  
**Features:** Authentication, Canton Network, Confirmation Modals, Theme Support
