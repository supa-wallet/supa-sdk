import { useState, useCallback } from 'react';
import { useSupaContext } from '../providers/SupaProvider';
import type { CantonEstimateGasResponseDto } from '../core/types';

export interface UseEstimateGasReturn {
  estimateGas: (
    commands: unknown,
    disclosedContracts?: unknown
  ) => Promise<CantonEstimateGasResponseDto | null>;
  loading: boolean;
  error: Error | null;
  clearError: () => void;
}

export function useEstimateGas(): UseEstimateGasReturn {
  const { cantonService } = useSupaContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const estimateGas = useCallback(
    async (
      commands: unknown,
      disclosedContracts?: unknown
    ): Promise<CantonEstimateGasResponseDto | null> => {
      setError(null);
      setLoading(true);
      try {
        return await cantonService.estimateGas(commands, disclosedContracts);
      } catch (err: any) {
        const e = new Error(`Failed to estimate gas: ${err.message}`);
        setError(e);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [cantonService]
  );

  return { estimateGas, loading, error, clearError };
}
