/**
 * Hook to access Canton wallet info based on withExport config
 */

import { useWallets } from '@privy-io/react-auth';
import { useWallets as useSolanaWallets } from '@privy-io/react-auth/solana';
import { useAuth } from './useAuth';
import { useSupaContext } from '../providers/SupaProvider';
import { getCantonWallets, type CantonWallet } from '../utils/wallet';

export interface UseCantonWalletReturn {
  cantonWallets: CantonWallet[];
  cantonWallet: CantonWallet | null;
}

/** @deprecated Use useCantonWallet instead */
export type UseStellarWalletReturn = UseCantonWalletReturn;

export function useCantonWallet(): UseCantonWalletReturn {
  const { user, authenticated } = useAuth();
  const { wallets } = useWallets();
  const { wallets: solanaWallets } = useSolanaWallets();
  const { config } = useSupaContext();

  const chainType = config.withExport ? 'solana' : 'stellar';

  let cantonWallets: CantonWallet[] = [];

  if (authenticated) {
    if (config.withExport) {
      // Solana wallets from useSolanaWallets have private fields, so we need to explicitly extract properties
      if (solanaWallets && solanaWallets.length > 0) {
        cantonWallets = solanaWallets.map(w => ({
          address: w.address,
          chainType: 'solana' as const,
          walletClientType: 'privy',
        })) as CantonWallet[];
        console.log('[useCantonWallet] mapped wallets:', cantonWallets);
      }
    } else {
      cantonWallets = getCantonWallets(user, wallets, chainType);
    }
  }

  const cantonWallet = cantonWallets[0] || null;

  return {
    cantonWallets,
    cantonWallet,
  };
}

/** @deprecated Use useCantonWallet instead */
export const useStellarWallet = useCantonWallet;
