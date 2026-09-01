import React from 'react';
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApiDataMulti } from '../hooks/useApiData';
import { StockItem, HealthLogItem } from '../api/types';
import { ScreenScroll, BackRow, ScreenTitle, SectionHeader, Card, LoadingView, ErrorView, EmptyRow } from '../components/ui';
import { colors, spacing } from '../theme/colors';
import { formatMoney, formatDate } from '../lib/format';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function HealthScreen() {
  const navigation = useNavigation<Nav>();
  const { data, loading, error, refresh } = useApiDataMulti({ stock: '/stock', health: '/health' });

  if (loading) return <LoadingView label="Loading health report…" />;
  if (error) return <ErrorView message={error} onRetry={refresh} />;

  const stock = (data?.stock as StockItem[]) || [];
  const health = (data?.health as HealthLogItem[]) || [];

  const active = stock.filter(s => s.status?.toLowerCase() === 'active');
  const sick = active.filter(s => ['sick', 'critical'].includes((s.healthStatus || '').toLowerCase()));
  const atRisk = active.filter(s => (s.healthStatus || '').toLowerCase() === 'fair');
  const dead = stock.filter(s => (s.healthStatus || '').toLowerCase() === 'dead' || s.status?.toLowerCase() === 'dead');
  const medicalSpend = health.reduce((s, h) => s + (h.cost || 0), 0);
  const mortalityRate = stock.length > 0 ? (dead.length / stock.length) * 100 : 0;

  const recentLogs = [...health].sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()).slice(0, 10);

  return (
    <ScreenScroll>
      <BackRow label="More" onPress={() => navigation.goBack()} />
      <ScreenTitle title="Health & veterinary" subtitle="All farms" />

      <Card style={{ backgroundColor: colors.tintRed, borderColor: colors.tintRedBorder, marginBottom: spacing.md, flexDirection: 'row', gap: 14 }}>
        <View style={{ alignItems: 'center', paddingRight: 14, borderRightWidth: 1, borderRightColor: colors.tintRedBorder }}>
          <Text style={{ fontSize: 26, fontWeight: '700', color: colors.red }}>{sick.length}</Text>
          <Text style={{ fontSize: 9.5, textTransform: 'uppercase', color: colors.redDark, marginTop: 4 }}>Sick</Text>
        </View>
        <View style={{ alignItems: 'center', paddingRight: 14, borderRightWidth: 1, borderRightColor: colors.tintRedBorder }}>
          <Text style={{ fontSize: 26, fontWeight: '700', color: colors.amber }}>{atRisk.length}</Text>
          <Text style={{ fontSize: 9.5, textTransform: 'uppercase', color: colors.redDark, marginTop: 4 }}>At risk</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={{ fontSize: 11.5, color: colors.redDark, lineHeight: 16 }}>
            {sick.length + atRisk.length > 0 ? `${sick.length + atRisk.length} animals need attention across the active herd.` : 'Herd is healthy — no active alerts.'}
          </Text>
        </View>
      </Card>

      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg }}>
        <Card style={{ flex: 1 }}>
          <Text style={{ fontSize: 10, textTransform: 'uppercase', color: colors.textSecondary, fontWeight: '700', marginBottom: 7 }}>Medical spend</Text>
          <Text style={{ fontSize: 20, fontWeight: '700' }}>{formatMoney(medicalSpend)}</Text>
        </Card>
        <Card style={{ flex: 1 }}>
          <Text style={{ fontSize: 10, textTransform: 'uppercase', color: colors.textSecondary, fontWeight: '700', marginBottom: 7 }}>Mortality rate</Text>
          <Text style={{ fontSize: 20, fontWeight: '700', color: mortalityRate > 0 ? colors.red : colors.textPrimary }}>{mortalityRate.toFixed(1)}%</Text>
        </Card>
      </View>

      <SectionHeader title="Treatment & vaccination log" accent={colors.red} />
      <Card style={{ padding: 0 }}>
        {recentLogs.length === 0 ? <EmptyRow label="No medical records yet." /> : recentLogs.map((h, idx) => (
          <View key={h.id} style={{ padding: 12, borderBottomWidth: idx === recentLogs.length - 1 ? 0 : 1, borderBottomColor: colors.borderFaint }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ backgroundColor: colors.tintGrey, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                <Text style={{ fontSize: 9, fontWeight: '700', textTransform: 'uppercase' }}>{h.type}</Text>
              </View>
              <Text style={{ fontSize: 12, fontWeight: '600', flex: 1 }}>{h.cowId}</Text>
              <Text style={{ fontSize: 11, fontWeight: '600' }}>{formatMoney(h.cost || 0)}</Text>
            </View>
            <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 5 }}>{h.name} · {formatDate(h.date)} · {h.administeredBy}</Text>
          </View>
        ))}
      </Card>
    </ScreenScroll>
  );
}
