import React from 'react';
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApiDataMulti } from '../hooks/useApiData';
import { StockItem, SalesRecord, ExpenseItem, MasterSetup } from '../api/types';
import { ScreenScroll, BackRow, ScreenTitle, Card, LoadingView, ErrorView, EmptyRow } from '../components/ui';
import FarmPicker from '../components/FarmPicker';
import { useFarmFilter } from '../context/FarmFilterContext';
import { colors, spacing } from '../theme/colors';
import { formatMoney } from '../lib/format';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function FarmsScreen() {
  const navigation = useNavigation<Nav>();
  const { effectiveFarm } = useFarmFilter();
  const { data, loading, error, refresh } = useApiDataMulti({
    stock: '/stock',
    sales: '/sales',
    expenses: '/expenses',
    settings: '/settings'
  });

  if (loading) return <LoadingView label="Loading farms…" />;
  if (error) return <ErrorView message={error} onRetry={refresh} />;

  const stock = (data?.stock as StockItem[]) || [];
  const sales = (data?.sales as SalesRecord[]) || [];
  const expenses = (data?.expenses as ExpenseItem[]) || [];
  const settings = data?.settings as MasterSetup | undefined;
  const allFarms = settings?.farms || [];
  // This screen is a farm-by-farm comparison by nature, so a locked/picked
  // farm just narrows the list to that one farm's card rather than hiding
  // the comparison layout entirely.
  const farms = effectiveFarm ? allFarms.filter(f => f.name === effectiveFarm) : allFarms;

  const ranked = farms
    .map(f => {
      const farmStock = stock.filter(s => s.location === f.name);
      const active = farmStock.filter(s => s.status?.toLowerCase() === 'active').length;
      const sold = farmStock.filter(s => s.status?.toLowerCase() === 'sold').length;
      const revenue = sales.filter(s => farmStock.some(fs => fs.id === s.cowId)).reduce((sum, s) => sum + (s.totalPrice || 0), 0);
      const expense = expenses.filter(e => e.farmLocation === f.name).reduce((sum, e) => sum + (e.amount || 0), 0);
      const net = revenue - expense;
      const costPerHead = farmStock.length > 0 ? expense / farmStock.length : 0;
      return { id: f.id, name: f.name, active, sold, revenue, expense, net, costPerHead };
    })
    .sort((a, b) => b.net - a.net);

  return (
    <ScreenScroll>
      <BackRow label="More" onPress={() => navigation.goBack()} />
      <ScreenTitle title="Farm comparison" subtitle={effectiveFarm ? effectiveFarm : 'Net profit ranked'} />

      <FarmPicker />

      {ranked.length === 0 ? <EmptyRow label="No farms configured yet." /> : ranked.map((f, idx) => {
        const total = f.revenue + f.expense;
        const revPct = total > 0 ? (f.revenue / total) * 100 : 0;
        return (
          <Card key={f.id} style={{ marginBottom: spacing.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
                <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: colors.tintGrey, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textSecondary }}>{idx + 1}</Text>
                </View>
                <View>
                  <Text style={{ fontSize: 15, fontWeight: '700' }}>{f.name}</Text>
                  <Text style={{ fontSize: 10.5, color: colors.textSecondary, marginTop: 2 }}>{f.active} active · {f.sold} sold</Text>
                </View>
              </View>
              <Text style={{ fontSize: 17, fontWeight: '700', color: f.net >= 0 ? colors.green : colors.red }}>{formatMoney(f.net)}</Text>
            </View>
            <View style={{ flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', backgroundColor: colors.bgRoot, marginBottom: 9 }}>
              <View style={{ height: '100%', width: `${revPct}%`, backgroundColor: colors.green }} />
              <View style={{ height: '100%', width: `${100 - revPct}%`, backgroundColor: colors.expenseBar }} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ fontSize: 9.5, textTransform: 'uppercase', color: colors.muted, marginBottom: 4 }}>Revenue</Text>
                <Text style={{ fontSize: 13, fontWeight: '600' }}>{formatMoney(f.revenue)}</Text>
              </View>
              <View>
                <Text style={{ fontSize: 9.5, textTransform: 'uppercase', color: colors.muted, marginBottom: 4 }}>Expenses</Text>
                <Text style={{ fontSize: 13, fontWeight: '600' }}>{formatMoney(f.expense)}</Text>
              </View>
              <View>
                <Text style={{ fontSize: 9.5, textTransform: 'uppercase', color: colors.muted, marginBottom: 4 }}>Cost/head</Text>
                <Text style={{ fontSize: 13, fontWeight: '600' }}>{formatMoney(f.costPerHead)}</Text>
              </View>
            </View>
          </Card>
        );
      })}
    </ScreenScroll>
  );
}
