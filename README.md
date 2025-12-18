# Walletino SDK

React SDK для интеграции с Walletino Backend API и Privy.io с поддержкой Canton Network.

## 🚀 Возможности

- 🔐 **Аутентификация через Privy.io** - безопасный вход с поддержкой email, кошельков и социальных сетей
- 💰 **Stellar Wallets** - автоматическое создание и управление Stellar кошельками (Ed25519)
- 🌐 **Canton Network** - полная интеграция с Canton Network (регистрация, транзакции, подпись)
- 📡 **Backend API** - типизированные методы для всех эндпоинтов Walletino
- 🎨 **React Hooks** - удобные хуки для работы с SDK (`useAuth`, `useCanton`, `useAPI`)
- 📦 **TypeScript** - полная типизация из Swagger спецификации
- ⚡ **Buffer Polyfill** - автоматически встроен в SDK, дополнительная настройка не требуется

## 📦 Установка

```bash
npm install @walletino/sdk
# или
yarn add @walletino/sdk
# или
pnpm add @walletino/sdk
```

### Зависимости

SDK требует следующие peer dependencies:

```json
{
  "react": "^18.0.0 || ^19.0.0",
  "react-dom": "^18.0.0 || ^19.0.0"
}
```

## 🎯 Быстрый старт

### 1. Настройка окружения

Создайте `.env` файл в корне вашего проекта:

```env
VITE_PRIVY_APP_ID=your_privy_app_id
VITE_PRIVY_CLIENT_ID=your_privy_client_id
VITE_API_BASE_URL=https://stage_api.walletino.fyi
```

### 2. Настройка провайдера

Оберните ваше приложение в `WalletinoProvider`:

```tsx
import { WalletinoProvider } from '@walletino/sdk';

function App() {
  return (
    <WalletinoProvider
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
    </WalletinoProvider>
  );
}
```

### 3. Использование хуков

```tsx
import { useAuth, useCanton, useAPI } from '@walletino/sdk';

function YourComponent() {
  const { login, authenticated, user } = useAuth();
  const { registerCanton, tapDevnet, isRegistered, loading } = useCanton();
  const api = useAPI();

  const handleLogin = () => {
    login(); // Откроет модальное окно Privy
  };

  const handleRegisterCanton = async () => {
    // Автоматически создаст Stellar кошелёк если нужно
    await registerCanton();
  };

  const handleTapDevnet = async () => {
    const result = await tapDevnet('1000');
    console.log('Tap result:', result);
  };

  return (
    <div>
      {!authenticated ? (
        <button onClick={handleLogin}>Login</button>
      ) : (
        <>
          <p>Welcome, {user?.email?.address}!</p>
          {!isRegistered ? (
            <button onClick={handleRegisterCanton} disabled={loading}>
              Register Canton Wallet
            </button>
          ) : (
            <button onClick={handleTapDevnet} disabled={loading}>
              Get Test Tokens
            </button>
          )}
        </>
      )}
    </div>
  );
}
```

## 📚 API Reference

### WalletinoProvider

Главный провайдер SDK. Настраивает Privy и инициализирует сервисы.

```tsx
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
  loginMethods?: Array<'email' | 'wallet' | 'google' | 'twitter' | 'discord' | 'github' | 'linkedin'>;
}
```

### useAuth

Хук для управления аутентификацией через Privy.

```tsx
const {
  login,           // () => void - открыть модальное окно входа
  logout,          // () => Promise<void> - выйти из аккаунта
  authenticated,   // boolean - статус аутентификации
  loading,         // boolean - загрузка
  user,            // PrivyUser | null - объект пользователя Privy
  getAccessToken,  // () => Promise<string | null> - получить JWT токен
  ready,           // boolean - готовность SDK
} = useAuth();
```

### useCanton

Хук для операций с Canton Network.

