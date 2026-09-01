import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApiDataMulti } from '../hooks/useApiData';
import { StockItem, FeedProductItem, FeedStockTransaction } from '../api/types';
import { ScreenScroll, ScreenTitle, Card, LoadingView, ErrorView, EmptyRow, Pill } from '../components/ui';
import { colors, spacing } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function AlertsScreen() {
  const navigation = useNavigation<Nav>();
  const { data, loading, error, refresh, refreshing } = useApiDataMulti({
    stock: '/stock',
    products: '/feed/products',
    transactions: '/feed/transactions'
  });

  const stock = (data?.stock as StockItem[]) || [];
  const products = (data?.products as FeedProductItem[]) || [];
  const transactions = (data?.transactions as FeedStockTransaction[]) || [];

  const alerts = useMemo(() => {
    const list: { key: string; kind: string; tone: 'red' | 'amber'; title: string; detail: string; onPress?: () => void }[] = [];

    stock
      .filter(s => s.status?.toLowerCase() === 'active' && ['sick', 'critical'].includes((s.healthStatus || '').toLowerCase()))
      .forEach(s => list.push({
        key: `health-${s.id}`,
        kind: 'Health',
        tone: 'red',
        title: `${s.id} needs attention`,
        detail: `${s.breed} at ${s.location || 'unassigned farm'} — status: ${s.healthStatus}`,
        onPress: () => navigation.navigate('AnimalDetail', { cowId: s.id })
      }));

    products.forEach(p => {
      const productTx = transactions.filter(t => t.productId === p.id);
      const inKg = productTx.filter(t => t.type === 'STOCK_IN').reduce((s, t) => s + (t.quantityKg || 0), 0);
      const outKg = productTx.filter(t => t.type === 'STOCK_OUT').reduce((s, t) => s + (t.quantityKg || 0), 0);
      const balanceKg = Math.max(0, inKg - outKg);
      if (balanceKg <= p.minThresholdKg) {
        list.push({
          key: `feed-${p.id}`,
          kind: 'Feed',
          tone: 'amber',
          title: `${p.name} running low`,
          detail: `${Math.round(balanceKg).toLocaleString()} kg on hand, reorder threshold is ${p.minThresholdKg.toLocaleString()} kg`,
          onPress: () => navigation.navigate('Feed')
        });
      }
    });

    return list;
  }, [stock, products, transactions]);

  if (loading) return <LoadingView label="Loading alerts…" />;
  if (error) return <ErrorView message={error} onRetry={refresh} />;

  return (
    <ScreenScroll refreshing={refreshing} onRefresh={refresh}>
      <ScreenTitle title="Notifications" subtitle={`${alerts.length} open · read-only view`} />
      {alerts.length === 0 ? <EmptyRow label="No open alerts — everything looks good." /> : alerts.map(a => (
        <TouchableOpacity key={a.key} onPress={a.onPress} disabled={!a.onPress}>
          <Card style={{ marginBottom: spacing.sm, borderLeftWidth: 3, borderLeftColor: a.tone === 'red' ? colors.red : colors.amber }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 6 }}>
              <Pill label={a.kind} tone={a.tone} />
            </View>
            <Text style={{ fontSize: 13, fontWeight: '600' }}>{a.title}</Text>
            <Text style={{ fontSize: 11.5, color: colors.textSecondary, marginTop: 3, lineHeight: 16 }}>{a.detail}</Text>
          </Card>
        </TouchableOpacity>
      ))}
    </ScreenScroll>
  );
}
