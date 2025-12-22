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
} from '../core/types';
import { base64ToHex, hexToBase64 } from '../utils/converters';

// Re-export types for external use
export type {
  CantonMeResponseDto,
  CantonActiveContractsResponseDto,
  CantonPrepareTransactionResponseDto,
  CantonQueryCompletionResponseDto,
};

export interface CantonRegisterParams {
  /** Base64 public key from Stellar wallet */
  publicKey: string;
  /** Function to sign hash (returns signature in hex) */
  signFunction: (hashHex: string) => Promise<string>;
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
}

export class CantonService {
  constructor(private client: ApiClient) {}

  /**
   * Register Canton wallet
   * Flow:
   * 1. Call /canton/register/prepare with publicKey -> get hash
   * 2. Sign hash with Stellar wallet
   * 3. Call /canton/register/submit with hash + signature
   * 
   * @param params Registration parameters
   */
  async registerCanton(params: CantonRegisterParams): Promise<void> {
    const { publicKey, signFunction } = params;
    
    // Step 1: Prepare registration - get hash to sign
    const prepareResponse = await this.client.post<CantonPrepareTransactionResponseDto>(
      '/canton/register/prepare',
      { publicKey } as CantonPrepareRegisterRequestDto
    );

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
   */
  async getMe(): Promise<CantonMeResponseDto> {
    return await this.client.get<CantonMeResponseDto>('/canton/api/me');
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
      templateIds.forEach(id => params.append('templateId', id));
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
   * @param commandId Command or array of commands
   * @param disclosedContracts Optional disclosed contracts
   */
  async prepareTransaction(
    commandId: unknown,
    disclosedContracts?: unknown
  ): Promise<CantonPrepareTransactionResponseDto> {
    return await this.client.post<CantonPrepareTransactionResponseDto>(
      '/canton/api/prepare_transaction',
      { commandId, disclosedContracts } as CantonPrepareTransactionRequestDto
    );
  }

  /**
   * Check if user has Canton wallet registered
   * This is inferred - if registration succeeds, user has wallet
   * If it fails with 409 or similar, wallet already exists
   */
  async checkRegistrationStatus(): Promise<boolean> {
    try {
      await this.getMe();
      return true;
    } catch (error) {
      return false;
    }
  }
}

