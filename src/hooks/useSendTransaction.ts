/**
 * Transaction sending with built-in confirmation modal
 * 
 * Prepares, signs and submits Canton transactions with user confirmation
 */

import { useState, useCallback } from 'react';
import { useSupaContext } from '../providers/SupaProvider';
import { useSignRawHashWithModal } from './useSignRawHashWithModal';
import { useStellarWallet } from './useStellarWallet';
import { base64ToHex, hexToBase64 } from '../utils/converters';
import type { StellarWallet } from '../utils/stellar';
import type { CantonQueryCompletionResponseDto, CantonSubmitPreparedOptions } from '../services/cantonService';

export interface SendTransactionOptions {
  onSuccess?: (result: CantonQueryCompletionResponseDto) => void;
  onRejection?: () => void;
  onError?: (error: Error) => void;
  skipModal?: boolean;
  modalTitle?: string;
  modalDescription?: string;
  modalConfirmText?: string;
  modalRejectText?: string;
  modalInfoText?: string;
  /** Custom content to display in modal instead of transaction hash */
  modalDisplayContent?: string;
  /** Show technical transaction details (command, contracts, hash) as JSON. Default: false */
  showTechnicalDetails?: boolean;
  submitOptions?: CantonSubmitPreparedOptions;
}

export interface UseSendTransactionReturn {
  /** Sign and send a Canton transaction with confirmation modal */
  sendTransaction: (
    commandId: unknown,
    disclosedContracts?: unknown,
    options?: SendTransactionOptions
  ) => Promise<CantonQueryCompletionResponseDto | null>;
  loading: boolean;
  error: Error | null;
  clearError: () => void;
  stellarWallets: StellarWallet[];
  stellarWallet: StellarWallet | null;
}

export function useSendTransaction(): UseSendTransactionReturn {
  const { cantonService } = useSupaContext();
  const { signRawHashWithModal } = useSignRawHashWithModal();
  const { stellarWallet, stellarWallets } = useStellarWallet();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const sendTransaction = useCallback(
    async (
      commandId: unknown,
      disclosedContracts?: unknown,
      options?: SendTransactionOptions
    ): Promise<CantonQueryCompletionResponseDto | null> => {
      const {
        onSuccess,
        onRejection,
        onError,
        skipModal = false,
        modalTitle = 'Sign Transaction',
        modalDescription = 'Review and sign the following transaction.',
        modalConfirmText = 'Sign & Send',
        modalRejectText = 'Reject',
        modalInfoText = 'This transaction will be submitted to the blockchain. Make sure you understand what you are signing.',
        modalDisplayContent,
        showTechnicalDetails = false,
        submitOptions,
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
        // Step 1: Prepare transaction
        const prepareResponse = await cantonService.prepareTransaction(commandId, disclosedContracts);

        // Step 2: Determine modal display content
        const displayContent = modalDisplayContent 
          ? modalDisplayContent 
          : showTechnicalDetails 
            ? undefined 
            : `Transaction Hash: ${prepareResponse.hash}`;

        // Step 3: Sign hash with automatic modal
        const hashHex = base64ToHex(prepareResponse.hash);
        const signResult = await signRawHashWithModal(
          { address: stellarWallet.address, chainType: 'stellar', hash: hashHex as `0x${string}` },
          {
            skipModal,
            title: modalTitle,
            description: modalDescription,
            confirmText: modalConfirmText,
            rejectText: modalRejectText,
            infoText: modalInfoText,
            displayHash: displayContent,
            showTechnicalDetails,
          }
        );

        if (!signResult) {
          onRejection?.();
          return null;
        }

        // Step 4: Submit signed transaction
        const signatureBase64 = hexToBase64(signResult.signature);
        const completionResult = await cantonService.submitPreparedAndWait(
          prepareResponse.hash,
          signatureBase64,
          submitOptions
        );

        onSuccess?.(completionResult);
        return completionResult;
      } catch (err: any) {
        const isRejected = err.message.includes('rejected');
        if (isRejected) {
          onRejection?.();
        } else {
          const error = new Error(`Failed to send transaction: ${err.message}`);
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
    sendTransaction,
    loading,
    error,
    clearError,
    stellarWallets,
    stellarWallet,
  };
}
