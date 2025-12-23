/**
 * Wrapper over Privy's signRawHash with automatic confirmation modals
 * 
 * Shows a confirmation modal before every raw hash signing operation
 */

import { useCallback } from 'react';
import { useSignRawHash } from '@privy-io/react-auth/extended-chains';
import { useSupaContext } from '../providers/SupaProvider';

export interface SignRawHashModalOptions {
  skipModal?: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  rejectText?: string;
  /** Custom content to display instead of auto-generated JSON */
  displayHash?: string;
  /** Show technical details (address, chainType, hash) as JSON. Default: false */
  showTechnicalDetails?: boolean;
}

type SignRawHashParams = Parameters<ReturnType<typeof useSignRawHash>['signRawHash']>[0];

export interface UseSignRawHashWithModalReturn {
  /** Sign a raw hash with confirmation modal */
  signRawHashWithModal: (
    params: SignRawHashParams,
    modalOptions?: SignRawHashModalOptions
  ) => Promise<{ signature: string } | null>;
}

export function useSignRawHashWithModal(): UseSignRawHashWithModalReturn {
  const { signTransactionConfirm, setModalLoading } = useSupaContext();
  const { signRawHash } = useSignRawHash();

  const signRawHashWithModal = useCallback(
    async (
      params: SignRawHashParams,
      modalOptions?: SignRawHashModalOptions
    ): Promise<{ signature: string } | null> => {
      const {
        skipModal = false,
        title = 'Sign Hash',
        description = 'You are about to sign the following hash:',
        confirmText = 'Sign',
        rejectText = 'Reject',
        displayHash,
        showTechnicalDetails = false,
      } = modalOptions || {};

      // Skip modal if requested
      if (skipModal) {
        const result = await signRawHash(params);
        return result;
      }

      // Determine what to display
      const transactionDisplay = displayHash 
        ? displayHash 
        : showTechnicalDetails
          ? JSON.stringify({ address: params.address, chainType: params.chainType, hash: params.hash }, null, 2)
          : params.hash;

      const confirmed = await signTransactionConfirm({
        transaction: transactionDisplay,
        title,
        description,
        confirmText,
        rejectText,
      });

      if (!confirmed.confirmed) {
        return null;
      }

      // Show loading in modal while signing
      setModalLoading(true);

      try {
        const result = await signRawHash(params);
        return result;
      } finally {
        setModalLoading(false);
      }
    },
    [signRawHash, signTransactionConfirm, setModalLoading]
  );

  return {
    signRawHashWithModal,
  };
}
