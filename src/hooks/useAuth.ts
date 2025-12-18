/**
 * Authentication hook using Privy
 * Provides user authentication methods, state, and JWT token access
 */

import { usePrivy, useLogin, useLogout } from '@privy-io/react-auth';
import { useEffect } from 'react';
import { useWalletinoContext } from '../providers/WalletinoProvider';
import type { User as PrivyUser } from '@privy-io/react-auth';

/**
 * Return type for useAuth hook
 */
export interface UseAuthReturn {
  /** Opens Privy login modal */
  login: () => void;
  
  /** Logs out the current user */
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
  const { apiClient } = useWalletinoContext();
  const { login: privyLogin } = useLogin();
  const { logout: privyLogout } = useLogout();
  const { authenticated, ready, user, getAccessToken } = usePrivy();

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

  return {
    login,
    logout,
    authenticated,
    loading: !ready,
    user,
    getAccessToken,
    ready,
  };
};

