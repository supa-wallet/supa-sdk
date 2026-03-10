import type { ReactNode } from 'react';
import type { CantonService, CantonSubmitPreparedOptions } from '../../services/cantonService';
import type {
  CantonMeResponseDto,
  CantonActiveContractsResponseDto,
  CantonQueryCompletionResponseDto,
  CantonWalletBalancesResponseDto,
  CantonIncomingTransferDto,
  CantonTransactionDto,
  CantonTransactionsParams,
  CantonPriceInterval,
  CantonPriceCandleDto,
  CantonPrepareTransferRequestDto,
  CantonCalculateTransferFeeResponseDto,
} from '../../core/types';
import type { CantonWallet } from '../../utils/wallet';

export interface CantonSendCoinOptions extends CantonSubmitPreparedOptions {
  /** Skip confirmation modal. Default: false */
  skipModal?: boolean;
  /**
   * Instrument ID to transfer.
   * Defaults to "Amulet" (CC).
   */
  instrumentId?: CantonPrepareTransferRequestDto['instrumentId'];
  /**
   * Optional instrument admin party ID.
   * Useful for CIP-56 tokens.
   */
  instrumentAdmin?: CantonPrepareTransferRequestDto['instrumentAdmin'];
}

export interface CantonContextValue {
  /** First Stellar wallet (primary) */
  cantonWallet: CantonWallet | null;

  /** All Stellar wallets */
  cantonWallets: CantonWallet[];

  /** Create new Stellar wallet */
  createCantonWallet: () => Promise<CantonWallet | null>;

  /** Register Canton wallet on backend */
  registerCanton: (inviteCode?: string) => Promise<void>;

  /** Whether Canton wallet is registered */
  isRegistered: boolean;

  /** Canton user info (partyId, email, transferPreapprovalSet) */
  cantonUser: CantonMeResponseDto | null;

  /** Get Canton user info */
  getMe: () => Promise<CantonMeResponseDto>;

  /** Get active contracts with optional filtering */
  getActiveContracts: (templateIds?: string[]) => Promise<CantonActiveContractsResponseDto>;

  /** Canton wallet balances */
  cantonBalances: CantonWalletBalancesResponseDto | null;

  /** Get Canton wallet balances */
  getBalances: () => Promise<CantonWalletBalancesResponseDto>;

  /** Tap devnet faucet */
  tapDevnet: (amount: string, options?: CantonSubmitPreparedOptions) => Promise<CantonQueryCompletionResponseDto>;

  /** Sign hash with Stellar wallet */
  signHash: (hashBase64: string) => Promise<string>;

  /** Sign text message */
  signMessage: (message: string) => Promise<string>;

  /** Prepare and submit transaction with polling for completion */
  sendTransaction: (
    commands: unknown,
    disclosedContracts?: unknown,
    options?: CantonSubmitPreparedOptions
  ) => Promise<CantonQueryCompletionResponseDto>;

  /** Send transfer to another party (defaults to Canton Coin / Amulet) */
  sendCantonCoin: (
    receiverPartyId: string,
    amount: string,
    memo?: string,
    options?: CantonSendCoinOptions
  ) => Promise<CantonQueryCompletionResponseDto>;

  /** Calculate transfer fee in CC (optional partyId override, receiver recommended for transfers) */
  calculateTransferFee: (
    instrumentId?: string,
    instrumentAdmin?: string,
    partyId?: string
  ) => Promise<CantonCalculateTransferFeeResponseDto>;

  /** Setup transfer preapproval (internal, called automatically) */
  setupTransferPreapproval: () => Promise<void>;

  /** Get pending incoming transfers */
  getPendingIncomingTransfers: () => Promise<CantonIncomingTransferDto[]>;

  /** Respond to incoming transfer (accept or reject) */
  respondToIncomingTransfer: (
    contractId: string,
    accept: boolean,
    options?: CantonSubmitPreparedOptions
  ) => Promise<CantonQueryCompletionResponseDto>;

  /** Get Canton transactions history with pagination */
  getTransactions: (params?: CantonTransactionsParams) => Promise<CantonTransactionDto[]>;

  /** Get Canton price history (candles from Bybit) */
  getPriceHistory: (interval: CantonPriceInterval) => Promise<CantonPriceCandleDto[]>;

  /** Reset all Canton state (for logout) */
  resetState: () => void;

  /** Loading state */
  loading: boolean;

  /** Error state */
  error: Error | null;

  /** Clear error */
  clearError: () => void;
}

export interface CantonProviderProps {
  cantonService: CantonService;
  children: ReactNode;
  /** Enable wallet export (uses Solana instead of Stellar). Default: false */
  withExport?: boolean;
  /** Enable automatic onboarding (create wallet + register Canton on login). Default: true */
  autoOnboarding?: boolean;
  /**
   * Legacy onboarding stage: automatically setup transfer preapproval after registration.
   * Default: false (new onboarding uses prepare_initialization_transactions).
   */
  autoTransferPreapproval?: boolean;
}
