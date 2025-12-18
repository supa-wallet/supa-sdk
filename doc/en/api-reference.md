# API Reference

Полный справочник по всем API методам, хукам и типам Walletino SDK.

## 📖 Содержание

- [WalletinoProvider](#walletinoprovider)
- [useAuth](#useauth)
- [useCanton](#usecanton)
- [useAPI](#useapi)
- [useWalletino](#usewalletino)
- [Утилиты](#utilities)
- [TypeScript Types](#typescript-types)

---

## WalletinoProvider

Главный провайдер SDK. Должен обернуть всё приложение.

### Props

```typescript
interface WalletinoProviderProps {
  config: WalletinoConfig;
  children: ReactNode;
}

interface WalletinoConfig {
  /** Privy App ID (обязательно) */
  privyAppId: string;
  
  /** Privy Client ID (опционально) */
  privyClientId?: string;
  
  /** Backend API base URL (по умолчанию: https://stage_api.walletino.fyi) */
  apiBaseUrl?: string;
  
  /** Настройки внешнего вида Privy */
  appearance?: {
    theme?: 'light' | 'dark';
    accentColor?: string;
    logo?: string;
  };
  
  /** Методы входа для Privy */
  loginMethods?: Array<
    'email' | 'wallet' | 'google' | 'twitter' | 
    'discord' | 'github' | 'linkedin'
  >;
}
```

### Пример

```tsx
import { WalletinoProvider } from '@walletino/sdk';

function App() {
  return (
    <WalletinoProvider
      config={{
        privyAppId: 'your_app_id',
        privyClientId: 'your_client_id',
        apiBaseUrl: 'https://stage_api.walletino.fyi',
        appearance: {
          theme: 'light',
          accentColor: '6366f1',
          logo: 'https://your-domain.com/logo.png',
        },
        loginMethods: ['email', 'wallet', 'google'],
      }}
    >
      <YourApp />
    </WalletinoProvider>
  );
}
```

---

## useAuth

Хук для управления аутентификацией через Privy.

### Returns

```typescript
interface UseAuthReturn {
  /** Открыть модальное окно входа */
  login: () => void;
  
  /** Выйти из аккаунта */
  logout: () => Promise<void>;
  
  /** Статус аутентификации */
  authenticated: boolean;
  
  /** Загрузка */
  loading: boolean;
  
  /** Объект пользователя Privy */
  user: PrivyUser | null;
  
  /** Получить JWT токен для API запросов */
  getAccessToken: () => Promise<string | null>;
  
  /** Готовность SDK */
  ready: boolean;
}
```

### Примеры

#### Базовая аутентификация

```tsx
import { useAuth } from '@walletino/sdk';

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

#### Получение токена для API

```tsx
import { useAuth } from '@walletino/sdk';

function SecureComponent() {
  const { getAccessToken, authenticated } = useAuth();

  const makeSecureRequest = async () => {
    if (!authenticated) {
      alert('Please login first');
      return;
    }

    const token = await getAccessToken();
    
    // Используйте токен в ваших запросах
    const response = await fetch('https://api.example.com/data', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  };

  return <button onClick={makeSecureRequest}>Secure Action</button>;
}
```

#### Защищенный роут

```tsx
import { useAuth } from '@walletino/sdk';
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

Хук для операций с Canton Network.

### Returns

```typescript
interface UseCantonReturn {
  // Кошельки
  /** Основной Stellar кошелёк */
  stellarWallet: StellarWallet | null;
  
  /** Все Stellar кошельки пользователя */
  stellarWallets: StellarWallet[];
  
  /** Создать новый Stellar кошелёк */
  createStellarWallet: () => Promise<StellarWallet | null>;
  
  // Canton операции
  /** Зарегистрировать Canton кошелёк на backend */
  registerCanton: () => Promise<void>;
  
  /** Статус регистрации Canton */
  isRegistered: boolean;
  
  /** Получить токены из devnet крана */
  tapDevnet: (amount: string) => Promise<CantonSubmitTransactionResponseDto>;
  
  /** Подписать хэш (base64) */
  signHash: (hashBase64: string) => Promise<string>;
  
  // Состояние
  /** Загрузка операции */
  loading: boolean;
  
  /** Ошибка выполнения */
  error: Error | null;
  
  /** Очистить ошибку */
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

### Примеры

#### Регистрация Canton кошелька

```tsx
import { useCanton } from '@walletino/sdk';

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
    return <p>✅ Canton wallet is registered</p>;
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

#### Получение тестовых токенов

```tsx
import { useCanton } from '@walletino/sdk';

function TapDevnet() {
  const { tapDevnet, loading, error, clearError } = useCanton();

  const handleTap = async () => {
    clearError();
    try {
      const result = await tapDevnet('1000');
      console.log('Transaction result:', result);
      alert('✅ Tokens received!');
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

#### Подпись произвольного хэша

```tsx
import { useCanton } from '@walletino/sdk';
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
      // hash должен быть в base64
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

Хук для работы с Walletino Backend API.

### Returns

```typescript
interface UseAPIReturn {
  user: UserAPI;
  dialogs: DialogsAPI;
  messages: MessagesAPI;
  onchain: OnChainAPI;
  supaPoints: SupaPointsAPI;
  transactions: TransactionsAPI;
}
```

### User API

```typescript
interface UserAPI {
  /** Получить текущего пользователя */
  getCurrent: () => Promise<UserResponseDto>;
  
  /** Получить всех пользователей */
  getAll: () => Promise<UserResponseDto[]>;
  
  /** Получить баланс пользователя */
  getBalance: (forceLoad?: boolean) => Promise<UserBalanceResponseDto>;
}
```

**Пример:**

```tsx
import { useAPI } from '@walletino/sdk';
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
  /** Создать новый диалог */
  create: (text: string) => Promise<DialogWithMessagesResponseDto>;
  
  /** Получить все диалоги */
  findAll: (params?: PaginationParams) => Promise<PaginatedDialogs>;
  
  /** Получить один диалог */
  findOne: (id: number) => Promise<DialogListResponseDto>;
  
  /** Удалить диалог */
  delete: (id: number) => Promise<void>;
}
```

**Пример:**

```tsx
import { useAPI } from '@walletino/sdk';
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
  /** Создать сообщение в диалоге */
  create: (dialogId: number, text: string) => Promise<MessageResponseDto>;
  
  /** Получить все сообщения диалога */
  findAll: (dialogId: number, params?: PaginationParams) => Promise<PaginatedMessages>;
  
  /** Получить одно сообщение */
  findOne: (id: number) => Promise<MessageResponseDto>;
}
```

### OnChain API

```typescript
interface OnChainAPI {
  /** Получить цены токенов */
  getTokenPrices: (symbols: string[]) => Promise<Record<string, number>>;
  
  /** Получить информацию о токенах */
  getTokenInfo: (network: string, addresses: string[]) => Promise<TokenInfo>;
  
  /** Получить балансы аккаунта */
  getAccountBalances: (network: string, account: string) => Promise<any>;
  
  /** Получить историю цен */
  getPriceHistory: (params: PriceHistoryParams) => Promise<any>;
}
```

**Пример:**

```tsx
import { useAPI } from '@walletino/sdk';
import { useEffect, useState } from 'react';

function TokenPrices() {
  const api = useAPI();
  const [prices, setPrices] = useState({});

  useEffect(() => {
    const fetchPrices = () => {
      api.onchain.getTokenPrices(['BTC', 'ETH', 'SOL'])
        .then(setPrices);
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {Object.entries(prices).map(([symbol, price]) => (
        <p key={symbol}>{symbol}: ${price}</p>
      ))}
    </div>
  );
}
```

### SupaPoints API

```typescript
interface SupaPointsAPI {
  /** Получить баланс SupaPoints */
  getBalance: () => Promise<{ balance: number }>;
  
  /** Получить историю SupaPoints */
  getHistory: (params?: PaginationParams) => Promise<any>;
  
  /** Ежедневный login бонус */
  dailyLogin: () => Promise<{ balance: number; add: number }>;
}
```

### Transactions API

```typescript
interface TransactionsAPI {
  /** Получить транзакции */
  get: (params?: PaginationParams) => Promise<any>;
  
  /** Принудительно загрузить транзакции */
  forceLoad: (params?: PaginationParams) => Promise<any>;
}
```

---

## useWalletino

Главный хук, объединяющий все остальные хуки.

### Returns

```typescript
interface UseWalletinoReturn {
  auth: UseAuthReturn;
  canton: UseCantonReturn;
  api: UseAPIReturn;
}
```

### Пример

```tsx
import { useWalletino } from '@walletino/sdk';

function Dashboard() {
  const { auth, canton, api } = useWalletino();

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

SDK экспортирует утилиты для продвинутого использования.

### Конвертация форматов

```typescript
/** Конвертировать hex в base64 */
function hexToBase64(hex: string): string;

/** Конвертировать base64 в hex */
function base64ToHex(base64: string): string;

/** Конвертировать bytes в base64 */
function bytesToBase64(bytes: Uint8Array): string;

/** Конвертировать base64 в bytes */
function base64ToBytes(base64: string): Uint8Array;

/** Удалить leading 00 из hex строки */
function stripLeadingZero(hex: string): string;
```

### Stellar/Canton утилиты

```typescript
/** Конвертировать Privy publicKey в Canton base64 формат */
function privyPublicKeyToCantonBase64(publicKeyHex: string): string;

/** Получить все Stellar кошельки */
function getStellarWallets(user: any, wallets: any[]): StellarWallet[];

/** Получить publicKey в base64 из кошелька */
function getPublicKeyBase64(wallet: StellarWallet): string;

/** Проверить, является ли кошелёк Stellar */
function isStellarWallet(wallet: any): wallet is StellarWallet;

/** Получить первый Stellar кошелёк или выбросить ошибку */
function getFirstStellarWallet(user: any, wallets: any[]): StellarWallet;
```

### Пример использования утилит

```tsx
import { 
  hexToBase64, 
  base64ToHex,
  privyPublicKeyToCantonBase64 
} from '@walletino/sdk';

// Конвертация публичного ключа
const wallet = { publicKey: '00e95cb2553361ed...' };
const publicKeyBase64 = privyPublicKeyToCantonBase64(wallet.publicKey);
console.log(publicKeyBase64); // "6Vyy..."

// Конвертация хэша
const hashBase64 = 'EiDjNqHetYYin8ypx87L...';
const hashHex = base64ToHex(hashBase64);
console.log(hashHex); // "0x1220e33..."
```

---

## TypeScript Types

Все типы экспортируются из SDK и доступны для импорта.

### Основные типы

```typescript
import type {
  // Config
  WalletinoConfig,
  WalletinoProviderProps,
  
  // Hook returns
  UseAuthReturn,
  UseCantonReturn,
  UseAPIReturn,
  UseWalletinoReturn,
  
  // Wallet types
  StellarWallet,
  
  // API DTOs (сгенерированы из Swagger)
  UserResponseDto,
  UserBalanceResponseDto,
  DialogWithMessagesResponseDto,
  MessageResponseDto,
  CantonPrepareTransactionResponseDto,
  CantonSubmitTransactionResponseDto,
  TokenInfo,
  // ... и многие другие
} from '@walletino/sdk';
```

### Использование типов

```typescript
import { useCanton } from '@walletino/sdk';
import type { StellarWallet, CantonSubmitTransactionResponseDto } from '@walletino/sdk';

function Component() {
  const { stellarWallet, tapDevnet } = useCanton();
  
  // TypeScript знает типы
  const wallet: StellarWallet | null = stellarWallet;
  
  const handleTap = async (): Promise<CantonSubmitTransactionResponseDto> => {
    return await tapDevnet('1000');
  };
}
```

---

**Последнее обновление**: Декабрь 2025  
**Версия SDK**: 0.1.0

