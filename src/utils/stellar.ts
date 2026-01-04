/**
 * Stellar wallet utilities for Privy integration
 * Stellar chain type is used for Ed25519 signing required by Canton Network
 */

import { privyPublicKeyToCantonBase64 } from './converters';

/**
 * Stellar wallet interface representing a Privy Stellar wallet
 */
export interface StellarWallet {
  /** Stellar address (public key in Stellar format) */
  address: string;
  /** Raw public key in hex format */
  publicKey: string;
  /** Chain type, always 'stellar' for Stellar wallets */
  chainType: 'stellar';
  /** Wallet client type (e.g., 'privy') */
  walletClientType?: string;
  /** Whether the wallet was imported or created */
  imported?: boolean;
}

/**
 * Extracts all Stellar wallets from Privy user and wallets array
 * Combines wallets from both user.linkedAccounts and useWallets hook,
 * removing duplicates by address.
 * 
 * @param user - Privy user object
 * @param wallets - Privy wallets array from useWallets hook
 * @returns Array of unique Stellar wallets
 * 
 * @example
 * ```ts
 * const { user } = usePrivy();
 * const { wallets } = useWallets();
 * const stellarWallets = getStellarWallets(user, wallets);
 * console.log(`Found ${stellarWallets.length} Stellar wallets`);
 * ```
 */
export const getStellarWallets = (user: any, wallets: any[]): StellarWallet[] => {
  const stellarWallets: StellarWallet[] = [];

  // Get from linked accounts
  if (user?.linkedAccounts) {
    const linkedStellar = user.linkedAccounts.filter(
      (account: any) => account.type === 'wallet' && account.chainType === 'stellar'
    );
    stellarWallets.push(...linkedStellar);
  }

  // Get from wallets array (useWallets hook)
  const walletStellar = wallets.filter(
    (w: any) => w.chainType === 'stellar'
  );
  stellarWallets.push(...walletStellar);

  // Remove duplicates by address
  const uniqueWallets = Array.from(
    new Map(stellarWallets.map(w => [w.address, w])).values()
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
export const getPublicKeyBase64 = (wallet: StellarWallet | any): string => {
  if (!wallet) {
    throw new Error('Wallet is required');
  }

  // Try to get publicKey from different possible locations
  let publicKey = wallet.publicKey;
  
  // If not found directly, check nested properties (Privy might have different structures)
  if (!publicKey && wallet.linkedAccount) {
    publicKey = wallet.linkedAccount.publicKey;
  }
  
  if (!publicKey) {
    throw new Error('Public key not found in wallet. Stellar wallet is still being created. Please wait...');
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
 * Type guard to check if a wallet is a Stellar wallet
 * @param wallet - Wallet object to check
 * @returns True if wallet is a valid Stellar wallet
 * 
 * @example
 * ```ts
 * if (isStellarWallet(wallet)) {
 *   console.log('Stellar wallet address:', wallet.address);
 * }
 * ```
 */
export const isStellarWallet = (wallet: any): wallet is StellarWallet => {
  return wallet && wallet.chainType === 'stellar';
};

/**
 * Gets the first Stellar wallet from user and wallets array
 * Convenience function that throws if no Stellar wallet is found
 * 
 * @param user - Privy user object
 * @param wallets - Privy wallets array from useWallets hook
 * @returns First Stellar wallet found
 * @throws {Error} If no Stellar wallet found
 * 
 * @example
 * ```ts
 * try {
 *   const wallet = getFirstStellarWallet(user, wallets);
 *   console.log('Using wallet:', wallet.address);
 * } catch (err) {
 *   console.error('No Stellar wallet available');
 * }
 * ```
 */
export const getFirstStellarWallet = (user: any, wallets: any[]): StellarWallet => {
  const stellarWallets = getStellarWallets(user, wallets);
  
  if (stellarWallets.length === 0) {
    throw new Error('No Stellar wallet found. Please create one first.');
  }
  
  return stellarWallets[0];
};

