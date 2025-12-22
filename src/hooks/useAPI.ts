/**
 * Supa Backend API hook
 * Provides type-safe access to all backend API endpoints
 */

import { useSupaContext } from '../providers/SupaProvider';
import type {
  UserResponseDto,
  UserBalanceResponseDto,
  DialogWithMessagesResponseDto,
  DialogListResponseDto,
  OffsetPaginatedDto,
  MessageResponseDto,
  PaginationParams,
  NetworkAddressAndPriceDto,
  TokenInfoWithPriceChangeDto,
  TokenInfo,
  TokenPriceHistoryParams,
  TokenPriceHistoryResponse,
  AccountTokensBalancesResponse,
  AlchemyNetwork,
  SupaPointsBalanceResponseDto,
  DailyLoginResponseDto,
  SupaPointsHistoryParams,
  TransactionQueryParams,
  PaymasterRequestDto,
  PaymasterResponseDto,
} from '../core/types';

/**
 * Return type for useAPI hook
 * Provides organized access to all backend API methods
 */
export interface UseAPIReturn {
  /** User management and profile methods */
  user: {
    /** Fetches current authenticated user profile */
    getCurrent: () => Promise<UserResponseDto>;
    /** Fetches all users (admin only) */
    getAll: () => Promise<UserResponseDto[]>;
    /** Fetches user by Privy ID */
    getByPrivyId: (privyUserId: string) => Promise<UserResponseDto>;
    /** Fetches user's smart wallet token balances */
    getBalance: (force?: boolean) => Promise<UserBalanceResponseDto>;
  };

  /** AI dialog management methods */
  dialogs: {
    /** Creates a new AI dialog with initial message */
    create: (text: string) => Promise<DialogWithMessagesResponseDto>;
    /** Fetches all user dialogs with pagination */
    findAll: (params?: PaginationParams) => Promise<OffsetPaginatedDto<DialogListResponseDto>>;
    /** Fetches a specific dialog by ID */
    findOne: (id: number) => Promise<DialogListResponseDto>;
    /** Deletes a dialog and all its messages */
    delete: (id: number) => Promise<void>;
  };

  /** AI message methods within dialogs */
  messages: {
    /** Creates a new message in a dialog */
    create: (dialogId: number, text: string) => Promise<MessageResponseDto>;
    /** Fetches all messages in a dialog with pagination */
    findAll: (dialogId: number, params?: PaginationParams) => Promise<OffsetPaginatedDto<MessageResponseDto>>;
    /** Fetches a specific message by ID */
    findOne: (id: number) => Promise<MessageResponseDto>;
  };

  /** On-chain data and token price methods */
  onchain: {
    /** Fetches token prices by contract addresses */
    getPricesByAddresses: (
      addresses: Array<{ network: AlchemyNetwork; contractAddress: string }>
    ) => Promise<NetworkAddressAndPriceDto[]>;
    /** Fetches token prices by symbols (BTC, ETH, etc.) */
    getTokenPrices: (symbols: string[]) => Promise<Record<string, number>>;
    /** Fetches historical price data for a token */
    getPriceHistory: (params: TokenPriceHistoryParams) => Promise<TokenPriceHistoryResponse>;
    /** Fetches 24-hour price changes for tokens */
    get24hrPriceChanges: (
      tokens: Array<{ network: AlchemyNetwork; contractAddress: string }>
    ) => Promise<TokenInfoWithPriceChangeDto[]>;
    /** Fetches detailed token information */
    getTokenInfo: (network: string, addresses: string | string[]) => Promise<Record<string, TokenInfo>>;
    /** Fetches token balances for an account */
    getAccountBalances: (network: string, account: string, force?: boolean) => Promise<AccountTokensBalancesResponse>;
  };

  /** Transaction history methods */
  transactions: {
    /** Fetches user transaction history */
    get: (params?: TransactionQueryParams) => Promise<any>;
    /** Forces reload of transaction history from blockchain */
    forceLoad: (params?: TransactionQueryParams) => Promise<any>;
  };

  /** SupaPoints reward system methods */
  supaPoints: {
    /** Fetches current SupaPoints balance */
    getBalance: () => Promise<SupaPointsBalanceResponseDto>;
    /** Fetches SupaPoints transaction history */
    getHistory: (params?: SupaPointsHistoryParams) => Promise<OffsetPaginatedDto<any>>;
    /** Processes daily login bonus */
    dailyLogin: () => Promise<DailyLoginResponseDto>;
  };

