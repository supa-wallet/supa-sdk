import { useState } from 'react';
import { Coins } from 'lucide-react';
import styled from 'styled-components';
import {
  useToast,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Flex,
  Text,
  Spinner,
  Section,
} from '../ui';

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

interface DevnetFaucetProps {
  onTap: (amount: string) => Promise<unknown>;
}

export function DevnetFaucet({ onTap }: DevnetFaucetProps) {
  const { toast } = useToast();
  const [tapLoading, setTapLoading] = useState<string | null>(null);

  const handleTap = async (amount: string) => {
    setTapLoading(amount);
    try {
      await onTap(amount);
      toast.success(`${amount} coins received! 🎉`);
    } catch (error: any) {
      console.error('Tap error:', error);
      toast.error(error?.message || 'Failed to receive coins');
    } finally {
      setTapLoading(null);
    }
  };

  return (
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
                onClick={() => handleTap(amount)}
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
  );
}

