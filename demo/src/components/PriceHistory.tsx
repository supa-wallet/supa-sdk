import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSupa } from '@supanovaapp/sdk';
import type { CantonPriceInterval, CantonPriceCandleDto } from '@supanovaapp/sdk';
import { Card, CardContent, Button, Text } from '../ui';

const ChartContainer = styled.div`
  margin-top: 16px;
  padding: 16px;
  background: ${({ theme }) => theme.colors.cardBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  min-height: 300px;
  display: flex;
  flex-direction: column;
`;

const Controls = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const IntervalButton = styled(Button)<{ $active: boolean }>`
  opacity: ${({ $active }) => $active ? 1 : 0.8};
`;

const PriceStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StatLabel = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
`;

const StatValue = styled.span`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const CandlesContainer = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 200px;
  overflow-x: auto;
  padding: 8px 0;
`;

const CandleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 30px;
  flex: 1;
  position: relative;
`;

const Candle = styled.div<{ height: number; isPositive: boolean }>`
  width: 100%;
  height: ${({ height }) => height}%;
  background: ${({ isPositive, theme }) => 
    isPositive ? theme.colors.success : theme.colors.error};
  border-radius: 2px;
  position: relative;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;

const CandleTooltip = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: ${({ theme }) => theme.colors.cardBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 8px;
  border-radius: 4px;
  white-space: nowrap;
  font-size: 11px;
  z-index: 10;
  pointer-events: none;
  display: none;

  ${CandleWrapper}:hover & {
    display: block;
  }
`;

const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const intervals: { value: CantonPriceInterval; label: string }[] = [
  { value: '1h', label: '1 hour' },
  { value: '1d', label: '1 day' },
  { value: '1w', label: '1 week' },
  { value: '1M', label: '1 month' },
];

export function PriceHistory() {
  const { canton } = useSupa();
  const [candles, setCandles] = useState<CantonPriceCandleDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [interval, setInterval] = useState<CantonPriceInterval>('1d');

  const loadPriceHistory = async (selectedInterval: CantonPriceInterval) => {
    setLoading(true);
    try {
      const data = await canton.getPriceHistory(selectedInterval);
      setCandles(data);
    } catch (err) {
      console.error('Failed to load price history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canton.isRegistered) {
      loadPriceHistory(interval);
    }
  }, [canton.isRegistered, interval]);

  const handleIntervalChange = (newInterval: CantonPriceInterval) => {
    setInterval(newInterval);
  };

  const stats = candles.length > 0 ? {
    latest: parseFloat(candles[candles.length - 1]?.close || '0'),
    high: Math.max(...candles.map(c => parseFloat(c.max))),
    low: Math.min(...candles.map(c => parseFloat(c.min))),
    open: parseFloat(candles[0]?.open || '0'),
  } : null;

  const priceChange = stats ? ((stats.latest - stats.open) / stats.open * 100) : 0;

  const maxPrice = stats ? stats.high : 1;
  const minPrice = stats ? stats.low : 0;
  const priceRange = maxPrice - minPrice || 1;

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleString('en-US', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!canton.isRegistered) {
    return null;
  }

  return (
    <Card>
      <CardContent>
        <Text $size="lg" $weight={600}>Canton Coin Price History</Text>

      <Controls>
        {intervals.map((int) => (
          <IntervalButton
            key={int.value}
            $active={interval === int.value}
            onClick={() => handleIntervalChange(int.value)}
            disabled={loading}
            $size="sm"
            $variant={interval === int.value ? 'primary' : 'secondary'}
          >
            {int.label}
          </IntervalButton>
        ))}
        <Button
          onClick={() => loadPriceHistory(interval)}
          disabled={loading}
          $size="sm"
          $variant="secondary"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </Controls>

      {stats && (
        <PriceStats>
          <StatItem>
            <StatLabel>Current</StatLabel>
            <StatValue>${stats.latest.toFixed(4)}</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>Change</StatLabel>
            <StatValue style={{ color: priceChange >= 0 ? 'var(--success)' : 'var(--error)' }}>
              {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
            </StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>High</StatLabel>
            <StatValue>${stats.high.toFixed(4)}</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>Low</StatLabel>
            <StatValue>${stats.low.toFixed(4)}</StatValue>
          </StatItem>
        </PriceStats>
      )}

      <ChartContainer>
        {loading && candles.length === 0 ? (
          <EmptyState>Loading data...</EmptyState>
        ) : candles.length === 0 ? (
          <EmptyState>No data to display</EmptyState>
        ) : (
          <CandlesContainer>
            {candles.map((candle, index) => {
              const open = parseFloat(candle.open);
              const close = parseFloat(candle.close);
              const high = parseFloat(candle.max);
              const low = parseFloat(candle.min);
              const isPositive = close >= open;
              
              const bodyHeight = Math.abs(close - open) / priceRange * 100;
              const bottomOffset = (Math.min(open, close) - minPrice) / priceRange * 100;

              return (
                <CandleWrapper key={index}>
                  <Candle
                    height={bodyHeight || 2}
                    isPositive={isPositive}
                    style={{ bottom: `${bottomOffset}%` }}
                  >
                    <CandleTooltip>
                      <div><strong>{formatDate(candle.start)}</strong></div>
                      <div>Open: ${open.toFixed(4)}</div>
                      <div>Close: ${close.toFixed(4)}</div>
                      <div>High: ${high.toFixed(4)}</div>
                      <div>Low: ${low.toFixed(4)}</div>
                    </CandleTooltip>
                  </Candle>
                </CandleWrapper>
              );
            })}
          </CandlesContainer>
        )}
      </ChartContainer>
      </CardContent>
    </Card>
  );
}
