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

// Global flags to prevent duplicate operations across multiple hook instances
let globalPreapprovalAttempted = false;
let globalPreapprovalPromise: Promise<void> | null = null;

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
      
      const fetchUserInfo = async () => {
        try {
          const user = await cantonService.getMe();
          setCantonUser(user);
          
          // Automatically setup transfer preapproval in background if not set and not attempted yet
          // Use global flags to prevent duplicate calls across multiple hook instances
          if (!user.transferPreapprovalSet && !globalPreapprovalAttempted && !globalPreapprovalPromise && stellarWallet) {
            globalPreapprovalAttempted = true;
            
            // Run in background without blocking
            setupTransferPreapproval().catch(err => {
              console.warn('[Supa SDK] ❌ Failed to automatically setup transfer preapproval:', err);
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
        // CRITICAL: createWallet returns { user, wallet }, we need the wallet object
        const createdWallet = (result as any).wallet || result;
        
        // Check if we got public_key in the created wallet
        if (createdWallet.public_key || createdWallet.publicKey) {
          console.log('[Supa SDK] ✅ Stellar wallet created successfully');
          return createdWallet as StellarWallet;
        }
        
        // Fallback: Wait for React to update wallets from useWallets hook
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Get fresh wallet from Privy's state
        const freshWallets = getStellarWallets(user, wallets);
        
        if (freshWallets[0]) {
          console.log('[Supa SDK] ✅ Stellar wallet created successfully');
          return freshWallets[0];
        }
        
        return createdWallet as StellarWallet;
      }
      
      return null;
    } catch (err: any) {
      const error = new Error(`Failed to create Stellar wallet: ${err.message}`);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [authenticated, createWallet, user, wallets]);

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
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Try to get wallet from updated state
            const freshWallets = getStellarWallets(user, wallets);
            wallet = freshWallets[0] || null;
          }
          
          if (!wallet) {
            throw new Error('Failed to create Stellar wallet. Please try again.');
          }
        }

        // Poll for public key availability with multiple attempts
        let publicKey: string | null = null;
        let attempts = 0;
        const maxAttempts = 10; // 10 attempts * 2 seconds = 20 seconds max
        
        while (attempts < maxAttempts && !publicKey) {
          try {
            publicKey = getPublicKeyBase64(wallet);
            break;
          } catch (err: any) {
            attempts++;
            
            if (attempts >= maxAttempts) {
              throw new Error(`${err.message} After ${maxAttempts} attempts, the Stellar wallet is still not ready. Please refresh the app and try again.`);
            }
            
            // Wait 2 seconds before retry
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Refresh wallet from current state
            const freshWallets = getStellarWallets(user, wallets);
            if (freshWallets[0]) {
              wallet = freshWallets[0];
            }
          }
        }

        if (!publicKey) {
          throw new Error('Failed to obtain public key from Stellar wallet');
        }

        // Give Privy time to initialize wallet proxy for signing
        // Note: useSupa handles proper step separation with React re-renders,
        // so wallet should already be in Privy state when this is called
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Create sign function with retry logic for wallet proxy initialization
        const signFunction = async (hashHex: string): Promise<string> => {
          let signAttempts = 0;
          const maxSignAttempts = 5;
          
          console.log('[Supa SDK] 🔐 Signing with wallet:', wallet!.address);
          
          while (signAttempts < maxSignAttempts) {
            try {
              console.log(`[Supa SDK] 🔐 Sign attempt ${signAttempts + 1}/${maxSignAttempts}...`);
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
              
              console.log('[Supa SDK] ✅ Signature obtained successfully');
              return result.signature;
            } catch (signErr: any) {
              signAttempts++;
              console.log(`[Supa SDK] ❌ Sign attempt ${signAttempts} failed:`, signErr.message);
              
              // If wallet not found/not initialized, wait and retry with progressive delay
              if (signErr.message?.includes('Wallet not found') || 
                  signErr.message?.includes('not initialized') ||
                  signErr.message?.includes('proxy') ||
                  signErr.message?.includes('Wallet')) {
                if (signAttempts < maxSignAttempts) {
                  // Progressive delay: 2s, 3s, then 4s for remaining attempts
                  const delay = signAttempts === 1 ? 2000 : signAttempts === 2 ? 3000 : 4000;
                  console.log(`[Supa SDK] ⏳ Waiting ${delay/1000}s before retry...`);
                  await new Promise(resolve => setTimeout(resolve, delay));
                  continue;
                }
              }
              throw signErr;
            }
          }
          
          throw new Error('Failed to sign after multiple attempts');
        };

        // Register Canton wallet
        await cantonService.registerCanton({
          publicKey,
          signFunction,
        });

        console.log('[Supa SDK] ✅ Canton wallet registered successfully');
        setIsRegistered(true);
      } catch (err: any) {
        console.error('[Supa SDK] ❌ Canton registration failed:', err);
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

    // If already in progress (global), return the existing promise
    if (globalPreapprovalPromise) {
      return globalPreapprovalPromise;
    }

    // Also check local ref for this instance
    if (preapprovalPromise.current) {
      return preapprovalPromise.current;
    }

    // Check if already set (avoid unnecessary API calls)
    if (cantonUser?.transferPreapprovalSet) {
      return;
    }

    // Mark as attempted globally
    globalPreapprovalAttempted = true;
    preapprovalAttempted.current = true;

    // Create a new promise for this setup attempt
    const promise = (async () => {
      setLoading(true);
      setError(null);

      try {
        // Double check with fresh user data before calling prepare
        const freshUser = await cantonService.getMe();
        if (freshUser.transferPreapprovalSet) {
          setCantonUser(freshUser);
          return; // Already set, skip
        }

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

    globalPreapprovalPromise = promise;
    preapprovalPromise.current = promise;
    
    // Clear global promise when done
    promise.finally(() => {
      globalPreapprovalPromise = null;
    });
    
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
        
        // Note: Auto preapproval is handled by the useEffect hook after registration
        // to avoid duplicate calls
        
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

