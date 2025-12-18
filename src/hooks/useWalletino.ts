/**
 * useWalletino Hook
 * Main hook that provides access to all SDK functionality
 */

import { useAuth, UseAuthReturn } from './useAuth';
import { useCanton, UseCantonReturn } from './useCanton';
import { useAPI, UseAPIReturn } from './useAPI';

export interface UseWalletinoReturn {
  /** Authentication methods */
  auth: UseAuthReturn;
  
  /** Canton Network operations */
  canton: UseCantonReturn;
  
  /** Backend API methods */
  api: UseAPIReturn;
  
  /** Complete onboarding flow */
  onboard: () => Promise<void>;
}

/**
 * Main hook for Walletino SDK
 * Provides access to all SDK functionality
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { auth, canton, api } = useWalletino();
 *   
 *   const handleLogin = async () => {
 *     await auth.login();
 *     await canton.registerCanton();
 *   };
 *   
 *   return <button onClick={handleLogin}>Login & Register</button>;
 * }
 * ```
 */
export function useWalletino(): UseWalletinoReturn {
  const auth = useAuth();
  const canton = useCanton();
  const api = useAPI();

  /**
   * Complete onboarding flow:
   * 1. Login with Privy
   * 2. Create Stellar wallet if needed
   * 3. Register Canton wallet
   */
  const onboard = async () => {
    // Step 1: Login if not authenticated
    if (!auth.authenticated) {
      auth.login();
      // Wait for authentication to complete
      // Note: This returns immediately, actual login happens in modal
      return;
    }

    // Step 2 & 3: Register Canton (automatically creates Stellar wallet if needed)
    if (!canton.isRegistered) {
      await canton.registerCanton();
    }
  };

  return {
    auth,
    canton,
    api,
    onboard,
  };
}

