/**
 * TypeScript types generated from Supa Backend API Swagger
 * Based on OpenAPI 3.0.0 specification
 */

// ============= Enums & Basic Types =============

export type Order = 'ASC' | 'DESC';

export type AlchemyNetwork = 
  | 'eth-mainnet' 
  | 'arb-mainnet' 
  | 'opt-mainnet' 
  | 'polygon-mainnet';

export type TimeInterval = 
  | 'ONE_HOUR' 
  | 'ONE_DAY' 
  | 'ONE_MONTH' 
  | 'ONE_YEAR' 
  | 'ALL_TIME';

// ============= Canton Types =============

export interface CantonPrepareRegisterRequestDto {
  /** Base64 stellar public key from privy */
  publicKey: string;
  /** Optional invite code */
  inviteCode?: string;
}

/** Cost estimation for Canton transaction */
export interface CantonCostEstimationDto {
  /** Timestamp when the estimation was calculated (ISO 8601) */
  estimationTimestamp: string;
  /** Confirmation request traffic cost estimation in micro-units */
  confirmationRequestTrafficCostEstimation: number;
  /** Confirmation response traffic cost estimation in micro-units */
  confirmationResponseTrafficCostEstimation: number;
  /** Total traffic cost estimation in micro-units */
  totalTrafficCostEstimation: number;
}

export interface CantonPrepareTransactionResponseDto {
  /** Base64 hash to be signed by the user */
  hash: string;
  /** Estimated cost of the transaction (optional) */
  costEstimation?: CantonCostEstimationDto;
}

export interface CantonSubmitRegisterRequestDto {
  /** Base64 hash provided for signing */
  hash: string;
  /** Base64 signature for provided hash */
  signature: string;
  /** Optional deduplication period */
  deduplicationPeriod?: any;
}

export interface CantonSubmitTransactionResponseDto {
  /** Submission ID for tracking completion */
  submissionId: string;
}

export interface CantonSubmitMultipleResultDto {
  /** Hash of the transaction that was submitted */
  hash: string;
  /** Whether the submission succeeded */
  success: boolean;
  /** Submission ID if successful */
  submissionId?: string;
  /** Error message if failed */
  error?: string;
}

export type CantonQueryCompletionStatus = 'completed' | 'unknown' | 'rejected';

export interface CantonQueryCompletionResponseDto {
  status: CantonQueryCompletionStatus;
  data?: Record<string, unknown> | null;
  message?: string;
}

export interface CantonPrepareTapRequestDto {
  /** Positive integer amount of how many canton coins to receive */
  amount: string;
}

export interface CantonMeResponseDto {
  /** Canton party ID */
  partyId: string;
  /** User email (can be null if not set) */
  email: string | null;
  /** Public key used in Canton (base64, 32 bytes Ed25519) */
  publicKey?: string | null;
  /** Indicates whether the transfer preapproval is set and NOT EXPIRED for the party */
  transferPreapprovalSet: boolean;
  /** Transfer preapproval expiration date (ISO 8601, can be null) */
  transferPreapprovalExpiresAt: string | null;
}

// ============= Canton Active Contracts Types =============

/** Amount with rate decay for Canton Amulet */
export interface CantonAmuletAmount {
  /** Initial amount as decimal string */
  initialAmount: string;
  /** Round number when created */
  createdAt: { number: string };
  /** Rate per round for decay */
  ratePerRound: { rate: string };
}

/** Create argument for Canton Amulet contract */
export interface CantonAmuletCreateArgument {
  /** DSO party ID */
  dso: string;
  /** Owner party ID */
  owner: string;
  /** Amount with rate */
  amount: CantonAmuletAmount;
}

