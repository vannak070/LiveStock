import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApiDataMulti } from '../hooks/useApiData';
import { BatchItem, StockItem, WeightRecord } from '../api/types';
import { ScreenScroll, BackRow, ScreenTitle, SectionHeader, Card, Pill, LoadingView, ErrorView, EmptyRow } from '../components/ui';
import FarmPicker from '../components/FarmPicker';
import { useFarmFilter } from '../context/FarmFilterContext';
import { applyFarmScope } from '../lib/farmScope';
import { colors, spacing } from '../theme/colors';
import { formatMoney, formatDate, daysBetween } from '../lib/format';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// Same defaults AnalyticsTab.tsx's batch analytics use when a batch has no
// weight history / no feeding program configured — kept identical so the
// numbers here always match the desktop system.
const DEFAULT_ADG_KG_PER_DAY = 0.85;
const DEFAULT_DAILY_FEED_COST_PER_HEAD = 3.5 * 2000 + 15 * 350 + 2 * 150; // ≈ 12,550 ៛
const PROJECTION_DAYS = 30;

type BatchMetrics = {
  avgWeight: number | null;
  adgKgPerDay: number;
  dailyFeedCostPerHead: number;
  pricePerKg: number | null;
  projectionDays: number;
  targetDate: string | null; // set only when it comes from the batch's own Selling Target Date
  projectedWeight: number | null;
  projectedValuePerHead: number | null;
};

