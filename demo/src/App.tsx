import { useState } from 'react';
import './types/styled.d.ts';
import { SupaProvider, useSupa } from '@supa/sdk';
import { CantonContracts, SignMessage, SendTransaction, CantonUserInfo } from './components';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import {
  Wallet,
  LogOut,
  Zap,
  User,
  FileText,
  PenTool,
  Send,
  Coins,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sun,
  Moon,
} from 'lucide-react';
import {
  GlobalStyles,
  ThemeProvider,
  useTheme,
  ToastProvider,
  useToast,
  AppLayout,
  Header,
  HeaderContent,
  Logo,
  LogoIcon,
  Main,
  Footer,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  IconButton,
  Flex,
  Text,
  Badge,
  StatusDot,
  WalletCard,
  WalletIcon,
  WalletInfo,
  WalletLabel,
  WalletAddress,
  LoginView,
  LoginCard,
  LoginIcon,
  LoginTitle,
  LoginSubtitle,
  Alert,
  Divider,
  Section,
  SectionTitle,
  Spinner,
} from './ui';
import styled from 'styled-components';

const StyledTabList = styled(TabList)`
  display: flex;
  gap: ${({ theme }) => theme.space[1]};
  background: ${({ theme }) => theme.colors.bg.tertiary};
  padding: ${({ theme }) => theme.space[1]};
  border-radius: ${({ theme }) => theme.radii.md};
  margin-bottom: ${({ theme }) => theme.space[6]};
`;

const StyledTab = styled(Tab)`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.space[2]};
  padding: ${({ theme }) => theme.space[3]} ${({ theme }) => theme.space[4]};
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.secondary};
  background: transparent;
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
    background: ${({ theme }) => theme.colors.bg.hover};
  }

  &[data-selected] {
    color: ${({ theme }) => theme.colors.text.primary};
    background: ${({ theme }) => theme.colors.bg.elevated};
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const TapButton = styled.button<{ $amount: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.space[2]};
  padding: ${({ theme }) => theme.space[4]};
  background: ${({ theme }) => theme.colors.bg.tertiary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  flex: 1;
  min-width: 100px;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.bg.hover};
    border-color: ${({ theme }) => theme.colors.accent.primary};
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TapAmount = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.accent.primary};
`;

const TapLabel = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const StepIndicator = styled.div<{ $active?: boolean; $completed?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space[3]};
  padding: ${({ theme }) => theme.space[4]};
  background: ${({ $active, $completed, theme }) =>
    $active
      ? theme.colors.accent.muted
      : $completed
      ? theme.colors.success.muted
      : theme.colors.bg.tertiary};
  border: 1px solid
    ${({ $active, $completed, theme }) =>
      $active
        ? theme.colors.accent.primary
        : $completed
        ? theme.colors.success.primary
        : theme.colors.border.primary}40;
  border-radius: ${({ theme }) => theme.radii.md};
  transition: all ${({ theme }) => theme.transitions.fast};
`;

const StepNumber = styled.div<{ $active?: boolean; $completed?: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  background: ${({ $active, $completed, theme }) =>
    $active
      ? theme.colors.accent.primary
      : $completed
      ? theme.colors.success.primary
      : theme.colors.bg.elevated};
  color: ${({ $active, $completed }) =>
    $active || $completed ? '#fff' : ({ theme }) => theme.colors.text.muted};
`;

const StepContent = styled.div`
  flex: 1;
`;

