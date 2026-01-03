/**
 * Hook to access Stellar wallet info
 */

import { useWallets } from '@privy-io/react-auth';
import { useAuth } from './useAuth';
import { getStellarWallets, type StellarWallet } from '../utils/stellar';

export interface UseStellarWalletReturn {
  stellarWallets: StellarWallet[];
  stellarWallet: StellarWallet | null;
}

export function useStellarWallet(): UseStellarWalletReturn {
  const { user, authenticated } = useAuth();
  const { wallets } = useWallets();

  const stellarWallets = authenticated ? getStellarWallets(user, wallets) : [];
  const stellarWallet = stellarWallets[0] || null;

  return {
    stellarWallets,
    stellarWallet,
  };
}


