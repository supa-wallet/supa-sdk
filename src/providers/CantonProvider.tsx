/**
 * Canton Provider
 * Provides shared Canton Network state across all components
 * Prevents duplicate registration calls and race conditions
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from 'react';
import { useWallets } from '@privy-io/react-auth';
import { useCreateWallet } from '@privy-io/react-auth/extended-chains';
import { useCreateWallet as useSolanaCreateWallet } from '@privy-io/react-auth/solana';
import { useAuth } from '../hooks/useAuth';
import { useSignRawHashWithModal } from '../hooks/useSignRawHashWithModal';
import { useCantonWallet } from '../hooks/useCantonWallet';
import { getCantonWallets, getPublicKeyBase64, CantonWallet } from '../utils/wallet';
import { base64ToHex, hexToBase64 } from '../utils/converters';
import type { CantonService, CantonSubmitPreparedOptions } from '../services/cantonService';
import type {
  CantonMeResponseDto,
  CantonActiveContractsResponseDto,
  CantonQueryCompletionResponseDto,
  CantonWalletBalancesResponseDto,
  CantonIncomingTransferDto,
  CantonTransactionDto,
  CantonTransactionsParams,
  CantonPriceInterval,
  CantonPriceCandleDto,
} from '../core/types';

// ============================================================================
// Types
// ============================================================================

export interface CantonContextValue {
  /** First Stellar wallet (primary) */
  cantonWallet: CantonWallet | null;
  
  /** All Stellar wallets */
  cantonWallets: CantonWallet[];
  
  /** Create new Stellar wallet */
  createCantonWallet: () => Promise<CantonWallet | null>;
  
  /** Register Canton wallet on backend */
  registerCanton: (inviteCode?: string) => Promise<void>;
  
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
  
  /** Get pending incoming transfers */
  getPendingIncomingTransfers: () => Promise<CantonIncomingTransferDto[]>;
  
  /** Respond to incoming transfer (accept or reject) */
  respondToIncomingTransfer: (
    contractId: string,
    accept: boolean,
    options?: CantonSubmitPreparedOptions
  ) => Promise<CantonQueryCompletionResponseDto>;
  
  /** Get Canton transactions history with pagination */
  getTransactions: (params?: CantonTransactionsParams) => Promise<CantonTransactionDto[]>;
  
  /** Get Canton price history (candles from Bybit) */
  getPriceHistory: (interval: CantonPriceInterval) => Promise<CantonPriceCandleDto[]>;
  
  /** Loading state */
  loading: boolean;
  
  /** Error state */
  error: Error | null;
  
  /** Clear error */
  clearError: () => void;
}

const CantonContext = createContext<CantonContextValue | null>(null);

// ============================================================================
// Provider Props
// ============================================================================

export interface CantonProviderProps {
  cantonService: CantonService;
  children: ReactNode;
  /** Enable wallet export (uses Solana instead of Stellar). Default: false */
  withExport?: boolean;
}

// ============================================================================
// Canton Provider Component
// ============================================================================

