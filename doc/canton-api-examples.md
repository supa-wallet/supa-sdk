# Примеры использования Canton API

Этот документ содержит примеры использования новых методов Canton API в Supa SDK.

## Содержание

- [История транзакций](#история-транзакций)
- [История цен Canton Coin](#история-цен-canton-coin)
- [Входящие трансферы](#входящие-трансферы)

## История транзакций

### Получение истории транзакций

```typescript
import { useSupa } from '@supanovaapp/sdk';

function TransactionHistory() {
  const { canton } = useSupa();
  
  // Загрузить последние 20 транзакций
  const loadTransactions = async () => {
    const transactions = await canton.getTransactions({ limit: 20 });
    console.log('Транзакции:', transactions);
  };
}
```

### Пагинация транзакций

```typescript
// Загрузить следующую страницу (более старые транзакции)
const loadMoreTransactions = async (oldestOffset: number) => {
  const olderTransactions = await canton.getTransactions({
    limit: 20,
    beforeOffsetExclusive: oldestOffset
  });
  return olderTransactions;
};

// Пример использования:
const firstPage = await canton.getTransactions({ limit: 20 });
const oldestTx = firstPage[firstPage.length - 1];
const secondPage = await canton.getTransactions({
  limit: 20,
  beforeOffsetExclusive: oldestTx.ledgerOffset
});
```

### Структура транзакции

```typescript
interface CantonTransactionDto {
  balanceChange: number;              // Изменение баланса
  date: string;                       // ISO 8601 дата
  details: Record<string, unknown>;   // Дополнительные детали
  ledgerOffset: number;               // Offset для пагинации
  lockedChange: number;               // Изменение заблокированного баланса
  tokenOperations: TokenOperation[];  // Операции с токенами
  type: string;                       // Тип транзакции
  typeLabel: string;                  // Читаемое название типа
  updateId: string;                   // Уникальный ID
}

interface TokenOperation {
  amount: string;           // Сумма
  description?: string;     // Описание
  direction: 'in' | 'out' | 'lock' | 'unlock';
  token: string;            // Символ токена (например, "CC")
  counterparty?: string;    // Party ID контрагента (для трансферов)
}
```

### Типы транзакций

- `transfer_in` - Входящий трансфер
- `transfer_out` - Исходящий трансфер
- `subscription_payment` - Оплата подписки
- `subscription_accept` - Принятие подписки
- `subscription_offer` - Предложение подписки
- `preapproval_create` - Создание preapproval
- `unknown` - Неизвестный тип

## История цен Canton Coin

### Получение ценовых данных

```typescript
import { useSupa } from '@supanovaapp/sdk';
import type { CantonPriceInterval } from '@supanovaapp/sdk';

function PriceChart() {
  const { canton } = useSupa();
  
  // Загрузить почасовые данные
  const loadHourlyPrices = async () => {
    const candles = await canton.getPriceHistory('1h');
    console.log('Почасовые свечи:', candles);
  };
  
  // Загрузить дневные данные
  const loadDailyPrices = async () => {
    const candles = await canton.getPriceHistory('1d');
    console.log('Дневные свечи:', candles);
  };
}
```

### Доступные интервалы

```typescript
type CantonPriceInterval = '1h' | '1d' | '1w' | '1M';

// 1h  - Почасовые данные
// 1d  - Дневные данные
// 1w  - Недельные данные
// 1M  - Месячные данные
```

### Структура свечи

```typescript
interface CantonPriceCandleDto {
  open: string;   // Цена открытия
  close: string;  // Цена закрытия
  min: string;    // Минимальная цена
  max: string;    // Максимальная цена
  start: string;  // Начало интервала (ISO 8601)
  end: string;    // Конец интервала (ISO 8601)
}
```

### Пример расчета изменения цены

```typescript
const candles = await canton.getPriceHistory('1d');

if (candles.length > 0) {
  const latest = parseFloat(candles[candles.length - 1].close);
  const oldest = parseFloat(candles[0].open);
  const change = ((latest - oldest) / oldest) * 100;
  
  console.log(`Изменение цены: ${change.toFixed(2)}%`);
}
```

## Входящие трансферы

### Получение ожидающих трансферов

```typescript
import { useSupa } from '@supanovaapp/sdk';

function IncomingTransfers() {
  const { canton } = useSupa();
  
  const loadIncomingTransfers = async () => {
    const transfers = await canton.getPendingIncomingTransfers();
    console.log('Ожидающие трансферы:', transfers);
  };
}
```

### Структура входящего трансфера

```typescript
interface CantonIncomingTransferDto {
  instrument: {
    admin: string;  // Admin party ID
    id: string;     // Token ID (например, "Amulet" для Canton Coin)
  };
  contractId: string;     // ID контракта (используется для ответа)
  sender: string;         // Party ID отправителя
  receiver: string;       // Party ID получателя
  amount: string;         // Сумма трансфера
  requestedAt: string;    // Дата запроса (ISO 8601)
  executeBefore: string;  // Срок выполнения (ISO 8601)
}
```

### Принятие или отклонение трансфера

```typescript
const acceptTransfer = async (contractId: string) => {
  try {
    // Принять трансфер
    const result = await canton.respondToIncomingTransfer(contractId, true);
    console.log('Трансфер принят:', result);
  } catch (error) {
    console.error('Ошибка при принятии:', error);
  }
};

const rejectTransfer = async (contractId: string) => {
  try {
    // Отклонить трансфер
    const result = await canton.respondToIncomingTransfer(contractId, false);
    console.log('Трансфер отклонен:', result);
  } catch (error) {
    console.error('Ошибка при отклонении:', error);
  }
};
```

### Полный пример с UI

```typescript
import { useState, useEffect } from 'react';
import { useSupa } from '@supanovaapp/sdk';
import type { CantonIncomingTransferDto } from '@supanovaapp/sdk';

function IncomingTransfersComponent() {
  const { canton } = useSupa();
  const [transfers, setTransfers] = useState<CantonIncomingTransferDto[]>([]);
  const [loading, setLoading] = useState(false);

  // Загрузить трансферы при монтировании
  useEffect(() => {
    loadTransfers();
  }, []);

  const loadTransfers = async () => {
    setLoading(true);
    try {
      const data = await canton.getPendingIncomingTransfers();
      setTransfers(data);
    } catch (error) {
      console.error('Failed to load transfers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (contractId: string, accept: boolean) => {
    try {
      await canton.respondToIncomingTransfer(contractId, accept);
      // Перезагрузить список после ответа
      await loadTransfers();
    } catch (error) {
      console.error('Failed to respond to transfer:', error);
    }
  };

  return (
    <div>
      <h2>Входящие трансферы</h2>
      <button onClick={loadTransfers} disabled={loading}>
        {loading ? 'Загрузка...' : 'Обновить'}
      </button>

      {transfers.length === 0 ? (
        <p>Нет ожидающих трансферов</p>
      ) : (
        transfers.map((transfer) => (
          <div key={transfer.contractId}>
            <p>От: {transfer.sender}</p>
            <p>Сумма: {transfer.amount} {transfer.instrument.id}</p>
            <p>Запрошено: {new Date(transfer.requestedAt).toLocaleString()}</p>
            <button onClick={() => handleResponse(transfer.contractId, true)}>
              Принять
            </button>
            <button onClick={() => handleResponse(transfer.contractId, false)}>
              Отклонить
            </button>
          </div>
        ))
      )}
    </div>
  );
}
```

## Комплексный пример: Dashboard с историей

```typescript
import { useState, useEffect } from 'react';
import { useSupa } from '@supanovaapp/sdk';
import type { 
  CantonTransactionDto, 
  CantonPriceCandleDto,
  CantonIncomingTransferDto 
} from '@supanovaapp/sdk';

function CantonDashboard() {
  const { canton } = useSupa();
  const [transactions, setTransactions] = useState<CantonTransactionDto[]>([]);
  const [priceData, setPriceData] = useState<CantonPriceCandleDto[]>([]);
  const [incomingTransfers, setIncomingTransfers] = useState<CantonIncomingTransferDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (canton.isRegistered) {
      loadAllData();
    }
  }, [canton.isRegistered]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // Загрузить все данные параллельно
      const [txData, priceData, transfersData] = await Promise.all([
        canton.getTransactions({ limit: 50 }),
        canton.getPriceHistory('1d'),
        canton.getPendingIncomingTransfers(),
      ]);

      setTransactions(txData);
      setPriceData(priceData);
      setIncomingTransfers(transfersData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Рассчитать статистику
  const stats = {
    totalTransactions: transactions.length,
    totalIncoming: transactions.filter(tx => tx.balanceChange > 0).length,
    totalOutgoing: transactions.filter(tx => tx.balanceChange < 0).length,
    currentPrice: priceData.length > 0 ? parseFloat(priceData[priceData.length - 1].close) : 0,
    pendingTransfers: incomingTransfers.length,
  };

  return (
    <div>
      <h1>Canton Dashboard</h1>
      
      {loading ? (
        <p>Загрузка...</p>
      ) : (
        <>
          <div>
            <h2>Статистика</h2>
            <p>Всего транзакций: {stats.totalTransactions}</p>
            <p>Входящих: {stats.totalIncoming}</p>
            <p>Исходящих: {stats.totalOutgoing}</p>
            <p>Текущая цена: ${stats.currentPrice.toFixed(4)}</p>
            <p>Ожидающих трансферов: {stats.pendingTransfers}</p>
          </div>

          <div>
            <h2>Последние транзакции</h2>
            {transactions.slice(0, 10).map((tx) => (
              <div key={tx.updateId}>
                <p>{tx.typeLabel}: {tx.balanceChange >= 0 ? '+' : ''}{tx.balanceChange.toFixed(4)} CC</p>
                <p>{new Date(tx.date).toLocaleString()}</p>
              </div>
            ))}
          </div>

          {incomingTransfers.length > 0 && (
            <div>
              <h2>Ожидающие трансферы</h2>
              {incomingTransfers.map((transfer) => (
                <div key={transfer.contractId}>
                  <p>От: {transfer.sender.slice(0, 20)}...</p>
                  <p>Сумма: {transfer.amount} {transfer.instrument.id}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

## Работа с сервисом напрямую (Advanced)

Если вам нужен прямой доступ к Canton сервису:

```typescript
import { getCantonService } from '@supanovaapp/sdk';

// Получить экземпляр сервиса
const cantonService = getCantonService();

// Использовать методы напрямую
const transactions = await cantonService.getTransactions({ limit: 100 });
const prices = await cantonService.getPriceHistory('1w');
const transfers = await cantonService.getPendingIncomingTransfers();

// Подготовить ответ на трансфер (без автоподписи)
const prepareResponse = await cantonService.prepareResponseToIncomingTransfer({
  contractId: 'contract-id-here',
  accept: true
});
```

## Примечания

- Все методы требуют, чтобы пользователь был зарегистрирован в Canton (`canton.isRegistered === true`)
- Методы `respondToIncomingTransfer` автоматически запрашивают подпись у пользователя через модальное окно
- История транзакций поддерживает пагинацию через параметр `beforeOffsetExclusive`
- Данные о ценах поступают из Bybit и могут иметь задержку

## Демо компоненты

В папке `demo/src/components/` вы найдете полностью рабочие примеры:

- `IncomingTransfers.tsx` - Работа с входящими трансферами
- `TransactionHistory.tsx` - История транзакций с пагинацией
- `PriceHistory.tsx` - График истории цен

Эти компоненты можно использовать как референс для вашей имплементации.
