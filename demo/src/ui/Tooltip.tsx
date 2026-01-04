import { useState, type ReactNode } from 'react';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
  type Placement,
} from '@floating-ui/react';
import styled, { keyframes } from 'styled-components';
import { theme } from './theme';

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`;

const TooltipContent = styled.div`
  background: ${theme.colors.bg.elevated};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.radii.md};
  padding: ${theme.space[2]} ${theme.space[3]};
  font-size: 0.8125rem;
  color: ${theme.colors.text.primary};
  max-width: 240px;
  box-shadow: ${theme.shadows.md};
  z-index: 1000;
  animation: ${fadeIn} 150ms ease-out;
`;

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  placement?: Placement;
}

export function Tooltip({ content, children, placement = 'top' }: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement,
    whileElementsMounted: autoUpdate,
    middleware: [offset(8), flip(), shift({ padding: 8 })],
  });

  const hover = useHover(context, { move: false });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'tooltip' });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role,
  ]);

  return (
    <>
      <span ref={refs.setReference} {...getReferenceProps()}>
        {children}
      </span>
      {isOpen && (
        <FloatingPortal>
          <TooltipContent
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
          >
            {content}
          </TooltipContent>
        </FloatingPortal>
      )}
    </>
  );
}