export function CantonProvider({ cantonService, children, withExport = false }: CantonProviderProps) {
  const { user, authenticated } = useAuth();
  const { wallets } = useWallets();
  const { signRawHashWithModal } = useSignRawHashWithModal();
  const { createWallet: createStellarWallet } = useCreateWallet();
  const { createWallet: createSolanaWallet } = useSolanaCreateWallet();
  const { cantonWallet, cantonWallets } = useCantonWallet();

  // Chain type based on withExport flag
  const chainType = withExport ? 'solana' : 'stellar';
  
  // ============================================================================
  // Shared State (single source of truth)
  // ============================================================================
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [cantonUser, setCantonUser] = useState<CantonMeResponseDto | null>(null);
  const [cantonBalances, setCantonBalances] = useState<CantonWalletBalancesResponseDto | null>(null);
  
  // ============================================================================
  // Synchronization Flags (prevent duplicate operations)
  // ============================================================================
  const hasCheckedRegistration = useRef(false);
  const hasFetchedCantonUser = useRef(false);
  const hasAutoCreatedWallet = useRef(false);
  const hasAutoRegistered = useRef(false);
  const registrationPromise = useRef<Promise<void> | null>(null);
  const getMePromise = useRef<Promise<CantonMeResponseDto> | null>(null);
  const getBalancesPromise = useRef<Promise<CantonWalletBalancesResponseDto> | null>(null);
  const preapprovalPromise = useRef<Promise<void> | null>(null);
  const preapprovalAttempted = useRef(false);

  // ============================================================================
  // Check Registration Status (once on mount)
  // ============================================================================
  useEffect(() => {
    if (authenticated && cantonWallet && !hasCheckedRegistration.current) {
      hasCheckedRegistration.current = true;
      checkRegistration();
    }
  }, [authenticated, cantonWallet]);

  const checkRegistration = async () => {
    try {
      const status = await cantonService.checkRegistrationStatus();
      setIsRegistered(status);
    } catch (err) {
      setIsRegistered(false);
    }
  };


  // ============================================================================
  // Auto-fetch Canton User + Setup Preapproval (after registration)
  // ============================================================================
  useEffect(() => {
    if (authenticated && cantonWallet && isRegistered && !hasFetchedCantonUser.current) {
      hasFetchedCantonUser.current = true;
      
      const fetchUserInfo = async () => {
        try {
          const fetchedUser = await cantonService.getMe();
          setCantonUser(fetchedUser);
          
          // Automatically setup transfer preapproval if not set
          if (!fetchedUser.transferPreapprovalSet && !preapprovalAttempted.current && cantonWallet) {
            preapprovalAttempted.current = true;
            setupTransferPreapprovalInternal(fetchedUser).catch(err => {
              console.warn('[Supa SDK] ❌ Failed to automatically setup transfer preapproval:', err);
            });
          }
        } catch (err) {
          console.error('[Supa SDK] Failed to fetch Canton user info:', err);
        }
      };
      
      fetchUserInfo();
    }
  }, [authenticated, cantonWallet, isRegistered]);

  // ============================================================================
  // Clear Error
  // ============================================================================
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ============================================================================
  // Create Stellar Wallet
  // ============================================================================
  const createCantonWallet = useCallback(async (): Promise<CantonWallet | null> => {
    if (!authenticated) {
      throw new Error('User must be authenticated to create wallet');
    }

    setLoading(true);
    setError(null);

    try {
      // Different wallet creation based on withExport flag
      const result = withExport
        ? await createSolanaWallet()
        : await createStellarWallet({ chainType: 'stellar' });

      if (result) {
        const createdWallet = (result as any).wallet || result;

        if (createdWallet.public_key || createdWallet.publicKey || createdWallet.address) {
          console.log(`[Supa SDK] ✅ ${withExport ? 'Solana' : 'Stellar'} wallet created successfully`);
          return createdWallet as CantonWallet;
        }

        // Fallback: Wait for React to update wallets
        await new Promise(resolve => setTimeout(resolve, 2000));

        const freshWallets = getCantonWallets(user, wallets, chainType);
        if (freshWallets[0]) {
          console.log(`[Supa SDK] ✅ ${withExport ? 'Solana' : 'Stellar'} wallet created successfully`);
          return freshWallets[0];
        }

        return createdWallet as CantonWallet;
      }

      return null;
    } catch (err: any) {
      const error = new Error(`Failed to create ${withExport ? 'Solana' : 'Stellar'} wallet: ${err.message}`);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [authenticated, createStellarWallet, createSolanaWallet, user, wallets, withExport, chainType]);

  // ============================================================================
  // Sign Hash
  // ============================================================================
  const signHash = useCallback(async (hashBase64: string): Promise<string> => {
    if (!cantonWallet) {
      throw new Error('No Stellar wallet found');
    }

    try {
      const hashHex = base64ToHex(hashBase64);

      const result = await signRawHashWithModal(
        {
          address: cantonWallet.address,
          chainType,
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

      return hexToBase64(result.signature);
    } catch (err: any) {
      throw new Error(`Failed to sign hash: ${err.message}`);
    }
  }, [cantonWallet, signRawHashWithModal]);

  // ============================================================================
  // Register Canton (with deduplication)
  // ============================================================================
  const registerCanton = useCallback(async (inviteCode?: string) => {
    // If registration is already in progress, return existing promise
    if (registrationPromise.current) {
      return registrationPromise.current;
    }

    // If already registered, skip
    if (isRegistered) {
      console.log('[Supa SDK] ✅ Canton wallet already registered, skipping');
      return;
    }

    const promise = (async () => {
      setLoading(true);
      setError(null);

      try {
        // Ensure Stellar wallet exists
        let wallet: CantonWallet | null = cantonWallet;
        
        if (!wallet) {
          const createdWallet = await createCantonWallet();
          
          if (createdWallet) {
            wallet = createdWallet;
          } else {
            await new Promise(resolve => setTimeout(resolve, 2000));
            const freshWallets = getCantonWallets(user, wallets, chainType);
            wallet = freshWallets[0] || null;
          }
          
          if (!wallet) {
            throw new Error('Failed to create Stellar wallet. Please try again.');
          }
        }

        // Poll for public key availability
        let publicKey: string | null = null;
        let attempts = 0;
        const maxAttempts = 10;
        
        while (attempts < maxAttempts && !publicKey) {
          try {
            publicKey = getPublicKeyBase64(wallet);
            break;
          } catch (err: any) {
            attempts++;
            if (attempts >= maxAttempts) {
              throw new Error(`${err.message} After ${maxAttempts} attempts, the Stellar wallet is still not ready.`);
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
            const freshWallets = getCantonWallets(user, wallets, chainType);
            if (freshWallets[0]) {
              wallet = freshWallets[0];
            }
          }
        }

        if (!publicKey) {
          throw new Error('Failed to obtain public key from Stellar wallet');
        }

        // Wait for Privy to initialize wallet proxy
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Sign function with retry logic
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
                  chainType,
                  hash: hashHex as `0x${string}`,
                },
                { skipModal: true }
              );
              
              if (!result) {
                throw new Error('User rejected signature');
              }
              
              console.log('[Supa SDK] ✅ Signature obtained successfully');
              return result.signature;
            } catch (signErr: any) {
              signAttempts++;
              console.log(`[Supa SDK] ❌ Sign attempt ${signAttempts} failed:`, signErr.message);
              
              if (signErr.message?.includes('Wallet not found') || 
                  signErr.message?.includes('not initialized') ||
                  signErr.message?.includes('proxy') ||
                  signErr.message?.includes('Wallet')) {
                if (signAttempts < maxSignAttempts) {
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
        const res = await cantonService.registerCanton({
          publicKey,
          signFunction,
          inviteCode,
        });

        if (res === 'registered') {
          console.log('[Supa SDK] ✅ Canton wallet already registered or registration completed');
          setIsRegistered(true);
          return;
        }

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
  }, [cantonWallet, createCantonWallet, user, wallets, signRawHashWithModal, cantonService, isRegistered]);

  // ============================================================================
  // Tap Devnet
  // ============================================================================
  const tapDevnet = useCallback(async (
    amount: string,
    options?: CantonSubmitPreparedOptions
  ): Promise<CantonQueryCompletionResponseDto> => {
    if (!cantonWallet) {
      throw new Error('No Stellar wallet found');
    }

    setLoading(true);
    setError(null);

    try {
      const signFunction = async (hashHex: string): Promise<string> => {
        const result = await signRawHashWithModal(
          {
            address: cantonWallet.address,
            chainType,
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

      return await cantonService.tapDevnet({ amount, signFunction }, options);
    } catch (err: any) {
      const error = new Error(`Failed to tap devnet: ${err.message}`);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [cantonWallet, signRawHashWithModal, cantonService]);

  // ============================================================================
  // Get Me (with deduplication)
  // ============================================================================
  const getMe = useCallback(async (): Promise<CantonMeResponseDto> => {
    if (getMePromise.current) {
      return getMePromise.current;
    }

    const promise = (async () => {
      try {
        const fetchedUser = await cantonService.getMe();
        setCantonUser(fetchedUser);
        return fetchedUser;
      } finally {
        setTimeout(() => {
          getMePromise.current = null;
        }, 100);
      }
    })();

    getMePromise.current = promise;
    return promise;
  }, [cantonService]);

  // ============================================================================
  // Get Active Contracts
  // ============================================================================
  const getActiveContracts = useCallback(async (templateIds?: string[]): Promise<CantonActiveContractsResponseDto> => {
    return await cantonService.getActiveContracts(templateIds);
  }, [cantonService]);

  // ============================================================================
  // Get Balances (with deduplication)
  // ============================================================================
  const getBalances = useCallback(async (): Promise<CantonWalletBalancesResponseDto> => {
    if (getBalancesPromise.current) {
      return getBalancesPromise.current;
    }

    const promise = (async () => {
      try {
        const balances = await cantonService.getBalances();
        setCantonBalances(balances);
        return balances;
      } finally {
        setTimeout(() => {
          getBalancesPromise.current = null;
        }, 100);
      }
    })();

    getBalancesPromise.current = promise;
    return promise;
  }, [cantonService]);

  // ============================================================================
  // Sign Message
  // ============================================================================
  const signMessage = useCallback(async (message: string): Promise<string> => {
    if (!cantonWallet) {
      throw new Error('No Stellar wallet found');
    }

    setLoading(true);
    setError(null);

    try {
      const signFunction = async (hashHex: string): Promise<string> => {
        const result = await signRawHashWithModal(
          {
            address: cantonWallet.address,
            chainType,
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
  }, [cantonWallet, signRawHashWithModal, cantonService]);

  // ============================================================================
  // Send Transaction
  // ============================================================================
  const sendTransaction = useCallback(async (
    commands: unknown,
    disclosedContracts?: unknown,
    options?: CantonSubmitPreparedOptions
  ): Promise<CantonQueryCompletionResponseDto> => {
    if (!cantonWallet) {
      throw new Error('No Stellar wallet found');
    }

    setLoading(true);
    setError(null);

    try {
      const prepareResponse = await cantonService.prepareTransaction(commands, disclosedContracts);

      if (options?.onCostEstimation && prepareResponse.costEstimation) {
        await options.onCostEstimation(prepareResponse.costEstimation);
      }

      const hashHex = base64ToHex(prepareResponse.hash);

      const signResult = await signRawHashWithModal(
        {
          address: cantonWallet.address,
          chainType,
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

      const signatureBase64 = hexToBase64(signResult.signature);
      return await cantonService.submitPreparedAndWait(prepareResponse.hash, signatureBase64, options);
    } catch (err: any) {
      const error = new Error(`Failed to send transaction: ${err.message}`);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [cantonWallet, signRawHashWithModal, cantonService]);

  // ============================================================================
  // Send Canton Coin
  // ============================================================================
  const sendCantonCoin = useCallback(async (
    receiverPartyId: string,
    amount: string,
    memo?: string,
    options?: CantonSubmitPreparedOptions
  ): Promise<CantonQueryCompletionResponseDto> => {
    if (!cantonWallet) {
      throw new Error('No Stellar wallet found');
    }

    setLoading(true);
    setError(null);

    try {
      const prepareResponse = await cantonService.prepareAmuletTransfer({
        receiverPartyId,
        amount,
        memo,
      });

      if (options?.onCostEstimation && prepareResponse.costEstimation) {
        await options.onCostEstimation(prepareResponse.costEstimation);
      }

      const hashHex = base64ToHex(prepareResponse.hash);
      const signResult = await signRawHashWithModal(
        {
          address: cantonWallet.address,
          chainType,
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

      const signatureBase64 = hexToBase64(signResult.signature);
      const result = await cantonService.submitPreparedAndWait(
        prepareResponse.hash,
        signatureBase64,
        options
      );

      // Refresh balances after successful transfer
      await getBalances().catch(() => {});

      return result;
    } catch (err: any) {
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
  }, [cantonWallet, signRawHashWithModal, cantonService, getBalances]);

  // ============================================================================
  // Setup Transfer Preapproval (internal)
  // ============================================================================
  const setupTransferPreapprovalInternal = useCallback(async (currentUser?: CantonMeResponseDto): Promise<void> => {
    if (!cantonWallet) {
      throw new Error('No Stellar wallet found');
    }

    if (preapprovalPromise.current) {
      return preapprovalPromise.current;
    }

    const userToCheck = currentUser || cantonUser;
    if (userToCheck?.transferPreapprovalSet) {
      return;
    }

    preapprovalAttempted.current = true;

    const promise = (async () => {
      setLoading(true);
      setError(null);

      try {
        if (!currentUser) {
          const freshUser = await cantonService.getMe();
          if (freshUser.transferPreapprovalSet) {
            setCantonUser(freshUser);
            return;
          }
        }

        const prepareResponse = await cantonService.prepareTransferPreapproval();

        const hashHex = base64ToHex(prepareResponse.hash);
        const signResult = await signRawHashWithModal(
          {
            address: cantonWallet.address,
            chainType,
            hash: hashHex as `0x${string}`,
          },
          { skipModal: true }
        );

        if (!signResult) {
          throw new Error('User rejected transfer preapproval signature');
        }

        const signatureBase64 = hexToBase64(signResult.signature);
        await cantonService.submitPreparedAndWait(prepareResponse.hash, signatureBase64);

        if (!currentUser) {
          const updatedUser = await cantonService.getMe();
          setCantonUser(updatedUser);
        } else {
          setCantonUser({ ...currentUser, transferPreapprovalSet: true });
        }
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
  }, [cantonWallet, signRawHashWithModal, cantonService, cantonUser]);

  const setupTransferPreapproval = useCallback(async (): Promise<void> => {
    return setupTransferPreapprovalInternal();
  }, [setupTransferPreapprovalInternal]);

  // ============================================================================
  // Get Pending Incoming Transfers
  // ============================================================================
  const getPendingIncomingTransfers = useCallback(async (): Promise<CantonIncomingTransferDto[]> => {
    return await cantonService.getPendingIncomingTransfers();
  }, [cantonService]);

  // ============================================================================
  // Respond to Incoming Transfer
  // ============================================================================
  const respondToIncomingTransfer = useCallback(async (
    contractId: string,
    accept: boolean,
    options?: CantonSubmitPreparedOptions
  ): Promise<CantonQueryCompletionResponseDto> => {
    if (!cantonWallet) {
      throw new Error('No Stellar wallet found');
    }

    setLoading(true);
    setError(null);

    try {
      const prepareResponse = await cantonService.prepareResponseToIncomingTransfer({
        contractId,
        accept
      });

      if (options?.onCostEstimation && prepareResponse.costEstimation) {
        await options.onCostEstimation(prepareResponse.costEstimation);
      }

      const hashHex = base64ToHex(prepareResponse.hash);
      const signResult = await signRawHashWithModal(
        {
          address: cantonWallet.address,
          chainType,
          hash: hashHex as `0x${string}`,
        },
        {
          title: accept ? 'Accept Transfer' : 'Reject Transfer',
          description: `You are about to ${accept ? 'accept' : 'reject'} an incoming transfer.`,
          confirmText: 'Confirm & Sign',
          rejectText: 'Cancel',
          displayHash: `${accept ? 'Accepting' : 'Rejecting'} transfer ${contractId.slice(0, 20)}...`,
        }
      );

      if (!signResult) {
        throw new Error('User rejected signature');
      }

      const signatureBase64 = hexToBase64(signResult.signature);
      const result = await cantonService.submitPreparedAndWait(
        prepareResponse.hash,
        signatureBase64,
        options
      );

      // Refresh balances after successful operation
      await getBalances().catch(() => {});

      return result;
    } catch (err: any) {
      const error = new Error(`Failed to respond to transfer: ${err.message}`);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [cantonWallet, signRawHashWithModal, cantonService, getBalances]);

  // ============================================================================
  // Get Transactions History
  // ============================================================================
  const getTransactions = useCallback(async (
    params?: CantonTransactionsParams
  ): Promise<CantonTransactionDto[]> => {
    return await cantonService.getTransactions(params);
  }, [cantonService]);

  // ============================================================================
  // Get Price History
  // ============================================================================
  const getPriceHistory = useCallback(async (
    interval: CantonPriceInterval
  ): Promise<CantonPriceCandleDto[]> => {
    return await cantonService.getPriceHistory(interval);
  }, [cantonService]);

  // ============================================================================
  // Auto-onboarding: Create Stellar Wallet + Register Canton (once)
  // ============================================================================
  useEffect(() => {
    if (!authenticated || loading) return;

    const runAutoOnboarding = async () => {
      // Step 1: Auto-create Canton wallet if needed
      if (!cantonWallet && !hasAutoCreatedWallet.current) {
        hasAutoCreatedWallet.current = true;
        try {
          // Different wallet creation based on withExport flag
          if (withExport) {
            await createSolanaWallet();
          } else {
            await createStellarWallet({ chainType: 'stellar' });
          }
          console.log(`[Supa SDK] ✅ ${withExport ? 'Solana' : 'Stellar'} wallet auto-created`);
        } catch (err) {
          console.warn(`[Supa SDK] ❌ Failed to auto-create ${withExport ? 'Solana' : 'Stellar'} wallet:`, err);
        }
        return; // Wait for next render with wallet
      }

      // Step 2: Auto-register Canton if needed
      if (cantonWallet && !isRegistered && !hasAutoRegistered.current && !registrationPromise.current) {
        hasAutoRegistered.current = true;
        try {
          await registerCanton();
        } catch (err) {
          console.warn('[Supa SDK] ❌ Failed to auto-register Canton:', err);
          // Reset flag to allow manual retry
          hasAutoRegistered.current = false;
        }
      }
    };

    runAutoOnboarding();
  }, [authenticated, loading, cantonWallet, isRegistered, createStellarWallet, createSolanaWallet, registerCanton, withExport]);

  // ============================================================================
  // Context Value
  // ============================================================================
  const contextValue: CantonContextValue = {
    cantonWallet,
    cantonWallets,
    createCantonWallet,
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
    getPendingIncomingTransfers,
    respondToIncomingTransfer,
    getTransactions,
    getPriceHistory,
    loading,
    error,
    clearError,
  };

  return (
    <CantonContext.Provider value={contextValue}>
      {children}
    </CantonContext.Provider>
  );
}

// ============================================================================
// Hook to access Canton Context
// ============================================================================

export function useCantonContext(): CantonContextValue {
  const context = useContext(CantonContext);
  
  if (!context) {
    throw new Error('useCantonContext must be used within CantonProvider (inside SupaProvider)');
  }
  
  return context;
}
