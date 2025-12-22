# Supa SDK - Русская документация

Полная документация Supa SDK на русском языке.

## 📚 Содержание документации

### Руководство по началу работы
**[→ Руководство по началу работы](./getting-started.md)**

Пошаговое руководство по интеграции Supa SDK в ваш проект:
- Предварительные требования и установка
- Настройка окружения
- Конфигурация провайдера
- Создание первого компонента
- Распространенные проблемы и решения

### API Reference
**[→ API Reference](./api-reference.md)**

Полная документация API:
- `useAuth` - Хук аутентификации
- `useCanton` - Операции Canton Network
- `useAPI` - Доступ к Backend API
- `useSupa` - Главный хук SDK
- Утилиты
- TypeScript типы

### Интеграция с Canton Network
**[→ Руководство по Canton](./canton-integration.md)**

Подробное руководство по Canton Network:
- Что такое Canton Network
- Почему используется Stellar для Ed25519
- Процесс конвертации публичных ключей
- Объяснение процесса регистрации
- Подпись транзакций
- Использование devnet faucet
- Продвинутые паттерны использования
- Решение проблем

### Примеры использования
**[→ Примеры](./examples.md)**

Примеры использования из реальной практики:
- Паттерны аутентификации
- Работа с Canton Network
- Примеры интеграции с API
- UI компоненты
- Интеграция с фреймворками (Next.js, Redux)

### Стандарты JSDoc
**[→ Примеры JSDoc](./jsdoc-examples.md)**

Стандарты документации для контрибьюторов:
- Формат документации функций
- Формат документации хуков
- Документация типов
- Лучшие практики
- Хорошие и плохие примеры

## 🚀 Быстрый старт

```bash
npm install @supa/sdk
```

```tsx
import { SupaProvider, useAuth, useCanton } from '@supa/sdk';

function App() {
  return (
    <SupaProvider config={{ privyAppId: 'your_app_id' }}>
      <Dashboard />
    </SupaProvider>
  );
}

function Dashboard() {
  const { login, authenticated } = useAuth();
  const { registerCanton, isRegistered } = useCanton();

  if (!authenticated) {
    return <button onClick={login}>Войти</button>;
  }

  if (!isRegistered) {
    return <button onClick={registerCanton}>Зарегистрировать Canton</button>;
  }

  return <div>Готово к использованию Canton Network!</div>;
}
```

## 📖 Рекомендуемый порядок чтения

### Для новых пользователей
1. [Руководство по началу работы](./getting-started.md) - Начните здесь
2. [API Reference](./api-reference.md) - Изучите доступные методы
3. [Примеры](./examples.md) - Посмотрите реальные примеры
4. [Интеграция Canton](./canton-integration.md) - Если используете Canton

### Для опытных разработчиков
1. [API Reference](./api-reference.md) - Быстрый обзор API
2. [Интеграция Canton](./canton-integration.md) - Особенности Canton
3. [Примеры](./examples.md) - Продвинутые паттерны

### Для контрибьюторов
1. [Стандарты JSDoc](./jsdoc-examples.md) - Формат документации
2. [API Reference](./api-reference.md) - Существующие паттерны
3. Исходный код с JSDoc комментариями

## 🔗 Внешние ресурсы

- **Документация Privy**: https://docs.privy.io
- **Canton Network**: https://canton.network
- **Backend API**: https://stage_api.supa.fyi/api
- **TypeScript**: https://www.typescriptlang.org/docs/

## 📞 Поддержка

- **GitHub Issues**: Сообщить об ошибке или запросить функцию
- **GitHub Discussions**: Задать вопрос или поделиться идеей
- **Проблемы с документацией**: Сообщить о неясной или устаревшей документации

## 🌍 Другие языки

- **English**: [../en/README.md](../en/README.md)

---

**Версия**: 0.1.0  
**Последнее обновление**: Декабрь 2025  
**Язык**: Русский  
**Статус**: Production Ready ✅
