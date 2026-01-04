# EVM Smart Wallets Support

Supa SDK теперь поддерживает EVM Smart Wallets от Privy, что позволяет использовать смарт-контракты для управления кошельками пользователей.

## Установка зависимостей

Smart Wallets требуют дополнительные peer dependencies:

```bash
npm install permissionless viem
```

## Настройка

### 1. Включение Smart Wallets в конфигурации

Добавьте параметр `smartWallets` в конфигурацию `SupaProvider`:

```tsx
import { SupaProvider } from '@supanovaapp/sdk';

function App() {
  return (
    <SupaProvider
      config={{
        privyAppId: 'your-privy-app-id',
        privyClientId: 'your-client-id',
        nodeIdentifier: 'your-node',
        apiBaseUrl: 'https://api.example.com',
        
        // Включить Smart Wallets
        smartWallets: {
          enabled: true,
        },
      }}
    >
      <YourApp />
    </SupaProvider>
  );
}
```

### 2. Настройка Paymaster Context (опционально)

Для спонсирования газа через Alchemy или Biconomy:

```tsx
smartWallets: {
  enabled: true,
  paymasterContext: {
    mode: 'SPONSORED',
    calculateGasLimits: true,
    expiryDuration: 300,
    sponsorshipInfo: {
      webhookData: {},
      smartAccountInfo: {
        name: 'BICONOMY',
        version: '2.0.0'
      }
    }
  }
}
```

## Использование в компонентах

### Хук useSmartWallets

```tsx
import { useSmartWallets } from '@supanovaapp/sdk';

function MyComponent() {
  const { client, address, ready, getClientForChain } = useSmartWallets();

  if (!ready) {
    return <div>Загрузка Smart Wallet...</div>;
  }

  return (
    <div>
      <p>Smart Wallet адрес: {address}</p>
      {/* Smart Wallet создаётся автоматически */}
    </div>
  );
}
```

### Интеграция с useSupa

Smart Wallets автоматически интегрируются с основным хуком:

```tsx
import { useSupa } from '@supanovaapp/sdk';

function Dashboard() {
  const { 
    auth,
    canton,
    // Smart Wallets доступны через useSmartWallets
  } = useSupa();

  // Ваша логика
}
```

## API Reference

### SupaConfig.smartWallets

```typescript
interface SmartWalletsConfig {
  /** Включить поддержку Smart Wallets */
  enabled?: boolean;
  
  /** Настройки paymaster для спонсирования газа */
  paymasterContext?: {
    mode?: string;
    calculateGasLimits?: boolean;
    expiryDuration?: number;
    sponsorshipInfo?: {
      webhookData?: Record<string, any>;
      smartAccountInfo?: {
        name?: string;
        version?: string;
      };
    };
  };
}
```

### useSmartWallets()

Возвращает:

```typescript
interface UseSmartWalletsReturn {
  /** Клиент для взаимодействия со smart wallet */
  client: SmartWalletClient | undefined;
  
  /** Получить клиент для конкретной сети */
  getClientForChain: (args: { id: number }) => Promise<SmartWalletClient | undefined>;
  
  /** Адрес smart wallet пользователя */
  address: string | undefined;
  
  /** Готов ли smart wallet к использованию */
  ready: boolean;
}
```

## Важные замечания

1. **Dashboard конфигурация**: Убедитесь, что вы настроили Smart Wallets в [Privy Dashboard](https://dashboard.privy.io) перед использованием в SDK.

2. **Сети**: Сети, настроенные для Smart Wallets в Dashboard, должны совпадать с `defaultChain` и `supportedChains` вашего приложения.

3. **Автоматическое создание**: Smart Wallets создаются автоматически для пользователей после создания embedded wallet.

4. **Embedded wallet как signer**: Embedded wallet используется как основной подписант для управления Smart Wallet.

## Примеры использования

### Базовый пример

```tsx
import { SupaProvider, useAuth, useSmartWallets } from '@supanovaapp/sdk';

function App() {
  return (
    <SupaProvider
      config={{
        privyAppId: process.env.REACT_APP_PRIVY_APP_ID!,
        nodeIdentifier: 'my-node',
        smartWallets: { enabled: true },
      }}
    >
      <WalletComponent />
    </SupaProvider>
  );
}

function WalletComponent() {
  const { authenticated, login } = useAuth();
  const { address, ready } = useSmartWallets();

  if (!authenticated) {
    return <button onClick={login}>Войти</button>;
  }

  if (!ready) {
    return <div>Инициализация Smart Wallet...</div>;
  }

  return (
    <div>
      <h2>Smart Wallet</h2>
      <p>Адрес: {address}</p>
      {/* Smart Wallet автоматически создаётся для пользователей с embedded wallet */}
    </div>
  );
}
```

### С Biconomy Paymaster

```tsx
<SupaProvider
  config={{
    privyAppId: 'your-app-id',
    nodeIdentifier: 'node',
    smartWallets: {
      enabled: true,
      paymasterContext: {
        mode: 'SPONSORED',
        calculateGasLimits: true,
        expiryDuration: 300,
        sponsorshipInfo: {
          smartAccountInfo: {
            name: 'BICONOMY',
            version: '2.0.0'
          }
        }
      }
    }
  }}
>
  <YourApp />
</SupaProvider>
```

## Ссылки

- [Privy Smart Wallets Documentation](https://docs.privy.io/wallets/using-wallets/evm-smart-wallets/setup/configuring-sdk)
- [Privy Dashboard](https://dashboard.privy.io)
- [Viem Documentation](https://viem.sh)
- [Permissionless.js](https://docs.pimlico.io/permissionless)

