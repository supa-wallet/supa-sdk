import styled, { css, keyframes } from 'styled-components';

// === Animations ===
export const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

export const fadeIn = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(8px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
`;

export const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

// === Layout ===
export const AppLayout = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

export const Header = styled.header`
  background: ${({ theme }) => theme.colors.bg.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
  padding: ${({ theme }) => theme.space[4]} ${({ theme }) => theme.space[6]};
  position: sticky;
  top: 0;
  z-index: 50;
  backdrop-filter: blur(12px);
`;

export const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space[3]};
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const LogoIcon = styled.div`
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.accent.primary} 0%, #dc2626 100%);
  border-radius: ${({ theme }) => theme.radii.md};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
`;

export const Main = styled.main`
  flex: 1;
  padding: ${({ theme }) => theme.space[8]};
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.space[4]};
  }
`;

export const Footer = styled.footer`
  background: ${({ theme }) => theme.colors.bg.secondary};
  border-top: 1px solid ${({ theme }) => theme.colors.border.primary};
  padding: ${({ theme }) => theme.space[4]} ${({ theme }) => theme.space[6]};
  text-align: center;
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.875rem;
`;

// === Card ===
export const Card = styled.div`
  background: ${({ theme }) => theme.colors.bg.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
  animation: ${fadeIn} ${({ theme }) => theme.transitions.normal};
`;

export const CardHeader = styled.div`
  padding: ${({ theme }) => theme.space[5]} ${({ theme }) => theme.space[6]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space[4]};
`;

export const CardTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space[3]};

  svg {
    width: 22px;
    height: 22px;
    color: ${({ theme }) => theme.colors.accent.primary};
  }
`;

export const CardContent = styled.div`
  padding: ${({ theme }) => theme.space[6]};
`;

export const CardFooter = styled.div`
  padding: ${({ theme }) => theme.space[4]} ${({ theme }) => theme.space[6]};
  border-top: 1px solid ${({ theme }) => theme.colors.border.primary};
  background: ${({ theme }) => theme.colors.bg.tertiary};
`;

// === Button ===
interface ButtonProps {
  $variant?: 'primary' | 'secondary' | 'ghost' | 'success' | 'danger';
  $size?: 'sm' | 'md' | 'lg';
  $fullWidth?: boolean;
}

const buttonVariants = {
  primary: css`
    background: ${({ theme }) => theme.colors.accent.primary};
    color: #000;
    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.accent.hover};
    }
  `,
  secondary: css`
    background: ${({ theme }) => theme.colors.bg.elevated};
    color: ${({ theme }) => theme.colors.text.primary};
    border: 1px solid ${({ theme }) => theme.colors.border.primary};
    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.bg.hover};
      border-color: ${({ theme }) => theme.colors.border.hover};
    }
  `,
  ghost: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.text.secondary};
    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.bg.hover};
      color: ${({ theme }) => theme.colors.text.primary};
    }
  `,
  success: css`
    background: ${({ theme }) => theme.colors.success.primary};
    color: #fff;
    &:hover:not(:disabled) {
      filter: brightness(1.1);
    }
  `,
  danger: css`
    background: ${({ theme }) => theme.colors.error.primary};
    color: #fff;
    &:hover:not(:disabled) {
      filter: brightness(1.1);
    }
  `,
};

const buttonSizes = {
  sm: css`
    padding: ${({ theme }) => theme.space[2]} ${({ theme }) => theme.space[3]};
    font-size: 0.8125rem;
  `,
  md: css`
    padding: ${({ theme }) => theme.space[3]} ${({ theme }) => theme.space[4]};
    font-size: 0.875rem;
  `,
  lg: css`
    padding: ${({ theme }) => theme.space[4]} ${({ theme }) => theme.space[6]};
    font-size: 1rem;
  `,
};

export const Button = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.space[2]};
  font-family: inherit;
  font-weight: 500;
  line-height: 1;
  border-radius: ${({ theme }) => theme.radii.md};
  border: none;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  white-space: nowrap;
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};

  ${({ $variant = 'primary' }) => buttonVariants[$variant]}
  ${({ $size = 'md' }) => buttonSizes[$size]}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

export const IconButton = styled.button<{ $variant?: 'ghost' | 'secondary' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: none;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  background: ${({ $variant, theme }) =>
    $variant === 'secondary' ? theme.colors.bg.elevated : 'transparent'};
  color: ${({ theme }) => theme.colors.text.secondary};
  border: ${({ $variant, theme }) =>
    $variant === 'secondary' ? `1px solid ${theme.colors.border.primary}` : 'none'};

  &:hover {
    background: ${({ theme }) => theme.colors.bg.hover};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

// === Input ===
export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[2]};
`;

