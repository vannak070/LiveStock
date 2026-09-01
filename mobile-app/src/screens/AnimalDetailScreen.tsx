import React from 'react';
import { View, Text } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApiDataMulti } from '../hooks/useApiData';
import { StockItem, WeightRecord, SalesRecord, HealthLogItem } from '../api/types';
import { ScreenScroll, BackRow, Card, LoadingView, ErrorView, EmptyRow } from '../components/ui';
import { colors, spacing } from '../theme/colors';
import { formatMoney, formatDate } from '../lib/format';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Rt = RouteProp<RootStackParamList, 'AnimalDetail'>;

export default function AnimalDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const { cowId } = route.params;

  const { data, loading, error, refresh } = useApiDataMulti({
    stock: '/stock',
    weight: '/weight',
    sales: '/sales',
    health: '/health'
  });

  if (loading) return <LoadingView label="Loading animal…" />;
  if (error) return <ErrorView message={error} onRetry={refresh} />;

  const stock = (data?.stock as StockItem[]) || [];
  const weight = (data?.weight as WeightRecord[]) || [];
  const sales = (data?.sales as SalesRecord[]) || [];
  const health = (data?.health as HealthLogItem[]) || [];

  const cow = stock.find(s => s.id === cowId);
  if (!cow) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, padding: spacing.xl }}>
        <BackRow label="Herd" onPress={() => navigation.goBack()} />
        <EmptyRow label={`Cow ${cowId} was not found.`} />
      </View>
    );
  }

  const history = weight.filter(w => w.cowId === cowId);
  const sale = sales.find(s => s.cowId === cowId);
  const logs = health.filter(h => h.cowId === cowId);
  const medicalCost = logs.reduce((sum, l) => sum + (l.cost || 0), 0);
  const totalInvestment = (cow.totalPrice || 0) + medicalCost;
  const isSold = cow.status?.toLowerCase() === 'sold';
  const pnl = isSold && sale ? sale.totalPrice - totalInvestment : null;

  return (
    <ScreenScroll>
      <BackRow label="Herd" onPress={() => navigation.goBack()} />

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 13, marginBottom: spacing.lg }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 24, fontWeight: '700', letterSpacing: -0.5 }}>{cow.id}</Text>
          <Text style={{ fontSize: 11.5, color: colors.textSecondary, marginTop: 4 }}>{cow.breed} · {cow.sex} · {cow.location || 'No farm'}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
        <Card style={{ flex: 1 }}>
          <Text style={{ fontSize: 10, textTransform: 'uppercase', color: colors.textSecondary, marginBottom: 6, fontWeight: '700' }}>Current weight</Text>
          <Text style={{ fontSize: 20, fontWeight: '700' }}>{cow.weight ? `${cow.weight} kg` : '—'}</Text>
        </Card>
        <Card style={{ flex: 1 }}>
          <Text style={{ fontSize: 10, textTransform: 'uppercase', color: colors.textSecondary, marginBottom: 6, fontWeight: '700' }}>Health</Text>
          <Text style={{ fontSize: 20, fontWeight: '700' }}>{cow.healthStatus || '—'}</Text>
        </Card>
      </View>

      <Card style={{ marginBottom: spacing.md, padding: 0 }}>
        <Text style={{ padding: 14, paddingBottom: 4, fontSize: 12.5, fontWeight: '700' }}>Purchase & cost</Text>
        {[
          ['Purchase price', formatMoney(cow.totalPrice || 0)],
          ['Purchase date', formatDate(cow.purchaseDate)],
          ['Medical spend', formatMoney(medicalCost)],
          ['Total investment', formatMoney(totalInvestment)]
        ].map(([label, value]) => (
          <View key={label} style={{ paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.borderFaint, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 12.5, color: colors.textFaint }}>{label}</Text>
            <Text style={{ fontSize: 12.5, fontWeight: '600' }}>{value}</Text>
          </View>
        ))}
      </Card>

      {isSold && sale ? (
        <Card style={{ backgroundColor: colors.tintGreen, borderColor: colors.tintGreenBorder, marginBottom: spacing.md }}>
          <Text style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.8, color: colors.greenDark, marginBottom: 8 }}>Realised P&L</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Text style={{ fontSize: 26, fontWeight: '700', color: (pnl || 0) >= 0 ? colors.green : colors.red }}>{formatMoney(pnl || 0)}</Text>
            <Text style={{ fontSize: 11.5, color: colors.greenDark, textAlign: 'right' }}>sold {formatDate(sale.salesDate)}</Text>
          </View>
        </Card>
      ) : null}

      <Card style={{ padding: 0 }}>
        <Text style={{ padding: 14, paddingBottom: 4, fontSize: 12.5, fontWeight: '700' }}>Weigh-in history</Text>
        {history.length === 0 ? <EmptyRow label="No weight records yet." /> : history.slice(-8).map((w, idx) => (
          <View key={idx} style={{ paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.borderFaint, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 12, color: colors.textFaint }}>{formatDate(w.trackingDate)}</Text>
            <Text style={{ fontSize: 12.5, fontWeight: '600' }}>{w.currentWeight} kg {w.gainLoss ? `(${w.gainLoss > 0 ? '+' : ''}${w.gainLoss})` : ''}</Text>
          </View>
        ))}
      </Card>
    </ScreenScroll>
  );
}
