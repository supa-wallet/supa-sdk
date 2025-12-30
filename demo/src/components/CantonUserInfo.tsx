import { useCanton } from '@supanovaapp/sdk';
import { useEffect, useRef } from 'react';
import { User, Mail, Hash, RefreshCw, Key } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  WalletCard,
  WalletIcon,
  WalletInfo,
  WalletLabel,
  WalletAddress,
  Flex,
  Text,
  Spinner,
  Alert,
} from '../ui';
import { getPublicKeyBase64 } from '@supanovaapp/sdk';

export function CantonUserInfo() {
  const { cantonUser, getMe, isRegistered, loading, stellarWallet } = useCanton();
  const loadedRef = useRef(false);

  useEffect(() => {
    if (isRegistered && !cantonUser && !loadedRef.current) {
      loadedRef.current = true;
      getMe().catch(err => console.error('Failed to load Canton user:', err));
    }
  }, [isRegistered, cantonUser, getMe]);

  if (!isRegistered) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <User /> Canton Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert $variant="warning">
            Please register your Canton wallet to view account information.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (loading || !cantonUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <User /> Canton Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Flex $align="center" $justify="center" $gap={3} style={{ padding: '32px' }}>
            <Spinner />
            <Text $color="secondary">Loading account info...</Text>
          </Flex>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <User /> Canton Account
        </CardTitle>
        <Button
          $variant="ghost"
          $size="sm"
          onClick={() => getMe()}
          disabled={loading}
        >
          <RefreshCw style={{ width: 16, height: 16 }} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <Flex $direction="column" $gap={4}>
          <WalletCard>
            <WalletIcon>
              <Hash />
            </WalletIcon>
            <WalletInfo>
              <WalletLabel>Party ID</WalletLabel>
              <WalletAddress style={{ fontSize: '0.8125rem', wordBreak: 'break-all' }}>
                {cantonUser.partyId}
              </WalletAddress>
            </WalletInfo>
          </WalletCard>

          {stellarWallet && (
            <WalletCard>
              <WalletIcon>
                <Key />
              </WalletIcon>
              <WalletInfo>
                <WalletLabel>Public Key (Base64)</WalletLabel>
                <WalletAddress style={{ fontSize: '0.8125rem', wordBreak: 'break-all' }}>
                  {getPublicKeyBase64(stellarWallet)}
                </WalletAddress>
              </WalletInfo>
            </WalletCard>
          )}

          <WalletCard>
            <WalletIcon>
              <Mail />
            </WalletIcon>
            <WalletInfo>
              <WalletLabel>Email</WalletLabel>
              <WalletAddress>
                {cantonUser.email || (
                  <Text $color="muted" $size="sm">Not set</Text>
                )}
              </WalletAddress>
            </WalletInfo>
          </WalletCard>
        </Flex>
      </CardContent>
    </Card>
  );
}