/** Created event for Canton contract */
export interface CantonCreatedEvent {
  /** Offset in ledger */
  offset: number;
  /** Node ID */
  nodeId: number;
  /** Contract ID */
  contractId: string;
  /** Template ID in format packageId:module:entity */
  templateId: string;
  /** Contract key (can be null) */
  contractKey: unknown | null;
  /** Create argument data */
  createArgument: CantonAmuletCreateArgument | Record<string, unknown>;
  /** Created event blob (base64) */
  createdEventBlob: string;
  /** Interface views */
  interfaceViews: unknown[];
  /** Witness parties */
  witnessParties: string[];
  /** Signatories */
  signatories: string[];
  /** Observers */
  observers: string[];
  /** Created timestamp (ISO 8601) */
  createdAt: string;
  /** Package name */
  packageName: string;
  /** Representative package ID */
  representativePackageId: string;
  /** ACS delta flag */
  acsDelta: boolean;
}

/** Active contract in Canton */
export interface CantonJsActiveContract {
  /** Created event with all contract details */
  createdEvent: CantonCreatedEvent;
  /** Synchronizer ID */
  synchronizerId: string;
  /** Reassignment counter */
  reassignmentCounter: number;
}

/** Contract entry wrapper */
export interface CantonContractEntry {
  JsActiveContract: CantonJsActiveContract;
}

/** Active contract item — legacy wrapped format (Canton Ledger API) */
export interface CantonActiveContractItemLegacy {
  /** Workflow ID (can be empty) */
  workflowId: string;
  /** Contract entry containing the active contract */
  contractEntry: CantonContractEntry;
}

/** Active contract item — new flat format */
export interface CantonActiveContractItemFlat {
  /** Contract ID */
  contractId: string;
  /** Template ID in format packageId:module:entity */
  templateId: string;
  /** Create argument data — varies per template */
  createArgument: CantonAmuletCreateArgument | Record<string, unknown>;
  /** Created event blob (base64) */
  createdEventBlob: string;
}

/** Active contract response item — supports both legacy and flat formats */
export type CantonActiveContractItem = CantonActiveContractItemLegacy | CantonActiveContractItemFlat;

/** Normalized contract data extracted from either format */
export interface CantonNormalizedContract {
  contractId: string;
  templateId: string;
  createArgument: CantonAmuletCreateArgument | Record<string, unknown>;
  createdEventBlob: string;
  /** Only available in legacy format */
  createdAt: string | null;
}

/** Response from /canton/api/active_contracts */
export type CantonActiveContractsResponseDto = CantonActiveContractItem[];

/** Parameters for getActiveContracts (offset requires limit) */
export type GetActiveContractsParams = {
  templateIds?: string[];
  limit?: number;
  offset?: never;
} | {
  templateIds?: string[];
  limit: number;
  offset?: number;
};

// ============= Legacy Canton Types (for backward compatibility) =============

export interface CantonActiveContract {
  /** Contract ID */
  contractId: string;
  /** Template ID */
  templateId: string;
  /** Contract blob data (untyped) */
  blob: unknown;
}

export interface CantonPrepareTransactionRequestDto {
  /** Command or array of commands */
  commands: unknown;
  /** Optional disclosed contracts */
  disclosedContracts?: unknown;
  /** Optional command ID for idempotency */
  commandId?: string;
}

// ============= Canton Balances Types =============

/** Canton instrument/token identifier */
export interface CantonInstrumentIdDto {
  /** DSO party ID (instrument administrator) */
  admin: string;
  /** Token identifier (e.g., "Amulet" for Canton Coin) */
  id: string;
}

/** UTXO metadata including creation info and demurrage rate */
export interface CantonUtxoMetadataDto {
  /** Round number when the UTXO was created */
  createdInRound: string;
  /** Demurrage rate per round (balance decrease rate for Canton Coin) */
  demurrageRate: string;
}

/** Unlocked UTXO */
export interface CantonUnlockedUtxoDto {
  /** Contract ID of the UTXO */
  contractId: string;
  /** Amount as decimal string */
  amount: string;
  /** UTXO metadata including creation info and demurrage rate */
  metadata: CantonUtxoMetadataDto;
}

