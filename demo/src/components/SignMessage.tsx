import { useSignMessage } from '@supa/sdk';
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
import styled from 'styled-components';
import { theme } from '../ui/theme';

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

interface SignMessageProps {
  showTechnicalDetails: boolean;
}

export function SignMessage({ showTechnicalDetails }: SignMessageProps) {
  // Using the new useSignMessage hook with built-in confirmation modal
  const { signMessage, loading, error } = useSignMessage();
  const [message, setMessage] = useState('');
  const [signature, setSignature] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSignClick = async () => {
    if (!message.trim()) return;
    
    setSignature('');
    await signMessage(message, {
      showTechnicalDetails,
      onSuccess: setSignature,
      onRejection: () => console.log('User rejected signing'),
      onError: (err) => console.error('Signing failed:', err),
    });
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(signature);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
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
          disabled={loading || !message.trim()}
          style={{ marginTop: 16 }}
        >
          {loading ? 'Signing...' : 'Sign Message'}
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
  );
}
