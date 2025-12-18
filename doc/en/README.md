# Walletino SDK - English Documentation

Complete documentation for Walletino SDK in English.

## 📚 Documentation Contents

### Getting Started
**[→ Getting Started Guide](./getting-started.md)**

Step-by-step guide to integrate Walletino SDK into your project:
- Prerequisites and installation
- Environment setup
- Provider configuration
- First component creation
- Common issues and solutions

### API Reference
**[→ API Reference](./api-reference.md)**

Complete API documentation:
- `useAuth` - Authentication hook
- `useCanton` - Canton Network operations
- `useAPI` - Backend API access
- `useWalletino` - Main SDK hook
- Utility functions
- TypeScript types

### Canton Network Integration
**[→ Canton Integration Guide](./canton-integration.md)**

Deep dive into Canton Network:
- What is Canton Network
- Why Stellar is used for Ed25519
- Public key conversion process
- Registration flow explained
- Transaction signing
- Devnet faucet usage
- Advanced usage patterns
- Troubleshooting

### Usage Examples
**[→ Examples](./examples.md)**

Real-world usage examples:
- Authentication patterns
- Canton Network workflows
- API integration examples
- UI components
- Framework integrations (Next.js, Redux)

### JSDoc Standards
**[→ JSDoc Examples](./jsdoc-examples.md)**

Documentation standards for contributors:
- Function documentation format
- Hook documentation format
- Type documentation
- Best practices
- Good and bad examples

## 🚀 Quick Start

```bash
npm install @walletino/sdk
```

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
  const { registerCanton, isRegistered } = useCanton();

  if (!authenticated) {
    return <button onClick={login}>Login</button>;
  }

  if (!isRegistered) {
    return <button onClick={registerCanton}>Register Canton</button>;
  }

  return <div>Ready to use Canton Network!</div>;
}
```

## 📖 Recommended Reading Order

### For New Users
1. [Getting Started](./getting-started.md) - Start here
2. [API Reference](./api-reference.md) - Learn available methods
3. [Examples](./examples.md) - See real-world usage
4. [Canton Integration](./canton-integration.md) - If using Canton

### For Experienced Developers
1. [API Reference](./api-reference.md) - Quick API overview
2. [Canton Integration](./canton-integration.md) - Canton specifics
3. [Examples](./examples.md) - Advanced patterns

### For Contributors
1. [JSDoc Standards](./jsdoc-examples.md) - Documentation format
2. [API Reference](./api-reference.md) - Existing patterns
3. Source code with JSDoc comments

## 🔗 External Resources

- **Privy Documentation**: https://docs.privy.io
- **Canton Network**: https://canton.network
- **Backend API**: https://stage_api.walletino.fyi/api
- **TypeScript**: https://www.typescriptlang.org/docs/

## 📞 Support

- **GitHub Issues**: Report bugs and request features
- **GitHub Discussions**: Ask questions and share ideas
- **Documentation Issues**: Report unclear or outdated docs

## 🌍 Other Languages

- **Русский**: [../ru/README.md](../ru/README.md)

---

**Version**: 0.1.0  
**Last Updated**: December 2025  
**Language**: English  
**Status**: Production Ready ✅

