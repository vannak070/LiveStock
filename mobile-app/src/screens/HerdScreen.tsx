import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useApiData } from '../hooks/useApiData';
import { StockItem } from '../api/types';
import { LoadingView, ErrorView, ScreenScroll, ScreenTitle, KpiTile, Card, SectionHeader, EmptyRow, BreakdownRow } from '../components/ui';
import FarmPicker from '../components/FarmPicker';
import { useFarmFilter } from '../context/FarmFilterContext';
import { applyFarmScope } from '../lib/farmScope';
import { colors, spacing } from '../theme/colors';

function healthColor(status: string): string {
  const s = (status || '').toLowerCase();
  if (s === 'good' || s === 'healthy') return colors.green;
  if (s === 'fair') return colors.amber;
  return colors.red;
}

// Herd overview — aggregate composition only. No individual animal list or
// search here by design: management gets counts and breakdowns, not a way
// to browse to a single record. That level of detail stays in the
// operations web app.
export default function HerdScreen() {
  const { effectiveFarm } = useFarmFilter();
  const { data, loading, error, refresh, refreshing } = useApiData<StockItem[]>('/stock');
  const rawStock = data || [];

  const stats = useMemo(() => {
    const { stock } = applyFarmScope({ stock: rawStock }, effectiveFarm);
    const active = stock.filter(s => s.status?.toLowerCase() === 'active');
    const sold = stock.filter(s => s.status?.toLowerCase() === 'sold');
    const dead = stock.filter(s => s.status?.toLowerCase() === 'dead' || s.healthStatus?.toLowerCase() === 'dead');
    const avgWeight = active.length > 0 ? active.reduce((sum, c) => sum + (c.weight || 0), 0) / active.length : 0;

    const healthMap: Record<string, number> = {};
    active.forEach(c => {
      const key = c.healthStatus || 'Unspecified';
      healthMap[key] = (healthMap[key] || 0) + 1;
    });

    const breedMap: Record<string, number> = {};
    active.forEach(c => {
      const key = c.breed || 'Unspecified';
      breedMap[key] = (breedMap[key] || 0) + 1;
    });

    const locationMap: Record<string, number> = {};
    active.forEach(c => {
      const key = c.location || 'Unassigned';
      locationMap[key] = (locationMap[key] || 0) + 1;
    });

    return {
      activeCount: active.length,
      soldCount: sold.length,
      deadCount: dead.length,
      avgWeight,
      healthEntries: Object.entries(healthMap).sort((a, b) => b[1] - a[1]),
      breedEntries: Object.entries(breedMap).sort((a, b) => b[1] - a[1]),
      locationEntries: Object.entries(locationMap).sort((a, b) => b[1] - a[1])
    };
  }, [rawStock, effectiveFarm]);

  if (loading) return <LoadingView label="Loading herd…" />;
  if (error) return <ErrorView message={error} onRetry={refresh} />;

  return (
    <ScreenScroll refreshing={refreshing} onRefresh={refresh}>
      <ScreenTitle title="Herd overview" subtitle={`${effectiveFarm || 'All farms'} · aggregate report`} />

      <FarmPicker />

      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm }}>
        <KpiTile tone="brand" label="Active" value={String(stats.activeCount)} />
        <KpiTile label="Avg weight" value={stats.avgWeight ? `${Math.round(stats.avgWeight)} kg` : '—'} />
      </View>
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg }}>
        <KpiTile label="Sold" value={String(stats.soldCount)} />
        <KpiTile label="Dead" value={String(stats.deadCount)} tone={stats.deadCount > 0 ? 'danger' : 'default'} />
      </View>

      <SectionHeader title="Health status" />
      <Card style={{ marginBottom: spacing.lg }}>
        {stats.healthEntries.length === 0 ? (
          <EmptyRow label="No active cattle recorded yet." />
        ) : (
          stats.healthEntries.map(([label, count]) => (
            <BreakdownRow key={label} label={label} count={count} total={stats.activeCount} color={healthColor(label)} />
          ))
        )}
      </Card>

      <SectionHeader title="By breed" />
      <Card style={{ marginBottom: spacing.lg }}>
        {stats.breedEntries.length === 0 ? (
          <EmptyRow label="No breed data available." />
        ) : (
          stats.breedEntries.map(([label, count]) => (
            <BreakdownRow key={label} label={label} count={count} total={stats.activeCount} color={colors.green} />
          ))
        )}
      </Card>

      {!effectiveFarm && (
        <>
          <SectionHeader title="By farm" />
          <Card>
            {stats.locationEntries.length === 0 ? (
              <EmptyRow label="No location data available." />
            ) : (
              stats.locationEntries.map(([label, count]) => (
                <BreakdownRow key={label} label={label} count={count} total={stats.activeCount} color={colors.amber} />
              ))
            )}
          </Card>
        </>
      )}
    </ScreenScroll>
  );
}
