import type { CantonPrepareTransactionResponseDto } from '../core/types';

function formatCommands(commands: unknown): string | undefined {
  if (commands === undefined || commands === null) return undefined;
  try {
    return JSON.stringify(commands, null, 2);
  } catch {
    return String(commands);
  }
}

/**
 * Build consent copy for a prepared transaction.
 *
 * The commands the hash represents are always shown, whatever the caller passes:
 * the wallet-decorated `effectiveCommands` when the backend returns them, else the
 * commands the caller submitted for preparation. Caller-supplied text is shown as
 * an extra note above them and can neither replace the commands nor hide a fee.
 */
export function preparedTransactionDisplay(
  prepared: CantonPrepareTransactionResponseDto,
  requestedContent?: string,
  _showTechnicalDetails = false,
  submittedCommands?: unknown
): string {
  const commands = formatCommands(prepared.effectiveCommands ?? submittedCommands);

  return [
    requestedContent,
    commands ? `Commands to sign:\n${commands}` : 'Commands to sign: not provided by the wallet backend',
    prepared.networkFee ? `Supanova wallet transaction fee: ${prepared.networkFee.amount} CC` : undefined,
    prepared.networkFee ? `Paid to: ${prepared.networkFee.receiver}` : undefined,
    `Transaction Hash: ${prepared.hash}`,
  ]
    .filter((line): line is string => Boolean(line))
    .join('\n\n');
}
