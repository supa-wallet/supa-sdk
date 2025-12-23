import { Wallet } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  WalletCard,
  WalletIcon,
  WalletInfo,
  WalletLabel,
  WalletAddress,
  Section,
} from '../ui';

interface StellarWalletCardProps {
  address: string;
  isRegistered: boolean;
}

export function StellarWalletCard({ address, isRegistered }: StellarWalletCardProps) {
  return (
    <Section>
      <Card>
        <CardHeader>
          <CardTitle>
            <Wallet /> Wallet
          </CardTitle>
          {isRegistered && <Badge $variant="success">Registered</Badge>}
        </CardHeader>
        <CardContent>
          <WalletCard>
            <WalletIcon>
              <Wallet />
            </WalletIcon>
            <WalletInfo>
              <WalletLabel>Address</WalletLabel>
              <WalletAddress>
                {address.slice(0, 12)}...{address.slice(-8)}
              </WalletAddress>
            </WalletInfo>
          </WalletCard>
        </CardContent>
      </Card>
    </Section>
  );
}

