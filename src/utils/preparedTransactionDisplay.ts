import type { CantonPrepareTransactionResponseDto } from '../core/types';

/** Build consent copy without allowing caller-supplied text to hide a fee. */
export function preparedTransactionDisplay(
  prepared: CantonPrepareTransactionResponseDto,
  requestedContent?: string,
  showTechnicalDetails = false
): string | undefined {
  const baseContent = requestedContent
    ? requestedContent
    : showTechnicalDetails
      ? undefined
      : `Transaction Hash: ${prepared.hash}`;

  if (!prepared.networkFee) return baseContent;

  return [
    baseContent,
    `Supanova network fee: ${prepared.networkFee.amount} CC`,
    `Paid to: ${prepared.networkFee.receiver}`,
    baseContent ? undefined : `Transaction Hash: ${prepared.hash}`,
  ]
    .filter((line): line is string => Boolean(line))
    .join('\n\n');
}
