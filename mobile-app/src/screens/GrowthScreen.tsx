import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import Svg, { Polyline, Circle, Line } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApiData } from '../hooks/useApiData';
import { WeightRecord } from '../api/types';
import { ScreenScroll, BackRow, ScreenTitle, Card, LoadingView, ErrorView, EmptyRow } from '../components/ui';
import { colors, spacing } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const CHART_W = 320;
const CHART_H = 110;

export default function GrowthScreen() {
  const navigation = useNavigation<Nav>();
  const { data, loading, error, refresh } = useApiData<WeightRecord[]>('/weight');

  const points = useMemo(() => {
    const records = data || [];
    const byDate: Record<string, number[]> = {};
    records
      .filter(w => w.trackingDate)
      .forEach(w => {
        const day = new Date(w.trackingDate as string).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        if (!byDate[day]) byDate[day] = [];
        byDate[day].push(w.gainLoss || 0);
      });
    return Object.entries(byDate)
      .slice(-10)
      .map(([label, gains]) => ({ label, avg: gains.reduce((s, g) => s + g, 0) / gains.length }));
  }, [data]);

  if (loading) return <LoadingView label="Loading growth trends…" />;
  if (error) return <ErrorView message={error} onRetry={refresh} />;

  const values = points.map(p => p.avg);
  const max = values.length ? Math.max(...values, 0.1) : 1;
  const min = values.length ? Math.min(...values, 0) : 0;
  const range = max - min || 1;

  const coords = points.map((p, i) => {
    const x = points.length > 1 ? (i / (points.length - 1)) * CHART_W : CHART_W / 2;
    const y = CHART_H - ((p.avg - min) / range) * (CHART_H - 20) - 10;
    return { x, y, ...p };
  });
  const polylinePoints = coords.map(c => `${c.x},${c.y}`).join(' ');
  const overallAvg = values.length ? values.reduce((s, v) => s + v, 0) / values.length : 0;

  return (
    <ScreenScroll>
      <BackRow label="More" onPress={() => navigation.goBack()} />
      <ScreenTitle title="Growth trends" subtitle="Average daily weight gain, last 10 recorded days" />

      <Card style={{ marginBottom: spacing.md }}>
        <Text style={{ fontSize: 10.5, textTransform: 'uppercase', color: colors.textSecondary, fontWeight: '700', marginBottom: 4 }}>Average daily gain</Text>
        <Text style={{ fontSize: 24, fontWeight: '700', color: overallAvg >= 0 ? colors.green : colors.red }}>{overallAvg.toFixed(2)} kg/day</Text>
      </Card>

      {points.length === 0 ? (
        <EmptyRow label="No weight records yet." />
      ) : (
        <Card>
          <Svg width="100%" height={CHART_H} viewBox={`0 0 ${CHART_W} ${CHART_H}`}>
            <Line x1={0} y1={CHART_H - 10} x2={CHART_W} y2={CHART_H - 10} stroke={colors.border} strokeWidth={1} />
            <Polyline points={polylinePoints} fill="none" stroke={colors.green} strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round" />
            {coords.map((c, i) => (
              <Circle key={i} cx={c.x} cy={c.y} r={3.2} fill={colors.white} stroke={colors.green} strokeWidth={2} />
            ))}
          </Svg>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
            {points.map((p, i) => (
              <Text key={i} style={{ fontSize: 8.5, color: colors.muted }}>{i === 0 || i === points.length - 1 ? p.label : ''}</Text>
            ))}
          </View>
        </Card>
      )}
    </ScreenScroll>
  );
}
