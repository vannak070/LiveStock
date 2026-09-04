import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import Svg, { Polyline, Circle } from 'react-native-svg';
import { useApiDataMulti } from '../hooks/useApiData';
import { SalesRecord, ExpenseItem, StockItem } from '../api/types';
import { ScreenScroll, ScreenTitle, SectionHeader, Card, LoadingView, ErrorView, EmptyRow } from '../components/ui';
import FarmPicker from '../components/FarmPicker';
import { useFarmFilter } from '../context/FarmFilterContext';
import { applyFarmScope } from '../lib/farmScope';
import { colors, spacing } from '../theme/colors';
import { formatMoney, formatDate } from '../lib/format';

const CATEGORY_COLORS = [colors.green, colors.amber, '#7A9AA8', colors.red, colors.muted];

export default function FinanceScreen() {
  const { effectiveFarm } = useFarmFilter();
  // Stock is fetched alongside sales/expenses purely to resolve each sale's
  // farm via its cow — sales don't carry a farm of their own, same
  // cross-reference DashboardContainer.tsx uses on the web. Expenses do
  // carry their own farmLocation, so they're scoped directly.
  const { data, loading, error, refresh, refreshing } = useApiDataMulti({ sales: '/sales', expenses: '/expenses', stock: '/stock' });

  const { sales, expenses } = applyFarmScope(
    {
      stock: (data?.stock as StockItem[]) || [],
      sales: (data?.sales as SalesRecord[]) || [],
      expenses: (data?.expenses as ExpenseItem[]) || []
    },
    effectiveFarm
  );

  // Grouped by YYYY-MM (not just month name) so, e.g., Jan 2025 and Jan 2026
  // don't collide into the same bucket — matches AnalyticsTab.tsx's
  // financialMonthly on the web side.
  const monthly = useMemo(() => {
    const map: Record<string, { revenue: number; expense: number }> = {};
    const monthKey = (d: string) => d.length >= 7 ? d.substring(0, 7) : new Date(d).toISOString().substring(0, 7);
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
    return Object.entries(map)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .map(([key, v]) => {
        const [year, m] = key.split('-');
        const label = new Date(parseInt(year), parseInt(m) - 1).toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
        return { label, ...v, net: v.revenue - v.expense };
      });
  }, [sales, expenses]);

  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach(e => { map[e.category] = (map[e.category] || 0) + (e.amount || 0); });
    const total = Object.values(map).reduce((s, v) => s + v, 0);
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([label, value], i) => ({ label, value, pct: total > 0 ? (value / total) * 100 : 0, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }));
  }, [expenses]);

  if (loading) return <LoadingView label="Loading financial reports…" />;
  if (error) return <ErrorView message={error} onRetry={refresh} />;

  const totalRevenue = sales.reduce((s, r) => s + (r.totalPrice || 0), 0);
  const totalExpense = expenses.reduce((s, r) => s + (r.amount || 0), 0);
  const netVals = monthly.map(m => m.net);
  const maxNet = netVals.length ? Math.max(...netVals, 1) : 1;
  const minNet = netVals.length ? Math.min(...netVals, 0) : 0;
  const range = maxNet - minNet || 1;
  const W = 300, H = 90;
  const coords = monthly.map((m, i) => ({
    x: monthly.length > 1 ? (i / (monthly.length - 1)) * W : W / 2,
    y: H - ((m.net - minNet) / range) * (H - 16) - 8
  }));

  const ledger = [...sales].sort((a, b) => new Date(b.salesDate || 0).getTime() - new Date(a.salesDate || 0).getTime()).slice(0, 6);

  return (
    <ScreenScroll refreshing={refreshing} onRefresh={refresh}>
      <ScreenTitle title="Financial reports" subtitle={effectiveFarm || 'All farms'} />

      <FarmPicker />

      <Card style={{ marginBottom: spacing.md }}>
        <Text style={{ fontSize: 12.5, fontWeight: '700', marginBottom: 12 }}>Revenue vs expense by month</Text>
        {monthly.length === 0 ? <EmptyRow label="No sales or expense data yet." /> : (
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 110 }}>
            {monthly.map((m, i) => {
              const scale = 80 / Math.max(...monthly.map(mm => Math.max(mm.revenue, mm.expense, 1)));
              return (
                <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 80 }}>
                    <View style={{ width: 10, backgroundColor: colors.green, height: Math.max(2, m.revenue * scale), borderRadius: 2 }} />
                    <View style={{ width: 10, backgroundColor: colors.expenseBar, height: Math.max(2, m.expense * scale), borderRadius: 2 }} />
                  </View>
                  <Text style={{ fontSize: 9, color: colors.muted, marginTop: 5 }}>{m.label}</Text>
                </View>
              );
            })}
          </View>
        )}
      </Card>

      <Card style={{ marginBottom: spacing.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
          <Text style={{ fontSize: 12.5, fontWeight: '700' }}>Expenses by category</Text>
          <Text style={{ fontSize: 11.5, fontWeight: '700' }}>{formatMoney(totalExpense)}</Text>
        </View>
        {byCategory.length === 0 ? <EmptyRow label="No expenses recorded yet." /> : (
          <>
            <View style={{ flexDirection: 'row', height: 9, borderRadius: 5, overflow: 'hidden', marginBottom: 12 }}>
              {byCategory.map((c, i) => <View key={i} style={{ height: '100%', width: `${c.pct}%`, backgroundColor: c.color }} />)}
            </View>
            {byCategory.map((c, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 8 }}>
                <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: c.color }} />
                <Text style={{ flex: 1, fontSize: 12.5 }}>{c.label}</Text>
                <Text style={{ fontSize: 11, color: colors.muted, marginRight: 6 }}>{c.pct.toFixed(0)}%</Text>
                <Text style={{ fontSize: 12.5, fontWeight: '600' }}>{formatMoney(c.value)}</Text>
              </View>
            ))}
          </>
        )}
      </Card>

      <Card style={{ marginBottom: spacing.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ fontSize: 12.5, fontWeight: '700' }}>Net profit trend</Text>
          <Text style={{ fontSize: 11.5, fontWeight: '700', color: (totalRevenue - totalExpense) >= 0 ? colors.green : colors.red }}>{formatMoney(totalRevenue - totalExpense)}</Text>
        </View>
        {monthly.length > 1 ? (
          <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
            <Polyline points={coords.map(c => `${c.x},${c.y}`).join(' ')} fill="none" stroke={colors.green} strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round" />
            {coords.map((c, i) => <Circle key={i} cx={c.x} cy={c.y} r={3} fill={colors.white} stroke={colors.green} strokeWidth={2} />)}
          </Svg>
        ) : <EmptyRow label="Not enough data for a trend yet." />}
      </Card>

      <SectionHeader title="Recent sales ledger" accent={colors.red} />
      <Card style={{ padding: 0 }}>
        {ledger.length === 0 ? <EmptyRow label="No sales recorded yet." /> : ledger.map((l, idx) => (
          <View key={idx} style={{ padding: 13, borderBottomWidth: idx === ledger.length - 1 ? 0 : 1, borderBottomColor: colors.borderFaint, flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              {/* Breed, not cowId — no per-animal identifiers in reports. */}
              <Text style={{ fontSize: 12.5, fontWeight: '600' }}>{l.breed || 'Sale'}</Text>
              <Text style={{ fontSize: 10.5, color: colors.textSecondary, marginTop: 3 }}>{formatDate(l.salesDate)} · {l.weight} kg</Text>
            </View>
            <Text style={{ fontSize: 13, fontWeight: '700' }}>{formatMoney(l.totalPrice)}</Text>
          </View>
        ))}
      </Card>
    </ScreenScroll>
  );
}
