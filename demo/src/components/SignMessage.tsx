import { useCanton } from '@supa/sdk';
import { useState } from 'react';
import { PenTool, AlertTriangle, CheckCircle, Copy, Check } from 'lucide-react';
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
} from '../ui';
import { Modal } from '../ui/Modal';
import styled from 'styled-components';
import { theme } from '../ui/theme';

const MessagePreview = styled.pre`
  background: ${theme.colors.bg.primary};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.radii.md};
  padding: ${theme.space[4]};
  font-family: ${theme.fonts.mono};
  font-size: 0.875rem;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 300px;
  overflow-y: auto;
  margin: 0;
  color: ${theme.colors.text.primary};
`;

const SuccessBox = styled.div`
  background: ${theme.colors.success.muted};
  border: 1px solid ${theme.colors.success.primary}40;
  border-radius: ${theme.radii.md};
  padding: ${theme.space[4]};
  margin-top: ${theme.space[4]};
`;

const CopyButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${theme.space[2]};
  padding: ${theme.space[2]} ${theme.space[3]};
  background: ${theme.colors.bg.tertiary};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.radii.sm};
  font-size: 0.75rem;
  color: ${theme.colors.text.secondary};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  
  &:hover {
    background: ${theme.colors.bg.hover};
    color: ${theme.colors.text.primary};
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

export function SignMessage() {
  const { signMessage, loading, error } = useCanton();
  const [message, setMessage] = useState('');
  const [signature, setSignature] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSignClick = () => {
    if (!message.trim()) return;
    setShowConfirmDialog(true);
  };

  const handleConfirmSign = async () => {
    setShowConfirmDialog(false);
    setIsProcessing(true);
    setSignature('');

    try {
      const sig = await signMessage(message);
      setSignature(sig);
    } catch (err: any) {
      console.error('Failed to sign message:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(signature);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            <PenTool /> Sign Message
          </CardTitle>
        </CardHeader>
        <CardContent>
          <InputGroup>
            <InputLabel>Message to sign</InputLabel>
            <TextArea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message here..."
              $mono
              style={{ minHeight: '120px' }}
            />
          </InputGroup>

          <Button
            $variant="primary"
            $fullWidth
            onClick={handleSignClick}
            disabled={isProcessing || loading || !message.trim()}
            style={{ marginTop: 16 }}
          >
            {isProcessing ? 'Signing...' : 'Sign Message'}
          </Button>

          {error && (
            <Alert $variant="error" style={{ marginTop: 16 }}>
              <AlertTriangle />
              {error.message}
            </Alert>
          )}

          {signature && (
            <SuccessBox>
              <Flex $align="center" $gap={2} style={{ marginBottom: 12 }}>
                <CheckCircle style={{ width: 18, height: 18, color: theme.colors.success.primary }} />
                <Text $weight={500} style={{ color: theme.colors.success.primary }}>
                  Message signed successfully
                </Text>
              </Flex>
              <Flex $justify="space-between" $align="center" style={{ marginBottom: 8 }}>
                <Text $size="sm" $color="secondary">Signature (hex)</Text>
                <CopyButton onClick={handleCopy}>
                  {copied ? <Check /> : <Copy />}
                  {copied ? 'Copied!' : 'Copy'}
                </CopyButton>
              </Flex>
              <CodeBlock style={{ margin: 0 }}>
                <code>{signature}</code>
              </CodeBlock>
            </SuccessBox>
          )}
        </CardContent>
      </Card>

      <Modal
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        title={
          <>
            <AlertTriangle style={{ color: theme.colors.accent.primary }} />
            Confirm Signing
          </>
        }
        footer={
          <>
            <Button $variant="secondary" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button $variant="primary" onClick={handleConfirmSign}>
              Sign Message
            </Button>
          </>
        }
      >
        <Text $color="secondary" style={{ marginBottom: 16 }}>
          You are about to sign the following message:
        </Text>
        <MessagePreview>{message}</MessagePreview>
        <Alert $variant="info" style={{ marginTop: 16 }}>
          <AlertTriangle />
          <Text $size="sm">
            Signing a message proves ownership of your wallet without exposing private keys.
          </Text>
        </Alert>
      </Modal>
    </>
  );
}
