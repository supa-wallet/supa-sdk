/**
 * The one rule every SDK signing path follows: the user sees a confirmation and
 * approves it before the key signs. There is no option that skips this step.
 */

export interface ConfirmationResult {
  confirmed: boolean;
}

/**
 * Show `confirm`, and call `sign` only when the user explicitly approved.
 * Returns null when the user rejected or closed the prompt.
 */
export async function confirmThenSign<T>(
  confirm: () => Promise<ConfirmationResult>,
  sign: () => Promise<T>
): Promise<T | null> {
  const result = await confirm();
  if (!result || result.confirmed !== true) {
    return null;
  }
  return sign();
}
