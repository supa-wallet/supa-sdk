import './types/styled.d.ts';
import { SupaProvider, useSupa } from '@supa/sdk';
import {
  LoginScreen,
  OnboardingSteps,
  StellarWalletCard,
  DevnetFaucet,
  CantonOperationsTabs,
  AppHeader,
} from './components';
import {
  GlobalStyles,
  ThemeProvider,
  ToastProvider,
  AppLayout,
  Main,
  Footer,
  Divider,
} from './ui';

function App() {
  const privyAppId = import.meta.env.VITE_PRIVY_APP_ID || 'cm9u92yyo01x2jv0nbmeqoptk';
  const privyClientId =
    import.meta.env.VITE_PRIVY_CLIENT_ID || 'WY5iwwJvDRXsGG6KkftbHs3zEzXKeXMJRyfhN87f58y31';

  return (
    <ThemeProvider>
      <SupaProvider
        config={{
          privyAppId,
          privyClientId,
          apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://stage_api.supa.fyi',
          appearance: {
            theme: 'dark',
          },
          loginMethods: ['email', 'wallet'],
        }}
      >
        <GlobalStyles />
        <ToastProvider>
          <Demo />
        </ToastProvider>
      </SupaProvider>
    </ThemeProvider>
  );
}

function Demo() {
  const { auth, canton } = useSupa();

  // Login view
  if (!auth.authenticated) {
    return <LoginScreen onLogin={auth.login} />;
  }

  // Onboarding flow
  const currentStep = !canton.stellarWallet ? 1 : !canton.isRegistered ? 2 : 3;

  return (
    <AppLayout>
      <AppHeader isRegistered={canton.isRegistered} onLogout={auth.logout} />

      <Main>
        <OnboardingSteps
          currentStep={currentStep}
          loading={canton.loading}
          error={canton.error}
          onCreateWallet={canton.createStellarWallet}
          onRegister={canton.registerCanton}
        />

        {canton.stellarWallet && (
          <StellarWalletCard
            address={canton.stellarWallet.address}
            isRegistered={canton.isRegistered}
          />
        )}

        {canton.isRegistered && (
          <>
            <DevnetFaucet onTap={canton.tapDevnet} />
            <Divider />
            <CantonOperationsTabs />
          </>
        )}
      </Main>

      <Footer>Supa SDK Demo — Canton Network Integration</Footer>
    </AppLayout>
  );
}

export default App;
