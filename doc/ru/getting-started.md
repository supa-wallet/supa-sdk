# Быстрый старт с Walletino SDK

Это руководство проведет вас через процесс интеграции Walletino SDK в ваш проект шаг за шагом.

## 📋 Предварительные требования

Перед началом убедитесь, что у вас есть:

- ✅ **Node.js** 18+ (рекомендуется 20+)
- ✅ **React** 18+ или 19+
- ✅ **TypeScript** 5+ (опционально, но рекомендуется)
- ✅ **Privy App ID** (получить на [dashboard.privy.io](https://dashboard.privy.io))
- ✅ **Доступ к Walletino Backend API**

## 🚀 Шаг 1: Установка

### Установка через npm

```bash
npm install @walletino/sdk
```

### Установка через yarn

```bash
yarn add @walletino/sdk
```

### Установка через pnpm

```bash
pnpm add @walletino/sdk
```

SDK автоматически установит необходимые зависимости:
- `@privy-io/react-auth` - для аутентификации
- `axios` - для HTTP запросов
- `buffer` - для browser polyfill (используется внутри)

## ⚙️ Шаг 2: Настройка переменных окружения

Создайте файл `.env` в корне вашего проекта:

```env
# Privy Configuration
VITE_PRIVY_APP_ID=your_privy_app_id_here
VITE_PRIVY_CLIENT_ID=your_privy_client_id_here

# Walletino Backend
VITE_API_BASE_URL=https://stage_api.walletino.fyi

# Optional: для production
# VITE_API_BASE_URL=https://api.walletino.fyi
```

### Получение Privy Credentials

1. Зарегистрируйтесь на [dashboard.privy.io](https://dashboard.privy.io)
2. Создайте новое приложение
3. Добавьте домены для разработки:
   - `http://localhost:5173` (Vite)
   - `http://localhost:3000` (Create React App)
   - Ваш production домен
4. Скопируйте **App ID** и **Client ID**

## 🔧 Шаг 3: Настройка провайдера

Оберните ваше приложение в `WalletinoProvider` в главном файле (обычно `main.tsx` или `App.tsx`).

### Для Vite проекта

```tsx
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { WalletinoProvider } from '@walletino/sdk';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WalletinoProvider
      config={{
        privyAppId: import.meta.env.VITE_PRIVY_APP_ID,
        privyClientId: import.meta.env.VITE_PRIVY_CLIENT_ID,
        apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
        appearance: {
          theme: 'light',
          accentColor: '6366f1',
        },
        loginMethods: ['email', 'wallet', 'google'],
      }}
    >
      <App />
    </WalletinoProvider>
  </React.StrictMode>
);
```

### Для Create React App

```tsx
// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { WalletinoProvider } from '@walletino/sdk';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <WalletinoProvider
      config={{
        privyAppId: process.env.REACT_APP_PRIVY_APP_ID!,
        privyClientId: process.env.REACT_APP_PRIVY_CLIENT_ID,
        apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'https://stage_api.walletino.fyi',
        appearance: {
          theme: 'light',
        },
        loginMethods: ['email', 'wallet'],
      }}
    >
      <App />
    </WalletinoProvider>
  </React.StrictMode>
);
```

### Для Next.js (App Router)

```tsx
// app/providers.tsx
'use client';

import { WalletinoProvider } from '@walletino/sdk';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WalletinoProvider
      config={{
        privyAppId: process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
        privyClientId: process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID,
        apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://stage_api.walletino.fyi',
        appearance: {
          theme: 'light',
        },
        loginMethods: ['email', 'wallet'],
      }}
    >
      {children}
    </WalletinoProvider>
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

## 📝 Шаг 4: Первый компонент

Создайте простой компонент для тестирования SDK:

```tsx
// src/components/Auth.tsx
import { useAuth } from '@walletino/sdk';

export function Auth() {
  const { login, logout, authenticated, user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!authenticated) {
    return (
      <div>
        <h1>Welcome to Walletino</h1>
        <button onClick={login}>Login with Privy</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Welcome, {user?.email?.address || 'User'}!</h1>
      <p>You are logged in</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

Используйте компонент в `App.tsx`:

```tsx
// src/App.tsx
import { Auth } from './components/Auth';

function App() {
  return (
    <div className="App">
      <Auth />
    </div>
  );
}

export default App;
```

## 🌐 Шаг 5: Интеграция Canton Network

После успешной аутентификации добавьте функционал Canton:

```tsx
// src/components/Canton.tsx
import { useCanton } from '@walletino/sdk';

export function Canton() {
  const { 
    stellarWallet, 
    registerCanton, 
    tapDevnet, 
    isRegistered, 
    loading, 
    error 
  } = useCanton();

  if (!stellarWallet) {
    return (
      <div>
        <p>Creating Stellar wallet...</p>
      </div>
    );
  }

  if (!isRegistered) {
    return (
      <div>
        <h2>Register Canton Wallet</h2>
        <p>Stellar Address: {stellarWallet.address}</p>
        <button onClick={registerCanton} disabled={loading}>
          {loading ? 'Registering...' : 'Register Canton Wallet'}
        </button>
        {error && <p style={{ color: 'red' }}>{error.message}</p>}
      </div>
    );
  }

  return (
    <div>
      <h2>Canton Wallet Registered ✅</h2>
      <p>Stellar Address: {stellarWallet.address}</p>
      <button 
        onClick={() => tapDevnet('1000')} 
        disabled={loading}
      >
        {loading ? 'Getting tokens...' : 'Get Test Tokens (Devnet)'}
      </button>
      {error && <p style={{ color: 'red' }}>{error.message}</p>}
    </div>
  );
}
```

Обновите `App.tsx`:

```tsx
// src/App.tsx
import { useAuth } from '@walletino/sdk';
import { Auth } from './components/Auth';
import { Canton } from './components/Canton';

function App() {
  const { authenticated } = useAuth();

  return (
    <div className="App">
      <Auth />
      {authenticated && <Canton />}
    </div>
  );
}

export default App;
```

## 🎨 Шаг 6: Добавление стилей (опционально)

Базовые стили для улучшения UI:

```css
/* src/index.css */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #333;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.App {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 90%;
}

h1 {
  color: #667eea;
  margin-bottom: 1rem;
}

h2 {
  color: #764ba2;
  margin-bottom: 1rem;
}

button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  margin-top: 1rem;
}

button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

p {
  margin: 0.5rem 0;
  line-height: 1.6;
}
```

## ✅ Шаг 7: Проверка работы

Запустите ваше приложение:

```bash
npm run dev
```

Откройте http://localhost:5173 (или другой порт) и проверьте:

1. ✅ Кнопка "Login with Privy" открывает модальное окно
2. ✅ После входа отображается email пользователя
3. ✅ Появляется кнопка "Register Canton Wallet"
4. ✅ После регистрации появляется кнопка "Get Test Tokens"

## 🎯 Следующие шаги

Теперь, когда базовая интеграция работает:

1. **[API Reference](./api-reference.md)** - изучите все доступные хуки и методы
2. **[Canton Integration](./canton-integration.md)** - углубитесь в работу с Canton
3. **[Examples](./examples.md)** - посмотрите расширенные примеры
4. **[Troubleshooting](./troubleshooting.md)** - если что-то пошло не так

## 🐛 Частые проблемы при запуске

### Privy модальное окно не открывается

**Решение**: Проверьте, что домен добавлен в Privy Dashboard:
1. Откройте [dashboard.privy.io](https://dashboard.privy.io)
2. Выберите ваше приложение
3. Settings → Allowed domains
4. Добавьте `http://localhost:5173`

### Ошибка "Buffer is not defined"

**Решение**: SDK автоматически полифиллит Buffer, но если проблема осталась:
```tsx
// main.tsx (в самом начале)
import { Buffer } from 'buffer';
window.Buffer = Buffer;
```

### TypeScript ошибки с env переменными

**Решение**: Создайте файл типов:
```typescript
// src/vite-env.d.ts
interface ImportMetaEnv {
  readonly VITE_PRIVY_APP_ID: string;
  readonly VITE_PRIVY_CLIENT_ID?: string;
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

## 📚 Дополнительные ресурсы

- **Полный пример**: см. `/demo` в репозитории SDK
- **TypeScript типы**: все типы экспортируются из SDK
- **Backend API**: https://stage_api.walletino.fyi/api

---

**Готово!** 🎉 Теперь у вас работает базовая интеграция Walletino SDK.

