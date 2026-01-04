/**
 * useCanton Hook
 * Provides Canton Network operations including registration, tap, and signing
 */

import { useState, useCallback, useEffect, useRef } from 'react';
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
  CantonWalletBalancesResponseDto,
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
  
  /** Canton user info (partyId, email, transferPreapprovalSet) */
  cantonUser: CantonMeResponseDto | null;
  
  /** Get Canton user info */
  getMe: () => Promise<CantonMeResponseDto>;
  
  /** Get active contracts with optional filtering */
  getActiveContracts: (templateIds?: string[]) => Promise<CantonActiveContractsResponseDto>;
  
  /** Canton wallet balances */
  cantonBalances: CantonWalletBalancesResponseDto | null;
  
  /** Get Canton wallet balances */
  getBalances: () => Promise<CantonWalletBalancesResponseDto>;
  
  /** Tap devnet faucet */
  tapDevnet: (amount: string, options?: CantonSubmitPreparedOptions) => Promise<CantonQueryCompletionResponseDto>;
  
  /** Sign hash with Stellar wallet */
  signHash: (hashBase64: string) => Promise<string>;
  
  /** Sign text message */
  signMessage: (message: string) => Promise<string>;
  
  /** Prepare and submit transaction with polling for completion */
  sendTransaction: (
    commands: unknown,
    disclosedContracts?: unknown,
    options?: CantonSubmitPreparedOptions
  ) => Promise<CantonQueryCompletionResponseDto>;
  
  /** Send Canton Coin (Amulet) to another party */
  sendCantonCoin: (
    receiverPartyId: string,
    amount: string,
    memo?: string,
    options?: CantonSubmitPreparedOptions
  ) => Promise<CantonQueryCompletionResponseDto>;
  
  /** Setup transfer preapproval (internal, called automatically) */
  setupTransferPreapproval: () => Promise<void>;
  
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
  const [cantonBalances, setCantonBalances] = useState<CantonWalletBalancesResponseDto | null>(null);
  
  // Flag to prevent multiple registration checks
  const hasCheckedRegistration = useRef(false);
  
  // Flag to track if getMe was auto-called
  const hasFetchedCantonUser = useRef(false);
  
  // Promise to prevent multiple transfer preapproval setups
  const preapprovalPromise = useRef<Promise<void> | null>(null);
  
  // Flag to track if preapproval was already attempted this session
  const preapprovalAttempted = useRef(false);
  
  // Promise to prevent multiple registration attempts
  const registrationPromise = useRef<Promise<void> | null>(null);
  
  // Promise to prevent multiple getMe calls
  const getMePromise = useRef<Promise<CantonMeResponseDto> | null>(null);
  
  // Promise to prevent multiple getBalances calls
  const getBalancesPromise = useRef<Promise<CantonWalletBalancesResponseDto> | null>(null);

  // Check registration status on mount (once)
  useEffect(() => {
    if (authenticated && stellarWallet && !hasCheckedRegistration.current) {
      hasCheckedRegistration.current = true;
      checkRegistration();
    }
  }, [authenticated, stellarWallet]);

  // Auto-fetch Canton user info after registration
  useEffect(() => {
    if (authenticated && stellarWallet && isRegistered && !hasFetchedCantonUser.current) {
      hasFetchedCantonUser.current = true;
      console.log('[Supa SDK] 🔍 Auto-fetching Canton user info...');
      
      const fetchUserInfo = async () => {
        try {
          const user = await cantonService.getMe();
          setCantonUser(user);
          
          console.log('[Supa SDK] Canton user info:', {
            transferPreapprovalSet: user.transferPreapprovalSet,
            preapprovalAttempted: preapprovalAttempted.current,
            preapprovalPromise: !!preapprovalPromise.current,
            stellarWallet: !!stellarWallet,
          });
          
          // Automatically setup transfer preapproval in background if not set and not attempted yet
          if (!user.transferPreapprovalSet && !preapprovalAttempted.current && !preapprovalPromise.current && stellarWallet) {
            console.log('[Supa SDK] 🔄 Starting automatic transfer preapproval setup...');
            preapprovalAttempted.current = true;
            
            // Run in background without blocking
            setupTransferPreapproval().catch(err => {
              console.warn('[Supa SDK] ❌ Failed to automatically setup transfer preapproval:', err);
            });
          } else {
            console.log('[Supa SDK] ⏭️ Skipping preapproval setup. Reasons:', {
              transferPreapprovalAlreadySet: user.transferPreapprovalSet,
              alreadyAttempted: preapprovalAttempted.current,
              promiseInProgress: !!preapprovalPromise.current,
              noStellarWallet: !stellarWallet,
            });
          }
        } catch (err) {
          console.error('[Supa SDK] Failed to fetch Canton user info:', err);
        }
      };
      
      fetchUserInfo();
    }
  }, [authenticated, stellarWallet, isRegistered, cantonService]);

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
    // If registration is already in progress, return the existing promise
    if (registrationPromise.current) {
      return registrationPromise.current;
    }

    const promise = (async () => {
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
              skipModal: true,
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
        registrationPromise.current = null;
      }
    })();

    registrationPromise.current = promise;
    return promise;
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

  const setupTransferPreapproval = useCallback(async (): Promise<void> => {
    if (!stellarWallet) {
      throw new Error('No Stellar wallet found');
    }

    // If already in progress, return the existing promise
    if (preapprovalPromise.current) {
      return preapprovalPromise.current;
    }

    // Mark as attempted
    preapprovalAttempted.current = true;

    // Create a new promise for this setup attempt
    const promise = (async () => {
      setLoading(true);
      setError(null);

      try {
        // Step 1: Prepare transfer preapproval
        const prepareResponse = await cantonService.prepareTransferPreapproval();

        // Step 2: Sign hash automatically without modal (background flow)
        const hashHex = base64ToHex(prepareResponse.hash);
        const signResult = await signRawHashWithModal(
          {
            address: stellarWallet.address,
            chainType: 'stellar',
            hash: hashHex as `0x${string}`,
          },
          {
            skipModal: true,
          }
        );

        if (!signResult) {
          throw new Error('User rejected transfer preapproval signature');
        }

        // Step 3: Submit signed preapproval and wait for completion with polling
        const signatureBase64 = hexToBase64(signResult.signature);
        await cantonService.submitPreparedAndWait(
          prepareResponse.hash,
          signatureBase64
        );

        // Update user info to reflect new preapproval status
        const user = await cantonService.getMe();
        setCantonUser(user);
        setIsRegistered(user.transferPreapprovalSet);
      } catch (err: any) {
        const error = new Error(`Failed to setup transfer preapproval: ${err.message}`);
        setError(error);
        throw error;
      } finally {
        setLoading(false);
        preapprovalPromise.current = null;
      }
    })();

    preapprovalPromise.current = promise;
    return promise;
  }, [stellarWallet, signRawHashWithModal, cantonService]);

  const getMe = useCallback(async (): Promise<CantonMeResponseDto> => {
    // If getMe is already in progress, return the existing promise
    if (getMePromise.current) {
      return getMePromise.current;
    }

    const promise = (async () => {
      try {
        const user = await cantonService.getMe();
        setCantonUser(user);
        
        console.log('[Supa SDK] Canton user info:', {
          transferPreapprovalSet: user.transferPreapprovalSet,
          preapprovalAttempted: preapprovalAttempted.current,
          preapprovalPromise: !!preapprovalPromise.current,
          stellarWallet: !!stellarWallet,
        });
        
        // Automatically setup transfer preapproval in background if not set and not attempted yet
        if (!user.transferPreapprovalSet && !preapprovalAttempted.current && !preapprovalPromise.current && stellarWallet) {
          console.log('[Supa SDK] 🔄 Starting automatic transfer preapproval setup...');
          // Run in background without blocking the return
          setupTransferPreapproval().catch(err => {
            console.warn('[Supa SDK] ❌ Failed to automatically setup transfer preapproval:', err);
          });
        } else {
          console.log('[Supa SDK] ⏭️ Skipping preapproval setup');
        }
        
        return user;
      } finally {
        // Clear promise after a short delay to allow reuse
        setTimeout(() => {
          getMePromise.current = null;
        }, 100);
      }
    })();

    getMePromise.current = promise;
    return promise;
  }, [cantonService, setupTransferPreapproval, stellarWallet]);

  const getActiveContracts = useCallback(async (templateIds?: string[]): Promise<CantonActiveContractsResponseDto> => {
    return await cantonService.getActiveContracts(templateIds);
  }, [cantonService]);

  const getBalances = useCallback(async (): Promise<CantonWalletBalancesResponseDto> => {
    // If getBalances is already in progress, return the existing promise
    if (getBalancesPromise.current) {
      return getBalancesPromise.current;
    }

    const promise = (async () => {
      try {
        const balances = await cantonService.getBalances();
        setCantonBalances(balances);
        return balances;
      } finally {
        // Clear promise after a short delay to allow reuse
        setTimeout(() => {
          getBalancesPromise.current = null;
        }, 100);
      }
    })();

    getBalancesPromise.current = promise;
    return promise;
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
    commands: unknown,
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
        commands,
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

  const sendCantonCoin = useCallback(async (
    receiverPartyId: string,
    amount: string,
    memo?: string,
    options?: CantonSubmitPreparedOptions
  ): Promise<CantonQueryCompletionResponseDto> => {
    if (!stellarWallet) {
      throw new Error('No Stellar wallet found');
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Prepare Amulet transfer (includes validation)
      const prepareResponse = await cantonService.prepareAmuletTransfer({
        receiverPartyId,
        amount,
        memo,
      });

      // Step 2: Sign hash with modal
      const hashHex = base64ToHex(prepareResponse.hash);
      const signResult = await signRawHashWithModal(
        {
          address: stellarWallet.address,
          chainType: 'stellar',
          hash: hashHex as `0x${string}`,
        },
        {
          title: 'Send Canton Coin',
          description: `You are sending ${amount} Canton Coin${memo ? ` (${memo})` : ''}.`,
          confirmText: 'Confirm & Sign',
          rejectText: 'Cancel',
          displayHash: `Sending ${amount} CC to ${receiverPartyId.slice(0, 20)}...`,
        }
      );

      if (!signResult) {
        throw new Error('User rejected transfer');
      }

      // Step 3: Submit signed transaction and wait for completion
      const signatureBase64 = hexToBase64(signResult.signature);
      const result = await cantonService.submitPreparedAndWait(
        prepareResponse.hash,
        signatureBase64,
        options
      );

      // Refresh balances after successful transfer
      await getBalances().catch(() => {
        // Ignore balance refresh errors
      });

      return result;
    } catch (err: any) {
      // Special handling for preapproval error
      if (err.message?.includes('CantonTransferOnlySupportedForWalletsWithPreapprovedTransfers')) {
        const error = new Error(
          'Transfer preapproval required. The receiver wallet must have transfer preapproval enabled.'
        );
        setError(error);
        throw error;
      }
      
      const error = new Error(`Failed to send Canton Coin: ${err.message}`);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [stellarWallet, signRawHashWithModal, cantonService, getBalances]);

  return {
    stellarWallet,
    stellarWallets,
    createStellarWallet,
    registerCanton,
    isRegistered,
    cantonUser,
    getMe,
    getActiveContracts,
    cantonBalances,
    getBalances,
    tapDevnet,
    signHash,
    signMessage,
    sendTransaction,
    sendCantonCoin,
    setupTransferPreapproval,
    loading,
    error,
    clearError,
  };
}