/** Lock information for locked UTXO */
export interface CantonHoldingLockDto {
  /** Party IDs holding the lock */
  holders: string[];
  /** Lock expiration timestamp (ISO 8601, can be null) */
  expiresAt: string | null;
  /** Relative expiration duration (can be null) */
  expiresAfter: Record<string, unknown> | null;
  /** Context describing why the UTXO is locked (can be null) */
  context: string | null;
}

/** Locked UTXO with lock information */
export interface CantonLockedUtxoDto {
  /** Contract ID of the locked UTXO */
  contractId: string;
  /** Locked amount as decimal string */
  amount: string;
  /** Lock information including holders, expiration, and context */
  lock: CantonHoldingLockDto;
  /** UTXO metadata including creation info and demurrage rate */
  metadata: CantonUtxoMetadataDto;
}

/** Token balance with unlocked and locked UTXOs */
export interface CantonTokenBalanceDto {
  /** Unique identifier for this token type */
  instrumentId: CantonInstrumentIdDto;
  /** Total unlocked balance as decimal string */
  totalUnlockedBalance: string;
  /** Total locked balance as decimal string */
  totalLockedBalance: string;
  /** Total balance (unlocked + locked) as decimal string */
  totalBalance: string;
  /** Number of unlocked UTXOs */
  unlockedUtxoCount: number;
  /** Number of locked UTXOs */
  lockedUtxoCount: number;
  /** List of unlocked UTXOs */
  unlockedUtxos: CantonUnlockedUtxoDto[];
  /** List of locked UTXOs */
  lockedUtxos: CantonLockedUtxoDto[];
}

/** Canton wallet balances response */
export interface CantonWalletBalancesResponseDto {
  /** Party ID of the wallet owner */
  partyId: string;
  /** Token balances grouped by instrument ID */
  tokens: CantonTokenBalanceDto[];
  /** Timestamp when balances were fetched (ISO 8601) */
  fetchedAt: string;
}

/** Request for preparing a Canton transfer (Amulet or CIP-56 token) */
export interface CantonPrepareTransferRequestDto {
  /** Canton party ID of the receiver wallet */
  receiverPartyId: string;
  /** Amount to transfer (decimal string with max 10 decimal places) */
  amount: string;
  /** Instrument ID (e.g., "Amulet" for CC, "USDC" for CIP-56 tokens) */
  instrumentId: string;
  /**
   * Instrument admin party ID.
   * Optional for Amulet (resolved by backend), required for CIP-56 tokens.
   */
  instrumentAdmin?: string;
  /** Optional memo for the transfer */
  memo?: string;
}

/** Response for preparing a Canton transfer (Amulet or CIP-56 token) */
export interface CantonPrepareTransferResponseDto
  extends CantonPrepareTransactionResponseDto {
  /** Canton party ID of the receiver wallet */
  receiverPartyId: string;
  /** Amount to transfer (decimal string with max 10 decimal places) */
  amount: string;
  /** Instrument ID (e.g., "Amulet" for CC, "USDC" for CIP-56 tokens) */
  instrumentId: string;
  /** Optional instrument admin party ID */
  instrumentAdmin?: string;
  /** Optional memo for the transfer */
  memo?: string;
}

/** Request params for transfer fee calculation */
export interface CantonCalculateTransferFeeRequestDto {
  /** Party ID used for fee calculation (receiver recommended for transfer flows) */
  partyId?: string;
  /** Instrument ID of the transferred token */
  instrumentId: string;
  /** Optional instrument admin party ID */
  instrumentAdmin?: string;
}

/**
 * Transfer fee in CC.
 * Backend returns a numeric amount in Canton Coin units.
 */
export type CantonCalculateTransferFeeResponseDto = number;

/**
 * @deprecated Use `CantonPrepareTransferRequestDto` with `instrumentId: "Amulet"`.
 */
export interface CantonPrepareAmuletTransferRequestDto {
  /** Canton party ID of the receiver wallet */
  receiverPartyId: string;
  /** Amount of Amulet to transfer (decimal string with max 10 decimal places) */
  amount: string;
  /** Optional memo for the transfer */
  memo?: string;
}

