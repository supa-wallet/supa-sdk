/**
 * useCanton Hook
 * Provides Canton Network operations including registration, tap, and signing
 */

import { useState, useCallback, useEffect } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { useCreateWallet } from '@privy-io/react-auth/extended-chains';
import { useSupaContext } from '../providers/SupaProvider';
import { useAuth } from './useAuth';
import { useSignRawHashWithModal } from './useSignRawHashWithModal';
import { useStellarWallet } from './useStellarWallet';
import { getStellarWallets, getPublicKeyBase64, StellarWallet } from '../utils/stellar';
import { base64ToHex, hexToBase64 } from '../utils/converters';
import type {
  CantonMeResponseDto,
  CantonActiveContractsResponseDto,
  CantonQueryCompletionResponseDto,
} from '../core/types';
import type { CantonSubmitPreparedOptions } from '../services/cantonService';

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
  
  /** Canton user info (partyId and email) */
  cantonUser: CantonMeResponseDto | null;
  
  /** Get Canton user info */
  getMe: () => Promise<CantonMeResponseDto>;
  
  /** Get active contracts with optional filtering */
  getActiveContracts: (templateIds?: string[]) => Promise<CantonActiveContractsResponseDto>;
  
  /** Tap devnet faucet */
  tapDevnet: (amount: string, options?: CantonSubmitPreparedOptions) => Promise<CantonQueryCompletionResponseDto>;
  
  /** Sign hash with Stellar wallet */
  signHash: (hashBase64: string) => Promise<string>;
  
  /** Sign text message */
  signMessage: (message: string) => Promise<string>;
  
  /** Prepare and submit transaction with polling for completion */
  sendTransaction: (
    commandId: unknown,
    disclosedContracts?: unknown,
    options?: CantonSubmitPreparedOptions
  ) => Promise<CantonQueryCompletionResponseDto>;
  
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
  const { cantonService } = useSupaContext();
  const { user, authenticated } = useAuth();
  const { wallets } = useWallets();
  const { signRawHashWithModal } = useSignRawHashWithModal();
  const { createWallet } = useCreateWallet();
  const { stellarWallet, stellarWallets } = useStellarWallet();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [cantonUser, setCantonUser] = useState<CantonMeResponseDto | null>(null);

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

      // Sign with modal confirmation
      const result = await signRawHashWithModal(
        {
          address: stellarWallet.address,
          chainType: 'stellar',
          hash: hashHex as `0x${string}`,
        },
        {
          title: 'Sign Hash',
          description: 'You are about to sign the following hash.',
          confirmText: 'Sign',
          rejectText: 'Reject',
          infoText: 'This operation requires your signature to proceed.',
          displayHash: `Hash: ${hashBase64}`,
        }
      );

      if (!result) {
        throw new Error('User rejected signature');
      }

      // Convert signature back to base64 for Canton
      return hexToBase64(result.signature);
    } catch (err: any) {
      throw new Error(`Failed to sign hash: ${err.message}`);
    }
  }, [stellarWallet, signRawHashWithModal]);

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

      // Create sign function that uses modal wrapper
      const signFunction = async (hashHex: string): Promise<string> => {
        const result = await signRawHashWithModal(
          {
            address: wallet!.address,
            chainType: 'stellar',
            hash: hashHex as `0x${string}`,
          },
          {
            title: 'Register Canton Wallet',
            description: 'Sign to register your wallet with Canton Network.',
            confirmText: 'Sign & Register',
            rejectText: 'Cancel',
            infoText: 'This signature is required to register your wallet with Canton Network. No tokens will be spent.',
            displayHash: 'Canton Wallet Registration',
          }
        );
        
        if (!result) {
          throw new Error('User rejected signature');
        }
        
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
  }, [stellarWallet, createStellarWallet, user, wallets, signRawHashWithModal, cantonService]);

  const tapDevnet = useCallback(async (
    amount: string,
    options?: CantonSubmitPreparedOptions
  ): Promise<CantonQueryCompletionResponseDto> => {
    if (!stellarWallet) {
      throw new Error('No Stellar wallet found');
    }

    setLoading(true);
    setError(null);

    try {
      // Create sign function with automatic modal
      const signFunction = async (hashHex: string): Promise<string> => {
        const result = await signRawHashWithModal(
          {
            address: stellarWallet.address,
            chainType: 'stellar',
            hash: hashHex as `0x${string}`,
          },
          {
            title: 'Tap Devnet Faucet',
            description: `You are requesting ${amount} tokens from the devnet faucet.`,
            confirmText: 'Confirm & Sign',
            rejectText: 'Cancel',
            infoText: 'This will submit a transaction to receive test tokens from the Canton Network devnet faucet.',
            displayHash: `Request ${amount} Canton tokens from devnet faucet`,
          }
        );
        
        if (!result) {
          throw new Error('User rejected signature');
        }
        
        return result.signature;
      };

      // Tap devnet with polling
      return await cantonService.tapDevnet({ amount, signFunction }, options);
    } catch (err: any) {
      const error = new Error(`Failed to tap devnet: ${err.message}`);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [stellarWallet, signRawHashWithModal, cantonService]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getMe = useCallback(async (): Promise<CantonMeResponseDto> => {
    const user = await cantonService.getMe();
    setCantonUser(user);
    return user;
  }, [cantonService]);

  const getActiveContracts = useCallback(async (templateIds?: string[]): Promise<CantonActiveContractsResponseDto> => {
    return await cantonService.getActiveContracts(templateIds);
  }, [cantonService]);

  const signMessage = useCallback(async (message: string): Promise<string> => {
    if (!stellarWallet) {
      throw new Error('No Stellar wallet found');
    }

    setLoading(true);
    setError(null);

    try {
      const signFunction = async (hashHex: string): Promise<string> => {
        const result = await signRawHashWithModal(
          {
            address: stellarWallet.address,
            chainType: 'stellar',
            hash: hashHex as `0x${string}`,
          },
          {
            title: 'Sign Message',
            description: 'You are about to sign the following message:',
            confirmText: 'Sign',
            rejectText: 'Reject',
            infoText: 'Signing a message proves ownership of your wallet without exposing private keys.',
            displayHash: message,
          }
        );
        
        if (!result) {
          throw new Error('User rejected signature');
        }
        
        return result.signature;
      };

      return await cantonService.signMessage(message, signFunction);
    } catch (err: any) {
      const error = new Error(`Failed to sign message: ${err.message}`);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [stellarWallet, signRawHashWithModal, cantonService]);

  const sendTransaction = useCallback(async (
    commandId: unknown,
    disclosedContracts?: unknown,
    options?: CantonSubmitPreparedOptions
  ): Promise<CantonQueryCompletionResponseDto> => {
    if (!stellarWallet) {
      throw new Error('No Stellar wallet found');
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Prepare transaction
      const prepareResponse = await cantonService.prepareTransaction(
        commandId,
        disclosedContracts
      );

      // Step 2: Sign hash with automatic modal
      const hashHex = base64ToHex(prepareResponse.hash);

      const signResult = await signRawHashWithModal(
        {
          address: stellarWallet.address,
          chainType: 'stellar',
          hash: hashHex as `0x${string}`,
        },
        {
          title: 'Sign Transaction',
          description: 'Review and sign the following transaction.',
          confirmText: 'Sign & Send',
          rejectText: 'Reject',
          infoText: 'This transaction will be submitted to the blockchain. Make sure you understand what you are signing.',
          displayHash: `Transaction Hash: ${prepareResponse.hash}`,
        }
      );

      if (!signResult) {
        throw new Error('User rejected transaction');
      }

      // Step 3: Submit signed transaction and wait for completion
      const signatureBase64 = hexToBase64(signResult.signature);
      return await cantonService.submitPreparedAndWait(
        prepareResponse.hash,
        signatureBase64,
        options
      );
    } catch (err: any) {
      const error = new Error(`Failed to send transaction: ${err.message}`);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [stellarWallet, signRawHashWithModal, cantonService]);

  return {
    stellarWallet,
    stellarWallets,
    createStellarWallet,
    registerCanton,
    isRegistered,
    cantonUser,
    getMe,
    getActiveContracts,
    tapDevnet,
    signHash,
    signMessage,
    sendTransaction,
    loading,
    error,
    clearError,
  };
}

