/**
 * useAuth Hook
 * Provides authentication methods and user state from Privy
 */

import { usePrivy, useLogin, useLogout } from '@privy-io/react-auth';
import { useEffect } from 'react';
import { useWalletinoContext } from '../providers/WalletinoProvider';
import type { User as PrivyUser } from '@privy-io/react-auth';

export interface UseAuthReturn {
  /** Login user with Privy */
  login: () => void;
  
  /** Logout user */
  logout: () => Promise<void>;
  
  /** Whether user is authenticated */
  authenticated: boolean;
  
  /** Whether authentication is loading */
  loading: boolean;
  
  /** Privy user object */
  user: PrivyUser | null;
  
  /** Get Privy access token for API calls */
  getAccessToken: () => Promise<string | null>;
  
  /** Whether user is ready (authenticated and not loading) */
  ready: boolean;
}

/**
 * Hook for authentication operations
 */
export function useAuth(): UseAuthReturn {
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
}

