/**
 * Wrapper over Privy's signing with automatic confirmation modals
 *
 * Shows a confirmation modal before every signing operation
 * Supports both Stellar (rawSign) and Solana (signMessage) based on requested chainType
 */

import { useCallback, useEffect, useRef } from 'react';
import { useSignRawHash } from '@privy-io/react-auth/extended-chains';
import { useSignMessage as useSolanaSignMessage, useWallets as useSolanaWallets } from '@privy-io/react-auth/solana';
import { useSupaContext } from '../providers/SupaProvider';
import { bytesToHex, hexToBytes, resolveRequestedChainType } from './signing/signingHelpers';

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

export function useSignRawHashWithModal(): UseSignRawHashWithModalReturn {
  const { signTransactionConfirm, setModalLoading, config } = useSupaContext();
  const withExport = config.withExport ?? false;

  // Stellar signing
  const { signRawHash } = useSignRawHash();

  // Solana signing
  const { signMessage: solanaSignMessage } = useSolanaSignMessage();
  const { wallets: solanaWallets } = useSolanaWallets();
  const solanaWalletsRef = useRef(solanaWallets);

  useEffect(() => {
    solanaWalletsRef.current = solanaWallets;
  }, [solanaWallets]);

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

      // Helper function to perform signing
      const performSign = async (): Promise<{ signature: string }> => {
        const resolvedChainType = resolveRequestedChainType(params.chainType, withExport);

        if (resolvedChainType === 'solana') {
          // Solana approach: use signMessage
          let wallet = solanaWalletsRef.current.find(
            (w) => w.address === params.address,
          );
          if (!wallet) {
            // In some environments (notably Telegram WebView), the newly created Solana
            // embedded wallet may not appear in `useWallets()` immediately.
            // Poll for a short time so onboarding flows can sign on the first click.
            const maxAttempts = 30; // 30 * 500ms = 15s max
            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
              await new Promise((r) => setTimeout(r, 500));
              wallet = solanaWalletsRef.current.find(
                (w) => w.address === params.address,
              );
              if (wallet) break;
            }
          }

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
            chainType: 'stellar',
            hash: params.hash,
          });
          return result;
        }
      };

      // Path 1: Show modal, get confirmation, sign with loading state
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
        try {
          const result = await performSign();
          return result;
        } finally {
          setModalLoading(false);
        }
      }

      // Path 2: Sign directly without modal (for automated operations)
      // Errors will propagate to caller for handling
      const result = await performSign();
      return result;
    },
    [
      withExport,
      signRawHash,
      solanaSignMessage,
      signTransactionConfirm,
      setModalLoading,
    ]
  );

  return {
    signRawHashWithModal,
  };
}
