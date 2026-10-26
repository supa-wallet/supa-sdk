/**
 * Batch transaction sending with a single confirmation modal.
 *
 * Flow:
 * 1) Prepare each transaction via /canton/api/prepare_transaction
 * 2) Show ONE modal listing N transactions with their decoded commands (always)
 * 3) After approval, sign each listed hash sequentially (no extra SDK modals)
 * 4) Submit all signatures in one call (preferred: submit_multiple_prepared; fallback: individual submits)
 * 5) Wait for completion for each successful submissionId
 */

import { useCallback, useState } from 'react';
import { useSupaContext } from '../providers/SupaProvider';
import { useCantonContext } from '../providers/CantonProvider';
import { useCantonWallet } from './useCantonWallet';
import { useRawHashSigner } from './signing/useRawHashSigner';
import { confirmThenSign } from './signing/confirmBeforeSign';
import { base64ToHex, hexToBase64 } from '../utils/converters';
import type {
  CantonPrepareTransactionResponseDto,
  CantonQueryCompletionResponseDto,
  CantonSubmitMultipleResultDto,
  CantonSubmitRegisterRequestDto,
} from '../core/types';
import type { CantonSubmitPreparedOptions } from '../services/cantonService';
import { pollUntilCompleted } from '../utils/polling';
import type { CantonWallet } from '../utils/wallet';
import { isUserWalletRejection, toErrorMessage } from '../utils/walletRejection';
import { CantonTransactionRejectedError } from '../core/errors';
import { preparedTransactionDisplay } from '../utils/preparedTransactionDisplay';

export interface TransactionToSend {
  commands: unknown;
  disclosedContracts?: unknown;
  /** Optional command ID for idempotency */
  commandId?: string;
}

export interface SendMultipleTransactionsOptions {
  onSuccess?: (results: CantonQueryCompletionResponseDto[]) => void;
  onRejection?: () => void;
  onError?: (error: Error) => void;
  /**
   * @deprecated Ignored. The SDK always shows one confirmation listing every
   * transaction, with its decoded commands, before it signs any of them.
   */
  skipModal?: boolean;
  modalTitle?: string;
  modalDescription?: string;
  modalConfirmText?: string;
  modalRejectText?: string;
  /** Show technical transaction details (commands, disclosedContracts, hash) as JSON. Default: false */
  showTechnicalDetails?: boolean;
  /** Optional deduplication period (shared across all transactions in the batch) */
  deduplicationPeriod?: any;
  submitOptions?: CantonSubmitPreparedOptions;
}

export interface UseSendMultipleTransactionsReturn {
  /** Sign and send multiple Canton transactions with a single confirmation modal */
  sendMultipleTransactions: (
    txs: TransactionToSend[],
    options?: SendMultipleTransactionsOptions
  ) => Promise<CantonQueryCompletionResponseDto[] | null>;
  loading: boolean;
  error: Error | null;
  clearError: () => void;
  cantonWallets: CantonWallet[];
  cantonWallet: CantonWallet | null;
}

function txLabel(index0: number, hash?: string): string {
  const n = index0 + 1;
  return hash ? `tx #${n} (${hash})` : `tx #${n}`;
}

async function waitForCompletionWithDetails(params: {
  queryCompletion: (submissionId: string) => Promise<CantonQueryCompletionResponseDto>;
  submissionId: string;
  label: string;
  options?: CantonSubmitPreparedOptions;
}): Promise<CantonQueryCompletionResponseDto> {
  const { queryCompletion, submissionId, label, options } = params;
  return pollUntilCompleted({
    queryCompletion,
    submissionId,
    label,
    timeout: options?.timeout,
    pollInterval: options?.pollInterval,
  });
}

