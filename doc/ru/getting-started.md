# Быстрый старт с Supa SDK

Руководство по быстрой интеграции Supa SDK.

## Предварительные требования

- Node.js 18+
- React 18+
- TypeScript 5+ (рекомендуется)
- Privy App ID с [dashboard.privy.io](https://dashboard.privy.io)

## Установка

```bash
npm install @supa/sdk
```

## Конфигурация окружения

```env
VITE_PRIVY_APP_ID=your_privy_app_id
VITE_PRIVY_CLIENT_ID=your_privy_client_id
VITE_API_BASE_URL=https://stage_api.supa.fyi
```

## Базовая настройка

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

## Использование

### Аутентификация

```tsx
import { useAuth } from '@supa/sdk';

export function App() {
  const { login, logout, authenticated, user } = useAuth();

  if (!authenticated) {
    return <button onClick={login}>Войти</button>;
  }

  return (
    <div>
      <div>Пользователь: {user?.email?.address}</div>
      <button onClick={logout}>Выйти</button>
    </div>
  );
}
```

### Интеграция Canton

```tsx
import { useCanton } from '@supa/sdk';

export function Canton() {
  const { stellarWallet, registerCanton, isRegistered, loading } = useCanton();

  if (!stellarWallet) return <div>Создание кошелька...</div>;

  if (!isRegistered) {
    return (
      <div>
        <div>Адрес: {stellarWallet.address}</div>
        <button onClick={registerCanton} disabled={loading}>
          Зарегистрировать Canton
        </button>
      </div>
    );
  }

  return <div>Canton кошелёк зарегистрирован</div>;
}
```

### Использование API

```tsx
import { useAPI } from '@supa/sdk';

export function Balance() {
  const api = useAPI();
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    api.user.getBalance().then(setBalance);
  }, []);

  return <div>Всего: ${balance?.totalUsdBalance}</div>;
}
```

## Следующие шаги

- [API Reference](./api-reference.md) - Полная документация API
- [Canton Integration](./canton-integration.md) - Детали Canton Network
- [Examples](./examples.md) - Расширенные примеры

## Решение проблем

### Privy модальное окно не открывается

Добавьте домен в Privy Dashboard → Settings → Allowed domains

### Ошибка Buffer

```tsx
import { Buffer } from 'buffer';
window.Buffer = Buffer;
```

### TypeScript типы для env

```typescript
// vite-env.d.ts
interface ImportMetaEnv {
  readonly VITE_PRIVY_APP_ID: string;
  readonly VITE_PRIVY_CLIENT_ID?: string;
  readonly VITE_API_BASE_URL?: string;
}
```

---

**Версия SDK**: 0.1.0

