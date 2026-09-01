import React from 'react';
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApiDataMulti } from '../hooks/useApiData';
import { BatchItem, StockItem } from '../api/types';
import { ScreenScroll, BackRow, ScreenTitle, SectionHeader, Card, Pill, LoadingView, ErrorView, EmptyRow } from '../components/ui';
import { colors, spacing } from '../theme/colors';
import { formatMoney, formatDate, daysBetween } from '../lib/format';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function BatchesScreen() {
  const navigation = useNavigation<Nav>();
  const { data, loading, error, refresh } = useApiDataMulti({ batches: '/batches', stock: '/stock' });

  if (loading) return <LoadingView label="Loading batches…" />;
  if (error) return <ErrorView message={error} onRetry={refresh} />;

  const batches = (data?.batches as BatchItem[]) || [];
  const stock = (data?.stock as StockItem[]) || [];
  const active = batches.filter(b => b.status === 'Active');
  const closed = batches.filter(b => b.status !== 'Active');

  const avgWeight = (b: BatchItem) => {
    const cows = stock.filter(s => b.cowIds?.includes(s.id) && s.weight);
    if (cows.length === 0) return null;
    return Math.round(cows.reduce((sum, c) => sum + c.weight, 0) / cows.length);
  };

  return (
    <ScreenScroll>
      <BackRow label="More" onPress={() => navigation.goBack()} />
      <ScreenTitle title="Fattening cycles" subtitle={`${active.length} active · ${closed.length} closed`} />

      <SectionHeader title="Active batches" />
      {active.length === 0 ? <EmptyRow label="No active batches." /> : active.map(b => {
        const days = daysBetween(b.startDate);
        const wt = avgWeight(b);
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
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, borderTopWidth: 1, borderTopColor: colors.borderFaint, paddingTop: 10 }}>
              <View>
                <Text style={{ fontSize: 9.5, textTransform: 'uppercase', color: colors.muted, marginBottom: 3 }}>Avg weight</Text>
                <Text style={{ fontSize: 13.5, fontWeight: '600' }}>{wt !== null ? `${wt} kg` : '—'}</Text>
              </View>
              <View>
                <Text style={{ fontSize: 9.5, textTransform: 'uppercase', color: colors.muted, marginBottom: 3 }}>Expected value</Text>
                <Text style={{ fontSize: 13.5, fontWeight: '600' }}>{b.expectedSellingPrice ? formatMoney(b.expectedSellingPrice) : '—'}</Text>
              </View>
            </View>
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
