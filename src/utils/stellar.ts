/**
 * Stellar wallet utilities for Privy integration
 * Stellar chain type is used for Ed25519 signing required by Canton Network
 */

import { privyPublicKeyToCantonBase64 } from './converters';

export interface StellarWallet {
  address: string;
  publicKey: string;
  chainType: 'stellar';
  walletClientType?: string;
  imported?: boolean;
}

/**
 * Extract Stellar wallets from Privy user and wallets
 * @param user Privy user object
 * @param wallets Privy wallets array
 * @returns Array of Stellar wallets
 */
export function getStellarWallets(user: any, wallets: any[]): StellarWallet[] {
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
}

/**
 * Get public key in base64 format for Canton Network
 * Removes leading 00 byte and converts hex to base64
 * @param wallet Stellar wallet object
 * @returns Public key in base64 format
 */
export function getPublicKeyBase64(wallet: StellarWallet | any): string {
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
    throw new Error('Public key not found in wallet. Make sure you have a Stellar wallet created in Privy.');
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
}

/**
 * Check if a wallet is a Stellar wallet
 * @param wallet Wallet object to check
 * @returns True if wallet is Stellar
 */
export function isStellarWallet(wallet: any): wallet is StellarWallet {
  return wallet && wallet.chainType === 'stellar';
}

/**
 * Get first Stellar wallet or throw error
 * @param user Privy user object
 * @param wallets Privy wallets array
 * @returns First Stellar wallet
 * @throws Error if no Stellar wallet found
 */
export function getFirstStellarWallet(user: any, wallets: any[]): StellarWallet {
  const stellarWallets = getStellarWallets(user, wallets);
  
  if (stellarWallets.length === 0) {
    throw new Error('No Stellar wallet found. Please create one first.');
  }
  
  return stellarWallets[0];
}

