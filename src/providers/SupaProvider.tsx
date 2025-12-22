import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { PrivyProvider, PrivyClientConfig } from '@privy-io/react-auth';
import { Buffer } from 'buffer';
import { createApiClient, ApiClient } from '../core/client';
import { CantonService } from '../services/cantonService';
import { ApiService } from '../services/apiService';
import { ConfirmationModal, SignMessageModal, SignTransactionModal } from '../components/ConfirmationModal';

// Initialize Buffer polyfill for browser (required by Privy SDK)
if (typeof window !== 'undefined' && !(window as any).Buffer) {
  (window as any).Buffer = Buffer;
  console.log('[Supa SDK] ✅ Buffer polyfill initialized');
}

export interface SupaConfig {
  privyAppId: string;
  privyClientId?: string;
  apiBaseUrl?: string;
  appearance?: {
    theme?: 'light' | 'dark';
    accentColor?: string;
    logo?: string;
  };
  loginMethods?: Array<'email' | 'wallet' | 'google' | 'twitter' | 'discord' | 'github' | 'linkedin'>;
}
export interface ConfirmModalOptions {
  title?: string;
  message: string;
  confirmText?: string;
  rejectText?: string;
  description?: string;
  infoText?: string;
  icon?: ReactNode;
}

export interface SignTransactionOptions {
  transaction: string;
  title?: string;
  description?: string;
  confirmText?: string;
  rejectText?: string;
  infoText?: string;
}

export interface ModalResult<T = void> {
  confirmed: boolean;
  data?: T;
}

export interface SignMessageModalOptions {
  message: string;
  title?: string;
  description?: string;
  confirmText?: string;
  rejectText?: string;
  infoText?: string;
}

export interface SupaContextValue {
  apiClient: ApiClient;
  cantonService: CantonService;
  apiService: ApiService;
  config: SupaConfig;
  theme: 'light' | 'dark';
  confirm: (options: ConfirmModalOptions) => Promise<ModalResult>;
  signMessageConfirm: (options: SignMessageModalOptions) => Promise<ModalResult>;
  signTransactionConfirm: (options: SignTransactionOptions) => Promise<ModalResult>;
  setModalLoading: (loading: boolean) => void;
  closeModal: () => void;
}

const SupaContext = createContext<SupaContextValue | null>(null);
type ModalType = 'confirm' | 'signMessage' | 'signTransaction';

interface ModalState {
  type: ModalType | null;
  options: ConfirmModalOptions | SignMessageModalOptions | SignTransactionOptions | null;
  resolve: ((result: ModalResult) => void) | null;
  loading: boolean;
}

export interface SupaProviderProps {
  config: SupaConfig;
  children: ReactNode;
}

export function SupaProvider({ config, children }: SupaProviderProps) {
  const [services, setServices] = useState<{
    apiClient: ApiClient;
    cantonService: CantonService;
    apiService: ApiService;
  } | null>(null);

  // Modal state
  const [modalState, setModalState] = useState<ModalState>({
    type: null,
    options: null,
    resolve: null,
    loading: false,
  });

  useEffect(() => {
    const apiClient = createApiClient({
      baseURL: config.apiBaseUrl,
    });

    const cantonService = new CantonService(apiClient);
    const apiService = new ApiService(apiClient);

    setServices({ apiClient, cantonService, apiService });
  }, [config]);

  // Modal methods
  const createModalConfirm = useCallback(
    (type: ModalType) => (options: any): Promise<ModalResult> =>
      new Promise((resolve) => setModalState({ type, options, resolve, loading: false })),
    []
  );

  const confirm = useCallback(createModalConfirm('confirm'), [createModalConfirm]);
  const signMessageConfirm = useCallback(createModalConfirm('signMessage'), [createModalConfirm]);
  const signTransactionConfirm = useCallback(createModalConfirm('signTransaction'), [createModalConfirm]);

  const setModalLoading = useCallback((loading: boolean) => {
    setModalState((prev) => ({ ...prev, loading }));
  }, []);

  const closeModal = useCallback(() => {
    if (modalState.resolve) {
      modalState.resolve({ confirmed: false });
    }
    setModalState({ type: null, options: null, resolve: null, loading: false });
  }, [modalState.resolve]);

  const handleConfirm = useCallback(() => {
    if (modalState.resolve) {
      modalState.resolve({ confirmed: true });
    }
    setModalState({ type: null, options: null, resolve: null, loading: false });
  }, [modalState.resolve]);

  const handleReject = useCallback(() => {
    if (modalState.resolve) {
      modalState.resolve({ confirmed: false });
    }
    setModalState({ type: null, options: null, resolve: null, loading: false });
  }, [modalState.resolve]);

  if (!services) {
    return null;
  }

  // Get current theme (reactive to config changes)
  const theme = config.appearance?.theme || 'light';
  const themeClass = theme === 'dark' ? 'privy-dark' : 'privy-light';

  // Privy configuration
  const privyConfig: PrivyClientConfig = {
    embeddedWallets: {
      showWalletUIs: true,
    },
    appearance: {
      theme,
      accentColor: config.appearance?.accentColor ? `#${config.appearance.accentColor.replace('#', '')}` as `#${string}` : undefined,
      logo: config.appearance?.logo,
    },
    loginMethods: config.loginMethods || ['email', 'wallet'],
  };

  const contextValue: SupaContextValue = {
    ...services,
    config,
    theme,
    confirm,
    signMessageConfirm,
    signTransactionConfirm,
    setModalLoading,
    closeModal,
  };

  const isOpen = modalState.type !== null;
  const isConfirmModal = modalState.type === 'confirm';
  const isSignMessageModal = modalState.type === 'signMessage';
  const isSignTransactionModal = modalState.type === 'signTransaction';

  return (
    <PrivyProvider
      appId={config.privyAppId}
      clientId={config.privyClientId}
      config={privyConfig}
    >
      <SupaContext.Provider value={contextValue}>
        <div className={themeClass}>
          {children}

          {/* Confirmation Modal */}
          {isConfirmModal && modalState.options && (
            <ConfirmationModal
              open={isOpen}
              onClose={handleReject}
              onConfirm={handleConfirm}
              onReject={handleReject}
              loading={modalState.loading}
              {...(modalState.options as ConfirmModalOptions)}
            />
          )}

          {/* Sign Message Modal */}
          {isSignMessageModal && modalState.options && (
            <SignMessageModal
              open={isOpen}
              onClose={handleReject}
              onConfirm={handleConfirm}
              onReject={handleReject}
              loading={modalState.loading}
              {...(modalState.options as SignMessageModalOptions)}
            />
          )}

          {/* Sign Transaction Modal */}
          {isSignTransactionModal && modalState.options && (
            <SignTransactionModal
              open={isOpen}
              onClose={handleReject}
              onConfirm={handleConfirm}
              onReject={handleReject}
              loading={modalState.loading}
              {...(modalState.options as SignTransactionOptions)}
            />
          )}
        </div>
      </SupaContext.Provider>
    </PrivyProvider>
  );
}

export function useSupaContext(): SupaContextValue {
  const context = useContext(SupaContext);
  
  if (!context) {
    throw new Error('useSupaContext must be used within SupaProvider');
  }
  
  return context;
}

