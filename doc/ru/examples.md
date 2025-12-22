# Примеры использования

Технические примеры, демонстрирующие основной функционал SDK.

## Содержание

- [Аутентификация](#аутентификация)
- [Canton Network](#canton-network)
- [Работа с API](#работа-с-api)
- [Интеграции](#интеграции)

---

## Аутентификация

### Базовый вход

```tsx
import { useAuth } from '@supa/sdk';

export function LoginPage() {
  const { login, loading } = useAuth();

  return (
    <div>
      <h1>Аутентификация</h1>
      <button onClick={login} disabled={loading}>
        {loading ? 'Подключение...' : 'Подключить кошелёк'}
      </button>
    </div>
  );
}
```

### Защищённый роут

```tsx
import { useAuth } from '@supa/sdk';
import { Navigate, Outlet } from 'react-router-dom';

export function ProtectedRoute() {
  const { authenticated, loading } = useAuth();

  if (loading) return <div>Загрузка...</div>;
  if (!authenticated) return <Navigate to="/login" replace />;

  return <Outlet />;
}
```

### Доступ к данным пользователя

```tsx
import { useAuth } from '@supa/sdk';

export function UserProfile() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div>
      <div>Email: {user.email?.address}</div>
      <div>Кошелёк: {user.wallet?.address}</div>
      <div>ID пользователя: {user.id}</div>
      <button onClick={logout}>Выйти</button>
    </div>
  );
}
```

---

## Canton Network

### Регистрация Canton

```tsx
import { useCanton } from '@supa/sdk';

export function CantonRegister() {
  const { registerCanton, isRegistered, loading, error } = useCanton();

  if (isRegistered) {
    return <div>Canton кошелёк уже зарегистрирован</div>;
  }

  return (
    <div>
      <button onClick={registerCanton} disabled={loading}>
        {loading ? 'Регистрация...' : 'Зарегистрировать Canton кошелёк'}
      </button>
      {error && <div>Ошибка: {error.message}</div>}
    </div>
  );
}
```

### Информация о кошельке

```tsx
import { useCanton } from '@supa/sdk';

export function WalletInfo() {
  const { stellarWallet, isRegistered } = useCanton();

  if (!stellarWallet) return <div>Кошелёк не найден</div>;

  return (
    <div>
      <div>Адрес: {stellarWallet.address}</div>
      <div>Публичный ключ: {stellarWallet.publicKey}</div>
      <div>Статус Canton: {isRegistered ? 'Зарегистрирован' : 'Не зарегистрирован'}</div>
    </div>
  );
}
```

### Подпись хеша

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
        placeholder="Введите base64 хеш"
      />
      <button onClick={handleSign} disabled={loading || !hash}>
        Подписать
      </button>
      {signature && <div>Подпись: {signature}</div>}
    </div>
  );
}
```

---

## Работа с API

### Баланс пользователя

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
      <div>Всего: ${balance?.totalUsdBalance.toFixed(2)}</div>
      {balance?.balances.map((token: any) => (
        <div key={token.contractAddress}>
          {token.symbol}: {token.tokenBalanceDecimal}
        </div>
      ))}
    </div>
  );
}
```

### Диалоги и сообщения

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

## Интеграции

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
    <html lang="ru">
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

**Последнее обновление**: Декабрь 2025  
**Версия SDK**: 0.1.0

