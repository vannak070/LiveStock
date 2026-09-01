import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApiData } from '../hooks/useApiData';
import { StockItem } from '../api/types';
import { LoadingView, ErrorView, ScreenTitle, KpiTile, Card, EmptyRow, Pill } from '../components/ui';
import { colors, spacing, radius } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function healthTone(status: string): 'green' | 'amber' | 'red' {
  const s = (status || '').toLowerCase();
  if (s === 'good' || s === 'healthy') return 'green';
  if (s === 'fair') return 'amber';
  return 'red';
}

export default function HerdScreen() {
  const navigation = useNavigation<Nav>();
  const { data, loading, error, refresh } = useApiData<StockItem[]>('/stock');
  const [query, setQuery] = useState('');

  const stock = data || [];
  const active = stock.filter(s => s.status?.toLowerCase() === 'active').length;
  const sold = stock.filter(s => s.status?.toLowerCase() === 'sold').length;
  const dead = stock.filter(s => s.status?.toLowerCase() === 'dead' || s.healthStatus?.toLowerCase() === 'dead').length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return stock;
    return stock.filter(s =>
      s.id.toLowerCase().includes(q) ||
      (s.breed || '').toLowerCase().includes(q) ||
      (s.location || '').toLowerCase().includes(q)
    );
  }, [stock, query]);

  if (loading) return <LoadingView label="Loading herd…" />;
  if (error) return <ErrorView message={error} onRetry={refresh} />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ padding: spacing.xl, paddingBottom: spacing.sm }}>
        <ScreenTitle title="Herd & inventory" subtitle="All farms" />
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
          <KpiTile label="Active" value={String(active)} />
          <KpiTile label="Sold" value={String(sold)} />
          <KpiTile label="Dead" value={String(dead)} tone="danger" />
        </View>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search ID, breed, farm"
          placeholderTextColor={colors.muted}
          style={{
            backgroundColor: colors.white,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.md,
            paddingHorizontal: 14,
            paddingVertical: 10,
            fontSize: 13
          }}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl * 2 }}
        ListEmptyComponent={<EmptyRow label="No cattle match your search." />}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('AnimalDetail', { cowId: item.id })}>
            <Card style={{ marginBottom: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 13.5, fontWeight: '700' }}>{item.id}</Text>
                  <Pill label={item.healthStatus || '—'} tone={healthTone(item.healthStatus)} />
                </View>
                <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 3 }}>{item.breed} · {item.sex} · {item.location || 'No farm'}</Text>
              </View>
              <Text style={{ fontSize: 13.5, fontWeight: '700' }}>{item.weight ? `${item.weight} kg` : '—'}</Text>
            </Card>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
