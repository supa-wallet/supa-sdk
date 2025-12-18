/**
 * useCanton Hook
 * Provides Canton Network operations including registration, tap, and signing
 */

import { useState, useCallback, useEffect } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { useSignRawHash, useCreateWallet } from '@privy-io/react-auth/extended-chains';
import { useWalletinoContext } from '../providers/WalletinoProvider';
import { useAuth } from './useAuth';
import { getStellarWallets, getPublicKeyBase64, StellarWallet } from '../utils/stellar';
import { base64ToHex, hexToBase64 } from '../utils/converters';
import type { CantonSubmitTransactionResponseDto } from '../core/types';

export interface UseCantonReturn {
  /** First Stellar wallet (primary) */
  stellarWallet: StellarWallet | null;
  
  /** All Stellar wallets */
  stellarWallets: StellarWallet[];
  
  /** Create new Stellar wallet */
  createStellarWallet: () => Promise<StellarWallet | null>;
  
  /** Register Canton wallet on backend */
  registerCanton: () => Promise<void>;
  
  /** Whether Canton wallet is registered */
  isRegistered: boolean;
  
  /** Tap devnet faucet */
  tapDevnet: (amount: string) => Promise<CantonSubmitTransactionResponseDto>;
  
  /** Sign hash with Stellar wallet */
  signHash: (hashBase64: string) => Promise<string>;
  
  /** Loading state */
  loading: boolean;
  
  /** Error state */
  error: Error | null;
  
  /** Clear error */
  clearError: () => void;
}

/**
 * Hook for Canton Network operations
 */
export function useCanton(): UseCantonReturn {
  const { cantonService } = useWalletinoContext();
  const { user, authenticated } = useAuth();
  const { wallets } = useWallets();
  const { signRawHash } = useSignRawHash();
  const { createWallet } = useCreateWallet();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  // Get Stellar wallets
  const stellarWallets = authenticated ? getStellarWallets(user, wallets) : [];
  const stellarWallet = stellarWallets[0] || null;

  // Check registration status on mount
  useEffect(() => {
    if (authenticated && stellarWallet) {
      checkRegistration();
    }
  }, [authenticated, stellarWallet]);

  const checkRegistration = async () => {
    try {
      const status = await cantonService.checkRegistrationStatus();
      setIsRegistered(status);
    } catch (err) {
      // Ignore errors in registration check
      setIsRegistered(false);
    }
  };

  const createStellarWallet = useCallback(async (): Promise<StellarWallet | null> => {
    if (!authenticated) {
      throw new Error('User must be authenticated to create wallet');
    }

    setLoading(true);
    setError(null);

    try {
      const result = await createWallet({ chainType: 'stellar' });
      
      if (result) {
        return result as unknown as StellarWallet;
      }
      return null;
    } catch (err: any) {
      const error = new Error(`Failed to create Stellar wallet: ${err.message}`);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [authenticated, createWallet]);

  const signHash = useCallback(async (hashBase64: string): Promise<string> => {
    if (!stellarWallet) {
      throw new Error('No Stellar wallet found');
    }

    try {
      // Convert base64 hash to hex for Privy
      const hashHex = base64ToHex(hashBase64);

      // Sign with Privy
      const result = await signRawHash({
        address: stellarWallet.address,
        chainType: 'stellar',
        hash: hashHex as `0x${string}`,
      });

      // Convert signature back to base64 for Canton
      return hexToBase64(result.signature);
    } catch (err: any) {
      throw new Error(`Failed to sign hash: ${err.message}`);
    }
  }, [stellarWallet, signRawHash]);

  const registerCanton = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Ensure Stellar wallet exists
      let wallet: StellarWallet | null = stellarWallet;
      
      if (!wallet) {
        const createdWallet = await createStellarWallet();
        
        if (createdWallet) {
          wallet = createdWallet;
        } else {
          // Wait a bit for React state to update and try again
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Try to get wallet from updated state
          const freshWallets = getStellarWallets(user, wallets);
          wallet = freshWallets[0] || null;
        }
        
        if (!wallet) {
          throw new Error('Failed to create Stellar wallet. Please try again.');
        }
      }

      // Get public key in base64
      const publicKey = getPublicKeyBase64(wallet);

      // Create sign function that uses Privy
      const signFunction = async (hashHex: string): Promise<string> => {
        const result = await signRawHash({
          address: wallet!.address,
          chainType: 'stellar',
          hash: hashHex as `0x${string}`,
        });
        
        return result.signature;
      };

      // Register Canton wallet
      await cantonService.registerCanton({
        publicKey,
        signFunction,
      });

      setIsRegistered(true);
    } catch (err: any) {
      const error = new Error(`Failed to register Canton wallet: ${err.message}`);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [stellarWallet, createStellarWallet, user, wallets, signRawHash, cantonService]);

  const tapDevnet = useCallback(async (amount: string): Promise<CantonSubmitTransactionResponseDto> => {
    if (!stellarWallet) {
      throw new Error('No Stellar wallet found');
    }

    setLoading(true);
    setError(null);

    try {
      // Create sign function
      const signFunction = async (hashHex: string): Promise<string> => {
        const result = await signRawHash({
          address: stellarWallet.address,
          chainType: 'stellar',
          hash: hashHex as `0x${string}`,
        });
        return result.signature;
      };

      // Tap devnet
      const result = await cantonService.tapDevnet({
        amount,
        signFunction,
      });

      return result;
    } catch (err: any) {
      const error = new Error(`Failed to tap devnet: ${err.message}`);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [stellarWallet, signRawHash, cantonService]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    stellarWallet,
    stellarWallets,
    createStellarWallet,
    registerCanton,
    isRegistered,
    tapDevnet,
    signHash,
    loading,
    error,
    clearError,
  };
}

