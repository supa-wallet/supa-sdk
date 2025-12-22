/**
 * Main Supa SDK hook
 * Provides unified access to all SDK functionality
 */

import { useAuth, UseAuthReturn } from './useAuth';
import { useCanton, UseCantonReturn } from './useCanton';
import { useAPI, UseAPIReturn } from './useAPI';

/**
 * Return type for useSupa hook
 */
export interface UseSupaReturn {
  /** Authentication methods and user state */
  auth: UseAuthReturn;
  
  /** Canton Network operations and wallet management */
  canton: UseCantonReturn;
  
  /** Backend API methods for data access */
  api: UseAPIReturn;
  
  /** Automated onboarding flow (login → create wallet → register Canton) */
  onboard: () => Promise<void>;
}

/**
 * Main hook for accessing all Supa SDK features
 * Combines authentication, Canton Network, and API functionality
 * 
 * @returns Combined SDK functionality with convenience methods
 * 
 * @example
 * Basic usage
 * ```tsx
 * function Dashboard() {
 *   const { auth, canton, api } = useSupa();
 * 
 *   if (!auth.authenticated) {
 *     return <button onClick={auth.login}>Login</button>;
 *   }
 * 
 *   return (
 *     <div>
 *       <p>User: {auth.user?.email?.address}</p>
 *       <button onClick={() => canton.registerCanton()}>
 *         Register Canton
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 * 
 * @example
 * Using automated onboarding
 * ```tsx
 * function OnboardButton() {
 *   const { onboard, canton } = useSupa();
 * 
 *   return (
 *     <button onClick={onboard}>
 *       {canton.isRegistered ? 'Already registered' : 'Get Started'}
 *     </button>
 *   );
 * }
 * ```
 */
export const useSupa = (): UseSupaReturn => {
  const auth = useAuth();
  const canton = useCanton();
  const api = useAPI();

  /**
   * Automated onboarding flow
   * Steps:
   * 1. Login with Privy (if not authenticated)
   * 2. Create Stellar wallet (if needed)
   * 3. Register Canton wallet
   * 
   * Note: If user is not authenticated, only opens login modal
   * Call again after authentication to continue onboarding
   */
  const onboard = async () => {
    // Step 1: Login if not authenticated
    if (!auth.authenticated) {
      auth.login();
      // Login happens in modal, returns immediately
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
};

