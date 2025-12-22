/**
 * Access to confirmation modal functionality
 * 
 * Provides low-level access to SDK modals
 */

import { useSupaContext, type ConfirmModalOptions, type SignMessageModalOptions, type SignTransactionOptions, type ModalResult } from '../providers/SupaProvider';

export interface UseConfirmModalReturn {
  /** Show a generic confirmation modal */
  confirm: (options: ConfirmModalOptions) => Promise<ModalResult>;
  /** Show a message signing confirmation modal */
  signMessageConfirm: (options: SignMessageModalOptions) => Promise<ModalResult>;
  /** Show a transaction signing confirmation modal */
  signTransactionConfirm: (options: SignTransactionOptions) => Promise<ModalResult>;
  /** Set loading state for current modal */
  setModalLoading: (loading: boolean) => void;
  /** Close current modal */
  closeModal: () => void;
}
export function useConfirmModal(): UseConfirmModalReturn {
  const { confirm, signMessageConfirm, signTransactionConfirm, setModalLoading, closeModal } = useSupaContext();

  return {
    confirm,
    signMessageConfirm,
    signTransactionConfirm,
    setModalLoading,
    closeModal,
  };
}

export type { ConfirmModalOptions, SignMessageModalOptions, SignTransactionOptions, ModalResult };

