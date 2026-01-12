import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSupa } from '@supanovaapp/sdk';
import type { CantonIncomingTransferDto } from '@supanovaapp/sdk';
import { Card, CardContent, Button, Text } from '../ui';

const TransfersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
`;

const TransferItem = styled.div`
  padding: 16px;
  background: ${({ theme }) => theme.colors.cardBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TransferInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
`;

const Label = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Value = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 500;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 32px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export function IncomingTransfers() {
  const { canton } = useSupa();
  const [transfers, setTransfers] = useState<CantonIncomingTransferDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);

  const loadTransfers = async () => {
    setLoading(true);
    try {
      const data = await canton.getPendingIncomingTransfers();
      setTransfers(data);
    } catch (err) {
      console.error('Failed to load incoming transfers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canton.isRegistered) {
      loadTransfers();
    }
  }, [canton.isRegistered]);

  const handleResponse = async (contractId: string, accept: boolean) => {
    setProcessing(contractId);
    try {
      await canton.respondToIncomingTransfer(contractId, accept);
      // Reload transfers after successful response
      await loadTransfers();
    } catch (err: any) {
      console.error('Failed to respond to transfer:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleString();
  };

  const shortenPartyId = (partyId: string) => {
    if (partyId.length <= 30) return partyId;
    return `${partyId.slice(0, 20)}...${partyId.slice(-10)}`;
  };

  if (!canton.isRegistered) {
    return null;
  }

  return (
    <Card>
      <CardContent>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Text $size="lg" $weight={600}>Входящие трансферы</Text>
          <Button
            onClick={loadTransfers}
            disabled={loading}
            $size="sm"
            $variant="secondary"
          >
            {loading ? 'Загрузка...' : 'Обновить'}
          </Button>
        </div>

      {transfers.length === 0 ? (
        <EmptyState>
          {loading ? 'Загрузка...' : 'Нет ожидающих входящих трансферов'}
        </EmptyState>
      ) : (
        <TransfersList>
          {transfers.map((transfer) => (
            <TransferItem key={transfer.contractId}>
              <TransferInfo>
                <InfoRow>
                  <Label>Сумма:</Label>
                  <Value>{transfer.amount} {transfer.instrument.id}</Value>
                </InfoRow>
                <InfoRow>
                  <Label>От:</Label>
                  <Value title={transfer.sender}>
                    {shortenPartyId(transfer.sender)}
                  </Value>
                </InfoRow>
                <InfoRow>
                  <Label>Запрошено:</Label>
                  <Value>{formatDate(transfer.requestedAt)}</Value>
                </InfoRow>
                <InfoRow>
                  <Label>Выполнить до:</Label>
                  <Value>{formatDate(transfer.executeBefore)}</Value>
                </InfoRow>
              </TransferInfo>

              <Actions>
                <Button
                  onClick={() => handleResponse(transfer.contractId, true)}
                  disabled={processing !== null}
                  $variant="success"
                  $size="sm"
                  style={{ flex: 1 }}
                >
                  {processing === transfer.contractId ? 'Обработка...' : 'Принять'}
                </Button>
                <Button
                  onClick={() => handleResponse(transfer.contractId, false)}
                  disabled={processing !== null}
                  $variant="secondary"
                  $size="sm"
                  style={{ flex: 1 }}
                >
                  {processing === transfer.contractId ? 'Обработка...' : 'Отклонить'}
                </Button>
              </Actions>
            </TransferItem>
          ))}
        </TransfersList>
      )}
      </CardContent>
    </Card>
  );
}
