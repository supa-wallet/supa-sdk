/**
 * Canton Network Service
 * Handles Canton wallet registration, transactions, and devnet tap
 */

import type { ApiClient } from '../core/client';
import type {
  CantonPrepareRegisterRequestDto,
  CantonPrepareTransactionResponseDto,
  CantonSubmitRegisterRequestDto,
  CantonSubmitTransactionResponseDto,
  CantonPrepareTapRequestDto,
  CantonMeResponseDto,
  CantonActiveContractsResponseDto,
  CantonPrepareTransactionRequestDto,
  CantonQueryCompletionResponseDto,
  CantonWalletBalancesResponseDto,
  CantonPrepareAmuletTransferRequestDto,
  CantonIncomingTransferDto,
  CantonPrepareResponseIncomingTransferRequestDto,
  CantonCostEstimationDto,
  CantonTransactionDto,
  CantonTransactionsParams,
  CantonPriceInterval,
  CantonPriceCandleDto,
} from '../core/types';
import { base64ToHex, hexToBase64 } from '../utils/converters';

// Re-export types for external use
export type {
  CantonMeResponseDto,
  CantonActiveContractsResponseDto,
  CantonPrepareTransactionResponseDto,
  CantonQueryCompletionResponseDto,
  CantonWalletBalancesResponseDto,
  CantonPrepareAmuletTransferRequestDto,
  CantonIncomingTransferDto,
  CantonPrepareResponseIncomingTransferRequestDto,
  CantonCostEstimationDto,
  CantonTransactionDto,
  CantonTransactionsParams,
  CantonPriceInterval,
  CantonPriceCandleDto,
};

export interface CantonRegisterParams {
  /** Base64 public key from Stellar wallet */
  publicKey: string;
  /** Function to sign hash (returns signature in hex) */
  signFunction: (hashHex: string) => Promise<string>;
  /** Optional invite code */
  inviteCode?: string;
}

export interface CantonTapParams {
  /** Amount of Canton coins to receive */
  amount: string;
  /** Function to sign hash (returns signature in hex) */
  signFunction: (hashHex: string) => Promise<string>;
}

export interface CantonSubmitPreparedOptions {
  /** Timeout in milliseconds to wait for completion (default: 30000) */
  timeout?: number;
  /** Polling interval in milliseconds (default: 1000) */
  pollInterval?: number;
  /** Callback to receive cost estimation before signing (optional) */
  onCostEstimation?: (costEstimation: CantonCostEstimationDto | undefined) => void | Promise<void>;
}

export class CantonService {
  private meCache: CantonMeResponseDto | null = null;
  private meCacheTimestamp: number = 0;
  private mePendingPromise: Promise<CantonMeResponseDto> | null = null;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(private client: ApiClient) {}

  /**
   * Invalidate /me cache
   * Called after registration/user modification operations
   */
  private invalidateMeCache(): void {
    this.meCache = null;
    this.meCacheTimestamp = 0;
    this.mePendingPromise = null;
  }

