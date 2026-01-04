import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

// === Types ===
type ToastVariant = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  toast: {
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
  };
}

// === Animations ===
const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const progressShrink = keyframes`
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
`;

// === Styled Components ===
const ToastContainer = styled.div`
  position: fixed;
  top: ${({ theme }) => theme.space[6]};
  right: ${({ theme }) => theme.space[6]};
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[3]};
  pointer-events: none;

  @media (max-width: 480px) {
    top: ${({ theme }) => theme.space[4]};
    right: ${({ theme }) => theme.space[4]};
    left: ${({ theme }) => theme.space[4]};
  }
`;

const variantStyles = {
  success: css`
    background: linear-gradient(
      135deg,
      ${({ theme }) => theme.colors.success.muted} 0%,
      ${({ theme }) => theme.colors.bg.elevated} 100%
    );
    border-color: ${({ theme }) => theme.colors.success.primary}50;
    --toast-accent: ${({ theme }) => theme.colors.success.primary};
  `,
  error: css`
    background: linear-gradient(
      135deg,
      ${({ theme }) => theme.colors.error.muted} 0%,
      ${({ theme }) => theme.colors.bg.elevated} 100%
    );
    border-color: ${({ theme }) => theme.colors.error.primary}50;
    --toast-accent: ${({ theme }) => theme.colors.error.primary};
  `,
  info: css`
    background: linear-gradient(
      135deg,
      ${({ theme }) => theme.colors.info.muted} 0%,
      ${({ theme }) => theme.colors.bg.elevated} 100%
    );
    border-color: ${({ theme }) => theme.colors.info.primary}50;
    --toast-accent: ${({ theme }) => theme.colors.info.primary};
  `,
  warning: css`
    background: linear-gradient(
      135deg,
      ${({ theme }) => theme.colors.accent.muted} 0%,
      ${({ theme }) => theme.colors.bg.elevated} 100%
    );
    border-color: ${({ theme }) => theme.colors.accent.primary}50;
    --toast-accent: ${({ theme }) => theme.colors.accent.primary};
  `,
};

const ToastItem = styled.div<{ $variant: ToastVariant; $exiting?: boolean; $duration: number }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space[3]};
  padding: ${({ theme }) => theme.space[4]};
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  pointer-events: auto;
  min-width: 300px;
  max-width: 420px;
  position: relative;
  overflow: hidden;
  animation: ${({ $exiting }) => ($exiting ? slideOut : slideIn)} 
    ${({ theme }) => theme.transitions.normal} forwards;
  
  ${({ $variant }) => variantStyles[$variant]}

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--toast-accent);
    transform-origin: left;
    animation: ${progressShrink} ${({ $duration }) => $duration}ms linear forwards;
  }

  @media (max-width: 480px) {
    min-width: auto;
    max-width: none;
    width: 100%;
  }
`;

const ToastIcon = styled.div<{ $variant: ToastVariant }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--toast-accent);

  svg {
    width: 22px;
    height: 22px;
  }
`;

const ToastContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ToastMessage = styled.p`
  font-size: 0.9375rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  line-height: 1.4;
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.text.muted};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  flex-shrink: 0;

  &:hover {
    background: ${({ theme }) => theme.colors.bg.hover};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

// === Icons ===
const icons: Record<ToastVariant, typeof CheckCircle> = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

// === Context ===
const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// === Provider ===
interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<(Toast & { exiting?: boolean })[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 250);
  }, []);

  const addToast = useCallback(
    (message: string, variant: ToastVariant, duration = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      setToasts((prev) => [...prev, { id, message, variant, duration }]);

      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast]
  );

  const toast = {
    success: (message: string, duration?: number) => addToast(message, 'success', duration),
    error: (message: string, duration?: number) => addToast(message, 'error', duration),
    info: (message: string, duration?: number) => addToast(message, 'info', duration),
    warning: (message: string, duration?: number) => addToast(message, 'warning', duration),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastContainer>
        {toasts.map((t) => {
          const Icon = icons[t.variant];
          return (
            <ToastItem
              key={t.id}
              $variant={t.variant}
              $exiting={t.exiting}
              $duration={t.duration ?? 4000}
            >
              <ToastIcon $variant={t.variant}>
                <Icon />
              </ToastIcon>
              <ToastContent>
                <ToastMessage>{t.message}</ToastMessage>
              </ToastContent>
              <CloseButton onClick={() => removeToast(t.id)} aria-label="Close">
                <X />
              </CloseButton>
            </ToastItem>
          );
        })}
      </ToastContainer>
    </ToastContext.Provider>
  );
}