export const InputLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const Input = styled.input<{ $mono?: boolean }>`
  font-family: ${({ $mono, theme }) => ($mono ? theme.fonts.mono : 'inherit')};
  font-size: ${({ $mono }) => ($mono ? '0.875rem' : '0.9375rem')};
  padding: ${({ theme }) => theme.space[3]} ${({ theme }) => theme.space[4]};
  background: ${({ theme }) => theme.colors.bg.tertiary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.text.primary};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    border-color: ${({ theme }) => theme.colors.border.hover};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.accent.muted};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }
`;

export const TextArea = styled.textarea<{ $mono?: boolean }>`
  font-family: ${({ $mono, theme }) => ($mono ? theme.fonts.mono : 'inherit')};
  font-size: ${({ $mono }) => ($mono ? '0.875rem' : '0.9375rem')};
  padding: ${({ theme }) => theme.space[3]} ${({ theme }) => theme.space[4]};
  background: ${({ theme }) => theme.colors.bg.tertiary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.text.primary};
  transition: all ${({ theme }) => theme.transitions.fast};
  resize: vertical;
  min-height: 100px;
  line-height: 1.5;

  &:hover {
    border-color: ${({ theme }) => theme.colors.border.hover};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.accent.muted};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }
`;

// === Badge ===
interface BadgeProps {
  $variant?: 'success' | 'error' | 'info' | 'warning';
}

const badgeVariants = {
  success: css`
    background: ${({ theme }) => theme.colors.success.muted};
    color: ${({ theme }) => theme.colors.success.primary};
  `,
  error: css`
    background: ${({ theme }) => theme.colors.error.muted};
    color: ${({ theme }) => theme.colors.error.primary};
  `,
  info: css`
    background: ${({ theme }) => theme.colors.info.muted};
    color: ${({ theme }) => theme.colors.info.primary};
  `,
  warning: css`
    background: ${({ theme }) => theme.colors.accent.muted};
    color: ${({ theme }) => theme.colors.accent.primary};
  `,
};

export const Badge = styled.span<BadgeProps>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.space[1]};
  font-size: 0.75rem;
  font-weight: 500;
  padding: ${({ theme }) => theme.space[1]} ${({ theme }) => theme.space[2]};
  border-radius: ${({ theme }) => theme.radii.full};
  ${({ $variant = 'info' }) => badgeVariants[$variant]}
`;

// === Status ===
interface StatusDotProps {
  $status: 'success' | 'error' | 'warning' | 'info';
}

export const StatusDot = styled.span<StatusDotProps>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${({ $status, theme }) => {
    switch ($status) {
      case 'success':
        return theme.colors.success.primary;
      case 'error':
        return theme.colors.error.primary;
      case 'warning':
        return theme.colors.accent.primary;
      case 'info':
        return theme.colors.info.primary;
    }
  }};
  ${({ $status }) =>
    $status === 'success' &&
    css`
      box-shadow: 0 0 8px ${({ theme }) => theme.colors.success.primary};
    `}
  ${({ $status }) =>
    $status === 'warning' &&
    css`
      animation: ${pulse} 2s infinite;
    `}
`;

export const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space[2]};
  font-size: 0.875rem;