  /**
   * Register Canton wallet
   * Flow:
   * 1. Call /canton/register/prepare with publicKey -> get hash
   * 2. Sign hash with Stellar wallet
   * 3. Call /canton/register/submit with hash + signature
   * 
   * @param params Registration parameters
   */
  async registerCanton(params: CantonRegisterParams, errCounter = 0): Promise<any> {
    if (errCounter > 4) throw new Error('Failed to register Canton wallet after multiple attempts');
    const { publicKey, signFunction, inviteCode } = params;
    
    // Step 1: Prepare registration - get hash to sign
    // let prepareResponse;
    const getResponse = async () => {
      try {
        const requestBody: CantonPrepareRegisterRequestDto = { publicKey };
        if (inviteCode) {
          requestBody.inviteCode = inviteCode;
        }
        
        const res = await this.client.post<CantonPrepareTransactionResponseDto>(
          '/canton/register/prepare',
          requestBody
        );
        return res;
      } catch (error: any) {
        console.log('[Canton Service] Registration prepare error:', error);
        
        // If wallet already exists, it's OK - user is already registered
        // Check for both error code 400 and specific error message/type
        if (error?.statusCode === 400 && 
            (error?.error === 'CantonWalletAlreadyExistsError' || 
             (typeof error?.message === 'string' && error.message.toLowerCase().includes("canton wallet already exists")))) {
          console.log('[Canton Service] ✅ Canton wallet already exists - treating as registered');
          return 'registered';
        }
        
        // Don't retry for mainnet access errors - these are permission issues
        if (error?.error === 'CantonMainnetNodeNotEnabledForThisUser' || 
            error?.message?.includes('enable mainnet node access')) {
          throw error;
        }
        
        // Don't retry for invite code validation errors - these are user input errors
        if (error?.error === 'CantonInviteCodeAlreadyUsedOrInvalid' ||
            (error?.statusCode === 400 && 
             (error?.message?.toLowerCase().includes('invite code') ||
              error?.message?.toLowerCase().includes('invitecode')))) {
          throw error;
        }
        
        // Retry for other errors after delay
        console.log('[Canton Service] Retrying registration after error...');
        await new Promise(resolve => setTimeout(resolve, 1500));
        return this.registerCanton(params, errCounter + 1);
      }
    }

    const prepareResponse = await getResponse();
    if (!prepareResponse) {
      return;
    }

    if (prepareResponse === 'registered') {
      return 'registered';
    }
    

    const hashBase64 = prepareResponse.hash;

    // Step 2: Convert hash to hex for Privy signing
    const hashHex = base64ToHex(hashBase64);

    // Step 3: Sign hash using Privy
    const signatureHex = await signFunction(hashHex);

    // Step 4: Convert signature to base64 for Canton
    const signatureBase64 = hexToBase64(signatureHex);

    // Step 5: Submit signed transaction
    await this.client.post<void>(
      '/canton/register/submit',
      {
        hash: hashBase64,
        signature: signatureBase64,
      } as CantonSubmitRegisterRequestDto
    );

    // Invalidate cache after successful registration
    this.invalidateMeCache();
  }

  /**
   * Tap devnet faucet to receive test Canton coins
   * Flow:
   * 1. Call /canton/devnet/tap with amount -> get hash
   * 2. Sign hash with Stellar wallet
   * 3. Call /canton/api/submit_prepared with hash + signature
   * 4. Poll for completion
   * 
   * @param params Tap parameters
   * @param options Polling options
   */
  async tapDevnet(
    params: CantonTapParams,
    options?: CantonSubmitPreparedOptions
  ): Promise<CantonQueryCompletionResponseDto> {
    const { amount, signFunction } = params;
    
    // Step 1: Prepare tap transaction - get hash to sign
    const prepareResponse = await this.client.post<CantonPrepareTransactionResponseDto>(
      '/canton/devnet/tap',
      { amount } as CantonPrepareTapRequestDto
    );

    // Call onCostEstimation callback if provided
    if (options?.onCostEstimation && prepareResponse.costEstimation) {
      await options.onCostEstimation(prepareResponse.costEstimation);
    }

    const hashBase64 = prepareResponse.hash;

    // Step 2: Convert hash to hex for Privy signing
    const hashHex = base64ToHex(hashBase64);

    // Step 3: Sign hash using Privy
    const signatureHex = await signFunction(hashHex);

    // Step 4: Convert signature to base64 for Canton
    const signatureBase64 = hexToBase64(signatureHex);

    // Step 5: Submit signed transaction and wait for completion
    return await this.submitPreparedAndWait(hashBase64, signatureBase64, options);
  }

  /**
   * Submit signed Canton transaction
   * @param hash Base64 hash
   * @param signature Base64 signature
   */
  async submitPrepared(
    hash: string,
    signature: string
  ): Promise<CantonSubmitTransactionResponseDto> {
    return await this.client.post<CantonSubmitTransactionResponseDto>(
      '/canton/api/submit_prepared',
      {
        hash,
        signature,
      } as CantonSubmitRegisterRequestDto
    );
  }

  /**
   * Query completion status for a submission
   * @param submissionId Submission ID from submitPrepared
   */
  async queryCompletion(submissionId: string): Promise<CantonQueryCompletionResponseDto> {
    return await this.client.get<CantonQueryCompletionResponseDto>(
      `/canton/api/query_completion?submissionId=${encodeURIComponent(submissionId)}`
    );
  }

