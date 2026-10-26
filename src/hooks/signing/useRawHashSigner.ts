/**
 * INTERNAL. Signs a raw hash with the embedded Privy key and shows no UI.
 *
 * Not exported from the package entry point. Every caller must show the user a
 * confirmation for the exact hashes it signs first: `useSignRawHashWithModal`
 * does this per hash via `confirmThenSign`; the batch hooks show one confirmation
 * listing every transaction and then sign each listed hash.
 */

import { useCallback, useEffect, useRef } from 'react';
import { useSignRawHash } from '@privy-io/react-auth/extended-chains';
import { useSignMessage as useSolanaSignMessage, useWallets as useSolanaWallets } from '@privy-io/react-auth/solana';
import { useSupaContext } from '../../providers/SupaProvider';
import { bytesToHex, hexToBytes, resolveRequestedChainType } from './signingHelpers';

export interface RawHashSignParams {
  address: string;
  chainType: string;
  hash: `0x${string}`;
}

export function useRawHashSigner(): {
  signRawHashAfterConfirmation: (params: RawHashSignParams) => Promise<{ signature: string }>;
} {
  const { config } = useSupaContext();
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

  const signRawHashAfterConfirmation = useCallback(
    async (params: RawHashSignParams): Promise<{ signature: string }> => {
      const resolvedChainType = resolveRequestedChainType(params.chainType, withExport);

      if (resolvedChainType === 'solana') {
        // Solana approach: use signMessage
        let wallet = solanaWalletsRef.current.find((w) => w.address === params.address);
        if (!wallet) {
          // In some environments (notably Telegram WebView), the newly created Solana
          // embedded wallet may not appear in `useWallets()` immediately.
          // Poll for a short time so onboarding flows can sign on the first click.
          const maxAttempts = 30; // 30 * 500ms = 15s max
          for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            await new Promise((r) => setTimeout(r, 500));
            wallet = solanaWalletsRef.current.find((w) => w.address === params.address);
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
      }

      // Stellar approach: use signRawHash
      return signRawHash({
        address: params.address,
        chainType: 'stellar',
        hash: params.hash,
      });
    },
    [withExport, signRawHash, solanaSignMessage]
  );

  return { signRawHashAfterConfirmation };
}