/**
 * @deprecated Use `CantonPrepareTransferResponseDto` with `instrumentId: "Amulet"`.
 */
export interface CantonPrepareAmuletTransferResponseDto
  extends CantonPrepareTransactionResponseDto {
  /** Canton party ID of the receiver wallet */
  receiverPartyId: string;
  /** Amount of Amulet to transfer (decimal string with max 10 decimal places) */
  amount: string;
  /** Optional memo for the transfer */
  memo?: string;
}

// ============= Canton Incoming Transfers Types =============

/** Canton instrument/token info for incoming transfers */
export interface CantonInstrumentDto {
  /** Admin party ID of the instrument */
  admin: string;
  /** Token identifier (e.g., "Amulet" for Canton Coin, "CBTC" for wrapped BTC) */
  id: string;
}

/** Incoming transfer information */
export interface CantonIncomingTransferDto {
  /** Instrument details (token info) */
  instrument: CantonInstrumentDto;
  /** Contract ID of the transfer instruction (use this to approve or reject) */
  contractId: string;
  /** Sender party ID */
  sender: string;
  /** Receiver party ID */
  receiver: string;
  /** Amount to be transferred as a string */
  amount: string;
  /** Date when the transfer was sent/requested (ISO 8601) */
  requestedAt: string;
  /** Date before which the transfer must be executed (ISO 8601) */
  executeBefore: string;
}

/** Request for preparing response to incoming transfer */
export interface CantonPrepareResponseIncomingTransferRequestDto {
  /** Contract ID received from fetching incoming transfers */
  contractId: string;
  /** Whether to accept (approve) or reject the incoming transfer */
  accept: boolean;
}

// ============= Canton Transactions History Types =============

/** Token operation in a transaction */
export interface CantonTokenOperationDto {
  /** Amount as decimal string */
  amount: string;
  /** Operation description (e.g., "Subscription fee (from locked)") */
  description?: string;
  /** Direction: "in", "out", "lock", "unlock" */
  direction: 'in' | 'out' | 'lock' | 'unlock';
  /** Token symbol (e.g., "CC" for Canton Coin) */
  token: string;
  /** Counterparty party ID (for transfers) */
  counterparty?: string;
}

/** Canton transaction from history */
export interface CantonTransactionDto {
  /** Balance change (positive for incoming, negative for outgoing) */
  balanceChange: number;
  /** Transaction date (ISO 8601) */
  date: string;
  /** Additional transaction details (varies by type) */
  details: Record<string, unknown>;
  /** Ledger offset for pagination */
  ledgerOffset: number;
  /** Locked balance change */
  lockedChange: number;
  /** List of token operations in this transaction */
  tokenOperations: CantonTokenOperationDto[];
  /** Transaction type identifier */
  type: string;
  /** Human-readable transaction type label */
  typeLabel: string;
  /** Unique update ID */
  updateId: string;
}

/** Parameters for fetching transactions */
export interface CantonTransactionsParams {
  /** Maximum number of transactions to return (1-100, default: 20) */
  limit?: number;
  /** Offset for pagination (exclusive). Pass oldest transaction offset from previous response */
  beforeOffsetExclusive?: number;
}

// ============= Canton Price History Types =============

/** Time interval for price history */
export type CantonPriceInterval = '1h' | '1d' | '1w' | '1M';

/** Price candle data point */
export interface CantonPriceCandleDto {
  /** Opening price */
  open: string;
  /** Closing price */
  close: string;
  /** Minimum price in the interval */
  min: string;
  /** Maximum price in the interval */
  max: string;
  /** Interval start timestamp (ISO 8601) */
  start: string;
  /** Interval end timestamp (ISO 8601) */
  end: string;
}

// ============= User Types =============

export interface UserResponseDto {
  [key: string]: any;
}

export interface UserBalanceEntryDto {
  /** Token contract address */
  contractAddress: string;
  /** Token balance as a big integer string */
  tokenBalance: string;
  /** Token balance as a human-readable decimal string */
  tokenBalanceDecimal: string;
  /** Token decimals */
  decimals: number;
  /** Token logo URL */
  logoUrl: string;
  /** Token name */
  name: string;
  /** Token symbol */
  symbol: string;
  /** Network name */
  network: string;
}

