/**
 * Stellar wallet utilities for Privy integration
 * Stellar chain type is used for Ed25519 signing required by Canton Network
 */

import { privyPublicKeyToCantonBase64, solanaAddressToBase64 } from './converters';

/**
 * Stellar/Solana wallet interface representing a Privy Ed25519 wallet
 */
export interface CantonWallet {
  /** Wallet address (public key in Stellar/Solana format) */
  address: string;
  /** Raw public key in hex format (camelCase) - only for Stellar */
  publicKey?: string;
  /** Raw public key in hex format (snake_case from Privy API) - only for Stellar */
  public_key?: string;
  /** Chain type: 'stellar' (default) or 'solana' (with export) */
  chainType: 'stellar' | 'solana';
  /** Wallet client type (e.g., 'privy') */
  walletClientType?: string;
  /** Whether the wallet was imported or created */
  imported?: boolean;
}

/**
 * Extracts all Ed25519 wallets (Stellar or Solana) from Privy user and wallets array
 * Combines wallets from both user.linkedAccounts and useWallets hook,
 * removing duplicates by address.
 *
 * @param user - Privy user object
 * @param wallets - Privy wallets array from useWallets hook
 * @param chainType - Chain type to filter by: 'stellar' (default) or 'solana' (with export)
 * @returns Array of unique wallets
 *
 * @example
 * ```ts
 * const { user } = usePrivy();
 * const { wallets } = useWallets();
 * const cantonWallets = getCantonWallets(user, wallets, 'stellar');
 * console.log(`Found ${cantonWallets.length} wallets`);
 * ```
 */
export const getCantonWallets = (
  user: any,
  wallets: any[],
  chainType: 'stellar' | 'solana' = 'stellar'
): CantonWallet[] => {
  const cantonWallets: CantonWallet[] = [];

  // Get from linked accounts
  if (user?.linkedAccounts) {
    const linkedStellar = user.linkedAccounts.filter(
      (account: any) => account.type === 'wallet' && account.chainType === chainType
    );
    cantonWallets.push(...linkedStellar);
  }

  // Get from wallets array (useWallets hook)
  const walletStellar = wallets.filter(
    (w: any) => w.chainType === chainType
  );
  cantonWallets.push(...walletStellar);

  // Remove duplicates by address
  const uniqueWallets = Array.from(
    new Map(cantonWallets.map(w => [w.address, w])).values()
  );

  return uniqueWallets;
};

/**
 * Converts Stellar wallet public key to Canton Network base64 format
 * Handles removal of leading 00 byte and conversion from hex to base64
 * 
 * @param wallet - Stellar wallet object containing publicKey
 * @returns Public key in base64 format ready for Canton Network API
 * @throws {Error} If wallet is invalid or publicKey is missing/malformed
 * 
 * @example
 * ```ts
 * const publicKeyBase64 = getPublicKeyBase64(stellarWallet);
 * // Use with Canton Network API
 * await fetch('/canton/register/prepare', {
 *   body: JSON.stringify({ publicKey: publicKeyBase64 })
 * });
 * ```
 */
export const getPublicKeyBase64 = (wallet: CantonWallet | any): string => {
  if (!wallet) {
    throw new Error('Wallet is required');
  }

  // For Solana wallets, use the address directly (it's base58 encoded public key)
  if (wallet.chainType === 'solana' && wallet.address) {
    return solanaAddressToBase64(wallet.address);
  }

  // Try to get publicKey from different possible locations
  // Privy uses snake_case (public_key) in API responses
  let publicKey = wallet.publicKey || wallet.public_key;

  // If not found directly, check nested properties (Privy might have different structures)
  if (!publicKey && wallet.linkedAccount) {
    publicKey = wallet.linkedAccount.publicKey || wallet.linkedAccount.public_key;
  }

  if (!publicKey) {
    throw new Error('Public key not found in wallet. Wallet may still be creating. Please wait...');
  }

  // Validate publicKey format
  if (typeof publicKey !== 'string') {
    throw new Error(`Invalid publicKey type: ${typeof publicKey}`);
  }

  // Check if it looks like a hex string (should start with 0x or be hex characters)
  const isHex = /^(0x)?[0-9a-fA-F]+$/.test(publicKey);
  if (!isHex) {
    throw new Error(`publicKey is not in hex format: ${publicKey.substring(0, 20)}...`);
  }

  return privyPublicKeyToCantonBase64(publicKey);
};

/**
 * Type guard to check if a wallet is a Stellar/Solana Ed25519 wallet
 * @param wallet - Wallet object to check
 * @returns True if wallet is a valid Ed25519 wallet (Stellar or Solana)
 *
 * @example
 * ```ts
 * if (isCantonWallet(wallet)) {
 *   console.log('Ed25519 wallet address:', wallet.address);
 * }
 * ```
 */
export const isCantonWallet = (wallet: any): wallet is CantonWallet => {
  return wallet && (wallet.chainType === 'stellar' || wallet.chainType === 'solana');
};

/**
 * Gets the first Ed25519 wallet from user and wallets array
 * Convenience function that throws if no wallet is found
 *
 * @param user - Privy user object
 * @param wallets - Privy wallets array from useWallets hook
 * @param chainType - Chain type to filter by: 'stellar' (default) or 'solana' (with export)
 * @returns First wallet found
 * @throws {Error} If no wallet found
 *
 * @example
 * ```ts
 * try {
 *   const wallet = getFirstCantonWallet(user, wallets, 'stellar');
 *   console.log('Using wallet:', wallet.address);
 * } catch (err) {
 *   console.error('No wallet available');
 * }
 * ```
 */
export const getFirstCantonWallet = (
  user: any,
  wallets: any[],
  chainType: 'stellar' | 'solana' = 'stellar'
): CantonWallet => {
  const cantonWallets = getCantonWallets(user, wallets, chainType);

  if (cantonWallets.length === 0) {
    throw new Error(`No ${chainType} wallet found. Please create one first.`);
  }

  return cantonWallets[0];
};

