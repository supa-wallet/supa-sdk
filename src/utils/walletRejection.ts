import { CantonTransactionRejectedError } from '../core/errors';

export function toErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

// Matches wallet-modal dismissal only. Bare 'rejected' deliberately excluded
// — it would swallow CantonTransactionRejectedError and re-introduce the old bug.
export function isUserWalletRejection(err: unknown): boolean {
  if (err instanceof CantonTransactionRejectedError) return false;
  const msg = toErrorMessage(err).toLowerCase();
  return (
    msg.includes('user rejected') ||
    msg.includes('user denied') ||
    msg.includes('cancelled') ||
    msg.includes('canceled') ||
    msg.includes('denied')
  );
}
