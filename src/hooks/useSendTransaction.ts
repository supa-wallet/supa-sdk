/**
 * Transaction sending with built-in confirmation modal
 * 
 * Prepares, signs and submits Canton transactions with user confirmation
 */

import { useState, useCallback } from 'react';
import { useSupaContext } from '../providers/SupaProvider';
import { useCantonContext } from '../providers/CantonProvider';
import { useSignRawHashWithModal } from './useSignRawHashWithModal';
import { useCantonWallet } from './useCantonWallet';
import { base64ToHex, hexToBase64 } from '../utils/converters';
import type { CantonWallet } from '../utils/wallet';
import type { CantonQueryCompletionResponseDto, CantonSubmitPreparedOptions } from '../services/cantonService';
import type { CantonPrepareTransactionResponseDto } from '../core/types';
import { CantonTransactionRejectedError } from '../core/errors';
import { isUserWalletRejection } from '../utils/walletRejection';
import { preparedTransactionDisplay } from '../utils/preparedTransactionDisplay';

export interface SendTransactionOptions {
  onSuccess?: (result: CantonQueryCompletionResponseDto) => void;
  onRejection?: () => void;
  onError?: (error: Error) => void;
  skipModal?: boolean;
  modalTitle?: string;
  modalDescription?: string;
  modalConfirmText?: string;
  modalRejectText?: string;
  /** Custom content to display in modal instead of transaction hash */
  modalDisplayContent?: string;
  /** Show technical transaction details (command, contracts, hash) as JSON. Default: false */
  showTechnicalDetails?: boolean;
  /** Optional command ID for idempotency */
  commandId?: string;
  submitOptions?: CantonSubmitPreparedOptions;
}

export interface UseSendTransactionReturn {
  /** Prepare a transaction and return the exact hash and any wallet-added fee */
  prepareTransaction: (
    commands: unknown,
    disclosedContracts?: unknown,
    commandId?: string
  ) => Promise<CantonPrepareTransactionResponseDto>;
  /** Sign and submit a transaction that has already been prepared and reviewed */
  sendPreparedTransaction: (
    prepared: CantonPrepareTransactionResponseDto,
    options?: SendTransactionOptions
  ) => Promise<CantonQueryCompletionResponseDto | null>;
  /** Sign and send a Canton transaction with confirmation modal */
  sendTransaction: (
    commands: unknown,
    disclosedContracts?: unknown,
    options?: SendTransactionOptions
  ) => Promise<CantonQueryCompletionResponseDto | null>;
  loading: boolean;
  error: Error | null;
  clearError: () => void;
  cantonWallets: CantonWallet[];
  cantonWallet: CantonWallet | null;
}

export function useSendTransaction(): UseSendTransactionReturn {
  const { cantonService } = useSupaContext();
  const { signRawHashWithModal } = useSignRawHashWithModal();
  const { cantonWallet, cantonWallets } = useCantonWallet();
  const { resolveSigningWallet } = useCantonContext();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const prepareTransaction = useCallback(
    async (
      commands: unknown,
      disclosedContracts?: unknown,
      commandId?: string
    ): Promise<CantonPrepareTransactionResponseDto> => {
      setError(null);
      setLoading(true);
      try {
        return await cantonService.prepareTransaction(
          commands,
          disclosedContracts,
          commandId
        );
      } catch (err: any) {
        const prepareError = new Error(
          `Failed to prepare transaction: ${err.message}`
        );
        setError(prepareError);
        throw prepareError;
      } finally {
        setLoading(false);
      }
    },
    [cantonService]
  );

  const sendPreparedTransaction = useCallback(
    async (
      prepareResponse: CantonPrepareTransactionResponseDto,
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
        modalDisplayContent,
        showTechnicalDetails = false,
        submitOptions,
      } = options || {};

      setError(null);
      setLoading(true);

      try {
        const { wallet: signingWallet, chainType: signingChainType } =
          await resolveSigningWallet();

        const displayContent = preparedTransactionDisplay(
          prepareResponse,
          modalDisplayContent,
          showTechnicalDetails
        );

        const hashHex = base64ToHex(prepareResponse.hash);
        const signResult = await signRawHashWithModal(
          {
            address: signingWallet.address,
            chainType: signingChainType,
            hash: hashHex as `0x${string}`,
          },
          {
            // A caller cannot silently suppress a backend-added fee. Popup
            // wallets that already rendered the prepared response submit it
            // through their own low-level signing flow instead.
            skipModal: prepareResponse.networkFee ? false : skipModal,
            title: modalTitle,
            description: modalDescription,
            confirmText: modalConfirmText,
            rejectText: modalRejectText,
            infoText: 'You are submitting a transaction, please be careful',
            displayHash: displayContent,
            showTechnicalDetails,
          }
        );

        if (!signResult) {
          onRejection?.();
          return null;
        }

        const signatureBase64 = hexToBase64(signResult.signature);
        const completionResult = await cantonService.submitPreparedAndWait(
          prepareResponse.hash,
          signatureBase64,
          submitOptions
        );

        onSuccess?.(completionResult);
        return completionResult;
      } catch (err: any) {
        if (err instanceof CantonTransactionRejectedError) {
          setError(err);
          onError?.(err);
          return null;
        }
        if (isUserWalletRejection(err)) {
          onRejection?.();
        } else {
          const sendError = new Error(
            `Failed to send transaction: ${err.message}`
          );
          setError(sendError);
          onError?.(sendError);
        }
        return null;
      } finally {
        setLoading(false);
      }
    },
    [resolveSigningWallet, signRawHashWithModal, cantonService]
  );

  const sendTransaction = useCallback(
    async (
      commands: unknown,
      disclosedContracts?: unknown,
      options?: SendTransactionOptions
    ): Promise<CantonQueryCompletionResponseDto | null> => {
      try {
        const prepareResponse = await prepareTransaction(
          commands,
          disclosedContracts,
          options?.commandId
        );
        return await sendPreparedTransaction(prepareResponse, options);
      } catch (err) {
        options?.onError?.(err as Error);
        return null;
      }
    },
    [prepareTransaction, sendPreparedTransaction]
  );

  return {
    prepareTransaction,
    sendPreparedTransaction,
    sendTransaction,
    loading,
    error,
    clearError,
    cantonWallets,
    cantonWallet,
  };
}
