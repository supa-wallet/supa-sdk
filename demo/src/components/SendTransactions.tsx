import { useSendMultipleTransactions } from '@supanovaapp/sdk';
import { useMemo, useState } from 'react';
import type { CantonQueryCompletionResponseDto, TransactionToSend } from '@supanovaapp/sdk';
import { Layers, Plus, Trash2, Send, AlertTriangle, CheckCircle } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  TextArea,
  Input,
  InputGroup,
  InputLabel,
  Flex,
  Text,
  Alert,
} from '../ui';
import styled from 'styled-components';
import { theme } from '../ui/theme';

const SuccessBox = styled.div`
  background: ${theme.colors.info.muted};
  border: 1px solid ${theme.colors.info.primary}40;
  border-radius: ${theme.radii.md};
  padding: ${theme.space[4]};
  margin-top: ${theme.space[4]};
`;

const ResultDisplay = styled.pre`
  background: ${theme.colors.bg.primary};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.radii.md};
  padding: ${theme.space[4]};
  font-family: ${theme.fonts.mono};
  font-size: 0.8125rem;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 200px;
  overflow-y: auto;
  margin: ${theme.space[3]} 0 0 0;
  color: ${theme.colors.text.secondary};
`;

const InfoRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.space[2]};
  padding: ${theme.space[3]};
  background: ${theme.colors.bg.tertiary};
  border-radius: ${theme.radii.md};
  margin-bottom: ${theme.space[2]};
`;

const InfoLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 500;
  color: ${theme.colors.text.muted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InfoValue = styled.span`
  font-size: 0.875rem;
  color: ${theme.colors.text.primary};
  font-family: ${theme.fonts.mono};
  word-break: break-word;
`;

const TxHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const TxCard = styled.div`
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.radii.md};
  padding: ${theme.space[4]};
  background: ${theme.colors.bg.secondary};
