import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApiDataMulti } from '../hooks/useApiData';
import { StockItem, BatchItem, SalesRecord, ExpenseItem, MasterSetup } from '../api/types';
import { ScreenScroll, ScreenTitle, KpiTile, Card, SectionHeader, LoadingView, ErrorView, EmptyRow } from '../components/ui';
import { colors, spacing } from '../theme/colors';
import { formatMoney } from '../lib/format';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function DashboardScreen() {
  const navigation = useNavigation<Nav>();
  const { data, loading, error, refreshing, refresh } = useApiDataMulti({
    stock: '/stock',
    batches: '/batches',
    sales: '/sales',
    expenses: '/expenses',
    settings: '/settings'
  });

  if (loading) return <LoadingView label="Loading dashboard…" />;
  if (error) return <ErrorView message={error} onRetry={refresh} />;

  const stock = (data?.stock as StockItem[]) || [];
  const batches = (data?.batches as BatchItem[]) || [];
  const sales = (data?.sales as SalesRecord[]) || [];
  const expenses = (data?.expenses as ExpenseItem[]) || [];
  const settings = data?.settings as MasterSetup | undefined;
  const farms = settings?.farms || [];

  const active = stock.filter(s => s.status?.toLowerCase() === 'active');
  const sold = stock.filter(s => s.status?.toLowerCase() === 'sold');
  const sick = active.filter(s => ['poor', 'sick', 'critical'].includes((s.healthStatus || '').toLowerCase()));

  const totalRevenue = sales.reduce((sum, s) => sum + (s.totalPrice || 0), 0);
  const totalExpense = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const netProfit = totalRevenue - totalExpense;
  const activeBatches = batches.filter(b => b.status === 'Active');

  const farmRollup = farms.map(f => {
    const farmStock = stock.filter(s => s.location === f.name);
    const farmSales = sales.filter(s => farmStock.some(fs => fs.id === s.cowId));
    const farmExpenses = expenses.filter(e => e.farmLocation === f.name);
    const rev = farmSales.reduce((sum, s) => sum + (s.totalPrice || 0), 0);
    const exp = farmExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    return {
      id: f.id,
      name: f.name,
      activeHead: farmStock.filter(s => s.status?.toLowerCase() === 'active').length,
      batches: batches.filter(b => b.farmLocation === f.name).length,
      net: rev - exp
    };
  });

  return (
    <ScreenScroll refreshing={refreshing} onRefresh={refresh}>
      <ScreenTitle title="Executive summary" subtitle={`All farms · synced ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`} />

      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm }}>
        <KpiTile tone="brand" label="Active herd" value={String(active.length)} hint={`${sold.length} sold`} />
        <KpiTile label="Net profit" value={formatMoney(netProfit)} hint={totalRevenue > 0 ? `margin ${((netProfit / totalRevenue) * 100).toFixed(0)}%` : '—'} />
      </View>
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
        <KpiTile label="Revenue" value={formatMoney(totalRevenue)} />
        <KpiTile label="Expenses" value={formatMoney(totalExpense)} />
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl }}>
        <TouchableOpacity style={{ flex: 1 }} onPress={() => navigation.navigate('Batches')}>
          <Card>
            <Text style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.8, color: colors.textSecondary, marginBottom: 7, fontWeight: '700' }}>Active batches</Text>
            <Text style={{ fontSize: 24, fontWeight: '700' }}>{activeBatches.length}</Text>
          </Card>
        </TouchableOpacity>
        <TouchableOpacity style={{ flex: 1 }} onPress={() => navigation.navigate('Health')}>
          <Card style={{ backgroundColor: colors.tintRed, borderColor: colors.tintRedBorder }}>
            <Text style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.8, color: colors.redDark, marginBottom: 7, fontWeight: '700' }}>Health alerts</Text>
            <Text style={{ fontSize: 24, fontWeight: '700', color: colors.red }}>{sick.length}</Text>
          </Card>
        </TouchableOpacity>
      </View>

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
    </ScreenScroll>
  );
}