`;

// === Code ===
export const CodeBlock = styled.pre`
  background: ${({ theme }) => theme.colors.bg.primary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.space[4]};
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 0.8125rem;
  overflow-x: auto;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.6;

  code {
    color: ${({ theme }) => theme.colors.accent.primary};
    word-break: break-all;
  }
`;

export const InlineCode = styled.code`
  background: ${({ theme }) => theme.colors.bg.tertiary};
  padding: 2px 6px;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.accent.primary};
`;

// === Grid ===
export const Grid = styled.div<{ $cols?: 1 | 2 | 3 }>`
  display: grid;
  gap: ${({ theme }) => theme.space[6]};
  grid-template-columns: repeat(${({ $cols = 1 }) => $cols}, 1fr);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// === Flex ===
export const Flex = styled.div<{
  $direction?: 'row' | 'column';
  $align?: string;
  $justify?: string;
  $gap?: 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;
  $wrap?: boolean;
  $fullWidth?: boolean;
}>`
  display: flex;
  flex-direction: ${({ $direction = 'row' }) => $direction};
  align-items: ${({ $align = 'stretch' }) => $align};
  justify-content: ${({ $justify = 'flex-start' }) => $justify};
  gap: ${({ $gap, theme }) => ($gap ? theme.space[$gap] : 0)};
  flex-wrap: ${({ $wrap }) => ($wrap ? 'wrap' : 'nowrap')};
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
`;

// === Spinner ===
export const Spinner = styled.div<{ $size?: number }>`
  width: ${({ $size = 20 }) => $size}px;
  height: ${({ $size = 20 }) => $size}px;
  border: 2px solid ${({ theme }) => theme.colors.border.primary};
  border-top-color: ${({ theme }) => theme.colors.accent.primary};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

// === Wallet Card ===
export const WalletCard = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space[4]};
  padding: ${({ theme }) => theme.space[4]};
  background: ${({ theme }) => theme.colors.bg.tertiary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.radii.md};
`;

export const WalletIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.accent.muted};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.accent.primary};

  svg {
    width: 24px;
    height: 24px;
  }
`;

export const WalletInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

export const WalletLabel = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.muted};
  margin-bottom: ${({ theme }) => theme.space[1]};
`;

export const WalletAddress = styled.div`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.primary};
`;

// === Empty State ===
export const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.space[12]} ${({ theme }) => theme.space[6]};
  color: ${({ theme }) => theme.colors.text.muted};

  svg {
    width: 48px;
    height: 48px;
    margin: 0 auto ${({ theme }) => theme.space[4]};
    color: ${({ theme }) => theme.colors.text.muted};
  }
`;

export const EmptyStateTitle = styled.div`
  font-size: 1rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.space[2]};
`;

export const EmptyStateDescription = styled.div`
  font-size: 0.875rem;
`;

// === Login ===
export const LoginView = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.space[6]};
  background: radial-gradient(
      ellipse at 50% 0%,
      rgba(249, 115, 22, 0.1) 0%,
      transparent 50%
    ),
    ${({ theme }) => theme.colors.bg.primary};
`;

export const LoginCard = styled.div`
  background: ${({ theme }) => theme.colors.bg.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: ${({ theme }) => theme.space[10]};
  max-width: 420px;
  width: 100%;
  text-align: center;
  box-shadow: ${({ theme }) => theme.shadows.glow};
  animation: ${fadeIn} ${({ theme }) => theme.transitions.normal};
`;

export const LoginIcon = styled.div`
  width: 72px;
  height: 72px;
  margin: 0 auto ${({ theme }) => theme.space[6]};
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.accent.primary} 0%, #dc2626 100%);
  border-radius: ${({ theme }) => theme.radii.lg};
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 36px;
    height: 36px;
    color: #fff;
  }
`;

export const LoginTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: ${({ theme }) => theme.space[2]};
`;

export const LoginSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.space[8]};
`;

// === Alert ===
interface AlertProps {
  $variant?: 'success' | 'error' | 'info' | 'warning';
}