export default function BatchesScreen() {
  const navigation = useNavigation<Nav>();
  const { effectiveFarm } = useFarmFilter();
  const { data, loading, error, refresh } = useApiDataMulti({ batches: '/batches', stock: '/stock', weight: '/weight' });

  const { batches, stock, weightTracking } = applyFarmScope(
    {
      batches: (data?.batches as BatchItem[]) || [],
      stock: (data?.stock as StockItem[]) || [],
      weightTracking: (data?.weight as WeightRecord[]) || []
    },
    effectiveFarm
  );

  // Highest target price/kg set on any batch — same fallback AnalyticsTab.tsx
  // uses (`defaultSellingPrice`) when a batch itself has none set.
  const fleetDefaultPricePerKg = useMemo(() => {
    const prices = batches.map(b => Number(b.expectedSellingPrice)).filter(p => !isNaN(p) && p > 0);
    return prices.length > 0 ? Math.max(...prices) : null;
  }, [batches]);

  const metricsFor = (b: BatchItem): BatchMetrics => {
    const cowsInBatch = stock.filter(s => b.cowIds?.includes(s.id));
    const activeCowsInBatch = cowsInBatch.filter(c => c.status?.toLowerCase() === 'active');

    const avgWeight = activeCowsInBatch.length > 0
      ? Math.round(activeCowsInBatch.reduce((sum, c) => sum + (c.weight || 0), 0) / activeCowsInBatch.length)
      : null;

    // ADG from each cow's earliest → latest weight-tracking record, averaged
    // across the batch — identical approach to AnalyticsTab.tsx's batchAnalytics.
    let totalAdgSum = 0;
    let adgCount = 0;
    activeCowsInBatch.forEach(cow => {
      const records = weightTracking
        .filter(w => w.cowId === cow.id && w.trackingDate)
        .sort((a, c) => new Date(a.trackingDate!).getTime() - new Date(c.trackingDate!).getTime());
      if (records.length >= 2) {
        const earliest = records[0];
        const latest = records[records.length - 1];
        const daysDiff = Math.max(1, Math.round((new Date(latest.trackingDate!).getTime() - new Date(earliest.trackingDate!).getTime()) / 86400000));
        const weightDiff = latest.currentWeight - earliest.currentWeight;
        if (daysDiff > 0 && weightDiff > 0) {
          totalAdgSum += weightDiff / daysDiff;
          adgCount++;
        }
      }
    });
    const adgKgPerDay = adgCount > 0 ? parseFloat((totalAdgSum / adgCount).toFixed(2)) : DEFAULT_ADG_KG_PER_DAY;

    const dailyFeedCostPerHead = b.feedingProgram?.ingredients?.length
      ? b.feedingProgram.ingredients.reduce((sum, ing) => sum + (ing.portionPerHead || 0) * (ing.unitCost || 0), 0)
      : DEFAULT_DAILY_FEED_COST_PER_HEAD;

    const pricePerKg = (b.expectedSellingPrice && b.expectedSellingPrice > 0) ? b.expectedSellingPrice : fleetDefaultPricePerKg;

    // Use the batch's own Selling Target Date when it's set and still ahead
    // of today — same "days to harvest" math AnalyticsTab.tsx's prediction
    // engine uses on the web. Falls back to the fixed 30-day window for
    // batches that don't have a target date set.
    let projectionDays = PROJECTION_DAYS;
    let targetDate: string | null = null;
    if (b.sellingTargetDate) {
      const daysOut = daysBetween(new Date().toISOString(), new Date(b.sellingTargetDate));
      // daysBetween(from, to) is "to - from" here (from = today, to = target)
      if (daysOut !== null && daysOut > 0) {
        projectionDays = daysOut;
        targetDate = b.sellingTargetDate;
      }
    }

    const projectedWeight = avgWeight !== null ? Math.round(avgWeight + adgKgPerDay * projectionDays) : null;
    const projectedValuePerHead = (projectedWeight !== null && pricePerKg !== null) ? Math.round(projectedWeight * pricePerKg) : null;

    return { avgWeight, adgKgPerDay, dailyFeedCostPerHead, pricePerKg, projectionDays, targetDate, projectedWeight, projectedValuePerHead };
  };

  if (loading) return <LoadingView label="Loading batches…" />;
  if (error) return <ErrorView message={error} onRetry={refresh} />;

  const active = batches.filter(b => b.status === 'Active');
  const closed = batches.filter(b => b.status !== 'Active');

  return (
    <ScreenScroll>
      <BackRow label="More" onPress={() => navigation.goBack()} />
      <ScreenTitle title="Fattening cycles" subtitle={`${effectiveFarm || 'All farms'} · ${active.length} active · ${closed.length} closed`} />

      <FarmPicker />

      <SectionHeader title="Active batches" />
      {active.length === 0 ? <EmptyRow label="No active batches." /> : active.map(b => {
        const days = daysBetween(b.startDate);
        const m = metricsFor(b);
        return (
          <Card key={b.id} style={{ marginBottom: spacing.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              <View>
                <Text style={{ fontSize: 15, fontWeight: '700' }}>{b.id}</Text>
                <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 3 }}>{b.farmLocation || 'Unassigned'} · {(b.cowIds || []).length} head</Text>
              </View>
              <Pill label={b.status} tone="green" />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 10.5, color: colors.muted }}>{days !== null ? `day ${days}` : 'start date unknown'}</Text>
              <Text style={{ fontSize: 10.5, color: colors.muted }}>{b.type}</Text>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, borderTopWidth: 1, borderTopColor: colors.borderFaint, paddingTop: 10 }}>
              <View style={{ width: '50%', marginBottom: 8 }}>
                <Text style={{ fontSize: 9.5, textTransform: 'uppercase', color: colors.muted, marginBottom: 3 }}>Avg weight</Text>
                <Text style={{ fontSize: 13.5, fontWeight: '600' }}>{m.avgWeight !== null ? `${m.avgWeight} kg` : '—'}</Text>
              </View>
              <View style={{ width: '50%', marginBottom: 8 }}>
                <Text style={{ fontSize: 9.5, textTransform: 'uppercase', color: colors.muted, marginBottom: 3 }}>ADG</Text>
                <Text style={{ fontSize: 13.5, fontWeight: '600' }}>{m.adgKgPerDay} kg/day</Text>
              </View>
              <View style={{ width: '50%' }}>
                <Text style={{ fontSize: 9.5, textTransform: 'uppercase', color: colors.muted, marginBottom: 3 }}>Feed cost/head/day</Text>
                <Text style={{ fontSize: 13.5, fontWeight: '600' }}>{formatMoney(m.dailyFeedCostPerHead)}</Text>
              </View>
              <View style={{ width: '50%' }}>
                <Text style={{ fontSize: 9.5, textTransform: 'uppercase', color: colors.muted, marginBottom: 3 }}>Target price</Text>
                <Text style={{ fontSize: 13.5, fontWeight: '600' }}>{m.pricePerKg !== null ? `${formatMoney(m.pricePerKg)}/kg` : '—'}</Text>
              </View>
              {b.sellingTargetDate && (
                <View style={{ width: '50%', marginTop: 8 }}>
                  <Text style={{ fontSize: 9.5, textTransform: 'uppercase', color: colors.muted, marginBottom: 3 }}>Selling target date</Text>
                  <Text style={{ fontSize: 13.5, fontWeight: '600' }}>{formatDate(b.sellingTargetDate)}</Text>
                </View>
              )}
            </View>

            {m.projectedWeight !== null && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, backgroundColor: colors.tintGreen, borderRadius: 10, padding: 10 }}>
                <View>
                  <Text style={{ fontSize: 9.5, textTransform: 'uppercase', color: colors.muted, marginBottom: 3 }}>
                    {m.targetDate ? `Projected by ${formatDate(m.targetDate)}` : `Projected in ${m.projectionDays}d`}
                  </Text>
                  <Text style={{ fontSize: 13, fontWeight: '700' }}>{m.projectedWeight} kg / head</Text>
                </View>
                {m.projectedValuePerHead !== null && (
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 9.5, textTransform: 'uppercase', color: colors.muted, marginBottom: 3 }}>Est. value / head</Text>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: colors.green }}>{formatMoney(m.projectedValuePerHead)}</Text>
                  </View>
                )}
              </View>
            )}
          </Card>
        );
      })}

      <View style={{ marginTop: spacing.lg }}>
        <SectionHeader title="Closed batches" accent={colors.red} />
      </View>
      {closed.length === 0 ? <EmptyRow label="No closed batches yet." /> : closed.map(b => (
        <Card key={b.id} style={{ marginBottom: spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13.5, fontWeight: '700' }}>{b.id}</Text>
            <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 3 }}>{b.farmLocation || 'Unassigned'} · {(b.cowIds || []).length} head · closed {formatDate(b.startDate)}</Text>
          </View>
        </Card>
      ))}
    </ScreenScroll>
  );
}
