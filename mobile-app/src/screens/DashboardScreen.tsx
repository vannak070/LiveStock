import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApiDataMulti } from '../hooks/useApiData';
import { StockItem, BatchItem, SalesRecord, ExpenseItem, MasterSetup } from '../api/types';
import { ScreenScroll, ScreenTitle, KpiTile, Card, SectionHeader, LoadingView, ErrorView, EmptyRow } from '../components/ui';
import FarmPicker from '../components/FarmPicker';
import { useFarmFilter } from '../context/FarmFilterContext';
import { applyFarmScope } from '../lib/farmScope';
import { colors, spacing } from '../theme/colors';
import { formatMoney } from '../lib/format';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const monthKey = (d: string) => (d.length >= 7 ? d.substring(0, 7) : new Date(d).toISOString().substring(0, 7));

export default function DashboardScreen() {
  const navigation = useNavigation<Nav>();
  const { effectiveFarm } = useFarmFilter();
  const { data, loading, error, refreshing, refresh } = useApiDataMulti({
    stock: '/stock',
    batches: '/batches',
    sales: '/sales',
    expenses: '/expenses',
    settings: '/settings'
  });

  // Hooks must run in the same order on every render, so every hook below
  // (including useMemo) runs unconditionally — only the JSX return is
  // gated by loading/error, and only after all hooks have been called.
  const rawStock = (data?.stock as StockItem[]) || [];
  const rawBatches = (data?.batches as BatchItem[]) || [];
  const rawSales = (data?.sales as SalesRecord[]) || [];
  const rawExpenses = (data?.expenses as ExpenseItem[]) || [];
  const settings = data?.settings as MasterSetup | undefined;
  const allFarms = settings?.farms || [];

  // Scoped to the active farm filter — null (all farms) leaves everything
  // untouched, a picked/locked farm narrows every collection the same way
  // DashboardContainer.tsx does on the web.
  const { stock, batches, sales, expenses } = applyFarmScope(
    { stock: rawStock, batches: rawBatches, sales: rawSales, expenses: rawExpenses },
    effectiveFarm
  );

  // This-month vs. last-month net profit, same YYYY-MM grouping FinanceScreen
  // and AnalyticsTab.tsx use, so the trend arrow always agrees with the
  // detailed report.
  const monthly = useMemo(() => {
    const map: Record<string, { revenue: number; expense: number }> = {};
    sales.forEach(s => {
      if (!s.salesDate) return;
      const key = monthKey(s.salesDate);
      map[key] = map[key] || { revenue: 0, expense: 0 };
      map[key].revenue += s.totalPrice || 0;
    });
    expenses.forEach(e => {
      if (!e.date) return;
      const key = monthKey(e.date);
      map[key] = map[key] || { revenue: 0, expense: 0 };
      map[key].expense += e.amount || 0;
    });
    const keys = Object.keys(map).sort();
    const thisKey = new Date().toISOString().substring(0, 7);
    const thisMonth = map[thisKey] || { revenue: 0, expense: 0 };
    const priorKeys = keys.filter(k => k < thisKey);
    const priorKey = priorKeys[priorKeys.length - 1];
    const priorMonth = priorKey ? map[priorKey] : null;
    return { thisMonth: { ...thisMonth, net: thisMonth.revenue - thisMonth.expense }, priorNet: priorMonth ? priorMonth.revenue - priorMonth.expense : null };
  }, [sales, expenses]);

  if (loading) return <LoadingView label="Loading dashboard…" />;
  if (error) return <ErrorView message={error} onRetry={refresh} />;

  const active = stock.filter(s => s.status?.toLowerCase() === 'active');
  const sold = stock.filter(s => s.status?.toLowerCase() === 'sold');
  const sick = active.filter(s => ['poor', 'sick', 'critical'].includes((s.healthStatus || '').toLowerCase()));
  const avgWeight = active.length > 0 ? Math.round(active.reduce((sum, c) => sum + (c.weight || 0), 0) / active.length) : 0;
  const dead = stock.filter(s => s.status?.toLowerCase() === 'dead' || s.healthStatus?.toLowerCase() === 'dead');
  const mortalityRate = stock.length > 0 ? (dead.length / stock.length) * 100 : 0;

  const totalRevenue = sales.reduce((sum, s) => sum + (s.totalPrice || 0), 0);
  const totalExpense = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const netProfit = totalRevenue - totalExpense;
  const activeBatches = batches.filter(b => b.status === 'Active');

  const farmRollup = allFarms.map(f => {
    const farmStock = rawStock.filter(s => s.location === f.name);
    const farmSales = rawSales.filter(s => farmStock.some(fs => fs.id === s.cowId));
    const farmExpenses = rawExpenses.filter(e => e.farmLocation === f.name);
    const rev = farmSales.reduce((sum, s) => sum + (s.totalPrice || 0), 0);
    const exp = farmExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    return {
      id: f.id,
      name: f.name,
      activeHead: farmStock.filter(s => s.status?.toLowerCase() === 'active').length,
      batches: rawBatches.filter(b => b.farmLocation === f.name).length,
      net: rev - exp
    };
  });

  const scopeLabel = effectiveFarm || 'All farms';
  const trendDelta = monthly.priorNet !== null ? monthly.thisMonth.net - monthly.priorNet : null;

  return (
    <ScreenScroll refreshing={refreshing} onRefresh={refresh}>
      <ScreenTitle title="Executive summary" subtitle={`${scopeLabel} · synced ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`} />

      <FarmPicker />

      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm }}>
        <KpiTile tone="brand" label="Active herd" value={String(active.length)} hint={`${sold.length} sold`} />
        <KpiTile label="Net profit" value={formatMoney(netProfit)} hint={totalRevenue > 0 ? `margin ${((netProfit / totalRevenue) * 100).toFixed(0)}%` : '—'} />
      </View>
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm }}>
        <KpiTile label="Revenue" value={formatMoney(totalRevenue)} />
        <KpiTile label="Expenses" value={formatMoney(totalExpense)} />
      </View>
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
        <KpiTile label="Avg weight" value={avgWeight ? `${avgWeight} kg` : '—'} />
        <KpiTile label="Mortality" value={`${mortalityRate.toFixed(1)}%`} tone={mortalityRate > 0 ? 'danger' : 'default'} />
      </View>

      <SectionHeader title="This month" />
      <Card style={{ marginBottom: spacing.lg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text style={{ fontSize: 9.5, textTransform: 'uppercase', color: colors.muted, marginBottom: 4 }}>Net profit so far</Text>
            <Text style={{ fontSize: 20, fontWeight: '700', color: monthly.thisMonth.net >= 0 ? colors.green : colors.red }}>{formatMoney(monthly.thisMonth.net)}</Text>
          </View>
          {trendDelta !== null && (
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 9.5, textTransform: 'uppercase', color: colors.muted, marginBottom: 4 }}>Vs. last month</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: trendDelta >= 0 ? colors.green : colors.red }}>{trendDelta >= 0 ? '▲' : '▼'} {formatMoney(Math.abs(trendDelta))}</Text>
            </View>
          )}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.borderFaint }}>
          <Text style={{ fontSize: 11.5, color: colors.textSecondary }}>Revenue {formatMoney(monthly.thisMonth.revenue)}</Text>
          <Text style={{ fontSize: 11.5, color: colors.textSecondary }}>Expenses {formatMoney(monthly.thisMonth.expense)}</Text>
        </View>
      </Card>

      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl }}>
        {/* Not tappable — the Fattening cycles / Batches report is hidden
            from mobile navigation, so this stays a plain KPI display. */}
        <View style={{ flex: 1 }}>
          <Card>
            <Text style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.8, color: colors.textSecondary, marginBottom: 7, fontWeight: '700' }}>Active batches</Text>
            <Text style={{ fontSize: 24, fontWeight: '700' }}>{activeBatches.length}</Text>
          </Card>
        </View>
        <TouchableOpacity style={{ flex: 1 }} onPress={() => navigation.navigate('Health')}>
          <Card style={{ backgroundColor: colors.tintRed, borderColor: colors.tintRedBorder }}>
            <Text style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.8, color: colors.redDark, marginBottom: 7, fontWeight: '700' }}>Health alerts</Text>
            <Text style={{ fontSize: 24, fontWeight: '700', color: colors.red }}>{sick.length}</Text>
          </Card>
        </TouchableOpacity>
      </View>

      {!effectiveFarm && (
        <>
          <SectionHeader title="Farms" />
          {farmRollup.length === 0 ? <EmptyRow label="No farms configured yet." /> : (
            <Card style={{ padding: 0 }}>
              {farmRollup.map((f, idx) => (
                <View key={f.id} style={{ padding: 13, borderBottomWidth: idx === farmRollup.length - 1 ? 0 : 1, borderBottomColor: colors.borderFaint, flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View>
                    <Text style={{ fontSize: 13.5, fontWeight: '600' }}>{f.name}</Text>
                    <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>{f.activeHead} head · {f.batches} batches</Text>
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: f.net >= 0 ? colors.green : colors.red }}>{formatMoney(f.net)}</Text>
                </View>
              ))}
            </Card>
          )}
        </>
      )}
    </ScreenScroll>
  );
}
