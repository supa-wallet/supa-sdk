import { useSendTransaction } from '@supanovaapp/sdk';
import { useState } from 'react';
import type { CantonQueryCompletionResponseDto } from '@supanovaapp/sdk';
import { Send, AlertTriangle, CheckCircle } from 'lucide-react';
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

interface SendTransactionProps {
  showTechnicalDetails: boolean;
}

export function SendTransaction({ showTechnicalDetails }: SendTransactionProps) {
  // Using the new useSendTransaction hook with built-in confirmation modal
  const { sendTransaction, loading, error } = useSendTransaction();
  const [command, setCommand] = useState('');
  const [disclosedContracts, setDisclosedContracts] = useState('');
  const [cmdId, setCmdId] = useState('');
  const [deduplicationPeriod, setDeduplicationPeriod] = useState('');
  const [result, setResult] = useState<CantonQueryCompletionResponseDto | null>(null);

  const handleSendClick = async () => {
    if (!command.trim()) return;

    const parseJSON = (str: string) => {
      try { return JSON.parse(str); } catch { return str; }
    };

    const cmd = parseJSON(command);
    const disclosed = disclosedContracts.trim() ? parseJSON(disclosedContracts) : undefined;

    setResult(null);
    await sendTransaction(cmd, disclosed, {
      showTechnicalDetails,
      commandId: cmdId.trim() || undefined,
      submitOptions: {
        deduplicationPeriod: deduplicationPeriod.trim() ? { value: deduplicationPeriod.trim() } : undefined,
      },
      onSuccess: setResult,
      onRejection: () => console.log('User rejected transaction'),
      onError: (err) => console.error('Transaction failed:', err),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Send /> Send Transaction
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Flex $direction="column" $gap={4}>
          <InputGroup>
            <InputLabel>Command</InputLabel>
            <Text $size="xs" $color="muted" style={{ marginTop: -4, marginBottom: 4 }}>
              Enter JSON object, array, or string
            </Text>
            <TextArea
              value={command}
              onChange={(e) => setCommand(e.target.value)}
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
              value={disclosedContracts}
              onChange={(e) => setDisclosedContracts(e.target.value)}
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
              value={cmdId}
              onChange={(e) => setCmdId(e.target.value)}
              placeholder="my-unique-command-id"
              $mono
            />
          </InputGroup>

          <InputGroup>
            <InputLabel>Deduplication Period (optional)</InputLabel>
            <Text $size="xs" $color="muted" style={{ marginTop: -4, marginBottom: 4 }}>
              ISO 8601 duration, e.g. PT60S
            </Text>
            <Input
              value={deduplicationPeriod}
              onChange={(e) => setDeduplicationPeriod(e.target.value)}
              placeholder="PT60S"
              $mono
            />
          </InputGroup>
        </Flex>

        <Button
          $variant="primary"
          $fullWidth
          onClick={handleSendClick}
          disabled={loading || !command.trim()}
          style={{ marginTop: 16 }}
        >
          <Send style={{ width: 16, height: 16 }} />
          {loading ? 'Sending...' : 'Send Transaction'}
        </Button>

        {error && (
          <Alert $variant="error" style={{ marginTop: 16 }}>
            <AlertTriangle />
            {error.message}
          </Alert>
        )}

        {result && (
          <SuccessBox>
            <Flex $align="center" $gap={2} style={{ marginBottom: 16 }}>
              <CheckCircle style={{ width: 18, height: 18, color: theme.colors.info.primary }} />
              <Text $weight={500} style={{ color: theme.colors.info.primary }}>
                Transaction {result.status}
              </Text>
            </Flex>

            <InfoRow>
              <InfoLabel>Status</InfoLabel>
              <InfoValue>{result.status}</InfoValue>
            </InfoRow>

            <InfoRow>
              <InfoLabel>Message</InfoLabel>
              <InfoValue>{result.message}</InfoValue>
            </InfoRow>

            {result.data && (
              <InfoRow>
                <InfoLabel>Data</InfoLabel>
                <ResultDisplay>{JSON.stringify(result.data, null, 2)}</ResultDisplay>
              </InfoRow>
            )}
          </SuccessBox>
        )}
      </CardContent>
    </Card>
  );
}
