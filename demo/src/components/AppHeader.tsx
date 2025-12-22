import { Zap, LogOut, Sun, Moon } from 'lucide-react';
import {
  useTheme,
  Header,
  HeaderContent,
  Logo,
  LogoIcon,
  IconButton,
  Flex,
  Badge,
  StatusDot,
} from '../ui';

interface AppHeaderProps {
  isRegistered: boolean;
  onLogout: () => void;
  showTechnicalDetails: boolean;
  onToggleTechnicalDetails: (value: boolean) => void;
}

export function AppHeader({ 
  isRegistered, 
  onLogout,
  showTechnicalDetails,
  onToggleTechnicalDetails,
}: AppHeaderProps) {
  const { mode, toggleTheme } = useTheme();

  return (
    <Header>
      <HeaderContent>
        <Logo>
          <LogoIcon>
            <Zap style={{ width: 20, height: 20, color: '#fff' }} />
          </LogoIcon>
          Supa SDK
        </Logo>
        <Flex $align="center" $gap={4}>
          {isRegistered && (
            <Badge $variant="success">
              <StatusDot $status="success" />
              Canton Connected
            </Badge>
          )}
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            color: 'var(--text-muted)',
            whiteSpace: 'nowrap',
          }}>
            <input
              type="checkbox"
              checked={showTechnicalDetails}
              onChange={(e) => onToggleTechnicalDetails(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            Show tech details
          </label>
          <IconButton
            onClick={toggleTheme}
            $variant="secondary"
            title={mode === 'dark' ? 'Light theme' : 'Dark theme'}
          >
            {mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </IconButton>
          <IconButton onClick={onLogout} $variant="secondary">
            <LogOut />
          </IconButton>
        </Flex>
      </HeaderContent>
    </Header>
  );
}

