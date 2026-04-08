/**
 * Utilities for working with Canton active contracts.
 * Supports both flat (new) and legacy (wrapped) response formats.
 */

/**
 * Type guard: checks if item is in legacy wrapped format
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isLegacyContractItem(item: any): boolean {
  return 'contractEntry' in item && item.contractEntry != null;
}

/**
 * Normalizes a contract item from either format into a consistent shape.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeContractItem(item: any): any {
  if (isLegacyContractItem(item)) {
    const event = item.contractEntry.JsActiveContract.createdEvent;
    return {
      contractId: event.contractId,
      templateId: event.templateId,
      createArgument: event.createArgument,
      createdEventBlob: event.createdEventBlob,
      createdAt: event.createdAt,
    };
  }

  return {
    contractId: item.contractId,
    templateId: item.templateId,
    createArgument: item.createArgument,
    createdEventBlob: item.createdEventBlob,
    createdAt: null,
  };
}
