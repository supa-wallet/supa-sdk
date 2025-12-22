/**
 * Supa Provider
 * Main provider component that wraps Privy and provides SDK context
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { PrivyProvider, PrivyClientConfig } from '@privy-io/react-auth';
import { Buffer } from 'buffer';
import { createApiClient, ApiClient } from '../core/client';
import { CantonService } from '../services/cantonService';
import { ApiService } from '../services/apiService';

// Initialize Buffer polyfill for browser (required by Privy SDK)
if (typeof window !== 'undefined' && !(window as any).Buffer) {
  (window as any).Buffer = Buffer;
  console.log('[Supa SDK] ✅ Buffer polyfill initialized');
}

export interface SupaConfig {
  /** Privy App ID (required) */
  privyAppId: string;
  /** Privy Client ID (optional) */
  privyClientId?: string;
  /** Backend API base URL (optional, defaults to env var or staging) */
  apiBaseUrl?: string;
  /** Privy appearance config */
  appearance?: {
    theme?: 'light' | 'dark';
    accentColor?: string;
    logo?: string;
  };
  /** Login methods to enable */
  loginMethods?: Array<'email' | 'wallet' | 'google' | 'twitter' | 'discord' | 'github' | 'linkedin'>;
}

export interface SupaContextValue {
  apiClient: ApiClient;
  cantonService: CantonService;
  apiService: ApiService;
  config: SupaConfig;
}

const SupaContext = createContext<SupaContextValue | null>(null);

export interface SupaProviderProps {
  config: SupaConfig;
  children: ReactNode;
}

export function SupaProvider({ config, children }: SupaProviderProps) {
  const [contextValue, setContextValue] = useState<SupaContextValue | null>(null);

  useEffect(() => {
    // Create API client
    const apiClient = createApiClient({
      baseURL: config.apiBaseUrl,
    });

    // Create services
    const cantonService = new CantonService(apiClient);
    const apiService = new ApiService(apiClient);

    setContextValue({
      apiClient,
      cantonService,
      apiService,
      config,
    });
  }, [config]);

  if (!contextValue) {
    return null;
  }

  // Privy configuration
  const privyConfig: PrivyClientConfig = {
    embeddedWallets: {
      showWalletUIs: true,
    },
    appearance: {
      theme: config.appearance?.theme || 'light',
      accentColor: config.appearance?.accentColor ? `#${config.appearance.accentColor.replace('#', '')}` as `#${string}` : undefined,
      logo: config.appearance?.logo,
    },
    loginMethods: config.loginMethods || ['email', 'wallet'],
  };

  return (
    <PrivyProvider
      appId={config.privyAppId}
      clientId={config.privyClientId}
      config={privyConfig}
    >
      <SupaContext.Provider value={contextValue}>
        {children}
      </SupaContext.Provider>
    </PrivyProvider>
  );
}

/**
 * Hook to access Supa context
 * @internal Use specific hooks like useAuth, useCanton, useAPI instead
 */
export function useSupaContext(): SupaContextValue {
  const context = useContext(SupaContext);
  
  if (!context) {
    throw new Error('useSupaContext must be used within SupaProvider');
  }
  
  return context;
}

