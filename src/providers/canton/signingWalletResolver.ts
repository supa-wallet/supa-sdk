import { getCantonWallets, getPublicKeyBase64, type CantonWallet } from '../../utils/wallet';

export type CantonChainType = 'stellar' | 'solana';

export interface SigningWalletInfo {
  wallet: CantonWallet;
  chainType: CantonChainType;
}

export interface ResolveSigningWalletParams {
  primaryWallet: CantonWallet | null;
  stellarWallets: CantonWallet[];
  solanaWallets: CantonWallet[];
  cantonPublicKey?: string | null;
  defaultChainType: CantonChainType;
}

interface PersistedMatchedSigningWallet {
  address: string;
  chainType: CantonChainType;
  cantonPublicKey: string;
  savedAt: number;
}

const MATCHED_SIGNING_WALLET_STORAGE_KEY = 'supa-sdk:canton:matched-signing-wallet:v1';

const isKnownChainType = (value: unknown): value is CantonChainType => {
  return value === 'stellar' || value === 'solana';
};

const getLocalStorage = (): Storage | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const readPersistedMatchedSigningWallet = (): PersistedMatchedSigningWallet | null => {
  const storage = getLocalStorage();
  if (!storage) {
    return null;
  }

  const raw = storage.getItem(MATCHED_SIGNING_WALLET_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as PersistedMatchedSigningWallet;
    if (
      typeof parsed?.address !== 'string' ||
      !isKnownChainType(parsed?.chainType) ||
      typeof parsed?.cantonPublicKey !== 'string' ||
      typeof parsed?.savedAt !== 'number'
    ) {
      storage.removeItem(MATCHED_SIGNING_WALLET_STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    storage.removeItem(MATCHED_SIGNING_WALLET_STORAGE_KEY);
    return null;
  }
};

const persistMatchedSigningWallet = (
  candidate: SigningWalletInfo,
  cantonPublicKey: string,
): void => {
  const storage = getLocalStorage();
  if (!storage) {
    return;
  }

  const payload: PersistedMatchedSigningWallet = {
    address: candidate.wallet.address,
    chainType: candidate.chainType,
    cantonPublicKey,
    savedAt: Date.now(),
  };

  try {
    storage.setItem(MATCHED_SIGNING_WALLET_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage quota/security errors.
  }
};

const clearPersistedMatchedSigningWallet = (): void => {
  const storage = getLocalStorage();
  if (!storage) {
    return;
  }

  storage.removeItem(MATCHED_SIGNING_WALLET_STORAGE_KEY);
};

export const normalizeBase64Key = (value?: string | null): string | null => {
  if (!value || typeof value !== 'string') {
    return null;
  }

  const compact = value.replace(/\s/g, '');
  if (!compact) {
    return null;
  }

  const remainder = compact.length % 4;
  if (remainder === 0) {
    return compact;
  }

  return `${compact}${'='.repeat(4 - remainder)}`;
};

const toSigningWallet = (
  wallet: CantonWallet,
  fallbackChainType: CantonChainType,
): SigningWalletInfo | null => {
  if (!wallet?.address) {
    return null;
  }

  const chainType = isKnownChainType(wallet.chainType)
    ? wallet.chainType
    : fallbackChainType;

  return {
    wallet: { ...wallet, chainType },
    chainType,
  };
};

export const collectWalletsByChainType = (
  user: any,
  wallets: any[],
  targetChainType: CantonChainType,
): CantonWallet[] => {
  return getCantonWallets(user, wallets, targetChainType)
    .filter((wallet: any) => typeof wallet?.address === 'string' && wallet.address.length > 0)
    .map((wallet: any) => ({
      ...wallet,
      chainType: targetChainType,
    })) as CantonWallet[];
};

export const resolveSigningWalletFromCandidates = ({
  primaryWallet,
  stellarWallets,
  solanaWallets,
  cantonPublicKey,
  defaultChainType,
}: ResolveSigningWalletParams): SigningWalletInfo => {
  const candidatesByKey = new Map<string, SigningWalletInfo>();

  const addCandidate = (wallet: CantonWallet | null, fallbackChainType: CantonChainType) => {
    if (!wallet) {
      return;
    }

    const prepared = toSigningWallet(wallet, fallbackChainType);
    if (!prepared) {
      return;
    }

    candidatesByKey.set(`${prepared.chainType}:${prepared.wallet.address}`, prepared);
  };

  addCandidate(primaryWallet, defaultChainType);
  for (const wallet of stellarWallets) {
    addCandidate(wallet, 'stellar');
  }
  for (const wallet of solanaWallets) {
    addCandidate(wallet, 'solana');
  }

  const candidates = Array.from(candidatesByKey.values());
  if (candidates.length === 0) {
    throw new Error('No Canton wallet found. Please create a wallet first.');
  }

  const normalizedCantonKey = normalizeBase64Key(cantonPublicKey);
  let persistedMatchedWallet = readPersistedMatchedSigningWallet();

  if (persistedMatchedWallet && normalizedCantonKey && persistedMatchedWallet.cantonPublicKey !== normalizedCantonKey) {
    clearPersistedMatchedSigningWallet();
    persistedMatchedWallet = null;
  }

  if (normalizedCantonKey) {
    for (const candidate of candidates) {
      try {
        const candidateKey = normalizeBase64Key(getPublicKeyBase64(candidate.wallet));
        if (candidateKey && candidateKey === normalizedCantonKey) {
          persistMatchedSigningWallet(candidate, normalizedCantonKey);
          return candidate;
        }
      } catch {
        // Candidate may not expose key material yet; continue scanning.
      }
    }
  }

  if (persistedMatchedWallet) {
    const persisted = persistedMatchedWallet;
    const persistedCandidate = candidates.find(
      candidate =>
        candidate.chainType === persisted.chainType &&
        candidate.wallet.address === persisted.address,
    );

    if (persistedCandidate) {
      if (!normalizedCantonKey) {
        persistMatchedSigningWallet(persistedCandidate, persisted.cantonPublicKey);
        return persistedCandidate;
      }

      const expectedKey = normalizedCantonKey;
      try {
        const candidateKey = normalizeBase64Key(getPublicKeyBase64(persistedCandidate.wallet));
        if (candidateKey && candidateKey === expectedKey) {
          persistMatchedSigningWallet(persistedCandidate, expectedKey);
          return persistedCandidate;
        }
      } catch {
        // Candidate key may be temporarily unavailable; keep persisted binding.
        persistMatchedSigningWallet(persistedCandidate, persisted.cantonPublicKey);
        return persistedCandidate;
      }
    }

    clearPersistedMatchedSigningWallet();
  }

  return candidates.find(candidate => candidate.chainType === defaultChainType) || candidates[0];
};
