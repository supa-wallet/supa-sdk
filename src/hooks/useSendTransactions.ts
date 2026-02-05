/**
 * @deprecated Use `useSendMultipleTransactions` instead.
 *
 * This file is kept as a backwards-compatible alias to avoid breaking existing users.
 */

import { useSendMultipleTransactions } from './useSendMultipleTransactions';
import type {
  SendMultipleTransactionsOptions,
  TransactionToSend,
  UseSendMultipleTransactionsReturn,
} from './useSendMultipleTransactions';
import type { CantonQueryCompletionResponseDto } from '../core/types';

export type SendTransactionsOptions = SendMultipleTransactionsOptions;

export interface UseSendTransactionsReturn {
  /** Sign and send multiple Canton transactions with a single confirmation modal */
  sendTransactions: (
    txs: TransactionToSend[],
    options?: SendTransactionsOptions
  ) => Promise<CantonQueryCompletionResponseDto[] | null>;
  loading: boolean;
  error: Error | null;
  clearError: () => void;
  cantonWallets: UseSendMultipleTransactionsReturn['cantonWallets'];
  cantonWallet: UseSendMultipleTransactionsReturn['cantonWallet'];
}

export function useSendTransactions(): UseSendTransactionsReturn {
  const { sendMultipleTransactions, loading, error, clearError, cantonWallets, cantonWallet } =
    useSendMultipleTransactions();

  const sendTransactions: UseSendTransactionsReturn['sendTransactions'] = (txs, options) =>
    sendMultipleTransactions(txs, options);

  return { sendTransactions, loading, error, clearError, cantonWallets, cantonWallet };
}
