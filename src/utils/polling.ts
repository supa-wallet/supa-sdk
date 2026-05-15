import type { CantonQueryCompletionResponseDto } from '../core/types';
import { CantonTransactionRejectedError } from '../core/errors';

/** Default timeout (ms) to wait for transaction completion */
export const DEFAULT_COMPLETION_TIMEOUT_MS = 60_000;
/** Default polling interval (ms) while waiting for completion */
export const DEFAULT_COMPLETION_POLL_INTERVAL_MS = 1_000;

export interface PollUntilCompletedParams {
  queryCompletion: (submissionId: string) => Promise<CantonQueryCompletionResponseDto>;
  submissionId: string;
  timeout?: number;
  pollInterval?: number;
  /** Optional human-readable label included in timeout error message */
  label?: string;
}

/**
 * Poll `queryCompletion` until status === 'completed' or timeout elapses.
 * Skips the trailing sleep if the next iteration would exceed the timeout.
 */
export async function pollUntilCompleted(
  params: PollUntilCompletedParams
): Promise<CantonQueryCompletionResponseDto> {
  const {
    queryCompletion,
    submissionId,
    timeout = DEFAULT_COMPLETION_TIMEOUT_MS,
    pollInterval = DEFAULT_COMPLETION_POLL_INTERVAL_MS,
    label,
  } = params;

  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const response = await queryCompletion(submissionId);
    if (response.status === 'rejected') {
      const reason =
        typeof response.data?.reason === 'string' ? response.data.reason : undefined;
      const msg = response.message ?? reason ?? 'Transaction rejected';
      throw new CantonTransactionRejectedError(msg, submissionId, reason, response.data);
    }
    if (response.status === 'completed') return response;
    if (Date.now() - startTime + pollInterval >= timeout) break;
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }

  const ctx = label ? ` for ${label}` : '';
  throw new Error(
    `Timeout waiting for completion${ctx} after ${timeout}ms (submissionId: ${submissionId})`
  );
}
