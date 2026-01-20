import { Zap, ChevronRight, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import styled from 'styled-components';
import {
  Card,
  CardContent,
  Button,
  Flex,
  Alert,
  Section,
  SectionTitle,
} from '../ui';
import { InviteCodeInput } from './InviteCodeInput';

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

interface OnboardingStepsProps {
  currentStep: number;
  loading: boolean;
  error: Error | null;
  onCreateWallet: () => void;
  onRegister: (inviteCode?: string) => void;
  inviteCode?: string;
  onInviteCodeChange?: (code: string) => void;
  inviteCodeError?: string;
}

export function OnboardingSteps({
  currentStep,
  loading,
  error,
  onCreateWallet,
  onRegister,
  inviteCode = '',
  onInviteCodeChange,
  inviteCodeError,
}: OnboardingStepsProps) {
  if (currentStep >= 3) {
    return null;
  }

  const handleRegister = () => {
    onRegister(inviteCode);
  };

  return (
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
                <StepTitle>Create Canton Wallet</StepTitle>
                <StepDescription>Required for Canton Network signing</StepDescription>
              </StepContent>
              {currentStep === 1 && (
                <Button
                  $variant="primary"
                  onClick={onCreateWallet}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="animate-spin" /> : null}
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
                  onClick={handleRegister}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="animate-spin" /> : null}
                  Register
                  <ChevronRight style={{ width: 16, height: 16 }} />
                </Button>
              )}
            </StepIndicator>

            {currentStep === 2 && onInviteCodeChange && (
              <div style={{ marginTop: '16px' }}>
                <InviteCodeInput
                  value={inviteCode}
                  onChange={onInviteCodeChange}
                  placeholder="Invite code (optional)"
                  error={inviteCodeError}
                />
              </div>
            )}

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

          {error && !inviteCodeError && (
            <Alert $variant="error" style={{ marginTop: 16 }}>
              <AlertCircle />
              {error.message}
            </Alert>
          )}
        </CardContent>
      </Card>
    </Section>
  );
}

