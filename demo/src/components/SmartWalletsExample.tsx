/**
 * Smart Wallets Example Component
 * Demonstrates how to use Privy Smart Wallets with Supa SDK
 */

import { useSmartWallets } from '@supanovaapp/sdk';
import styled from 'styled-components';

const Container = styled.div`
  padding: 20px;
  border-radius: 8px;
  background: ${props => props.theme.surface};
  border: 1px solid ${props => props.theme.border};
`;

const Title = styled.h3`
  margin: 0 0 16px 0;
  color: ${props => props.theme.text};
`;

const Address = styled.p`
  font-family: monospace;
  font-size: 14px;
  color: ${props => props.theme.textSecondary};
  word-break: break-all;
  padding: 12px;
  background: ${props => props.theme.background};
  border-radius: 4px;
  margin: 8px 0;
`;

const Status = styled.div<{ ready: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  background: ${props => props.ready ? '#e8f5e9' : '#fff3e0'};
  color: ${props => props.ready ? '#2e7d32' : '#f57c00'};
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 16px;
`;

const Button = styled.button`
  padding: 12px 24px;
  background: ${props => props.theme.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Info = styled.p`
  color: ${props => props.theme.textSecondary};
  font-size: 14px;
  margin: 8px 0;
`;

export function SmartWalletsExample() {
  const { client, address, ready, getClientForChain } = useSmartWallets();

  return (
    <Container>
      <Title>🔐 EVM Smart Wallet</Title>
      
      <Status ready={ready}>
        <span>{ready ? '●' : '○'}</span>
        {ready ? 'Ready to use' : 'Not initialized'}
      </Status>

      {address ? (
        <>
          <Info>Your Smart Wallet address:</Info>
          <Address>{address}</Address>
          <Info>
            A Smart Wallet is a smart-contract-based wallet with advanced features,
            including gas sponsorship and batch transactions.
          </Info>
        </>
      ) : (
        <>
          <Info>
            A Smart Wallet is automatically created after an embedded wallet is created.
            {!client && ' Please sign in to use Smart Wallet.'}
          </Info>
        </>
      )}
    </Container>
  );
}

