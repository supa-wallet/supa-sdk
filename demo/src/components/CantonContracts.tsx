import { useCanton } from '@supa/sdk';
import { useState, useEffect } from 'react';
import type { CantonActiveContractsResponseDto, CantonActiveContractItem, CantonAmuletCreateArgument } from '@supa/sdk';
import { FileText, Search, X, RefreshCw, Coins, Clock, User } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  InputGroup,
  InputLabel,
  Flex,
  Text,
  Spinner,
  Alert,
  EmptyState,
  EmptyStateTitle,
  EmptyStateDescription,
  ContractItem,
  ContractHeader,
  ContractId,
  ContractTemplate,
  CodeBlock,
  Badge,
} from '../ui';
import { Disclosure } from '../ui/Disclosure';
import styled from 'styled-components';
import { theme } from '../ui/theme';

const ContractsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.space[3]};
  max-height: 500px;
  overflow-y: auto;
  margin-top: ${theme.space[4]};
`;

const ContractIndex = styled.span`
  font-size: 0.75rem;
  color: ${theme.colors.text.muted};
  background: ${theme.colors.bg.primary};
  padding: 2px 8px;
  border-radius: ${theme.radii.full};
`;

const ContractDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.space[3]};
  margin-top: ${theme.space[3]};
  padding: ${theme.space[3]};
  background: ${theme.colors.bg.primary};
  border-radius: ${theme.radii.md};
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.space[1]};
`;

const DetailLabel = styled.span`
  font-size: 0.75rem;
  color: ${theme.colors.text.muted};
  display: flex;
  align-items: center;
  gap: ${theme.space[1]};

  svg {
    width: 14px;
    height: 14px;
  }
`;

const DetailValue = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${theme.colors.text.primary};
  font-family: ${theme.fonts.mono};
  word-break: break-all;
