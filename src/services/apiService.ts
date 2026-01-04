/**
 * Backend API Service
 * Provides methods for all Supa backend endpoints
 */

import type { ApiClient } from '../core/client';
import type {
  // User
  UserResponseDto,
  UserBalanceResponseDto,
  
  // Dialogs & Messages
  NewDialogRequestDto,
  DialogWithMessagesResponseDto,
  DialogListResponseDto,
  OffsetPaginatedDto,
  NewMessageRequestDto,
  MessageResponseDto,
  PaginationParams,
  
  // OnChain
  NetworkAddressAndPriceDto,
  GetPricesByAddressesBodyDto,
  GetTokens24hrPriceChangeParams,
  TokenInfoWithPriceChangeDto,
  TokenInfo,
  TokenPriceHistoryParams,
  TokenPriceHistoryResponse,
  AccountTokensBalancesResponse,
  AlchemyNetwork,
  
  // SupaPoints
  SupaPointsBalanceResponseDto,
  DailyLoginResponseDto,
  SupaPointsHistoryParams,
  
  // Transactions
  TransactionQueryParams,
  
  // Paymaster
  PaymasterRequestDto,
  PaymasterResponseDto,
} from '../core/types';

export class ApiService {
  private userMeCache: UserResponseDto | null = null;
  private userMeCacheTimestamp: number = 0;
  private userMePendingPromise: Promise<UserResponseDto> | null = null;
  
  private supaPointsBalanceCache: SupaPointsBalanceResponseDto | null = null;
  private supaPointsBalanceCacheTimestamp: number = 0;
  private supaPointsBalancePendingPromise: Promise<SupaPointsBalanceResponseDto> | null = null;
  
  private privyBalanceCache: any | null = null;
  private privyBalanceCacheTimestamp: number = 0;
  private privyBalancePendingPromise: Promise<any> | null = null;
  
  private readonly USER_CACHE_TTL = 5 * 60 * 1000; // 5 минут

  constructor(private client: ApiClient) {}

  /**
   * Инвалидация кеша /user/me
   * Вызывается после операций, изменяющих данные пользователя
   */
  private invalidateUserCache(): void {
    this.userMeCache = null;
    this.userMeCacheTimestamp = 0;
    this.userMePendingPromise = null;
  }

  /**
   * Инвалидация кеша /supa_points/balance
   */
  private invalidateSupaPointsCache(): void {
    this.supaPointsBalanceCache = null;
    this.supaPointsBalanceCacheTimestamp = 0;
    this.supaPointsBalancePendingPromise = null;
  }

  /**
   * Инвалидация кеша /privy/balance
   */
  private invalidatePrivyBalanceCache(): void {
    this.privyBalanceCache = null;
    this.privyBalanceCacheTimestamp = 0;
    this.privyBalancePendingPromise = null;
  }

  // ============= User Methods =============

  /**
   * Get current user information
   * GET /user/me
   * С мемоизацией на 5 минут и дедупликацией одновременных запросов
   */
  async getCurrentUser(force: boolean = false): Promise<UserResponseDto> {
    const now = Date.now();
    
    // Если кеш актуален и не требуется принудительное обновление
    if (!force && this.userMeCache && (now - this.userMeCacheTimestamp) < this.USER_CACHE_TTL) {
      return this.userMeCache;
    }

    // Если запрос уже выполняется, возвращаем тот же промис
    if (this.userMePendingPromise) {
      return this.userMePendingPromise;
    }

    // Создаём промис для загрузки данных
    this.userMePendingPromise = this.client.get<UserResponseDto>('/user/me')
      .then((data) => {
        // Обновляем кеш
        this.userMeCache = data;
        this.userMeCacheTimestamp = Date.now();
        this.userMePendingPromise = null;
        return data;
      })
      .catch((error) => {
        // Сбрасываем pending при ошибке
        this.userMePendingPromise = null;
        throw error;
      });
    
    return this.userMePendingPromise;
  }

  /**
   * Get all users
   * GET /user/all
   */
  async getAllUsers(): Promise<UserResponseDto[]> {
    return await this.client.get<UserResponseDto[]>('/user/all');
  }

  /**
   * Get user by Privy user ID
   * GET /user/{privyUserId}
   */
  async getUserByPrivyId(privyUserId: string): Promise<UserResponseDto> {
    return await this.client.get<UserResponseDto>(`/user/${privyUserId}`);
  }

  /**
   * Get current user's smart wallet token balances
   * GET /user/smart_wallet_balances
   */
  async getSmartWalletBalances(force: boolean = false): Promise<UserBalanceResponseDto> {
    return await this.client.get<UserBalanceResponseDto>(
      '/user/smart_wallet_balances',
      { params: { force } }
    );
  }

