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
    if (!cantonWallet) {
      const e = new Error('No Canton wallet found. Please create one first.');
      setError(e);
      throw e;
    }

    setLoading(true);
    setError(null);

    try {
      const prepared = await cantonService.prepareInitializationTransactions();
      if (!prepared.length) {
        return [];
      }

      const chainType = config.withExport ? 'solana' : 'stellar';

      // Sign sequentially to avoid wallet/provider concurrency issues.
      const signedTxs: CantonSubmitRegisterRequestDto[] = [];
      for (const tx of prepared) {
        const hashHex = base64ToHex(tx.hash);
        const signResult = await signRawHashWithModal(
          { address: cantonWallet.address, chainType, hash: hashHex as `0x${string}` },
          { skipModal: true }
        );

        if (!signResult) {
          throw new Error('User rejected initialization transaction signature');
        }

        signedTxs.push({
          hash: tx.hash,
          signature: hexToBase64(signResult.signature),
        });
      }

      // Preferred: single submit_multiple_prepared call
      try {
        return await cantonService.submitMultiplePrepared(signedTxs);
      } catch (e: any) {
        // Fallback: submit each prepared in parallel
        const results = await Promise.allSettled(
          signedTxs.map(async (t) => {
            const res = await cantonService.submitPrepared(t.hash, t.signature);
            return { hash: t.hash, submissionId: res.submissionId };
          })
        );

        return results.map((r, i) => {
          const hash = signedTxs[i]?.hash ?? '';
          if (r.status === 'fulfilled') {
            return { hash, success: true, submissionId: r.value.submissionId };
          }
          return { hash, success: false, error: r.reason?.message ?? String(r.reason ?? 'Unknown error') };
        });
      }
    } catch (err: any) {
      const e = new Error(`Failed to run initialization transactions: ${err.message ?? String(err)}`);
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [cantonWallet, cantonService, config.withExport, signRawHashWithModal]);

  return { runInitializationTransactions, loading, error, clearError };
}

