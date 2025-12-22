import { Wallet, Zap, Sun, Moon } from 'lucide-react';
import {
  useTheme,
  LoginView,
  LoginCard,
  LoginIcon,
  LoginTitle,
  LoginSubtitle,
  Button,
  IconButton,
  Flex,
  Text,
} from '../ui';

interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const { mode, toggleTheme } = useTheme();

  return (
    <LoginView>
      <LoginCard>
        <Flex $justify="flex-end" $fullWidth style={{ marginBottom: -8 }}>
          <IconButton onClick={toggleTheme} $variant="ghost">
            {mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </IconButton>
        </Flex>
        <LoginIcon>
          <Zap />
        </LoginIcon>
        <LoginTitle>Supa SDK Demo</LoginTitle>
        <LoginSubtitle>
          Connect your wallet to explore Canton Network integration
        </LoginSubtitle>
        <Button $variant="primary" $size="lg" $fullWidth onClick={onLogin}>
          <Wallet style={{ width: 20, height: 20 }} />
          Connect Wallet
        </Button>
        <Text $size="sm" $color="muted" style={{ marginTop: 16 }}>
          Powered by Privy
        </Text>
      </LoginCard>
    </LoginView>
  );
}

