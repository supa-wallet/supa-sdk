/**
 * Authentication hook using Privy
 * Provides user authentication methods, state, and JWT token access
 */

import { usePrivy, useLogin, useLogout } from '@privy-io/react-auth';
import { useExportWallet as useSolanaExportWallet } from '@privy-io/react-auth/solana';
import { useEffect, useCallback } from 'react';
import { useSupaContext } from '../providers/SupaProvider';
import type { User as PrivyUser } from '@privy-io/react-auth';

/**
 * Return type for useAuth hook
 */
export interface UseAuthReturn {
  /** Opens Privy login modal */
  login: () => void;

  /** Logs out the current user and clears all SDK state */
  logout: () => Promise<void>;

  /** Whether user is authenticated */
  authenticated: boolean;

  /** Whether authentication is in progress */
  loading: boolean;

  /** Privy user object containing linked accounts and profile data */
  user: PrivyUser | null;

  /** Gets Privy JWT access token for authenticated API calls */
  getAccessToken: () => Promise<string | null>;

  /** Whether SDK is ready (not loading) */
  ready: boolean;

  /** Export wallet private key (opens Privy modal). Address is optional - defaults to first wallet */
  exportWallet: (options?: { address?: string }) => Promise<void>;
}

/**
 * Hook for managing user authentication via Privy
 * Automatically configures API client with access token when user authenticates
 * 
 * @returns Authentication methods and user state
 * 
 * @example
 * ```tsx
 * function LoginButton() {
 *   const { login, logout, authenticated, user } = useAuth();
 * 
 *   if (!authenticated) {
 *     return <button onClick={login}>Login</button>;
 *   }
 * 
 *   return (
 *     <div>
 *       <p>Welcome, {user?.email?.address}!</p>
 *       <button onClick={logout}>Logout</button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useAuth = (): UseAuthReturn => {
  const { apiClient, config } = useSupaContext();
  const { login: privyLogin } = useLogin();
  const { logout: privyLogout } = useLogout();
  const { authenticated, ready, user, getAccessToken, exportWallet: privyExportWalletEVM } = usePrivy();
  const { exportWallet: privyExportWalletSolana } = useSolanaExportWallet();

  const withExport = config.withExport ?? false;

  // Set up access token getter for API client
  useEffect(() => {
    if (authenticated) {
      apiClient.setAccessTokenGetter(getAccessToken);
    }
  }, [authenticated, apiClient, getAccessToken]);

  const login = () => {
    privyLogin();
  };

  const logout = async () => {
    await privyLogout();
  };

  // Wrapped exportWallet that checks withExport flag and delegates to correct implementation
  const exportWallet = useCallback(async (options?: { address?: string }) => {
    if (!withExport) {
      throw new Error(
        'Wallet export is not enabled. Set withExport: true in SupaProvider config to enable wallet export functionality.'
      );
    }
    
    // Solana wallets (withExport: true)
    if (withExport) {
      // Privy's Solana exportWallet accepts optional address parameter
      // If address is provided, pass it; otherwise call without params to export first wallet
      if (options?.address) {
        return privyExportWalletSolana({ address: options.address });
      }
      // Call without parameters to export the first wallet by default
      return (privyExportWalletSolana as any)();
    } 
    
    // EVM/Stellar wallets (withExport: false)
    // Privy's EVM exportWallet accepts optional address or MouseEvent
    return privyExportWalletEVM(options as any);
  }, [withExport, privyExportWalletSolana, privyExportWalletEVM]);

  return {
    login,
    logout,
    authenticated,
    loading: !ready,
    user,
    getAccessToken,
    ready,
    exportWallet,
  };
};

