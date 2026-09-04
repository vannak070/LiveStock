import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApiDataMulti } from '../hooks/useApiData';
import { StockItem, FeedProductItem, FeedStockTransaction, BatchItem } from '../api/types';
import { ScreenScroll, ScreenTitle, SectionHeader, Card, BreakdownRow, LoadingView, ErrorView, EmptyRow, Pill } from '../components/ui';
import FarmPicker from '../components/FarmPicker';
import { useFarmFilter } from '../context/FarmFilterContext';
import { applyFarmScope } from '../lib/farmScope';
import { colors, spacing } from '../theme/colors';
import { formatDate } from '../lib/format';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// Notifications — aggregate counts only. Health alerts show how many
// animals are flagged and where, not which ones (that's a per-record
// detail this app deliberately doesn't surface). Selling Prep alerts
// surface batches (not individual animals) whose Selling Target Date is
// within 10 days, so management gets advance notice to prepare for the
// sale — mirrors the web Dashboard's Selling Prep Alerts card. Feed
// alerts stay tappable since they lead to the product-level Feed report,
// not an individual animal, and stay unscoped by farm — feed stock in
// this system is a single shared inventory, not split per farm, same as
// on the web (FeedInventoryTab.tsx applies no farm scoping either).
export default function AlertsScreen() {
  const navigation = useNavigation<Nav>();
  const { effectiveFarm } = useFarmFilter();
  const { data, loading, error, refresh, refreshing } = useApiDataMulti({
    stock: '/stock',
    batches: '/batches',
    products: '/feed/products',
    transactions: '/feed/transactions'
  });

  const rawStock = (data?.stock as StockItem[]) || [];
  const rawBatches = (data?.batches as BatchItem[]) || [];
  const products = (data?.products as FeedProductItem[]) || [];
  const transactions = (data?.transactions as FeedStockTransaction[]) || [];

  const healthAlerts = useMemo(() => {
    const { stock } = applyFarmScope({ stock: rawStock }, effectiveFarm);
    const flagged = stock.filter(
      s => s.status?.toLowerCase() === 'active' && ['sick', 'critical'].includes((s.healthStatus || '').toLowerCase())
    );
    const byFarm: Record<string, number> = {};
    flagged.forEach(s => {
      const key = s.location || 'Unassigned';
      byFarm[key] = (byFarm[key] || 0) + 1;
    });
    return { count: flagged.length, byFarm: Object.entries(byFarm).sort((a, b) => b[1] - a[1]) };
  }, [rawStock, effectiveFarm]);

  // Selling Prep — active batches whose Selling Target Date (Start Date +
  // 90 days, set at batch creation) is within the next 10 days, so
  // management gets advance notice to prepare for the sale. Overdue
  // targets are included too, flagged distinctly — same rule as the web
  // Dashboard's "Selling Prep Alerts" card.
  const sellingPrepAlerts = useMemo(() => {
    // Cross-reference through stock too (not just each batch's own
    // farmLocation) so a batch scopes correctly even if that field was
    // left blank — same full cross-reference BatchesScreen.tsx uses.
    const { batches } = applyFarmScope({ stock: rawStock, batches: rawBatches }, effectiveFarm);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return batches
      .filter(b => b.status === 'Active' && !!b.sellingTargetDate)
      .map(b => {
        const target = new Date(b.sellingTargetDate as string);
        const daysRemaining = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return { ...b, daysRemaining };
      })
      .filter(b => b.daysRemaining <= 10)
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [rawBatches, effectiveFarm]);

  const feedAlerts = useMemo(() => {
    return products
      .map(p => {
        const productTx = transactions.filter(t => t.productId === p.id);
        const inKg = productTx.filter(t => t.type === 'STOCK_IN').reduce((s, t) => s + (t.quantityKg || 0), 0);
        const outKg = productTx.filter(t => t.type === 'STOCK_OUT').reduce((s, t) => s + (t.quantityKg || 0), 0);
        const balanceKg = Math.max(0, inKg - outKg);
        return { id: p.id, name: p.name, balanceKg, thresholdKg: p.minThresholdKg, isLow: balanceKg <= p.minThresholdKg };
      })
      .filter(p => p.isLow);
  }, [products, transactions]);

  if (loading) return <LoadingView label="Loading alerts…" />;
  if (error) return <ErrorView message={error} onRetry={refresh} />;

  const totalOpen = healthAlerts.count + feedAlerts.length + sellingPrepAlerts.length;

  return (
    <ScreenScroll refreshing={refreshing} onRefresh={refresh}>
      <ScreenTitle title="Notifications" subtitle={`${effectiveFarm || 'All farms'} · ${totalOpen} open · read-only view`} />

      <FarmPicker />

      <SectionHeader title="Health" accent={colors.red} />
      <Card
        style={{
          marginBottom: spacing.lg,
          borderColor: healthAlerts.count > 0 ? colors.tintRedBorder : colors.border,
          backgroundColor: healthAlerts.count > 0 ? colors.tintRed : colors.white
        }}
      >
        {healthAlerts.count === 0 ? (
          <EmptyRow label="No animals need attention right now." />
        ) : (
          <>
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.redDark, marginBottom: 10 }}>
              {healthAlerts.count} animal{healthAlerts.count === 1 ? '' : 's'} flagged sick or critical
            </Text>
            {healthAlerts.byFarm.map(([label, count]) => (
              <BreakdownRow key={label} label={label} count={count} total={healthAlerts.count} color={colors.red} />
            ))}
          </>
        )}
      </Card>

      <SectionHeader title="Selling Prep" accent={colors.amber} />
      <Card style={{ marginBottom: spacing.lg, padding: sellingPrepAlerts.length === 0 ? spacing.lg : 0 }}>
        {sellingPrepAlerts.length === 0 ? (
          <EmptyRow label="No batches nearing their selling target date." />
        ) : (
          // Not tappable — the Fattening cycles / Batches report these used
          // to link to is hidden from mobile navigation, so this stays a
          // plain (read-only) list.
          sellingPrepAlerts.map((b, idx) => (
            <View
              key={b.id}
              style={{
                padding: 13,
                borderBottomWidth: idx === sellingPrepAlerts.length - 1 ? 0 : 1,
                borderBottomColor: colors.borderFaint,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                  <Pill label="Selling" tone="amber" />
                  <Text style={{ fontSize: 13, fontWeight: '600' }}>{b.name}</Text>
                </View>
                <Text style={{ fontSize: 11.5, color: colors.textSecondary }}>
                  {b.farmLocation || 'Unassigned'} · target {formatDate(b.sellingTargetDate)}
                </Text>
              </View>
              <Text style={{ fontSize: 12.5, fontWeight: '700', color: b.daysRemaining < 0 ? colors.red : colors.amber }}>
                {b.daysRemaining < 0 ? `Overdue ${Math.abs(b.daysRemaining)}d` : b.daysRemaining === 0 ? 'Today' : `${b.daysRemaining}d left`}
              </Text>
            </View>
          ))
        )}
      </Card>

      <SectionHeader title="Feed" accent={colors.amber} />
      <Card style={{ padding: feedAlerts.length === 0 ? spacing.lg : 0 }}>
        {feedAlerts.length === 0 ? (
          <EmptyRow label="Feed stock is healthy across all products." />
        ) : (
          feedAlerts.map((p, idx) => (
            <TouchableOpacity key={p.id} onPress={() => navigation.navigate('Feed')}>
              <View
                style={{
                  padding: 13,
                  borderBottomWidth: idx === feedAlerts.length - 1 ? 0 : 1,
                  borderBottomColor: colors.borderFaint
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                  <Pill label="Feed" tone="amber" />
                  <Text style={{ fontSize: 13, fontWeight: '600' }}>{p.name} running low</Text>
                </View>
                <Text style={{ fontSize: 11.5, color: colors.textSecondary }}>
                  {Math.round(p.balanceKg).toLocaleString()} kg on hand, reorder threshold is {p.thresholdKg.toLocaleString()} kg
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </Card>
    </ScreenScroll>
  );
}
