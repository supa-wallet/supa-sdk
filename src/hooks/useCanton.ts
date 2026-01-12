/**
 * useCanton Hook
 * Provides Canton Network operations including registration, tap, and signing
 * 
 * This hook is a simple wrapper around CantonContext.
 * All state and logic is centralized in CantonProvider to prevent
 * duplicate operations across multiple hook instances.
 */

import { useCantonContext, type CantonContextValue } from '../providers/CantonProvider';

// Re-export types for external use
export type { CantonContextValue as UseCantonReturn };

/**
 * Hook for Canton Network operations
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isRegistered, registerCanton, sendCantonCoin } = useCanton();
 *   
 *   if (!isRegistered) {
 *     return <button onClick={registerCanton}>Register</button>;
 *   }
 *   
 *   return <button onClick={() => sendCantonCoin(partyId, "10")}>Send</button>;
 * }
 * ```
 */
export function useCanton(): CantonContextValue {
  return useCantonContext();
}
