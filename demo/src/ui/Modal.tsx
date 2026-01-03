import { Fragment, type ReactNode } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import styled from 'styled-components';
import { X } from 'lucide-react';
import { theme } from './theme';
import { IconButton } from './styled';

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
`;

const PanelWrapper = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
  overflow-y: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.space[4]};
`;

const StyledPanel = styled(DialogPanel)`
  background: ${theme.colors.bg.secondary};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.radii.xl};
  max-width: 560px;
  width: 100%;
  max-height: 85vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: ${theme.shadows.lg};
`;

const ModalHeader = styled.div`
  padding: ${theme.space[5]} ${theme.space[6]};
  border-bottom: 1px solid ${theme.colors.border.primary};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StyledTitle = styled(DialogTitle)`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: ${theme.space[3]};

  svg {
    width: 22px;
    height: 22px;
    color: ${theme.colors.accent.primary};
  }
`;

const ModalBody = styled.div`
  padding: ${theme.space[6]};
  overflow-y: auto;
  flex: 1;
`;

const ModalFooter = styled.div`
  padding: ${theme.space[4]} ${theme.space[6]};
  border-top: 1px solid ${theme.colors.border.primary};
  display: flex;
  gap: ${theme.space[3]};
  justify-content: flex-end;
  background: ${theme.colors.bg.tertiary};
`;

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} style={{ position: 'relative', zIndex: 100 }}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Backdrop />
        </TransitionChild>

        <PanelWrapper>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <StyledPanel>
              <ModalHeader>
                <StyledTitle>{title}</StyledTitle>
                <IconButton onClick={onClose} $variant="ghost">
                  <X />
                </IconButton>
              </ModalHeader>
              <ModalBody>{children}</ModalBody>
              {footer && <ModalFooter>{footer}</ModalFooter>}
            </StyledPanel>
          </TransitionChild>
        </PanelWrapper>
      </Dialog>
    </Transition>
  );
}