```tsx
const {
  // 💼 Stellar Кошельки
  stellarWallet,         // StellarWallet | null - основной Stellar кошелёк
  stellarWallets,        // StellarWallet[] - все Stellar кошельки
  createStellarWallet,   // () => Promise<StellarWallet | null> - создать новый кошелёк

  // 🌐 Canton Операции
  registerCanton,        // () => Promise<void> - зарегистрировать Canton кошелёк
  isRegistered,          // boolean - статус регистрации Canton
  tapDevnet,             // (amount: string) => Promise<result> - получить токены из крана
  signHash,              // (hashBase64: string) => Promise<signatureBase64> - подписать хэш

  // 📊 Состояние
  loading,               // boolean - загрузка операции
  error,                 // Error | null - ошибка выполнения
  clearError,            // () => void - очистить ошибку
} = useCanton();
```

### useAPI

Хук для работы с backend API.

```tsx
const api = useAPI();

// 👤 User API
await api.user.getCurrent();           // Получить текущего пользователя
await api.user.getAll();               // Получить всех пользователей
await api.user.getBalance();           // Получить баланс

// 💬 Dialogs API
await api.dialogs.create('Hello AI!'); // Создать диалог
await api.dialogs.findAll({ page: 1, limit: 10 });
await api.dialogs.findOne(dialogId);
await api.dialogs.delete(dialogId);

// 📝 Messages API
await api.messages.create(dialogId, 'Message text');
await api.messages.findAll(dialogId, { page: 1 });
await api.messages.findOne(messageId);

// ⛓️ OnChain API
await api.onchain.getTokenPrices(['BTC', 'ETH']);
await api.onchain.getTokenInfo('ethereum', ['0x...']);
await api.onchain.getAccountBalances('ethereum', '0x...');

// 🎁 SupaPoints API
await api.supaPoints.getBalance();
await api.supaPoints.dailyLogin();
await api.supaPoints.getHistory();

// 💸 Transactions API
await api.transactions.get({ page: 1, limit: 20 });
await api.transactions.forceLoad();
```

## 💡 Примеры использования

### Полный онбординг с Canton

```tsx
import { useAuth, useCanton, useAPI } from '@walletino/sdk';
import { useState } from 'react';

function OnboardingFlow() {
  const { login, authenticated } = useAuth();
  const { registerCanton, tapDevnet, isRegistered, loading, error } = useCanton();
  const api = useAPI();
  const [step, setStep] = useState(1);

  const handleCompleteOnboarding = async () => {
    try {
      // Шаг 1: Вход через Privy
      if (!authenticated) {
        login();
        return;
      }
      setStep(2);

      // Шаг 2: Регистрация Canton кошелька (автоматически создаст Stellar)
      if (!isRegistered) {
        await registerCanton();
        console.log('✅ Canton wallet registered!');
      }
      setStep(3);

      // Шаг 3: Получить тестовые токены из крана (только для devnet)
      const tapResult = await tapDevnet('1000');
      console.log('✅ Received test tokens:', tapResult);
      setStep(4);

      // Шаг 4: Проверить баланс
      const balance = await api.user.getBalance();
      console.log('💰 Balance:', balance);
      
      alert('🎉 Onboarding complete!');
    } catch (err) {
      console.error('❌ Onboarding error:', err);
    }
  };

  return (
    <div>
      <h1>Welcome to Walletino</h1>
      <div>Current step: {step}/4</div>
      
      <button onClick={handleCompleteOnboarding} disabled={loading}>
        {!authenticated 
          ? '1️⃣ Login with Privy' 
          : !isRegistered 
          ? '2️⃣ Register Canton Wallet' 
          : step === 3 
          ? '3️⃣ Get Test Tokens' 
          : '4️⃣ Check Balance'}
      </button>

      {loading && <p>⏳ Loading...</p>}
      {error && <p style={{ color: 'red' }}>❌ {error.message}</p>}
    </div>
  );
}
```

### Отображение баланса с токенами

