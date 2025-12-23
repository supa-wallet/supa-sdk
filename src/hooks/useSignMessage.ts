/**
 * Message signing with built-in confirmation modal
 * 
 * Signs arbitrary text messages using Canton protocol
 */

import { useState, useCallback } from 'react';
import { useSupaContext } from '../providers/SupaProvider';
import { useSignRawHashWithModal } from './useSignRawHashWithModal';
import { useStellarWallet } from './useStellarWallet';
import type { StellarWallet } from '../utils/stellar';

export interface SignMessageOptions {
  onSuccess?: (signature: string) => void;
  onRejection?: () => void;
  onError?: (error: Error) => void;
  skipModal?: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  rejectText?: string;
  /** Custom content to display in modal instead of message */
  displayContent?: string;
  /** Show technical details (address, chainType, hash) as JSON. Default: false */
  showTechnicalDetails?: boolean;
}

export interface UseSignMessageReturn {
  /** Sign a text message with confirmation modal */
  signMessage: (message: string, options?: SignMessageOptions) => Promise<string | null>;
  loading: boolean;
  error: Error | null;
  clearError: () => void;
  stellarWallets: StellarWallet[];
  stellarWallet: StellarWallet | null;
}
export function useSignMessage(): UseSignMessageReturn {
  const { cantonService } = useSupaContext();
  const { signRawHashWithModal } = useSignRawHashWithModal();
  const { stellarWallet, stellarWallets } = useStellarWallet();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const signMessage = useCallback(
    async (message: string, options?: SignMessageOptions): Promise<string | null> => {
      const {
        onSuccess,
        onRejection,
        onError,
        skipModal = false,
        title = 'Sign Message',
        description = 'You are about to sign the following message.',
        confirmText = 'Sign',
        rejectText = 'Reject',
        displayContent,
        showTechnicalDetails = false,
      } = options || {};

      if (!stellarWallet) {
        const err = new Error('No Stellar wallet found. Please create one first.');
        setError(err);
        onError?.(err);
        return null;
      }

      setError(null);
      setLoading(true);

      try {
        const signFunction = async (hashHex: string): Promise<string> => {
          const result = await signRawHashWithModal(
            { address: stellarWallet.address, chainType: 'stellar', hash: hashHex as `0x${string}` },
            {
              skipModal,
              title,
              description,
              confirmText,
              rejectText,
              infoText: 'Signing a message proves ownership of your wallet without exposing private keys or making any blockchain transactions.',
              displayHash: showTechnicalDetails ? undefined : (displayContent || message),
              showTechnicalDetails,
            }
          );
          
          if (!result) throw new Error('User rejected signature');
          return result.signature;
        };

        const signature = await cantonService.signMessage(message, signFunction);
        onSuccess?.(signature);
        return signature;
      } catch (err: any) {
        const isRejected = err.message.includes('rejected');
        if (isRejected) {
          onRejection?.();
        } else {
          const error = new Error(`Failed to sign message: ${err.message}`);
          setError(error);
          onError?.(error);
        }
        return null;
      } finally {
        setLoading(false);
      }
    },
    [stellarWallet, signRawHashWithModal, cantonService]
  );

  return {
    signMessage,
    loading,
    error,
    clearError,
    stellarWallets,
    stellarWallet,
  };
}

