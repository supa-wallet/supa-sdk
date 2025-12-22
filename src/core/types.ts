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
}

export interface CantonPrepareTransactionResponseDto {
  /** Base64 hash to be signed by the user */
  hash: string;
}

export interface CantonSubmitRegisterRequestDto {
  /** Base64 hash provided for signing */
  hash: string;
  /** Base64 signature for provided hash */
  signature: string;
}

export interface CantonSubmitTransactionResponseDto {
  /** Canton party ID */
  partyId: string;
  /** User email (can be null if not set) */
  email: string | null;
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

/** Active contract response item from API */
export interface CantonActiveContractItem {
  /** Workflow ID (can be empty) */
  workflowId: string;
  /** Contract entry containing the active contract */
  contractEntry: CantonContractEntry;
}

/** Response from /canton/api/active_contracts */
export type CantonActiveContractsResponseDto = CantonActiveContractItem[];

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
  commandId: unknown;
  /** Optional disclosed contracts */
  disclosedContracts?: unknown;
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

// ============= Dialog & Message Types =============

export interface NewDialogRequestDto {
  text: string;
}

export interface MessageResponseDto {
  id: number;
  dialogId: number;
  text: string;
  isReply: boolean;
  date: string;
  command?: any | null;
  payload?: any | null;
  actionSuggestions?: any | null;
}

export interface DialogWithMessagesResponseDto {
  id: number;
  createdAt: string;
  updatedAt: string;
  isProcessingNow: boolean;
  messages: MessageResponseDto[];
}

export interface DialogListResponseDto {
  id: number;
  createdAt: string;
  updatedAt: string;
  isProcessingNow: boolean;
  firstMessage: string;
}

export interface NewMessageRequestDto {
  /** Message text content */
  text: string;
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




