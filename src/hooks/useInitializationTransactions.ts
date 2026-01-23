/**
 * Initialization transactions hook
 *
 * Flow:
 * 1) POST /canton/api/prepare_initialization_transactions -> 0..N prepared txs
 * 2) Sign each hash silently (no UI)
 * 3) Submit all (preferred: /canton/api/submit_multiple_prepared; fallback: parallel submit_prepared)
 */

import { useCallback, useState } from 'react';
import { useSupaContext } from '../providers/SupaProvider';
import { useCantonWallet } from './useCantonWallet';
import { useSignRawHashWithModal } from './useSignRawHashWithModal';
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
  const { cantonService, config } = useSupaContext();
  const { cantonWallet } = useCantonWallet();
  const { signRawHashWithModal } = useSignRawHashWithModal();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const clearError = useCallback(() => setError(null), []);

  const runInitializationTransactions = useCallback(async (): Promise<CantonSubmitMultipleResultDto[]> => {
    console.log('[Init Txs] Starting initialization transactions...');
    if (!cantonWallet) {
      const e = new Error('No Canton wallet found. Please create one first.');
      setError(e);
      throw e;
    }

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

      const chainType = config.withExport ? 'solana' : 'stellar';
      console.log('[Init Txs] Chain type:', chainType);

      // Sign sequentially to avoid wallet/provider concurrency issues.
      const signedTxs: CantonSubmitRegisterRequestDto[] = [];
      for (const tx of prepared) {
        console.log('[Init Txs] Signing transaction:', tx.hash);
        const hashHex = base64ToHex(tx.hash);
        const signResult = await signRawHashWithModal(
          { address: cantonWallet.address, chainType, hash: hashHex as `0x${string}` },
          { skipModal: true }
        );

        if (!signResult) {
          console.error('[Init Txs] User rejected signature');
          throw new Error('User rejected initialization transaction signature');
        }

        console.log('[Init Txs] Transaction signed successfully');
        signedTxs.push({
          hash: tx.hash,
          signature: hexToBase64(signResult.signature),
        });
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
  }, [cantonWallet, cantonService, config.withExport, signRawHashWithModal]);

  return { runInitializationTransactions, loading, error, clearError };
}