`;

const AmountValue = styled.span`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${theme.colors.accent.primary};
`;

/** Helper functions for working with contracts */

/** Get template name from templateId */
function getTemplateName(templateId: string): string {
  const parts = templateId.split(':');
  return parts.length >= 3 ? parts.slice(1).join(':') : templateId;
}

/** Truncate ID for display */
function truncateId(id: string, start = 8, end = 8): string {
  if (id.length <= start + end + 3) return id;
  return `${id.slice(0, start)}...${id.slice(-end)}`;
}

/** Format date */
function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleString();
}

/** Check if contract is an Amulet */
function isAmuletContract(item: CantonActiveContractItem): boolean {
  return item.contractEntry.JsActiveContract.createdEvent.templateId.includes('Splice.Amulet:Amulet');
}

/** Get Amulet contract data */
function getAmuletData(item: CantonActiveContractItem): CantonAmuletCreateArgument | null {
  const createdEvent = item.contractEntry.JsActiveContract.createdEvent;
  if (isAmuletContract(item)) {
    return createdEvent.createArgument as CantonAmuletCreateArgument;
  }
  return null;
}

export function CantonContracts() {
  const { getActiveContracts, error } = useCanton();
  const [contracts, setContracts] = useState<CantonActiveContractsResponseDto | null>(null);
  const [templateFilter, setTemplateFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadContracts = async (templateIds?: string[]) => {
    setIsLoading(true);
    try {
      const result = await getActiveContracts(templateIds);
      console.log('Active contracts response:', result);
      setContracts(result);
    } catch (err) {
      console.error('Failed to load contracts:', err);
      setContracts(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadContracts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyFilter = () => {
    const filters = templateFilter
      .split(',')
      .map(f => f.trim())
      .filter(f => f.length > 0);
    loadContracts(filters.length > 0 ? filters : undefined);
  };

  const handleClearFilter = () => {
    setTemplateFilter('');
    loadContracts();
  };

  // API returns array directly
  const contractsList = contracts ?? [];

  // Calculate total amount for Amulet contracts
  const totalAmuletAmount = contractsList.reduce((sum, item) => {
    const amuletData = getAmuletData(item);
    if (amuletData) {
      return sum + parseFloat(amuletData.amount.initialAmount);
    }
    return sum;
  }, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <FileText /> Active Contracts
        </CardTitle>
        <Button
          $variant="ghost"
          $size="sm"
          onClick={() => loadContracts()}
          disabled={isLoading}
        >
          <RefreshCw style={{ width: 16, height: 16 }} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <InputGroup>
          <InputLabel>Filter by Template IDs</InputLabel>
          <Flex $gap={2}>
            <Input
              value={templateFilter}
              onChange={(e) => setTemplateFilter(e.target.value)}
              placeholder="template1, template2, ..."
              $mono
              style={{ flex: 1 }}
            />
            <Button
              $variant="secondary"
              onClick={handleApplyFilter}
              disabled={isLoading}
            >
              <Search style={{ width: 16, height: 16 }} />
              Apply
            </Button>
            {templateFilter && (
              <Button
                $variant="ghost"
                onClick={handleClearFilter}
                disabled={isLoading}
              >
                <X style={{ width: 16, height: 16 }} />
              </Button>
            )}
          </Flex>
        </InputGroup>

        {error && (
          <Alert $variant="error" style={{ marginTop: 16 }}>
            {error.message}
          </Alert>
        )}

        {isLoading ? (
          <Flex $align="center" $justify="center" $gap={3} style={{ padding: '48px' }}>
            <Spinner />
            <Text $color="secondary">Loading contracts...</Text>
          </Flex>
        ) : contracts ? (
          <>
            <Flex $justify="space-between" $align="center" $wrap style={{ marginTop: 16, gap: 12 }}>
              <Text $color="secondary" $size="sm">
                Total: <Text as="span" $weight={600}>{contractsList.length}</Text> contracts
              </Text>
              {totalAmuletAmount > 0 && (
                <Badge $variant="success">
                  <Coins style={{ width: 14, height: 14 }} />
                  Total Amulet: {totalAmuletAmount.toFixed(10)}
                </Badge>
              )}
            </Flex>

            {contractsList.length === 0 ? (
              <EmptyState>
                <FileText />
                <EmptyStateTitle>No contracts found</EmptyStateTitle>
                <EmptyStateDescription>
                  There are no active contracts matching your criteria.
                </EmptyStateDescription>
              </EmptyState>
            ) : (
              <ContractsList>
                {contractsList.map((item, idx) => {
                  const contract = item.contractEntry.JsActiveContract;
                  const createdEvent = contract.createdEvent;
                  const amuletData = getAmuletData(item);
                  const isAmulet = isAmuletContract(item);

                  return (
                    <ContractItem key={createdEvent.contractId}>
                      <ContractHeader>
                        <Flex $align="center" $gap={2}>
                          <ContractId>{truncateId(createdEvent.contractId, 12, 12)}</ContractId>
                          {isAmulet && (
                            <Badge $variant="warning">
                              <Coins style={{ width: 12, height: 12 }} />
                              Amulet
                            </Badge>
                          )}
                        </Flex>
                        <ContractIndex>#{idx + 1}</ContractIndex>
                      </ContractHeader>
                      
                      <ContractTemplate>
                        Template: {getTemplateName(createdEvent.templateId)}
                      </ContractTemplate>

                      {/* Display Amulet contract data */}
                      {amuletData && (
                        <ContractDetails>
                          <DetailItem>
                            <DetailLabel>
                              <Coins /> Initial Amount
                            </DetailLabel>
                            <AmountValue>{amuletData.amount.initialAmount}</AmountValue>
                          </DetailItem>
                          <DetailItem>
                            <DetailLabel>
                              <User /> Owner
                            </DetailLabel>
                            <DetailValue>{truncateId(amuletData.owner, 16, 8)}</DetailValue>
                          </DetailItem>
                          <DetailItem>
                            <DetailLabel>
                              <Clock /> Created At
                            </DetailLabel>
                            <DetailValue>{formatDate(createdEvent.createdAt)}</DetailValue>
                          </DetailItem>
                          <DetailItem>
                            <DetailLabel>Rate per Round</DetailLabel>
                            <DetailValue>{amuletData.amount.ratePerRound.rate}</DetailValue>
                          </DetailItem>
                        </ContractDetails>
                      )}

                      <div style={{ marginTop: 12 }}>
                        <Disclosure title="View Full Contract Data">
                          <CodeBlock>
                            <code>{JSON.stringify(item, null, 2)}</code>
                          </CodeBlock>
                        </Disclosure>
                      </div>
                    </ContractItem>
                  );
                })}
              </ContractsList>
            )}
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
