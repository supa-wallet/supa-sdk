/**
 * Wrapper over Privy's signing with a mandatory confirmation modal.
 *
 * Every call shows the SDK confirmation modal and signs only after the user
 * approves it. There is no option to skip the modal.
 * Supports both Stellar (rawSign) and Solana (signMessage) based on requested chainType
 */

import { useCallback } from 'react';
import { useSupaContext } from '../providers/SupaProvider';
import { confirmThenSign } from './signing/confirmBeforeSign';
import { useRawHashSigner } from './signing/useRawHashSigner';

export interface SignRawHashModalOptions {
  /**
   * @deprecated Ignored. The SDK always asks the user to confirm before it
   * signs; a caller can no longer suppress the confirmation modal.
   */
  skipModal?: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  rejectText?: string;
  infoText?: string;
  /** Custom content to display instead of auto-generated JSON */
  displayHash?: string;
  /** Show technical details (address, chainType, hash) as JSON. Default: false */
  showTechnicalDetails?: boolean;
}

export interface SignRawHashParams {
  address: string;
  chainType: string;
  hash: `0x${string}`;
}

export interface UseSignRawHashWithModalReturn {
  /** Sign a raw hash after the user approves the confirmation modal */
  signRawHashWithModal: (
    params: SignRawHashParams,
    modalOptions?: SignRawHashModalOptions
  ) => Promise<{ signature: string } | null>;
}

export function useSignRawHashWithModal(): UseSignRawHashWithModalReturn {
  const { signTransactionConfirm, setModalLoading } = useSupaContext();
  const { signRawHashAfterConfirmation } = useRawHashSigner();

  const signRawHashWithModal = useCallback(
    async (
      params: SignRawHashParams,
      modalOptions?: SignRawHashModalOptions
    ): Promise<{ signature: string } | null> => {
      const {
        title = 'Sign Hash',
        description = 'You are about to sign the following hash:',
        confirmText = 'Sign',
        rejectText = 'Reject',
        infoText,
        displayHash,
        showTechnicalDetails = false,
      } = modalOptions || {};

      // Determine what to display
      const transactionDisplay = displayHash
        ? displayHash
        : showTechnicalDetails
          ? JSON.stringify({ address: params.address, chainType: params.chainType, hash: params.hash }, null, 2)
          : params.hash;

      return confirmThenSign(
        () =>
          signTransactionConfirm({
            transaction: transactionDisplay,
            title,
            description,
            confirmText,
            rejectText,
            infoText,
          }),
        async () => {
          // Show loading in modal while signing
          setModalLoading(true);
          try {
            return await signRawHashAfterConfirmation(params);
          } finally {
            setModalLoading(false);
          }
        }
      );
    },
    [signTransactionConfirm, setModalLoading, signRawHashAfterConfirmation]
  );

  return {
    signRawHashWithModal,
  };
}
