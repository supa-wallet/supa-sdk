/**
 * useAPI Hook
 * Provides access to all backend API methods
 */

import { useWalletinoContext } from '../providers/WalletinoProvider';
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

export interface UseAPIReturn {
  /** User API methods */
  user: {
    /** Get current user */
    getCurrent: () => Promise<UserResponseDto>;
    /** Get all users */
    getAll: () => Promise<UserResponseDto[]>;
    /** Get user by Privy ID */
    getByPrivyId: (privyUserId: string) => Promise<UserResponseDto>;
    /** Get smart wallet balances */
    getBalance: (force?: boolean) => Promise<UserBalanceResponseDto>;
  };

  /** Dialog API methods */
  dialogs: {
    /** Create new dialog */
    create: (text: string) => Promise<DialogWithMessagesResponseDto>;
    /** Get all dialogs */
    findAll: (params?: PaginationParams) => Promise<OffsetPaginatedDto<DialogListResponseDto>>;
    /** Get specific dialog */
    findOne: (id: number) => Promise<DialogListResponseDto>;
    /** Delete dialog */
    delete: (id: number) => Promise<void>;
  };

  /** Message API methods */
  messages: {
    /** Create message in dialog */
    create: (dialogId: number, text: string) => Promise<MessageResponseDto>;
    /** Get all messages in dialog */
    findAll: (dialogId: number, params?: PaginationParams) => Promise<OffsetPaginatedDto<MessageResponseDto>>;
    /** Get specific message */
    findOne: (id: number) => Promise<MessageResponseDto>;
  };

  /** OnChain API methods */
  onchain: {
    /** Get token prices by addresses */
    getPricesByAddresses: (
      addresses: Array<{ network: AlchemyNetwork; contractAddress: string }>
    ) => Promise<NetworkAddressAndPriceDto[]>;
    /** Get token prices by symbols */
    getTokenPrices: (symbols: string[]) => Promise<Record<string, number>>;
    /** Get token price history */
    getPriceHistory: (params: TokenPriceHistoryParams) => Promise<TokenPriceHistoryResponse>;
    /** Get 24hr price changes */
    get24hrPriceChanges: (
      tokens: Array<{ network: AlchemyNetwork; contractAddress: string }>
    ) => Promise<TokenInfoWithPriceChangeDto[]>;
    /** Get token info */
    getTokenInfo: (network: string, addresses: string | string[]) => Promise<Record<string, TokenInfo>>;
    /** Get account token balances */
    getAccountBalances: (network: string, account: string, force?: boolean) => Promise<AccountTokensBalancesResponse>;
  };

  /** Transaction API methods */
  transactions: {
    /** Get user transactions */
    get: (params?: TransactionQueryParams) => Promise<any>;
    /** Force load transactions */
    forceLoad: (params?: TransactionQueryParams) => Promise<any>;
  };

  /** SupaPoints API methods */
  supaPoints: {
    /** Get balance */
    getBalance: () => Promise<SupaPointsBalanceResponseDto>;
    /** Get history */
    getHistory: (params?: SupaPointsHistoryParams) => Promise<OffsetPaginatedDto<any>>;
    /** Process daily login */
    dailyLogin: () => Promise<DailyLoginResponseDto>;
  };

  /** Paymaster API methods */
  paymaster: {
    /** Check sponsorship */
    checkSponsorship: (request: PaymasterRequestDto) => Promise<PaymasterResponseDto>;
  };

  /** Privy methods */
  privy: {
    /** Get Privy balance */
    getBalance: () => Promise<any>;
  };
}

/**
 * Hook for accessing backend API
 */
export function useAPI(): UseAPIReturn {
  const { apiService } = useWalletinoContext();

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
}

