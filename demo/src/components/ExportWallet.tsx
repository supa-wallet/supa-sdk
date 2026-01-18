/**
 * Export Wallet Component
 * Allows users to export their Privy wallet private key
 */

import { useState } from 'react';
import { useAuth, useStellarWallet } from '@supanovaapp/sdk';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  background: ${props => props.theme.colors.cardBackground};
  border-radius: 12px;
  border: 1px solid ${props => props.theme.colors.border};
`;

const Title = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const Description = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.5;
`;

const WalletInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: ${props => props.theme.colors.background};
  border-radius: 8px;
  border: 1px solid ${props => props.theme.colors.border};
`;

const WalletLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const WalletAddress = styled.div`
  font-size: 14px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  color: ${props => props.theme.colors.text};
  word-break: break-all;
`;

const Button = styled.button`
  padding: 12px 24px;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primaryHover};
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  padding: 12px;
  background: ${props => props.theme.colors.error}20;
  border: 1px solid ${props => props.theme.colors.error};
  border-radius: 8px;
  color: ${props => props.theme.colors.error};
  font-size: 14px;
`;

const SuccessMessage = styled.div`
  padding: 12px;
  background: ${props => props.theme.colors.success}20;
  border: 1px solid ${props => props.theme.colors.success};
  border-radius: 8px;
  color: ${props => props.theme.colors.success};
  font-size: 14px;
`;

const WarningBox = styled.div`
  padding: 16px;
  background: #ff9800;
  background: linear-gradient(135deg, #ff9800 0%, #ff6b00 100%);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  line-height: 1.6;
  
  strong {
    display: block;
    margin-bottom: 8px;
    font-size: 15px;
  }
`;

export function ExportWallet() {
  const { authenticated, exportWallet, user } = useAuth();
  const { cantonWallet, cantonWallets } = useStellarWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleExport = async () => {
    if (!cantonWallet) {
      setError('No Canton wallet found. Please create a wallet first.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Export the primary Canton wallet
      await exportWallet({ address: cantonWallet.address });
      setSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Export wallet error:', err);
      setError(err.message || 'Failed to export wallet');
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated) {
    return (
      <Container>
        <Title>🔑 Export Wallet</Title>
        <Description>
          Please log in to export your wallet private key.
        </Description>
      </Container>
    );
  }

  if (!cantonWallet) {
    return (
      <Container>
        <Title>🔑 Export Wallet</Title>
        <Description>
          No Canton wallet found. Please create or link a wallet first.
        </Description>
      </Container>
    );
  }

  return (
    <Container>
      <Title>🔑 Export Wallet Private Key</Title>
      
      <Description>
        Export your wallet's private key to use it with other wallet clients like MetaMask or Phantom.
        Your private key gives you full control over your wallet.
      </Description>

      <WarningBox>
        <strong>⚠️ Security Warning</strong>
        Never share your private key with anyone! Anyone with access to your private key 
        can control your wallet and all its assets. Keep it safe and secure.
      </WarningBox>

      <WalletInfo>
        <WalletLabel>Primary Canton Wallet</WalletLabel>
        <WalletAddress>{cantonWallet.address}</WalletAddress>
      </WalletInfo>

      {cantonWallets.length > 1 && (
        <Description>
          💡 You have {cantonWallets.length} wallets. Exporting will show the private key for your primary wallet.
        </Description>
      )}

      {error && <ErrorMessage>❌ {error}</ErrorMessage>}
      {success && <SuccessMessage>✅ Wallet exported successfully!</SuccessMessage>}

      <Button onClick={handleExport} disabled={loading}>
        {loading ? '⏳ Opening Export Modal...' : '📤 Export Private Key'}
      </Button>

      <Description style={{ fontSize: '12px', fontStyle: 'italic' }}>
        A Privy modal will open where you can safely copy your private key.
      </Description>
    </Container>
  );
}
