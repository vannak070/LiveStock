import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApiDataMulti } from '../hooks/useApiData';
import { StockItem, SalesRecord } from '../api/types';
import { ScreenScroll, BackRow, ScreenTitle, SectionHeader, Card, KpiTile, LoadingView, ErrorView, EmptyRow } from '../components/ui';
import FarmPicker from '../components/FarmPicker';
import { useFarmFilter } from '../context/FarmFilterContext';
import { applyFarmScope } from '../lib/farmScope';
import { colors, spacing } from '../theme/colors';
import { formatMoney } from '../lib/format';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function SalesScreen() {
  const navigation = useNavigation<Nav>();
  const { effectiveFarm } = useFarmFilter();
  const { data, loading, error, refresh } = useApiDataMulti({ stock: '/stock', sales: '/sales' });

  // Hooks must run in the same order on every render — data extraction and
  // useMemo run unconditionally; only the JSX return is gated below.
  const { stock, sales } = applyFarmScope(
    { stock: (data?.stock as StockItem[]) || [], sales: (data?.sales as SalesRecord[]) || [] },
    effectiveFarm
  );

  const byFarm = useMemo(() => {
    const map: Record<string, { head: number; revenue: number }> = {};
    sales.forEach(s => {
      const cow = stock.find(c => c.id === s.cowId);
      const farm = cow?.location || 'Unassigned';
      map[farm] = map[farm] || { head: 0, revenue: 0 };
      map[farm].head += 1;
      map[farm].revenue += s.totalPrice || 0;
    });
    return Object.entries(map).sort((a, b) => b[1].revenue - a[1].revenue);
  }, [sales, stock]);

  if (loading) return <LoadingView label="Loading sales…" />;
  if (error) return <ErrorView message={error} onRetry={refresh} />;

  const totalRevenue = sales.reduce((s, r) => s + (r.totalPrice || 0), 0);
  const avgPrice = sales.length > 0 ? totalRevenue / sales.length : 0;

  return (
    <ScreenScroll>
      <BackRow label="More" onPress={() => navigation.goBack()} />
      <ScreenTitle title="Sales reporting" subtitle={`${effectiveFarm || 'All farms'} · ${sales.length} cattle sold`} />

      <FarmPicker />

      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg }}>
        <KpiTile tone="brand" label="Revenue" value={formatMoney(totalRevenue)} />
        <KpiTile label="Avg sale" value={formatMoney(avgPrice)} />
      </View>

      {!effectiveFarm && (
        <>
          <SectionHeader title="By farm" />
          {byFarm.length === 0 ? <EmptyRow label="No sales recorded yet." /> : byFarm.map(([farm, v]) => (
            <Card key={farm} style={{ marginBottom: spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ fontSize: 14, fontWeight: '600' }}>{farm}</Text>
                <Text style={{ fontSize: 10.5, color: colors.textSecondary, marginTop: 3 }}>{v.head} head sold</Text>
              </View>
              <Text style={{ fontSize: 14, fontWeight: '700', color: colors.green }}>{formatMoney(v.revenue)}</Text>
            </Card>
          ))}
        </>
      )}
    </ScreenScroll>
  );
}
