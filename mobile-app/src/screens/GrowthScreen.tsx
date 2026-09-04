import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import Svg, { Polyline, Circle, Line } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApiDataMulti } from '../hooks/useApiData';
import { WeightRecord, StockItem, MasterSetup } from '../api/types';
import { ScreenScroll, BackRow, ScreenTitle, Card, LoadingView, ErrorView, EmptyRow } from '../components/ui';
import FarmPicker from '../components/FarmPicker';
import { useFarmFilter } from '../context/FarmFilterContext';
import { applyFarmScope } from '../lib/farmScope';
import { colors, spacing } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const CHART_W = 320;
const CHART_H = 110;

// A farm whose weight-tracking data hasn't been updated in this many days
// is flagged as stale — surfaced so management knows to chase up weighing,
// not just left as a silently flat/empty chart.
const STALE_DAYS = 30;

export default function GrowthScreen() {
  const navigation = useNavigation<Nav>();
  const { effectiveFarm } = useFarmFilter();
  // Weight records carry a cowId but no farm/location of their own, so
  // stock is fetched alongside it purely to resolve each record's farm via
  // its cow — same cross-reference DashboardContainer.tsx uses on the web.
  // Settings (farm list) is fetched too, only used for the staleness check
  // when viewing "all farms" (see `staleness` below).
  const { data, loading, error, refresh } = useApiDataMulti({ weight: '/weight', stock: '/stock', settings: '/settings' });

  // Per-farm data-staleness check. When scoped to one farm (locked account,
  // or an admin's pick), checks just that farm; when viewing "all farms",
  // checks every configured farm individually so a quiet farm doesn't get
  // masked by other farms' recent activity.
  const staleness = useMemo(() => {
    const rawStock = (data?.stock as StockItem[]) || [];
    const rawWeight = (data?.weight as WeightRecord[]) || [];
    const settings = data?.settings as MasterSetup | undefined;
    const allFarms = settings?.farms || [];

    const cutoff = new Date();
    cutoff.setHours(0, 0, 0, 0);
    cutoff.setDate(cutoff.getDate() - STALE_DAYS);

    // Explicit return type — without it, TS's control-flow inference for
    // this function's return type gets confused by `latest` being
    // reassigned inside the forEach closure and infers something other
    // than the declared `Date | null`, which then makes every downstream
    // use of `.latest` fail to type-check.
    const latestDateFor = (farmName: string | null): Date | null => {
      const cowIds = new Set(
        rawStock.filter(s => (farmName ? s.location === farmName : true)).map(s => s.id)
      );
      let latest: Date | null = null;
      rawWeight.forEach(w => {
        if (!w.trackingDate || !cowIds.has(w.cowId)) return;
        const d = new Date(w.trackingDate);
        if (isNaN(d.getTime())) return;
        if (!latest || d > latest) latest = d;
      });
      return latest;
    };

    // "Days ago" is computed here, once, from `cutoff`'s own Date.now()-free
    // reference point — not with Date.now() at render time in the JSX below,
    // which React's purity rules flag as an impure call during render.
    const farmNames = effectiveFarm ? [effectiveFarm] : allFarms.map(f => f.name).filter(Boolean);
    return farmNames
      .map(name => {
        const latest = latestDateFor(name);
        const daysAgo = latest ? Math.floor((cutoff.getTime() + STALE_DAYS * 86400000 - latest.getTime()) / 86400000) : null;
        return { name, latest, daysAgo };
      })
      .filter(f => !f.latest || f.latest < cutoff);
  }, [data, effectiveFarm]);

  const points = useMemo(() => {
    const { weightTracking } = applyFarmScope(
      { stock: (data?.stock as StockItem[]) || [], weightTracking: (data?.weight as WeightRecord[]) || [] },
      effectiveFarm
    );
    const byDate: Record<string, number[]> = {};
    weightTracking
      .filter(w => w.trackingDate)
      .forEach(w => {
        const day = new Date(w.trackingDate as string).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        if (!byDate[day]) byDate[day] = [];
        byDate[day].push(w.gainLoss || 0);
      });
    return Object.entries(byDate)
      .slice(-10)
      .map(([label, gains]) => ({ label, avg: gains.reduce((s, g) => s + g, 0) / gains.length }));
  }, [data, effectiveFarm]);

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
      <ScreenTitle title="Growth trends" subtitle={`${effectiveFarm || 'All farms'} · average daily weight gain, last 10 recorded days`} />

      <FarmPicker />

      {staleness.length > 0 && (
        <Card style={{ marginBottom: spacing.md, borderColor: colors.tintRedBorder, backgroundColor: colors.tintRed }}>
          <Text style={{ fontSize: 12.5, fontWeight: '700', color: colors.redDark, marginBottom: 6 }}>
            {staleness.length === 1
              ? `No recent weight updates${effectiveFarm ? '' : ` — ${staleness[0].name}`}`
              : `${staleness.length} farms without recent weight updates`}
          </Text>
          {staleness.map(f => {
            const daysAgo = f.daysAgo;
            return (
              <Text key={f.name} style={{ fontSize: 11.5, color: colors.red, marginTop: 2 }}>
                {effectiveFarm ? '' : `${f.name}: `}
                {daysAgo === null ? 'no weight records yet' : `last updated ${daysAgo} day${daysAgo === 1 ? '' : 's'} ago (over ${STALE_DAYS}d)`}
              </Text>
            );
          })}
        </Card>
      )}

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
