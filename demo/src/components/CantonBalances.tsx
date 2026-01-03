import { useState, useEffect } from 'react';
import { Wallet, RefreshCw, Lock, AlertCircle } from 'lucide-react';
import styled from 'styled-components';
import { useSupa } from '@supanovaapp/sdk';
import type { CantonLockedUtxoDto } from '@supanovaapp/sdk';
import {
  useToast,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Flex,
  Text,
  Button,
  Spinner,
  Section,
  Modal,
} from '../ui';

const BalanceItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[2]};
  padding: ${({ theme }) => theme.space[4]};
  background: ${({ theme }) => theme.colors.bg.tertiary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.radii.md};
`;

const TokenName = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1rem;
`;

const BalanceAmount = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.accent.primary};
`;

const LockedBalance = styled.button`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.muted};
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space[1]};
  transition: color ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.accent.primary};
  }
`;

const UtxoItem = styled.div`
  padding: ${({ theme }) => theme.space[3]};
  background: ${({ theme }) => theme.colors.bg.elevated};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.radii.sm};
  margin-bottom: ${({ theme }) => theme.space[2]};

  &:last-child {
    margin-bottom: 0;
  }
`;

const UtxoLabel = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.muted};
  margin-bottom: ${({ theme }) => theme.space[1]};
`;

const UtxoValue = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: monospace;
  word-break: break-all;
`;

export function CantonBalances() {
  const { canton } = useSupa();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [lockedUtxos, setLockedUtxos] = useState<CantonLockedUtxoDto[] | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadBalances();
  }, []);

  const loadBalances = async () => {
    setLoading(true);
    try {
      await canton.getBalances();
    } catch (error: any) {
      console.error('Failed to load balances:', error);
      toast.error(error?.message || 'Failed to load balances');
    } finally {
      setLoading(false);
    }
  };

  const handleShowLockedUtxos = (utxos: CantonLockedUtxoDto[]) => {
    setLockedUtxos(utxos);
    setShowModal(true);
  };

  const cantonCoinToken = canton.cantonBalances?.tokens.find(
    (token) => token.instrumentId.id === 'Amulet'
  );

  // Show balances only after full registration (with preapproval)
  if (!canton.isRegistered) {
    return null;
  }

  return (
    <>
      <Section>
        <Card>
          <CardHeader>
            <Flex $justify="space-between" $align="center">
              <CardTitle>
                <Wallet /> Canton Balances
              </CardTitle>
              <Button
                $variant="ghost"
                $size="sm"
                onClick={loadBalances}
                disabled={loading}
              >
                {loading ? <Spinner $size={16} /> : <RefreshCw style={{ width: 16, height: 16 }} />}
              </Button>
            </Flex>
          </CardHeader>
          <CardContent>
            {loading && !canton.cantonBalances ? (
              <Flex $justify="center" $align="center" style={{ padding: '2rem' }}>
                <Spinner $size={32} />
              </Flex>
            ) : cantonCoinToken ? (
              <BalanceItem>
                <TokenName>Canton Coin (CC)</TokenName>
                <BalanceAmount>{cantonCoinToken.totalUnlockedBalance}</BalanceAmount>
                {parseFloat(cantonCoinToken.totalLockedBalance) > 0 && (
                  <LockedBalance
                    onClick={() => handleShowLockedUtxos(cantonCoinToken.lockedUtxos)}
                  >
                    <Lock style={{ width: 14, height: 14 }} />
                    (+{cantonCoinToken.totalLockedBalance} locked)
                  </LockedBalance>
                )}
                <Text $color="secondary" style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
                  {cantonCoinToken.unlockedUtxoCount} unlocked UTXO
                  {cantonCoinToken.unlockedUtxoCount !== 1 ? 's' : ''}
                  {cantonCoinToken.lockedUtxoCount > 0 &&
                    `, ${cantonCoinToken.lockedUtxoCount} locked`}
                </Text>
              </BalanceItem>
            ) : (
              <Flex $direction="column" $align="center" $gap={2} style={{ padding: '2rem' }}>
                <AlertCircle style={{ width: 48, height: 48, opacity: 0.5 }} />
                <Text $color="secondary">No Canton Coin found</Text>
                <Text $color="secondary" style={{ fontSize: '0.875rem' }}>
                  Use the devnet faucet to get test tokens
                </Text>
              </Flex>
            )}
          </CardContent>
        </Card>
      </Section>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={
        <>
          <Lock /> Locked UTXOs
        </>
      }>
        <div>
          {lockedUtxos && lockedUtxos.length > 0 ? (
            lockedUtxos.map((utxo, index) => (
              <UtxoItem key={utxo.contractId}>
                <Flex $direction="column" $gap={2}>
                  <div>
                    <UtxoLabel>Amount</UtxoLabel>
                    <UtxoValue style={{ fontSize: '1rem', fontWeight: 600 }}>
                      {utxo.amount} CC
                    </UtxoValue>
                  </div>
                  {utxo.lock.context && (
                    <div>
                      <UtxoLabel>Context</UtxoLabel>
                      <UtxoValue>{utxo.lock.context}</UtxoValue>
                    </div>
                  )}
                  {utxo.lock.expiresAt && (
                    <div>
                      <UtxoLabel>Expires At</UtxoLabel>
                      <UtxoValue>
                        {new Date(utxo.lock.expiresAt).toLocaleString()}
                      </UtxoValue>
                    </div>
                  )}
                  <div>
                    <UtxoLabel>Contract ID</UtxoLabel>
                    <UtxoValue style={{ fontSize: '0.75rem' }}>
                      {utxo.contractId}
                    </UtxoValue>
                  </div>
                </Flex>
              </UtxoItem>
            ))
          ) : (
            <Text $color="secondary">No locked UTXOs</Text>
          )}
        </div>
      </Modal>
    </>
  );
}

