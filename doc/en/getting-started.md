# Getting Started with Supa SDK

Quick integration guide for Supa SDK.

## Prerequisites

- Node.js 18+
- React 18+
- TypeScript 5+ (recommended)
- Privy App ID from [dashboard.privy.io](https://dashboard.privy.io)

## Installation

```bash
npm install @supa/sdk
```

## Environment Configuration

```env
VITE_PRIVY_APP_ID=your_privy_app_id
VITE_PRIVY_CLIENT_ID=your_privy_client_id
VITE_API_BASE_URL=https://stage_api.supa.fyi
```

## Basic Setup

```tsx
import { SupaProvider } from '@supa/sdk';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <SupaProvider
    config={{
      privyAppId: import.meta.env.VITE_PRIVY_APP_ID,
      privyClientId: import.meta.env.VITE_PRIVY_CLIENT_ID,
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
    }}
  >
    <App />
  </SupaProvider>
);
```

## Usage

### Authentication

```tsx
import { useAuth } from '@supa/sdk';

export function App() {
  const { login, logout, authenticated, user } = useAuth();

  if (!authenticated) {
    return <button onClick={login}>Login</button>;
  }

  return (
    <div>
      <div>User: {user?.email?.address}</div>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Canton Integration

```tsx
import { useCanton } from '@supa/sdk';

export function Canton() {
  const { stellarWallet, registerCanton, isRegistered, loading } = useCanton();

  if (!stellarWallet) return <div>Creating wallet...</div>;

  if (!isRegistered) {
    return (
      <div>
        <div>Address: {stellarWallet.address}</div>
        <button onClick={registerCanton} disabled={loading}>
          Register Canton
        </button>
      </div>
    );
  }

  return <div>Canton wallet registered</div>;
}
```

### API Usage

```tsx
import { useAPI } from '@supa/sdk';

export function Balance() {
  const api = useAPI();
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    api.user.getBalance().then(setBalance);
  }, []);

  return <div>Total: ${balance?.totalUsdBalance}</div>;
}
```

## Next Steps

- [API Reference](./api-reference.md) - Complete API documentation
- [Canton Integration](./canton-integration.md) - Canton Network details
- [Examples](./examples.md) - Advanced examples

## Troubleshooting

### Privy Modal Not Opening

Add your domain in Privy Dashboard → Settings → Allowed domains

### Buffer Error

```tsx
import { Buffer } from 'buffer';
window.Buffer = Buffer;
```

### TypeScript Env Types

```typescript
// vite-env.d.ts
interface ImportMetaEnv {
  readonly VITE_PRIVY_APP_ID: string;
  readonly VITE_PRIVY_CLIENT_ID?: string;
  readonly VITE_API_BASE_URL?: string;
}
```

---

**SDK Version**: 0.1.0
