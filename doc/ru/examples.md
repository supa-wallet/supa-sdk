# Примеры использования

Коллекция реальных примеров использования Walletino SDK для типичных задач.

## 📖 Содержание

- [Аутентификация](#аутентификация)
- [Canton Network](#canton-network)
- [Работа с API](#работа-с-api)
- [UI Компоненты](#ui-компоненты)
- [Интеграции](#интеграции)

---

## Аутентификация

### Базовая страница входа

```tsx
import { useAuth } from '@walletino/sdk';
import './LoginPage.css';

export function LoginPage() {
  const { login, loading } = useAuth();

  return (
    <div className="login-page">
      <div className="login-card">
        <img src="/logo.png" alt="Logo" className="logo" />
        <h1>Welcome to Walletino</h1>
        <p>Connect your wallet to get started</p>
        
        <button 
          onClick={login} 
          disabled={loading}
          className="login-button"
        >
          {loading ? 'Connecting...' : 'Connect Wallet'}
        </button>
        
        <p className="terms">
          By connecting, you agree to our{' '}
          <a href="/terms">Terms of Service</a>
        </p>
      </div>
    </div>
  );
}
```

### Защищённый роут (React Router)

```tsx
import { useAuth } from '@walletino/sdk';
import { Navigate, Outlet } from 'react-router-dom';

export function ProtectedRoute() {
  const { authenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

// В App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

### Профиль пользователя

```tsx
import { useAuth } from '@walletino/sdk';

export function UserProfile() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="profile">
      <div className="profile-header">
        <img 
          src={user.twitter?.profilePictureUrl || '/default-avatar.png'} 
          alt="Avatar"
          className="avatar"
        />
        <div>
          <h2>{user.twitter?.username || user.email?.address}</h2>
          <p className="user-id">ID: {user.id}</p>
        </div>
      </div>

      <div className="profile-info">
        <h3>Linked Accounts</h3>
        <ul>
          {user.email && (
            <li>📧 Email: {user.email.address}</li>
          )}
          {user.wallet && (
            <li>💼 Wallet: {user.wallet.address.slice(0, 10)}...</li>
          )}
          {user.google && (
            <li>🔍 Google: {user.google.email}</li>
          )}
          {user.twitter && (
            <li>🐦 Twitter: @{user.twitter.username}</li>
          )}
        </ul>
      </div>

      <button onClick={logout} className="logout-button">
        Logout
      </button>
    </div>
  );
}
```

---

## Canton Network

### Полный онбординг с прогрессом

```tsx
import { useAuth, useCanton, useAPI } from '@walletino/sdk';
import { useState, useEffect } from 'react';

type Step = 'login' | 'register' | 'tap' | 'complete';

export function OnboardingWizard() {
  const { login, authenticated } = useAuth();
  const { registerCanton, tapDevnet, isRegistered, loading, error } = useCanton();
  const api = useAPI();
  
  const [step, setStep] = useState<Step>('login');
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (authenticated && !isRegistered) {
      setStep('register');
    } else if (authenticated && isRegistered) {
      setStep('tap');
    }
  }, [authenticated, isRegistered]);

  const steps = [
    { id: 'login', label: 'Connect Wallet', icon: '🔐' },
    { id: 'register', label: 'Register Canton', icon: '📝' },
    { id: 'tap', label: 'Get Tokens', icon: '💰' },
    { id: 'complete', label: 'Complete', icon: '✅' },
  ];

  const handleRegister = async () => {
    try {
      await registerCanton();
      setStep('tap');
    } catch (err) {
      console.error(err);
    }
  };

  const handleTap = async () => {
    try {
      await tapDevnet('1000');
      const balanceData = await api.user.getBalance();
      setBalance(balanceData.totalUsdBalance);
      setStep('complete');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="onboarding-wizard">
      {/* Progress bar */}
      <div className="progress-bar">
        {steps.map((s, index) => (
          <div
            key={s.id}
            className={`step ${step === s.id ? 'active' : ''} ${
              steps.findIndex(st => st.id === step) > index ? 'completed' : ''
            }`}
          >
            <div className="step-icon">{s.icon}</div>
            <div className="step-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="wizard-content">
        {step === 'login' && (
          <>
            <h2>Welcome! Let's get started</h2>
            <p>Connect your wallet to continue</p>
            <button onClick={login}>Connect Wallet</button>
          </>
        )}

        {step === 'register' && (
          <>
            <h2>Register Canton Wallet</h2>
            <p>Create your Canton wallet to access the network</p>
            <button onClick={handleRegister} disabled={loading}>
              {loading ? 'Registering...' : 'Register Now'}
            </button>
          </>
        )}

        {step === 'tap' && (
          <>
            <h2>Get Test Tokens</h2>
            <p>Receive 1000 test tokens to get started</p>
            <button onClick={handleTap} disabled={loading}>
              {loading ? 'Processing...' : 'Get Tokens'}
            </button>
          </>
        )}

        {step === 'complete' && (
          <>
            <h2>🎉 All Set!</h2>
            <p>Your wallet is ready to use</p>
            {balance !== null && <p>Balance: ${balance.toFixed(2)}</p>}
            <button onClick={() => window.location.href = '/dashboard'}>
              Go to Dashboard
            </button>
          </>
        )}

        {error && <p className="error">{error.message}</p>}
      </div>
    </div>
  );
}
```

### Canton Dashboard

```tsx
import { useCanton, useAPI } from '@walletino/sdk';
import { useEffect, useState } from 'react';

export function CantonDashboard() {
  const { stellarWallet, tapDevnet, loading } = useCanton();
  const api = useAPI();
  const [balance, setBalance] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadBalance = async () => {
    setRefreshing(true);
    try {
      const data = await api.user.getBalance(true);
      setBalance(data);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBalance();
  }, []);

  const handleTap = async () => {
    await tapDevnet('1000');
    await loadBalance();
  };

  return (
    <div className="canton-dashboard">
      <div className="wallet-card">
        <h3>Your Canton Wallet</h3>
        <div className="wallet-address">
          <span>Address:</span>
          <code>{stellarWallet?.address}</code>
          <button onClick={() => navigator.clipboard.writeText(stellarWallet!.address)}>
            📋 Copy
          </button>
        </div>
      </div>

      <div className="balance-card">
        <h3>Balance</h3>
        {balance ? (
          <>
            <div className="total-balance">
              <span className="amount">${balance.totalUsdBalance.toFixed(2)}</span>
              <span className="label">Total USD</span>
            </div>
            <div className="tokens">
              {balance.balances.map((token: any) => (
                <div key={token.contractAddress} className="token-item">
                  <span>{token.symbol}</span>
                  <span>{token.tokenBalanceDecimal}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="loading">Loading balance...</div>
        )}
        <button onClick={loadBalance} disabled={refreshing}>
          {refreshing ? '⏳' : '🔄'} Refresh
        </button>
      </div>

      <div className="actions-card">
        <h3>Actions</h3>
        <button onClick={handleTap} disabled={loading} className="tap-button">
          💰 Get Test Tokens (Devnet)
        </button>
      </div>
    </div>
  );
}
```

---

## Работа с API

### AI Чат с диалогами

```tsx
import { useAPI } from '@walletino/sdk';
import { useState, useEffect } from 'react';

export function AIChat() {
  const api = useAPI();
  const [dialogs, setDialogs] = useState([]);
  const [activeDialog, setActiveDialog] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDialogs();
  }, []);

  const loadDialogs = async () => {
    const data = await api.dialogs.findAll({ page: 1, limit: 20 });
    setDialogs(data.data);
  };

  const createDialog = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    try {
      const dialog = await api.dialogs.create(input);
      setActiveDialog(dialog);
      setMessages(dialog.messages);
      setInput('');
      await loadDialogs();
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeDialog) return;
    
    setLoading(true);
    try {
      const message = await api.messages.create(activeDialog.id, input);
      setMessages(prev => [...prev, message]);
      setInput('');
    } finally {
      setLoading(false);
    }
  };

  const loadDialog = async (dialogId: number) => {
    const dialog = await api.dialogs.findOne(dialogId);
    setActiveDialog(dialog);
    
    const messagesData = await api.messages.findAll(dialogId, { page: 1, limit: 50 });
    setMessages(messagesData.data);
  };

  return (
    <div className="ai-chat">
      <div className="dialogs-sidebar">
        <h3>Dialogs</h3>
        <button onClick={createDialog} disabled={!input || loading}>
          + New Chat
        </button>
        <div className="dialogs-list">
          {dialogs.map((dialog: any) => (
            <div
              key={dialog.id}
              className={`dialog-item ${activeDialog?.id === dialog.id ? 'active' : ''}`}
              onClick={() => loadDialog(dialog.id)}
            >
              <div className="dialog-title">{dialog.name || `Dialog #${dialog.id}`}</div>
              <div className="dialog-date">{new Date(dialog.createdAt).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="chat-main">
        <div className="messages">
          {messages.map((msg: any) => (
            <div key={msg.id} className={`message ${msg.isUserMessage ? 'user' : 'ai'}`}>
              <div className="message-avatar">
                {msg.isUserMessage ? '👤' : '🤖'}
              </div>
              <div className="message-content">
                <div className="message-text">{msg.message}</div>
                <div className="message-time">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="input-area">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (activeDialog ? sendMessage() : createDialog())}
            placeholder={activeDialog ? "Type a message..." : "Start a new conversation..."}
            disabled={loading}
          />
          <button
            onClick={activeDialog ? sendMessage : createDialog}
            disabled={!input.trim() || loading}
          >
            {loading ? '⏳' : '📤'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Crypto Portfolio Tracker

```tsx
import { useAPI } from '@walletino/sdk';
import { useEffect, useState } from 'react';

export function PortfolioTracker() {
  const api = useAPI();
  const [balance, setBalance] = useState(null);
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [balanceData, pricesData] = await Promise.all([
        api.user.getBalance(),
        api.onchain.getTokenPrices(['BTC', 'ETH', 'USDT', 'SOL']),
      ]);
      
      setBalance(balanceData);
      setPrices(pricesData);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading portfolio...</div>;

  const totalValue = balance?.totalUsdBalance || 0;
  const change24h = 5.2; // Mock data, calculate based on price history

  return (
    <div className="portfolio">
      <div className="portfolio-header">
        <div className="total-value">
          <span className="label">Total Portfolio Value</span>
          <span className="amount">${totalValue.toFixed(2)}</span>
          <span className={`change ${change24h >= 0 ? 'positive' : 'negative'}`}>
            {change24h >= 0 ? '📈' : '📉'} {Math.abs(change24h).toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="assets-grid">
        <h3>Your Assets</h3>
        {balance?.balances.map((token: any) => (
          <div key={token.contractAddress} className="asset-card">
            <div className="asset-icon">
              {token.symbol === 'ETH' ? '⟠' : 
               token.symbol === 'BTC' ? '₿' : 
               token.symbol === 'USDT' ? '₮' : '🪙'}
            </div>
            <div className="asset-info">
              <div className="asset-name">{token.symbol}</div>
              <div className="asset-amount">{token.tokenBalanceDecimal}</div>
            </div>
            <div className="asset-value">
              ${(token.tokenBalanceDecimal * (token.usdPrice || 0)).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      <div className="market-prices">
        <h3>Market Prices</h3>
        {Object.entries(prices).map(([symbol, price]: [string, any]) => (
          <div key={symbol} className="price-item">
            <span className="symbol">{symbol}</span>
            <span className="price">${price.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## UI Компоненты

### Loading State Component

```tsx
import { useAuth, useCanton } from '@walletino/sdk';

export function LoadingGate({ children }: { children: React.ReactNode }) {
  const { loading: authLoading, ready } = useAuth();
  const { loading: cantonLoading } = useCanton();

  if (!ready || authLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Initializing...</p>
      </div>
    );
  }

  if (cantonLoading) {
    return (
      <div className="loading-overlay">
        <div className="loading-card">
          <div className="spinner" />
          <p>Processing Canton operation...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
```

### Error Boundary для SDK ошибок

```tsx
import { Component, ReactNode } from 'react';
import { useAuth } from '@walletino/sdk';

class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('SDK Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-screen">
          <h1>😕 Something went wrong</h1>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Использование
function App() {
  return (
    <ErrorBoundary>
      <WalletinoProvider config={{...}}>
        <YourApp />
      </WalletinoProvider>
    </ErrorBoundary>
  );
}
```

---

## Интеграции

### Next.js App Router

```tsx
// app/providers.tsx
'use client';

import { WalletinoProvider } from '@walletino/sdk';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WalletinoProvider
      config={{
        privyAppId: process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
        apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
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
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

// app/dashboard/page.tsx
'use client';

import { useAuth } from '@walletino/sdk';
import { redirect } from 'next/navigation';

export default function Dashboard() {
  const { authenticated, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!authenticated) redirect('/login');

  return <div>Dashboard Content</div>;
}
```

### Redux Integration

```tsx
// store/walletinoSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const registerCanton = createAsyncThunk(
  'walletino/registerCanton',
  async (_, { extra }) => {
    const { canton } = extra as any;
    await canton.registerCanton();
  }
);

const walletinoSlice = createSlice({
  name: 'walletino',
  initialState: {
    isRegistered: false,
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(registerCanton.pending, (state) => {
        state.loading = true;
      })
      .addCase(registerCanton.fulfilled, (state) => {
        state.isRegistered = true;
        state.loading = false;
      });
  },
});

// Использование
import { useDispatch } from 'react-redux';
import { registerCanton } from './store/walletinoSlice';
import { useCanton } from '@walletino/sdk';

function Component() {
  const dispatch = useDispatch();
  const canton = useCanton();

  return (
    <button onClick={() => dispatch(registerCanton())}>
      Register
    </button>
  );
}
```

---

**Больше примеров в `/demo` папке SDK!**

