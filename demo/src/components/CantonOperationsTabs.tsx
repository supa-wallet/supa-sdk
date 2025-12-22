import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { User, FileText, PenTool, Send } from 'lucide-react';
import styled from 'styled-components';
import { Section, SectionTitle } from '../ui';
import { CantonContracts } from './CantonContracts';
import { CantonUserInfo } from './CantonUserInfo';
import { SignMessage } from './SignMessage';
import { SendTransaction } from './SendTransaction';

const StyledTabList = styled(TabList)`
  display: flex;
  gap: ${({ theme }) => theme.space[1]};
  background: ${({ theme }) => theme.colors.bg.tertiary};
  padding: ${({ theme }) => theme.space[1]};
  border-radius: ${({ theme }) => theme.radii.md};
  margin-bottom: ${({ theme }) => theme.space[6]};
`;

const StyledTab = styled(Tab)`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.space[2]};
  padding: ${({ theme }) => theme.space[3]} ${({ theme }) => theme.space[4]};
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.secondary};
  background: transparent;
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
    background: ${({ theme }) => theme.colors.bg.hover};
  }

  &[data-selected] {
    color: ${({ theme }) => theme.colors.text.primary};
    background: ${({ theme }) => theme.colors.bg.elevated};
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

interface CantonOperationsTabsProps {
  showTechnicalDetails: boolean;
}

export function CantonOperationsTabs({ showTechnicalDetails }: CantonOperationsTabsProps) {
  return (
    <Section>
      <SectionTitle>
        <FileText /> Canton Operations
      </SectionTitle>

      <TabGroup>
        <StyledTabList>
          <StyledTab>
            <User /> Account
          </StyledTab>
          <StyledTab>
            <FileText /> Contracts
          </StyledTab>
          <StyledTab>
            <PenTool /> Sign
          </StyledTab>
          <StyledTab>
            <Send /> Transact
          </StyledTab>
        </StyledTabList>

        <TabPanels>
          <TabPanel>
            <CantonUserInfo />
          </TabPanel>
          <TabPanel>
            <CantonContracts />
          </TabPanel>
          <TabPanel>
            <SignMessage showTechnicalDetails={showTechnicalDetails} />
          </TabPanel>
          <TabPanel>
            <SendTransaction showTechnicalDetails={showTechnicalDetails} />
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </Section>
  );
}

