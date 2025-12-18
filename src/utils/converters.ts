/**
 * Utilities for converting between hex and base64 formats
 * Required for Canton Network integration (Canton uses base64, Privy uses hex)
 */

/**
 * Convert hex string to base64
 * @param hex Hex string (with or without 0x prefix)
 * @returns Base64 string
 */
export function hexToBase64(hex: string): string {
  // Remove 0x prefix if present
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  
  // Convert hex to bytes
  const bytes = new Uint8Array(
    cleanHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
  );
  
  // Convert bytes to base64
  return bytesToBase64(bytes);
}

/**
 * Convert base64 string to hex
 * @param base64 Base64 string
 * @returns Hex string with 0x prefix
 */
export function base64ToHex(base64: string): string {
  const bytes = base64ToBytes(base64);
  return '0x' + Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert Uint8Array to base64
 * @param bytes Byte array
 * @returns Base64 string
 */
export function bytesToBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

/**
 * Convert base64 to Uint8Array
 * @param base64 Base64 string
 * @returns Byte array
 */
export function base64ToBytes(base64: string): Uint8Array {
  const binaryString = atob(base64.replace(/\s/g, ''));
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Remove leading 00 byte from hex string if present
 * Required for Stellar public keys from Privy
 * @param hex Hex string (with or without 0x prefix)
 * @returns Clean hex string with 0x prefix
 */
export function stripLeadingZero(hex: string): string {
  let cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  
  // Remove leading 00 byte if present
  if (cleanHex.startsWith('00')) {
    cleanHex = cleanHex.slice(2);
  }
  
  return '0x' + cleanHex;
}

/**
 * Convert Privy public key (hex with leading 00) to Canton format (base64 without leading 00)
 * @param publicKeyHex Public key in hex format from Privy
 * @returns Public key in base64 format for Canton
 */
export function privyPublicKeyToCantonBase64(publicKeyHex: string): string {
  // Remove 0x prefix if present
  let hexString = publicKeyHex.startsWith('0x') ? publicKeyHex.slice(2) : publicKeyHex;
  
  // Remove leading '00' byte if present (Stellar public keys from Privy include this)
  if (hexString.startsWith('00')) {
    hexString = hexString.slice(2);
  }
  
  try {
    // Convert hex to bytes
    const bytes = new Uint8Array(
      hexString.match(/.{1,2}/g)!.map((byte: string) => parseInt(byte, 16))
    );
    
    // Convert bytes to base64
    return btoa(String.fromCharCode(...bytes));
  } catch (e) {
    throw new Error('Failed to convert public key to base64');
  }
}

