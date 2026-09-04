import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApiDataMulti } from '../hooks/useApiData';
import { StockItem, HealthLogItem } from '../api/types';
import { ScreenScroll, BackRow, ScreenTitle, SectionHeader, Card, BreakdownRow, LoadingView, ErrorView, EmptyRow } from '../components/ui';
import FarmPicker from '../components/FarmPicker';
import { useFarmFilter } from '../context/FarmFilterContext';
import { applyFarmScope } from '../lib/farmScope';
import { colors, spacing } from '../theme/colors';
import { formatMoney } from '../lib/format';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function withinDays(dateStr: string | null | undefined, n: number): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - n);
  return d >= cutoff;
}

// Health & veterinary report — aggregate only. The treatment/vaccination
// log used to list individual animals by ID; that's per-record detail this
// app doesn't surface, so it's now a breakdown by activity type instead.
export default function HealthScreen() {
  const navigation = useNavigation<Nav>();
  const { effectiveFarm } = useFarmFilter();
  const { data, loading, error, refresh } = useApiDataMulti({ stock: '/stock', health: '/health' });

  // Hooks must run in the same order every render — data extraction and
  // useMemo run unconditionally; only the JSX return is gated below.
  const { stock, healthLogs } = applyFarmScope(
    { stock: (data?.stock as StockItem[]) || [], healthLogs: (data?.health as HealthLogItem[]) || [] },
    effectiveFarm
  );
  const health = healthLogs || [];

  const activity = useMemo(() => {
    const last30 = health.filter(h => withinDays(h.date, 30));
    const byType: Record<string, number> = {};
    last30.forEach(h => {
      byType[h.type] = (byType[h.type] || 0) + 1;
    });
    return {
      loggedThisWeek: health.filter(h => withinDays(h.date, 7)).length,
      byType: Object.entries(byType).sort((a, b) => b[1] - a[1]),
      total30: last30.length
    };
  }, [health]);

  if (loading) return <LoadingView label="Loading health report…" />;
  if (error) return <ErrorView message={error} onRetry={refresh} />;

  const active = stock.filter(s => s.status?.toLowerCase() === 'active');
  const sick = active.filter(s => ['sick', 'critical'].includes((s.healthStatus || '').toLowerCase()));
  const atRisk = active.filter(s => (s.healthStatus || '').toLowerCase() === 'fair');
  const dead = stock.filter(s => (s.healthStatus || '').toLowerCase() === 'dead' || s.status?.toLowerCase() === 'dead');
  const medicalSpend = health.reduce((s, h) => s + (h.cost || 0), 0);
  const mortalityRate = stock.length > 0 ? (dead.length / stock.length) * 100 : 0;

  return (
    <ScreenScroll>
      <BackRow label="More" onPress={() => navigation.goBack()} />
      <ScreenTitle title="Health & veterinary" subtitle={effectiveFarm || 'All farms'} />

      <FarmPicker />

      <Card style={{ backgroundColor: colors.tintRed, borderColor: colors.tintRedBorder, marginBottom: spacing.md, flexDirection: 'row', gap: 14 }}>
        <View style={{ alignItems: 'center', paddingRight: 14, borderRightWidth: 1, borderRightColor: colors.tintRedBorder }}>
          <Text style={{ fontSize: 26, fontWeight: '700', color: colors.red }}>{sick.length}</Text>
          <Text style={{ fontSize: 9.5, textTransform: 'uppercase', color: colors.redDark, marginTop: 4 }}>Sick</Text>
        </View>
        <View style={{ alignItems: 'center', paddingRight: 14, borderRightWidth: 1, borderRightColor: colors.tintRedBorder }}>
          <Text style={{ fontSize: 26, fontWeight: '700', color: colors.amber }}>{atRisk.length}</Text>
          <Text style={{ fontSize: 9.5, textTransform: 'uppercase', color: colors.redDark, marginTop: 4 }}>At risk</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={{ fontSize: 11.5, color: colors.redDark, lineHeight: 16 }}>
            {sick.length + atRisk.length > 0 ? `${sick.length + atRisk.length} animals need attention across the active herd.` : 'Herd is healthy — no active alerts.'}
          </Text>
        </View>
      </Card>

      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg }}>
        <Card style={{ flex: 1 }}>
          <Text style={{ fontSize: 10, textTransform: 'uppercase', color: colors.textSecondary, fontWeight: '700', marginBottom: 7 }}>Medical spend</Text>
          <Text style={{ fontSize: 20, fontWeight: '700' }}>{formatMoney(medicalSpend)}</Text>
        </Card>
        <Card style={{ flex: 1 }}>
          <Text style={{ fontSize: 10, textTransform: 'uppercase', color: colors.textSecondary, fontWeight: '700', marginBottom: 7 }}>Mortality rate</Text>
          <Text style={{ fontSize: 20, fontWeight: '700', color: mortalityRate > 0 ? colors.red : colors.textPrimary }}>{mortalityRate.toFixed(1)}%</Text>
        </Card>
      </View>

      <SectionHeader title="Care activity" accent={colors.red} />
      <Card>
        <Text style={{ fontSize: 12.5, color: colors.textSecondary, marginBottom: 10 }}>
          {activity.loggedThisWeek} log{activity.loggedThisWeek === 1 ? '' : 's'} this week · {activity.total30} in the last 30 days
        </Text>
        {activity.byType.length === 0 ? (
          <EmptyRow label="No medical records in the last 30 days." />
        ) : (
          activity.byType.map(([label, count]) => (
            <BreakdownRow key={label} label={label} count={count} total={activity.total30} color={colors.red} />
          ))
        )}
      </Card>
    </ScreenScroll>
  );
}
