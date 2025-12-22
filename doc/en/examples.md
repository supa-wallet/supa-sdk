# Usage Examples

Technical examples demonstrating core SDK functionality.

## Table of Contents

- [Authentication](#authentication)
- [Canton Network](#canton-network)
- [Working with API](#working-with-api)
- [Integrations](#integrations)

---

## Authentication

### Basic Login

```tsx
import { useAuth } from '@supa/sdk';

export function LoginPage() {
  const { login, loading } = useAuth();

  return (
    <div>
      <h1>Authentication</h1>
      <button onClick={login} disabled={loading}>
        {loading ? 'Connecting...' : 'Connect Wallet'}
      </button>
    </div>
  );
}
```

### Protected Route

```tsx
import { useAuth } from '@supa/sdk';
import { Navigate, Outlet } from 'react-router-dom';

export function ProtectedRoute() {
  const { authenticated, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!authenticated) return <Navigate to="/login" replace />;

  return <Outlet />;
}
```

### User Data Access

```tsx
import { useAuth } from '@supa/sdk';

export function UserProfile() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div>
      <div>Email: {user.email?.address}</div>
      <div>Wallet: {user.wallet?.address}</div>
      <div>User ID: {user.id}</div>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

---

## Canton Network

### Canton Registration

```tsx
import { useCanton } from '@supa/sdk';

export function CantonRegister() {
  const { registerCanton, isRegistered, loading, error } = useCanton();

  if (isRegistered) {
    return <div>Canton wallet already registered</div>;
  }

  return (
    <div>
      <button onClick={registerCanton} disabled={loading}>
        {loading ? 'Registering...' : 'Register Canton Wallet'}
      </button>
      {error && <div>Error: {error.message}</div>}
    </div>
  );
}
```

### Wallet Info

```tsx
import { useCanton } from '@supa/sdk';

export function WalletInfo() {
  const { stellarWallet, isRegistered } = useCanton();

  if (!stellarWallet) return <div>No wallet found</div>;

  return (
    <div>
      <div>Address: {stellarWallet.address}</div>
      <div>Public Key: {stellarWallet.publicKey}</div>
      <div>Canton Status: {isRegistered ? 'Registered' : 'Not Registered'}</div>
    </div>
  );
}
```

### Hash Signing

```tsx
import { useCanton } from '@supa/sdk';
import { useState } from 'react';

export function SignHash() {
  const { signHash, loading } = useCanton();
  const [hash, setHash] = useState('');
  const [signature, setSignature] = useState('');

  const handleSign = async () => {
    try {
      const sig = await signHash(hash);
      setSignature(sig);
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div>
      <input
        value={hash}
        onChange={(e) => setHash(e.target.value)}
        placeholder="Enter base64 hash"
      />
      <button onClick={handleSign} disabled={loading || !hash}>
        Sign
      </button>
      {signature && <div>Signature: {signature}</div>}
    </div>
  );
}
```

---

## Working with API

### User Balance

```tsx
import { useAPI } from '@supa/sdk';
import { useEffect, useState } from 'react';

export function BalanceDisplay() {
  const api = useAPI();
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    api.user.getBalance().then(setBalance);
  }, []);

  return (
    <div>
      <div>Total: ${balance?.totalUsdBalance.toFixed(2)}</div>
      {balance?.balances.map((token: any) => (
        <div key={token.contractAddress}>
          {token.symbol}: {token.tokenBalanceDecimal}
        </div>
      ))}
    </div>
  );
}
```

### Dialogs and Messages

```tsx
import { useAPI } from '@supa/sdk';
import { useState } from 'react';

export function AIChat() {
  const api = useAPI();
  const [dialogId, setDialogId] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);

  const createDialog = async (text: string) => {
    const dialog = await api.dialogs.create(text);
    setDialogId(dialog.id);
    setMessages(dialog.messages || []);
  };

  const sendMessage = async (text: string) => {
    if (!dialogId) return;
    const message = await api.messages.create(dialogId, text);
    setMessages(prev => [...prev, message]);
  };

  return (
    <div>
      {messages.map((msg, idx) => (
        <div key={idx}>{msg.message}</div>
      ))}
    </div>
  );
}
```

---

## Integrations

### Next.js App Router

```tsx
// app/providers.tsx
'use client';

import { SupaProvider } from '@supa/sdk';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SupaProvider
      config={{
        privyAppId: process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
        privyClientId: process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID,
        apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
      }}
    >
      {children}
    </SupaProvider>
  );
}

// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### React Query

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAPI } from '@supa/sdk';

export function useUserBalance() {
  const api = useAPI();
  return useQuery({
    queryKey: ['user', 'balance'],
    queryFn: () => api.user.getBalance(),
  });
}

export function useCreateDialog() {
  const api = useAPI();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (text: string) => api.dialogs.create(text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dialogs'] });
    },
  });
}
```

---

**Last Updated**: December 2025  
**SDK Version**: 0.1.0
