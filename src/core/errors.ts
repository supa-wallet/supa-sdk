export class CantonTransactionRejectedError extends Error {
  override readonly name = 'CantonTransactionRejectedError';
  constructor(
    message: string,
    readonly submissionId: string,
    readonly reason: string | undefined,
    readonly data: Record<string, unknown> | null | undefined,
  ) {
    super(message);
  }
}
