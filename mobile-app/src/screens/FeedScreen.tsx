import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApiDataMulti } from '../hooks/useApiData';
import { FeedProductItem, FeedStockTransaction } from '../api/types';
import { ScreenScroll, BackRow, ScreenTitle, Card, ProgressBar, Pill, LoadingView, ErrorView, EmptyRow } from '../components/ui';
import { colors, spacing } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// Feed inventory has no farm dimension in this data model — it's one
// shared product catalog, not split per farm — and the web app's own
// FeedInventoryTab.tsx applies no farm scoping either (DashboardContainer's
// farm-scoping useMemo passes feed products/transactions through
// untouched). So this report intentionally stays global, unlike every
// other report screen.
export default function FeedScreen() {
  const navigation = useNavigation<Nav>();
  const { data, loading, error, refresh } = useApiDataMulti({ products: '/feed/products', transactions: '/feed/transactions' });

  const products = (data?.products as FeedProductItem[]) || [];
  const transactions = (data?.transactions as FeedStockTransaction[]) || [];

  const balances = useMemo(() => {
    return products.map(p => {
      const productTx = transactions.filter(t => t.productId === p.id);
      const inKg = productTx.filter(t => t.type === 'STOCK_IN').reduce((s, t) => s + (t.quantityKg || 0), 0);
      const outKg = productTx.filter(t => t.type === 'STOCK_OUT').reduce((s, t) => s + (t.quantityKg || 0), 0);
      const balanceKg = Math.max(0, inKg - outKg);
      const balanceBags = p.weightPerUnit > 0 ? balanceKg / p.weightPerUnit : 0;
      const isLow = balanceKg <= p.minThresholdKg;
      const pct = p.minThresholdKg > 0 ? Math.min(100, (balanceKg / (p.minThresholdKg * 2)) * 100) : 50;
      return { ...p, balanceKg, balanceBags, isLow, pct };
    });
  }, [products, transactions]);

  if (loading) return <LoadingView label="Loading feed inventory…" />;
  if (error) return <ErrorView message={error} onRetry={refresh} />;

  return (
    <ScreenScroll>
      <BackRow label="More" onPress={() => navigation.goBack()} />
      <ScreenTitle title="Feed inventory" subtitle={`${balances.filter(b => b.isLow).length} product(s) low on stock`} />

      {balances.length === 0 ? <EmptyRow label="No feed products configured yet." /> : balances.map(p => (
        <Card key={p.id} style={{ marginBottom: spacing.sm, borderColor: p.isLow ? colors.tintRedBorder : colors.border }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '600' }}>{p.name}</Text>
              <Text style={{ fontSize: 10.5, color: colors.textSecondary, marginTop: 3 }}>{Math.round(p.balanceKg).toLocaleString()} kg on hand · reorder at {p.minThresholdKg.toLocaleString()} kg</Text>
            </View>
            <Pill label={p.isLow ? 'Low stock' : 'OK'} tone={p.isLow ? 'red' : 'green'} />
          </View>
          <ProgressBar pct={p.pct} color={p.isLow ? colors.red : colors.green} />
        </Card>
      ))}
    </ScreenScroll>
  );
}