const alertVariants = {
  success: css`
    background: ${({ theme }) => theme.colors.success.muted};
    border-color: ${({ theme }) => theme.colors.success.primary}40;
    color: ${({ theme }) => theme.colors.success.primary};
  `,
  error: css`
    background: ${({ theme }) => theme.colors.error.muted};
    border-color: ${({ theme }) => theme.colors.error.primary}40;
    color: ${({ theme }) => theme.colors.error.primary};
  `,
  info: css`
    background: ${({ theme }) => theme.colors.info.muted};
    border-color: ${({ theme }) => theme.colors.info.primary}40;
    color: ${({ theme }) => theme.colors.info.primary};
  `,
  warning: css`
    background: ${({ theme }) => theme.colors.accent.muted};
    border-color: ${({ theme }) => theme.colors.accent.primary}40;
    color: ${({ theme }) => theme.colors.accent.primary};
  `,
};

export const Alert = styled.div<AlertProps>`
  padding: ${({ theme }) => theme.space[4]};
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid;
  font-size: 0.875rem;
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.space[3]};
  ${({ $variant = 'info' }) => alertVariants[$variant]}

  svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    margin-top: 1px;
  }
`;

// === Divider ===
export const Divider = styled.hr`
  border: none;
  height: 1px;
  background: ${({ theme }) => theme.colors.border.primary};
  margin: ${({ theme }) => theme.space[6]} 0;
`;

// === Text ===
export const Text = styled.p<{
  $size?: 'xs' | 'sm' | 'md' | 'lg';
  $color?: 'primary' | 'secondary' | 'muted' | 'accent';
  $weight?: 400 | 500 | 600 | 700;
  $mono?: boolean;
}>`
  font-size: ${({ $size = 'md' }) => {
    switch ($size) {
      case 'xs':
        return '0.75rem';
      case 'sm':
        return '0.875rem';
      case 'md':
        return '1rem';
      case 'lg':
        return '1.125rem';
    }
  }};
  color: ${({ $color = 'primary', theme }) => {
    switch ($color) {
      case 'primary':
        return theme.colors.text.primary;
      case 'secondary':
        return theme.colors.text.secondary;
      case 'muted':
        return theme.colors.text.muted;
      case 'accent':
        return theme.colors.accent.primary;
    }
  }};
  font-weight: ${({ $weight = 400 }) => $weight};
  font-family: ${({ $mono, theme }) => ($mono ? theme.fonts.mono : 'inherit')};
`;

// === Section ===
export const Section = styled.section`
  margin-bottom: ${({ theme }) => theme.space[8]};
`;

export const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: ${({ theme }) => theme.space[6]};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space[3]};

  svg {
    width: 28px;
    height: 28px;
    color: ${({ theme }) => theme.colors.accent.primary};
  }
`;

// === Tabs ===
export const TabList = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.space[1]};
  background: ${({ theme }) => theme.colors.bg.tertiary};
  padding: ${({ theme }) => theme.space[1]};
  border-radius: ${({ theme }) => theme.radii.md};
  margin-bottom: ${({ theme }) => theme.space[6]};
`;

export const TabButton = styled.button<{ $active?: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.space[2]};
  padding: ${({ theme }) => theme.space[3]} ${({ theme }) => theme.space[4]};
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ $active, theme }) =>
    $active ? theme.colors.text.primary : theme.colors.text.secondary};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.bg.elevated : 'transparent'};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  box-shadow: ${({ $active, theme }) => ($active ? theme.shadows.sm : 'none')};

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
    background: ${({ $active, theme }) =>
      $active ? theme.colors.bg.elevated : theme.colors.bg.hover};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

// === Contract Item ===
export const ContractItem = styled.div`
  padding: ${({ theme }) => theme.space[4]};
  background: ${({ theme }) => theme.colors.bg.tertiary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.radii.md};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    border-color: ${({ theme }) => theme.colors.border.hover};
  }
`;

export const ContractHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.space[3]};
`;

export const ContractId = styled.div`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.accent.primary};
`;

export const ContractTemplate = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.muted};
`;

