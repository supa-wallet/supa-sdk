import './types/styled.d.ts';
import { useMemo, useState } from 'react';
import { SupaProvider, useSupa } from '@supanovaapp/sdk';
import {
  LoginScreen,
  OnboardingSteps,
  StellarWalletCard,
  DevnetFaucet,
  CantonOperationsTabs,
  AppHeader,
  CantonBalances,
  SendCantonCoin,
  IncomingTransfers,
  TransactionHistory,
  PriceHistory,
} from './components';
import {
  ThemeProvider,
  ToastProvider,
  AppLayout,
  Main,
  Footer,
  Divider,
  useTheme,
  Button,
  Card,
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
        appearance: {
          theme: mode,
        },
        loginMethods: ['email', 'wallet'],
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
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const handleExportWallet = async () => {
    if (!canton.stellarWallet) return;
    setExportLoading(true);
    try {
      await auth.exportWallet({ address: canton.stellarWallet.address });
    } catch (err) {
      alert('Failed to export wallet: ' + (err as Error).message);
    } finally {
      setExportLoading(false);
    }
  };

  const currentStep = useMemo(() => {
    if (!canton.stellarWallet) return 1;
    if (!canton.isRegistered) return 2;
    if (canton.cantonUser && !canton.cantonUser.transferPreapprovalSet) return 3;
    return 4;
  }, [canton.stellarWallet, canton.isRegistered, canton.cantonUser])

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
        <OnboardingSteps
          currentStep={currentStep}
          loading={canton.loading}
          error={canton.error}
          onCreateWallet={canton.createStellarWallet}
          onRegister={canton.registerCanton}
        />

        {canton.stellarWallet && (
          <>
            <StellarWalletCard
              address={canton.stellarWallet.address}
              isRegistered={canton.isRegistered}
            />
            <Card>
              <Button onClick={handleExportWallet} disabled={exportLoading}>
                {exportLoading ? 'Exporting...' : 'Export Wallet'}
              </Button>
            </Card>
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
          </>
        )}
      </Main>

      <Footer>Supa SDK Demo — Canton Network Integration</Footer>
    </AppLayout>
  );
}

export default App;
