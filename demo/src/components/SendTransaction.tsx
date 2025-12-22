import { useCanton } from '@supa/sdk';
import { useState } from 'react';
import type { CantonSubmitTransactionResponseDto } from '@supa/sdk';
import { Send, AlertTriangle, CheckCircle } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  TextArea,
  InputGroup,
  InputLabel,
  Flex,
  Text,
  Alert,
  CodeBlock,
  WalletCard,
  WalletIcon,
  WalletInfo,
  WalletLabel,
  WalletAddress,
} from '../ui';
import { Modal } from '../ui/Modal';
import styled from 'styled-components';
import { theme } from '../ui/theme';

const CommandPreview = styled.pre`
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
  margin: 0;
  color: ${theme.colors.text.secondary};
`;

const SuccessBox = styled.div`
  background: ${theme.colors.info.muted};
  border: 1px solid ${theme.colors.info.primary}40;
  border-radius: ${theme.radii.md};
  padding: ${theme.space[4]};
  margin-top: ${theme.space[4]};
`;

export function SendTransaction() {
  const { sendTransaction, loading, error } = useCanton();
  const [commandId, setCommandId] = useState('');
  const [disclosedContracts, setDisclosedContracts] = useState('');
  const [result, setResult] = useState<CantonSubmitTransactionResponseDto | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [parsedCommand, setParsedCommand] = useState<unknown>(null);
  const [parsedDisclosed, setParsedDisclosed] = useState<unknown>(null);

  const handleSendClick = () => {
    if (!commandId.trim()) return;

    let cmd: unknown;
    let disclosed: unknown = undefined;

    try {
      cmd = JSON.parse(commandId);
      setParsedCommand(cmd);
    } catch {
      cmd = commandId;
      setParsedCommand(commandId);
    }

    if (disclosedContracts.trim()) {
      try {
        disclosed = JSON.parse(disclosedContracts);
        setParsedDisclosed(disclosed);
      } catch {
        disclosed = disclosedContracts;
        setParsedDisclosed(disclosedContracts);
      }
    } else {
      setParsedDisclosed(null);
    }

    setShowConfirmDialog(true);
  };

  const handleConfirmSend = async () => {
    setShowConfirmDialog(false);
    setIsProcessing(true);
    setResult(null);

    try {
      const res = await sendTransaction(parsedCommand, parsedDisclosed ?? undefined);
      setResult(res);
    } catch (err: any) {
      console.error('Failed to send transaction:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
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
                value={commandId}
                onChange={(e) => setCommandId(e.target.value)}
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
          </Flex>

          <Button
            $variant="primary"
            $fullWidth
            onClick={handleSendClick}
            disabled={isProcessing || loading || !commandId.trim()}
            style={{ marginTop: 16 }}
          >
            <Send style={{ width: 16, height: 16 }} />
            {isProcessing ? 'Sending...' : 'Send Transaction'}
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
                  Transaction submitted successfully
                </Text>
              </Flex>

              <WalletCard style={{ marginBottom: 12 }}>
                <WalletInfo>
                  <WalletLabel>Party ID</WalletLabel>
                  <WalletAddress style={{ fontSize: '0.8125rem', wordBreak: 'break-all' }}>
                    {result.partyId}
                  </WalletAddress>
                </WalletInfo>
              </WalletCard>

              {result.email && (
                <WalletCard>
                  <WalletInfo>
                    <WalletLabel>Email</WalletLabel>
                    <WalletAddress>{result.email}</WalletAddress>
                  </WalletInfo>
                </WalletCard>
              )}
            </SuccessBox>
          )}
        </CardContent>
      </Card>

      <Modal
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        title={
          <>
            <Send style={{ color: theme.colors.accent.primary }} />
            Confirm Transaction
          </>
        }
        footer={
          <>
            <Button $variant="secondary" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button $variant="primary" onClick={handleConfirmSend}>
              <Send style={{ width: 16, height: 16 }} />
              Confirm & Send
            </Button>
          </>
        }
      >
        <Text $color="secondary" style={{ marginBottom: 16 }}>
          You are about to send the following transaction:
        </Text>

        <InputLabel style={{ marginBottom: 8 }}>Command</InputLabel>
        <CommandPreview>{JSON.stringify(parsedCommand, null, 2)}</CommandPreview>

        {parsedDisclosed !== null && (
          <>
            <InputLabel style={{ marginTop: 16, marginBottom: 8 }}>
              Disclosed Contracts
            </InputLabel>
            <CommandPreview>{JSON.stringify(parsedDisclosed, null, 2)}</CommandPreview>
          </>
        )}

        <Alert $variant="warning" style={{ marginTop: 16 }}>
          <AlertTriangle />
          <Text $size="sm">
            This action will submit a transaction to the Canton Network.
          </Text>
        </Alert>
      </Modal>
    </>
  );
}
