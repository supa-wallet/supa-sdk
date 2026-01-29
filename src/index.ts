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
 * import { SupaProvider, useAuth, useCanton } from '@supanovaapp/sdk';
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
 * Includes built-in confirmation modals for signing operations
 * @see {@link SupaProvider}
 */
export { SupaProvider, useSupaContext } from './providers/SupaProvider';
export type { 
  SupaConfig, 
  SupaContextValue, 
  SupaProviderProps,
  ConfirmModalOptions,
  SignMessageModalOptions,
  SignTransactionOptions as SignTransactionModalOptions,
  ModalResult,
} from './providers/SupaProvider';

/**
 * Canton Provider for shared state (automatically included in SupaProvider)
 * @see {@link CantonProvider}
 */
export { CantonProvider, useCantonContext } from './providers/CantonProvider';
export type { CantonContextValue, CantonProviderProps, CantonSendCoinOptions } from './providers/CantonProvider';

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
 * Sign message hook with confirmation modal
 * @see {@link useSignMessage}
 */
export { useSignMessage } from './hooks/useSignMessage';
export type { UseSignMessageReturn, SignMessageOptions } from './hooks/useSignMessage';

/**
 * Send transaction hook with confirmation modal
 * @see {@link useSendTransaction}
 */
export { useSendTransaction } from './hooks/useSendTransaction';
export type { UseSendTransactionReturn, SendTransactionOptions } from './hooks/useSendTransaction';

/**
 * Send multiple transactions hook with a single confirmation modal
 * @see {@link useSendMultipleTransactions}
 */
export { useSendMultipleTransactions } from './hooks/useSendMultipleTransactions';
export type {
  UseSendMultipleTransactionsReturn,
  SendMultipleTransactionsOptions,
  TransactionToSend,
} from './hooks/useSendMultipleTransactions';

/**
 * @deprecated Use `useSendMultipleTransactions`
 * Backwards-compatible alias.
 */
export { useSendTransactions } from './hooks/useSendTransactions';
export type { UseSendTransactionsReturn, SendTransactionsOptions } from './hooks/useSendTransactions';

/**
 * Initialization transactions hook (prepare_initialization_transactions)
 * @see {@link useInitializationTransactions}
 */
export { useInitializationTransactions } from './hooks/useInitializationTransactions';
export type { UseInitializationTransactionsReturn } from './hooks/useInitializationTransactions';

/**
 * Sign raw hash with automatic confirmation modal
 * @see {@link useSignRawHashWithModal}
 */
export { useSignRawHashWithModal } from './hooks/useSignRawHashWithModal';
export type { UseSignRawHashWithModalReturn, SignRawHashModalOptions } from './hooks/useSignRawHashWithModal';

/**
 * Confirmation modal hook
 * @see {@link useConfirmModal}
 */
export { useConfirmModal } from './hooks/useConfirmModal';
export type { UseConfirmModalReturn } from './hooks/useConfirmModal';

/**
 * Canton wallet hook (works with Stellar or Solana based on withExport config)
 * @see {@link useCantonWallet}
 */
export { useCantonWallet, useStellarWallet } from './hooks/useCantonWallet';
export type { UseCantonWalletReturn, UseStellarWalletReturn } from './hooks/useCantonWallet';

/**
 * Smart Wallets hook (EVM)
 * @see {@link useSmartWallets}
 */
export { useSmartWallets } from './hooks/useSmartWallets';
export type { UseSmartWalletsReturn } from './hooks/useSmartWallets';

// ===== UI Components =====
/**
 * Confirmation modal components (for custom usage)
 * @see {@link ConfirmationModal}, {@link SignMessageModal}, {@link SignTransactionModal}
 */
export { ConfirmationModal, SignMessageModal, SignTransactionModal } from './components/ConfirmationModal';
export type { ConfirmationModalProps, SignMessageModalProps, SignTransactionModalProps } from './components/ConfirmationModal';

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
 * Canton wallet utilities
 * @see {@link getCantonWallets}, {@link getPublicKeyBase64}, {@link isCantonWallet}, {@link CantonWallet}
 */
export * from './utils/wallet';

// ===== Advanced: Services =====
/**
 * Canton Network service for direct API access (advanced usage)
 * @see {@link CantonService}
 */
export { CantonService, getCantonService } from './services/cantonService';
export type { CantonRegisterParams, CantonTapParams, CantonSubmitPreparedOptions } from './services/cantonService';

/**
 * Backend API service for direct access (advanced usage)
 * @see {@link ApiService}
 */
export { ApiService, getApiService } from './services/apiService';

// ===== Advanced: HTTP Client =====
/**
 * HTTP client for custom API calls (advanced usage)
 * @see {@link ApiClient}, {@link createApiClient}
 */
export { ApiClient, createApiClient, getApiClient } from './core/client';
export type { ClientConfig } from './core/client';