```tsx
import { useAPI } from '@walletino/sdk';
import { useEffect, useState } from 'react';

function BalanceDisplay() {
  const api = useAPI();
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.user.getBalance()
      .then(setBalance)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading balance...</p>;
  if (!balance) return <p>No balance data</p>;

  return (
    <div>
      <h2>Total: ${balance.totalUsdBalance.toFixed(2)}</h2>
      <h3>Your Tokens:</h3>
      <ul>
        {balance.balances.map((token) => (
          <li key={token.contractAddress}>
            <strong>{token.symbol}</strong>: {token.tokenBalanceDecimal}
            {token.usdPrice && ` ($${token.usdPrice.toFixed(2)})`}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Работа с AI диалогами

```tsx
import { useAPI } from '@walletino/sdk';
import { useState } from 'react';

function AIChat() {
  const api = useAPI();
  const [dialogId, setDialogId] = useState<number | null>(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const createDialog = async () => {
    const dialog = await api.dialogs.create('Hello AI!');
    setDialogId(dialog.id);
    setMessages(dialog.messages);
  };

  const sendMessage = async () => {
    if (!dialogId || !input) return;
    
    const message = await api.messages.create(dialogId, input);
    setMessages(prev => [...prev, message]);
    setInput('');
  };

  return (
    <div>
      {!dialogId ? (
        <button onClick={createDialog}>Start New Chat</button>
      ) : (
        <>
          <div>
            {messages.map(msg => (
              <div key={msg.id}>
                <strong>{msg.isUserMessage ? 'You' : 'AI'}:</strong> {msg.message}
              </div>
            ))}
          </div>
          <input value={input} onChange={e => setInput(e.target.value)} />
          <button onClick={sendMessage}>Send</button>
        </>
      )}
    </div>
  );
}
```

### Получение цен криптовалют

```tsx
import { useAPI } from '@walletino/sdk';
import { useEffect, useState } from 'react';

function CryptoPrices() {
  const api = useAPI();
  const [prices, setPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchPrices = async () => {
      const data = await api.onchain.getTokenPrices(['BTC', 'ETH', 'USDT', 'SOL']);
      setPrices(data);
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 30000); // Обновление каждые 30 секунд
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h2>Crypto Prices</h2>
      {Object.entries(prices).map(([symbol, price]) => (
        <div key={symbol}>
          {symbol}: ${price.toFixed(2)}
        </div>
      ))}
    </div>
  );
}
```

### Подпись произвольного хэша

```tsx
import { useCanton } from '@walletino/sdk';

function SignCustomHash() {
  const { signHash, stellarWallet } = useCanton();

  const handleSign = async () => {
    if (!stellarWallet) {
      alert('Please create a Stellar wallet first');
      return;
    }

    // Хэш в base64 формате (от Canton или любой другой источник)
    const hashBase64 = 'EiDjNqHetYYin8ypx87LAmJwzxhBX4rFMi4Z/sSsvdQ7bg==';
    
    try {
      const signature = await signHash(hashBase64);
      console.log('✅ Signature (base64):', signature);
      // signature готов для отправки в Canton API
    } catch (error) {
      console.error('❌ Signing failed:', error);
    }
  };

  return <button onClick={handleSign}>Sign Hash</button>;
}
```

## 🔗 Canton Network Integration

SDK использует **Stellar chain type** для Ed25519 подписи, необходимой для Canton Network.

### Как работает конвертация ключей

1. **Public Key от Privy** → **Public Key для Canton**:
   ```
   Privy hex:     00e95cb2553361ed95250c74f854814675d971cacdbd5dc3ec5de627fff7b71518
                  ↓ (удаление leading 00)
   Clean hex:     e95cb2553361ed95250c74f854814675d971cacdbd5dc3ec5de627fff7b71518
                  ↓ (hex → bytes → base64)
   Canton base64: 6Vyy...
   ```

2. **Подпись транзакций Canton**:
   ```
   Canton hash (base64) → hex → Privy signRawHash → hex signature → base64 для Canton
   ```

### Флоу регистрации Canton

```tsx
const { registerCanton } = useCanton();

// Полностью автоматический процесс:
// 1. ✅ Проверяет/создаёт Stellar кошелёк
// 2. ✅ Конвертирует publicKey (hex → base64)
// 3. ✅ Вызывает /canton/register/prepare
// 4. ✅ Подписывает hash через Privy (chainType: stellar)
// 5. ✅ Отправляет подпись в /canton/register/submit

await registerCanton();
```

## 🛠️ Утилиты

SDK экспортирует утилиты для продвинутого использования:

```tsx
import {
  // Конвертация форматов
  hexToBase64,
  base64ToHex,
  bytesToBase64,
  base64ToBytes,
  stripLeadingZero,
  
  // Stellar/Canton утилиты
  privyPublicKeyToCantonBase64,
  getStellarWallets,
  getPublicKeyBase64,
  isStellarWallet,
  getFirstStellarWallet,
} from '@walletino/sdk';

// Пример использования
const publicKeyBase64 = privyPublicKeyToCantonBase64(wallet.publicKey);
const hashHex = base64ToHex('EiDjNq...');
```

## 📖 TypeScript

Все типы сгенерированы из Swagger спецификации:

```tsx
import type {
  // User types
  UserResponseDto,
  UserBalanceResponseDto,
  
  // Dialog types
  DialogWithMessagesResponseDto,
  MessageResponseDto,
  PaginatedDialogs,
  
  // Canton types
  CantonPrepareTransactionResponseDto,
  CantonSubmitTransactionResponseDto,
  
  // Token types
  TokenInfo,
  
  // Stellar wallet
  StellarWallet,
} from '@walletino/sdk';
```

## 🔧 Troubleshooting

### ❌ "No Stellar wallet found"

```tsx
const { stellarWallet, createStellarWallet } = useCanton();

if (!stellarWallet) {
  await createStellarWallet();
}
```

### ❌ "useWalletinoContext must be used within WalletinoProvider"

Убедитесь, что компонент обёрнут в провайдер:

```tsx
<WalletinoProvider config={{...}}>
  <App />
</WalletinoProvider>
```

### ❌ Ошибки CORS

Проверьте настройки CORS на backend API. Домен должен быть добавлен в whitelist.

### ❌ Privy модальное окно не открывается

1. Проверьте `privyAppId` в конфиге
2. Убедитесь, что домен добавлен в Privy Dashboard
3. Проверьте консоль на ошибки Privy SDK

### ⚠️ Buffer is not defined (не должно происходить)

SDK автоматически полифиллит `Buffer` в браузере. Если ошибка всё же возникает:

```tsx
// В main.tsx или App.tsx (не требуется с версии 0.1.0+)
import { Buffer } from 'buffer';
if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
}
```

## 🏗️ Разработка

### Запуск демо приложения

```bash
# Клонировать репозиторий
git clone <repo-url>
cd supa-sdk

