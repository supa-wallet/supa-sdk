/**
 * Walletino SDK
 * React SDK for Walletino Backend + Privy.io integration with Canton Network support
 * 
 * @packageDocumentation
 */

// Provider
export { WalletinoProvider, useWalletinoContext } from './providers/WalletinoProvider';
export type { WalletinoConfig, WalletinoContextValue, WalletinoProviderProps } from './providers/WalletinoProvider';

// Main Hook
export { useWalletino } from './hooks/useWalletino';
export type { UseWalletinoReturn } from './hooks/useWalletino';

// Individual Hooks
export { useAuth } from './hooks/useAuth';
export type { UseAuthReturn } from './hooks/useAuth';

export { useCanton } from './hooks/useCanton';
export type { UseCantonReturn } from './hooks/useCanton';

export { useAPI } from './hooks/useAPI';
export type { UseAPIReturn } from './hooks/useAPI';

// Types
export * from './core/types';

// Utilities (for advanced use cases)
export * from './utils/converters';
export * from './utils/stellar';

// Services (for advanced use cases)
export { CantonService } from './services/cantonService';
export type { CantonRegisterParams, CantonTapParams } from './services/cantonService';

export { ApiService } from './services/apiService';

// Client (for advanced use cases)
export { ApiClient, createApiClient, getApiClient } from './core/client';
export type { ClientConfig } from './core/client';

