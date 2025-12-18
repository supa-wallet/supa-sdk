# Walletino SDK Documentation

Welcome to Walletino SDK documentation!

Documentation is available in multiple languages:

## 📚 Available Languages

### 🇬🇧 English Documentation
**[→ English Documentation](./en/README.md)**

Complete SDK documentation in English:
- Getting Started Guide
- API Reference
- Canton Network Integration
- Usage Examples
- JSDoc Standards

### 🇷🇺 Русская документация
**[→ Русская документация](./ru/README.md)**

Полная документация SDK на русском языке:
- Руководство по началу работы
- API Reference
- Интеграция с Canton Network
- Примеры использования
- Стандарты JSDoc

---

## 🚀 Quick Links

- **GitHub Repository**: [github.com/your-repo](https://github.com/your-repo)
- **npm Package**: [@walletino/sdk](https://npmjs.com/package/@walletino/sdk)
- **Main README**: [../README.md](../README.md)
- **Demo Application**: [../demo](../demo)

## 📦 Installation

```bash
npm install @walletino/sdk
```

## 💡 Quick Example

```tsx
import { WalletinoProvider, useAuth, useCanton } from '@walletino/sdk';

function App() {
  return (
    <WalletinoProvider config={{ privyAppId: 'your_app_id' }}>
      <Dashboard />
    </WalletinoProvider>
  );
}

function Dashboard() {
  const { login, authenticated } = useAuth();
  const { registerCanton } = useCanton();

  if (!authenticated) {
    return <button onClick={login}>Login</button>;
  }

  return <button onClick={registerCanton}>Register Canton</button>;
}
```

---

**Version**: 0.1.0  
**Last Updated**: December 2025  
**License**: MIT