export function useSendMultipleTransactions(): UseSendMultipleTransactionsReturn {
  const { cantonService, signTransactionConfirm } = useSupaContext();
  const { signRawHashAfterConfirmation } = useRawHashSigner();
  const { cantonWallet, cantonWallets } = useCantonWallet();
  const { resolveSigningWallet } = useCantonContext();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const clearError = useCallback(() => setError(null), []);

  const sendMultipleTransactions = useCallback(
    async (txs: TransactionToSend[], options?: SendMultipleTransactionsOptions): Promise<CantonQueryCompletionResponseDto[] | null> => {
      const {
        onSuccess,
        onRejection,
        onError,
        modalTitle = 'Sign Multiple Transactions',
        modalDescription,
        modalConfirmText = 'Sign & Send',
        modalRejectText = 'Reject',
        showTechnicalDetails = false,
        deduplicationPeriod,
        submitOptions,
      } = options || {};

      if (!Array.isArray(txs) || txs.length === 0) {
        const err = new Error('No transactions provided.');
        setError(err);
        onError?.(err);
        return null;
      }

      setError(null);
      setLoading(true);

      try {
        const { wallet: signingWallet, chainType: signingChainType } = await resolveSigningWallet();

        // Step 1: Prepare (parallel, but we want good error messages)
        const prepareResults = await Promise.allSettled(
          txs.map((t) => cantonService.prepareTransaction(t.commands, t.disclosedContracts, t.commandId))
        );

        const prepared: CantonPrepareTransactionResponseDto[] = [];
        const prepareFailures: Array<{ index: number; error: string }> = [];
        prepareResults.forEach((r, idx) => {
          if (r.status === 'fulfilled') prepared[idx] = r.value;
          else prepareFailures.push({ index: idx, error: toErrorMessage(r.reason) });
        });

        if (prepareFailures.length) {
          const first = prepareFailures[0]!;
          throw new Error(
            `Failed to prepare ${prepareFailures.length}/${txs.length} transactions. First failure at ${txLabel(first.index)}: ${first.error}`
          );
        }

        // Step 2: Build display list for the confirmation modal
        const displayItems = prepared.map((p, idx) => {
          const original = txs[idx];
          if (!showTechnicalDetails) {
            return preparedTransactionDisplay(p, undefined, false, original?.commands);
          }
          return JSON.stringify(
            {
              index: idx + 1,
              hash: p.hash,
              commands: p.effectiveCommands ?? original?.commands,
              disclosedContracts: original?.disclosedContracts,
              networkFee: p.networkFee,
            },
            null,
            2
          );
        });

        // Step 3 + 4: Confirm once (show list + count), always. Only after the
        // user approves, sign each listed hash sequentially to avoid wallet/provider
        // concurrency issues. Signer was resolved at the top of `try` via Canton
        // pubkey match so every tx in the batch is signed with the same key the
        // backend prepared against.
        const count = prepared.length;
        const signedTxs = await confirmThenSign(
          () =>
            signTransactionConfirm({
              transaction: displayItems,
              title: modalTitle,
              description: modalDescription ?? `You are about to sign ${count} transactions.`,
              confirmText: modalConfirmText,
              rejectText: modalRejectText,
              infoText: 'You are submitting transactions, please be careful',
            }),
          async () => {
            const signed: CantonSubmitRegisterRequestDto[] = [];
            for (let i = 0; i < prepared.length; i++) {
              const p = prepared[i]!;
              try {
                const signResult = await signRawHashAfterConfirmation({
                  address: signingWallet.address,
                  chainType: signingChainType,
                  hash: base64ToHex(p.hash) as `0x${string}`,
                });
                signed.push({
                  hash: p.hash,
                  signature: hexToBase64(signResult.signature),
                  ...(deduplicationPeriod && { deduplicationPeriod }),
                });
              } catch (e) {
                if (isUserWalletRejection(e)) {
                  return null;
                }
                throw new Error(`Failed to sign ${txLabel(i, p.hash)}: ${toErrorMessage(e)}`);
              }
            }
            return signed;
          }
        );

        if (!signedTxs) {
          onRejection?.();
          return null;
        }

        // Step 5: Submit batch (preferred) with fallback
        let submitResults: CantonSubmitMultipleResultDto[];
        try {
          submitResults = await cantonService.submitMultiplePrepared(signedTxs);
        } catch (e) {
          // Fallback: submit individually, but keep mapping back to indices
          const results = await Promise.allSettled(
            signedTxs.map(async (t) => {
              const res = await cantonService.submitPrepared(t.hash, t.signature, t.deduplicationPeriod);
              return { hash: t.hash, success: true as const, submissionId: res.submissionId };
            })
          );

          submitResults = results.map((r, i) => {
            const hash = signedTxs[i]?.hash ?? '';
            if (r.status === 'fulfilled') return r.value;
            return { hash, success: false, error: toErrorMessage(r.reason) };
          });
        }

        const failedSubmits = submitResults
          .map((r, idx) => ({ r, idx }))
          .filter(({ r }) => !r.success);

        if (failedSubmits.length) {
          const details = failedSubmits
            .slice(0, 3)
            .map(({ r, idx }) => `${txLabel(idx, r.hash)}: ${r.error ?? 'Unknown error'}`)
            .join('; ');
          const suffix = failedSubmits.length > 3 ? ` (+${failedSubmits.length - 3} more)` : '';
          throw new Error(`Failed to submit ${failedSubmits.length}/${submitResults.length} transactions: ${details}${suffix}`);
        }

        // Step 6: Wait for completion (parallel, but keep good error messages)
        const completionResults = await Promise.allSettled(
          submitResults.map((r, idx) => {
            const submissionId = r.submissionId;
            if (!submissionId) {
              return Promise.reject(new Error(`Missing submissionId for ${txLabel(idx, r.hash)}`));
            }
            return waitForCompletionWithDetails({
              queryCompletion: (id) => cantonService.queryCompletion(id),
              submissionId,
              label: txLabel(idx, r.hash),
              options: submitOptions,
            });
          })
        );

        const completions: CantonQueryCompletionResponseDto[] = [];
        const completionFailures: Array<{ index: number; error: string }> = [];
        completionResults.forEach((r, idx) => {
          if (r.status === 'fulfilled') completions[idx] = r.value;
          else completionFailures.push({ index: idx, error: toErrorMessage(r.reason) });
        });

        if (completionFailures.length) {
          const first = completionFailures[0]!;
          throw new Error(
            `Failed to wait for completion for ${completionFailures.length}/${submitResults.length} transactions. First failure at ${txLabel(
              first.index,
              submitResults[first.index]?.hash
            )}: ${first.error}`
          );
        }

        onSuccess?.(completions);
        return completions;
      } catch (err) {
        if (err instanceof CantonTransactionRejectedError) {
          setError(err);
          onError?.(err);
          return null;
        }
        if (isUserWalletRejection(err)) {
          onRejection?.();
        } else {
          const e = new Error(`Failed to send multiple transactions: ${toErrorMessage(err)}`);
          setError(e);
          onError?.(e);
        }
        return null;
      } finally {
        setLoading(false);
      }
    },
    [cantonService, resolveSigningWallet, signRawHashAfterConfirmation, signTransactionConfirm]
  );

  return { sendMultipleTransactions, loading, error, clearError, cantonWallets, cantonWallet };
}
