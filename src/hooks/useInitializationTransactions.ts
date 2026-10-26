/**
 * Initialization transactions hook
 *
 * Flow:
 * 1) POST /canton/api/prepare_initialization_transactions -> 0..N prepared txs
 * 2) Show one confirmation listing every prepared tx; after approval sign each listed hash
 * 3) Submit all (preferred: /canton/api/submit_multiple_prepared; fallback: parallel submit_prepared)
 */

import { useCallback, useState } from 'react';
import { useSupaContext } from '../providers/SupaProvider';
import { useCantonContext } from '../providers/CantonProvider';
import { useRawHashSigner } from './signing/useRawHashSigner';
import { confirmThenSign } from './signing/confirmBeforeSign';
import { preparedTransactionDisplay } from '../utils/preparedTransactionDisplay';
import { base64ToHex, hexToBase64 } from '../utils/converters';
import type { CantonSubmitMultipleResultDto, CantonSubmitRegisterRequestDto } from '../core/types';

export interface UseInitializationTransactionsReturn {
  runInitializationTransactions: () => Promise<CantonSubmitMultipleResultDto[]>;
  /** Внутренний лоадер хука; приложения могут его игнорировать, чтобы не блокировать UI */
  loading: boolean;
  /** Последняя ошибка хука; приложения могут игнорировать и обрабатывать ошибку на уровне вызова */
  error: Error | null;
  clearError: () => void;
}

export function useInitializationTransactions(): UseInitializationTransactionsReturn {
  const { cantonService, signTransactionConfirm } = useSupaContext();
  const { resolveSigningWallet } = useCantonContext();
  const { signRawHashAfterConfirmation } = useRawHashSigner();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const clearError = useCallback(() => setError(null), []);

  const runInitializationTransactions = useCallback(async (): Promise<CantonSubmitMultipleResultDto[]> => {
    console.log('[Init Txs] Starting initialization transactions...');

    setLoading(true);
    setError(null);

    try {
      console.log('[Init Txs] Preparing transactions...');
      const prepared = await cantonService.prepareInitializationTransactions();
      console.log('[Init Txs] Prepared transactions:', prepared);
      if (!prepared.length) {
        console.log('[Init Txs] No transactions to initialize');
        return [];
      }

      const { wallet: signingWallet, chainType: signingChainType } = await resolveSigningWallet();
      console.log('[Init Txs] Signing wallet:', signingWallet.address, 'chain:', signingChainType);

      // One confirmation for the whole set, then sign sequentially to avoid
      // wallet/provider concurrency issues.
      const signedTxs = await confirmThenSign(
        () =>
          signTransactionConfirm({
            transaction: prepared.map((tx) => preparedTransactionDisplay(tx)),
            title: 'Set Up Your Wallet',
            description: `Sign ${prepared.length} setup transaction${prepared.length === 1 ? '' : 's'} for your wallet.`,
            confirmText: 'Sign & Send',
            rejectText: 'Cancel',
            infoText: 'Review what each transaction does before you sign.',
          }),
        async () => {
          const signed: CantonSubmitRegisterRequestDto[] = [];
          for (const tx of prepared) {
            console.log('[Init Txs] Signing transaction:', tx.hash);
            const signResult = await signRawHashAfterConfirmation({
              address: signingWallet.address,
              chainType: signingChainType,
              hash: base64ToHex(tx.hash) as `0x${string}`,
            });
            console.log('[Init Txs] Transaction signed successfully');
            signed.push({
              hash: tx.hash,
              signature: hexToBase64(signResult.signature),
            });
          }
          return signed;
        }
      );

      if (!signedTxs) {
        console.error('[Init Txs] User rejected signature');
        throw new Error('User rejected initialization transaction signature');
      }

      // Preferred: single submit_multiple_prepared call
      console.log('[Init Txs] Submitting all transactions...');
      try {
        const result = await cantonService.submitMultiplePrepared(signedTxs);
        console.log('[Init Txs] ✅ All transactions submitted:', result);
        return result;
      } catch (e: any) {
        console.warn('[Init Txs] Batch submit failed, trying individual submits:', e);
        // Fallback: submit each prepared in parallel
        const results = await Promise.allSettled(
          signedTxs.map(async (t) => {
            const res = await cantonService.submitPrepared(t.hash, t.signature);
            return { hash: t.hash, submissionId: res.submissionId };
          })
        );

        const finalResults = results.map((r, i) => {
          const hash = signedTxs[i]?.hash ?? '';
          if (r.status === 'fulfilled') {
            return { hash, success: true, submissionId: r.value.submissionId };
          }
          return { hash, success: false, error: r.reason?.message ?? String(r.reason ?? 'Unknown error') };
        });
        console.log('[Init Txs] ✅ Individual submits completed:', finalResults);
        return finalResults;
      }
    } catch (err: any) {
      console.error('[Init Txs] ❌ Error:', err);
      const e = new Error(`Failed to run initialization transactions: ${err.message ?? String(err)}`);
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [cantonService, resolveSigningWallet, signRawHashAfterConfirmation, signTransactionConfirm]);

  return { runInitializationTransactions, loading, error, clearError };
}

