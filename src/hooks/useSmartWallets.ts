/**
 * useSmartWallets Hook
 * Provides access to Privy Smart Wallets functionality
 */

import { useSmartWallets as usePrivySmartWallets } from '@privy-io/react-auth/smart-wallets';

export interface UseSmartWalletsReturn {
  /** Client for interacting with smart wallets */
  client: ReturnType<typeof usePrivySmartWallets>['client'];
  
  /** Get client for specific chain */
  getClientForChain: ReturnType<typeof usePrivySmartWallets>['getClientForChain'];
  
  /** Get user's smart wallet address */
  address: string | undefined;
  
  /** Whether smart wallets are ready to use */
  ready: boolean;
}

/**
 * Hook for using Privy Smart Wallets
 * Must be used within SmartWalletsProvider (automatically enabled in SupaProvider when smartWallets.enabled = true)
 */
export function useSmartWallets(): UseSmartWalletsReturn {
  const { client, getClientForChain } = usePrivySmartWallets();
  
  return {
    client,
    getClientForChain,
    address: client?.account?.address,
    ready: !!client,
  };
}