const StepTitle = styled.div`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const StepDescription = styled.div`
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.text.muted};
`;

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
  const { mode, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [tapLoading, setTapLoading] = useState<string | null>(null);

  const handleTapDevnet = async (amount: string) => {
    setTapLoading(amount);
    try {
      await canton.tapDevnet(amount);
      toast.success(`${amount} coins received! 🎉`);
    } catch (error: any) {
      console.error('Tap error:', error);
      toast.error(error?.message || 'Failed to receive coins');
    } finally {
      setTapLoading(null);
    }
  };

  // Login view
      if (!auth.authenticated) {
    return (
      <LoginView>
        <LoginCard>
          <Flex $justify="flex-end" $fullWidth style={{ marginBottom: -8 }}>
            <IconButton onClick={toggleTheme} $variant="ghost">
              {mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </IconButton>
          </Flex>
          <LoginIcon>
            <Zap />
          </LoginIcon>
          <LoginTitle>Supa SDK Demo</LoginTitle>
          <LoginSubtitle>
            Connect your wallet to explore Canton Network integration
          </LoginSubtitle>
          <Button $variant="primary" $size="lg" $fullWidth onClick={auth.login}>
            <Wallet style={{ width: 20, height: 20 }} />
            Connect Wallet
          </Button>
          <Text $size="sm" $color="muted" style={{ marginTop: 16 }}>
            Powered by Privy
          </Text>
        </LoginCard>
      </LoginView>
    );
  }

  // Onboarding flow
  const currentStep = !canton.stellarWallet ? 1 : !canton.isRegistered ? 2 : 3;

  return (
    <AppLayout>
      <Header>
        <HeaderContent>
          <Logo>
            <LogoIcon>
              <Zap style={{ width: 20, height: 20, color: '#fff' }} />
            </LogoIcon>
            Supa SDK
          </Logo>
          <Flex $align="center" $gap={4}>
                {canton.isRegistered && (
              <Badge $variant="success">
                <StatusDot $status="success" />
                Canton Connected
              </Badge>
            )}
            <IconButton onClick={toggleTheme} $variant="secondary" title={mode === 'dark' ? 'Light theme' : 'Dark theme'}>
              {mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </IconButton>
            <IconButton onClick={auth.logout} $variant="secondary">
              <LogOut />
            </IconButton>
          </Flex>
        </HeaderContent>
      </Header>

      <Main>
        {/* Onboarding Section */}
        {currentStep < 3 && (
          <Section>
            <SectionTitle>
              <Zap /> Get Started
            </SectionTitle>
            <Card>
              <CardContent>
                <Flex $direction="column" $gap={3}>
                  <StepIndicator $completed={currentStep > 1} $active={currentStep === 1}>
                    <StepNumber $completed={currentStep > 1} $active={currentStep === 1}>
                      {currentStep > 1 ? <CheckCircle style={{ width: 18, height: 18 }} /> : '1'}
                    </StepNumber>
                    <StepContent>
                      <StepTitle>Create Stellar Wallet</StepTitle>
                      <StepDescription>Required for Canton Network signing</StepDescription>
                    </StepContent>
                    {currentStep === 1 && (
                      <Button
                        $variant="primary"
                  onClick={canton.createStellarWallet}
                  disabled={canton.loading}
                      >
                        {canton.loading ? <Loader2 className="animate-spin" /> : null}
                        Create Wallet
                        <ChevronRight style={{ width: 16, height: 16 }} />
                      </Button>
                    )}
                  </StepIndicator>

                  <StepIndicator $completed={currentStep > 2} $active={currentStep === 2}>
                    <StepNumber $completed={currentStep > 2} $active={currentStep === 2}>
                      {currentStep > 2 ? <CheckCircle style={{ width: 18, height: 18 }} /> : '2'}
                    </StepNumber>
                    <StepContent>
                      <StepTitle>Register Canton Wallet</StepTitle>
                      <StepDescription>Connect to the Canton Network</StepDescription>
                    </StepContent>
                    {currentStep === 2 && (
                      <Button
                        $variant="primary"
                        onClick={canton.registerCanton}
                  disabled={canton.loading}
                      >
                        {canton.loading ? <Loader2 className="animate-spin" /> : null}
                        Register
                        <ChevronRight style={{ width: 16, height: 16 }} />
                      </Button>
                    )}
                  </StepIndicator>

                  <StepIndicator $completed={currentStep === 3}>
                    <StepNumber $completed={currentStep === 3}>
                      {currentStep === 3 ? (
                        <CheckCircle style={{ width: 18, height: 18 }} />
                      ) : (
                        '3'
                      )}
                    </StepNumber>
                    <StepContent>
                      <StepTitle>Ready to Use</StepTitle>
                      <StepDescription>Access all Canton Network features</StepDescription>
                    </StepContent>
                  </StepIndicator>
                </Flex>

                {canton.error && (
                  <Alert $variant="error" style={{ marginTop: 16 }}>
                    <AlertCircle />
                    {canton.error.message}
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Section>
        )}

        {/* Wallet Info */}
        {canton.stellarWallet && (
          <Section>
            <Card>
              <CardHeader>
                <CardTitle>
                  <Wallet /> Stellar Wallet
                </CardTitle>
                {canton.isRegistered && <Badge $variant="success">Registered</Badge>}
              </CardHeader>
              <CardContent>
                <WalletCard>
                  <WalletIcon>
                    <Wallet />
                  </WalletIcon>
                  <WalletInfo>
                    <WalletLabel>Address</WalletLabel>
                    <WalletAddress>
                      {canton.stellarWallet.address.slice(0, 12)}...
                      {canton.stellarWallet.address.slice(-8)}
                    </WalletAddress>
                  </WalletInfo>
                </WalletCard>
              </CardContent>
            </Card>
          </Section>
        )}

        {/* Canton Features */}
        {canton.isRegistered && (
          <>
            {/* Tap Devnet */}
            <Section>
              <Card>
                <CardHeader>
                  <CardTitle>
                    <Coins /> Devnet Faucet
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Text $color="secondary" style={{ marginBottom: 16 }}>
                    Get test tokens for the Canton devnet
                  </Text>
                  <Flex $gap={3} $wrap>
                    {['1', '10', '100', '1000'].map((amount) => (
                      <TapButton
                        key={amount}
                        $amount={amount}
                        onClick={() => handleTapDevnet(amount)}
                        disabled={tapLoading !== null}
                      >
                        {tapLoading === amount ? (
                          <Spinner $size={24} />
                        ) : (
                          <TapAmount>{amount}</TapAmount>
                        )}
                        <TapLabel>coins</TapLabel>
                      </TapButton>
                    ))}
                  </Flex>
                </CardContent>
              </Card>
            </Section>

            <Divider />

            {/* Feature Tabs */}
            <Section>
              <SectionTitle>
                <FileText /> Canton Operations
              </SectionTitle>

              <TabGroup>
                <StyledTabList>
                  <StyledTab>
                    <User /> Account
                  </StyledTab>
                  <StyledTab>
                    <FileText /> Contracts
                  </StyledTab>
                  <StyledTab>
                    <PenTool /> Sign
                  </StyledTab>
                  <StyledTab>
                    <Send /> Transact
                  </StyledTab>
                </StyledTabList>

                <TabPanels>
                  <TabPanel>
                    <CantonUserInfo />
                  </TabPanel>
                  <TabPanel>
                    <CantonContracts />
                  </TabPanel>
                  <TabPanel>
                    <SignMessage />
                  </TabPanel>
                  <TabPanel>
                    <SendTransaction />
                  </TabPanel>
                </TabPanels>
              </TabGroup>
            </Section>
          </>
        )}
      </Main>

      <Footer>Supa SDK Demo — Canton Network Integration</Footer>
    </AppLayout>
  );
}

export default App;
