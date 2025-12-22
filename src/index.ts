/**
 * Supa SDK
 * 
 * React SDK for seamless integration with Supa Backend API and Privy.io authentication,
 * featuring full Canton Network support with Ed25519 signing via Stellar wallets.
 * 
 * @packageDocumentation
 * 
 * @example
 * Basic setup
 * ```tsx
 * import { SupaProvider, useAuth, useCanton } from '@supa/sdk';
 * 
 * function App() {
 *   return (
 *     <SupaProvider config={{ privyAppId: 'your_app_id' }}>
 *       <Dashboard />
 *     </SupaProvider>
 *   );
 * }
 * 
 * function Dashboard() {
 *   const { login, authenticated } = useAuth();
 *   const { registerCanton, isRegistered } = useCanton();
 * 
 *   if (!authenticated) {
 *     return <button onClick={login}>Login</button>;
 *   }
 * 
 *   if (!isRegistered) {
 *     return <button onClick={registerCanton}>Register Canton</button>;
 *   }
 * 
 *   return <div>Ready to use Canton Network!</div>;
 * }
 * ```
 * 
 * @see {@link https://github.com/your-repo/supa-sdk | GitHub Repository}
 * @see {@link https://docs.privy.io | Privy Documentation}
 * @see {@link https://canton.network | Canton Network}
 */

// ===== Core Provider =====
/**
 * Main provider component that wraps your application
 * @see {@link SupaProvider}
 */
export { SupaProvider, useSupaContext } from './providers/SupaProvider';
export type { SupaConfig, SupaContextValue, SupaProviderProps } from './providers/SupaProvider';

// ===== Main Hook =====
/**
 * Primary hook combining all SDK functionality
 * @see {@link useSupa}
 */
export { useSupa } from './hooks/useSupa';
export type { UseSupaReturn } from './hooks/useSupa';

// Legacy exports (deprecated, use useSupa instead)
export { useSupa as useWalletino } from './hooks/useSupa';
export type { UseSupaReturn as UseWalletinoReturn } from './hooks/useSupa';

// ===== Individual Hooks =====
/**
 * Authentication hook for Privy integration
 * @see {@link useAuth}
 */
export { useAuth } from './hooks/useAuth';
export type { UseAuthReturn } from './hooks/useAuth';

/**
 * Canton Network operations hook
 * @see {@link useCanton}
 */
export { useCanton } from './hooks/useCanton';
export type { UseCantonReturn } from './hooks/useCanton';

/**
 * Backend API access hook
 * @see {@link useAPI}
 */
export { useAPI } from './hooks/useAPI';
export type { UseAPIReturn } from './hooks/useAPI';

// ===== TypeScript Types =====
/**
 * All DTO types generated from Swagger specification
 * Includes types for User, Dialog, Message, Canton, Token, etc.
 */
export * from './core/types';

// ===== Utility Functions =====
/**
 * Format conversion utilities (hex ↔ base64)
 * Required for Canton Network integration
 * @see {@link hexToBase64}, {@link base64ToHex}, {@link privyPublicKeyToCantonBase64}
 */
export * from './utils/converters';

/**
 * Stellar wallet utilities for Canton Network
 * @see {@link getStellarWallets}, {@link getPublicKeyBase64}, {@link isStellarWallet}
 */
export * from './utils/stellar';

// ===== Advanced: Services =====
/**
 * Canton Network service for direct API access (advanced usage)
 * @see {@link CantonService}
 */
export { CantonService } from './services/cantonService';
export type { CantonRegisterParams, CantonTapParams } from './services/cantonService';

/**
 * Backend API service for direct access (advanced usage)
 * @see {@link ApiService}
 */
export { ApiService } from './services/apiService';

// ===== Advanced: HTTP Client =====
/**
 * HTTP client for custom API calls (advanced usage)
 * @see {@link ApiClient}, {@link createApiClient}
 */
export { ApiClient, createApiClient, getApiClient } from './core/client';
export type { ClientConfig } from './core/client';

