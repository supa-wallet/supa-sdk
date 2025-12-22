# Supa SDK Demo

Демонстрационное приложение для **Supa SDK** с примерами интеграции Privy.io и Canton Network.

## 🎯 Что внутри

Это демо показывает:

- ✅ Вход через Privy (email, кошельки, социальные сети)
- ✅ Создание Stellar кошелька для Canton Network
- ✅ Регистрация Canton кошелька на backend
- ✅ Получение тестовых токенов из devnet крана
- ✅ Подпись транзакций через Privy
- ✅ Работа с Supa Backend API
- 🔍 **Debug Panel** - просмотр всех промежуточных значений (publicKey, hash, signature)

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка переменных окружения

Создайте `.env` файл в папке `demo`:

```env
VITE_PRIVY_APP_ID=your_privy_app_id
VITE_PRIVY_CLIENT_ID=your_privy_client_id
VITE_API_BASE_URL=https://stage_api.supa.fyi
```

> **Важно**: Получите Privy credentials на https://dashboard.privy.io

### 3. Запуск

```bash
npm run dev
```

Приложение откроется на http://localhost:6969

## 📖 Структура проекта

```
/demo
  /src
    - App.tsx           # Главный компонент с полным примером
    - main.tsx          # Точка входа
    - index.css         # Стили
  - vite.config.ts      # Конфигурация Vite
  - package.json
  - README.md (этот файл)
```

## 🎨 Особенности демо

### 1. Пошаговая регистрация

Демо разделено на логические блоки:

```tsx
// Шаг 1: Вход через Privy
<button onClick={() => auth.login()}>Login with Privy</button>

// Шаг 2: Регистрация Canton (автоматически создаст Stellar)
<button onClick={() => canton.registerCanton()}>Register Canton</button>

// Шаг 3: Получение тестовых токенов
<button onClick={() => canton.tapDevnet('1000')}>Tap Devnet</button>
```

### 2. Debug Panel

Debug Panel показывает все промежуточные значения:

- **publicKey** (hex от Privy)
- **publicKey** (base64 для Canton)
- **JWT Token** от Privy
- **hash** (от `/canton/register/prepare`)
- **signature** (после подписи через Privy)

Это помогает разработчикам понять, что происходит на каждом шаге.

### 3. Отдельные тестовые кнопки

Демо включает кнопки для тестирования отдельных шагов:

```tsx
// Тестировать только /prepare
<button onClick={handleTestPrepareOnly}>
  🔬 Step 4: Test /prepare ONLY
</button>

// Тестировать полный флоу prepare → sign → submit
<button onClick={handleTestPrepareSignSubmit}>
  🚀 Steps 4→5→6: prepare → sign → submit
</button>
```

## 🔧 Конфигурация Vite

Demo использует следующую конфигурацию Vite:

```typescript
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['buffer'], // Для совместимости с Privy SDK
  },
});
```

> **Примечание**: Buffer polyfill встроен в Supa SDK, дополнительная настройка не требуется.

## 📝 Примеры использования

### Базовый вход

```tsx
import { useAuth } from '@supa/sdk';

function LoginButton() {
  const { login, authenticated, user } = useAuth();

  return (
    <>
      {!authenticated ? (
        <button onClick={login}>Login</button>
      ) : (
        <p>Welcome, {user?.email?.address}!</p>
      )}
    </>
  );
}
```

### Регистрация Canton

```tsx
import { useCanton } from '@supa/sdk';

function RegisterCanton() {
  const { registerCanton, isRegistered, loading, error } = useCanton();

  return (
    <>
      {!isRegistered ? (
        <button onClick={registerCanton} disabled={loading}>
          Register Canton Wallet
        </button>
      ) : (
        <p>✅ Canton wallet registered!</p>
      )}
      {error && <p style={{ color: 'red' }}>{error.message}</p>}
    </>
  );
}
```

### Получение тестовых токенов

```tsx
import { useCanton } from '@supa/sdk';

function TapDevnet() {
  const { tapDevnet, loading } = useCanton();

  const handleTap = async () => {
    try {
      const result = await tapDevnet('1000');
      console.log('Tap result:', result);
      alert('✅ Tokens received!');
    } catch (err) {
      alert('❌ Tap failed: ' + err.message);
    }
  };

  return (
    <button onClick={handleTap} disabled={loading}>
      Get Test Tokens
    </button>
  );
}
```

## 🐛 Troubleshooting

### Ошибка "Privy modal not opening"

Убедитесь, что:
1. `VITE_PRIVY_APP_ID` корректный
2. Домен `localhost:6969` добавлен в Privy Dashboard
3. Используется правильный `VITE_PRIVY_CLIENT_ID`

### Ошибка "No Stellar wallet found"

Canton wallet требует Stellar wallet. Если wallet не создаётся автоматически:

```tsx
const { createStellarWallet } = useCanton();
await createStellarWallet();
```

### Ошибка "Canton wallet already exists"

Каждый пользователь может иметь только **один** Canton wallet. Для повторного тестирования:
- Используйте другой email для входа в Privy
- Или попросите backend удалить существующий Canton wallet

### CORS ошибки

Если видите CORS ошибки:
1. Проверьте `VITE_API_BASE_URL`
2. Убедитесь, что backend API разрешает запросы с `localhost:6969`

## 📚 Дополнительные ресурсы

- **Основное README SDK**: `/README.md` в корне проекта
- **Privy Documentation**: https://docs.privy.io
- **Canton Network**: https://canton.network
- **Backend API Docs**: https://stage_api.supa.fyi/api

## 🔄 Workflow для разработчиков

### 1. Тестирование с нуля

```bash
# 1. Запустить demo
npm run dev

# 2. Открыть в браузере
open http://localhost:6969

# 3. Следовать UI:
#    - Login with Privy
#    - Register Canton Wallet
#    - Tap Devnet
#    - Check Debug Panel для деталей
```

### 2. Отладка отдельных шагов

Используйте Debug Panel кнопки:

- **"🔬 Test /prepare ONLY"** - проверить только подготовку транзакции
- **"🚀 prepare → sign → submit"** - проверить полный флоу регистрации

### 3. Просмотр логов

Откройте Console (F12) для просмотра детальных логов:

```
[Supa SDK] ✅ Buffer polyfill initialized
[Stellar Utils] 📋 getStellarWallets
[Converters] 🔑 Converting Privy publicKey to Canton base64
...
```

## 🎓 Обучение SDK

Демо приложение - это отличное место для изучения SDK:

1. Прочитайте `src/App.tsx` - полный пример интеграции
2. Посмотрите как работают хуки: `useAuth`, `useCanton`, `useAPI`
3. Изучите Debug Panel для понимания потока данных
4. Экспериментируйте с кодом!

## 💡 Tips & Tricks

### Быстрая очистка состояния

Чтобы сбросить всё:
```bash
# Очистить localStorage
localStorage.clear();

# Перезагрузить страницу
location.reload();
```

### Просмотр JWT Token

Debug Panel показывает:
- Raw JWT token от Privy
- Decoded payload (user ID, email, expiration)

### Копирование значений

Все значения в Debug Panel можно скопировать для тестирования в Postman/Insomnia.

---

**Версия Demo:** 0.1.0  
**SDK Version:** ^0.1.0  
**Vite:** 7+  
**React:** 19+

Удачного кодинга! 🚀
