# Запуск Demo приложения

## Быстрый старт

```bash
cd /Users/molodcovdanila/Documents/webdev/supa-sdk/demo
npm run dev
```

Приложение будет доступно на `http://localhost:6969`

## Важно

- Dev сервер работает без проблем (Vite HMR)
- Build может иметь проблемы с optional peer dependencies от Privy SDK
- Для продакшена рекомендуется использовать собранный SDK из npm

## Что тестировать

1. **Login** - войти через Privy
2. **Create Stellar Wallet** - если нет
3. **Register Canton** - зарегистрировать Canton кошелёк 
4. **Tap Devnet** - получить 1000 тестовых токенов
5. **Get Balance** - проверить баланс
6. **Get User Info** - информация о пользователе

## Troubleshooting

### Демо не запускается

1. Убедитесь что SDK собран:
```bash
cd ..
npm run build
cd demo
```

2. Переустановите зависимости:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Privy не открывается

Проверьте `.env` файл в корне проекта (`/supa-sdk/.env`):
- VITE_PRIVY_APP_ID должен быть заполнен
- VITE_PRIVY_CLIENT_ID должен быть заполнен