  /** Paymaster sponsorship methods */
  paymaster: {
    /** Checks if transaction qualifies for gas sponsorship */
    checkSponsorship: (request: PaymasterRequestDto) => Promise<PaymasterResponseDto>;
  };

  /** Privy wallet methods */
  privy: {
    /** Fetches Privy embedded wallet balance */
    getBalance: () => Promise<any>;
  };
}

/**
 * Hook for accessing Supa Backend API
 * Provides organized, type-safe access to all backend endpoints
 * All methods automatically include authentication token from Privy
 * 
 * @returns Organized API methods grouped by functionality
 * 
 * @example
 * Basic usage
 * ```tsx
 * function UserBalance() {
 *   const api = useAPI();
 *   const [balance, setBalance] = useState(null);
 * 
 *   useEffect(() => {
 *     api.user.getBalance().then(setBalance);
 *   }, []);
 * 
 *   return <div>Balance: ${balance?.totalUsdBalance}</div>;
 * }
 * ```
 * 
 * @example
 * Creating an AI dialog
 * ```tsx
 * function CreateDialog() {
 *   const api = useAPI();
 * 
 *   const handleCreate = async () => {
 *     const dialog = await api.dialogs.create('Hello AI!');
 *     console.log('Dialog created:', dialog.id);
 *     console.log('AI response:', dialog.messages[1].message);
 *   };
 * 
 *   return <button onClick={handleCreate}>Start Chat</button>;
 * }
 * ```
 * 
 * @example
 * Fetching crypto prices
 * ```tsx
 * function TokenPrices() {
 *   const api = useAPI();
 * 
 *   useEffect(() => {
 *     api.onchain.getTokenPrices(['BTC', 'ETH', 'SOL'])
 *       .then(prices => {
 *         console.log('BTC:', prices.BTC);
 *         console.log('ETH:', prices.ETH);
 *       });
 *   }, []);
 * 
 *   return <div>Check console for prices</div>;
 * }
 * ```
 */
export const useAPI = (): UseAPIReturn => {
  const { apiService } = useSupaContext();

  return {
    user: {
      getCurrent: () => apiService.getCurrentUser(),
      getAll: () => apiService.getAllUsers(),
      getByPrivyId: (privyUserId: string) => apiService.getUserByPrivyId(privyUserId),
      getBalance: (force?: boolean) => apiService.getSmartWalletBalances(force),
    },

    dialogs: {
      create: (text: string) => apiService.createDialog(text),
      findAll: (params?: PaginationParams) => apiService.getAllDialogs(params),
      findOne: (id: number) => apiService.getDialog(id),
      delete: (id: number) => apiService.deleteDialog(id),
    },

    messages: {
      create: (dialogId: number, text: string) => apiService.createMessage(dialogId, text),
      findAll: (dialogId: number, params?: PaginationParams) => 
        apiService.getDialogMessages(dialogId, params),
      findOne: (id: number) => apiService.getMessage(id),
    },

    onchain: {
      getPricesByAddresses: (addresses) => apiService.getTokenPricesByAddresses(addresses),
      getTokenPrices: (symbols) => apiService.getTokenPrices(symbols),
      getPriceHistory: (params) => apiService.getTokenPriceHistory(params),
      get24hrPriceChanges: (tokens) => apiService.getTokens24hrPriceChanges(tokens),
      getTokenInfo: (network, addresses) => apiService.getTokenInfo(network, addresses),
      getAccountBalances: (network, account, force) => 
        apiService.getAccountTokenBalances(network, account, force),
    },

    transactions: {
      get: (params) => apiService.getTransactions(params),
      forceLoad: (params) => apiService.forceLoadTransactions(params),
    },

    supaPoints: {
      getBalance: () => apiService.getSupaPointsBalance(),
      getHistory: (params) => apiService.getSupaPointsHistory(params),
      dailyLogin: () => apiService.dailyLogin(),
    },

    paymaster: {
      checkSponsorship: (request) => apiService.checkPaymasterSponsorship(request),
    },

    privy: {
      getBalance: () => apiService.getPrivyBalance(),
    },
  };
};

