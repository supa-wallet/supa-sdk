import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSupa } from '@supanovaapp/sdk';
import type { CantonTransactionDto, CantonTransactionsParams } from '@supanovaapp/sdk';
import { Card, CardContent, Button, Text } from '../ui';

const TransactionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
  max-height: 500px;
  overflow-y: auto;
`;

const TransactionItem = styled.div`
  padding: 12px;
  background: ${({ theme }) => theme.colors.cardBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TransactionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TransactionType = styled.span<{ type: string }>`
  font-size: 13px;
  font-weight: 600;
  color: ${({ type, theme }) => {
    if (type === 'transfer_in' || type === 'subscription_accept') return theme.colors.success;
    if (type === 'transfer_out' || type === 'subscription_payment') return theme.colors.error;
    return theme.colors.text;
  }};
`;

const TransactionDate = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const BalanceChange = styled.div<{ positive: boolean }>`
  font-size: 16px;
  font-weight: 600;
  color: ${({ positive, theme }) => positive ? theme.colors.success : theme.colors.error};
`;

const TokenOperations = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
`;

const Operation = styled.div<{ direction: string }>`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ direction, theme }) => {
    if (direction === 'in') return theme.colors.success;
    if (direction === 'out') return theme.colors.error;
    return theme.colors.text;
  }};
`;

const OperationIcon = styled.span`
  font-weight: bold;
`;

const Controls = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
`;

const LimitSelect = styled.select`
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.cardBackground};
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 32px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const LoadMoreButton = styled(Button)`
  margin-top: 12px;
  width: 100%;
`;

export function TransactionHistory() {
  const { canton } = useSupa();
  const [transactions, setTransactions] = useState<CantonTransactionDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState(20);
  const [hasMore, setHasMore] = useState(true);

  const loadTransactions = async (append: boolean = false) => {
    setLoading(true);
    try {
      const params: CantonTransactionsParams = { limit };
      
      if (append && transactions.length > 0) {
        // Load older transactions using the oldest offset
        const oldestTx = transactions[transactions.length - 1];
        params.beforeOffsetExclusive = oldestTx.ledgerOffset;
      }

      const data = await canton.getTransactions(params);
      
      if (append) {
        setTransactions(prev => [...prev, ...data]);
      } else {
        setTransactions(data);
      }
      
      // If we got fewer transactions than requested, there are no more
      setHasMore(data.length === limit);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canton.isRegistered) {
      loadTransactions();
    }
  }, [canton.isRegistered, limit]);

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getOperationIcon = (direction: string) => {
    switch (direction) {
      case 'in': return '↓';
      case 'out': return '↑';
      case 'lock': return '🔒';
      case 'unlock': return '🔓';
      default: return '•';
    }
  };

  if (!canton.isRegistered) {
    return null;
  }

  return (
    <Card>
      <CardContent>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text $size="lg" $weight={600}>Transaction History</Text>
          <Button
            onClick={() => loadTransactions(false)}
            disabled={loading}
            $size="sm"
            $variant="secondary"
          >
            {loading && transactions.length === 0 ? 'Loading...' : 'Refresh'}
          </Button>
        </div>

      <Controls>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
          Show:
          <LimitSelect
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            disabled={loading}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </LimitSelect>
        </label>
      </Controls>

      {transactions.length === 0 ? (
        <EmptyState>
          {loading ? 'Loading transactions...' : 'No transactions yet'}
        </EmptyState>
      ) : (
        <>
          <TransactionsList>
            {transactions.map((tx, index) => (
              <TransactionItem key={`${tx.updateId}-${index}`}>
                <TransactionHeader>
                  <TransactionType type={tx.type}>
                    {tx.typeLabel}
                  </TransactionType>
                  <TransactionDate>
                    {formatDate(tx.date)}
                  </TransactionDate>
                </TransactionHeader>

                <BalanceChange positive={tx.balanceChange >= 0}>
                  {tx.balanceChange >= 0 ? '+' : ''}{tx.balanceChange.toFixed(4)} CC
                  {tx.lockedChange !== 0 && (
                    <span style={{ fontSize: '13px', marginLeft: '8px' }}>
                      (locked: {tx.lockedChange >= 0 ? '+' : ''}{tx.lockedChange.toFixed(4)})
                    </span>
                  )}
                </BalanceChange>

                {tx.tokenOperations.length > 0 && (
                  <TokenOperations>
                    {tx.tokenOperations.map((op, opIndex) => (
                      <Operation key={opIndex} direction={op.direction}>
                        <OperationIcon>{getOperationIcon(op.direction)}</OperationIcon>
                        <span>
                          {op.amount} {op.token}
                          {op.description && ` — ${op.description}`}
                          {op.counterparty && (
                            <span style={{ fontSize: '11px', opacity: 0.7 }}>
                              {' '}({op.counterparty.slice(0, 15)}...)
                            </span>
                          )}
                        </span>
                      </Operation>
                    ))}
                  </TokenOperations>
                )}

                {Object.keys(tx.details).length > 0 && (
                  <details style={{ fontSize: '12px', marginTop: '4px' }}>
                    <summary style={{ cursor: 'pointer', color: 'var(--text-secondary)' }}>
                      Details
                    </summary>
                    <pre style={{ 
                      marginTop: '8px', 
                      padding: '8px', 
                      background: 'rgba(0,0,0,0.1)', 
                      borderRadius: '4px',
                      fontSize: '11px',
                      overflow: 'auto'
                    }}>
                      {JSON.stringify(tx.details, null, 2)}
                    </pre>
                  </details>
                )}
              </TransactionItem>
            ))}
          </TransactionsList>

          {hasMore && (
            <LoadMoreButton
              onClick={() => loadTransactions(true)}
              disabled={loading}
              $variant="secondary"
            >
              {loading ? 'Loading...' : 'Load more'}
            </LoadMoreButton>
          )}
        </>
      )}
      </CardContent>
    </Card>
  );
}
