import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { PrivyProvider, PrivyClientConfig } from '@privy-io/react-auth';
import { SmartWalletsProvider } from '@privy-io/react-auth/smart-wallets';
import { Buffer } from 'buffer';
import { createApiClient, ApiClient } from '../core/client';
import { CantonService, createCantonService } from '../services/cantonService';
import { ApiService, createApiService } from '../services/apiService';
import { ConfirmationModal, SignMessageModal, SignTransactionModal } from '../components/ConfirmationModal';
import { CantonProvider } from './CantonProvider';

const SDK_VERSION = __SUPA_SDK_VERSION__;

// Initialize Buffer polyfill for browser (required by Privy SDK)
if (typeof window !== 'undefined' && !(window as any).Buffer) {
  (window as any).Buffer = Buffer;
  console.log('[Supa SDK] ✅ Buffer polyfill initialized');
}

export interface SupaConfig {
  privyAppId: string;
  privyClientId?: string;
  apiBaseUrl?: string;
  nodeIdentifier: string;
  /** Optional app identifier for special app-specific rules (sent as X-Supa-App-Id header) */
  supaAppId?: string;
  appearance?: {
    theme?: 'light' | 'dark';
    accentColor?: string;
    logo?: string;
  };
  loginMethods?: Array<'email' | 'wallet' | 'google' | 'twitter' | 'discord' | 'github' | 'linkedin' | 'telegram'>;
  smartWallets?: {
    enabled?: boolean;
    paymasterContext?: {
      mode?: string;
      calculateGasLimits?: boolean;
      expiryDuration?: number;
      sponsorshipInfo?: {
        webhookData?: Record<string, any>;
        smartAccountInfo?: {
          name?: string;
          version?: string;
        };
      };
    };
  };
  /** Default chain for smart wallets and transactions */
  defaultChain?: any;
  /** Supported chains for the app */
  supportedChains?: any[];
  /**
   * Enable wallet export functionality (uses Solana wallets instead of Stellar)
   * When false (default): Uses Stellar wallets, export will throw an error
   * When true: Uses Solana wallets, export is available
   * @default false
   */
  withExport?: boolean;
  /** Enable automatic onboarding (create wallet + register Canton on login). Default: true */
  autoOnboarding?: boolean;
  /**
   * Optional onboarding stages flags.
   * By default transfer preapproval is NOT auto-executed.
   */
  onboardingStages?: {
    /** Auto-run transfer preapproval stage (legacy). Default: false */
    transferPreapproval?: boolean;
  };
}
export interface ConfirmModalOptions {
  title?: string;
  message: string;
  confirmText?: string;
  rejectText?: string;
  description?: string;
  icon?: ReactNode;
}

export interface SignTransactionOptions {
  transaction: string | string[];
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
      nodeIdentifier: config.nodeIdentifier,
      supaAppId: config.supaAppId,
      sdkVersion: SDK_VERSION,
    });

    const cantonService = createCantonService(apiClient);
    const apiService = createApiService(apiClient);

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

  // Privy configuration - following official example structure
  const privyConfig: PrivyClientConfig = {
    embeddedWallets: {
      ethereum: {
        createOnLogin: 'users-without-wallets',
      },
      // When withExport is enabled, auto-create Solana wallet on login
      ...(config.withExport && {
        solana: {
          createOnLogin: 'users-without-wallets',
        },
      }),
    },
    appearance: {
      theme,
      accentColor: config.appearance?.accentColor ? `#${config.appearance.accentColor.replace('#', '')}` as `#${string}` : undefined,
      logo: config.appearance?.logo,
    },
    loginMethods: config.loginMethods || ['email', 'wallet'],
    defaultChain: config.defaultChain,
    supportedChains: config.supportedChains,
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

  // Smart Wallets enabled check
  const smartWalletsEnabled = config.smartWallets?.enabled ?? false;

  return (
    <PrivyProvider
      appId={config.privyAppId}
      clientId={config.privyClientId}
      config={privyConfig}
    >
      {smartWalletsEnabled ? (
        <SmartWalletsProvider
          config={config.smartWallets?.paymasterContext ? {
            paymasterContext: config.smartWallets.paymasterContext
          } : undefined}
        >
          <SupaContext.Provider value={contextValue}>
            <CantonProvider
              cantonService={services.cantonService}
              withExport={config.withExport}
              autoOnboarding={config.autoOnboarding}
              autoTransferPreapproval={config.onboardingStages?.transferPreapproval ?? false}
            >
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
            </CantonProvider>
          </SupaContext.Provider>
        </SmartWalletsProvider>
      ) : (
        <SupaContext.Provider value={contextValue}>
          <CantonProvider
            cantonService={services.cantonService}
            withExport={config.withExport}
            autoOnboarding={config.autoOnboarding}
            autoTransferPreapproval={config.onboardingStages?.transferPreapproval ?? false}
          >
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
          </CantonProvider>
        </SupaContext.Provider>
      )}
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
