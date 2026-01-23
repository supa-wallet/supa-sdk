import './types/styled.d.ts';
import { useMemo, useState, useEffect } from 'react';
import { SupaProvider, useInitializationTransactions, useSupa } from '@supanovaapp/sdk';
import {
  LoginScreen,
  OnboardingSteps,
  CantonWalletCard,
  DevnetFaucet,
  CantonOperationsTabs,
  AppHeader,
  CantonBalances,
  SendCantonCoin,
  IncomingTransfers,
  TransactionHistory,
  PriceHistory,
  DeleteAccount,
  ExportWallet,
} from './components';
import {
  ThemeProvider,
  ToastProvider,
  AppLayout,
  Main,
  Footer,
  Divider,
  useTheme,
} from './ui';

function App() {
  return (
    <ThemeProvider>
      <AppWithTheme />
    </ThemeProvider>
  );
}

function AppWithTheme() {
  const { mode } = useTheme();
  const privyAppId = import.meta.env.VITE_PRIVY_APP_ID;
  const privyClientId =
    import.meta.env.VITE_PRIVY_CLIENT_ID;

  return (
    <SupaProvider
      config={{
        privyAppId,
        privyClientId,
        apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://stage_api.supa.fyi',
        nodeIdentifier: import.meta.env.VITE_CANTON_NODE_ID,
        supaAppId: import.meta.env.VITE_SUPA_APP_ID || undefined,
        appearance: {
          theme: mode,
        },
        autoOnboarding: false,
        withExport: true,
        loginMethods: ['email', 'wallet', 'telegram'],
      }}
    >
      <ToastProvider>
        <Demo />
      </ToastProvider>
    </SupaProvider>
  );
}

function Demo() {
  const { auth, canton } = useSupa();
  // const { runInitializationTransactions, loading: initLoading } = useInitializationTransactions();

  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [inviteCodeError, setInviteCodeError] = useState<string>('');
  const [initAttempted, setInitAttempted] = useState(false);

  const currentStep = useMemo(() => {
    if (!canton.cantonWallet) return 1;
    if (!canton.isRegistered) return 2;
    return 3;
  }, [canton.cantonWallet, canton.isRegistered])

  // Auto-run initialization in background after registration once
  useEffect(() => {
    if (!auth.authenticated) return;
    if (!canton.isRegistered) return;
    if (initAttempted) return;

    setInitAttempted(true);
    // runInitializationTransactions().catch(() => {
    //   // do not block UI; allow retry on next app entry if needed
    //   setInitAttempted(false);
    // });
  }, [auth.authenticated, canton.isRegistered, initAttempted,]);

  // Extract invite code error from Canton error
  useEffect(() => {
    if (canton.error?.message) {
      const errorMessage = canton.error.message.toLowerCase();
      if (errorMessage.includes('invite code') || 
          errorMessage.includes('invitecode') ||
          errorMessage.includes('already used') ||
          errorMessage.includes('invalid')) {
        // Show user-friendly error message
        if (errorMessage.includes('already used or invalid')) {
          setInviteCodeError('Invite code already used or invalid');
        } else if (errorMessage.includes('invite code')) {
          setInviteCodeError('Invalid invite code');
        }
      } else {
        setInviteCodeError('');
      }
    } else {
      setInviteCodeError('');
    }
  }, [canton.error])

  // Login view
  if (!auth.authenticated) {
    return <LoginScreen onLogin={auth.login} />;
  }

  // Onboarding flow
  

  return (
    <AppLayout>
      <AppHeader 
        isRegistered={canton.isRegistered} 
        onLogout={auth.logout}
        showTechnicalDetails={showTechnicalDetails}
        onToggleTechnicalDetails={setShowTechnicalDetails}
      />

      <Main>
        {/* <div style={{ marginBottom: 12, opacity: 0.7, fontSize: '0.875rem' }}>
          Initialization status: {initLoading ? 'running' : 'idle'}
        </div> */}

        <OnboardingSteps
          currentStep={currentStep}
          loading={canton.loading}
          error={canton.error}
          onCreateWallet={canton.createCantonWallet}
          onRegister={(code) => canton.registerCanton(code)}
          inviteCode={inviteCode}
          onInviteCodeChange={(code) => {
            setInviteCode(code);
            setInviteCodeError('');
            canton.clearError();
          }}
          inviteCodeError={inviteCodeError}
        />

        {canton.cantonWallet && (
          <>
            <CantonWalletCard
              address={canton.cantonWallet.address}
              isRegistered={canton.isRegistered}
            />
            <ExportWallet />
          </>
        )}

        {canton.isRegistered && (
          <>
            <CantonBalances />
            <DevnetFaucet onTap={canton.tapDevnet} />
            <SendCantonCoin />
            <IncomingTransfers />
            <TransactionHistory />
            <PriceHistory />
            <Divider />
            <CantonOperationsTabs showTechnicalDetails={showTechnicalDetails} />
            <Divider />
            <DeleteAccount />
          </>
        )}
      </Main>

      <Footer>Supa SDK Demo — Canton Network Integration</Footer>
    </AppLayout>
  );
}

export default App;