`;

interface SendTransactionsProps {
  showTechnicalDetails: boolean;
}

type TxDraft = { command: string; disclosedContracts: string; commandId: string };

export function SendTransactions({ showTechnicalDetails }: SendTransactionsProps) {
  const { sendMultipleTransactions, loading, error } = useSendMultipleTransactions();
  const [drafts, setDrafts] = useState<TxDraft[]>([
    { command: '', disclosedContracts: '', commandId: '' },
    { command: '', disclosedContracts: '', commandId: '' },
  ]);
  const [deduplicationPeriod, setDeduplicationPeriod] = useState('');
  const [results, setResults] = useState<CantonQueryCompletionResponseDto[] | null>(null);

  const canSend = useMemo(
    () => !loading && drafts.length > 0 && drafts.every((d) => d.command.trim().length > 0),
    [drafts, loading]
  );

  const parseJSON = (str: string) => {
    try {
      return JSON.parse(str);
    } catch {
      return str;
    }
  };

  const toTxs = (): TransactionToSend[] =>
    drafts.map((d) => ({
      commands: parseJSON(d.command),
      disclosedContracts: d.disclosedContracts.trim() ? parseJSON(d.disclosedContracts) : undefined,
      commandId: d.commandId.trim() || undefined,
    }));

  const handleAdd = () => {
    setDrafts((prev) => [...prev, { command: '', disclosedContracts: '', commandId: '' }]);
  };

  const handleRemove = (idx: number) => {
    setDrafts((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleChange = (idx: number, patch: Partial<TxDraft>) => {
    setDrafts((prev) => prev.map((d, i) => (i === idx ? { ...d, ...patch } : d)));
  };

  const handleSendClick = async () => {
    if (!canSend) return;
    setResults(null);

    await sendMultipleTransactions(toTxs(), {
      showTechnicalDetails,
      deduplicationPeriod: deduplicationPeriod.trim() ? { value: deduplicationPeriod.trim() } : undefined,
      onSuccess: setResults,
      onRejection: () => console.log('User rejected transactions'),
      onError: (err) => console.error('Transactions failed:', err),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Layers /> Send Multiple Transactions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Flex $direction="column" $gap={4}>
          {drafts.map((d, idx) => (
            <TxCard key={idx}>
              <Flex $direction="column" $gap={3}>
                <TxHeaderRow>
                  <Text $weight={600}>Transaction {idx + 1}</Text>
                  <Button
                    $variant="secondary"
                    onClick={() => handleRemove(idx)}
                    disabled={loading || drafts.length <= 1}
                    style={{ padding: '8px 10px', display: 'flex', gap: 8, alignItems: 'center' }}
                  >
                    <Trash2 style={{ width: 16, height: 16 }} />
                    Remove
                  </Button>
                </TxHeaderRow>

                <InputGroup>
                  <InputLabel>Command</InputLabel>
                  <Text $size="xs" $color="muted" style={{ marginTop: -4, marginBottom: 4 }}>
                    Enter JSON object, array, or string
                  </Text>
                  <TextArea
                    value={d.command}
                    onChange={(e) => handleChange(idx, { command: e.target.value })}
                    placeholder='{"command": "example"} or "simple-command"'
                    $mono
                  />
                </InputGroup>

                <InputGroup>
                  <InputLabel>Disclosed Contracts (optional)</InputLabel>
                  <Text $size="xs" $color="muted" style={{ marginTop: -4, marginBottom: 4 }}>
                    Enter JSON object or array
                  </Text>
                  <TextArea
                    value={d.disclosedContracts}
                    onChange={(e) => handleChange(idx, { disclosedContracts: e.target.value })}
                    placeholder='{"contract": "data"}'
                    $mono
                  />
                </InputGroup>

                <InputGroup>
                  <InputLabel>Command ID (optional)</InputLabel>
                  <Text $size="xs" $color="muted" style={{ marginTop: -4, marginBottom: 4 }}>
                    Optional identifier for idempotency
                  </Text>
                  <Input
                    value={d.commandId}
                    onChange={(e) => handleChange(idx, { commandId: e.target.value })}
                    placeholder="my-unique-command-id"
                    $mono
                  />
                </InputGroup>
              </Flex>
            </TxCard>
          ))}

          <InputGroup>
            <InputLabel>Deduplication Period (optional, shared)</InputLabel>
            <Text $size="xs" $color="muted" style={{ marginTop: -4, marginBottom: 4 }}>
              ISO 8601 duration applied to all transactions, e.g. PT60S
            </Text>
            <Input
              value={deduplicationPeriod}
              onChange={(e) => setDeduplicationPeriod(e.target.value)}
              placeholder="PT60S"
              $mono
            />
          </InputGroup>

          <Button
            $variant="secondary"
            onClick={handleAdd}
            disabled={loading}
            style={{ display: 'flex', gap: 8, alignItems: 'center' }}
          >
            <Plus style={{ width: 16, height: 16 }} />
            Add Transaction
          </Button>
        </Flex>

        <Button
          $variant="primary"
          $fullWidth
          onClick={handleSendClick}
          disabled={!canSend}
          style={{ marginTop: 16 }}
        >
          <Send style={{ width: 16, height: 16 }} />
          {loading ? 'Sending...' : `Send ${drafts.length} Transactions`}
        </Button>

        {error && (
          <Alert $variant="error" style={{ marginTop: 16 }}>
            <AlertTriangle />
            {error.message}
          </Alert>
        )}

        {results && (
          <SuccessBox>
            <Flex $align="center" $gap={2} style={{ marginBottom: 16 }}>
              <CheckCircle style={{ width: 18, height: 18, color: theme.colors.info.primary }} />
              <Text $weight={500} style={{ color: theme.colors.info.primary }}>
                Submitted {results.length} transactions
              </Text>
            </Flex>

            {results.map((r, idx) => (
              <div key={idx} style={{ marginBottom: 16 }}>
                <Text $weight={600} style={{ marginBottom: 8 }}>
                  Result {idx + 1}
                </Text>

                <InfoRow>
                  <InfoLabel>Status</InfoLabel>
                  <InfoValue>{r.status}</InfoValue>
                </InfoRow>

                <InfoRow>
                  <InfoLabel>Message</InfoLabel>
                  <InfoValue>{r.message}</InfoValue>
                </InfoRow>

                {r.data && (
                  <InfoRow>
                    <InfoLabel>Data</InfoLabel>
                    <ResultDisplay>{JSON.stringify(r.data, null, 2)}</ResultDisplay>
                  </InfoRow>
                )}
              </div>
            ))}
          </SuccessBox>
        )}
      </CardContent>
    </Card>
  );
}