  /**
   * Submit signed Canton transaction and wait for completion
   * Polls the ledger API until the transaction is completed or timeout is reached
   * @param hash Base64 hash
   * @param signature Base64 signature
   * @param options Polling options (timeout, pollInterval)
   * @returns Completion data when transaction is completed
   * @throws Error if timeout is reached before completion
   */
  async submitPreparedAndWait(
    hash: string,
    signature: string,
    options: CantonSubmitPreparedOptions = {}
  ): Promise<CantonQueryCompletionResponseDto> {
    const { timeout = 30000, pollInterval = 1000 } = options;
    
    // Submit the transaction
    const submitResponse = await this.submitPrepared(hash, signature);
    const { submissionId } = submitResponse;
    
    // Poll for completion
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const completionResponse = await this.queryCompletion(submissionId);
      
      if (completionResponse.status === 'completed') {
        // Invalidate cache after successful transaction
        this.invalidateMeCache();
        return completionResponse;
      }
      
      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
    
    throw new Error(`Transaction completion timeout after ${timeout}ms for submissionId: ${submissionId}`);
  }

  /**
   * Get current Canton user info (partyId and email)
   * Only works after registration
   * With 5 minute caching and request deduplication
   */
  async getMe(force: boolean = false): Promise<CantonMeResponseDto> {
    const now = Date.now();
    
    // If cache is valid and force refresh is not required
    if (!force && this.meCache && (now - this.meCacheTimestamp) < this.CACHE_TTL) {
      return this.meCache;
    }

    // If request is already in progress, return the same promise
    if (this.mePendingPromise) {
      return this.mePendingPromise;
    }

    // Create promise for loading data
    this.mePendingPromise = this.client.get<CantonMeResponseDto>('/canton/api/me')
      .then((data) => {
        // Update cache
        this.meCache = data;
        this.meCacheTimestamp = Date.now();
        this.mePendingPromise = null;
        return data;
      })
      .catch((error) => {
        // Reset pending on error
        this.mePendingPromise = null;
        throw error;
      });
    
    return this.mePendingPromise;
  }

  /**
   * Get active contracts with optional template filtering
   * Returns array of active contract items with full contract details
   * @param templateIds Optional array of template IDs to filter by
   */
  async getActiveContracts(
    templateIds?: string[]
  ): Promise<CantonActiveContractsResponseDto> {
    const params = new URLSearchParams();
    if (templateIds) {
      templateIds.forEach(id => params.append('templateIds', id));
    }
    
    const queryString = params.toString();
    const url = queryString 
      ? `/canton/api/active_contracts?${queryString}`
      : '/canton/api/active_contracts';
    
    // API returns array directly, not wrapped in an object
    return await this.client.get<CantonActiveContractsResponseDto>(url);
  }

  /**
   * Sign text message (client-side only, no backend call)
   * Converts text to bytes and signs with Stellar wallet
   * @param message Text message to sign
   * @param signFunction Function to sign hash (returns signature in hex)
   */
  async signMessage(
    message: string,
    signFunction: (hashHex: string) => Promise<string>
  ): Promise<string> {
    // Convert message to bytes
    const encoder = new TextEncoder();
    const messageBytes = encoder.encode(message);
    
    // Hash the message using SHA-256
    const hashBuffer = await crypto.subtle.digest('SHA-256', messageBytes);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Sign and return signature in hex
    return await signFunction(hashHex);
  }

  /**
   * Prepare Canton transaction
   * @param commands Command or array of commands
   * @param disclosedContracts Optional disclosed contracts
   */
  async prepareTransaction(
    commands: unknown,
    disclosedContracts?: unknown
  ): Promise<CantonPrepareTransactionResponseDto> {
    return await this.client.post<CantonPrepareTransactionResponseDto>(
      '/canton/api/prepare_transaction',
      { commands, disclosedContracts } as CantonPrepareTransactionRequestDto
    );
  }

