/**
 * Wrapper over Privy's signing with automatic confirmation modals
 *
 * Shows a confirmation modal before every signing operation
 * Supports both Stellar (rawSign) and Solana (signMessage) based on withExport config
 */

import { useCallback } from 'react';
import { useSignRawHash } from '@privy-io/react-auth/extended-chains';
import { useSignMessage as useSolanaSignMessage, useWallets as useSolanaWallets } from '@privy-io/react-auth/solana';
import { useSupaContext } from '../providers/SupaProvider';

export interface SignRawHashModalOptions {
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
  /** Sign a raw hash with confirmation modal */
  signRawHashWithModal: (
    params: SignRawHashParams,
    modalOptions?: SignRawHashModalOptions
  ) => Promise<{ signature: string } | null>;
}

/**
 * Converts hex string to Uint8Array
 */
const hexToBytes = (hex: string): Uint8Array => {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.substr(i * 2, 2), 16);
  }
  return bytes;
};

/**
 * Converts Uint8Array to hex string with 0x prefix
 */
const bytesToHex = (bytes: Uint8Array): string => {
  return '0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
};

export function useSignRawHashWithModal(): UseSignRawHashWithModalReturn {
  const { signTransactionConfirm, setModalLoading, config } = useSupaContext();
  const withExport = config.withExport ?? false;

  // Stellar signing (for withExport: false)
  const { signRawHash } = useSignRawHash();

  // Solana signing (for withExport: true)
  const { signMessage: solanaSignMessage } = useSolanaSignMessage();
  const { wallets: solanaWallets } = useSolanaWallets();

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

      // Show modal if not skipped
      if (!skipModal) {
        const confirmed = await signTransactionConfirm({
          transaction: transactionDisplay,
          title,
          description,
          confirmText,
          rejectText,
          infoText,
        });

        if (!confirmed.confirmed) {
          return null;
        }

        // Show loading in modal while signing
        setModalLoading(true);
      }

      try {
        if (withExport) {
          // Solana approach: use signMessage
          const wallet = solanaWallets.find(w => w.address === params.address);
          if (!wallet) {
            throw new Error(`Wallet not found for address: ${params.address}`);
          }

          const hashBytes = hexToBytes(params.hash);
          const result = await solanaSignMessage({
            message: hashBytes,
            wallet,
            options: {
              uiOptions: {
                showWalletUIs: false,
              },
            },
          });

          return { signature: bytesToHex(result.signature) };
        } else {
          // Stellar approach: use signRawHash
          const result = await signRawHash({
            address: params.address,
            chainType: params.chainType as 'stellar',
            hash: params.hash,
          });
          return result;
        }
      } finally {
        if (!skipModal) {
          setModalLoading(false);
        }
      }
    },
    [withExport, signRawHash, solanaSignMessage, solanaWallets, signTransactionConfirm, setModalLoading]
  );

  return {
    signRawHashWithModal,
  };
}
