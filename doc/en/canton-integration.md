# Canton Network Integration

Подробное руководство по интеграции с Canton Network через Walletino SDK.

## 📖 Содержание

- [Что такое Canton Network](#что-такое-canton-network)
- [Почему Stellar](#почему-stellar)
- [Архитектура интеграции](#архитектура-интеграции)
- [Конвертация ключей](#конвертация-ключей)
- [Регистрация кошелька](#регистрация-кошелька)
- [Подпись транзакций](#подпись-транзакций)
- [Devnet Faucet](#devnet-faucet)
- [Продвинутое использование](#продвинутое-использование)

---

## Что такое Canton Network

**Canton Network** - это распределенная сеть для синхронизации данных и выполнения смарт-контрактов. SDK интегрируется с Canton через Walletino Backend API.

### Ключевые особенности

- ✅ **Ed25519 подпись** - Canton использует Ed25519 для криптографии
- ✅ **Base64 формат** - Canton API принимает данные в base64
- ✅ **Stellar wallets** - Privy использует Stellar для Ed25519 подписи
- ✅ **Автоматическая конвертация** - SDK автоматически конвертирует форматы

---

## Почему Stellar

Canton Network требует **Ed25519** подпись. Privy.io предоставляет Ed25519 через **Stellar chain type**.

```
Canton (Ed25519) ← SDK ← Privy (Stellar = Ed25519)
```

### Преимущества Stellar в этом контексте

1. **Нативная Ed25519** - Stellar использует Ed25519 для всех ключей
2. **Поддержка Privy** - полная интеграция через `@privy-io/react-auth/extended-chains`
3. **Raw hash signing** - возможность подписывать произвольные хэши
4. **Совместимость** - публичные ключи Stellar совместимы с Canton

---

## Архитектура интеграции

```
┌─────────────────┐
│   Your App      │
│  (React + SDK)  │
└────────┬────────┘
         │ useCanton()
         ↓
┌─────────────────┐      ┌──────────────┐
│  Walletino SDK  │ ←───→│  Privy SDK   │
│                 │      │  (Stellar)   │
└────────┬────────┘      └──────────────┘
         │ API calls
         ↓
┌─────────────────┐      ┌──────────────┐
│ Walletino API   │ ←───→│   Canton     │
│   (Backend)     │      │   Network    │
└─────────────────┘      └──────────────┘
```

### Флоу данных

1. **Ваше приложение** вызывает `registerCanton()`
2. **SDK** создаёт/получает Stellar кошелёк через Privy
3. **SDK** конвертирует publicKey (hex → base64)
4. **SDK** отправляет publicKey в `/canton/register/prepare`
5. **Backend** возвращает hash для подписи
6. **SDK** конвертирует hash (base64 → hex)
7. **Privy** подписывает hash используя Stellar wallet
8. **SDK** конвертирует signature (hex → base64)
9. **SDK** отправляет signature в `/canton/register/submit`
10. **Backend** регистрирует Canton кошелёк

---

## Конвертация ключей

### Public Key: Privy → Canton

Privy возвращает публичный ключ в **hex** с ведущим `00` байтом:

```
Privy hex:     00e95cb2553361ed95250c74f854814675d971cacdbd5dc3ec5de627fff7b71518
Length:        66 символов (33 байта)
```

Canton ожидает публичный ключ в **base64** БЕЗ ведущего `00`:

```
1. Удалить 0x префикс (если есть)
   00e95cb2553361ed95250c74f854814675d971cacdbd5dc3ec5de627fff7b71518

2. Удалить leading 00 byte
   e95cb2553361ed95250c74f854814675d971cacdbd5dc3ec5de627fff7b71518
   Length: 64 символа (32 байта) ✅ Корректная длина Ed25519

3. Конвертировать hex → bytes
   [0xe9, 0x5c, 0xb2, 0x55, ...]

4. Конвертировать bytes → base64
   6Vyy...
```

SDK делает это автоматически через `privyPublicKeyToCantonBase64()`.

### Пример конвертации вручную

```typescript
import { privyPublicKeyToCantonBase64 } from '@walletino/sdk';

const wallet = {
  publicKey: '00e95cb2553361ed95250c74f854814675d971cacdbd5dc3ec5de627fff7b71518'
};

const cantonPublicKey = privyPublicKeyToCantonBase64(wallet.publicKey);
console.log(cantonPublicKey);
// "6Vyy...RYU=" (base64, 32 байта)
```

### Hash/Signature конвертация

**Canton → Privy (для подписи):**
```
Canton hash (base64) → hex → Privy signRawHash
```

**Privy → Canton (после подписи):**
```
Privy signature (hex) → base64 → Canton API
```

SDK автоматически конвертирует через `base64ToHex()` и `hexToBase64()`.

---

## Регистрация кошелька

### Автоматическая регистрация

Самый простой способ - использовать `registerCanton()`:

```tsx
import { useCanton } from '@walletino/sdk';

function RegisterButton() {
  const { registerCanton, isRegistered, loading, error } = useCanton();

  const handleRegister = async () => {
    try {
      // Автоматически:
      // 1. Создаст Stellar wallet если нет
      // 2. Получит publicKey и конвертирует в base64
      // 3. Вызовет /canton/register/prepare
      // 4. Подпишет hash через Privy
      // 5. Отправит signature в /canton/register/submit
      await registerCanton();
      
      console.log('✅ Canton wallet registered!');
    } catch (err) {
      console.error('❌ Registration failed:', err);
    }
  };

  if (isRegistered) {
    return <p>Canton wallet is already registered</p>;
  }

  return (
    <button onClick={handleRegister} disabled={loading}>
      {loading ? 'Registering...' : 'Register Canton Wallet'}
    </button>
  );
}
```

### Пошаговая регистрация

Для более тонкого контроля:

```tsx
import { useCanton } from '@walletino/sdk';
import { useAuth } from '@walletino/sdk';
import { getPublicKeyBase64 } from '@walletino/sdk';

function ManualRegistration() {
  const { getAccessToken } = useAuth();
  const { stellarWallet, createStellarWallet } = useCanton();

  const handleManualRegister = async () => {
    // Шаг 1: Убедиться что есть Stellar кошелёк
    let wallet = stellarWallet;
    if (!wallet) {
      wallet = await createStellarWallet();
      if (!wallet) throw new Error('Failed to create wallet');
    }

    // Шаг 2: Получить publicKey в base64
    const publicKey = getPublicKeyBase64(wallet);
    console.log('Public key (base64):', publicKey);

    // Шаг 3: Получить токен для API
    const token = await getAccessToken();

    // Шаг 4: Вызвать /canton/register/prepare
    const prepareResponse = await fetch(
      'https://stage_api.walletino.fyi/canton/register/prepare',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publicKey }),
      }
    );
    const { hash } = await prepareResponse.json();
    console.log('Hash from prepare:', hash);

    // Шаги 5-6: Подпись и submit делаются через useCanton.signHash()
    // или напрямую через Privy useSignRawHash
  };

  return <button onClick={handleManualRegister}>Manual Register</button>;
}
```

### Важные моменты

⚠️ **Один кошелёк на пользователя**: Пользователь может иметь только один Canton кошелёк. Повторная регистрация вернёт ошибку.

⚠️ **Stellar кошелёк обязателен**: Canton регистрация требует Stellar кошелёк. SDK автоматически создаст его если нужно.

⚠️ **Токен авторизации**: Все API запросы требуют JWT токен от Privy в заголовке `Authorization: Bearer <token>`.

---

## Подпись транзакций

### Подпись произвольного хэша

Canton может запросить подпись любого хэша (например, для транзакций):

```tsx
import { useCanton } from '@walletino/sdk';

function SignTransaction() {
  const { signHash, stellarWallet } = useCanton();

  const handleSign = async () => {
    if (!stellarWallet) {
      alert('No Stellar wallet found');
      return;
    }

    // Хэш от Canton в base64 формате
    const cantonHash = 'EiDjNqHetYYin8ypx87LAmJwzxhBX4rFMi4Z/sSsvdQ7bg==';

    try {
      // SDK автоматически:
      // 1. Конвертирует base64 → hex
      // 2. Подпишет через Privy (Stellar)
      // 3. Конвертирует signature hex → base64
      const signature = await signHash(cantonHash);
      
      console.log('Signature (base64):', signature);
      // Теперь можно отправить signature в Canton API
    } catch (err) {
      console.error('Signing failed:', err);
    }
  };

  return <button onClick={handleSign}>Sign Canton Hash</button>;
}
```

### Прямая подпись через Privy

Для максимального контроля:

```tsx
import { useSignRawHash } from '@privy-io/react-auth/extended-chains';
import { useCanton } from '@walletino/sdk';
import { base64ToHex, hexToBase64 } from '@walletino/sdk';

function DirectSigning() {
  const { signRawHash } = useSignRawHash();
  const { stellarWallet } = useCanton();

  const handleDirectSign = async () => {
    const cantonHashBase64 = 'EiDjNq...';
    
    // 1. Конвертировать Canton hash (base64) в hex для Privy
    const hashHex = base64ToHex(cantonHashBase64);
    console.log('Hash for Privy (hex):', hashHex);

    // 2. Подписать через Privy
    const result = await signRawHash({
      address: stellarWallet!.address,
      chainType: 'stellar',
      hash: hashHex as `0x${string}`,
    });
    console.log('Signature from Privy (hex):', result.signature);

    // 3. Конвертировать signature обратно в base64 для Canton
    const signatureBase64 = hexToBase64(result.signature);
    console.log('Signature for Canton (base64):', signatureBase64);

    return signatureBase64;
  };

  return <button onClick={handleDirectSign}>Direct Sign</button>;
}
```

---

## Devnet Faucet

Devnet faucet позволяет получить тестовые токены для разработки.

### Базовое использование

```tsx
import { useCanton } from '@walletino/sdk';

function TapFaucet() {
  const { tapDevnet, loading, error } = useCanton();

  const handleTap = async () => {
    try {
      // amount в строковом формате
      const result = await tapDevnet('1000');
      
      console.log('Transaction result:', result);
      alert(`✅ Received 1000 test tokens!`);
    } catch (err) {
      console.error('Tap failed:', err);
      alert(`❌ Error: ${err.message}`);
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

### С разными суммами

```tsx
import { useCanton } from '@walletino/sdk';
import { useState } from 'react';

function CustomAmountTap() {
  const { tapDevnet, loading } = useCanton();
  const [amount, setAmount] = useState('1000');

  const handleTap = async () => {
    try {
      const result = await tapDevnet(amount);
      console.log(`Received ${amount} tokens:`, result);
    } catch (err) {
      console.error('Tap failed:', err);
    }
  };

  return (
    <>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        min="1"
        max="10000"
      />
      <button onClick={handleTap} disabled={loading}>
        Tap {amount} Tokens
      </button>
    </>
  );
}
```

### ⚠️ Важно

- **Только для devnet**: Faucet работает только в тестовой сети
- **Лимиты**: Могут быть ограничения на количество и частоту запросов
- **Регистрация обязательна**: Нужен зарегистрированный Canton кошелёк

---

## Продвинутое использование

### Проверка статуса регистрации

```tsx
import { useCanton } from '@walletino/sdk';
import { useEffect } from 'react';

function RegistrationStatus() {
  const { isRegistered, stellarWallet } = useCanton();

  useEffect(() => {
    console.log('Registration status:', {
      hasWallet: !!stellarWallet,
      isRegistered,
      walletAddress: stellarWallet?.address,
    });
  }, [stellarWallet, isRegistered]);

  return (
    <div>
      <p>Stellar Wallet: {stellarWallet ? '✅' : '❌'}</p>
      <p>Canton Registered: {isRegistered ? '✅' : '❌'}</p>
    </div>
  );
}
```

### Обработка ошибок

```tsx
import { useCanton } from '@walletino/sdk';

function ErrorHandling() {
  const { registerCanton, error, clearError } = useCanton();

  const handleRegister = async () => {
    clearError(); // Очистить предыдущие ошибки

    try {
      await registerCanton();
    } catch (err: any) {
      // Обработка специфичных ошибок
      if (err.message.includes('already exists')) {
        alert('Canton wallet already registered!');
      } else if (err.message.includes('Stellar wallet')) {
        alert('Failed to create Stellar wallet. Please try again.');
      } else {
        alert(`Error: ${err.message}`);
      }
    }
  };

  return (
    <>
      <button onClick={handleRegister}>Register</button>
      {error && (
        <div style={{ color: 'red' }}>
          <p>{error.message}</p>
          <button onClick={clearError}>Dismiss</button>
        </div>
      )}
    </>
  );
}
```

### Кастомная транзакция Canton

Если нужно отправить собственную транзакцию:

```tsx
import { useAuth, useCanton } from '@walletino/sdk';
import { hexToBase64 } from '@walletino/sdk';

function CustomCantonTransaction() {
  const { getAccessToken } = useAuth();
  const { signHash } = useCanton();

  const sendCustomTransaction = async (transactionData: any) => {
    // 1. Подготовить транзакцию на backend
    const token = await getAccessToken();
    const prepareResponse = await fetch(
      'https://stage_api.walletino.fyi/canton/api/prepare-custom',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      }
    );
    const { hash } = await prepareResponse.json();

    // 2. Подписать hash
    const signature = await signHash(hash);

    // 3. Отправить подписанную транзакцию
    const submitResponse = await fetch(
      'https://stage_api.walletino.fyi/canton/api/submit',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hash, signature }),
      }
    );

    return await submitResponse.json();
  };

  return <button onClick={() => sendCustomTransaction({ /* ... */ })}>
    Send Custom Transaction
  </button>;
}
```

---

## Troubleshooting Canton

### "No Stellar wallet found"

**Причина**: Canton требует Stellar кошелёк для Ed25519 подписи.

**Решение**:
```tsx
const { createStellarWallet, stellarWallet } = useCanton();

if (!stellarWallet) {
  await createStellarWallet();
}
```

### "Canton wallet already exists"

**Причина**: Пользователь уже зарегистрировал Canton кошелёк.

**Решение**: Это нормально. Используйте `isRegistered` для проверки:
```tsx
if (!isRegistered) {
  await registerCanton();
} else {
  console.log('Already registered');
}
```

### "Invalid signature"

**Причина**: Некорректная конвертация или подпись не того хэша.

**Решение**: Убедитесь что:
1. Hash конвертируется base64 → hex перед подписью
2. Signature конвертируется hex → base64 перед отправкой
3. Используется правильный Stellar кошелёк

### "Public key format error"

**Причина**: Неправильная конвертация publicKey.

**Решение**: Используйте встроенную функцию SDK:
```tsx
import { getPublicKeyBase64 } from '@walletino/sdk';

const publicKey = getPublicKeyBase64(stellarWallet);
```

---

## Дополнительные ресурсы

- **Canton Network Docs**: https://canton.network
- **Privy Stellar Integration**: https://docs.privy.io/guide/react/wallets/extended-chains
- **Ed25519 Specification**: https://ed25519.cr.yp.to

---

**Последнее обновление**: Декабрь 2025  
**Версия SDK**: 0.1.0

