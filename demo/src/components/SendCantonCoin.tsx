import { useState } from 'react';
import { Send, AlertCircle, DollarSign } from 'lucide-react';
import styled from 'styled-components';
import { useSupa, CantonCostEstimationDto } from '@supanovaapp/sdk';
import {
  useToast,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Flex,
  Text,
  Button,
  Input,
  InputLabel,
  Alert,
  Section,
} from '../ui';

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[2]};
  margin-bottom: ${({ theme }) => theme.space[4]};
`;

const HelpText = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const CostEstimationBox = styled.div`
  background: ${({ theme }) => theme.colors.bg?.hover};
  border: 1px solid ${({ theme }) => theme.colors.border?.primary};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.space[3]};
  margin-bottom: ${({ theme }) => theme.space[4]};
`;

const CostRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.space[1]} 0;
  font-size: 0.875rem;
  
  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
  }
`;

const CostLabel = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const CostValue = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 500;
`;

export function SendCantonCoin() {
  const { canton } = useSupa();
  const { toast } = useToast();
  const [receiverPartyId, setReceiverPartyId] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [costEstimation, setCostEstimation] = useState<CantonCostEstimationDto | null>(null);

  const validateAmount = (value: string): boolean => {
    if (!value || parseFloat(value) <= 0) {
      setError('Amount must be greater than 0');
      return false;
    }

    const decimalParts = value.split('.');
    if (decimalParts.length > 1 && decimalParts[1].length > 10) {
      setError('Amount cannot have more than 10 decimal places');
      return false;
    }

    return true;
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    setError(null);
  };

  const handleSend = async () => {
    setError(null);
    setCostEstimation(null);

    if (!receiverPartyId.trim()) {
      setError('Please enter receiver Party ID');
      return;
    }

    if (!validateAmount(amount)) {
      return;
    }

    setLoading(true);
    try {
      await canton.sendCantonCoin(
        receiverPartyId.trim(),
        amount,
        memo.trim() || undefined,
        {
          onCostEstimation: (cost: CantonCostEstimationDto) => {
            if (cost) {
              setCostEstimation(cost);
              console.log('💰 Cost estimation:', cost);
            }
          }
        }
      );
      
      toast.success(`Successfully sent ${amount} Canton Coin! 🎉`);
      
      // Reset form
      setReceiverPartyId('');
      setAmount('');
      setMemo('');
      setCostEstimation(null);
    } catch (err: any) {
      console.error('Send Canton Coin error:', err);
      const errorMessage = err?.message || 'Failed to send Canton Coin';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Only show if fully registered (with preapproval)
  if (!canton.isRegistered) {
    return null;
  }

  return (
    <Section>
      <Card>
        <CardHeader>
          <CardTitle>
            <Send /> Send Canton Coin
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormGroup>
            <InputLabel htmlFor="receiver">Receiver Party ID</InputLabel>
            <Input
              id="receiver"
              type="text"
              placeholder="receiver-party::1220abc123..."
              value={receiverPartyId}
              onChange={(e) => setReceiverPartyId(e.target.value)}
              disabled={loading}
            />
            <HelpText>Canton party ID of the receiver wallet</HelpText>
          </FormGroup>

          <FormGroup>
            <InputLabel htmlFor="amount">Amount</InputLabel>
            <Input
              id="amount"
              type="number"
              step="0.0000000001"
              min="0"
              placeholder="100.5"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              disabled={loading}
            />
            <HelpText>Maximum 10 decimal places allowed</HelpText>
          </FormGroup>

          <FormGroup>
            <InputLabel htmlFor="memo">Memo (optional)</InputLabel>
            <Input
              id="memo"
              type="text"
              placeholder="Payment for services"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              disabled={loading}
            />
            <HelpText>Optional note for the transfer</HelpText>
          </FormGroup>

          {costEstimation && (
            <CostEstimationBox>
              <Flex style={{ alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <DollarSign size={16} />
                <Text style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  Transaction Cost Estimation
                </Text>
              </Flex>
              <CostRow>
                <CostLabel>Request Traffic Cost:</CostLabel>
                <CostValue>{costEstimation.confirmationRequestTrafficCostEstimation.toLocaleString()} μunits</CostValue>
              </CostRow>
              <CostRow>
                <CostLabel>Response Traffic Cost:</CostLabel>
                <CostValue>{costEstimation.confirmationResponseTrafficCostEstimation.toLocaleString()} μunits</CostValue>
              </CostRow>
              <CostRow>
                <CostLabel>Total Cost:</CostLabel>
                <CostValue>{costEstimation.totalTrafficCostEstimation.toLocaleString()} μunits</CostValue>
              </CostRow>
              <HelpText style={{ display: 'block', marginTop: '8px' }}>
                Estimated at: {new Date(costEstimation.estimationTimestamp).toLocaleString()}
              </HelpText>
            </CostEstimationBox>
          )}

          {error && (
            <Alert $variant="error" style={{ marginBottom: 16 }}>
              <AlertCircle />
              {error}
            </Alert>
          )}

          <Button
            $variant="primary"
            onClick={handleSend}
            disabled={loading || !receiverPartyId.trim() || !amount}
            style={{ width: '100%' }}
          >
            {loading ? 'Sending...' : 'Send Canton Coin'}
          </Button>

          <Text $color="secondary" style={{ fontSize: '0.75rem', marginTop: '1rem' }}>
            Note: Transfers are only supported to wallets with preapproved transfers enabled.
          </Text>
        </CardContent>
      </Card>
    </Section>
  );
}