  // ============= Dialog Methods =============

  /**
   * Create new dialog
   * POST /dialogs
   */
  async createDialog(text: string): Promise<DialogWithMessagesResponseDto> {
    return await this.client.post<DialogWithMessagesResponseDto>(
      '/dialogs',
      { text } as NewDialogRequestDto
    );
  }

  /**
   * Get all user dialogs
   * GET /dialogs
   */
  async getAllDialogs(params?: PaginationParams): Promise<OffsetPaginatedDto<DialogListResponseDto>> {
    return await this.client.get<OffsetPaginatedDto<DialogListResponseDto>>(
      '/dialogs',
      { params }
    );
  }

  /**
   * Get specific dialog
   * GET /dialogs/{id}
   */
  async getDialog(id: number): Promise<DialogListResponseDto> {
    return await this.client.get<DialogListResponseDto>(`/dialogs/${id}`);
  }

  /**
   * Delete dialog
   * DELETE /dialogs/{id}
   */
  async deleteDialog(id: number): Promise<void> {
    return await this.client.delete<void>(`/dialogs/${id}`);
  }

  // ============= Message Methods =============

  /**
   * Create new message in dialog
   * POST /dialogs/{dialogId}/messages
   */
  async createMessage(dialogId: number, text: string): Promise<MessageResponseDto> {
    return await this.client.post<MessageResponseDto>(
      `/dialogs/${dialogId}/messages`,
      { text } as NewMessageRequestDto
    );
  }

  /**
   * Get all messages in dialog
   * GET /dialogs/{dialogId}/messages
   */
  async getDialogMessages(
    dialogId: number,
    params?: PaginationParams
  ): Promise<OffsetPaginatedDto<MessageResponseDto>> {
    return await this.client.get<OffsetPaginatedDto<MessageResponseDto>>(
      `/dialogs/${dialogId}/messages`,
      { params }
    );
  }

  /**
   * Get specific message
   * GET /messages/{id}
   */
  async getMessage(id: number): Promise<MessageResponseDto> {
    return await this.client.get<MessageResponseDto>(`/messages/${id}`);
  }

  // ============= OnChain Methods =============

  /**
   * Get token prices by contract addresses
   * POST /onchain/tokens_prices_by_addresses
   */
  async getTokenPricesByAddresses(
    addresses: Array<{ network: AlchemyNetwork; contractAddress: string }>
  ): Promise<NetworkAddressAndPriceDto[]> {
    return await this.client.post<NetworkAddressAndPriceDto[]>(
      '/onchain/tokens_prices_by_addresses',
      { addresses } as GetPricesByAddressesBodyDto
    );
  }

  /**
   * Get token prices by symbols
   * GET /onchain/tokens_prices
   * @param symbols Array of token symbols (e.g., ['BTC', 'ETH', 'USDT'])
   */
  async getTokenPrices(symbols: string[]): Promise<Record<string, number>> {
    return await this.client.get<Record<string, number>>(
      '/onchain/tokens_prices',
      { params: { symbols: symbols.join(',') } }
    );
  }

  /**
   * Get token price history
   * GET /onchain/token_price_history
   */
  async getTokenPriceHistory(params: TokenPriceHistoryParams): Promise<TokenPriceHistoryResponse> {
    return await this.client.get<TokenPriceHistoryResponse>(
      '/onchain/token_price_history',
      { params }
    );
  }

  /**
   * Get 24hr price changes for tokens
   * POST /onchain/tokens_24hr_changes
   */
  async getTokens24hrPriceChanges(
    tokens: Array<{ network: AlchemyNetwork; contractAddress: string }>
  ): Promise<TokenInfoWithPriceChangeDto[]> {
    return await this.client.post<TokenInfoWithPriceChangeDto[]>(
      '/onchain/tokens_24hr_changes',
      { tokens } as GetTokens24hrPriceChangeParams
    );
  }

  /**
   * Get token info by address(es)
   * GET /onchain/token_info/{network}
   * @param network Blockchain network
   * @param addresses Single address or array of addresses
   */
  async getTokenInfo(
    network: string,
    addresses: string | string[]
  ): Promise<Record<string, TokenInfo>> {
    const token = Array.isArray(addresses) ? addresses.join(',') : addresses;
    return await this.client.get<Record<string, TokenInfo>>(
      `/onchain/token_info/${network}`,
      { params: { token } }
    );
  }

  /**
   * Get account token balances
   * GET /onchain/account_tokens_balances/{network}
   */
  async getAccountTokenBalances(
    network: string,
    account: string,
    force: boolean = false
  ): Promise<AccountTokensBalancesResponse> {
    return await this.client.get<AccountTokensBalancesResponse>(
      `/onchain/account_tokens_balances/${network}`,
      { params: { account, force } }
    );
  }

