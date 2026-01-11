import { Disclosure as HeadlessDisclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import styled from 'styled-components';
import { ChevronDown } from 'lucide-react';
import { theme } from './theme';
import type { ReactNode } from 'react';

const DisclosureWrapper = styled.div`
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.radii.md};
  overflow: hidden;
`;

const StyledButton = styled(DisclosureButton)`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.space[3]} ${theme.space[4]};
  background: ${theme.colors.bg.tertiary};
  border: none;
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${theme.colors.text.secondary};
  cursor: pointer;
  transition: all ${theme.transitions.fast};

  &:hover {
    background: ${theme.colors.bg.hover};
    color: ${theme.colors.text.primary};
  }
`;

const ChevronIcon = styled(ChevronDown)<{ $open: boolean }>`
  width: 16px;
  height: 16px;
  transition: transform ${theme.transitions.fast};
  transform: ${({ $open }) => ($open ? 'rotate(180deg)' : 'rotate(0)')};
`;

const PanelContent = styled(DisclosurePanel)`
  padding: ${theme.space[4]};
  background: ${theme.colors.bg.primary};
  border-top: 1px solid ${theme.colors.border.primary};
`;

interface DisclosureProps {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function Disclosure({ title, children, defaultOpen = false }: DisclosureProps) {
  return (
    <DisclosureWrapper>
      <HeadlessDisclosure defaultOpen={defaultOpen}>
        {({ open }) => (
          <>
            <StyledButton>
              <span>{title}</span>
              <ChevronIcon $open={open} />
            </StyledButton>
            <PanelContent>{children}</PanelContent>
          </>
        )}
      </HeadlessDisclosure>
    </DisclosureWrapper>
  );
}





