/**
 * Utilities for converting between hex and base64 formats
 * Required for Canton Network integration (Canton uses base64, Privy uses hex)
 */

/**
 * Converts hex string to base64 format
 * @param hex - Hex string (with or without 0x prefix)
 * @returns Base64 encoded string
 * @example
 * ```ts
 * const base64 = hexToBase64('0x48656c6c6f');
 * console.log(base64); // "SGVsbG8="
 * ```
 */
export const hexToBase64 = (hex: string): string => {
  // Remove 0x prefix if present
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  
  // Convert hex to bytes
  const bytes = new Uint8Array(
    cleanHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
  );
  
  // Convert bytes to base64
  return bytesToBase64(bytes);
};

/**
 * Converts base64 string to hex format
 * @param base64 - Base64 encoded string
 * @returns Hex string with 0x prefix
 * @example
 * ```ts
 * const hex = base64ToHex('SGVsbG8=');
 * console.log(hex); // "0x48656c6c6f"
 * ```
 */
export const base64ToHex = (base64: string): string => {
  const bytes = base64ToBytes(base64);
  return '0x' + Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Converts Uint8Array to base64 string
 * @param bytes - Byte array to convert
 * @returns Base64 encoded string
 */
export const bytesToBase64 = (bytes: Uint8Array): string => {
  return btoa(String.fromCharCode(...bytes));
};

/**
 * Converts base64 string to Uint8Array
 * @param base64 - Base64 encoded string
 * @returns Byte array
 */
export const base64ToBytes = (base64: string): Uint8Array => {
  const binaryString = atob(base64.replace(/\s/g, ''));
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

/**
 * Removes leading 00 byte from hex string if present
 * Required for Stellar public keys from Privy which include a leading 00 byte
 * @param hex - Hex string (with or without 0x prefix)
 * @returns Clean hex string with 0x prefix
 * @example
 * ```ts
 * const clean = stripLeadingZero('0x00e95cb2553361ed...');
 * console.log(clean); // "0xe95cb2553361ed..."
 * ```
 */
export const stripLeadingZero = (hex: string): string => {
  let cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  
  // Remove leading 00 byte if present
  if (cleanHex.startsWith('00')) {
    cleanHex = cleanHex.slice(2);
  }
  
  return '0x' + cleanHex;
};

/**
 * Converts Privy public key (hex with leading 00) to Canton format (base64 without leading 00)
 * This function handles the conversion from Privy's Stellar wallet public key format
 * to Canton Network's expected base64 format.
 * 
 * @param publicKeyHex - Public key in hex format from Privy (may include 0x prefix and leading 00)
 * @returns Public key in base64 format for Canton Network
 * @throws {Error} If conversion fails
 * 
 * @example
 * ```ts
 * const wallet = { publicKey: '00e95cb2553361ed...' };
 * const cantonKey = privyPublicKeyToCantonBase64(wallet.publicKey);
 * // Use cantonKey for Canton Network API calls
 * ```
 */
export const privyPublicKeyToCantonBase64 = (publicKeyHex: string): string => {
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
};

/**
 * Base58 alphabet (Bitcoin/Solana style)
 */
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

/**
 * Decodes a base58 string to bytes using BigInt for precision
 * @param str - Base58 encoded string
 * @returns Byte array
 */
export const base58ToBytes = (str: string): Uint8Array => {
  // Count leading zeros (represented as '1' in base58)
  let leadingZeros = 0;
  for (const char of str) {
    if (char === '1') leadingZeros++;
    else break;
  }

  // Decode using BigInt for precision
  let num = BigInt(0);
  for (const char of str) {
    const value = BASE58_ALPHABET.indexOf(char);
    if (value === -1) {
      throw new Error(`Invalid base58 character: ${char}`);
    }
    num = num * BigInt(58) + BigInt(value);
  }

  // Convert BigInt to bytes
  const bytes: number[] = [];
  while (num > 0) {
    bytes.unshift(Number(num % BigInt(256)));
    num = num / BigInt(256);
  }

  // Add leading zeros
  for (let i = 0; i < leadingZeros; i++) {
    bytes.unshift(0);
  }

  return new Uint8Array(bytes);
};

/**
 * Converts a Solana address (base58) to base64 for Canton Network
 * @param address - Solana address in base58 format
 * @returns Public key in base64 format (32 bytes Ed25519 key)
 * @throws {Error} If decoded key is not 32 bytes
 */
export const solanaAddressToBase64 = (address: string): string => {
  const bytes = base58ToBytes(address);

  if (bytes.length !== 32) {
    throw new Error(`Invalid Solana address: expected 32 bytes, got ${bytes.length}`);
  }

  return btoa(String.fromCharCode(...bytes));
};