  // ============= Transaction Methods =============

  /**
   * Get user transactions
   * GET /transactions
   */
  async getTransactions(params?: TransactionQueryParams): Promise<any> {
    return await this.client.get<any>('/transactions', { params });
  }

  /**
   * Force load user transactions
   * POST /transactions/transactions_force
   */
  async forceLoadTransactions(params?: TransactionQueryParams): Promise<any> {
    return await this.client.post<any>('/transactions/transactions_force', null, { params });
  }

  // ============= SupaPoints Methods =============

  /**
   * Get SupaPoints balance
   * GET /supa_points/balance
   * С мемоизацией на 5 минут и дедупликацией одновременных запросов
   */
  async getSupaPointsBalance(force: boolean = false): Promise<SupaPointsBalanceResponseDto> {
    const now = Date.now();
    
    // Если кеш актуален и не требуется принудительное обновление
    if (!force && this.supaPointsBalanceCache && (now - this.supaPointsBalanceCacheTimestamp) < this.USER_CACHE_TTL) {
      return this.supaPointsBalanceCache;
    }

    // Если запрос уже выполняется, возвращаем тот же промис
    if (this.supaPointsBalancePendingPromise) {
      return this.supaPointsBalancePendingPromise;
    }

    // Создаём промис для загрузки данных
    this.supaPointsBalancePendingPromise = this.client.get<SupaPointsBalanceResponseDto>('/supa_points/balance')
      .then((data) => {
        // Обновляем кеш
        this.supaPointsBalanceCache = data;
        this.supaPointsBalanceCacheTimestamp = Date.now();
        this.supaPointsBalancePendingPromise = null;
        return data;
      })
      .catch((error) => {
        // Сбрасываем pending при ошибке
        this.supaPointsBalancePendingPromise = null;
        throw error;
      });
    
    return this.supaPointsBalancePendingPromise;
  }

  /**
   * Get SupaPoints history
   * GET /supa_points/history
   */
  async getSupaPointsHistory(
    params?: SupaPointsHistoryParams
  ): Promise<OffsetPaginatedDto<any>> {
    return await this.client.get<OffsetPaginatedDto<any>>(
      '/supa_points/history',
      { params }
    );
  }

  /**
   * Process daily login
   * POST /supa_points/daily_login
   */
  async dailyLogin(): Promise<DailyLoginResponseDto> {
    const result = await this.client.post<DailyLoginResponseDto>('/supa_points/daily_login');
    // Инвалидируем кеш баланса после начисления
    this.invalidateSupaPointsCache();
    return result;
  }

  // ============= Paymaster Methods =============

  /**
   * Check if paymaster can sponsor user operation
   * POST /paymaster
   */
  async checkPaymasterSponsorship(request: PaymasterRequestDto): Promise<PaymasterResponseDto> {
    return await this.client.post<PaymasterResponseDto>('/paymaster', request);
  }

  // ============= Privy Balance =============

  /**
   * Get Privy balance
   * GET /privy/balance
   * С мемоизацией на 5 минут и дедупликацией одновременных запросов
   */
  async getPrivyBalance(force: boolean = false): Promise<any> {
    const now = Date.now();
    
    // Если кеш актуален и не требуется принудительное обновление
    if (!force && this.privyBalanceCache && (now - this.privyBalanceCacheTimestamp) < this.USER_CACHE_TTL) {
      return this.privyBalanceCache;
    }

    // Если запрос уже выполняется, возвращаем тот же промис
    if (this.privyBalancePendingPromise) {
      return this.privyBalancePendingPromise;
    }

    // Создаём промис для загрузки данных
    this.privyBalancePendingPromise = this.client.get<any>('/privy/balance')
      .then((data) => {
        // Обновляем кеш
        this.privyBalanceCache = data;
        this.privyBalanceCacheTimestamp = Date.now();
        this.privyBalancePendingPromise = null;
        return data;
      })
      .catch((error) => {
        // Сбрасываем pending при ошибке
        this.privyBalancePendingPromise = null;
        throw error;
      });
    
    return this.privyBalancePendingPromise;
  }
}

// Singleton instance
let apiServiceInstance: ApiService | null = null;

export function createApiService(client: ApiClient): ApiService {
  apiServiceInstance = new ApiService(client);
  return apiServiceInstance;
}

export function getApiService(): ApiService {
  if (!apiServiceInstance) {
    throw new Error('ApiService not initialized. Call createApiService first or use SDK within SupaProvider.');
  }
  return apiServiceInstance;
}

