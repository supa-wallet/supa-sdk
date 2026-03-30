/**
 * Utilities for working with Canton active contracts.
 * Supports both flat (new) and legacy (wrapped) response formats.
 */

import type {
  CantonActiveContractItem,
  CantonActiveContractItemLegacy,
  CantonNormalizedContract,
} from '../core/types';

/**
 * Type guard: checks if item is in legacy wrapped format
 */
export function isLegacyContractItem(
  item: CantonActiveContractItem
): item is CantonActiveContractItemLegacy {
  return 'contractEntry' in item && item.contractEntry != null;
}

/**
 * Normalizes a contract item from either format into a consistent shape.
 */
export function normalizeContractItem(
  item: CantonActiveContractItem
): CantonNormalizedContract {
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