# Установить зависимости SDK
npm install

# Перейти в demo и запустить
cd demo
npm install
npm run dev
```

### Сборка SDK

```bash
npm run build
```

Результат сборки в `/dist`:
- `index.js` - CommonJS
- `index.esm.js` - ES Modules
- `index.d.ts` - TypeScript типы

### Type Checking

```bash
npm run type-check
```

## 📁 Архитектура

```
/src
  /core          # HTTP client, типы DTOs
    - client.ts
    - types.ts
    
  /providers     # React провайдеры
    - WalletinoProvider.tsx
    
  /hooks         # React хуки
    - useAuth.ts
    - useCanton.ts
    - useAPI.ts
    - useWalletino.ts
    
  /services      # Бизнес-логика
    - cantonService.ts
    - apiService.ts
    
  /utils         # Утилиты
    - converters.ts    # hex ↔ base64
    - stellar.ts       # Stellar wallets
    
  index.ts       # Главный экспорт

/demo            # Демо приложение
```

## 📝 License

MIT

## 🤝 Support

- **GitHub Issues**: [Создать issue](https://github.com/your-repo/issues)
- **Backend API Docs**: https://stage_api.walletino.fyi/api
- **Privy Documentation**: https://docs.privy.io
- **Canton Network**: https://canton.network

---

**Версия:** 0.1.0  
**React:** 18+ (19 поддерживается)  
**TypeScript:** 5+  
**Canton Network:** Ed25519 signing via Stellar  
**Privy SDK:** 3.3.0+

Made with ❤️ for Web3 developers