export interface UserBalanceResponseDto {
  /** Wallet address */
  address: string;
  /** List of token balances */
  balances: UserBalanceEntryDto[];
  /** Total USD balance. Decimal string */
  totalUsdBalance: string;
}

// ============= Pagination Types =============

export interface OffsetPaginationDto {
  limit: number;
  currentPage: number;
}

export interface OffsetPaginatedDto<T = any> {
  data: T[];
  pagination: OffsetPaginationDto;
}

export interface PaginationParams {
  limit?: number;
  page?: number;
  order?: Order;
}

// ============= OnChain Types =============

export interface GetPricesByAddressesBodyDto {
  /** Array of pairs of alchemy network and contract address */
  addresses: Array<{ network: AlchemyNetwork; contractAddress: string }>;
}

export interface NetworkAddressAndPriceDto {
  /** Alchemy network */
  network: string;
  /** Contract address */
  contractAddress: string;
  /** USD price */
  price: number;
}

export interface GetTokens24hrPriceChangeParams {
  /** Array of pairs of alchemy network and contract address */
  tokens: Array<{ network: AlchemyNetwork; contractAddress: string }>;
}

export interface TokenPriceChange {
  currentPrice: number;
  oldPrice: number;
  priceChangeAbsolute: number;
  priceChangePercentage: number;
}

export interface TokenInfoWithPriceChangeDto {
  /** Token name */
  name: string;
  /** Token symbol */
  symbol: string;
  /** Token logo */
  logo: string;
  /** Token description */
  description?: string | null;
  /** Decimals */
  decimals: number;
  /** Contract address */
  contractAddress: string;
  /** Network */
  network: string;
  /** Native token flag */
  native: boolean;
  /** Price change */
  priceChange: TokenPriceChange;
}

export interface TokenInfo {
  network: string;
  logo: string;
  name: string;
  website: string;
  description: string;
  explorer: string;
  type: string;
  symbol: string;
  decimals: number;
  status: string;
  tags: string[];
  id: string;
  links: any[];
}

export interface TokenPriceHistoryParams {
  contractAddress: string;
  network: AlchemyNetwork;
  interval?: TimeInterval;
  limit?: number;
  page?: number;
  order?: Order;
}

export interface TokenPriceHistoryDataPoint {
  value: string;
  timestamp: string;
}

export interface TokenPriceHistoryResponse {
  symbol: string;
  currency: string;
  data: TokenPriceHistoryDataPoint[];
}

export interface AccountTokenBalance {
  contractAddress: string;
  tokenBalance: string;
  error?: any | null;
}

export interface AccountTokensBalancesResponse {
  address: string;
  tokenBalances: AccountTokenBalance[];
}

// ============= SupaPoints Types =============

export interface SupaPointsBalanceResponseDto {
  /** Current SupaPoints balance */
  balance: number;
}

export interface DailyLoginResponseDto {
  /** Current SupaPoints balance */
  balance: number;
  /** SupaPoints balance change */
  add: number;
}

export interface SupaPointsHistoryParams extends PaginationParams {
  startDate?: string;
  endDate?: string;
  action?: string;
}

// ============= Paymaster Types =============

export interface PaymasterRequestDataDto {
  /** User operation hex-string */
  userOperation: string;
  /** Entrypoint address */
  entryPoint: string;
  /** Network ID */
  chainId: number;
  /** Sponsorship policy ID */
  sponsorshipPolicyId: string;
}

export interface PaymasterRequestDto {
  /** Request type */
  type: 'sponsorshipPolicy.webhook';
  /** Request data */
  data: PaymasterRequestDataDto;
}

export interface PaymasterResponseDto {
  sponsor: boolean;
}

// ============= Transaction Types =============

export interface TransactionQueryParams {
  withScam?: boolean;
}

// ============= API Response Types =============

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: ApiError;
}

