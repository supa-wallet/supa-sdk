/**
 * Hook to access Canton wallet info based on withExport config
 */

import { useWallets } from '@privy-io/react-auth';
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
  const { config } = useSupaContext();

  const chainType = config.withExport ? 'solana' : 'stellar';
  const cantonWallets = authenticated ? getCantonWallets(user, wallets, chainType) : [];
  const cantonWallet = cantonWallets[0] || null;

  return {
    cantonWallets,
    cantonWallet,
  };
}

/** @deprecated Use useCantonWallet instead */
export const useStellarWallet = useCantonWallet;
