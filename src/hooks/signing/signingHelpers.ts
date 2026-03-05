/**
 * Shared helpers for hash-signing flows.
 */

export type SigningChainType = 'stellar' | 'solana';

export const resolveRequestedChainType = (
  chainType: string,
  withExportFallback: boolean,
): SigningChainType => {
  if (chainType === 'solana') {
    return 'solana';
  }

  if (chainType === 'stellar') {
    return 'stellar';
  }

  return withExportFallback ? 'solana' : 'stellar';
};

export const hexToBytes = (hex: string): Uint8Array => {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes = new Uint8Array(cleanHex.length / 2);

  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.substr(i * 2, 2), 16);
  }

  return bytes;
};

export const bytesToHex = (bytes: Uint8Array): string => {
  return '0x' + Array.from(bytes).map(byte => byte.toString(16).padStart(2, '0')).join('');
};
