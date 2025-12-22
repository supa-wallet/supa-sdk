# Supa SDK Documentation

Welcome to Supa SDK documentation!

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
- **npm Package**: [@supa/sdk](https://npmjs.com/package/@supa/sdk)
- **Main README**: [../README.md](../README.md)
- **Demo Application**: [../demo](../demo)

## 📦 Installation

```bash
npm install @supa/sdk
```

## 💡 Quick Example

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