  /**
   * Check if user has Canton wallet registered
   * This is inferred - if /me succeeds, user has wallet
   */
  async checkRegistrationStatus(): Promise<boolean> {
    try {
      await this.getMe();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Prepare transfer preapproval
   * Flow: prepare -> sign -> submit
   * No request body required
   */
  async prepareTransferPreapproval(): Promise<CantonPrepareTransactionResponseDto> {
    const result = await this.client.post<CantonPrepareTransactionResponseDto>(
      '/canton/api/prepare_transfer_preapproval',
      {}
    );
    // Invalidate cache after preapproval
    this.invalidateMeCache();
    return result;
  }

  /**
   * Get Canton wallet balances
   * Returns balances for all tokens grouped by instrument ID
   * Includes unlocked and locked UTXOs
   */
  async getBalances(): Promise<CantonWalletBalancesResponseDto> {
    return await this.client.get<CantonWalletBalancesResponseDto>(
      '/canton/api/balances'
    );
  }

  /**
   * Prepare Amulet (Canton Coin) transfer
   * @param params Transfer parameters (receiverPartyId, amount, memo)
   * @throws Error if amount has more than 10 decimal places
   */
  async prepareAmuletTransfer(
    params: CantonPrepareAmuletTransferRequestDto
  ): Promise<CantonPrepareTransactionResponseDto> {
    // Validate decimal places (max 10)
    const decimalParts = params.amount.split('.');
    if (decimalParts.length > 1 && decimalParts[1].length > 10) {
      throw new Error(
        `Amount cannot have more than 10 decimal places. Got: ${decimalParts[1].length}`
      );
    }

    const result = await this.client.post<CantonPrepareTransactionResponseDto>(
      '/canton/transfers/prepare_amulet_transfer',
      params
    );
    
    // Invalidate cache after transfer preparation
    this.invalidateMeCache();
    return result;
  }

  /**
   * Get pending incoming transfers for the current user
   * Returns a list of transfer offers that can be accepted or rejected
   * @returns Array of incoming transfer DTOs
   */
  async getPendingIncomingTransfers(): Promise<CantonIncomingTransferDto[]> {
    return await this.client.get<CantonIncomingTransferDto[]>(
      '/canton/transfers/pending_incoming_transfers'
    );
  }

  /**
   * Prepare response to incoming transfer (accept or reject)
   * Flow: prepare -> sign -> submit
   * @param params Request with contractId and accept flag
   * @returns Prepare response with hash to sign
   */
  async prepareResponseToIncomingTransfer(
    params: CantonPrepareResponseIncomingTransferRequestDto
  ): Promise<CantonPrepareTransactionResponseDto> {
    return await this.client.post<CantonPrepareTransactionResponseDto>(
      '/canton/transfers/prepare_response_to_incoming_transfer',
      params
    );
  }

  /**
   * Get Canton transactions history with pagination
   * @param params Pagination parameters (limit, beforeOffsetExclusive)
   * @returns Array of transaction DTOs
   */
  async getTransactions(
    params: CantonTransactionsParams = {}
  ): Promise<CantonTransactionDto[]> {
    const { limit = 20, beforeOffsetExclusive } = params;
    
    const queryParams = new URLSearchParams();
    queryParams.append('limit', String(limit));
    
    if (beforeOffsetExclusive !== undefined) {
      queryParams.append('beforeOffsetExclusive', String(beforeOffsetExclusive));
    }
    
    return await this.client.get<CantonTransactionDto[]>(
      `/canton/api/transactions?${queryParams.toString()}`
    );
  }

  /**
   * Get Canton price history (candles from Bybit)
   * @param interval Time interval: '1h' (hour), '1d' (day), '1w' (week), '1M' (month)
   * @returns Array of price candles
   */
  async getPriceHistory(
    interval: CantonPriceInterval
  ): Promise<CantonPriceCandleDto[]> {
    return await this.client.get<CantonPriceCandleDto[]>(
      `/canton/prices/history?interval=${encodeURIComponent(interval)}`
    );
  }
}

// Singleton instance
let cantonServiceInstance: CantonService | null = null;

export function createCantonService(client: ApiClient): CantonService {
  cantonServiceInstance = new CantonService(client);
  return cantonServiceInstance;
}

export function getCantonService(): CantonService {
  if (!cantonServiceInstance) {
    throw new Error('CantonService not initialized. Call createCantonService first or use SDK within SupaProvider.');
  }
  return cantonServiceInstance;
}

